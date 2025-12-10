'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Role } from './types';

import { PERMISSIONS } from './constants';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    permissions: typeof PERMISSIONS.ADMIN | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'task-tracker-auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        if (typeof window === 'undefined') return null; // Server-side rendering check
        try {
            const stored = sessionStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            console.error('Auth data parse error:', e);
            sessionStorage.removeItem(STORAGE_KEY); // Clear bad data
            return null;
        }
    });
    const [isLoading, setIsLoading] = useState(true);

    // Set isLoading to false once the initial user state is determined
    useEffect(() => {
        setIsLoading(false);
    }, []); // Run once on mount

    // This effect can be used for other side effects related to user changes,
    // like token validation or syncing with other parts of the app.
    // The initial load is now handled by useState's lazy initializer.
    useEffect(() => {
        if (user) {
            // Optional: perform token validation or other user-related side effects
            // For example, if the user object contains a token, you might validate it here.
        }
    }, [user]);


    const login = useCallback(async (username: string, password: string): Promise<boolean> => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
                sessionStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        sessionStorage.removeItem(STORAGE_KEY);
    }, []);

    const permissions = user ? PERMISSIONS[user.role] : null;

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, permissions }}>
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

// Rol kontrolü hook'u
export function useRole() {
    const { user } = useAuth();

    const isAdmin = user?.role === 'ADMIN';
    const isTeamLead = user?.role === 'TEAM_LEAD';
    const isAccountant = user?.role === 'ACCOUNTANT';
    const isIntern = user?.role === 'INTERN';

    const hasRole = (roles: Role[]) => user ? roles.includes(user.role) : false;

    return { isAdmin, isTeamLead, isAccountant, isIntern, hasRole, role: user?.role };
}
