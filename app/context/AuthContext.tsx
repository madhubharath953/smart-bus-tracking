"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    email: string;
    name: string;
    role: 'student' | 'admin';
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, role: 'student' | 'admin') => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Load user from localStorage on mount
        const savedUser = localStorage.getItem('bus_tracker_user');

        // Use setTimeout to avoid synchronous state updates in effect
        const timer = setTimeout(() => {
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
            setIsLoading(false);
        }, 0);

        return () => clearTimeout(timer);
    }, []);

    const login = (email: string, role: 'student' | 'admin') => {
        const newUser: User = {
            email,
            name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
            role
        };
        setUser(newUser);
        localStorage.setItem('bus_tracker_user', JSON.stringify(newUser));
        router.push('/dashboard');
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('bus_tracker_user');
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
