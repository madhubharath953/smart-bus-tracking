"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Bus, MessageCircle, LayoutDashboard, Shield, LogOut, Settings, HelpCircle } from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const navItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Student Dashboard', href: '/dashboard', roles: ['student', 'admin'] },
        { id: 'chat', icon: MessageCircle, label: 'Chat with Driver', href: '/chat', roles: ['student', 'admin'] },
        { id: 'admin', icon: Shield, label: 'Admin Panel', href: '/admin', roles: ['admin'] }
    ].filter(item => item.roles.includes(user?.role || 'student'));

    const secondaryItems = [
        { id: 'settings', icon: Settings, label: 'Settings', href: '#' },
        { id: 'help', icon: HelpCircle, label: 'Help Center', href: '#' }
    ];

    return (
        <div className="w-80 bg-slate-900 text-slate-300 flex flex-col h-screen border-r border-slate-800 relative z-40">
            {/* Header */}
            <div className="p-8">
                <Link href="/" className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                        <Bus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tight">Smart Bus</h1>
                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Transit System</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 px-4 py-4 space-y-8 overflow-y-auto">
                <nav className="space-y-1">
                    <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Main Menu</p>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                                    : 'hover:bg-slate-800 text-slate-400 hover:text-slate-100'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-blue-500' : 'text-slate-500 group-hover:text-slate-300'}`} />
                                <span className="font-bold text-sm tracking-tight">{item.label}</span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <nav className="space-y-1">
                    <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Account</p>
                    {secondaryItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-all duration-200"
                            >
                                <Icon className="w-5 h-5 text-slate-500 group-hover:text-slate-300 transition-transform group-hover:scale-110" />
                                <span className="font-bold text-sm tracking-tight">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* User Profile / Logout Section */}
            <div className="p-4 mt-auto border-t border-slate-800/50">
                <div className="bg-slate-800/30 p-4 rounded-2xl flex flex-col gap-4 border border-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500 rounded-full border-2 border-indigo-400/20 flex items-center justify-center text-white font-black shadow-lg uppercase">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user?.name || 'User'}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{user?.role || 'Guest'}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => logout()}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl transition-all duration-200 text-sm font-black"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}
