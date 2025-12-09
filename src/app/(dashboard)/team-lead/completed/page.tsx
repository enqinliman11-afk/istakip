'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/lib/data-context';
import { Task, STATUS_LABELS } from '@/lib/types';
import { formatDate, formatDateTime, calculateDuration } from '@/lib/date-utils';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { StatusBadge, PriorityBadge } from '@/components/ui/badge';

export default function TeamLeadCompletedTasksPage() {
    const {
        tasks,
        categories,
        clients,
        statusLogs,
        getCategoryById,
        getClientById,
        getUserById,
        getTaskAssignees,
        getTaskLogs,
    } = useData();

    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [filters, setFilters] = useState({
        category: '',
        client: '',
        search: '',
        dateRange: 'all',
    });

    // Sadece tamamlanan işler
    const completedTasks = useMemo(() => {
        return tasks
            .filter((task) => task.status === 'TAMAMLANDI')
            .map((task) => {
                const logs = statusLogs.filter((log) => log.taskId === task.id);
                const completionLog = logs.find((log) => log.newStatus === 'TAMAMLANDI');
                const completionDate = completionLog?.changedAt;
                return { ...task, completionDate };
            })
            .sort((a, b) => {
                if (!a.completionDate || !b.completionDate) return 0;
                return new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime();
            });
    }, [tasks, statusLogs]);

    // Filtrele
    const filteredTasks = useMemo(() => {
        return completedTasks.filter((task) => {
            if (filters.category && task.categoryId !== filters.category) return false;
            if (filters.client && task.clientId !== filters.client) return false;
            if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) return false;

            if (filters.dateRange !== 'all' && task.completionDate) {
                const completionDate = new Date(task.completionDate);
                const now = new Date();
                if (filters.dateRange === 'week') {
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    if (completionDate < weekAgo) return false;
                } else if (filters.dateRange === 'month') {
                    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    if (completionDate < monthAgo) return false;
                }
            }

            return true;
        });
    }, [completedTasks, filters]);

    const categoryOptions = [
        { value: '', label: 'Tüm Kategoriler' },
        ...categories.map((c) => ({ value: c.id, label: c.name })),
    ];

    const clientOptions = [
        { value: '', label: 'Tüm Müşteriler' },
        ...clients.map((c) => ({ value: c.id, label: c.name })),
    ];

    return (
        <>
            <header className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">✅ Tamamlanan İşler</h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        Toplam {filteredTasks.length} tamamlanmış iş
                    </p>
                </div>
            </header>

            <div className="page-body">
                {/* Filtreler */}
                <div className="filter-bar">
                    <div className="filter-group">
                        <label className="filter-label">Ara</label>
                        <input
                            type="text"
                            className="filter-input"
                            placeholder="İş başlığı..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">Tarih Aralığı</label>
                        <select
                            className="filter-input"
                            value={filters.dateRange}
                            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                        >
                            <option value="all">Tümü</option>
                            <option value="week">Son 7 Gün</option>
                            <option value="month">Son 30 Gün</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">Kategori</label>
                        <select
                            className="filter-input"
                            value={filters.category}
                            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        >
                            {categoryOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">Müşteri</label>
                        <select
                            className="filter-input"
                            value={filters.client}
                            onChange={(e) => setFilters({ ...filters, client: e.target.value })}
                        >
                            {clientOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* İş Listesi */}
                {filteredTasks.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">✅</div>
                        <h3 className="empty-state-title">Tamamlanan iş bulunamadı</h3>
                        <p className="empty-state-text">Filtreleri değiştirmeyi deneyin.</p>
                    </div>
                ) : (
                    <div className="task-grid">
                        {filteredTasks.map((task) => {
                            const assignees = getTaskAssignees(task.id);
                            const workDuration = calculateDuration(task.startTime, task.endTime);

                            return (
                                <div
                                    key={task.id}
                                    className="task-card"
                                    style={{ borderLeft: '4px solid var(--success)' }}
                                    onClick={() => setSelectedTask(task)}
                                >
                                    <div className="task-card-header">
                                        <h4 className="task-card-title">{task.title}</h4>
                                        <PriorityBadge priority={task.priority} />
                                    </div>

                                    <div className="task-card-meta">
                                        <StatusBadge status={task.status} />
                                        <span className="badge badge-role">{getCategoryById(task.categoryId)?.name}</span>
                                    </div>

                                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                        {getClientById(task.clientId)?.name}
                                    </p>

                                    {/* Çalışma Süresi */}
                                    {(task.startTime && task.endTime) && (
                                        <div style={{
                                            padding: '0.5rem',
                                            background: 'var(--bg-tertiary)',
                                            borderRadius: '0.5rem',
                                            marginBottom: '0.75rem'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span>⏱️</span>
                                                <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                                    {workDuration}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="task-card-footer">
                                        <div className="task-card-assignees">
                                            {assignees.slice(0, 3).map((u) => (
                                                <div key={u.id} className="task-card-avatar" title={u.name}>
                                                    {u.name.charAt(0)}
                                                </div>
                                            ))}
                                            {assignees.length > 3 && (
                                                <div className="task-card-avatar">+{assignees.length - 3}</div>
                                            )}
                                        </div>
                                        {task.completionDate && (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>
                                                ✓ {formatDate(task.completionDate)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Detay Modal */}
            <Modal
                isOpen={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                title="Tamamlanan İş Detayı"
                size="lg"
                footer={<Button variant="secondary" onClick={() => setSelectedTask(null)}>Kapat</Button>}
            >
                {selectedTask && (
                    <div>
                        <h3 style={{ marginBottom: '0.5rem' }}>{selectedTask.title}</h3>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <StatusBadge status={selectedTask.status} />
                            <PriorityBadge priority={selectedTask.priority} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Müşteri</span>
                                <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{getClientById(selectedTask.clientId)?.name}</p>
                            </div>
                            <div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Kategori</span>
                                <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{getCategoryById(selectedTask.categoryId)?.name}</p>
                            </div>
                            <div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Son Tarih</span>
                                <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{selectedTask.dueDate ? formatDate(selectedTask.dueDate) : '-'}</p>
                            </div>
                            <div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tamamlanma</span>
                                <p style={{ fontWeight: 500, color: 'var(--success)' }}>
                                    {(selectedTask as any).completionDate ? formatDateTime((selectedTask as any).completionDate) : '-'}
                                </p>
                            </div>
                        </div>

                        {/* Çalışma Süresi */}
                        {(selectedTask.startTime || selectedTask.endTime) && (
                            <div style={{
                                marginBottom: '1.5rem',
                                padding: '1rem',
                                background: 'var(--bg-tertiary)',
                                borderRadius: '0.75rem',
                                border: '1px solid var(--border-color)'
                            }}>
                                <h4 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    ⏱️ Çalışma Süresi
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Başlangıç</span>
                                        <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                                            {selectedTask.startTime ? formatDateTime(selectedTask.startTime) : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bitiş</span>
                                        <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                                            {selectedTask.endTime ? formatDateTime(selectedTask.endTime) : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Toplam</span>
                                        <p style={{ fontWeight: 600, color: 'var(--primary-500)' }}>
                                            {calculateDuration(selectedTask.startTime, selectedTask.endTime)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Atanan Kişiler */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ marginBottom: '0.75rem' }}>Atanan Kişiler</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {getTaskAssignees(selectedTask.id).map((u) => (
                                    <span
                                        key={u.id}
                                        style={{
                                            padding: '0.5rem 0.75rem',
                                            background: 'var(--bg-tertiary)',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem',
                                            color: 'var(--text-primary)'
                                        }}
                                    >
                                        {u.name}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Durum Geçmişi */}
                        <div>
                            <h4 style={{ marginBottom: '0.75rem' }}>Durum Geçmişi</h4>
                            <div className="status-log">
                                {getTaskLogs(selectedTask.id).map((log) => (
                                    <div key={log.id} className="log-item">
                                        <div className="log-icon">📝</div>
                                        <div className="log-content">
                                            <div className="log-title">{STATUS_LABELS[log.oldStatus]} → {STATUS_LABELS[log.newStatus]}</div>
                                            <div className="log-meta">{getUserById(log.changedById)?.name} • {formatDateTime(log.changedAt)}</div>
                                            {log.note && <div className="log-note">{log.note}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
}
