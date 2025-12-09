'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';
import { Task, Status, Priority, STATUS_LABELS, PRIORITY_LABELS, Subtask, Comment } from '@/lib/types';
import { getAvailableTransitions } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input, Select, Textarea } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { StatusBadge, PriorityBadge } from '@/components/ui/badge';
import { KanbanBoard } from '@/components/tasks/kanban-board';
import { CalendarView } from '@/components/tasks/calendar-view';

type ViewMode = 'list' | 'kanban' | 'calendar';

export default function AdminTasksPage() {
    const { user } = useAuth();
    const {
        tasks,
        categories,
        clients,
        users,
        assignments,
        addTask,
        updateTask,
        deleteTask,
        changeTaskStatus,
        addAssignment,
        removeAssignment,
        getTaskAssignees,
        getTaskLogs,
        getCategoryById,
        getClientById,
        getUserById,
        addSubtask,
        toggleSubtask,
        deleteSubtask,
        getTaskSubtasks,
        getTaskProgress,
        addComment,
        getTaskComments,
    } = useData();

    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [statusNote, setStatusNote] = useState('');
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [newCommentText, setNewCommentText] = useState('');
    const [activeTab, setActiveTab] = useState<'details' | 'subtasks' | 'comments' | 'history'>('details');
    const [confirmCompleteTask, setConfirmCompleteTask] = useState<Task | null>(null);
    const [filters, setFilters] = useState({
        status: '',
        category: '',
        client: '',
        search: '',
    });

    const [newTaskData, setNewTaskData] = useState({
        title: '',
        description: '',
        categoryId: '',
        clientId: '',
        periodMonth: '',
        periodYear: new Date().getFullYear().toString(),
        priority: 'MEDIUM' as Priority,
        dueDate: '',
        assignees: [] as string[],
        subtasks: [''],
    });

    // Filtrelenmiş işler - TAMAMLANDI hariç, deadline'a göre sıralı
    const filteredTasks = useMemo(() => {
        return tasks
            .filter((task) => {
                // Tamamlanmış işleri gösterme
                if (task.status === 'TAMAMLANDI') return false;
                if (filters.status && task.status !== filters.status) return false;
                if (filters.category && task.categoryId !== filters.category) return false;
                if (filters.client && task.clientId !== filters.client) return false;
                if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase()))
                    return false;
                return true;
            })
            .sort((a, b) => {
                // Deadline'a göre sırala (en yakın tarih en üstte)
                if (!a.dueDate && !b.dueDate) return 0;
                if (!a.dueDate) return 1; // dueDate olmayanlar sona
                if (!b.dueDate) return -1;
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            });
    }, [tasks, filters]);

    const handleCreateTask = () => {
        if (!newTaskData.title || !newTaskData.categoryId || !newTaskData.clientId) {
            alert('Lütfen zorunlu alanları doldurun');
            return;
        }

        const subtaskTitles = newTaskData.subtasks.filter((s) => s.trim() !== '');

        addTask(
            {
                title: newTaskData.title,
                description: newTaskData.description,
                categoryId: newTaskData.categoryId,
                clientId: newTaskData.clientId,
                periodMonth: newTaskData.periodMonth ? parseInt(newTaskData.periodMonth) : undefined,
                periodYear: newTaskData.periodYear ? parseInt(newTaskData.periodYear) : undefined,
                priority: newTaskData.priority,
                status: 'SIRADA',
                dueDate: newTaskData.dueDate || undefined,
            },
            newTaskData.assignees.map((userId, index) => ({
                userId,
                isOwner: index === 0,
            })),
            subtaskTitles
        );

        setNewTaskData({
            title: '',
            description: '',
            categoryId: '',
            clientId: '',
            periodMonth: '',
            periodYear: new Date().getFullYear().toString(),
            priority: 'MEDIUM',
            dueDate: '',
            assignees: [],
            subtasks: [''],
        });
        setIsCreateModalOpen(false);
    };

    const handleStatusChange = async (task: Task, newStatus: Status) => {
        // Tamamlandı durumuna geçiş için onay iste
        if (newStatus === 'TAMAMLANDI') {
            setConfirmCompleteTask(task);
            return;
        }

        const success = await changeTaskStatus(task.id, newStatus, statusNote || undefined);
        if (success) {
            setStatusNote('');
            setSelectedTask({ ...task, status: newStatus });
        } else {
            // alert('Bu durum geçişi için yetkiniz yok.');
        }
    };

    const handleConfirmComplete = async () => {
        if (!confirmCompleteTask) return;
        const success = await changeTaskStatus(confirmCompleteTask.id, 'TAMAMLANDI', statusNote || undefined);
        if (success) {
            setStatusNote('');
            setSelectedTask(null);
            setConfirmCompleteTask(null);
        } else {
            alert('Bu durum geçişi için yetkiniz yok.');
        }
    };

    const handleAssigneeToggle = (taskId: string, userId: string) => {
        const currentAssignments = assignments.filter((a) => a.taskId === taskId);
        const isAssigned = currentAssignments.some((a) => a.userId === userId);

        if (isAssigned) {
            removeAssignment(taskId, userId);
        } else {
            addAssignment(taskId, userId, currentAssignments.length === 0);
        }
    };

    const handleAddSubtask = () => {
        if (!selectedTask || !newSubtaskTitle.trim()) return;
        addSubtask(selectedTask.id, newSubtaskTitle.trim());
        setNewSubtaskTitle('');
    };

    const handleAddComment = () => {
        if (!selectedTask || !newCommentText.trim()) return;
        addComment(selectedTask.id, newCommentText.trim());
        setNewCommentText('');
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const formatDateTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('tr-TR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isOverdue = (dueDate?: string) => {
        if (!dueDate) return false;
        return new Date(dueDate) < new Date();
    };

    const statusOptions = [
        { value: '', label: 'Tüm Durumlar' },
        ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })),
    ];

    const categoryOptions = [
        { value: '', label: 'Tüm Kategoriler' },
        ...categories.map((c) => ({ value: c.id, label: c.name })),
    ];

    const clientOptions = [
        { value: '', label: 'Tüm Müşteriler' },
        ...clients.map((c) => ({ value: c.id, label: c.name })),
    ];

    const priorityOptions = Object.entries(PRIORITY_LABELS).map(([value, label]) => ({
        value,
        label,
    }));

    const assignableUsers = users.filter((u) => u.role !== 'ADMIN' || u.id === user?.id);

    const taskSubtasks = selectedTask ? getTaskSubtasks(selectedTask.id) : [];
    const taskComments = selectedTask ? getTaskComments(selectedTask.id) : [];
    const taskProgress = selectedTask ? getTaskProgress(selectedTask.id) : 0;

    return (
        <>
            <header className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">Tüm İşler</h1>
                    <div className="page-actions">
                        <div className="view-toggle">
                            <button
                                className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                                onClick={() => setViewMode('list')}
                            >
                                📋 Liste
                            </button>
                            <button
                                className={`view-toggle-btn ${viewMode === 'kanban' ? 'active' : ''}`}
                                onClick={() => setViewMode('kanban')}
                            >
                                📊 Kanban
                            </button>
                            <button
                                className={`view-toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
                                onClick={() => setViewMode('calendar')}
                            >
                                📅 Takvim
                            </button>
                        </div>
                        <Button onClick={() => setIsCreateModalOpen(true)}>➕ Yeni İş</Button>
                    </div>
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
                        <label className="filter-label">Durum</label>
                        <select
                            className="filter-input"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            {statusOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
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

                {/* Views */}
                {viewMode === 'kanban' && (
                    <KanbanBoard tasks={filteredTasks} onTaskClick={setSelectedTask} onStatusChange={handleStatusChange} />
                )}

                {viewMode === 'calendar' && (
                    <CalendarView tasks={filteredTasks} onTaskClick={setSelectedTask} />
                )}

                {viewMode === 'list' && (
                    <>
                        {filteredTasks.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">📋</div>
                                <h3 className="empty-state-title">Henüz iş bulunamadı</h3>
                                <p className="empty-state-text">Yeni bir iş oluşturmak için yukarıdaki butonu kullanın.</p>
                            </div>
                        ) : (
                            <div className="task-grid">
                                {filteredTasks.map((task) => {
                                    const assignees = getTaskAssignees(task.id);
                                    const progress = getTaskProgress(task.id);
                                    return (
                                        <div key={task.id} className="task-card" onClick={() => setSelectedTask(task)}>
                                            <div className="task-card-header">
                                                <h4 className="task-card-title">{task.title}</h4>
                                                <PriorityBadge priority={task.priority} />
                                            </div>
                                            <div className="task-card-meta">
                                                <StatusBadge status={task.status} />
                                                <span className="badge badge-role">{getCategoryById(task.categoryId)?.name}</span>
                                            </div>
                                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                                                {getClientById(task.clientId)?.name}
                                            </p>

                                            {progress > 0 && (
                                                <div style={{ marginBottom: '0.75rem' }}>
                                                    <div className="progress-bar">
                                                        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                                                    </div>
                                                    <p className="progress-text">{progress}% tamamlandı</p>
                                                </div>
                                            )}

                                            <div className="task-card-footer">
                                                <div className="task-card-assignees">
                                                    {assignees.slice(0, 3).map((u) => (
                                                        <div key={u.id} className="task-card-avatar" title={u.name}>{u.name.charAt(0)}</div>
                                                    ))}
                                                    {assignees.length > 3 && <div className="task-card-avatar">+{assignees.length - 3}</div>}
                                                </div>
                                                {task.dueDate && (
                                                    <span className={`task-card-due ${isOverdue(task.dueDate) && task.status !== 'TAMAMLANDI' ? 'overdue' : ''}`}>
                                                        📅 {formatDate(task.dueDate)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Yeni İş Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Yeni İş Oluştur"
                size="lg"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>İptal</Button>
                        <Button onClick={handleCreateTask}>Oluştur</Button>
                    </>
                }
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <Input
                            label="İş Başlığı *"
                            value={newTaskData.title}
                            onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
                            placeholder="Örn: ABC Firması - Kasım 2025 KDV Beyannamesi"
                        />
                    </div>
                    <Select
                        label="Müşteri *"
                        value={newTaskData.clientId}
                        onChange={(e) => setNewTaskData({ ...newTaskData, clientId: e.target.value })}
                        options={[{ value: '', label: 'Seçin...' }, ...clients.map((c) => ({ value: c.id, label: c.name }))]}
                    />
                    <Select
                        label="Kategori *"
                        value={newTaskData.categoryId}
                        onChange={(e) => setNewTaskData({ ...newTaskData, categoryId: e.target.value })}
                        options={[{ value: '', label: 'Seçin...' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
                    />
                    <Input label="Dönem Ay" type="number" min="1" max="12" value={newTaskData.periodMonth} onChange={(e) => setNewTaskData({ ...newTaskData, periodMonth: e.target.value })} placeholder="1-12" />
                    <Input label="Dönem Yıl" type="number" value={newTaskData.periodYear} onChange={(e) => setNewTaskData({ ...newTaskData, periodYear: e.target.value })} />
                    <Select label="Öncelik" value={newTaskData.priority} onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value as Priority })} options={priorityOptions} />
                    <Input label="Son Tarih" type="date" value={newTaskData.dueDate} onChange={(e) => setNewTaskData({ ...newTaskData, dueDate: e.target.value })} />
                    <div style={{ gridColumn: '1 / -1' }}>
                        <Textarea label="Açıklama" value={newTaskData.description} onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })} placeholder="İş hakkında detaylar..." />
                    </div>

                    {/* Alt Görevler */}
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">Alt Görevler</label>
                        {newTaskData.subtasks.map((subtask, index) => (
                            <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder={`Alt görev ${index + 1}`}
                                    value={subtask}
                                    onChange={(e) => {
                                        const newSubtasks = [...newTaskData.subtasks];
                                        newSubtasks[index] = e.target.value;
                                        setNewTaskData({ ...newTaskData, subtasks: newSubtasks });
                                    }}
                                />
                                {newTaskData.subtasks.length > 1 && (
                                    <Button variant="ghost" size="sm" onClick={() => {
                                        const newSubtasks = newTaskData.subtasks.filter((_, i) => i !== index);
                                        setNewTaskData({ ...newTaskData, subtasks: newSubtasks });
                                    }}>✕</Button>
                                )}
                            </div>
                        ))}
                        <Button variant="ghost" size="sm" onClick={() => setNewTaskData({ ...newTaskData, subtasks: [...newTaskData.subtasks, ''] })}>
                            ➕ Alt görev ekle
                        </Button>
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">Atanacak Kişiler</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {assignableUsers.map((u) => (
                                <label key={u.id} className="form-checkbox" style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={newTaskData.assignees.includes(u.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setNewTaskData({ ...newTaskData, assignees: [...newTaskData.assignees, u.id] });
                                            } else {
                                                setNewTaskData({ ...newTaskData, assignees: newTaskData.assignees.filter((id) => id !== u.id) });
                                            }
                                        }}
                                    />
                                    {u.name}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </Modal>

            {/* İş Detay Modal */}
            <Modal
                isOpen={!!selectedTask}
                onClose={() => { setSelectedTask(null); setActiveTab('details'); }}
                title="İş Detayı"
                size="lg"
                footer={
                    <>
                        <Button variant="danger" onClick={() => {
                            if (confirm('Bu işi silmek istediğinize emin misiniz?')) {
                                deleteTask(selectedTask!.id);
                                setSelectedTask(null);
                            }
                        }}>🗑️ Sil</Button>
                        <Button variant="secondary" onClick={() => { setSelectedTask(null); setActiveTab('details'); }}>Kapat</Button>
                    </>
                }
            >
                {selectedTask && (
                    <div>
                        <h3 style={{ marginBottom: '0.5rem' }}>{selectedTask.title}</h3>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                            <StatusBadge status={selectedTask.status} />
                            <PriorityBadge priority={selectedTask.priority} />
                        </div>

                        {/* Progress */}
                        {taskSubtasks.length > 0 && (
                            <div style={{ marginBottom: '1rem' }}>
                                <div className="progress-bar">
                                    <div className="progress-bar-fill" style={{ width: `${taskProgress}%` }} />
                                </div>
                                <p className="progress-text">{taskProgress}% tamamlandı ({taskSubtasks.filter(s => s.isCompleted).length}/{taskSubtasks.length} alt görev)</p>
                            </div>
                        )}

                        {/* Tabs */}
                        <div className="tabs">
                            <button className={`tab ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>Detaylar</button>
                            <button className={`tab ${activeTab === 'subtasks' ? 'active' : ''}`} onClick={() => setActiveTab('subtasks')}>Alt Görevler ({taskSubtasks.length})</button>
                            <button className={`tab ${activeTab === 'comments' ? 'active' : ''}`} onClick={() => setActiveTab('comments')}>Yorumlar ({taskComments.length})</button>
                            <button className={`tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>Geçmiş</button>
                        </div>

                        {/* Details Tab */}
                        {activeTab === 'details' && (
                            <div>
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
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dönem</span>
                                        <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{selectedTask.periodMonth && selectedTask.periodYear ? `${selectedTask.periodMonth}/${selectedTask.periodYear}` : '-'}</p>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Son Tarih</span>
                                        <p style={{ fontWeight: 500, color: isOverdue(selectedTask.dueDate) && selectedTask.status !== 'TAMAMLANDI' ? 'var(--error)' : 'var(--text-primary)' }}>
                                            {selectedTask.dueDate ? formatDate(selectedTask.dueDate) : '-'}
                                        </p>
                                    </div>
                                </div>

                                {selectedTask.description && (
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Açıklama</span>
                                        <p style={{ marginTop: '0.25rem' }}>{selectedTask.description}</p>
                                    </div>
                                )}

                                {/* Durum Değiştirme */}
                                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '0.75rem' }}>
                                    <h4 style={{ marginBottom: '0.75rem' }}>Durum Değiştir</h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                        {getAvailableTransitions(user!.role, selectedTask.status).map((status) => (
                                            <Button key={status} size="sm" variant="secondary" onClick={() => handleStatusChange(selectedTask, status)}>→ {STATUS_LABELS[status]}</Button>
                                        ))}
                                    </div>
                                    <Input placeholder="Not ekle (opsiyonel)" value={statusNote} onChange={(e) => setStatusNote(e.target.value)} />
                                </div>

                                {/* Atananlar */}
                                <div>
                                    <h4 style={{ marginBottom: '0.75rem' }}>Atanan Kişiler</h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {assignableUsers.map((u) => {
                                            const isAssigned = assignments.some((a) => a.taskId === selectedTask.id && a.userId === u.id);
                                            return (
                                                <label key={u.id} className="form-checkbox" style={{ padding: '0.5rem 0.75rem', background: isAssigned ? 'var(--primary-100)' : 'var(--bg-secondary)', borderRadius: '0.5rem', border: isAssigned ? '1px solid var(--primary-300)' : '1px solid transparent' }}>
                                                    <input type="checkbox" checked={isAssigned} onChange={() => handleAssigneeToggle(selectedTask.id, u.id)} />
                                                    {u.name}
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Subtasks Tab */}
                        {activeTab === 'subtasks' && (
                            <div>
                                <div className="subtask-list">
                                    {taskSubtasks.map((subtask) => (
                                        <div key={subtask.id} className={`subtask-item ${subtask.isCompleted ? 'completed' : ''}`}>
                                            <input type="checkbox" className="subtask-checkbox" checked={subtask.isCompleted} onChange={() => toggleSubtask(subtask.id)} />
                                            <span className="subtask-title">{subtask.title}</span>
                                            <button className="subtask-delete" onClick={() => deleteSubtask(subtask.id)}>✕</button>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                    <input type="text" className="form-input" placeholder="Yeni alt görev..." value={newSubtaskTitle} onChange={(e) => setNewSubtaskTitle(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()} />
                                    <Button onClick={handleAddSubtask}>Ekle</Button>
                                </div>
                            </div>
                        )}

                        {/* Comments Tab */}
                        {activeTab === 'comments' && (
                            <div className="comments-section">
                                <div className="comment-list">
                                    {taskComments.map((comment) => {
                                        const commentUser = getUserById(comment.userId);
                                        return (
                                            <div key={comment.id} className="comment-item">
                                                <div className="comment-avatar">{commentUser?.name.charAt(0)}</div>
                                                <div className="comment-content">
                                                    <div className="comment-header">
                                                        <span className="comment-author">{commentUser?.name}</span>
                                                        <span className="comment-time">{formatDateTime(comment.createdAt)}</span>
                                                    </div>
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

                        {/* History Tab */}
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

            {/* Tamamlama Onay Modalı */}
            <Modal
                isOpen={!!confirmCompleteTask}
                onClose={() => setConfirmCompleteTask(null)}
                title="İşi Tamamla"
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setConfirmCompleteTask(null)}>İptal</Button>
                        <Button onClick={handleConfirmComplete}>✅ Evet, Tamamlandı</Button>
                    </>
                }
            >
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                    <h3 style={{ marginBottom: '0.5rem' }}>İşin Eksiksiz Yapıldığını Onaylıyor Musunuz?</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        "{confirmCompleteTask?.title}" işi tamamlananlar listesine taşınacak.
                    </p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        Bu işlem geri alınamaz. Tamamlanan işler ayrı bir sayfada görüntülenir.
                    </p>
                </div>
            </Modal>
        </>
    );
}
