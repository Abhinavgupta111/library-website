import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import './Chat.css';

const ENDPOINT = 'http://localhost:5000';

/* Avatar colour pool — deterministic by index */
const AVATAR_GRADIENTS = [
    'linear-gradient(135deg,#388bfd,#bc8cff)',
    'linear-gradient(135deg,#3fb950,#1c7c37)',
    'linear-gradient(135deg,#f0883e,#e3412a)',
    'linear-gradient(135deg,#f778ba,#bc4c8c)',
    'linear-gradient(135deg,#58a6ff,#0ea5e9)',
    'linear-gradient(135deg,#a78bfa,#7c3aed)',
    'linear-gradient(135deg,#34d399,#059669)',
    'linear-gradient(135deg,#fbbf24,#d97706)',
    'linear-gradient(135deg,#f87171,#dc2626)',
];

const Chat = () => {
    const { userInfo } = useAuth();
    
    // States
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [messages, setMessages] = useState([]);
    
    const [loadingSidebar, setLoadingSidebar] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sidebarError, setSidebarError] = useState(null);
    
    const [inputValue, setInputValue] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    const authConfig = userInfo?.token
        ? { headers: { Authorization: `Bearer ${userInfo.token}` } }
        : {};

    // ─────────────────────────────────────────────
    // Socket Initialization & Listeners
    // ─────────────────────────────────────────────
    useEffect(() => {
        if (!userInfo) return;
        
        socketRef.current = io(ENDPOINT);
        socketRef.current.emit('setup', userInfo);

        socketRef.current.on('receive_message', (newMsg) => {
            setMessages((prev) => {
                 // Append only if the message belongs to the currently active group view
                 if (selectedGroup && newMsg.group_id === selectedGroup._id) {
                     return [...prev, newMsg];
                 }
                 return prev;
            });
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [userInfo, selectedGroup]);

    // ─────────────────────────────────────────────
    // Initial Fetch (Groups)
    // ─────────────────────────────────────────────
    useEffect(() => {
        if (!userInfo) return;
        const fetchGroups = async () => {
            try {
                const { data } = await axios.get(`${ENDPOINT}/api/chat/groups`, authConfig);
                setGroups(data);
                setSidebarError(null);
            } catch (error) {
                console.error('Failed to fetch groups', error);
                setSidebarError(error.response?.data?.message || 'Network Error');
            } finally {
                setLoadingSidebar(false);
            }
        };
        fetchGroups();
    }, [userInfo]);

    // ─────────────────────────────────────────────
    // Fetch Messages when Group Selected
    // ─────────────────────────────────────────────
    useEffect(() => {
        if (!selectedGroup || !userInfo) return;
        
        const fetchMessages = async () => {
            setLoadingMessages(true);
            try {
                const { data } = await axios.get(`${ENDPOINT}/api/chat/groups/${selectedGroup._id}/messages`, authConfig);
                setMessages(data);
                if (socketRef.current) {
                    socketRef.current.emit('join_chat', selectedGroup._id); // join room
                }
            } catch (error) {
                console.error('Failed to fetch messages', error);
            } finally {
                setLoadingMessages(false);
            }
        };
        fetchMessages();
    }, [selectedGroup, userInfo]);

    // Auto-scroll on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, selectedGroup]);

    // ─────────────────────────────────────────────
    // Handlers
    // ─────────────────────────────────────────────
    const handleSend = (e) => {
        e.preventDefault();
        if (!inputValue.trim() || !selectedGroup || !userInfo) return;

        const msgData = {
            sender_id: userInfo._id,
            group_id: selectedGroup._id,
            message: inputValue
        };

        // Emit through socket
        socketRef.current.emit('send_message', msgData);
        setInputValue('');
    };

    const handleJoinGroup = async (group) => {
        // Even if they haven't explicitly joined, we act as if they are joining the view.
        // We could call the API to join the group to add them to members.
        try {
            await axios.post(`${ENDPOINT}/api/chat/groups/${group._id}/join`, {}, authConfig);
            setSelectedGroup(group);
        } catch (error) {
            // Already a member or error, just set it active
            setSelectedGroup(group);
        }
    };

    // Filter
    const filteredGroups = groups.filter(g =>
        g.group_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="ct-container">

            {/* ══════════════════
                LEFT SIDEBAR
                ══════════════════ */}
            <aside className={`ct-sidebar ${selectedGroup ? 'mobile-hidden' : ''}`}>
                <div className="ct-sidebar-header">
                    <div className="ct-sidebar-title-row">
                        <span className="ct-sidebar-icon">💬</span>
                        <h2 className="ct-sidebar-title">Campus Talk</h2>
                    </div>
                    <div className="ct-search-wrap">
                        <svg className="ct-search-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            className="ct-search-input"
                            type="text"
                            placeholder="Search groups…"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="ct-section-label">
                    <span>💻 MAIT — IT SECTIONS</span>
                    <span className="ct-section-count">{loadingSidebar ? '…' : filteredGroups.length}</span>
                </div>

                <div className="ct-group-list">
                    {loadingSidebar ? (
                        /* SKELETON SIDEBAR */
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="ct-skeleton-item">
                                <div className="ct-sk-avatar" />
                                <div className="ct-sk-text">
                                    <div className="ct-sk-line long" />
                                    <div className="ct-sk-line short" />
                                </div>
                            </div>
                        ))
                    ) : sidebarError ? (
                        <div className="ct-empty-list" style={{ color: '#ef4444' }}>
                            Error: {sidebarError}. Please log out and back in.
                        </div>
                    ) : filteredGroups.length === 0 ? (
                        <div className="ct-empty-list">No groups available.</div>
                    ) : (
                        filteredGroups.map((group, idx) => {
                            const isActive = selectedGroup?._id === group._id;
                            const isMember = group.members?.some(m => m.user === userInfo?._id);
                            return (
                                <button
                                    key={group._id}
                                    className={`ct-group-item${isActive ? ' active' : ''}`}
                                    onClick={() => handleJoinGroup(group)}
                                    aria-label={`Open chat for group ${group.group_name}`}
                                >
                                    <div
                                        className="ct-avatar"
                                        style={{ background: AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length] }}
                                    >
                                        {group.group_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="ct-group-info">
                                        <div className="ct-group-top">
                                            <span className="ct-group-name">{group.group_name}</span>
                                        </div>
                                        <span className="ct-group-preview">{group.description || (isMember ? 'Tap to open chat' : 'Tap to join')}</span>
                                    </div>
                                    {isActive && <span className="ct-active-dot" aria-hidden="true" />}
                                </button>
                            );
                        })
                    )}
                </div>
            </aside>

            {/* ══════════════════
                RIGHT CHAT AREA
                ══════════════════ */}
            <main className={`ct-main ${!selectedGroup ? 'mobile-hidden' : ''}`}>
                {selectedGroup === null ? (
                    <div className="ct-empty-state">
                        <div className="ct-empty-icon">💬</div>
                        <h3 className="ct-empty-title">Campus Connect</h3>
                        <p className="ct-empty-sub">Select a chat or find someone to start messaging.</p>
                        <div className="ct-empty-chips">
                            <span className="ct-chip">🔒 End-to-end encrypted</span>
                            <span className="ct-chip">⚡ Real-time messaging</span>
                            <span className="ct-chip">📎 File sharing</span>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <header className="ct-chat-header">
                            <div className="ct-chat-header-left">
                                <button
                                    className="ct-back-btn mobile-only"
                                    onClick={() => setSelectedGroup(null)}
                                    aria-label="Back to chat list"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                                        <polyline points="15 18 9 12 15 6"></polyline>
                                    </svg>
                                </button>
                                <div
                                    className="ct-avatar ct-avatar-md"
                                    style={{ background: AVATAR_GRADIENTS[groups.findIndex(g => g._id === selectedGroup._id) % AVATAR_GRADIENTS.length] || AVATAR_GRADIENTS[0] }}
                                >
                                    {selectedGroup.group_name.charAt(0).toUpperCase()}
                                </div>
                                <div className="ct-chat-header-text">
                                    <span className="ct-chat-header-name">{selectedGroup.group_name}</span>
                                    <span className="ct-chat-header-sub">{selectedGroup.description || 'MAIT Campus Group'}</span>
                                </div>
                            </div>
                        </header>

                        {/* Messages */}
                        <div className="ct-messages">
                            <div className="ct-day-separator"><span>Today</span></div>

                            {loadingMessages ? (
                                /* SKELETON MESSAGES */
                                [false, true, false, false, true].map((sent, i) => (
                                    <div key={i} className={`ct-skeleton-bubble ${sent ? 'sent' : ''}`}>
                                        <div className={`ct-sk-bubble ${sent ? 'sent' : ''}`} />
                                    </div>
                                ))
                            ) : (
                                messages.map((msg) => {
                                    const isSent = msg.sender_id?._id === userInfo?._id;
                                    const timeStr = new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                                    
                                    return (
                                        <div
                                            key={msg._id}
                                            className={`ct-message-row${isSent ? ' sent' : ' received'}`}
                                        >
                                            {!isSent && (
                                                <div
                                                    className="ct-msg-avatar"
                                                    style={{ background: AVATAR_GRADIENTS[0] }}
                                                >
                                                    {msg.sender_id?.name ? msg.sender_id.name.charAt(0).toUpperCase() : '?'}
                                                </div>
                                            )}

                                            <div className="ct-bubble-col">
                                                {!isSent && (
                                                    <span className="ct-sender-name">{msg.sender_id?.name || 'Unknown User'}</span>
                                                )}
                                                <div className={`ct-bubble${isSent ? ' ct-bubble-sent' : ' ct-bubble-recv'}`}>
                                                    <p className="ct-bubble-text">{msg.message}</p>
                                                    <span className="ct-bubble-time">
                                                        {timeStr}
                                                        {isSent && (
                                                            <svg className="ct-tick" viewBox="0 0 16 11" fill="currentColor" width="14" height="10">
                                                                <path d="M11.071.653a.75.75 0 0 1 .025 1.06l-5.5 5.75a.75.75 0 0 1-1.085 0l-2.5-2.61a.75.75 0 1 1 1.085-1.034l1.957 2.045 4.958-5.186a.75.75 0 0 1 1.06-.025z" />
                                                                <path d="M14.071.653a.75.75 0 0 1 .025 1.06l-5.5 5.75a.75.75 0 0 1-.073.065l.073-.065 1.475-1.543L14.01.678a.75.75 0 0 1 1.06-.025z" />
                                                            </svg>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Footer */}
                        <footer className="ct-footer">
                            <form className="ct-input-form" onSubmit={handleSend} style={{width: '100%'}}>
                                <input
                                    className="ct-input"
                                    type="text"
                                    placeholder="Type a message…"
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    autoComplete="off"
                                />
                                <button
                                    className="ct-send-btn"
                                    type="submit"
                                    disabled={!inputValue.trim()}
                                    title="Send"
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                    </svg>
                                </button>
                            </form>
                        </footer>
                    </>
                )}
            </main>
        </div>
    );
};

export default Chat;
