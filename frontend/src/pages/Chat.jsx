import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import './Chat.css';

const ENDPOINT = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

/* ── Emoji categories ── */
const EMOJI_CATEGORIES = [
    {
        label: '😊 Smileys', emojis: [
            '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😉',
            '😊','😇','🥰','😍','🤩','😘','😗','😚','😙','😋',
            '😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐',
            '😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔',
            '😪','🤤','😴','😷','🤒','🤕','🤢','🤧','🥵','🥶',
            '😱','😨','😰','😥','😓','🤯','😤','😠','😡','🤬',
            '😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽',
        ]
    },
    {
        label: '👍 Gestures', emojis: [
            '👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞',
            '🤟','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎',
            '✊','👊','🤛','🤜','👏','🙌','🤲','🙏','✍️','💪',
            '🦾','🦿','🦵','🦶','👂','🦻','👃','🫀','🫁','🧠',
        ]
    },
    {
        label: '❤️ Hearts', emojis: [
            '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔',
            '❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️',
            '✝️','☯️','🕉️','✡️','🌈','🔥','⭐','🌟','💫','✨',
        ]
    },
    {
        label: '🎉 Party', emojis: [
            '🎉','🎊','🎈','🎁','🎀','🪅','🎆','🎇','🧨','🪄',
            '🏆','🥇','🥈','🥉','🎖️','🏅','🎗️','🎟️','🎫','🎪',
            '🤹','🎭','🎨','🖼️','🎬','🎤','🎧','🎵','🎶','🎼',
        ]
    },
    {
        label: '🌍 Nature', emojis: [
            '🌸','🌺','🌹','🌷','🌼','🌻','🌞','🌝','🌛','🌜',
            '🌙','⭐','🌟','💫','✨','🌈','☁️','⛅','🌤️','🌥️',
            '🌦️','🌧️','⛈️','🌩️','🌨️','❄️','🌪️','🌫️','🌊','🌋',
            '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯',
        ]
    },
    {
        label: '🍕 Food', emojis: [
            '🍕','🍔','🍟','🌭','🌮','🌯','🥙','🥗','🍿','🧂',
            '🥞','🧇','🥓','🥩','🍗','🍖','🦴','🌽','🥦','🥕',
            '🍎','🍊','🍋','🍇','🍓','🍑','🍒','🍌','🥝','🍉',
            '☕','🍵','🧃','🥤','🍺','🍷','🥂','🍾','🎂','🍰',
        ]
    },
];

/* ─── Emoji Picker Component ─── */
const EmojiPicker = ({ onSelect, onClose }) => {
    const [activeTab, setActiveTab] = useState(0);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) onClose();
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [onClose]);

    return (
        <div className="ct-emoji-picker" ref={ref} role="dialog" aria-label="Emoji picker">
            {/* Category tabs */}
            <div className="ct-emoji-tabs">
                {EMOJI_CATEGORIES.map((cat, i) => (
                    <button
                        key={i}
                        className={`ct-emoji-tab${activeTab === i ? ' active' : ''}`}
                        onClick={() => setActiveTab(i)}
                        title={cat.label}
                        type="button"
                    >
                        {cat.emojis[0]}
                    </button>
                ))}
            </div>
            {/* Label */}
            <div className="ct-emoji-cat-label">{EMOJI_CATEGORIES[activeTab].label}</div>
            {/* Grid */}
            <div className="ct-emoji-grid">
                {EMOJI_CATEGORIES[activeTab].emojis.map((em, i) => (
                    <button
                        key={i}
                        className="ct-emoji-cell"
                        onClick={() => onSelect(em)}
                        type="button"
                        aria-label={em}
                    >
                        {em}
                    </button>
                ))}
            </div>
        </div>
    );
};

