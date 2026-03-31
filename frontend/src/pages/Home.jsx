import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">

      {/* Messages Section */}
      <div className="messages-section">
        <div className="message-card">
          <div className="message-header">
            <div className="message-avatar">
              <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="HOD" />
            </div>
            <div className="message-title">
              <h4>HOD'S MESSAGE</h4>
              <h3>Fostering Academic Excellence</h3>
            </div>
          </div>
          <div className="message-body">
            <p>"The library is the heart of our intellectual ecosystem. We are committed to providing resources that challenge and inspire our students."</p>
            <span className="message-author">— Dr Amita Goel, HOD</span>
          </div>
        </div>

        <div className="message-card">
          <div className="message-header">
            <div className="message-avatar">
              <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Librarian" />
            </div>
            <div className="message-title">
              <h4>LIBRARY HEAD'S MESSAGE</h4>
              <h3>Modern Archival Standards</h3>
            </div>
          </div>
          <div className="message-body">
            <p>"Digitization and accessibility are our priorities. We aim to bridge the gap between traditional archives and modern search technology."</p>
            <span className="message-author">— Prof- Ajay kaushik, Head of Library</span>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2>WHY VISIT THE LIBRARY</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
              </svg>
            </div>
            <h3>Physical Archives</h3>
            <p>Access over 50,000 physical volumes, including rare manuscripts and specialized journals.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
            </div>
            <h3>Deep Focus Environment</h3>
            <p>Dedicated quiet zones and private carrels designed for intensive research and study.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
            <h3>Expert Guidance</h3>
            <p>On-site research assistants available to help with citation mapping and complex searches.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3>Scholarly Community</h3>
            <p>A hub for collaborative projects and intellectual discourse with peers and faculty.</p>
          </div>
        </div>
      </div>

      {/* Content Split Layout */}
      <div className="content-split">
        <div className="events-column">
          <div className="section-header">
            <h3>Ongoing Events</h3>
            <Link to="/events" className="view-all">VIEW ALL</Link>
          </div>
          <div className="events-list">
            <div className="event-card">
              <div className="event-date">
                <span className="month">OCT</span>
                <span className="day">12</span>
              </div>
              <div className="event-details">
                <div className="event-badge live">LIVE</div>
                <h4>Advanced LaTeX Workshop</h4>
                <p>Room 402 • 2:00 PM</p>
              </div>
            </div>
            <div className="event-card">
              <div className="event-date">
                <span className="month">OCT</span>
                <span className="day">15</span>
              </div>
              <div className="event-details">
                <div className="event-badge upcoming">UPCOMING</div>
                <h4>Book Club: Modern Physics</h4>
                <p>Central Lounge • 4:30 PM</p>
              </div>
            </div>
            <div className="event-card">
              <div className="event-date">
                <span className="month">OCT</span>
                <span className="day">19</span>
              </div>
              <div className="event-details">
                <div className="event-badge upcoming">UPCOMING</div>
                <h4>Digital Archiving Webinar</h4>
                <p>Virtual • 11:00 AM</p>
              </div>
            </div>
          </div>
        </div>

        <div className="collections-column">
          <div className="section-header">
            <h3>Departmental Collections</h3>
            <div className="flex items-center gap-4">
              <span className="updated-text">Updated Monthly</span>
              <Link to="/library" className="view-all">VIEW ALL</Link>
            </div>
          </div>
          <div className="collections-table-wrapper">
            <table className="collections-table">
              <thead>
                <tr>
                  <th>DEPARTMENT NAME</th>
                  <th>TOTAL VOLUMES</th>
                  <th>DIGITAL ACCESS</th>
                  <th>LAST UPDATED</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Computer Science & Eng.</strong></td>
                  <td>12,450</td>
                  <td>
                    <span className="check-icon">
                      <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </span> 100%
                  </td>
                  <td>Oct 2023</td>
                </tr>
                <tr>
                  <td><strong>Management Studies</strong></td>
                  <td>8,200</td>
                  <td>
                    <span className="check-icon">
                      <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </span> 85%
                  </td>
                  <td>Sept 2023</td>
                </tr>
                <tr>
                  <td><strong>Applied Sciences</strong></td>
                  <td>15,120</td>
                  <td>
                    <span className="check-icon">
                      <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </span> 92%
                  </td>
                  <td>Oct 2023</td>
                </tr>
                <tr>
                  <td><strong>Information Technology</strong></td>
                  <td>10,500</td>
                  <td>
                    <span className="check-icon">
                      <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </span> 100%
                  </td>
                  <td>Aug 2023</td>
                </tr>
                <tr>
                  <td><strong>Civil Engineering</strong></td>
                  <td>6,800</td>
                  <td>
                    <span className="check-icon">
                      <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </span> 70%
                  </td>
                  <td>Oct 2023</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-columns">
          <div className="footer-col brand-col">
            <h3>MAIT Library</h3>
            <p>The primary archival facility for Maharaja Agrasen Institute of Technology. Dedicated to empowering researchers since 1999.</p>
            <div className="social-links">
              <button className="social-btn">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </button>
              <button className="social-btn">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </button>
            </div>
          </div>
          <div className="footer-col">
            <h4>RESOURCES</h4>
            <ul>
              <li><a href="#">Digital Library (E-Proxy)</a></li>
              <li><a href="#">NPTEL Video Lectures</a></li>
              <li><a href="#">Question Paper Bank</a></li>
              <li><a href="#">Thesis Repository</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>QUICK LINKS</h4>
            <ul>
              <li><a href="#">Membership Form</a></li>
              <li><a href="#">Library Rules</a></li>
              <li><a href="#">Feedback Portal</a></li>
              <li><a href="#">New Arrivals</a></li>
            </ul>
          </div>
          <div className="footer-col contact-col">
            <h4>CONTACT INFO</h4>
            <ul>
              <li>
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                Pkt No. 1, PSP Area, Sector 22, Rohini, Delhi, 110086
              </li>
              <li>
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                +91 11 6584 7741
              </li>
              <li>
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Mon-Sat: 08:00 AM - 08:00 PM
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2023 Maharaja Agrasen Institute of Technology. All Rights Reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Sitemap</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
