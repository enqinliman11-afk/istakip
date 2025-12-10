'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
    User, Category, Client, Task, TaskAssignment, TaskStatusLog, Status,
    Notification, NotificationType, Subtask, Comment, TaskTemplate, RecurringTask
} from './types';
import { useAuth } from './auth-context';
import { canTransition } from './constants';
import { toast } from 'sonner';
import { soundEngine } from './sound-engine';

interface DataContextType {
    // Data
    users: User[];
    categories: Category[];
    clients: Client[];
    tasks: Task[];
    assignments: TaskAssignment[];
    statusLogs: TaskStatusLog[];
    notifications: Notification[];
    subtasks: Subtask[];
    comments: Comment[];
    templates: TaskTemplate[];
    recurringTasks: RecurringTask[];

    // User CRUD
    addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
    updateUser: (id: string, data: Partial<User>) => void;
    deleteUser: (id: string) => void;

    // Category CRUD
    addCategory: (name: string) => void;
    updateCategory: (id: string, name: string) => void;
    deleteCategory: (id: string) => void;

    // Client CRUD
    addClient: (name: string) => void;
    updateClient: (id: string, name: string) => void;
    deleteClient: (id: string) => void;

    // Task CRUD
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'createdById'>, assignees: { userId: string; isOwner: boolean }[], subtaskTitles?: string[]) => void;
    updateTask: (id: string, data: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    changeTaskStatus: (taskId: string, newStatus: Status, note?: string, timeData?: { startTime?: string; endTime?: string }) => Promise<boolean>;

    // Assignment CRUD
    addAssignment: (taskId: string, userId: string, isOwner: boolean) => void;
    removeAssignment: (taskId: string, userId: string) => void;
    updateAssignment: (taskId: string, userId: string, isOwner: boolean) => void;

    // Notification CRUD
    addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
    markNotificationAsRead: (notificationId: string) => void;
    markAllNotificationsAsRead: () => void;
    deleteNotification: (id: string) => void;
    getUnreadNotificationCount: () => number;

    // Subtask CRUD
    addSubtask: (taskId: string, title: string) => void;
    toggleSubtask: (subtaskId: string) => void;
    deleteSubtask: (id: string) => void;
    getTaskSubtasks: (taskId: string) => Subtask[];
    getTaskProgress: (taskId: string) => number;

    // Comment CRUD
    addComment: (taskId: string, content: string) => void;
    updateComment: (id: string, content: string) => void;
    deleteComment: (id: string) => void;
    getTaskComments: (taskId: string) => Comment[];

    // Template CRUD
    addTemplate: (template: Omit<TaskTemplate, 'id' | 'createdAt' | 'createdById'>) => void;
    updateTemplate: (id: string, data: Partial<TaskTemplate>) => void;
    deleteTemplate: (id: string) => void;
    createTaskFromTemplate: (templateId: string, clientId: string, dueDate?: string, assignees?: { userId: string; isOwner: boolean }[]) => void;

    // Recurring Task CRUD
    addRecurringTask: (task: Omit<RecurringTask, 'id' | 'createdAt' | 'createdById' | 'nextRunDate'>) => void;
    updateRecurringTask: (id: string, data: Partial<RecurringTask>) => void;
    deleteRecurringTask: (id: string) => void;
    toggleRecurringTask: (id: string) => void;

    // Helpers
    getTaskById: (id: string) => Task | undefined;
    getTaskAssignees: (taskId: string) => User[];
    getTaskLogs: (taskId: string) => TaskStatusLog[];
    getUserTasks: (userId: string) => Task[];
    getCategoryById: (id: string) => Category | undefined;
    getClientById: (id: string) => Client | undefined;
    getUserById: (id: string) => User | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
    const { user: currentUser } = useAuth();

    const [users, setUsers] = useState<User[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [assignments, setAssignments] = useState<TaskAssignment[]>([]);
    const [statusLogs, setStatusLogs] = useState<TaskStatusLog[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [templates, setTemplates] = useState<TaskTemplate[]>([]);
    const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Function to fetch all data
    const refreshData = useCallback(async (showError = false) => {
        try {
            const [
                usersRes, catsRes, clientsRes, tasksRes, assignsRes,
                logsRes, notifsRes, subtasksRes, commentsRes,
                templatesRes, recurringRes
            ] = await Promise.all([
                fetch('/api/users'),
                fetch('/api/categories'),
                fetch('/api/clients'),
                fetch('/api/tasks'),
                fetch('/api/assignments'),
                fetch('/api/status-logs'),
                fetch('/api/notifications'),
                fetch('/api/subtasks'),
                fetch('/api/comments'),
                fetch('/api/templates'),
                fetch('/api/recurring-tasks')
            ]);

            if (usersRes.ok) {
                const newUsers = await usersRes.json();
                setUsers(prev => JSON.stringify(prev) !== JSON.stringify(newUsers) ? newUsers : prev);
            }
            if (catsRes.ok) {
                const newCats = await catsRes.json();
                setCategories(prev => JSON.stringify(prev) !== JSON.stringify(newCats) ? newCats : prev);
            }
            if (clientsRes.ok) {
                const newClients = await clientsRes.json();
                setClients(prev => JSON.stringify(prev) !== JSON.stringify(newClients) ? newClients : prev);
            }
            if (tasksRes.ok) {
                const newTasks = await tasksRes.json();
                setTasks(prev => JSON.stringify(prev) !== JSON.stringify(newTasks) ? newTasks : prev);
            }
            if (assignsRes.ok) {
                const newAssigns = await assignsRes.json();
                setAssignments(prev => JSON.stringify(prev) !== JSON.stringify(newAssigns) ? newAssigns : prev);
            }
            if (logsRes.ok) {
                const newLogs = await logsRes.json();
                setStatusLogs(prev => JSON.stringify(prev) !== JSON.stringify(newLogs) ? newLogs : prev);
            }
            if (notifsRes.ok) {
                const newNotifs = await notifsRes.json();
                setNotifications(prev => JSON.stringify(prev) !== JSON.stringify(newNotifs) ? newNotifs : prev);
            }
            if (subtasksRes.ok) {
                const newSubtasks = await subtasksRes.json();
                setSubtasks(prev => JSON.stringify(prev) !== JSON.stringify(newSubtasks) ? newSubtasks : prev);
            }
            if (commentsRes.ok) {
                const newComments = await commentsRes.json();
                setComments(prev => JSON.stringify(prev) !== JSON.stringify(newComments) ? newComments : prev);
            }
            if (templatesRes && templatesRes.ok) {
                const newTemplates = await templatesRes.json();
                setTemplates(prev => JSON.stringify(prev) !== JSON.stringify(newTemplates) ? newTemplates : prev);
            }
            if (recurringRes && recurringRes.ok) {
                const newRecurring = await recurringRes.json();
                setRecurringTasks(prev => JSON.stringify(prev) !== JSON.stringify(newRecurring) ? newRecurring : prev);
            }

            setIsInitialized(true);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            if (showError) toast.error('Veriler yüklenirken hata oluştu');
        }
    }, []);

    // Initial Load and Polling
    useEffect(() => {
        // First load
        refreshData(true);

        // Poll every 3 seconds to keep data fresh ("Real-time" feel)
        const intervalId = setInterval(() => {
            // Only poll if tab is visible to save resources (optional but good practice)
            if (!document.hidden) {
                refreshData(false);
            }
        }, 3000);

        return () => clearInterval(intervalId);
    }, [refreshData]);

    // Sound alert for new notifications
    const prevNotifsRef = useRef<Notification[]>([]);

    useEffect(() => {
        if (!isInitialized) return;

        if (prevNotifsRef.current.length > 0) {
            const newNotifs = notifications.filter(n => !prevNotifsRef.current.some(pn => pn.id === n.id));

            newNotifs.forEach(n => {
                if (n.type === 'TASK_ASSIGNED') {
                    soundEngine.playNotification();
                } else if (n.type === 'STATUS_CHANGED') {
                    // If task is sent back to work (rejection/correction), play warning sound
                    // Check for 'CALISILIYOR' enum value in message
                    if (n.message.includes('CALISILIYOR') || n.message.includes('Çalışılıyor')) {
                        soundEngine.playWarning();
                    } else {
                        soundEngine.playNotification();
                    }
                } else {
                    soundEngine.playNotification();
                }
            });
        }

        prevNotifsRef.current = notifications;
    }, [notifications, isInitialized]);

    // Notification Helpers
    const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
        try {
            const res = await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...notification, isRead: false })
            });

            if (res.ok) {
                const newNote = await res.json();
                setNotifications((prev) => [newNote, ...prev]);

                // Play sound and show toast
                if (notification.type === 'TASK_ASSIGNED' || notification.type === 'COMMENT_ADDED') {
                    soundEngine.playNotification();
                    toast.info(notification.title, { description: notification.message });
                } else if (notification.type === 'STATUS_CHANGED') {
                    if (notification.title.includes('Tamamlandı')) {
                        soundEngine.playSuccess();
                        toast.success(notification.title, { description: notification.message });
                    } else {
                        soundEngine.playNotification();
                        toast.info(notification.title, { description: notification.message });
                    }
                } else if (notification.type === 'TASK_OVERDUE' || notification.type === 'DUE_DATE_NEAR') {
                    soundEngine.playError();
                    toast.warning(notification.title, { description: notification.message });
                } else if (notification.type === 'SUBTASK_COMPLETED') {
                    soundEngine.playSuccess();
                }
            }
        } catch (e) { console.error(e); }
    }, []);

    const markNotificationAsRead = useCallback(async (notificationId: string) => {
        try {
            const res = await fetch(`/api/notifications/${notificationId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isRead: true })
            });
            if (res.ok) {
                setNotifications((prev) =>
                    prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
                );
            }
        } catch (e) { console.error(e); }
    }, []);

    const markAllNotificationsAsRead = useCallback(async () => {
        if (!currentUser) return;
        // Batch API update is ideal, but for now we iterate or need a new route
        // Assuming we could add a route for this or just optimistic for now
        // Let's stick to optimistic for batch as it implies many requests or a custom batch route which we didn't add yet
        // A simple loop might be too heavy. 
        // Let's implement client side only for now until we add /api/notifications/mark-all
        setNotifications((prev) =>
            prev.map((n) => (n.userId === currentUser.id ? { ...n, isRead: true } : n))
        );
    }, [currentUser]);

    const deleteNotification = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setNotifications((prev) => prev.filter((n) => n.id !== id));
            }
        } catch (e) { console.error(e); }
    }, []);

    const getUnreadNotificationCount = useCallback(() => {
        if (!currentUser) return 0;
        return notifications.filter((n) => n.userId === currentUser.id && !n.isRead).length;
    }, [notifications, currentUser]);

    // User CRUD
    const addUser = useCallback(async (userData: Omit<User, 'id' | 'createdAt'>) => {
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            if (res.ok) {
                const newUser = await res.json();
                setUsers((prev) => [...prev, newUser]);
                toast.success('Kullanıcı eklendi');
            } else {
                toast.error('Kullanıcı eklenemedi');
            }
        } catch (error) {
            console.error(error);
            toast.error('Hata oluştu');
        }
    }, []);

    const updateUser = useCallback(async (id: string, data: Partial<User>) => {
        try {
            const res = await fetch(`/api/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));
            }
        } catch (error) { console.error(error); }
    }, []);

    const deleteUser = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setUsers((prev) => prev.filter((u) => u.id !== id));
                setAssignments((prev) => prev.filter((a) => a.userId !== id));
            }
        } catch (e) { console.error(e); }
    }, []);

    // Category CRUD
    const addCategory = useCallback(async (name: string) => {
        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });
            if (res.ok) {
                const newCategory = await res.json();
                setCategories((prev) => [...prev, newCategory]);
            }
        } catch (e) { console.error(e); }
    }, []);

    const updateCategory = useCallback(async (id: string, name: string) => {
        try {
            const res = await fetch(`/api/categories/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });
            if (res.ok) {
                setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
            }
        } catch (e) { console.error(e); }
    }, []);

    const deleteCategory = useCallback(async (id: string) => {
        try {
            console.log('DataContext: Deleting category', id);
            const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
            console.log('DataContext: Delete response status', res.status);
            if (res.ok) {
                setCategories((prev) => prev.filter((c) => c.id !== id));
                toast.success('Kategori silindi: ' + id);
            } else {
                const errData = await res.json() as { error: string };
                console.error('Delete failed:', errData);
                toast.error(`Silme hatası (ID: ${id}): ${errData.error}`);
            }
        } catch (e: any) {
            console.error(e);
            toast.error('Bağlantı hatası: ' + e.message);
        }
    }, []);

    // Client CRUD
    const addClient = useCallback(async (name: string) => {
        try {
            const res = await fetch('/api/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });
            if (res.ok) {
                const newClient = await res.json();
                setClients((prev) => [...prev, newClient]);
            }
        } catch (e) { console.error(e); }
    }, []);

    const updateClient = useCallback(async (id: string, name: string) => {
        try {
            const res = await fetch(`/api/clients/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });
            if (res.ok) {
                setClients((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
            }
        } catch (e) { console.error(e); }
    }, []);

    const deleteClient = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setClients((prev) => prev.filter((c) => c.id !== id));
            }
        } catch (e) { console.error(e); }
    }, []);

    // Task CRUD
    const addTask = useCallback(async (
        taskData: Omit<Task, 'id' | 'createdAt' | 'createdById'>,
        assignees: { userId: string; isOwner: boolean }[],
        subtaskTitles: string[] = []
    ) => {
        if (!currentUser) return;

        try {
            const body = {
                ...taskData,
                createdById: currentUser.id,
                assignees,
                subtaskTitles
            };

            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                const newTask = await res.json();
                setTasks((prev) => [newTask, ...prev]);

                if (newTask.assignments) setAssignments((prev) => [...prev, ...newTask.assignments]);
                if (newTask.subtasks) setSubtasks((prev) => [...prev, ...newTask.subtasks]);

                assignees.forEach(a => {
                    if (a.userId !== currentUser.id) {
                        fetch('/api/notifications', {
                            method: 'POST', body: JSON.stringify({
                                userId: a.userId,
                                type: 'TASK_ASSIGNED',
                                title: 'Yeni İş Atandı',
                                message: `"${newTask.title}" işi size atandı.`,
                                taskId: newTask.id,
                                isRead: false
                            })
                        }).catch(console.error);
                    }
                });

                toast.success('İş başarıyla oluşturuldu');
                soundEngine.playSuccess();
            } else {
                const errData = await res.json();
                console.error('Task creation failed:', errData);
                toast.error(`İş oluşturulamadı: ${errData.details || errData.error || 'Bilinmeyen hata'}`);
            }
        } catch (error) {
            console.error(error);
            toast.error('Hata oluştu');
        }
    }, [currentUser]);

    const updateTask = useCallback(async (id: string, data: Partial<Task>) => {
        try {
            const res = await fetch(`/api/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                // We could fetch the fresh task, but merging local data is faster for UI
                setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
            }
        } catch (e) { console.error(e); }
    }, []);

    const deleteTask = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setTasks((prev) => prev.filter((t) => t.id !== id));
                setAssignments((prev) => prev.filter((a) => a.taskId !== id));
                setStatusLogs((prev) => prev.filter((l) => l.taskId !== id));
                setSubtasks((prev) => prev.filter((s) => s.taskId !== id));
                setComments((prev) => prev.filter((c) => c.taskId !== id));
                toast.success('İş silindi');
            }
        } catch (e) { console.error(e); }
    }, []);

    const changeTaskStatus = useCallback(async (taskId: string, newStatus: Status, note?: string, timeData?: { startTime?: string; endTime?: string }): Promise<boolean> => {
        if (!currentUser) return false;

        const task = tasks.find(t => t.id === taskId);
        if (!task) return false;

        if (!canTransition(currentUser.role, task.status, newStatus)) {
            toast.error('Bu değişikliği yapma yetkiniz yok');
            return false;
        }

        try {
            const updateData: Partial<Task> & { startTime?: string; endTime?: string; completedAt?: string; statusLogs?: any } = { status: newStatus };
            if (task.status === 'SIRADA' && newStatus === 'CALISILIYOR' && timeData?.startTime) {
                updateData.startTime = timeData.startTime;
            }
            if (task.status === 'CALISILIYOR' && newStatus === 'KONTROLDE' && timeData?.endTime) {
                updateData.endTime = timeData.endTime;
            }

            updateData.statusLogs = {
                create: {
                    oldStatus: task.status,
                    newStatus: newStatus,
                    changedById: currentUser.id,
                    note: note,
                    changedAt: new Date().toISOString()
                }
            };

            const res = await fetch(`/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });

            if (res.ok) {
                const updatedTask = await res.json();

                setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));

                const newLog: TaskStatusLog = {
                    id: Math.random().toString(),
                    taskId,
                    oldStatus: task.status,
                    newStatus,
                    changedById: currentUser.id,
                    note,
                    changedAt: new Date().toISOString()
                };
                setStatusLogs(prev => [...prev, newLog]);

                const taskAssignees = assignments.filter((a) => a.taskId === taskId);
                const usersToNotify = new Set(taskAssignees.map(a => a.userId));
                // Add task creator to notification list
                if (task.createdById) usersToNotify.add(task.createdById);

                // Remove current user (don't notify self)
                if (currentUser) usersToNotify.delete(currentUser.id);

                usersToNotify.forEach((userId) => {
                    fetch('/api/notifications', {
                        method: 'POST', body: JSON.stringify({
                            userId: userId,
                            type: 'STATUS_CHANGED',
                            title: 'İş Durumu Değişti',
                            message: `"${task.title}" işinin durumu "${newStatus}" olarak değiştirildi.`,
                            taskId
                        })
                    }).catch(() => { });
                });

                soundEngine.playSuccess();
                return true;
            } else {
                toast.error('Durum güncellenemedi');
                return false;
            }
        } catch (error) {
            console.error(error);
            return false;
        }
    }, [currentUser, tasks, assignments]);

    // Assignment CRUD
    const addAssignment = useCallback(async (taskId: string, userId: string, isOwner: boolean) => {
        try {
            const res = await fetch('/api/assignments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskId, userId, isOwner })
            });
            if (res.ok) {
                const newAssign = await res.json();
                setAssignments((prev) => [...prev, newAssign]);

                // Notify
                fetch('/api/notifications', {
                    method: 'POST', body: JSON.stringify({
                        userId,
                        type: 'TASK_ASSIGNED',
                        title: 'Yeni İş Atandı',
                        message: 'Yeni iş atandı',
                        taskId
                    })
                }).catch(() => { });
            }
        } catch (e) { console.error(e); }
    }, []);

    const removeAssignment = useCallback(async (taskId: string, userId: string) => {
        try {
            const res = await fetch(`/api/assignments?taskId=${taskId}&userId=${userId}`, { method: 'DELETE' });
            if (res.ok) {
                setAssignments((prev) => prev.filter((a) => !(a.taskId === taskId && a.userId === userId)));
            }
        } catch (e) { console.error(e); }
    }, []);

    const updateAssignment = useCallback((taskId: string, userId: string, isOwner: boolean) => {
        // Not implemented in API yet (rarely used feature) but state update remains
        setAssignments((prev) =>
            prev.map((a) =>
                a.taskId === taskId && a.userId === userId ? { ...a, isOwner } : a
            )
        );
    }, []);

    // Subtask CRUD
    const addSubtask = useCallback(async (taskId: string, title: string) => {
        try {
            const res = await fetch('/api/subtasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskId, title, isCompleted: false })
            });
            if (res.ok) {
                const newSub = await res.json();
                setSubtasks((prev) => [...prev, newSub]);
            }
        } catch (e) { console.error(e); }
    }, []);

    const toggleSubtask = useCallback(async (subtaskId: string) => {
        try {
            // Find current state to toggle
            const subtask = subtasks.find(s => s.id === subtaskId);
            if (!subtask) return;
            const newIsCompleted = !subtask.isCompleted;

            const res = await fetch(`/api/subtasks/${subtaskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    isCompleted: newIsCompleted,
                    completedById: newIsCompleted ? currentUser?.id : null
                })
            });

            if (res.ok) {
                const updatedSub = await res.json();
                setSubtasks((prev) => prev.map((s) => (s.id === subtaskId ? updatedSub : s)));

                // Notify if completed
                if (newIsCompleted) {
                    soundEngine.playSuccess();
                }
            }
        } catch (e) { console.error(e); }
    }, [subtasks, currentUser]);

    const deleteSubtask = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/api/subtasks/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setSubtasks((prev) => prev.filter((s) => s.id !== id));
            }
        } catch (e) { console.error(e); }
    }, []);

    const getTaskSubtasks = useCallback((taskId: string): Subtask[] => {
        return subtasks.filter((s) => s.taskId === taskId);
    }, [subtasks]);

    const getTaskProgress = useCallback((taskId: string): number => {
        const taskSubtasks = subtasks.filter((s) => s.taskId === taskId);
        if (taskSubtasks.length === 0) return 0;
        const completed = taskSubtasks.filter((s) => s.isCompleted).length;
        return Math.round((completed / taskSubtasks.length) * 100);
    }, [subtasks]);

    // Comment CRUD
    const addComment = useCallback(async (taskId: string, content: string) => {
        if (!currentUser) return;
        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskId, userId: currentUser.id, content })
            });
            if (res.ok) {
                const newComment = await res.json();
                setComments((prev) => [...prev, newComment]);

                const task = tasks.find((t) => t.id === taskId);
                const taskAssignees = assignments.filter((a) => a.taskId === taskId);
                const usersToNotify = new Set(taskAssignees.map(a => a.userId));
                // Add task creator to notification list
                if (task?.createdById) usersToNotify.add(task.createdById);

                // Remove current user (don't notify self)
                if (currentUser) usersToNotify.delete(currentUser.id);

                usersToNotify.forEach((userId) => {
                    fetch('/api/notifications', {
                        method: 'POST', body: JSON.stringify({
                            userId: userId,
                            type: 'COMMENT_ADDED',
                            title: 'Yeni Yorum',
                            message: `"${task?.title}" işine yorum eklendi.`,
                            taskId
                        })
                    }).catch(() => { });
                });
            }
        } catch (e) { console.error(e); }
    }, [currentUser, tasks, assignments]);

    const updateComment = useCallback(async (id: string, content: string) => {
        try {
            const res = await fetch(`/api/comments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });
            if (res.ok) {
                const updatedComment = await res.json();
                setComments((prev) => prev.map((c) => (c.id === id ? updatedComment : c)));
            }
        } catch (e) { console.error(e); }
    }, []);

    const deleteComment = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setComments((prev) => prev.filter((c) => c.id !== id));
            }
        } catch (e) { console.error(e); }
    }, []);

    const getTaskComments = useCallback((taskId: string): Comment[] => {
        return comments
            .filter((c) => c.taskId === taskId)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }, [comments]);

    // Template CRUD
    const addTemplate = useCallback(async (templateData: Omit<TaskTemplate, 'id' | 'createdAt' | 'createdById'>) => {
        if (!currentUser) return;
        try {
            const res = await fetch('/api/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...templateData, createdById: currentUser.id })
            });
            if (res.ok) {
                const newTemplate = await res.json();
                setTemplates((prev) => [...prev, newTemplate]);
                toast.success('Şablon oluşturuldu');
            }
        } catch (e) {
            console.error(e);
            toast.error('Hata oluştu');
        }
    }, [currentUser]);

    const updateTemplate = useCallback(async (id: string, data: Partial<TaskTemplate>) => {
        try {
            const res = await fetch(`/api/templates/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                const updated = await res.json();
                setTemplates((prev) => prev.map((t) => (t.id === id ? updated : t)));
            }
        } catch (e) { console.error(e); }
    }, []);

    const deleteTemplate = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setTemplates((prev) => prev.filter((t) => t.id !== id));
            }
        } catch (e) { console.error(e); }
    }, []);

    const createTaskFromTemplate = useCallback((
        templateId: string,
        clientId: string,
        dueDate?: string,
        assignees?: { userId: string; isOwner: boolean }[]
    ) => {
        const template = templates.find((t) => t.id === templateId);
        if (!template) return;

        addTask(
            {
                title: template.title,
                description: template.description,
                categoryId: template.categoryId,
                clientId,
                priority: template.priority,
                status: 'SIRADA',
                dueDate,
            },
            assignees || [],
            template.subtasks
        );
    }, [templates, addTask]);

    // Recurring Task CRUD
    const addRecurringTask = useCallback(async (taskData: Omit<RecurringTask, 'id' | 'createdAt' | 'createdById' | 'nextRunDate'>) => {
        if (!currentUser) return;

        // Bir sonraki çalışma tarihini hesapla
        const now = new Date();
        let nextRunDate = new Date();

        switch (taskData.frequency) {
            case 'DAILY':
                nextRunDate.setDate(now.getDate() + 1);
                break;
            case 'WEEKLY':
                nextRunDate.setDate(now.getDate() + (7 - now.getDay() + (taskData.dayOfWeek || 0)) % 7);
                if (nextRunDate <= now) nextRunDate.setDate(nextRunDate.getDate() + 7);
                break;
            case 'MONTHLY':
                nextRunDate = new Date(now.getFullYear(), now.getMonth() + 1, taskData.dayOfMonth || 1);
                break;
            case 'YEARLY':
                nextRunDate = new Date(now.getFullYear() + 1, now.getMonth(), taskData.dayOfMonth || 1);
                break;
        }

        try {
            const res = await fetch('/api/recurring-tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...taskData,
                    createdById: currentUser.id,
                    nextRunDate: nextRunDate.toISOString()
                })
            });
            if (res.ok) {
                const newTask = await res.json();
                setRecurringTasks((prev) => [...prev, newTask]);
                toast.success('Tekrarlayan görev oluşturuldu');
            }
        } catch (e) {
            console.error(e);
            toast.error('Hata oluştu');
        }
    }, [currentUser]);

    const updateRecurringTask = useCallback(async (id: string, data: Partial<RecurringTask>) => {
        try {
            const res = await fetch(`/api/recurring-tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                const updated = await res.json();
                setRecurringTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
            }
        } catch (e) { console.error(e); }
    }, []);

    const deleteRecurringTask = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/api/recurring-tasks/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setRecurringTasks((prev) => prev.filter((t) => t.id !== id));
            }
        } catch (e) { console.error(e); }
    }, []);

    const toggleRecurringTask = useCallback(async (id: string) => {
        const task = recurringTasks.find(t => t.id === id);
        if (!task) return;

        try {
            // Toggle active state
            const res = await fetch(`/api/recurring-tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !task.isActive })
            });

            if (res.ok) {
                const updated = await res.json();
                setRecurringTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
            }
        } catch (e) { console.error(e); }
    }, [recurringTasks]);

    // Helpers
    const getTaskById = useCallback((id: string) => tasks.find((t) => t.id === id), [tasks]);

    const getTaskAssignees = useCallback((taskId: string): User[] => {
        const taskAssignments = assignments.filter((a) => a.taskId === taskId);
        return taskAssignments
            .map((a) => users.find((u) => u.id === a.userId))
            .filter((u): u is User => u !== undefined);
    }, [assignments, users]);

    const getTaskLogs = useCallback((taskId: string): TaskStatusLog[] => {
        return statusLogs
            .filter((l) => l.taskId === taskId)
            .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());
    }, [statusLogs]);

    const getUserTasks = useCallback((userId: string): Task[] => {
        const userAssignments = assignments.filter((a) => a.userId === userId);
        return userAssignments
            .map((a) => tasks.find((t) => t.id === a.taskId))
            .filter((t): t is Task => t !== undefined);
    }, [assignments, tasks]);

    const getCategoryById = useCallback((id: string) => categories.find((c) => c.id === id), [categories]);
    const getClientById = useCallback((id: string) => clients.find((c) => c.id === id), [clients]);
    const getUserById = useCallback((id: string) => users.find((u) => u.id === id), [users]);

    return (
        <DataContext.Provider
            value={{
                users,
                categories,
                clients,
                tasks,
                assignments,
                statusLogs,
                notifications,
                subtasks,
                comments,
                templates,
                recurringTasks,
                addUser,
                updateUser,
                deleteUser,
                addCategory,
                updateCategory,
                deleteCategory,
                addClient,
                updateClient,
                deleteClient,
                addTask,
                updateTask,
                deleteTask,
                changeTaskStatus,
                addAssignment,
                removeAssignment,
                updateAssignment,
                addNotification,
                markNotificationAsRead,
                markAllNotificationsAsRead,
                deleteNotification,
                getUnreadNotificationCount,
                addSubtask,
                toggleSubtask,
                deleteSubtask,
                getTaskSubtasks,
                getTaskProgress,
                addComment,
                updateComment,
                deleteComment,
                getTaskComments,
                addTemplate,
                updateTemplate,
                deleteTemplate,
                createTaskFromTemplate,
                addRecurringTask,
                updateRecurringTask,
                deleteRecurringTask,
                toggleRecurringTask,
                getTaskById,
                getTaskAssignees,
                getTaskLogs,
                getUserTasks,
                getCategoryById,
                getClientById,
                getUserById,
            }}
        >
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
