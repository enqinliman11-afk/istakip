'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useData } from '@/lib/data-context';
import { Priority, PRIORITY_LABELS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input, Select, Textarea } from '@/components/ui/input';

export default function NewTaskPage() {
    const router = useRouter();
    const { categories, clients, users, addTask } = useData();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        categoryId: '',
        clientId: '',
        periodMonth: '',
        periodYear: new Date().getFullYear().toString(),
        priority: 'MEDIUM' as Priority,
        dueDate: '',
        assignees: [] as string[],
        subtasks: [''] as string[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.categoryId || !formData.clientId) {
            alert('Lütfen zorunlu alanları doldurun');
            return;
        }

        const subtaskTitles = formData.subtasks.filter((s) => s.trim() !== '');

        addTask(
            {
                title: formData.title,
                description: formData.description,
                categoryId: formData.categoryId,
                clientId: formData.clientId,
                periodMonth: formData.periodMonth ? parseInt(formData.periodMonth) : undefined,
                periodYear: formData.periodYear ? parseInt(formData.periodYear) : undefined,
                priority: formData.priority,
                status: 'SIRADA',
                dueDate: formData.dueDate || undefined,
            },
            formData.assignees.map((userId, index) => ({
                userId,
                isOwner: index === 0,
            })),
            subtaskTitles
        );

        router.push('/team-lead/tasks');
    };

    const priorityOptions = Object.entries(PRIORITY_LABELS).map(([value, label]) => ({
        value,
        label,
    }));

    // Admin hariç atanabilir kullanıcılar
    const assignableUsers = users.filter((u) => u.role !== 'ADMIN');

    return (
        <>
            <header className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">Yeni İş Oluştur</h1>
                </div>
            </header>

            <div className="page-body">
                <div className="card" style={{ maxWidth: '800px' }}>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <Input
                                        label="İş Başlığı *"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Örn: ABC Firması - Kasım 2025 KDV Beyannamesi"
                                        required
                                    />
                                </div>

                                <Select
                                    label="Müşteri *"
                                    value={formData.clientId}
                                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                    options={[{ value: '', label: 'Seçin...' }, ...clients.map((c) => ({ value: c.id, label: c.name }))]}
                                />

                                <Select
                                    label="Kategori *"
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    options={[{ value: '', label: 'Seçin...' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
                                />

                                <Input
                                    label="Dönem Ay"
                                    type="number"
                                    min="1"
                                    max="12"
                                    value={formData.periodMonth}
                                    onChange={(e) => setFormData({ ...formData, periodMonth: e.target.value })}
                                    placeholder="1-12"
                                />

                                <Input
                                    label="Dönem Yıl"
                                    type="number"
                                    value={formData.periodYear}
                                    onChange={(e) => setFormData({ ...formData, periodYear: e.target.value })}
                                />

                                <Select
                                    label="Öncelik"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                                    options={priorityOptions}
                                />

                                <Input
                                    label="Son Tarih"
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                />

                                <div style={{ gridColumn: '1 / -1' }}>
                                    <Textarea
                                        label="Açıklama"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="İş hakkında detaylar..."
                                    />
                                </div>

                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">Alt Görevler</label>
                                    {formData.subtasks.map((subtask, index) => (
                                        <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder={`Alt görev ${index + 1}`}
                                                value={subtask}
                                                onChange={(e) => {
                                                    const newSubtasks = [...formData.subtasks];
                                                    newSubtasks[index] = e.target.value;
                                                    setFormData({ ...formData, subtasks: newSubtasks });
                                                }}
                                            />
                                            {formData.subtasks.length > 1 && (
                                                <Button type="button" variant="ghost" size="sm" onClick={() => {
                                                    const newSubtasks = formData.subtasks.filter((_, i) => i !== index);
                                                    setFormData({ ...formData, subtasks: newSubtasks });
                                                }}>✕</Button>
                                            )}
                                        </div>
                                    ))}
                                    <Button type="button" variant="ghost" size="sm" onClick={() => setFormData({ ...formData, subtasks: [...formData.subtasks, ''] })}>
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
                                                    checked={formData.assignees.includes(u.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setFormData({ ...formData, assignees: [...formData.assignees, u.id] });
                                                        } else {
                                                            setFormData({ ...formData, assignees: formData.assignees.filter((id) => id !== u.id) });
                                                        }
                                                    }}
                                                />
                                                {u.name}
                                            </label>
                                        ))}
                                    </div>
                                    <p className="form-hint">İlk seçilen kişi ana sorumlu olarak işaretlenir.</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                                <Button type="submit">Oluştur</Button>
                                <Button type="button" variant="secondary" onClick={() => router.back()}>
                                    İptal
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