/* ─── File Preview bubble helper ─── */
const FileBubble = ({ fileUrl }) => {
    if (!fileUrl) return null;
    const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${ENDPOINT}${fileUrl}`;
    const ext = fullUrl.split('.').pop().toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
    const isVideo = ['mp4', 'webm', 'mov'].includes(ext);

    if (isImage) {
        return (
            <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="ct-file-img-link">
                <img src={fullUrl} alt="shared" className="ct-file-img" />
            </a>
        );
    }
    if (isVideo) {
        return <video src={fullUrl} controls className="ct-file-video" />;
    }
    const filename = decodeURIComponent(fullUrl.split('/').pop().replace(/^\d+-/, ''));
    return (
        <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="ct-file-attachment">
            <span className="ct-file-icon">📎</span>
            <span className="ct-file-name">{filename}</span>
            <span className="ct-file-dl">↓</span>
        </a>
    );
};

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

    // Emoji picker
    const [showEmoji, setShowEmoji] = useState(false);

    // File upload
    const [uploadingFile, setUploadingFile] = useState(false);
    const [filePreview, setFilePreview] = useState(null); // { name, url (local blob), fileUrl (server) }
    const fileInputRef = useRef(null);

    // Delete context menu
    const [ctxMenu, setCtxMenu] = useState(null); // { msgId, x, y }

    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);
    const inputRef = useRef(null);

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
                if (selectedGroup && newMsg.group_id === selectedGroup._id) {
                    return [...prev, newMsg];
                }
                return prev;
            });
        });

        socketRef.current.on('message_deleted', ({ messageId }) => {
            setMessages((prev) =>
                prev.map(m => m._id === messageId ? { ...m, deleted: true, message: '', fileUrl: undefined } : m)
            );
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
                    socketRef.current.emit('join_chat', selectedGroup._id);
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
    // Emoji Handler
    // ─────────────────────────────────────────────
    const handleEmojiSelect = useCallback((emoji) => {
        setInputValue(prev => prev + emoji);
        setShowEmoji(false);
        inputRef.current?.focus();
    }, []);

    // ─────────────────────────────────────────────
    // File Upload Handler
    // ─────────────────────────────────────────────
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Max 10 MB guard
        if (file.size > 10 * 1024 * 1024) {
            alert('File is too large. Maximum size is 10 MB.');
            e.target.value = '';
            return;
        }

        const localUrl = URL.createObjectURL(file);
        setFilePreview({ name: file.name, localUrl, fileUrl: null });
        setUploadingFile(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            const { data } = await axios.post(`${ENDPOINT}/api/chat/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...(userInfo?.token ? { Authorization: `Bearer ${userInfo.token}` } : {})
                }
            });
            setFilePreview(prev => ({ ...prev, fileUrl: data.url }));
        } catch (err) {
            console.error('File upload error:', err);
            alert('Failed to upload file. Please try again.');
            setFilePreview(null);
        } finally {
            setUploadingFile(false);
            e.target.value = '';
        }
    };

    const clearFilePreview = () => {
        if (filePreview?.localUrl) URL.revokeObjectURL(filePreview.localUrl);
        setFilePreview(null);
    };

    // ─────────────────────────────────────────────
    // Send Handler
    // ─────────────────────────────────────────────
    const handleSend = (e) => {
        e.preventDefault();
        const hasText = inputValue.trim();
        const hasFile = filePreview?.fileUrl;
        if ((!hasText && !hasFile) || !selectedGroup || !userInfo) return;
        if (uploadingFile) return; // still uploading

        const msgData = {
            sender_id: userInfo._id,
            group_id: selectedGroup._id,
            message: inputValue,
            fileUrl: filePreview?.fileUrl || undefined,
        };

        socketRef.current.emit('send_message', msgData);
        setInputValue('');
        clearFilePreview();
    };

    // ─────────────────────────────────────────────
    // Delete Message Handler
    // ─────────────────────────────────────────────
    const handleDeleteMessage = (msg) => {
        if (!window.confirm('Delete this message for everyone?')) return;
        socketRef.current.emit('delete_message', {
            messageId: msg._id,
            senderId: userInfo._id,
            chatId: selectedGroup._id,
        });
        setCtxMenu(null);
    };

    // Close ctx menu on outside click
    useEffect(() => {
        if (!ctxMenu) return;
        const close = () => setCtxMenu(null);
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, [ctxMenu]);

    const handleJoinGroup = async (group) => {
        try {
            await axios.post(`${ENDPOINT}/api/chat/groups/${group._id}/join`, {}, authConfig);
            setSelectedGroup(group);
        } catch (error) {
            setSelectedGroup(group);
        }
    };

    // Filter
    const filteredGroups = groups.filter(g =>
        g.group_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const canSend = (inputValue.trim() || filePreview?.fileUrl) && !uploadingFile;

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
                            <span className="ct-chip">😊 Emoji reactions</span>
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
                                [false, true, false, false, true].map((sent, i) => (
                                    <div key={i} className={`ct-skeleton-bubble ${sent ? 'sent' : ''}`}>
                                        <div className={`ct-sk-bubble ${sent ? 'sent' : ''}`} />
                                    </div>
                                ))
                            ) : (
                                messages.map((msg) => {
                                    const isSent = msg.sender_id?._id === userInfo?._id;
                                    const timeStr = new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                                    const isDeleted = msg.deleted;

                                    return (
                                        <div
                                            key={msg._id}
                                            className={`ct-message-row${isSent ? ' sent' : ' received'}`}
                                            onContextMenu={isSent && !isDeleted ? (e) => {
                                                e.preventDefault();
                                                setCtxMenu({ msg, x: e.clientX, y: e.clientY });
                                            } : undefined}
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
                                                <div className={`ct-bubble${isSent ? ' ct-bubble-sent' : ' ct-bubble-recv'}${isDeleted ? ' ct-bubble-deleted' : ''}`}>
                                                    {isDeleted ? (
                                                        <p className="ct-bubble-text ct-deleted-text">🚫 This message was deleted</p>
                                                    ) : (
                                                        <>
                                                            {/* File / Image content */}
                                                            {msg.fileUrl && <FileBubble fileUrl={msg.fileUrl} />}
                                                            {/* Text content */}
                                                            {msg.message && (
                                                                <p className="ct-bubble-text">{msg.message}</p>
                                                            )}
                                                        </>
                                                    )}
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

                        {/* ── Delete context menu ── */}
                        {ctxMenu && (
                            <div
                                className="ct-ctx-menu"
                                style={{ top: ctxMenu.y, left: ctxMenu.x }}
                                onClick={e => e.stopPropagation()}
                            >
                                <button
                                    className="ct-ctx-delete"
                                    onClick={() => handleDeleteMessage(ctxMenu.msg)}
                                >
                                    🗑️ Delete for everyone
                                </button>
                            </div>
                        )}

                        {/* Input Footer */}
                        <footer className="ct-footer">
                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                id="ct-file-input"
                                className="ct-file-input-hidden"
                                accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                                onChange={handleFileChange}
                            />

                            {/* Emoji picker (floats above footer) */}
                            {showEmoji && (
                                <EmojiPicker
                                    onSelect={handleEmojiSelect}
                                    onClose={() => setShowEmoji(false)}
                                />
                            )}

                            <form className="ct-input-form" onSubmit={handleSend} style={{ width: '100%' }}>
                                {/* Attach button */}
                                <button
                                    type="button"
                                    className="ct-action-btn"
                                    title="Attach file"
                                    onClick={() => fileInputRef.current?.click()}
                                    aria-label="Attach file"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                                    </svg>
                                </button>

                                {/* Emoji button */}
                                <button
                                    type="button"
                                    className={`ct-action-btn ct-emoji-trigger${showEmoji ? ' active' : ''}`}
                                    title="Emoji"
                                    onClick={() => setShowEmoji(v => !v)}
                                    aria-label="Open emoji picker"
                                    aria-expanded={showEmoji}
                                >
                                    😊
                                </button>

                                <div className="ct-input-wrap">
                                    {/* File preview chip */}
                                    {filePreview && (
                                        <div className="ct-file-preview-chip">
                                            {uploadingFile ? (
                                                <span className="ct-upload-spinner" />
                                            ) : (
                                                <span className="ct-file-chip-icon">
                                                    {['jpg','jpeg','png','gif','webp'].some(ext => filePreview.name.toLowerCase().endsWith(ext)) ? '🖼️' : '📎'}
                                                </span>
                                            )}
                                            <span className="ct-file-chip-name">{filePreview.name}</span>
                                            <button
                                                type="button"
                                                className="ct-file-chip-remove"
                                                onClick={clearFilePreview}
                                                aria-label="Remove file"
                                            >✕</button>
                                        </div>
                                    )}

                                    <input
                                        ref={inputRef}
                                        className="ct-input"
                                        type="text"
                                        placeholder={filePreview ? 'Add a caption…' : 'Type a message…'}
                                        value={inputValue}
                                        onChange={e => setInputValue(e.target.value)}
                                        autoComplete="off"
                                    />
                                </div>

                                <button
                                    className="ct-send-btn"
                                    type="submit"
                                    disabled={!canSend}
                                    title="Send"
                                >
                                    {uploadingFile ? (
                                        <span className="ct-upload-spinner" style={{ width: 16, height: 16 }} />
                                    ) : (
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                        </svg>
                                    )}
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
