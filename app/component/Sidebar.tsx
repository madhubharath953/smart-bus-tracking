"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bus, MessageCircle, User, LogOut } from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();

    const navItems = [
        { id: 'dashboard', icon: Bus, label: 'Student Dashboard', href: '/dashboard' },
        { id: 'chat', icon: MessageCircle, label: 'Chat with Driver', href: '/chat' },
        { id: 'admin', icon: User, label: 'Admin Panel', href: '/admin' }
    ];

    return (
        <div className="w-80 bg-gradient-to-b from-blue-600 to-blue-700 text-white flex flex-col h-screen">
            {/* Header */}
            <div className="p-6 border-b border-blue-500">
                <Link href="/" className="flex items-center gap-3 cursor-pointer">
                    <Bus className="w-8 h-8" />
                    <h1 className="text-xl font-bold">Smart Bus Tracker</h1>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${isActive ? 'bg-blue-800' : 'hover:bg-blue-600'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <button className="flex items-center gap-3 px-6 py-4 hover:bg-blue-600 transition-colors border-t border-blue-500">
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
            </button>
        </div>
    );
}
