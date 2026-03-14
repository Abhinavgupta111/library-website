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
                setLoading(false);
            } catch (error) {
                console.error('Error fetching events', error);
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    return (
        <div className="events-container">
            <h2 className="events-header">Campus Events & Announcements</h2>
            <div className="events-list">
                {loading ? (
                    <p>Loading events...</p>
                ) : events.length > 0 ? (
                    events.map(event => (
                        <Card key={event._id} title={event.title} className="event-card">
                            <div className="event-meta">
                                <span className="event-meta-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                    {new Date(event.event_date).toLocaleDateString()}
                                </span>
                                <span className="event-meta-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                    {event.venue}
                                </span>
                            </div>
                            <p className="event-description">{event.description}</p>
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
