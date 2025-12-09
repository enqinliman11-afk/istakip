'use client';

import React, { useState } from 'react';
import { useData } from '@/lib/data-context';
import { User, Role, ROLE_LABELS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { RoleBadge } from '@/components/ui/badge';

export default function UsersPage() {
    const { users, addUser, updateUser, deleteUser } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: '',
        role: 'ACCOUNTANT' as Role,
    });

    const openModal = (user?: User) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                username: user.username,
                password: '',
                name: user.name,
                role: user.role,
            });
        } else {
            setEditingUser(null);
            setFormData({
                username: '',
                password: '',
                name: '',
                role: 'ACCOUNTANT',
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            updateUser(editingUser.id, {
                username: formData.username,
                name: formData.name,
                role: formData.role,
                ...(formData.password && { password: formData.password }),
            });
        } else {
            addUser({
                username: formData.username,
                password: formData.password,
                name: formData.name,
                role: formData.role,
            });
        }
        closeModal();
    };

    const handleDelete = (user: User) => {
        if (user.role === 'ADMIN') {
            alert('Admin kullanıcısı silinemez!');
            return;
        }
        if (confirm(`"${user.name}" kullanıcısını silmek istediğinize emin misiniz?`)) {
            deleteUser(user.id);
        }
    };

    const roleOptions = Object.entries(ROLE_LABELS).map(([value, label]) => ({
        value,
        label,
    }));

    return (
        <>
            <header className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">Kullanıcı Yönetimi</h1>
                    <div className="page-actions">
                        <Button onClick={() => openModal()}>➕ Yeni Kullanıcı</Button>
                    </div>
                </div>
            </header>

            <div className="page-body">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Ad Soyad</th>
                                <th>Kullanıcı Adı</th>
                                <th>Rol</th>
                                <th>Kayıt Tarihi</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{user.name}</td>
                                    <td>{user.username}</td>
                                    <td>
                                        <RoleBadge role={user.role} />
                                    </td>
                                    <td>
                                        {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            <Button variant="ghost" size="sm" onClick={() => openModal(user)}>
                                                ✏️ Düzenle
                                            </Button>
                                            {user.role !== 'ADMIN' && (
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(user)}>
                                                    🗑️ Sil
                                                </Button>
                                            )}
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
                title={editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
                footer={
                    <>
                        <Button variant="secondary" onClick={closeModal}>
                            İptal
                        </Button>
                        <Button onClick={handleSubmit}>
                            {editingUser ? 'Güncelle' : 'Oluştur'}
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleSubmit}>
                    <Input
                        label="Ad Soyad"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Kullanıcı Adı"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        required
                    />
                    <Input
                        label={editingUser ? 'Yeni Şifre (boş bırakılırsa değişmez)' : 'Şifre'}
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required={!editingUser}
                    />
                    <Select
                        label="Rol"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                        options={roleOptions}
                    />
                </form>
            </Modal>
        </>
    );
}
