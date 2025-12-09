'use client';

import React, { useState } from 'react';
import { useData } from '@/lib/data-context';
import { Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';

export default function CategoriesPage() {
    const { categories, tasks, addCategory, updateCategory, deleteCategory } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [categoryName, setCategoryName] = useState('');

    const openModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setCategoryName(category.name);
        } else {
            setEditingCategory(null);
            setCategoryName('');
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        setCategoryName('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            updateCategory(editingCategory.id, categoryName);
        } else {
            addCategory(categoryName);
        }
        closeModal();
    };

    const handleDelete = (category: Category) => {
        const taskCount = tasks.filter((t) => t.categoryId === category.id).length;
        if (confirm(`"${category.name}" kategorisini silmek istediğinize emin misiniz? Bu işlem kategoriye ait ${taskCount} işi de silecektir.`)) {
            deleteCategory(category.id);
        }
    };

    const getTaskCount = (categoryId: string) => {
        return tasks.filter((t) => t.categoryId === categoryId).length;
    };

    return (
        <>
            <header className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">Kategori Yönetimi</h1>
                    <div className="page-actions">
                        <Button onClick={() => openModal()}>➕ Yeni Kategori</Button>
                    </div>
                </div>
            </header>

            <div className="page-body">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Kategori Adı</th>
                                <th>İş Sayısı</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((category) => (
                                <tr key={category.id}>
                                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                                        📁 {category.name}
                                    </td>
                                    <td>{getTaskCount(category.id)}</td>
                                    <td>
                                        <div className="table-actions">
                                            <Button variant="ghost" size="sm" onClick={() => openModal(category)}>
                                                ✏️ Düzenle
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(category)}>
                                                🗑️ Sil
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
                footer={
                    <>
                        <Button variant="secondary" onClick={closeModal}>
                            İptal
                        </Button>
                        <Button onClick={handleSubmit}>
                            {editingCategory ? 'Güncelle' : 'Oluştur'}
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleSubmit}>
                    <Input
                        label="Kategori Adı"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        placeholder="Örn: Fatura, Beyanname, Bordro..."
                        required
                        autoFocus
                    />
                </form>
            </Modal>
        </>
    );
}
