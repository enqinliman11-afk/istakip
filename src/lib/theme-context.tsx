'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    resolvedTheme: 'light' | 'dark';
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'task-tracker-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {

    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

    // Sistem temasını algıla
    const getSystemTheme = useCallback((): 'light' | 'dark' => {
        if (typeof window !== 'undefined') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    }, []);

    // Temayı uygula
    const applyTheme = useCallback((theme: Theme) => {
        const resolved = theme === 'system' ? getSystemTheme() : theme;
        setResolvedTheme(resolved);

        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', resolved);
            document.documentElement.classList.toggle('dark', resolved === 'dark');
        }
    }, [getSystemTheme]);

    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window === 'undefined') return 'system';
        const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
        return stored || 'system';
    });

    // İlk yükleme ve tema değişikliği
    useEffect(() => {
        applyTheme(theme);

        // Sistem teması değişikliğini dinle
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') {
                applyTheme('system');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [applyTheme, theme]);

    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem(STORAGE_KEY, newTheme);
        applyTheme(newTheme);
    }, [applyTheme]);

    const toggleTheme = useCallback(() => {
        const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    }, [resolvedTheme, setTheme]);

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

export function ThemeToggle() {
    const { resolvedTheme, toggleTheme } = useTheme();

    return (
        <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={resolvedTheme === 'light' ? 'Karanlık moda geç' : 'Aydınlık moda geç'}
            title={resolvedTheme === 'light' ? 'Karanlık Mod' : 'Aydınlık Mod'}
        >
            {resolvedTheme === 'light' ? '🌙' : '☀️'}
        </button>
    );
}
