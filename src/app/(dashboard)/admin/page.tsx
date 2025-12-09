'use client';

import React from 'react';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';
import { Status, STATUS_LABELS } from '@/lib/types';
import { StatsChart, PriorityChart, WeeklyChart, UserPerformanceChart } from '@/components/dashboard/charts';

export default function AdminDashboard() {
    const { user } = useAuth();
    const { tasks, users, categories, clients, assignments } = useData();

    // İstatistikler
    const getTasksByStatus = (status: Status) => tasks.filter((t) => t.status === status).length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    const overdueTasks = tasks
        .filter((t) => {
            if (!t.dueDate || t.status === 'TAMAMLANDI') return false;
            return new Date(t.dueDate) < today;
        })
        .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

    const upcomingTasks = tasks
        .filter((t) => {
            if (!t.dueDate || t.status === 'TAMAMLANDI') return false;
            const dueDate = new Date(t.dueDate);
            return dueDate >= today && dueDate <= weekFromNow;
        })
        .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

    const stats = [
        { label: 'Toplam İş', value: tasks.length, icon: '📋', color: 'blue' },
        { label: 'Kullanıcılar', value: users.length, icon: '👥', color: 'purple' },
        { label: 'Kategoriler', value: categories.length, icon: '📁', color: 'green' },
        { label: 'Müşteriler', value: clients.length, icon: '🏢', color: 'yellow' },
    ];

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short',
        });
    };

    const getAssigneesForTask = (taskId: string) => {
        const taskAssignments = assignments.filter((a) => a.taskId === taskId);
        return taskAssignments.map((a) => users.find((u) => u.id === a.userId)?.name || '').join(', ');
    };

    return (
        <>
            <header className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">Hoş Geldiniz, {user?.name}</h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        * tuşuna basarak klavye kısayollarını görebilirsiniz
                    </p>
                </div>
            </header>

            <div className="page-body">
                {/* Stats */}
                <div className="stats-grid">
                    {stats.map((stat) => (
                        <div key={stat.label} className="stat-card">
                            <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
                            <div className="stat-content">
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <StatsChart />
                    <PriorityChart />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <WeeklyChart />
                    <UserPerformanceChart />
                </div>

                {/* Lists */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    {/* Gecikmiş İşler */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">🚨 Gecikmiş İşler ({overdueTasks.length})</h3>
                        </div>
                        <div className="card-body">
                            {overdueTasks.length === 0 ? (
                                <p className="text-muted text-center">Gecikmiş iş yok 🎉</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {overdueTasks.slice(0, 5).map((task) => (
                                        <div
                                            key={task.id}
                                            style={{
                                                padding: '0.75rem',
                                                background: 'var(--bg-tertiary)',
                                                borderRadius: '0.5rem',
                                                borderLeft: '3px solid var(--error)',
                                            }}
                                        >
                                            <div style={{ fontWeight: 500, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{task.title}</div>
                                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                                Son tarih: {formatDate(task.dueDate!)} • {getAssigneesForTask(task.id) || 'Atanmamış'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Yaklaşan İşler */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">📅 Bu Hafta Bitecek İşler ({upcomingTasks.length})</h3>
                        </div>
                        <div className="card-body">
                            {upcomingTasks.length === 0 ? (
                                <p className="text-muted text-center">Yaklaşan iş yok</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {upcomingTasks.slice(0, 5).map((task) => (
                                        <div
                                            key={task.id}
                                            style={{
                                                padding: '0.75rem',
                                                background: 'var(--bg-tertiary)',
                                                borderRadius: '0.5rem',
                                                borderLeft: '3px solid var(--primary-500)',
                                            }}
                                        >
                                            <div style={{ fontWeight: 500, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{task.title}</div>
                                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                                Son tarih: {formatDate(task.dueDate!)} •{' '}
                                                <span className={`badge badge-${task.status.toLowerCase()}`}>
                                                    {STATUS_LABELS[task.status]}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
