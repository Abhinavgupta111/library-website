import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../components/Card';
import './Events.css';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/events');
                setEvents(data);
            } catch (error) {
                console.error('Error fetching events', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const getUrgencyStyle = (event_date) => {
        const daysLeft = Math.ceil((new Date(event_date) - new Date()) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 3) return { borderLeft: '4px solid #ef4444' };
        if (daysLeft <= 7) return { borderLeft: '4px solid #f59e0b' };
        return { borderLeft: '4px solid #6366f1' };
    };

    return (
        <div className="events-container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2 className="events-header" style={{ margin: 0 }}>Campus Events &amp; Announcements</h2>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{events.length} event{events.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="events-list">
                {loading ? (
                    [...Array(3)].map((_, i) => (
                        <Card key={i} className="event-card" style={{ opacity: 0.7, borderLeft: '4px solid #334155' }}>
                            <div style={{ height: '24px', width: '60%', background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 2s infinite', borderRadius: '4px', marginBottom: '1rem' }}></div>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ height: '16px', width: '30%', background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 2s infinite', borderRadius: '4px' }}></div>
                                <div style={{ height: '16px', width: '30%', background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 2s infinite', borderRadius: '4px' }}></div>
                            </div>
                            <div style={{ height: '60px', width: '100%', background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 2s infinite', borderRadius: '4px' }}></div>
                        </Card>
                    ))
                ) : events.length > 0 ? (
                    events.map(event => (
                        <Card key={event._id} title={event.title} className="event-card" style={getUrgencyStyle(event.event_date)}>
                            <div className="event-meta">
                                <span className="event-meta-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                    {new Date(event.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                                <span className="event-meta-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                    {event.venue}
                                </span>
                            </div>
                            <p className="event-description" style={{ whiteSpace: 'pre-line' }}>{event.description}</p>
                            {event.created_by && (
                                <p className="event-poster">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                    Posted by: {event.created_by.name}
                                </p>
                            )}
                        </Card>
                    ))
                ) : (
                    <p>No upcoming events.</p>
                )}
            </div>
        </div>
    );
};

export default Events;
