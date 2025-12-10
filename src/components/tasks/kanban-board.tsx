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

    // Ghost element for touch dragging
    const ghostRef = React.useRef<HTMLElement | null>(null);

    const getTasksByStatus = (status: Status) => {
        return tasks.filter((t) => t.status === status);
    };

    // Standard Drag and Drop (Mouse)
    const handleDragStart = (e: React.DragEvent, task: Task) => {
        setDraggedTask(task);
        e.dataTransfer.effectAllowed = 'move';
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
            if (onStatusChange) {
                onStatusChange(draggedTask, newStatus);
            } else {
                const success = changeTaskStatus(draggedTask.id, newStatus);
                if (!success) {
                    alert('Bu durum geçişini yapma yetkiniz yok.');
                }
            }
        }
        setDraggedTask(null);
    };

    // Touch Support (Tablet/Mobile)
    const handleTouchStart = (e: React.TouchEvent, task: Task) => {
        // Prevent scrolling immediately might be annoying if accidental, 
        // but essential for dragging. We'll handle it in Move.
        const touch = e.touches[0];
        const target = e.currentTarget as HTMLElement;

        setDraggedTask(task);

        // Create ghost element for visual feedback
        const ghost = target.cloneNode(true) as HTMLElement;
        ghost.style.position = 'fixed';
        ghost.style.pointerEvents = 'none'; // Allow finding element below
        ghost.style.zIndex = '9999';
        ghost.style.opacity = '0.9';
        ghost.style.width = `${target.offsetWidth}px`;
        ghost.style.height = `${target.offsetHeight}px`;
        ghost.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
        ghost.style.left = `${touch.clientX}px`;
        ghost.style.top = `${touch.clientY}px`;
        ghost.style.transform = 'translate(-50%, -50%) rotate(3deg)';
        ghost.style.transition = 'none';

        document.body.appendChild(ghost);
        ghostRef.current = ghost;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!ghostRef.current) return;

        // Prevent default to stop scrolling while dragging
        if (e.cancelable) e.preventDefault();

        const touch = e.touches[0];
        ghostRef.current.style.left = `${touch.clientX}px`;
        ghostRef.current.style.top = `${touch.clientY}px`;

        // Check which column we are over
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        const column = element?.closest('.kanban-column');
        const statusStr = column?.getAttribute('data-status');

        if (statusStr) {
            setDragOverColumn(statusStr as Status);
        } else {
            setDragOverColumn(null);
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        // Remove ghost
        if (ghostRef.current) {
            document.body.removeChild(ghostRef.current);
            ghostRef.current = null;
        }

        const touch = e.changedTouches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        const column = element?.closest('.kanban-column');
        const newStatus = column?.getAttribute('data-status') as Status;

        if (newStatus && draggedTask && draggedTask.status !== newStatus) {
            if (onStatusChange) {
                onStatusChange(draggedTask, newStatus);
            } else {
                const success = changeTaskStatus(draggedTask.id, newStatus);
                if (!success) {
                    alert('Bu durum geçişini yapma yetkiniz yok.');
                }
            }
        }

        setDraggedTask(null);
        setDragOverColumn(null);
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
                                        onTouchStart={(e) => handleTouchStart(e, task)}
                                        onTouchMove={handleTouchMove}
                                        onTouchEnd={handleTouchEnd}
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
