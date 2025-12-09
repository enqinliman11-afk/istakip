'use client';

import React, { useState } from 'react';
import { useData } from '@/lib/data-context';
import { Client } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';

export default function ClientsPage() {
    const { clients, tasks, addClient, updateClient, deleteClient } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [clientName, setClientName] = useState('');

    const openModal = (client?: Client) => {
        if (client) {
            setEditingClient(client);
            setClientName(client.name);
        } else {
            setEditingClient(null);
            setClientName('');
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingClient(null);
        setClientName('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingClient) {
            updateClient(editingClient.id, clientName);
        } else {
            addClient(clientName);
        }
        closeModal();
    };

    const handleDelete = (client: Client) => {
        const taskCount = tasks.filter((t) => t.clientId === client.id).length;
        if (confirm(`"${client.name}" müşterisini silmek istediğinize emin misiniz? Bu işlem müşteriye ait ${taskCount} işi de silecektir.`)) {
            deleteClient(client.id);
        }
    };

    const getTaskCount = (clientId: string) => {
        return tasks.filter((t) => t.clientId === clientId).length;
    };

    return (
        <>
            <header className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">Müşteri Yönetimi</h1>
                    <div className="page-actions">
                        <Button onClick={() => openModal()}>➕ Yeni Müşteri</Button>
                    </div>
                </div>
            </header>

            <div className="page-body">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Müşteri / Firma Adı</th>
                                <th>İş Sayısı</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map((client) => (
                                <tr key={client.id}>
                                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                                        🏢 {client.name}
                                    </td>
                                    <td>{getTaskCount(client.id)}</td>
                                    <td>
                                        <div className="table-actions">
                                            <Button variant="ghost" size="sm" onClick={() => openModal(client)}>
                                                ✏️ Düzenle
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(client)}>
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
                title={editingClient ? 'Müşteri Düzenle' : 'Yeni Müşteri'}
                footer={
                    <>
                        <Button variant="secondary" onClick={closeModal}>
                            İptal
                        </Button>
                        <Button onClick={handleSubmit}>
                            {editingClient ? 'Güncelle' : 'Oluştur'}
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleSubmit}>
                    <Input
                        label="Müşteri / Firma Adı"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Örn: ABC Teknoloji A.Ş."
                        required
                        autoFocus
                    />
                </form>
            </Modal>
        </>
    );
}
