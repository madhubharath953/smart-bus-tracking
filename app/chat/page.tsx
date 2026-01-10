"use client"

import React from 'react';

export default function ChatPage() {
    return (
        <div className="flex flex-col h-full bg-gray-50 p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Chat with Driver</h1>
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Private Messaging</h2>
                <p className="text-gray-600 max-w-md">
                    Use the floating chat bubble in the bottom right corner to communicate with the driver or our AI assistant. This page will eventually house more detailed chat history and settings.
                </p>
            </div>
        </div>
    );
}
