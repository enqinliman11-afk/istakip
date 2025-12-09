import { Role, Status } from './types';

// Durum geçiş kuralları - Hangi rol hangi geçişleri yapabilir
export const STATUS_TRANSITIONS: Record<Role, { from: Status; to: Status }[]> = {
    ADMIN: [
        { from: 'SIRADA', to: 'CALISILIYOR' },
        { from: 'SIRADA', to: 'KONTROLDE' },
        { from: 'SIRADA', to: 'TAMAMLANDI' },
        { from: 'CALISILIYOR', to: 'SIRADA' },
        { from: 'CALISILIYOR', to: 'KONTROLDE' },
        { from: 'CALISILIYOR', to: 'TAMAMLANDI' },
        { from: 'KONTROLDE', to: 'SIRADA' },
        { from: 'KONTROLDE', to: 'CALISILIYOR' },
        { from: 'KONTROLDE', to: 'TAMAMLANDI' },
        { from: 'TAMAMLANDI', to: 'SIRADA' },
        { from: 'TAMAMLANDI', to: 'CALISILIYOR' },
        { from: 'TAMAMLANDI', to: 'KONTROLDE' },
    ],
    TEAM_LEAD: [
        { from: 'SIRADA', to: 'CALISILIYOR' },
        { from: 'SIRADA', to: 'KONTROLDE' },
        { from: 'SIRADA', to: 'TAMAMLANDI' },
        { from: 'CALISILIYOR', to: 'SIRADA' },
        { from: 'CALISILIYOR', to: 'KONTROLDE' },
        { from: 'CALISILIYOR', to: 'TAMAMLANDI' },
        { from: 'KONTROLDE', to: 'SIRADA' },
        { from: 'KONTROLDE', to: 'CALISILIYOR' },
        { from: 'KONTROLDE', to: 'TAMAMLANDI' },
        { from: 'TAMAMLANDI', to: 'SIRADA' },
        { from: 'TAMAMLANDI', to: 'CALISILIYOR' },
        { from: 'TAMAMLANDI', to: 'KONTROLDE' },
    ],
    ACCOUNTANT: [
        { from: 'SIRADA', to: 'CALISILIYOR' },
        { from: 'CALISILIYOR', to: 'KONTROLDE' },
    ],
    INTERN: [
        { from: 'SIRADA', to: 'CALISILIYOR' },
        { from: 'CALISILIYOR', to: 'KONTROLDE' },
    ],
};

// Rol bazlı izinler
export const PERMISSIONS: Record<Role, {
    canManageUsers: boolean;
    canManageCategories: boolean;
    canManageClients: boolean;
    canViewAllTasks: boolean;
    canCreateTasks: boolean;
    canAssignToAnyone: boolean;
    canAssignToNonAdmin: boolean;
}> = {
    ADMIN: {
        canManageUsers: true,
        canManageCategories: true,
        canManageClients: true,
        canViewAllTasks: true,
        canCreateTasks: true,
        canAssignToAnyone: true,
        canAssignToNonAdmin: true,
    },
    TEAM_LEAD: {
        canManageUsers: false,
        canManageCategories: false,
        canManageClients: false,
        canViewAllTasks: true,
        canCreateTasks: true,
        canAssignToAnyone: false,
        canAssignToNonAdmin: true,
    },
    ACCOUNTANT: {
        canManageUsers: false,
        canManageCategories: false,
        canManageClients: false,
        canViewAllTasks: false,
        canCreateTasks: false,
        canAssignToAnyone: false,
        canAssignToNonAdmin: false,
    },
    INTERN: {
        canManageUsers: false,
        canManageCategories: false,
        canManageClients: false,
        canViewAllTasks: false,
        canCreateTasks: false,
        canAssignToAnyone: false,
        canAssignToNonAdmin: false,
    },
};

// Belirli bir geçişin geçerli olup olmadığını kontrol et
export function canTransition(role: Role, fromStatus: Status, toStatus: Status): boolean {
    return STATUS_TRANSITIONS[role].some(
        (t) => t.from === fromStatus && t.to === toStatus
    );
}

// Belirli bir durumdan geçilebilecek durumları getir
export function getAvailableTransitions(role: Role, currentStatus: Status): Status[] {
    return STATUS_TRANSITIONS[role]
        .filter((t) => t.from === currentStatus)
        .map((t) => t.to);
}
