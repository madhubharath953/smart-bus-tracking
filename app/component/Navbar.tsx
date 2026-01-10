// components/Navbar.tsx
'use client';

import { useState } from 'react';
import { Bell, ChevronDown, User, Settings, LogOut, Menu, X, Search, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const notifications = [
    { id: 1, message: 'Bus BUS 102 is 5 minutes away', time: '2 mins ago', unread: true },
    { id: 2, message: 'Route changed for tomorrow', time: '1 hour ago', unread: true },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <nav className="bg-white border-b border-slate-200/60 sticky top-0 z-50 backdrop-blur-md bg-white/80">
      <div className="px-8 h-20 flex items-center justify-between">
        {/* Left Section - Search or Context */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="hidden lg:flex items-center gap-3 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl w-80 group focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <Search size={18} className="text-slate-400 group-focus-within:text-blue-500" />
            <input
              type="text"
              placeholder="Search routes, buses..."
              className="bg-transparent border-none outline-none text-sm font-semibold text-slate-700 w-full placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 p-1 bg-slate-50 border border-slate-200 rounded-xl">
            <button className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-all">
              <Moon size={20} />
            </button>
            <div className="w-[1px] h-4 bg-slate-200" />

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                className={`p-2 transition-all rounded-lg ${showNotifications ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-blue-600 hover:bg-white'}`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full border-2 border-white" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">Notifications</h3>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-[10px] font-black uppercase tracking-tight">{unreadCount} New</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="px-5 py-4 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors"
                      >
                        <p className="text-sm font-bold text-slate-800 line-clamp-2">{notif.message}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{notif.time}</p>
                      </div>
                    ))}
                  </div>
                  <button className="w-full py-4 text-xs font-black text-blue-600 hover:bg-blue-50 transition-colors uppercase tracking-widest border-t border-slate-100">
                    View All Activity
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-3 p-1 hover:bg-slate-50 rounded-2xl transition-all group"
            >
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-black shadow-inner border border-indigo-200/50 group-hover:scale-105 transition-transform uppercase">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-4 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-6 py-5 bg-slate-50 border-b border-slate-100">
                  <p className="font-black text-slate-900 leading-tight">{user?.name || 'User'}</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{user?.role || 'Guest'}</p>
                </div>
                <div className="p-2">
                  <MenuButton icon={<User size={16} />} label="My Profile" />
                  <MenuButton icon={<Settings size={16} />} label="Settings" />
                  <div className="h-px bg-slate-100 my-2 mx-2" />
                  <button
                    onClick={() => logout()}
                    className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-3 font-bold transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Logout Account</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function MenuButton({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <button className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-3 font-bold transition-all hover:translate-x-1">
      <span className="text-slate-400 group-hover:text-blue-600 transition-colors">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
