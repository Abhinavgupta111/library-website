import React, { useState, useRef, useEffect } from 'react';
import './Chat.css';

/* ─────────────────────────────────────────────
   HARDCODED DATA — no backend, no socket.io
   ───────────────────────────────────────────── */
const GROUPS = [
    '2I123', '2I456', '2I789',
    '4I123', '4I456', '4I789',
    '6I123', '6I456', '6I789',
];

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

/* Dummy messages per group */
const DUMMY_MESSAGES = {
    '2I123': [
        { id: 1, sender: 'Aryan Mehta', text: 'Hey, did anyone check the Data Structures assignment?', sent: false, time: '9:14 AM' },
        { id: 2, sender: 'You', text: 'Yeah, Q3 is a bit tricky. Linked list reversal in O(1) space.', sent: true, time: '9:15 AM' },
        { id: 3, sender: 'Priya Sharma', text: 'It\'s doable! Just use three pointers 😊', sent: false, time: '9:16 AM' },
        { id: 4, sender: 'You', text: 'Thanks! Will try that approach.', sent: true, time: '9:17 AM' },
    ],
    '2I456': [
        { id: 1, sender: 'Rohan Singh', text: 'DBMS lab quiz tomorrow — anyone prepared?', sent: false, time: '10:02 AM' },
        { id: 2, sender: 'You', text: 'Went through normalization. 1NF to BCNF.', sent: true, time: '10:04 AM' },
        { id: 3, sender: 'Sneha Kapoor', text: 'Sharing my notes in the group! 📎', sent: false, time: '10:05 AM' },
    ],
    '2I789': [
        { id: 1, sender: 'Amit Verma', text: 'OS assignment due Friday — let\'s pair up.', sent: false, time: '8:45 AM' },
        { id: 2, sender: 'You', text: 'Sure! I\'ll do the memory management section.', sent: true, time: '8:48 AM' },
        { id: 3, sender: 'Neha Jain', text: 'I\'ll cover process scheduling 🙌', sent: false, time: '8:50 AM' },
        { id: 4, sender: 'You', text: 'Perfect. Let\'s sync tomorrow evening.', sent: true, time: '8:51 AM' },
    ],
    '4I123': [
        { id: 1, sender: 'Karan Bhatia', text: 'Anyone attended today\'s CN lecture?', sent: false, time: '2:10 PM' },
        { id: 2, sender: 'You', text: 'Yes! It was on TCP/IP socket programming.', sent: true, time: '2:12 PM' },
        { id: 3, sender: 'Karan Bhatia', text: 'Could you share your notes please? 🙏', sent: false, time: '2:13 PM' },
    ],
    '4I456': [
        { id: 1, sender: 'Divya Rao', text: 'ML project team — who\'s doing the model training?', sent: false, time: '11:30 AM' },
        { id: 2, sender: 'You', text: 'I can handle training if someone does preprocessing.', sent: true, time: '11:32 AM' },
        { id: 3, sender: 'Vikram Nair', text: 'I\'ll do the EDA + data cleaning part 🔬', sent: false, time: '11:33 AM' },
        { id: 4, sender: 'Divya Rao', text: 'Great, let\'s meet in the library at 3 PM!', sent: false, time: '11:34 AM' },
    ],
    '4I789': [
        { id: 1, sender: 'Riya Gupta', text: 'Software Engineering class — anyone has the slides?', sent: false, time: '1:00 PM' },
        { id: 2, sender: 'You', text: 'Sir uploaded them on the portal last night.', sent: true, time: '1:02 PM' },
        { id: 3, sender: 'Riya Gupta', text: 'Oh nice! I missed the notification 😅 thanks!', sent: false, time: '1:03 PM' },
    ],
    '6I123': [
        { id: 1, sender: 'Harsh Trivedi', text: 'Final year project review is next week. How\'s progress?', sent: false, time: '4:00 PM' },
        { id: 2, sender: 'You', text: 'Frontend is ready. Working on the API integration now.', sent: true, time: '4:05 PM' },
        { id: 3, sender: 'Muskan Agarwal', text: 'Same here — ML model is giving 91% accuracy 🎯', sent: false, time: '4:07 PM' },
        { id: 4, sender: 'You', text: 'That\'s amazing Muskan! What dataset did you use?', sent: true, time: '4:08 PM' },
    ],
    '6I456': [
        { id: 1, sender: 'Tanvi Desai', text: 'Placement cell session today at 3 PM!', sent: false, time: '9:00 AM' },
        { id: 2, sender: 'You', text: 'Which company? Is it on-campus?', sent: true, time: '9:02 AM' },
        { id: 3, sender: 'Tanvi Desai', text: 'Yes! Infosys & Wipro. Carry your resume 📄', sent: false, time: '9:03 AM' },
    ],
    '6I789': [
        { id: 1, sender: 'Shubham Joshi', text: 'Midsem results are out guys 🎉', sent: false, time: '3:22 PM' },
        { id: 2, sender: 'You', text: 'Finally! How\'d you do?', sent: true, time: '3:24 PM' },
        { id: 3, sender: 'Shubham Joshi', text: '8.4 CGPA! Pretty happy about it 😄', sent: false, time: '3:25 PM' },
        { id: 4, sender: 'You', text: 'Congrats!! 🔥 You deserved it.', sent: true, time: '3:26 PM' },
    ],
};

