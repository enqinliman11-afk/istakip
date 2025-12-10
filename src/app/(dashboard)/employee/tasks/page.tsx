'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';
import { Task, Status, STATUS_LABELS } from '@/lib/types';
import { getAvailableTransitions } from '@/lib/constants';
import { formatDate, formatDateTime, isOverdue, calculateDuration } from '@/lib/date-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { StatusBadge, PriorityBadge } from '@/components/ui/badge';
import { KanbanBoard } from '@/components/tasks/kanban-board';

type ViewMode = 'list' | 'kanban';

export default function EmployeeTasksPage() {
    const { user } = useAuth();
    const {
        tasks,
        categories,
        assignments,
        changeTaskStatus,
        getTaskLogs,
        getCategoryById,
        getClientById,
        getUserById,
        getTaskSubtasks,
        toggleSubtask,
        getTaskProgress,
        addComment,
        getTaskComments,
        getTaskAssignees,
    } = useData();

    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [statusNote, setStatusNote] = useState('');
    const [newCommentText, setNewCommentText] = useState('');
    const [activeTab, setActiveTab] = useState<'details' | 'subtasks' | 'comments' | 'history'>('details');
    const [filters, setFilters] = useState({
        status: '',
        category: '',
    });

    // Sadece bana atanan işler
    const myTaskIds = useMemo(() => {
        return assignments.filter((a) => a.userId === user?.id).map((a) => a.taskId);
    }, [assignments, user?.id]);

    const myTasks = useMemo(() => {
        return tasks.filter((t) => myTaskIds.includes(t.id));
    }, [tasks, myTaskIds]);

    // Tamamlanma tarihini bul (statusLogs'tan)
    const getCompletionDate = (taskId: string): Date => {
        const logs = getTaskLogs(taskId);
        const completionLog = logs.find((log) => log.newStatus === 'TAMAMLANDI');
        return completionLog ? new Date(completionLog.changedAt) : new Date(0);
    };

    // İşlerim sayfasında sadece tamamlanan işleri göster (en yeni en üstte)
    const completedTasks = useMemo(() => {
        return myTasks
            .filter((t) => t.status === 'TAMAMLANDI')
            .sort((a, b) => {
                // Tamamlanma tarihine göre sırala (en yeni en üstte)
                return getCompletionDate(b.id).getTime() - getCompletionDate(a.id).getTime();
            });
    }, [myTasks]);

    // Filtrelenmiş işler (tamamlanan, en son tamamlanan en üstte)
    const filteredTasks = useMemo(() => {
        return completedTasks
            .filter((task) => {
                if (filters.category && task.categoryId !== filters.category) return false;
                return true;
            })
            .sort((a, b) => {
                // Tamamlanma tarihine göre sırala (en son tamamlanan en üstte)
                if (!a.dueDate && !b.dueDate) return 0;
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
            });
    }, [completedTasks, filters]);

    const handleStatusChange = async (task: Task, newStatus: Status) => {
        const success = await changeTaskStatus(task.id, newStatus, statusNote || undefined);
        if (success) {
            setStatusNote('');
            setSelectedTask({ ...task, status: newStatus });
        } else {
            alert('Bu durum geçişi için yetkiniz yok.');
        }
    };

    const handleAddComment = () => {
        if (!selectedTask || !newCommentText.trim()) return;
        addComment(selectedTask.id, newCommentText.trim());
        setNewCommentText('');
    };

    const statusOptions = [
        { value: '', label: 'Tüm Durumlar' },
        ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })),
    ];

    const categoryOptions = [
        { value: '', label: 'Tüm Kategoriler' },
        ...categories.map((c) => ({ value: c.id, label: c.name })),
    ];

    const taskSubtasks = selectedTask ? getTaskSubtasks(selectedTask.id) : [];
    const taskComments = selectedTask ? getTaskComments(selectedTask.id) : [];
    const taskProgress = selectedTask ? getTaskProgress(selectedTask.id) : 0;

    return (
        <>
            <header className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">✅ Tamamlanan İşlerim</h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        {filteredTasks.length} tamamlanan iş
                    </p>
                </div>
            </header>

            <div className="page-body">
                {/* Filtreler */}
                <div className="filter-bar">
                    <div className="filter-group">
                        <label className="filter-label">Kategori</label>
                        <select className="filter-input" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
                            {categoryOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                        </select>
                    </div>
                </div>

                {/* Liste */}
                {filteredTasks.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">✅</div>
                        <h3 className="empty-state-title">Henüz tamamlanan iş yok</h3>
                        <p className="empty-state-text">Tamamladığınız işler burada görünecek.</p>
                    </div>
                ) : (
                    <div className="task-grid">
                        {filteredTasks.map((task) => {
                            const completionDate = getCompletionDate(task.id);
                            return (
                                <div key={task.id} className="task-card" onClick={() => setSelectedTask(task)} style={{ borderLeft: '3px solid var(--success)' }}>
                                    <div className="task-card-header">
                                        <h4 className="task-card-title">{task.title}</h4>
                                        <PriorityBadge priority={task.priority} />
                                    </div>
                                    <div className="task-card-meta">
                                        <span className="badge badge-tamamlandi">✓ Tamamlandı</span>
                                        <span className="badge badge-role">{getCategoryById(task.categoryId)?.name}</span>
                                    </div>
                                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{getClientById(task.clientId)?.name}</p>
                                    <div className="task-card-footer">
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            🗓️ Tamamlanma: {formatDateTime(completionDate.toISOString())}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* İş Detay Modal */}
            <Modal isOpen={!!selectedTask} onClose={() => { setSelectedTask(null); setActiveTab('details'); }} title="İş Detayı" size="lg"
                footer={<Button variant="secondary" onClick={() => { setSelectedTask(null); setActiveTab('details'); }}>Kapat</Button>}>
                {selectedTask && (
                    <div>
                        <h3 style={{ marginBottom: '0.5rem' }}>{selectedTask.title}</h3>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                            <StatusBadge status={selectedTask.status} />
                            <PriorityBadge priority={selectedTask.priority} />
                        </div>

                        {taskSubtasks.length > 0 && (
                            <div style={{ marginBottom: '1rem' }}>
                                <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${taskProgress}%` }} /></div>
                                <p className="progress-text">{taskProgress}% tamamlandı</p>
                            </div>
                        )}

                        <div className="tabs">
                            <button className={`tab ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>Detaylar</button>
                            <button className={`tab ${activeTab === 'subtasks' ? 'active' : ''}`} onClick={() => setActiveTab('subtasks')}>Alt Görevler ({taskSubtasks.length})</button>
                            <button className={`tab ${activeTab === 'comments' ? 'active' : ''}`} onClick={() => setActiveTab('comments')}>Yorumlar ({taskComments.length})</button>
                            <button className={`tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>Geçmiş</button>
                        </div>

                        {activeTab === 'details' && (
                            <div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Müşteri</span><p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{getClientById(selectedTask.clientId)?.name}</p></div>
                                    <div><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Kategori</span><p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{getCategoryById(selectedTask.categoryId)?.name}</p></div>
                                    <div><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dönem</span><p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{selectedTask.periodMonth && selectedTask.periodYear ? `${selectedTask.periodMonth}/${selectedTask.periodYear}` : '-'}</p></div>
                                    <div><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Son Tarih</span><p style={{ fontWeight: 500, color: isOverdue(selectedTask.dueDate) && selectedTask.status !== 'TAMAMLANDI' ? 'var(--error)' : 'var(--text-primary)' }}>{selectedTask.dueDate ? formatDate(selectedTask.dueDate) : '-'}</p></div>
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h4 style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Açıklama</h4>
                                    <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>{selectedTask.description || 'Açıklama yok'}</p>
                                </div>

                                {getAvailableTransitions(user!.role, selectedTask.status).length > 0 && (
                                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '0.75rem' }}>
                                        <h4 style={{ marginBottom: '0.75rem' }}>Durum Değiştir</h4>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                            {getAvailableTransitions(user!.role, selectedTask.status).map((status) => (<Button key={status} size="sm" variant="secondary" onClick={() => handleStatusChange(selectedTask, status)}>→ {STATUS_LABELS[status]}</Button>))}
                                        </div>
                                        <Input placeholder="Not ekle (opsiyonel)" value={statusNote} onChange={(e) => setStatusNote(e.target.value)} />
                                    </div>
                                )}

                                {selectedTask.status === 'KONTROLDE' && (
                                    <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
                                        <span className="alert-icon">ℹ️</span>
                                        <div className="alert-content">Bu iş kontrolde bekliyor. Tamamlandı olarak işaretleme yetkisi ekip şefine aittir.</div>
                                    </div>
                                )}

                                {/* Birlikte Çalışanlar */}
                                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '0.75rem' }}>
                                    <h4 style={{ marginBottom: '0.75rem' }}>👥 Birlikte Çalışanlar</h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {getTaskAssignees(selectedTask.id).map((assignee) => (
                                            <div
                                                key={assignee.id}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    padding: '0.5rem 0.75rem',
                                                    background: assignee.id === user?.id ? 'var(--primary-100)' : 'var(--bg-tertiary)',
                                                    borderRadius: '0.5rem',
                                                    border: assignee.id === user?.id ? '1px solid var(--primary-300)' : 'none',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: '28px',
                                                        height: '28px',
                                                        borderRadius: '50%',
                                                        background: 'var(--primary-500)',
                                                        color: 'white',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {assignee.name.charAt(0)}
                                                </div>
                                                <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                                                    {assignee.name}
                                                    {assignee.id === user?.id && <span style={{ color: 'var(--text-muted)', marginLeft: '0.25rem' }}>(Sen)</span>}
                                                </span>
                                            </div>
                                        ))}
                                        {getTaskAssignees(selectedTask.id).length === 0 && (
                                            <p className="text-muted">Henüz kimse atanmamış.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'subtasks' && (
                            <div className="subtask-list">
                                {taskSubtasks.map((subtask) => (
                                    <div key={subtask.id} className={`subtask-item ${subtask.isCompleted ? 'completed' : ''}`}>
                                        <input type="checkbox" className="subtask-checkbox" checked={subtask.isCompleted} onChange={() => toggleSubtask(subtask.id)} />
                                        <span className="subtask-title">{subtask.title}</span>
                                    </div>
                                ))}
                                {taskSubtasks.length === 0 && <p className="text-muted">Alt görev bulunmuyor.</p>}
                            </div>
                        )}

                        {activeTab === 'comments' && (
                            <div className="comments-section">
                                <div className="comment-list">
                                    {taskComments.map((comment) => {
                                        const commentUser = getUserById(comment.userId);
                                        return (
                                            <div key={comment.id} className="comment-item">
                                                <div className="comment-avatar">{commentUser?.name.charAt(0)}</div>
                                                <div className="comment-content">
                                                    <div className="comment-header"><span className="comment-author">{commentUser?.name}</span><span className="comment-time">{formatDateTime(comment.createdAt)}</span></div>
                                                    <p className="comment-text">{comment.content}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="comment-form">
                                    <input type="text" className="comment-input" placeholder="Yorum yazın..." value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddComment()} />
                                    <Button onClick={handleAddComment}>Gönder</Button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'history' && (
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
                                {getTaskLogs(selectedTask.id).length === 0 && <p className="text-muted">Henüz durum değişikliği yok.</p>}
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </>
    );
}
