'use client';

import React from 'react';
import { useData } from '@/lib/data-context';
import { STATUS_LABELS, PRIORITY_LABELS, Status, Priority } from '@/lib/types';

export function StatsChart() {
    const { tasks } = useData();

    const statusCounts = {
        SIRADA: tasks.filter((t) => t.status === 'SIRADA').length,
        CALISILIYOR: tasks.filter((t) => t.status === 'CALISILIYOR').length,
        KONTROLDE: tasks.filter((t) => t.status === 'KONTROLDE').length,
        TAMAMLANDI: tasks.filter((t) => t.status === 'TAMAMLANDI').length,
    };

    const total = tasks.length || 1;
    const maxCount = Math.max(...Object.values(statusCounts), 1);

    const statusColors: Record<Status, string> = {
        SIRADA: '#f59e0b',
        CALISILIYOR: '#3b82f6',
        KONTROLDE: '#8b5cf6',
        TAMAMLANDI: '#10b981',
    };

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">📊 Durum Dağılımı</h3>
            </div>
            <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {(Object.keys(statusCounts) as Status[]).map((status) => {
                        const count = statusCounts[status];
                        const percentage = Math.round((count / total) * 100);
                        const barWidth = (count / maxCount) * 100;

                        return (
                            <div key={status}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{STATUS_LABELS[status]}</span>
                                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{count} ({percentage}%)</span>
                                </div>
                                <div style={{ height: '12px', background: 'var(--bg-tertiary)', borderRadius: '6px', overflow: 'hidden' }}>
                                    <div
                                        style={{
                                            height: '100%',
                                            width: `${barWidth}%`,
                                            background: statusColors[status],
                                            borderRadius: '6px',
                                            transition: 'width 0.5s ease',
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export function PriorityChart() {
    const { tasks } = useData();

    const priorityCounts = {
        LOW: tasks.filter((t) => t.priority === 'LOW').length,
        MEDIUM: tasks.filter((t) => t.priority === 'MEDIUM').length,
        HIGH: tasks.filter((t) => t.priority === 'HIGH').length,
        URGENT: tasks.filter((t) => t.priority === 'URGENT').length,
    };

    const total = tasks.length || 1;

    const priorityColors: Record<Priority, string> = {
        LOW: '#6b7280',
        MEDIUM: '#3b82f6',
        HIGH: '#f59e0b',
        URGENT: '#ef4444',
    };

    // Pie chart using CSS conic-gradient
    const segments: string[] = [];
    let currentAngle = 0;

    (Object.keys(priorityCounts) as Priority[]).forEach((priority) => {
        const count = priorityCounts[priority];
        const percentage = (count / total) * 100;
        const endAngle = currentAngle + (percentage * 3.6); // 360 / 100 = 3.6
        segments.push(`${priorityColors[priority]} ${currentAngle}deg ${endAngle}deg`);
        currentAngle = endAngle;
    });

    const pieGradient = `conic-gradient(${segments.join(', ')})`;

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">📈 Öncelik Dağılımı</h3>
            </div>
            <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    {/* Pie Chart */}
                    <div
                        style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            background: pieGradient,
                            flexShrink: 0,
                        }}
                    />

                    {/* Legend */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {(Object.keys(priorityCounts) as Priority[]).map((priority) => {
                            const count = priorityCounts[priority];
                            const percentage = Math.round((count / total) * 100);

                            return (
                                <div key={priority} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div
                                        style={{
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '3px',
                                            background: priorityColors[priority],
                                        }}
                                    />
                                    <span style={{ fontSize: '0.8125rem' }}>
                                        {PRIORITY_LABELS[priority]}: {count} ({percentage}%)
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function WeeklyChart() {
    const { tasks, statusLogs } = useData();

    // Son 7 günün tamamlanan iş sayıları
    const days = [];
    const dayNames = ['Pzr', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        // O gün tamamlandı durumuna geçen işler
        const completedCount = statusLogs.filter((log) => {
            const logDate = new Date(log.changedAt);
            return log.newStatus === 'TAMAMLANDI' && logDate >= date && logDate < nextDate;
        }).length;

        days.push({
            label: dayNames[date.getDay()],
            value: completedCount,
            isToday: i === 0,
        });
    }

    const maxValue = Math.max(...days.map((d) => d.value), 1);

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">📅 Haftalık Tamamlanan İşler</h3>
            </div>
            <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '120px', gap: '0.5rem' }}>
                    {days.map((day, index) => {
                        const barHeight = (day.value / maxValue) * 100;
                        return (
                            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                    {day.value}
                                </span>
                                <div
                                    style={{
                                        width: '100%',
                                        maxWidth: '40px',
                                        height: `${Math.max(barHeight, 5)}%`,
                                        background: day.isToday
                                            ? 'linear-gradient(180deg, var(--primary-500), var(--primary-600))'
                                            : 'var(--primary-200)',
                                        borderRadius: '4px 4px 0 0',
                                        transition: 'height 0.5s ease',
                                    }}
                                />
                                <span
                                    style={{
                                        fontSize: '0.75rem',
                                        marginTop: '0.5rem',
                                        fontWeight: day.isToday ? 600 : 400,
                                        color: day.isToday ? 'var(--primary-600)' : 'var(--text-muted)',
                                    }}
                                >
                                    {day.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export function UserPerformanceChart() {
    const { tasks, assignments, users, statusLogs } = useData();

    // Son 30 günde kullanıcı bazlı tamamlanan iş sayıları
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userStats = users
        .filter((u) => u.role !== 'ADMIN')
        .map((user) => {
            const completedCount = statusLogs.filter((log) => {
                const logDate = new Date(log.changedAt);
                return (
                    log.newStatus === 'TAMAMLANDI' &&
                    log.changedById === user.id &&
                    logDate >= thirtyDaysAgo
                );
            }).length;

            const assignedCount = assignments.filter((a) => a.userId === user.id).length;

            return {
                name: user.name,
                completed: completedCount,
                assigned: assignedCount,
            };
        })
        .sort((a, b) => b.completed - a.completed);

    const maxCompleted = Math.max(...userStats.map((s) => s.completed), 1);

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">👥 Kullanıcı Performansı (Son 30 Gün)</h3>
            </div>
            <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {userStats.slice(0, 5).map((stat) => {
                        const barWidth = (stat.completed / maxCompleted) * 100;
                        return (
                            <div key={stat.name}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{stat.name}</span>
                                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                        {stat.completed} tamamlandı / {stat.assigned} atandı
                                    </span>
                                </div>
                                <div style={{ height: '10px', background: 'var(--bg-tertiary)', borderRadius: '5px', overflow: 'hidden' }}>
                                    <div
                                        style={{
                                            height: '100%',
                                            width: `${barWidth}%`,
                                            background: 'linear-gradient(90deg, var(--success), #34d399)',
                                            borderRadius: '5px',
                                            transition: 'width 0.5s ease',
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
