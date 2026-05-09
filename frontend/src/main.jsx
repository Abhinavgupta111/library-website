import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.jsx'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const root = ReactDOM.createRoot(document.getElementById('root'));

if (!PUBLISHABLE_KEY) {
  // Show a visible error instead of crashing silently (blank page)
  root.render(
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#0f172a', color: '#f8fafc',
      fontFamily: 'Inter, system-ui, sans-serif', gap: '1rem', padding: '2rem'
    }}>
      <div style={{ fontSize: '3rem' }}>⚙️</div>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Configuration Error</h1>
      <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', maxWidth: 420, margin: 0 }}>
        Missing <code style={{ background: '#1e293b', padding: '2px 6px', borderRadius: 4, color: '#60a5fa' }}>VITE_CLERK_PUBLISHABLE_KEY</code> environment variable.
        Please add it in your Vercel project settings and redeploy.
      </p>
    </div>
  );
} else {
  root.render(
    <React.StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    </React.StrictMode>
  );
}

