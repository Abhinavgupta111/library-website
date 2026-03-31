import React from 'react';

const TopHeader = ({ onMenuClick, isSidebarOpen }) => {
    return (
        <header className="h-16 px-6 md:px-8 bg-white border-b border-gray-200 flex items-center justify-between shadow-sm sticky top-0 z-30 transition-all duration-300">

            {/* Mobile Hamburger & Desktop Toggle */}
            <div className="flex items-center">
                <button
                    className="p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none"
                    onClick={onMenuClick}
                    aria-label="Toggle Menu"
                >
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                </button>
            </div>

            {/* Dashboard Search Bar (Centered, 45-50% width) */}
            <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center bg-gray-50 px-4 rounded-xl border border-gray-200 transition-colors w-[50%] lg:w-[45%]" style={{ minHeight: '42px' }}>
                <svg className="text-gray-400 shrink-0" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                    type="text"
                    placeholder="Search books, journals, manuscripts, or DOI.."
                    className="bg-transparent border-none ml-3 text-sm flex-1 text-gray-800 placeholder-gray-400"
                    style={{ outline: 'none', boxShadow: 'none', WebkitAppearance: 'none' }}
                />
            </div>
            {/* Mobile basic spanning search bar (when hidden on desktop) */}
            <div className="md:hidden flex-1 mx-4">
                <div className="flex items-center bg-gray-50 px-4 rounded-xl border border-gray-200 transition-colors w-full" style={{ minHeight: '42px' }}>
                    <svg className="text-gray-400 shrink-0" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input type="text" placeholder="Search..." className="bg-transparent border-none ml-2 text-sm w-full text-gray-800 placeholder-gray-400" style={{ outline: 'none', boxShadow: 'none' }} />
                </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-4 lg:gap-6 shrink-0 mr-8 md:mr-16 lg:mr-20">
                <button className="p-2 rounded-full relative text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>
                <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
                <button className="flex items-center gap-2 p-1 pl-2 pr-3 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                    <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Profile" className="w-8 h-8 rounded-full shadow-sm" />
                </button>
            </div>
        </header>
    );
};
export default TopHeader;
