"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, MoreVertical, Bot, Paperclip, ShieldCheck, Zap, X } from 'lucide-react';
import { useBus } from '../context/BusContext';

export default function ChatBot() {
    const { allBuses } = useBus();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        { id: 1, sender: 'bot', text: "Hey there! I'm Transit AI, your campus transit mentor. I've got eyes on the whole fleet. Need help getting to class or tracking a bus?", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Calculate dynamic ETA for banner (from nearest moving bus)
    const activeMovingBus = allBuses.find(b => b.isSimulating && b.stats?.eta !== "N/A");
    const displayEta = activeMovingBus?.stats?.eta || "Fleet Active";

    // Visibility state
    const [isOpen, setIsOpen] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const [isLoading, setIsLoading] = useState(false);

    const handleSendMessage = async () => {
        if (message.trim() && !isLoading) {
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const studentMessage = {
                id: messages.length + 1,
                sender: 'student',
                text: message,
                time: time
            };

            setMessages(prev => [...prev, studentMessage]);
            const currentMessage = message;
            setMessage('');
            setIsLoading(true);

            // Simulation of AI and Driver responses
            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: currentMessage }),
                });

                if (!response.ok) {
                    throw new Error('API request failed');
                }

                const data = await response.json();

                setMessages(prev => [...prev, {
                    id: prev.length + 1,
                    sender: 'bot',
                    text: data.reply || "I'm processing your request. Please check the live map for the most accurate updates.",
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
            } catch {
                setMessages(prev => [...prev, {
                    id: prev.length + 1,
                    sender: 'bot',
                    text: "Connection lost. Please try again.",
                    time: time
                }]);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isLoading) {
            handleSendMessage();
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-blue-600 rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-700 hover:scale-110 active:scale-95 transition-all group"
            >
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-4 border-white flex items-center justify-center text-[10px] font-black text-white">2</div>
                <Bot className="w-8 h-8 text-white group-hover:rotate-12 transition-transform" />
            </button>
        );
    }

    return (
        <div
            className={`fixed bottom-6 right-6 z-50 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-200 flex flex-col w-80 h-[500px] overflow-hidden transition-all duration-500 ease-out transform scale-100 opacity-100`}
        >
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="font-black text-base tracking-tight">Transit AI</h3>
                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Always Active</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X size={18} className="text-slate-400" />
                    </button>
                    <button className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors">
                        <MoreVertical size={16} className="text-slate-400" />
                    </button>
                </div>
            </div>

            {/* AI Banner */}
            <div className="px-6 py-2 bg-blue-50/50 border-b border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShieldCheck size={12} className="text-blue-600" />
                    <span className="text-[9px] font-black text-blue-800 uppercase tracking-wider">Driver Verified</span>
                </div>
                <div className="flex items-center gap-2">
                    <Zap size={12} className="text-amber-500 fill-amber-500" />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">ETA: {displayEta}</span>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-slate-50/50">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.sender === 'student' ? 'items-end' : 'items-start'}`}>
                        <div
                            className={`${msg.sender === 'student'
                                ? 'bg-blue-600 text-white rounded-t-2xl rounded-bl-2xl shadow-md shadow-blue-500/10'
                                : msg.sender === 'driver'
                                    ? 'bg-amber-400 text-gray-800 rounded-t-2xl rounded-br-2xl shadow-md shadow-amber-500/10'
                                    : 'bg-white text-slate-800 border border-slate-200 rounded-t-2xl rounded-br-2xl shadow-sm'
                                } max-w-[90%] px-4 py-3 text-xs font-bold leading-relaxed`}
                        >
                            <div className="flex items-center gap-1.5 mb-1">
                                <p className="text-[9px] font-black uppercase tracking-[0.1em] opacity-60">
                                    {msg.sender === 'student' ? 'You (Student)' : msg.sender === 'bot' ? 'System Intel' : 'Fleet Driver'}
                                </p>
                            </div>
                            <p>{msg.text}</p>
                        </div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1.5 px-2">{msg.time}</span>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-slate-200 rounded-3xl px-6 py-4 shadow-sm">
                            <div className="flex gap-1.5">
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-slate-100">
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-1.5 rounded-[1.5rem] focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                    <button className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors">
                        <Paperclip size={18} />
                    </button>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                        placeholder="Ask anything..."
                        className="flex-1 bg-transparent border-none outline-none text-xs font-bold text-slate-700 placeholder:text-slate-400 uppercase tracking-tight"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={isLoading || !message.trim()}
                        className="bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:scale-95 flex items-center justify-center transform hover:scale-105 active:scale-95"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}