'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';
import { NOTIFICATION_LABELS, Status, STATUS_LABELS } from '@/lib/types';
import { useRouter } from 'next/navigation';

export function NotificationBell() {
    const router = useRouter();
    const { user } = useAuth();
    const {
        notifications,
        getUnreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        getTaskById
    } = useData();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = getUnreadNotificationCount();
    const myNotifications = notifications
        .filter((n) => n.userId === user?.id)
        .slice(0, 10);

    // Dışarı tıklandığında kapat
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = (notification: typeof myNotifications[0]) => {
        markNotificationAsRead(notification.id);
        if (notification.taskId) {
            // İşe git (rol bazlı)
            if (user?.role === 'ADMIN') {
                router.push('/admin/tasks');
            } else if (user?.role === 'TEAM_LEAD') {
                router.push('/team-lead/tasks');
            } else {
                router.push('/employee');
            }
        }
        setIsOpen(false);
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Şimdi';
        if (minutes < 60) return `${minutes} dk önce`;
        if (hours < 24) return `${hours} saat önce`;
        return `${days} gün önce`;
    };

    const getNotificationIcon = (type: typeof myNotifications[0]['type']) => {
        switch (type) {
            case 'TASK_ASSIGNED': return '📋';
            case 'STATUS_CHANGED': return '🔄';
            case 'COMMENT_ADDED': return '💬';
            case 'DUE_DATE_NEAR': return '⏰';
            case 'TASK_OVERDUE': return '🚨';
            case 'SUBTASK_COMPLETED': return '✅';
            default: return '🔔';
        }
    };

    const handleMarkAllRead = () => {
        markAllNotificationsAsRead();
        // opsiyonel: soundEngine.playSuccess();
    };

    const handleClearAll = () => {
        // Tüm bildirimleri sil (veritabanından silmek isterseniz context'e fonksiyon eklemeniz gerekir, 
        // şimdilik sadece okundu yapalım veya tek tek silelim. 
        // Mevcut yapıda 'deleteAllNotifications' yok, bu yüzden sadece okundu işaretliyoruz.)
        markAllNotificationsAsRead();
    };

    return (
        <div className="notification-bell" ref={dropdownRef}>
            <button
                className="notification-bell-btn relative"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Bildirimler"
            >
                <div style={{ fontSize: '1.25rem' }}>🔔</div>
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Bildirimler</h4>
                        </div>
                    </div>

                    <div className="notification-list custom-scrollbar">
                        {myNotifications.length === 0 ? (
                            <div className="notification-empty">
                                <span style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block' }}>🔕</span>
                                <p style={{ color: 'var(--text-secondary)' }}>Okunmamış bildirim yok</p>
                            </div>
                        ) : (
                            myNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="notification-icon-wrapper">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="notification-content">
                                        <div className="flex justify-between items-start">
                                            <p className="notification-title">{notification.title}</p>
                                            <span className="notification-time">{formatTime(notification.createdAt)}</span>
                                        </div>
                                        <p className="notification-message">{notification.message}</p>
                                    </div>
                                    <button
                                        className="notification-delete"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteNotification(notification.id);
                                        }}
                                        title="Sil"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
