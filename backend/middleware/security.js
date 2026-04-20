/**
 * security.js  —  Centralised security middleware stack
 *
 * Layers applied (in order):
 *  1. Helmet       – HTTP security headers (CSP, HSTS, X-Frame-Options, …)
 *  2. CORS         – Strict origin whitelist
 *  3. Rate limiter – Global + per-route throttling
 *  4. Mongo sanitise – Strip $-operators from req.body/query/params (NoSQL injection)
 *  5. HPP          – Remove duplicate query-string parameters
 *  6. XSS sanitise – Strip HTML tags from every string in req.body
 *  7. Input validator – Reject suspiciously large payloads & non-UTF-8 bytes
 */

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import sanitizeHtml from 'sanitize-html';
import cors from 'cors';

// ─── 1. Helmet — HTTP security headers ────────────────────────────────────────
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'", "'unsafe-inline'"],   // allow Vite HMR in dev
      styleSrc:    ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc:     ["'self'", "https://fonts.gstatic.com"],
      imgSrc:      ["'self'", "data:", "blob:"],
      connectSrc:  ["'self'", "ws:", "wss:", "http://localhost:5000"],
      frameSrc:    ["'none'"],
      objectSrc:   ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,   // needed for socket.io
  hsts: {
    maxAge:            31_536_000,    // 1 year in seconds
    includeSubDomains: true,
    preload:           true,
  },
  frameguard:     { action: 'deny' },          // X-Frame-Options: DENY
  noSniff:        true,                        // X-Content-Type-Options: nosniff
  xssFilter:      true,                        // X-XSS-Protection: 1; mode=block
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
});

// ─── 2. CORS — strict origin whitelist ────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL,
].filter(Boolean);

export const corsMiddleware = cors({
  origin(origin, cb) {
    // Allow server-to-server / Postman (no origin) only in dev
    if (!origin && process.env.NODE_ENV !== 'production') return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials:          true,
  methods:              ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders:       ['Content-Type', 'Authorization'],
  exposedHeaders:       ['X-Request-Id'],
  optionsSuccessStatus: 200,
});

// ─── 3a. Global rate limiter (all routes) ─────────────────────────────────────
export const globalRateLimiter = rateLimit({
  windowMs:         15 * 60 * 1000,  // 15 minutes
  max:              300,             // max requests per IP per window
  standardHeaders:  true,
  legacyHeaders:    false,
  message:          { message: 'Too many requests, please try again after 15 minutes.' },
  skip: (req) => req.path === '/api/health',
});

// ─── 3b. Auth route rate limiter (strict) ─────────────────────────────────────
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max:       20,             // 20 login/register attempts per window
  standardHeaders: true,
  legacyHeaders:   false,
  message: { message: 'Too many authentication attempts. Please wait 15 minutes.' },
});

// ─── 4. MongoDB sanitiser — prevent NoSQL injection ───────────────────────────
export const mongoSanitiser = mongoSanitize({
  replaceWith: '_',         // replace $ and . with _ instead of removing
  onSanitize: ({ key }) => {
    console.warn(`[Security] Suspicious key sanitised: ${key}`);
  },
});

// ─── 5. HTTP Parameter Pollution guard ────────────────────────────────────────
export const hppGuard = hpp({
  whitelist: ['sort', 'limit', 'page', 'keyword', 'status', 'category'],
});

// ─── 6. XSS sanitiser — strip HTML from all string fields in req.body ─────────
function sanitiseObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === 'string') {
      obj[key] = sanitizeHtml(val, { allowedTags: [], allowedAttributes: {} });
    } else if (typeof val === 'object') {
      sanitiseObject(val);
    }
  }
  return obj;
}

export const xssSanitiser = (req, _res, next) => {
  if (req.body)   sanitiseObject(req.body);
  if (req.query)  sanitiseObject(req.query);
  if (req.params) sanitiseObject(req.params);
  next();
};

// ─── 7. Request-ID middleware (tracing / audit) ────────────────────────────────
import crypto from 'crypto';
export const requestId = (req, res, next) => {
  const id = crypto.randomUUID();
  req.requestId = id;
  res.setHeader('X-Request-Id', id);
  next();
};

// ─── 8. Security event logger ─────────────────────────────────────────────────
export const securityLogger = (req, _res, next) => {
  const suspicious = [
    /<script/i, /javascript:/i, /on\w+\s*=/i,   // XSS
    /\$where/i, /\$lookup/i, /\$expr/i,          // MongoDB
    /union\s+select/i, /drop\s+table/i,          // SQL (paranoia)
    /\.\.\//,                                    // Path traversal
  ];

  const body = JSON.stringify(req.body || {});
  const url  = req.originalUrl;

  for (const pattern of suspicious) {
    if (pattern.test(url) || pattern.test(body)) {
      console.warn(
        `[Security] SUSPICIOUS REQUEST — IP: ${req.ip} | Method: ${req.method} | URL: ${url} | ID: ${req.requestId}`
      );
      break;
    }
  }
  next();
};
