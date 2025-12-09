'use client';

import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Modal } from '@/components/ui/modal';

interface Shortcut {
    key: string;
    description: string;
    action: () => void;
}

export function useKeyboardShortcuts() {
    const router = useRouter();
    const { user } = useAuth();
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const getShortcuts = useCallback((): Shortcut[] => {
        if (!user) return [];

        const baseShortcuts: Shortcut[] = [
            { key: '*', description: 'Kısayolları göster', action: () => setIsHelpOpen(true) },
            { key: 'Escape', description: 'Yardımı kapat', action: () => setIsHelpOpen(false) },
        ];

        if (user.role === 'ADMIN') {
            return [
                ...baseShortcuts,
                { key: 'd', description: 'Dashboard', action: () => router.push('/admin') },
                { key: 't', description: 'Tüm İşler', action: () => router.push('/admin/tasks') },
                { key: 'x', description: 'Tamamlananlar', action: () => router.push('/admin/completed') },
                { key: 'u', description: 'Kullanıcılar', action: () => router.push('/admin/users') },
                { key: 'c', description: 'Kategoriler', action: () => router.push('/admin/categories') },
                { key: 'm', description: 'Müşteriler', action: () => router.push('/admin/clients') },
                { key: 's', description: 'Şablonlar', action: () => router.push('/admin/templates') },
            ];
        }

        if (user.role === 'TEAM_LEAD') {
            return [
                ...baseShortcuts,
                { key: 'd', description: 'Dashboard', action: () => router.push('/team-lead') },
                { key: 't', description: 'İş Listesi', action: () => router.push('/team-lead/tasks') },
                { key: 'x', description: 'Tamamlananlar', action: () => router.push('/team-lead/completed') },
                { key: 'n', description: 'Yeni İş', action: () => router.push('/team-lead/tasks/new') },
            ];
        }

        return [
            ...baseShortcuts,
            { key: 'd', description: 'Dashboard', action: () => router.push('/employee') },
        ];
    }, [user, router]);

    useEffect(() => {
        const shortcuts = getShortcuts();

        const handleKeyDown = (e: KeyboardEvent) => {
            // Input veya textarea'da ise çık
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                return;
            }

            const key = e.key.toLowerCase();
            const shortcut = shortcuts.find((s) => s.key.toLowerCase() === key);

            if (shortcut) {
                e.preventDefault();
                shortcut.action();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [getShortcuts]);

    return { isHelpOpen, setIsHelpOpen, shortcuts: getShortcuts() };
}

export function KeyboardShortcutsHelp() {
    const { isHelpOpen, setIsHelpOpen, shortcuts } = useKeyboardShortcuts();

    return (
        <Modal
            isOpen={isHelpOpen}
            onClose={() => setIsHelpOpen(false)}
            title="Klavye Kısayolları"
            size="md"
        >
            <div className="shortcuts-list">
                {shortcuts.map((shortcut) => (
                    <div key={shortcut.key} className="shortcut-item">
                        <span className="shortcut-description">{shortcut.description}</span>
                        <kbd className="shortcut-key">{shortcut.key}</kbd>
                    </div>
                ))}
            </div>
        </Modal>
    );
}
