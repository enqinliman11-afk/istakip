'use client';

import React, { useState, useMemo } from 'react';
import { Task } from '@/lib/types';
import { isToday } from '@/lib/date-utils';

interface CalendarViewProps {
    tasks: Task[];
    onTaskClick: (task: Task) => void;
}

const WEEKDAYS = ['Pzr', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
const MONTHS = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export function CalendarView({ tasks, onTaskClick }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const calendarDays = useMemo(() => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDay = firstDay.getDay();
        const daysInMonth = lastDay.getDate();

        const days: { date: Date; isCurrentMonth: boolean }[] = [];

        // Previous month days
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startDay - 1; i >= 0; i--) {
            days.push({
                date: new Date(year, month - 1, prevMonthLastDay - i),
                isCurrentMonth: false,
            });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                date: new Date(year, month, i),
                isCurrentMonth: true,
            });
        }

        // Next month days
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            days.push({
                date: new Date(year, month + 1, i),
                isCurrentMonth: false,
            });
        }

        return days;
    }, [year, month]);

    const getTasksForDate = (date: Date) => {
        return tasks.filter((task) => {
            // Tamamlanan işleri gösterme
            if (task.status === 'TAMAMLANDI') return false;
            if (!task.dueDate) return false;
            const taskDate = new Date(task.dueDate);
            return (
                taskDate.getDate() === date.getDate() &&
                taskDate.getMonth() === date.getMonth() &&
                taskDate.getFullYear() === date.getFullYear()
            );
        });
    };

    const goToPrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <div className="calendar-title">
                    {MONTHS[month]} {year}
                </div>
                <div className="calendar-nav">
                    <button className="calendar-nav-btn" onClick={goToPrevMonth}>
                        ◀
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={goToToday}>
                        Bugün
                    </button>
                    <button className="calendar-nav-btn" onClick={goToNextMonth}>
                        ▶
                    </button>
                </div>
            </div>

            <div className="calendar-grid">
                {WEEKDAYS.map((day) => (
                    <div key={day} className="calendar-weekday">
                        {day}
                    </div>
                ))}

                {calendarDays.map((day, index) => {
                    const dayTasks = getTasksForDate(day.date);
                    const dayIsToday = isToday(day.date);

                    return (
                        <div
                            key={index}
                            className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${dayIsToday ? 'today' : ''
                                }`}
                        >
                            <div className="calendar-day-number">{day.date.getDate()}</div>
                            {dayTasks.slice(0, 3).map((task) => (
                                <div
                                    key={task.id}
                                    className={`calendar-event priority-${task.priority.toLowerCase()}`}
                                    onClick={() => onTaskClick(task)}
                                    title={task.title}
                                >
                                    {task.title}
                                </div>
                            ))}
                            {dayTasks.length > 3 && (
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', paddingLeft: '0.5rem' }}>
                                    +{dayTasks.length - 3} daha
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