/* Last message preview per group */
const LAST_MESSAGES = {
    '2I123': 'Thanks! Will try that approach.',
    '2I456': 'Sharing my notes in the group! 📎',
    '2I789': 'Perfect. Let\'s sync tomorrow evening.',
    '4I123': 'Could you share your notes please? 🙏',
    '4I456': 'Great, let\'s meet in the library at 3 PM!',
    '4I789': 'Oh nice! I missed the notification 😅',
    '6I123': 'That\'s amazing Muskan! What dataset?',
    '6I456': 'Yes! Infosys & Wipro. Carry your resume 📄',
    '6I789': 'Congrats!! 🔥 You deserved it.',
};

/* Last message times */
const LAST_TIMES = {
    '2I123': '9:17 AM', '2I456': '10:05 AM', '2I789': '8:51 AM',
    '4I123': '2:13 PM', '4I456': '11:34 AM', '4I789': '1:03 PM',
    '6I123': '4:08 PM', '6I456': '9:03 AM', '6I789': '3:26 PM',
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────── */
const Chat = () => {
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef(null);

    /* Auto-scroll when group changes */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedGroup]);

    const filteredGroups = GROUPS.filter(g =>
        g.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSend = (e) => {
        e.preventDefault();
        setInputValue('');   // static — just clear input
    };

    return (
        <div className="ct-container">

            {/* ══════════════════
                LEFT SIDEBAR
                ══════════════════ */}
            <aside className="ct-sidebar">
                {/* Header */}
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

                {/* Section label */}
                <div className="ct-section-label">
                    <span>💻 MAIT — IT SECTIONS</span>
                    <span className="ct-section-count">{filteredGroups.length}</span>
                </div>

                {/* Group List */}
                <div className="ct-group-list">
                    {filteredGroups.length === 0 ? (
                        <div className="ct-empty-list">No groups match your search.</div>
                    ) : (
                        filteredGroups.map((group, idx) => {
                            const isActive = selectedGroup === group;
                            return (
                                <button
                                    key={group}
                                    className={`ct-group-item${isActive ? ' active' : ''}`}
                                    onClick={() => setSelectedGroup(group)}
                                    aria-label={`Open chat for group ${group}`}
                                >
                                    {/* Avatar */}
                                    <div
                                        className="ct-avatar"
                                        style={{ background: AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length] }}
                                    >
                                        {group.charAt(0)}
                                    </div>

                                    {/* Info */}
                                    <div className="ct-group-info">
                                        <div className="ct-group-top">
                                            <span className="ct-group-name">{group}</span>
                                            <span className="ct-group-time">{LAST_TIMES[group]}</span>
                                        </div>
                                        <span className="ct-group-preview">{LAST_MESSAGES[group]}</span>
                                    </div>

                                    {/* Active indicator dot */}
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
            <main className="ct-main">
                {selectedGroup === null ? (
                    /* ── EMPTY STATE ── */
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
                    /* ── ACTIVE CHAT STATE ── */
                    <>
                        {/* Chat Header */}
                        <header className="ct-chat-header">
                            <div className="ct-chat-header-left">
                                <div
                                    className="ct-avatar ct-avatar-md"
                                    style={{ background: AVATAR_GRADIENTS[GROUPS.indexOf(selectedGroup) % AVATAR_GRADIENTS.length] }}
                                >
                                    {selectedGroup.charAt(0)}
                                </div>
                                <div className="ct-chat-header-text">
                                    <span className="ct-chat-header-name">{selectedGroup}</span>
                                    <span className="ct-chat-header-sub">IT Section · MAIT Campus Group</span>
                                </div>
                            </div>
                            <div className="ct-chat-header-actions">
                                <button className="ct-icon-btn" title="Search in chat">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    </svg>
                                </button>
                                <button className="ct-icon-btn" title="More options">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                                        <circle cx="12" cy="5" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="19" r="1" fill="currentColor" />
                                    </svg>
                                </button>
                            </div>
                        </header>

                        {/* Messages */}
                        <div className="ct-messages">
                            {/* Day separator */}
                            <div className="ct-day-separator"><span>Today</span></div>

                            {(DUMMY_MESSAGES[selectedGroup] || []).map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`ct-message-row${msg.sent ? ' sent' : ' received'}`}
                                >
                                    {/* Avatar (received only) */}
                                    {!msg.sent && (
                                        <div
                                            className="ct-msg-avatar"
                                            style={{ background: AVATAR_GRADIENTS[GROUPS.indexOf(selectedGroup) % AVATAR_GRADIENTS.length] }}
                                        >
                                            {msg.sender.charAt(0)}
                                        </div>
                                    )}

                                    <div className="ct-bubble-col">
                                        {/* Sender name for received */}
                                        {!msg.sent && (
                                            <span className="ct-sender-name">{msg.sender}</span>
                                        )}
                                        <div className={`ct-bubble${msg.sent ? ' ct-bubble-sent' : ' ct-bubble-recv'}`}>
                                            <p className="ct-bubble-text">{msg.text}</p>
                                            <span className="ct-bubble-time">
                                                {msg.time}
                                                {msg.sent && (
                                                    <svg className="ct-tick" viewBox="0 0 16 11" fill="currentColor" width="14" height="10">
                                                        <path d="M11.071.653a.75.75 0 0 1 .025 1.06l-5.5 5.75a.75.75 0 0 1-1.085 0l-2.5-2.61a.75.75 0 1 1 1.085-1.034l1.957 2.045 4.958-5.186a.75.75 0 0 1 1.06-.025z" />
                                                        <path d="M14.071.653a.75.75 0 0 1 .025 1.06l-5.5 5.75a.75.75 0 0 1-.073.065l.073-.065 1.475-1.543L14.01.678a.75.75 0 0 1 1.06-.025z" />
                                                    </svg>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Footer */}
                        <footer className="ct-footer">
                            <button className="ct-icon-btn ct-emoji-btn" title="Emoji">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                                    <line x1="9" y1="9" x2="9.01" y2="9" />
                                    <line x1="15" y1="9" x2="15.01" y2="9" />
                                </svg>
                            </button>
                            <button className="ct-icon-btn" title="Attach file">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                                </svg>
                            </button>

                            <form className="ct-input-form" onSubmit={handleSend}>
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
