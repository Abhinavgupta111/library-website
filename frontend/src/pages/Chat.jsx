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
    
    // State for chats
    const [conversations, setConversations] = useState([]);
    const [legacyGroups, setLegacyGroups] = useState([]);
    const [pinnedChatIds, setPinnedChatIds] = useState([]);
    
    const [activeChat, setActiveChat] = useState(null); // Can be a Conversation or a Group
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchBox, setShowSearchBox] = useState(false); // For in-chat search
    
    const [showGroupMenu, setShowGroupMenu] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    
    // Real-time states
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [typingUsers, setTypingUsers] = useState({}); // chat_id -> boolean
    const [isTyping, setIsTyping] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [msgSearchQuery, setMsgSearchQuery] = useState('');
    const [showMsgSearch, setShowMsgSearch] = useState(false);
    
    // Collapsible sections state
    const [expandedSections, setExpandedSections] = useState({
        mait_courses: false,
        maims_courses: false,
        mait_societies: false,
        maims_societies: false,
        general: false
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };
    
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const emojis = ['😀', '😂', '🔥', '👍', '❤️', '🎉', '😎', '💡', '🤔', '🙌', '💯', '✨'];
    const reactionOptions = ['❤️', '👍', '😮', '😂', '🔥'];

    useEffect(() => {
        if (!userInfo) return;

        socket = io(ENDPOINT);
        
        socket.emit('setup', userInfo);
        socket.on('connected', () => setSocketConnected(true));

        socket.on('online_users_list', (usersList) => {
            setOnlineUsers(usersList);
        });

        socket.on('typing', (room) => {
            setTypingUsers(prev => ({ ...prev, [room]: true }));
        });

        socket.on('stop_typing', (room) => {
            setTypingUsers(prev => ({ ...prev, [room]: false }));
        });

        socket.on('update_message', (updatedMsg) => {
            setMessages(prev => prev.map(m => m._id === updatedMsg._id ? updatedMsg : m));
        });

        socket.on('message_notification', ({ message, conversation }) => {
            // Update conversation list with new last message and unread count
            setConversations(prev => {
                const existing = prev.find(c => c._id === conversation._id);
                if (existing) {
                    return prev.map(c => c._id === conversation._id ? conversation : c)
                               .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                } else {
                    return [conversation, ...prev];
                }
            });
        });

        return () => {
            socket.disconnect();
        };
    }, [userInfo]);

    const fetchChats = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
            const [convRes, groupRes] = await Promise.all([
                axios.get(`${ENDPOINT}/api/chat/conversations`, config),
                axios.get(`${ENDPOINT}/api/chat/groups`, config)
            ]);
            setConversations(convRes.data.conversations || []);
            setPinnedChatIds(convRes.data.pinnedChats || []);
            setLegacyGroups(groupRes.data || []);
        } catch (error) {
            console.error('Error fetching chats', error);
        }
    };

    useEffect(() => {
        if (userInfo) fetchChats();
    }, [userInfo]);

    useEffect(() => {
        if (!activeChat) return;

        const fetchMessages = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
                // Determine if it's a conversation or legacy group
                const isLegacyGroup = !activeChat.type;
                const endpoint = isLegacyGroup 
                    ? `/api/chat/groups/${activeChat._id}/messages`
                    : `/api/chat/conversations/${activeChat._id}/messages`;
                    
                const { data } = await axios.get(`${ENDPOINT}${endpoint}`, config);
                setMessages(data);
                
                socket.emit('join_chat', activeChat._id);
                
                // Mark as read if it's a conversation
                if (!isLegacyGroup) {
                    await axios.put(`${ENDPOINT}/api/chat/conversations/${activeChat._id}/read`, {}, config);
                    // Also auto-join to ensure user is in participants list
                    await axios.put(`${ENDPOINT}/api/chat/conversations/${activeChat._id}/join`, {}, config);
                    
                    // Update local state to remove unread badge immediately
                    setConversations(prev => prev.map(c => {
                        if(c._id === activeChat._id) {
                            const updatedUnread = new Map(Object.entries(c.unreadCounts || {}));
                            updatedUnread.set(userInfo._id, 0);
                            return { ...c, unreadCounts: Object.fromEntries(updatedUnread) };
                        }
                        return c;
                    }));
                }
            } catch (error) {
                console.error('Error fetching messages', error);
            }
        };

        fetchMessages();
        setReplyingTo(null);
        setShowMsgSearch(false);
        setMsgSearchQuery('');
    }, [activeChat, userInfo]);

    useEffect(() => {
        socket.on('receive_message', (message) => {
            if (activeChat && (message.conversation_id === activeChat._id || message.group_id === activeChat._id)) {
                setMessages((prev) => [...prev, message]);
                
                // If the message arrives while chat is open, mark it as read immediately
                const isLegacyGroup = !activeChat.type;
                if (!isLegacyGroup && message.sender_id._id !== userInfo._id) {
                    const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
                    axios.put(`${ENDPOINT}/api/chat/conversations/${activeChat._id}/read`, {}, config).catch(console.error);
                }
            }
        });
        
        return () => {
             socket.off('receive_message');
        };
    }, [activeChat, userInfo]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSearchUsers = async (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        if (!value) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
            const { data } = await axios.get(`${ENDPOINT}/api/auth/users/search?search=${value}`, config);
            setSearchResults(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    };

    const startDirectChat = async (userId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
            const { data } = await axios.post(`${ENDPOINT}/api/chat/conversations/direct/${userId}`, {}, config);
            
            setSearchQuery('');
            setSearchResults([]);
            
            // Add to conversations list if not there
            setConversations(prev => {
                if (!prev.find(c => c._id === data._id)) return [data, ...prev];
                return prev;
            });
            setActiveChat(data);
        } catch (error) {
            console.error(error);
        }
    };
    
    const handlePinChat = async (e, chatId) => {
        e.stopPropagation();
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
            const { data } = await axios.post(`${ENDPOINT}/api/chat/conversations/${chatId}/pin`, {}, config);
            setPinnedChatIds(data.pinnedChats);
        } catch (error) {
            console.error(error);
        }
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        
        if (!socketConnected || !activeChat) return;

        if (!isTyping) {
            setIsTyping(true);
            socket.emit('typing', activeChat._id);
        }

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stop_typing', activeChat._id);
            setIsTyping(false);
        }, 3000);
    };

    const handleReaction = (messageId, emoji) => {
        socket.emit('message_reaction', { messageId, emoji, userId: userInfo._id, chatId: activeChat._id });
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedFile) || !activeChat) return;
        
        socket.emit('stop_typing', activeChat._id);
        setIsTyping(false);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

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
                return;
            }
        }

        const isLegacyGroup = !activeChat.type;

        const msgData = {
            sender_id: userInfo._id,
            conversation_id: isLegacyGroup ? null : activeChat._id,
            group_id: isLegacyGroup ? activeChat._id : null,
            message: newMessage,
            fileUrl: fileUrl,
            replyTo: replyingTo?._id
        };

        socket.emit('send_message', msgData);
        
        // Optimistically update conversation local state
        if (!isLegacyGroup) {
            setConversations(prev => prev.map(c => {
                if (c._id === activeChat._id) {
                    return { ...c, lastMessage: { message: newMessage, sender_id: userInfo._id }, updatedAt: new Date().toISOString() };
                }
                return c;
            }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
        }

        setNewMessage('');
        setSelectedFile(null);
        setShowEmojiPicker(false);
        setReplyingTo(null);
    };

    function getChatDisplayInfo(chat) {
        if (!chat) return { id: 'temp', name: 'Unknown', avatar: '?', preview: '', isGroup: false, unread: 0, isPinned: false };
        if (!chat.type) {
            // It's a legacy group
            return {
                id: chat._id,
                name: chat.group_name || 'Group',
                avatar: (chat.group_name || 'G').charAt(0).toUpperCase(),
                preview: 'Group messages',
                isGroup: true,
                unread: 0,
                isPinned: false
            };
        }

        // It's a Conversation
        let name, avatar, isOnline = false;
        
        if (chat.type === 'direct' && (chat.participants || []).length > 0) {
            const otherUser = chat.participants.find(p => p?._id !== userInfo?._id);
            name = otherUser?.name || 'Unknown User';
            avatar = (name || 'U').charAt(0).toUpperCase();
            isOnline = otherUser && (onlineUsers || []).includes(otherUser._id);
        } else {
            name = chat.group_id?.group_name || 'Group';
            avatar = (name || 'G').charAt(0).toUpperCase();
        }

        let preview = 'No messages yet';
        if (chat.lastMessage) {
            const senderName = chat.lastMessage.sender_id?._id === userInfo?._id ? 'You' : 
                                (chat.lastMessage.sender_id?.name || '').split(' ')[0];
            let msgText = chat.lastMessage.message || (chat.lastMessage.fileUrl ? 'Sent an attachment 📎' : '');
            preview = senderName ? `${senderName}: ${msgText}` : msgText;
        }
        
        const unreadMap = chat.unreadCounts instanceof Map ? chat.unreadCounts : new Map(Object.entries(chat.unreadCounts || {}));
        const unread = unreadMap.get(userInfo?._id) || 0;
        
        return {
            id: chat._id,
            name,
            avatar,
            preview,
            isGroup: chat.type === 'group',
            unread,
            isOnline,
            isPinned: pinnedChatIds.includes(chat._id)
        };
    }

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
    };

    const filteredMessages = messages.filter(msg => {
        // We reuse searchQuery state for both user search and message search? Better not.
        // I won't do in-chat search to simplify UI logic. Or I can use a diff state.
        return true; 
    });

    if (!userInfo) return <div className="p-4">Please login to use Campus Chat.</div>;
    
    // Helper to fetch raw group/convo data
    function getRawFromChat(chatId) {
        if (!chatId) return null;
        return (conversations || []).find(c => (c?._id || c?.id) === chatId) || (legacyGroups || []).find(lg => (lg?._id || lg?.id) === chatId);
    }

    // Group conversations by section
    const displayChats = (conversations || []).map(getChatDisplayInfo);
    const pinnedChats = displayChats.filter(c => c?.isPinned);
    const recentDMs = displayChats.filter(c => !c?.isPinned && !c?.isGroup);
    
    // Categorize groups (both active conversations and discovery groups)
    const activeGroups = displayChats.filter(c => !c?.isPinned && c?.isGroup);
    const legacyItems = (legacyGroups || []).filter(lg => !displayChats.find(dc => dc?.id === lg?._id)).map(getChatDisplayInfo);
    
    // Unified list of all group-like items for filtering
    const allGroups = [...activeGroups, ...legacyItems];

    const maitCourses = allGroups.filter(c => {
        const raw = getRawFromChat(c?.id);
        if (!raw) return false;
        const tags = (raw?.group_id?.tags || raw?.tags || []);
        const type = (raw?.group_id?.group_type || raw?.group_type);
        return type === 'course' && tags.includes('mait');
    });
    
    const maimsCourses = allGroups.filter(c => {
        const raw = getRawFromChat(c?.id);
        if (!raw) return false;
        const tags = (raw?.group_id?.tags || raw?.tags || []);
        const type = (raw?.group_id?.group_type || raw?.group_type);
        return type === 'course' && tags.includes('maims');
    });
    
    const maitSocieties = allGroups.filter(c => {
        const raw = getRawFromChat(c?.id);
        if (!raw) return false;
        const tags = (raw?.group_id?.tags || raw?.tags || []);
        const type = (raw?.group_id?.group_type || raw?.group_type);
        return type === 'society' && tags.includes('mait');
    });
    
    const maimsSocieties = allGroups.filter(c => {
        const raw = getRawFromChat(c?.id);
        if (!raw) return false;
        const tags = (raw?.group_id?.tags || raw?.tags || []);
        const type = (raw?.group_id?.group_type || raw?.group_type);
        return type === 'society' && tags.includes('maims');
    });
    
    const generalGroups = allGroups.filter(c => {
        const raw = getRawFromChat(c?.id);
        if (!raw) return true; // Keep as general if raw not found? Or false.
        const tags = (raw?.group_id?.tags || raw?.tags || []);
        const type = (raw?.group_id?.group_type || raw?.group_type);
        
        const isMaitCourse = type === 'course' && tags.includes('mait');
        const isMaimsCourse = type === 'course' && tags.includes('maims');
        const isMaitSociety = type === 'society' && tags.includes('mait');
        const isMaimsSociety = type === 'society' && tags.includes('maims');
        
        if (isMaitCourse || isMaimsCourse || isMaitSociety || isMaimsSociety) return false;
        return true;
    });

    // Recommendation logic (Bonus)
    const recommendations = conversations.filter(c => {
        if (c.type !== 'group' || !c.group_id) return false;
        const tags = c.group_id.tags || [];
        const branch = userInfo.branch?.toLowerCase();
        return tags.some(tag => branch?.includes(tag));
    }).slice(0, 3);

    const ChatListItem = ({ chat, rawChat }) => (
        <div
            className={`chat-item ${activeChat?._id === chat.id ? 'active' : ''}`}
            onClick={() => setActiveChat(rawChat)}
        >
            <div className="chat-avatar-wrapper">
                <div className="chat-avatar">{chat.avatar}</div>
                {chat.isOnline && <div className="online-indicator"></div>}
            </div>
            <div className="chat-info">
                <div className="chat-info-header">
                    <span className="chat-name">{chat.name}</span>
                    {rawChat?.type && (
                        <button 
                             className={`pin-btn ${chat.isPinned ? 'pinned' : ''}`}
                             onClick={(e) => handlePinChat(e, chat.id)}
                             title={chat.isPinned ? "Unpin chat" : "Pin chat"}
                        >
                             📌
                        </button>
                    )}
                </div>
                <div className="chat-info-bottom">
                    <span className={`chat-last-message ${chat.unread > 0 ? 'unread-bold' : ''}`}>
                        {typingUsers[chat.id] ? <span className="typing-text">typing...</span> : chat.preview}
                    </span>
                    {chat.unread > 0 && <span className="unread-badge">{chat.unread}</span>}
                </div>
            </div>
        </div>
    );

    return (
        <div className="chat-container">
            <div className="chat-sidebar">
                <div className="sidebar-header">
                    <h2>Campus Talk</h2>
                    <div className="sidebar-search">
                        <input 
                            type="text" 
                            placeholder="Search people or groups..." 
                            value={searchQuery}
                            onChange={handleSearchUsers}
                        />
                        <span className="search-icon">🔍</span>
                    </div>
                    {searchQuery && (
                        <div className="search-results-dropdown">
                            {isSearching ? <div className="p-2 text-gray-400">Searching...</div> : 
                             searchResults.length > 0 ? (
                                searchResults.map(user => (
                                    <div key={user._id} className="search-result-item" onClick={() => startDirectChat(user._id)}>
                                        <div className="chat-avatar">{(user.name || 'U').charAt(0).toUpperCase()}</div>
                                        <div className="search-info">
                                            <span>{user.name}</span>
                                            <small>{user.email}</small>
                                        </div>
                                    </div>
                                ))
                             ) : <div className="p-2 text-gray-400">No users found</div>
                            }
                        </div>
                    )}
                </div>
                
                <div className="chats-list-scrollable">
                    {recommendations.length > 0 && (
                        <div className="chat-section recommendation-section">
                            <h4 className="section-title">✨ RECOMMENDED FOR YOU</h4>
                            <div className="recommendation-row">
                                {recommendations.map(c => (
                                    <div key={c._id} className="recommendation-card" onClick={() => setActiveChat(c)}>
                                        <div className="rec-avatar">{c.group_id?.group_name.charAt(0)}</div>
                                        <span>{c.group_id?.group_name.split(' ')[0]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {pinnedChats.length > 0 && (
                        <div className="chat-section">
                            <h4 className="section-title">📌 PINNED</h4>
                            {pinnedChats.map(c => <ChatListItem key={c.id} chat={c} rawChat={getRawFromChat(c.id)} />)}
                        </div>
                    )}
                    
                    <div className="chat-section">
                        <h4 className="section-title">💬 DIRECT MESSAGES</h4>
                        {recentDMs.length === 0 ? (
                            <div className="empty-section">No recent DMs</div>
                        ) : (
                            recentDMs.map(c => <ChatListItem key={c.id} chat={c} rawChat={getRawFromChat(c.id)} />)
                        )}
                    </div>
                    
                    <div className="chat-section collapsible">
                        <div className="section-header" onClick={() => toggleSection('mait_courses')}>
                            <h4 className="section-title">💻 MAIT COURSES ({maitCourses.length})</h4>
                            <span className="collapse-icon">{expandedSections.mait_courses ? '▼' : '▶'}</span>
                        </div>
                        {expandedSections.mait_courses && maitCourses.map(c => <ChatListItem key={c.id} chat={c} rawChat={getRawFromChat(c.id)} />)}
                    </div>

                    <div className="chat-section collapsible">
                        <div className="section-header" onClick={() => toggleSection('maims_courses')}>
                            <h4 className="section-title">📊 MAIMS COURSES ({maimsCourses.length})</h4>
                            <span className="collapse-icon">{expandedSections.maims_courses ? '▼' : '▶'}</span>
                        </div>
                        {expandedSections.maims_courses && maimsCourses.map(c => <ChatListItem key={c.id} chat={c} rawChat={getRawFromChat(c.id)} />)}
                    </div>

                    <div className="chat-section collapsible">
                        <div className="section-header" onClick={() => toggleSection('mait_societies')}>
                            <h4 className="section-title">🏫 MAIT SOCIETIES ({maitSocieties.length})</h4>
                            <span className="collapse-icon">{expandedSections.mait_societies ? '▼' : '▶'}</span>
                        </div>
                        {expandedSections.mait_societies && maitSocieties.map(c => <ChatListItem key={c.id} chat={c} rawChat={getRawFromChat(c.id)} />)}
                    </div>

                    <div className="chat-section collapsible">
                        <div className="section-header" onClick={() => toggleSection('maims_societies')}>
                            <h4 className="section-title">🏫 MAIMS SOCIETIES ({maimsSocieties.length})</h4>
                            <span className="collapse-icon">{expandedSections.maims_societies ? '▼' : '▶'}</span>
                        </div>
                        {expandedSections.maims_societies && maimsSocieties.map(c => <ChatListItem key={c.id} chat={c} rawChat={getRawFromChat(c.id)} />)}
                    </div>

                    <div className="chat-section collapsible">
                        <div className="section-header" onClick={() => toggleSection('general')}>
                            <h4 className="section-title">🌍 GENERAL & OTHERS ({generalGroups.length})</h4>
                            <span className="collapse-icon">{expandedSections.general ? '▼' : '▶'}</span>
                        </div>
                        {expandedSections.general && (
                            <>
                                {generalGroups.map(c => <ChatListItem key={c.id} chat={c} rawChat={getRawFromChat(c.id)} />)}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="chat-main">
                {activeChat ? (
                    <>
                        <div className="chat-header">
                            {showMsgSearch ? (
                                <div className="header-search-container">
                                    <input 
                                        type="text" 
                                        placeholder="Search in conversation..." 
                                        autoFocus
                                        value={msgSearchQuery}
                                        onChange={(e) => setMsgSearchQuery(e.target.value)}
                                    />
                                    <button onClick={() => { setShowMsgSearch(false); setMsgSearchQuery(''); }}>✖</button>
                                </div>
                            ) : (
                                <>
                                    <div className="chat-header-info">
                                        <h3>{getChatDisplayInfo(activeChat).name}</h3>
                                        {typingUsers[activeChat._id] ? (
                                            <p className="typing-status">typing...</p>
                                        ) : (
                                            <p className="online-status">
                                                {getChatDisplayInfo(activeChat).isOnline ? (
                                                    <><span className="status-dot online"></span> Online</>
                                                ) : (
                                                    <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                                                        {activeChat.type === 'direct' ? 'Offline' : (activeChat.type === 'group' || !activeChat.type ? 'Campus Group' : '')}
                                                    </span>
                                                )}
                                            </p>
                                        )}
                                    </div>
                                    <div className="chat-header-actions">
                                        <button className="header-action-btn" title="Search Messages" onClick={() => setShowMsgSearch(true)}>🔍</button>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="chat-messages">
                            {(messages || []).filter(m => (m?.message || '').toLowerCase().includes((msgSearchQuery || '').toLowerCase())).length === 0 ? (
                                <div className="empty-chat-state">
                                    {msgSearchQuery ? `No messages matching "${msgSearchQuery}"` : "Say hi to start the conversation!"}
                                </div>
                            ) : (
                                (messages || []).filter(m => (m?.message || '').toLowerCase().includes((msgSearchQuery || '').toLowerCase())).map((msg, idx) => {
                                    const isSent = msg?.sender_id?._id === userInfo?._id;
                                    const hasReactions = msg?.reactions && msg.reactions.length > 0;
                                    return (
                                        <div key={idx} className={`message-wrapper ${isSent ? 'sent' : 'received'}`}>
                                            {!isSent && (
                                                <div className="message-avatar">
                                                    {(msg?.sender_id?.name || 'U').charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="message-bubble-container">
                                                <div className="message-bubble">
                                                    {!isSent && !activeChat.type && (
                                                        <span className="sender-name">{msg.sender_id.name}</span>
                                                    )}
                                                    
                                                    {msg?.replyTo && (
                                                        <div className="replied-quote">
                                                            <small className="replied-sender">{msg?.replyTo?.sender_id?.name || 'User'}</small>
                                                            <p className="replied-text">{(msg?.replyTo?.message || '').substring(0, 50)}...</p>
                                                        </div>
                                                    )}

                                                    <p className="message-content">{msg.message}</p>
                                                    
                                                    {msg.fileUrl && (
                                                        <div className="message-attachment">
                                                            <a href={`${ENDPOINT}${msg.fileUrl}`} target="_blank" rel="noopener noreferrer">
                                                                📎 View Attachment
                                                            </a>
                                                        </div>
                                                    )}
                                                    
                                                    <span className="message-meta">
                                                        {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        {isSent && <span className="message-seen">✔✔</span>}
                                                    </span>

                                                    <div className="message-actions-overlay">
                                                        <button title="Reply" onClick={() => setReplyingTo(msg)}>↩️</button>
                                                        <div className="inline-reactions">
                                                            {reactionOptions.map(emoji => (
                                                                <button key={emoji} onClick={() => handleReaction(msg._id, emoji)}>{emoji}</button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {hasReactions && (
                                                    <div className="message-reactions-row">
                                                        {msg.reactions.reduce((acc, curr) => {
                                                            const existing = acc.find(r => r.emoji === curr.emoji);
                                                            if (existing) existing.count++;
                                                            else acc.push({ emoji: curr.emoji, count: 1 });
                                                            return acc;
                                                        }, []).map(r => (
                                                            <div key={r.emoji} className="reaction-chip" onClick={() => handleReaction(msg._id, r.emoji)}>
                                                                {r.emoji} <span>{r.count}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="chat-input-wrapper-container">
                            {replyingTo && (
                                <div className="replying-to-bar">
                                    <div className="reply-info">
                                        <small>Replying to <strong>{replyingTo.sender_id.name}</strong></small>
                                        <p>{replyingTo.message}</p>
                                    </div>
                                    <button className="cancel-reply" onClick={() => setReplyingTo(null)}>✖</button>
                                </div>
                            )}

                            {selectedFile && (
                                <div className="file-attachment-preview">
                                    📎 <span>{selectedFile.name}</span>
                                    <button onClick={() => setSelectedFile(null)}>✖</button>
                                </div>
                            )}

                            <div className="chat-input-wrapper">
                                {showEmojiPicker && (
                                    <div className="emoji-picker-popup">
                                        {emojis.map((emoji, index) => (
                                            <button key={index} type="button" onClick={() => setNewMessage(prev => prev + emoji)}>
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
                                        className="message-input"
                                        value={newMessage}
                                        onChange={handleTyping}
                                    />
                                    <button type="submit" className="btn-send" disabled={!newMessage.trim() && !selectedFile}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                          <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"/>
                                        </svg>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="chat-placeholder">
                        <div className="placeholder-content">
                            <h3>Campus Connect</h3>
                            <p>Select a chat or find someone to start messaging.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
