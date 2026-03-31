import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const svgProps = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
const IconDashboard = () => (<svg {...svgProps}><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></svg>);
const IconBook = () => (<svg {...svgProps}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>);
const IconCalendar = () => (<svg {...svgProps}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>);
const BrandMark = () => (<svg viewBox="0 0 32 32" width="32" height="32" fill="none" aria-hidden="true"><rect x="4" y="6" width="22" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.35" /><path d="M9 6v20M16 6v20M9 13h14M9 19h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="24" cy="10" r="3" fill="currentColor" opacity="0.9" /></svg>);

const Sidebar = ({ isOpen, onCloseMobile }) => {
    const navigate = useNavigate();
    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || { name: 'Sarah Jenkins', role: 'Student' };

    const logoutHandler = () => {
        localStorage.removeItem('userInfo');
        onCloseMobile?.();
        navigate('/login');
    };

    const handleNav = () => {
        onCloseMobile?.();
    };

    return (
        <aside className={`fixed lg:relative z-40 inset-y-0 left-0 bg-white  text-gray-800 flex flex-col transition-[width] duration-300 ease-in-out border-r border-gray-200 shadow-sm lg:shadow-none
            ${isOpen ? 'w-65 translate-x-0' : 'w-20 -translate-x-full lg:translate-x-0'}
            shrink-0`}
        >
            {/* Header / Brand */}
            {/* Proper height and dynamic padding based on state */}
            <div className={`flex items-center h-20 shrink-0 transition-all duration-300 border-b border-transparent ${isOpen ? 'px-6' : 'px-0 justify-center'}`}>
                <div className={`flex items-center gap-3 overflow-hidden text-blue-800 whitespace-nowrap w-full ${!isOpen && 'justify-center'}`}>
                    <div className="shrink-0 flex items-center justify-center bg-blue-50 p-2.5 rounded-xl text-blue-700 shadow-sm ring-1 ring-blue-100/50">
                        <BrandMark />
                    </div>
                    {isOpen && (
                        <div className="flex flex-col justify-center min-w-0">
                            <span className="font-bold text-[17px] leading-tight text-gray-900 tracking-tight truncate">MAIT Library</span>
                            <span className="text-[12px] font-semibold text-gray-500 mt-0.5 truncate uppercase tracking-widest">Portal</span>
                        </div>
                    )}
                </div>
            </div>

            <nav className="flex-1 py-8 flex flex-col gap-4 overflow-x-hidden overflow-y-auto w-full">
                {isOpen ? (
                    <div className="px-6 mb-2 text-[12px] font-bold tracking-widest text-gray-400 uppercase">
                        Main Menu
                    </div>
                ) : (
                    <div className="h-px bg-gray-200 mx-4 mb-3 mt-1"></div>
                )}

                {[
                    { path: '/', icon: <IconDashboard />, label: 'Dashboard' },
                    { path: '/library', icon: <IconBook />, label: 'Library' },
                    { path: '/events', icon: <IconCalendar />, label: 'Ongoing Events' }
                ].map(item => (
                    <NavLink key={item.path} to={item.path} onClick={handleNav} end={item.path === '/'}
                        className={({ isActive }) => `flex items-center mx-4 px-5 py-4 rounded-xl transition-all duration-200 group font-semibold text-[15px]
                            ${isActive ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100/50' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                            ${!isOpen && 'justify-center px-0 mx-4'}`
                        }
                        title={!isOpen ? item.label : ''}
                    >
                        <span className={`shrink-0 ${isOpen ? 'mr-5' : 'mr-0'}`}>{item.icon}</span>
                        {isOpen && <span className="whitespace-nowrap truncate">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Profile / Logout */}
            <div className={`p-4 mb-2 mt-auto border-t border-gray-100 flex transition-all duration-300 ${isOpen ? 'items-center justify-between mx-2 rounded-xl bg-gray-50/50' : 'flex-col items-center gap-4'}`}>
                <div className={`flex items-center gap-3 overflow-hidden ${!isOpen && 'justify-center w-full mt-2'}`}>
                    <div className={`rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm border-2 border-white
                        ${isOpen ? 'w-10 h-10' : 'w-12 h-12'}`}>
                        {userInfo.name.charAt(0)}
                    </div>
                    {isOpen && (
                        <div className="flex flex-col min-w-0 pr-2">
                            <span className="font-bold text-[14px] text-gray-900 truncate">{userInfo.name}</span>
                            <span className="text-[12px] font-medium text-gray-500 truncate mt-0.5">{userInfo.role}</span>
                        </div>
                    )}
                </div>
                <button
                    onClick={logoutHandler}
                    className={`text-gray-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50 shrink-0 ${!isOpen ? 'w-full flex justify-center mb-2' : ''}`}
                    title="Logout"
                >
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                </button>
            </div>
        </aside>
    );
};
export default Sidebar;
