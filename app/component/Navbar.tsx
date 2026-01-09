// components/Navbar.tsx
'use client';

import { useState } from 'react';
import { Bell, ChevronDown, User, Settings, LogOut, Menu, X } from 'lucide-react';

interface NavbarProps {
  userName?: string;
  userRole?: string;
}

export default function Navbar({ userName = 'John Doe', userRole = 'Student' }: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const notifications = [
    { id: 1, message: 'Bus BUS 102 is 5 minutes away', time: '2 mins ago', unread: true },
    { id: 2, message: 'Route changed for tomorrow', time: '1 hour ago', unread: true },
    { id: 3, message: 'Driver update: Traffic delay expected', time: '3 hours ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Smart College Bus Tracking System
              </h1>
              <p className="text-sm text-gray-600 mt-1">Welcome, {userName}</p>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-4">
            {/* Quick Actions - Desktop */}
            <div className="hidden md:flex items-center gap-2">
              <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                Track Bus
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                Schedule
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                Routes
              </button>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell size={20} className="text-gray-700" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                      Mark all as read
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 ${
                          notif.unread ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${notif.unread ? 'bg-blue-600' : 'bg-gray-300'}`} />
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{notif.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-3 border-t border-gray-200 text-center">
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white font-semibold">
                  {userName.charAt(0)}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500">{userRole}</p>
                </div>
                <ChevronDown size={16} className="hidden md:block text-gray-500" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="font-semibold text-gray-900">{userName}</p>
                    <p className="text-sm text-gray-500">{userRole}</p>
                  </div>
                  <div className="py-2">
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                      <User size={16} />
                      <span>My Profile</span>
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                      <Settings size={16} />
                      <span>Settings</span>
                    </button>
                  </div>
                  <div className="border-t border-gray-200 py-2">
                    <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3">
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-col gap-2">
              <button className="px-4 py-2 text-left text-sm font-medium text-blue-600 bg-blue-50 rounded-lg">
                Track Bus
              </button>
              <button className="px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                Schedule
              </button>
              <button className="px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                Routes
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}


// Example usage in your page:
// 
// import Navbar from '@/components/Navbar';
// 
// export default function BusTrackerPage() {
//   return (
//     <div>
//       <Navbar userName="John Doe" userRole="Student" />
//       {/* Rest of your page content */}
//     </div>
// }