'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { DataProvider } from '@/lib/data-context';
import { Sidebar } from '@/components/layout/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="loading-overlay">
                <div className="spinner" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <DataProvider>
            <div className="dashboard-layout">
                <Sidebar />
                <main className="main-content">{children}</main>
            </div>
        </DataProvider>
    );
}
