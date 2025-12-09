'use client';

import React, { useState } from 'react';
import { useData } from '@/lib/data-context';
import { TaskTemplate, Priority, PRIORITY_LABELS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input, Select, Textarea } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { PriorityBadge } from '@/components/ui/badge';

export default function TemplatesPage() {
    const { templates, categories, clients, addTemplate, deleteTemplate, createTaskFromTemplate, users } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        title: '',
        description: '',
        categoryId: '',
        priority: 'MEDIUM' as Priority,
        subtasks: [''],
    });

    const [taskFormData, setTaskFormData] = useState({
        clientId: '',
        dueDate: '',
        assignees: [] as string[],
    });

    const handleCreateTemplate = () => {
        if (!formData.name || !formData.title || !formData.categoryId) {
            alert('Lütfen zorunlu alanları doldurun');
            return;
        }

        addTemplate({
            name: formData.name,
            title: formData.title,
            description: formData.description,
            categoryId: formData.categoryId,
            priority: formData.priority,
            subtasks: formData.subtasks.filter((s) => s.trim() !== ''),
        });

        setFormData({
            name: '',
            title: '',
            description: '',
            categoryId: '',
            priority: 'MEDIUM',
            subtasks: [''],
        });
        setIsModalOpen(false);
    };

    const handleCreateTaskFromTemplate = () => {
        if (!selectedTemplate || !taskFormData.clientId) {
            alert('Lütfen müşteri seçin');
            return;
        }

        createTaskFromTemplate(
            selectedTemplate.id,
            taskFormData.clientId,
            taskFormData.dueDate || undefined,
            taskFormData.assignees.map((userId, index) => ({ userId, isOwner: index === 0 }))
        );

        setTaskFormData({
            clientId: '',
            dueDate: '',
            assignees: [],
        });
        setSelectedTemplate(null);
        setIsCreateTaskModalOpen(false);
    };

    const getCategoryName = (id: string) => categories.find((c) => c.id === id)?.name || '-';
    const assignableUsers = users.filter((u) => u.role !== 'ADMIN');

    return (
        <>
            <header className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">İş Şablonları</h1>
                    <Button onClick={() => setIsModalOpen(true)}>➕ Yeni Şablon</Button>
                </div>
            </header>

            <div className="page-body">
                {templates.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📄</div>
                        <h3 className="empty-state-title">Henüz şablon yok</h3>
                        <p className="empty-state-text">Sık kullanılan iş türleri için şablon oluşturun.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                        {templates.map((template) => (
                            <div key={template.id} className="template-card">
                                <div className="template-card-header">
                                    <span className="template-name">{template.name}</span>
                                    <PriorityBadge priority={template.priority} />
                                </div>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                    {template.title}
                                </p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                                    Kategori: {getCategoryName(template.categoryId)}
                                </p>
                                {template.subtasks.length > 0 && (
                                    <p className="template-subtasks">📋 {template.subtasks.length} alt görev</p>
                                )}
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            setSelectedTemplate(template);
                                            setIsCreateTaskModalOpen(true);
                                        }}
                                    >
                                        ✨ İş Oluştur
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="danger"
                                        onClick={() => {
                                            if (confirm('Bu şablonu silmek istediğinize emin misiniz?')) {
                                                deleteTemplate(template.id);
                                            }
                                        }}
                                    >
                                        🗑️
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Yeni Şablon Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Yeni Şablon Oluştur"
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>İptal</Button>
                        <Button onClick={handleCreateTemplate}>Oluştur</Button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Input
                        label="Şablon Adı *"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Örn: Aylık KDV Beyannamesi"
                    />
                    <Input
                        label="İş Başlığı Şablonu *"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Örn: [Müşteri] - [Ay] KDV Beyannamesi"
                    />
                    <Select
                        label="Kategori *"
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        options={[{ value: '', label: 'Seçin...' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
                    />
                    <Select
                        label="Öncelik"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                        options={Object.entries(PRIORITY_LABELS).map(([v, l]) => ({ value: v, label: l }))}
                    />
                    <Textarea
                        label="Açıklama"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Şablon açıklaması..."
                    />

                    <div>
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
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            const newSubtasks = formData.subtasks.filter((_, i) => i !== index);
                                            setFormData({ ...formData, subtasks: newSubtasks });
                                        }}
                                    >
                                        ✕
                                    </Button>
                                )}
                            </div>
                        ))}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFormData({ ...formData, subtasks: [...formData.subtasks, ''] })}
                        >
                            ➕ Alt görev ekle
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Şablondan İş Oluştur Modal */}
            <Modal
                isOpen={isCreateTaskModalOpen}
                onClose={() => {
                    setIsCreateTaskModalOpen(false);
                    setSelectedTemplate(null);
                }}
                title={`Şablondan İş Oluştur: ${selectedTemplate?.name}`}
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsCreateTaskModalOpen(false)}>İptal</Button>
                        <Button onClick={handleCreateTaskFromTemplate}>Oluştur</Button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Select
                        label="Müşteri *"
                        value={taskFormData.clientId}
                        onChange={(e) => setTaskFormData({ ...taskFormData, clientId: e.target.value })}
                        options={[{ value: '', label: 'Seçin...' }, ...clients.map((c) => ({ value: c.id, label: c.name }))]}
                    />
                    <Input
                        label="Son Tarih"
                        type="date"
                        value={taskFormData.dueDate}
                        onChange={(e) => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
                    />

                    <div>
                        <label className="form-label">Atanacak Kişiler</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {assignableUsers.map((u) => (
                                <label
                                    key={u.id}
                                    className="form-checkbox"
                                    style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem' }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={taskFormData.assignees.includes(u.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setTaskFormData({ ...taskFormData, assignees: [...taskFormData.assignees, u.id] });
                                            } else {
                                                setTaskFormData({ ...taskFormData, assignees: taskFormData.assignees.filter((id) => id !== u.id) });
                                            }
                                        }}
                                    />
                                    {u.name}
                                </label>
                            ))}
                        </div>
                    </div>

                    {selectedTemplate && selectedTemplate.subtasks.length > 0 && (
                        <div>
                            <label className="form-label">Dahil Edilecek Alt Görevler</label>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                {selectedTemplate.subtasks.map((s, i) => (
                                    <div key={i}>• {s}</div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
}
