import React from 'react';
import { Status, Priority, Role, STATUS_LABELS, PRIORITY_LABELS, ROLE_LABELS } from '@/lib/types';

interface BadgeProps {
    children: React.ReactNode;
    className?: string;
}

export function Badge({ children, className = '' }: BadgeProps) {
    return <span className={`badge ${className}`}>{children}</span>;
}

export function StatusBadge({ status }: { status: Status }) {
    const classMap: Record<Status, string> = {
        SIRADA: 'badge-sirada',
        CALISILIYOR: 'badge-calisiliyor',
        KONTROLDE: 'badge-kontrolde',
        TAMAMLANDI: 'badge-tamamlandi',
    };
    return <Badge className={classMap[status]}>{STATUS_LABELS[status]}</Badge>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
    const classMap: Record<Priority, string> = {
        LOW: 'badge-low',
        MEDIUM: 'badge-medium',
        HIGH: 'badge-high',
        URGENT: 'badge-urgent',
    };
    return <Badge className={classMap[priority]}>{PRIORITY_LABELS[priority]}</Badge>;
}

export function RoleBadge({ role }: { role: Role }) {
    const classMap: Record<Role, string> = {
        ADMIN: 'badge-admin',
        TEAM_LEAD: 'badge-team-lead',
        ACCOUNTANT: 'badge-accountant',
        INTERN: 'badge-intern',
    };
    return <Badge className={classMap[role]}>{ROLE_LABELS[role]}</Badge>;
}
