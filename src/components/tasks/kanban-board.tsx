'use client';

import React, { useState } from 'react';
import { Task, Status, STATUS_LABELS } from '@/lib/types';
import { useData } from '@/lib/data-context';
import { formatDateShort, isOverdue } from '@/lib/date-utils';
import { PriorityBadge } from '@/components/ui/badge';

interface KanbanBoardProps {
    tasks: Task[];
    onTaskClick: (task: Task) => void;
    onStatusChange?: (task: Task, newStatus: Status) => void; // Zaman takibi için callback
}

const STATUSES: Status[] = ['SIRADA', 'CALISILIYOR', 'KONTROLDE', 'TAMAMLANDI'];

const STATUS_ICONS: Record<Status, string> = {
    SIRADA: '📥',
    CALISILIYOR: '⚡',
    KONTROLDE: '🔍',
    TAMAMLANDI: '✅',
};

export function KanbanBoard({ tasks, onTaskClick, onStatusChange }: KanbanBoardProps) {
    const { changeTaskStatus, getTaskAssignees, getCategoryById, getClientById, getTaskProgress } = useData();
    const [draggedTask, setDraggedTask] = useState<Task | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<Status | null>(null);

    const getTasksByStatus = (status: Status) => {
        return tasks.filter((t) => t.status === status);
    };

    const handleDragStart = (e: React.DragEvent, task: Task) => {
        setDraggedTask(task);
        e.dataTransfer.effectAllowed = 'move';
        // Add dragging class
        (e.target as HTMLElement).classList.add('dragging');
    };

    const handleDragEnd = (e: React.DragEvent) => {
        setDraggedTask(null);
        setDragOverColumn(null);
        (e.target as HTMLElement).classList.remove('dragging');
    };

    const handleDragOver = (e: React.DragEvent, status: Status) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverColumn(status);
    };

    const handleDragLeave = () => {
        setDragOverColumn(null);
    };

    const handleDrop = (e: React.DragEvent, newStatus: Status) => {
        e.preventDefault();
        setDragOverColumn(null);

        if (draggedTask && draggedTask.status !== newStatus) {
            // Eğer onStatusChange callback varsa, onu kullan (zaman takibi için)
            if (onStatusChange) {
                onStatusChange(draggedTask, newStatus);
            } else {
                // Yoksa direkt durum değiştir
                const success = changeTaskStatus(draggedTask.id, newStatus);
                if (!success) {
                    alert('Bu durum geçişini yapma yetkiniz yok.');
                }
            }
        }
        setDraggedTask(null);
    };

    return (
        <div className="kanban-board">
            {STATUSES.map((status) => {
                const columnTasks = getTasksByStatus(status);
                const isDragOver = dragOverColumn === status;

                return (
                    <div key={status} className="kanban-column" data-status={status}>
                        <div className="kanban-column-header">
                            <div className="kanban-column-title">
                                <span>{STATUS_ICONS[status]}</span>
                                <span>{STATUS_LABELS[status]}</span>
                            </div>
                            <span className="kanban-column-count">{columnTasks.length}</span>
                        </div>
                        <div
                            className={`kanban-column-body ${isDragOver ? 'drag-over' : ''}`}
                            onDragOver={(e) => handleDragOver(e, status)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, status)}
                        >
                            {columnTasks.map((task) => {
                                const assignees = getTaskAssignees(task.id);
                                const progress = getTaskProgress(task.id);

                                return (
                                    <div
                                        key={task.id}
                                        className="kanban-card"
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, task)}
                                        onDragEnd={handleDragEnd}
                                        onClick={() => onTaskClick(task)}
                                    >
                                        <h4 className="kanban-card-title">{task.title}</h4>
                                        <div className="kanban-card-meta">
                                            <PriorityBadge priority={task.priority} />
                                            <span className="badge badge-role">
                                                {getCategoryById(task.categoryId)?.name}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                            {getClientById(task.clientId)?.name}
                                        </p>

                                        {progress > 0 && (
                                            <div style={{ marginBottom: '0.5rem' }}>
                                                <div className="progress-bar">
                                                    <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                                                </div>
                                                <p className="progress-text">{progress}% tamamlandı</p>
                                            </div>
                                        )}

                                        <div className="kanban-card-footer">
                                            <div className="task-card-assignees">
                                                {assignees.slice(0, 2).map((u) => (
                                                    <div key={u.id} className="task-card-avatar" title={u.name}>
                                                        {u.name.charAt(0)}
                                                    </div>
                                                ))}
                                                {assignees.length > 2 && (
                                                    <div className="task-card-avatar">+{assignees.length - 2}</div>
                                                )}
                                            </div>
                                            {task.dueDate && (
                                                <span
                                                    className={`task-card-due ${isOverdue(task.dueDate) && task.status !== 'TAMAMLANDI' ? 'overdue' : ''
                                                        }`}
                                                >
                                                    📅 {formatDateShort(task.dueDate)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {columnTasks.length === 0 && (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <p style={{ fontSize: '0.8125rem' }}>İş yok</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
