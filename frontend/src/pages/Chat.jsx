import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Chat.css';

const ENDPOINT = 'http://localhost:5000';
let socket;

const Chat = () => {
    const { userInfo } = useAuth();
    const [socketConnected, setSocketConnected] = useState(false);
    const [groups, setGroups] = useState([]);
    const [activeGroup, setActiveGroup] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        socket = io(ENDPOINT);
        socket.on('connect', () => setSocketConnected(true));

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
                const { data } = await axios.get(`${ENDPOINT}/api/chat/groups`, config);
                setGroups(data);
            } catch (error) {
                console.error('Error fetching groups', error);
            }
        };
        if (userInfo) fetchGroups();
    }, [userInfo]);

    useEffect(() => {
        if (!activeGroup) return;

        const fetchMessages = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
                const { data } = await axios.get(`${ENDPOINT}/api/chat/groups/${activeGroup._id}/messages`, config);
                setMessages(data);
                socket.emit('join_group', activeGroup._id);
            } catch (error) {
                console.error('Error fetching messages', error);
            }
        };

        fetchMessages();
    }, [activeGroup, userInfo]);

    useEffect(() => {
        socket.on('receive_message', (message) => {
            if (activeGroup && message.group_id === activeGroup._id) {
                setMessages((prev) => [...prev, message]);
            }
        });
    }, [activeGroup]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeGroup) return;

        const msgData = {
            sender_id: userInfo._id,
            group_id: activeGroup._id,
            message: newMessage,
        };

        socket.emit('send_message', msgData);
        setNewMessage('');
    };

    if (!userInfo) return <div className="p-4">Please login to use Campus Chat.</div>;

    return (
        <div className="chat-container glass-panel">
            <div className="chat-sidebar">
                <div className="sidebar-header">
                    <h3>Campus Groups</h3>
                </div>
                <div className="groups-list">
                    {groups.map((group) => (
                        <div
                            key={group._id}
                            className={`group-item ${activeGroup?._id === group._id ? 'active' : ''}`}
                            onClick={() => setActiveGroup(group)}
                        >
                            <div className="group-avatar">
                                {group.group_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="group-info">
                                <span className="group-name">{group.group_name}</span>
                                <span className="group-type bg-primary">{group.group_type}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="chat-main">
                {activeGroup ? (
                    <>
                        <div className="chat-header">
                            <h3>{activeGroup.group_name}</h3>
                            <p>{activeGroup.description}</p>
                        </div>

                        <div className="chat-messages">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`message-wrapper ${msg.sender_id._id === userInfo._id ? 'sent' : 'received'}`}
                                >
                                    <div className="message-bubble">
                                        {msg.sender_id._id !== userInfo._id && (
                                            <span className="sender-name">{msg.sender_id.name} ({msg.sender_id.role})</span>
                                        )}
                                        <p className="message-content">{msg.message}</p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="chat-input-area" onSubmit={sendMessage}>
                            <input
                                type="text"
                                placeholder="Type a message..."
                                className="form-control glass-input flex-grow"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button type="submit" className="btn btn-primary ml-2">Send</button>
                        </form>
                    </>
                ) : (
                    <div className="chat-placeholder">
                        <h3>Select a group to start chatting</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
