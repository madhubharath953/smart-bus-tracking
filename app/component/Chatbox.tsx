"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, MoreVertical, Bot, User } from 'lucide-react';

export default function ChatBot() {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        { id: 1, sender: 'student', text: 'Is the bus reaching soon?' },
        { id: 2, sender: 'bot', text: 'The bus will arrive in about 8 minutes.' },
        { id: 3, sender: 'driver', text: 'Almost there, 5 minutes away.' }
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = () => {
        if (message.trim()) {
            const studentMessage = {
                id: messages.length + 1,
                sender: 'student',
                text: message
            };

            setMessages(prev => [...prev, studentMessage]);

            const botReply = getBotReply(message);
            if (botReply) {
                setTimeout(() => {
                    setMessages(prev => [...prev, {
                        id: prev.length + 1,
                        sender: 'bot',
                        text: botReply
                    }]);
                }, 1000);
            }

            setMessage('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    function getBotReply(message: string) {
        const msg = message.toLowerCase();

        if (msg.includes("where")) {
            return "The bus is currently near the college gate.";
        }

        if (msg.includes("late")) {
            return "The bus will arrive in approximately 10 minutes.";
        }

        if (msg.includes("started")) {
            return "Yes, the bus has started from the depot.";
        }

        return null; // send to driver
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col w-80 sm:w-96 h-[500px] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-800 text-white rounded-t-lg">
                <h3 className="font-bold text-lg">Chat with Driver</h3>
                <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-gray-50">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`${msg.sender === 'student'
                                ? 'bg-blue-600 text-white'
                                : msg.sender === 'driver'
                                    ? 'bg-yellow-400 text-gray-800'
                                    : 'bg-gray-200 text-gray-800'
                                } max-w-xs rounded-lg p-3 shadow-sm`}
                        >
                            {msg.sender !== 'student' && (
                                <div className="flex items-center gap-2 mb-1">
                                    {msg.sender === 'bot' ? (
                                        <Bot className="w-4 h-4" />
                                    ) : (
                                        <User className="w-4 h-4" />
                                    )}
                                    <p className="text-xs font-semibold">
                                        {msg.sender === 'bot' ? 'Bot' : 'Driver'}
                                    </p>
                                </div>
                            )}
                            <p className="text-sm">{msg.text}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
                <div className="flex gap-2 text-black">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                        onClick={handleSendMessage}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <Send className="w-4 h-4" />
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}