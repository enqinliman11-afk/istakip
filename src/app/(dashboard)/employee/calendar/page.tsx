'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';
import { Task } from '@/lib/types';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { StatusBadge, PriorityBadge } from '@/components/ui/badge';

export default function EmployeeCalendarPage() {
    const { user } = useAuth();
    const { tasks, assignments, getCategoryById, getClientById } = useData();
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Sadece bana atanan AKTİF işler (tamamlanan hariç)
    const myActiveTasks = useMemo(() => {
        if (!user) return [];
        const myTaskIds = assignments.filter(a => a.userId === user.id).map(a => a.taskId);
        return tasks.filter(t => myTaskIds.includes(t.id) && t.status !== 'TAMAMLANDI');
    }, [tasks, assignments, user]);

    const calendarDays = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startPadding = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
        const days: (Date | null)[] = [];
        for (let i = 0; i < startPadding; i++) days.push(null);
        for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
        return days;
    }, [currentMonth]);

    const getTasksForDate = (date: Date) => {
        return myActiveTasks.filter(task => {
            if (!task.dueDate) return false;
            const dueDate = new Date(task.dueDate);
            return dueDate.getFullYear() === date.getFullYear() &&
                dueDate.getMonth() === date.getMonth() &&
                dueDate.getDate() === date.getDate();
        });
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];
    const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

    return (
        <>
            <header className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">📅 Takvimim</h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        İş deadline'larınızı takip edin
                    </p>
                </div>
            </header>

            <div className="page-body">
                <div className="card">
                    <div className="card-body">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <button className="btn btn-secondary" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>
                                ← Önceki
                            </button>
                            <h2 style={{ margin: 0 }}>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h2>
                            <button className="btn btn-secondary" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
                                Sonraki →
                            </button>
                        </div>

                        {/* Scroll container */}
                        <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
                            <div style={{ minWidth: '700px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    {dayNames.map(day => (
                                        <div key={day} style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)', padding: '0.5rem' }}>{day}</div>
                                    ))}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
                                    {calendarDays.map((day, index) => {
                                        if (!day) return <div key={`empty-${index}`} style={{ padding: '1rem' }} />;
                                        const dayTasks = getTasksForDate(day);
                                        const todayCheck = isToday(day);

                                        return (
                                            <div
                                                key={day.toISOString()}
                                                onClick={() => dayTasks.length > 0 && setSelectedDate(day)}
                                                style={{
                                                    padding: '0.75rem',
                                                    minHeight: '80px',
                                                    background: todayCheck ? 'var(--primary-100)' : 'var(--bg-secondary)',
                                                    borderRadius: '0.5rem',
                                                    cursor: dayTasks.length > 0 ? 'pointer' : 'default',
                                                    border: todayCheck ? '2px solid var(--primary-500)' : '1px solid var(--border-color)',
                                                }}
                                            >
                                                <div style={{ fontWeight: todayCheck ? 700 : 500, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{day.getDate()}</div>
                                                {dayTasks.slice(0, 2).map(task => (
                                                    <div key={task.id} style={{ fontSize: '0.7rem', padding: '2px 4px', background: 'var(--primary-500)', color: 'white', borderRadius: '3px', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {task.title}
                                                    </div>
                                                ))}
                                                {dayTasks.length > 2 && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>+{dayTasks.length - 2} daha</div>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={!!selectedDate && selectedDateTasks.length > 0}
                onClose={() => setSelectedDate(null)}
                title={selectedDate ? `${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}` : ''}
                size="md"
                footer={<Button variant="secondary" onClick={() => setSelectedDate(null)}>Kapat</Button>}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {selectedDateTasks.map(task => (
                        <div key={task.id} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem', borderLeft: '4px solid var(--primary-500)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <h4 style={{ margin: 0 }}>{task.title}</h4>
                                <StatusBadge status={task.status} />
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <PriorityBadge priority={task.priority} />
                                <span className="badge badge-role">{getCategoryById(task.categoryId)?.name}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{getClientById(task.clientId)?.name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </Modal>
        </>
    );
}
