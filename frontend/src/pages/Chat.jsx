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
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [showGroupMenu, setShowGroupMenu] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const emojis = ['😀', '😂', '🔥', '👍', '❤️', '🎉', '😎', '💡', '🤔', '🙌', '💯', '✨'];

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
        if ((!newMessage.trim() && !selectedFile) || !activeGroup) return;

        let fileUrl = '';
        if (selectedFile) {
            const formData = new FormData();
            formData.append('file', selectedFile);
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
                const { data } = await axios.post(`${ENDPOINT}/api/chat/upload`, formData, config);
                fileUrl = data.url;
            } catch (err) {
                console.error("Upload failed", err);
                return; // Stop if upload fails
            }
        }

        const msgData = {
            sender_id: userInfo._id,
            group_id: activeGroup._id,
            message: newMessage,
            fileUrl: fileUrl
        };

        socket.emit('send_message', msgData);
        setNewMessage('');
        setSelectedFile(null);
        setShowEmojiPicker(false);
    };

    const handleEmojiClick = (emoji) => {
        setNewMessage(prev => prev + emoji);
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleReportMessage = async () => {
        try {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg) {
                const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
                await axios.put(`${ENDPOINT}/api/chat/messages/${lastMsg._id}/report`, {}, config);
                alert("Message has been reported to the administration.");
            } else {
                alert("No messages to report.");
            }
        } catch (e) { console.error(e); }
        setShowGroupMenu(false);
    };

    const filteredMessages = messages.filter(msg => {
        if (!searchQuery) return true;
        return msg?.message?.toLowerCase()?.includes(searchQuery.toLowerCase());
    });

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
                                <div className="group-info-header">
                                    <span className="group-name">{group.group_name}</span>
                                    <span className="group-time">10:32 PM</span>
                                </div>
                                <div className="group-info-bottom">
                                    <span className="group-last-message">Tap to view messages...</span>
                                    {/* Mock Unread Badge for demo */}
                                    {group._id !== activeGroup?._id && <span className="unread-badge">2</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="chat-main">
                {activeGroup ? (
                    <>
                        <div className="chat-header">
                            <div className="chat-header-info">
                                <h3>{activeGroup.group_name}</h3>
                                <p className="online-status"><span className="status-dot"></span> Online - {activeGroup.description}</p>
                            </div>
                            <div className="chat-header-actions" style={{ position: 'relative' }}>
                                <button className="action-btn" title="Search in chat" onClick={() => setShowSearch(!showSearch)}>🔍</button>
                                <button className="action-btn" title="Group Info" onClick={() => setShowGroupMenu(!showGroupMenu)}>⋮</button>
                                
                                {showGroupMenu && (
                                    <div className="group-menu-dropdown" style={{
                                        position: 'absolute', top: '100%', right: 0, background: '#1f2937', 
                                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.5rem',
                                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)', zIndex: 100, minWidth: '150px'
                                    }}>
                                        <div 
                                            style={{ padding: '0.5rem 1rem', cursor: 'pointer', color: '#ef4444', fontSize: '0.9rem', borderRadius: '4px' }}
                                            onClick={handleReportMessage}
                                            onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.05)'}
                                            onMouseLeave={e => e.target.style.background = 'transparent'}
                                        >
                                            ⚠️ Report a message
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {showSearch && (
                            <div className="chat-search-bar" style={{ padding: '0.5rem 1.5rem', background: 'rgba(17, 24, 39, 0.8)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <input 
                                    type="text" 
                                    placeholder="Search in conversation..." 
                                    className="form-control glass-input flex-grow" 
                                    style={{ width: '100%', padding: '0.5rem 1rem', borderRadius: '20px' }}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        )}

                        <div className="chat-messages">
                            {filteredMessages.map((msg, idx) => {
                                const isSent = msg.sender_id._id === userInfo._id;
                                return (
                                    <div
                                        key={idx}
                                        className={`message-wrapper ${isSent ? 'sent' : 'received'}`}
                                    >
                                        <div className="message-bubble" title={new Date(msg.createdAt || Date.now()).toLocaleTimeString()}>
                                            {!isSent && (
                                                <span className="sender-name">{msg.sender_id.name}</span>
                                            )}
                                            <p className="message-content" style={{marginBottom: msg.fileUrl ? '0.25rem' : '0'}}>{msg.message}</p>
                                            {msg.fileUrl && (
                                                <div style={{ padding: '0.25rem 0' }}>
                                                    <a href={`${ENDPOINT}${msg.fileUrl}`} target="_blank" rel="noopener noreferrer" style={{color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.5rem', borderRadius: '4px'}}>
                                                        📎 View Attachment
                                                    </a>
                                                </div>
                                            )}
                                            <span className="message-meta">
                                                {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {isSent && <span className="message-seen"> ✔</span>}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {selectedFile && (
                            <div className="file-attachment-preview" style={{ padding: '0.5rem 1.5rem', background: '#1f2937', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                📎 <span style={{ flexGrow: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{selectedFile.name}</span>
                                <button onClick={() => setSelectedFile(null)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>✖</button>
                            </div>
                        )}

                        <div style={{ position: 'relative' }}>
                            {showEmojiPicker && (
                                <div style={{
                                    position: 'absolute', bottom: '100%', left: '1rem', background: '#1f2937',
                                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0.75rem',
                                    display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.25rem',
                                    boxShadow: '0 -5px 15px rgba(0,0,0,0.3)', zIndex: 100, marginBottom: '4px'
                                }}>
                                    {emojis.map((emoji, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => {
                                                setNewMessage(prev => prev + emoji);
                                            }}
                                            style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '0.3rem', borderRadius: '6px' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <form className="chat-input-area" onSubmit={sendMessage}>
                                <button type="button" className="input-action-btn" title="Emoji" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>😊</button>
                                <button type="button" className="input-action-btn" title="Attach file" onClick={() => fileInputRef.current.click()}>📎</button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                />
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    className="form-control glass-input flex-grow"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button type="submit" className="btn-send ml-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                      <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"/>
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="chat-placeholder">
                        <div className="placeholder-content">
                            <div className="placeholder-illustration">
                                <img src="https://illustrations.popsy.co/amber/communication.svg" alt="Start Conversation" style={{width: '250px', opacity: 0.9}} />
                            </div>
                            <h3>Campus Connect</h3>
                            <p>Select a group from the left to start a conversation, share files, and collaborate with your peers.</p>
                            <button className="btn-primary mt-4 pulse-btn" onClick={() => document.querySelector('.group-item')?.click()}>Start Conversation</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
