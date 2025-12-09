'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, useRole } from '@/lib/auth-context';
import { ROLE_LABELS } from '@/lib/types';
import { NotificationBell } from '@/components/ui/notification-bell';
import { ThemeToggle } from '@/lib/theme-context';

interface NavItem {
    label: string;
    href: string;
    icon: string;
}

export function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { isAdmin, isTeamLead } = useRole();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    if (!user) return null;

    // Rol bazlı navigasyon menüsü
    const getNavItems = (): { section: string; items: NavItem[] }[] => {
        if (isAdmin) {
            return [
                {
                    section: 'Genel',
                    items: [
                        { label: 'Dashboard', href: '/admin', icon: '📊' },
                        { label: 'Tüm İşler', href: '/admin/tasks', icon: '📋' },
                        { label: 'Tamamlananlar', href: '/admin/completed', icon: '✅' },
                    ],
                },
                {
                    section: 'Yönetim',
                    items: [
                        { label: 'Kullanıcılar', href: '/admin/users', icon: '👥' },
                        { label: 'Kategoriler', href: '/admin/categories', icon: '📁' },
                        { label: 'Müşteriler', href: '/admin/clients', icon: '🏢' },
                        { label: 'Şablonlar', href: '/admin/templates', icon: '📄' },
                    ],
                },
            ];
        }

        if (isTeamLead) {
            return [
                {
                    section: 'Genel',
                    items: [
                        { label: 'Dashboard', href: '/team-lead', icon: '📊' },
                        { label: 'İş Listesi', href: '/team-lead/tasks', icon: '📋' },
                        { label: 'Takvim', href: '/team-lead/calendar', icon: '📅' },
                        { label: 'Tamamlananlar', href: '/team-lead/completed', icon: '✅' },
                        { label: 'Yeni İş Oluştur', href: '/team-lead/tasks/new', icon: '➕' },
                    ],
                },
            ];
        }

        // ACCOUNTANT veya INTERN
        return [
            {
                section: 'Genel',
                items: [
                    { label: 'Dashboard', href: '/employee', icon: '📊' },
                    { label: 'Takvim', href: '/employee/calendar', icon: '📅' },
                    { label: 'Tamamlananlar', href: '/employee/tasks', icon: '✅' },
                ],
            },
        ];
    };

    const navSections = getNavItems();

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

    return (
        <>
            {/* Mobile overlay */}
            <div
                className={`mobile-overlay ${isMobileOpen ? 'active' : ''}`}
                onClick={() => setIsMobileOpen(false)}
            />

            {/* Mobile menu button */}
            <button className="mobile-menu-btn" onClick={toggleMobile} style={{ position: 'fixed', top: '1rem', left: '1rem', zIndex: 101 }}>
                ☰
            </button>

            <aside className={`sidebar ${isMobileOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        <div className="sidebar-logo">📝</div>
                        <span className="sidebar-brand-text">İş Takip</span>
                    </div>
                    <div className="header-tools">
                        <ThemeToggle />
                        <NotificationBell />
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navSections.map((section) => (
                        <div key={section.section} className="nav-section">
                            <span className="nav-section-title">{section.section}</span>
                            {section.items.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`nav-item ${pathname === item.href ? 'active' : ''}`}
                                    onClick={() => setIsMobileOpen(false)}
                                >
                                    <span className="nav-item-icon">{item.icon}</span>
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-menu">
                        <div className="user-avatar">{getInitials(user.name)}</div>
                        <div className="user-info">
                            <div className="user-name">{user.name}</div>
                            <div className="user-role">{ROLE_LABELS[user.role]}</div>
                        </div>
                        <button className="logout-btn" onClick={logout} title="Çıkış Yap">
                            🚪
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
