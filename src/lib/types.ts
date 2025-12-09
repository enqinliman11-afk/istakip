// Roller
export type Role = 'ADMIN' | 'TEAM_LEAD' | 'ACCOUNTANT' | 'INTERN';

// Öncelik
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

// Durum
export type Status = 'SIRADA' | 'CALISILIYOR' | 'KONTROLDE' | 'TAMAMLANDI';

// Kullanıcı
export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: Role;
  createdAt: string;
}

// Kategori
export interface Category {
  id: string;
  name: string;
}

// Müşteri
export interface Client {
  id: string;
  name: string;
}

// İş
export interface Task {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  clientId: string;
  periodMonth?: number;
  periodYear?: number;
  priority: Priority;
  status: Status;
  dueDate?: string;
  createdById: string;
  createdAt: string;
  // Zaman takibi
  startTime?: string; // İşe başlama zamanı (CALISILIYOR'a geçişte)
  endTime?: string;   // İşi bitirme zamanı (KONTROLDE'ye geçişte)
}

// İş Ataması
export interface TaskAssignment {
  id: string;
  taskId: string;
  userId: string;
  isOwner: boolean;
}

// Durum Log
export interface TaskStatusLog {
  id: string;
  taskId: string;
  oldStatus: Status;
  newStatus: Status;
  changedById: string;
  note?: string;
  changedAt: string;
}

// Rol etiketleri
export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Yönetici',
  TEAM_LEAD: 'Ekip Şefi',
  ACCOUNTANT: 'Muhasebeci',
  INTERN: 'Stajyer'
};

// Durum etiketleri
export const STATUS_LABELS: Record<Status, string> = {
  SIRADA: 'Sırada',
  CALISILIYOR: 'Çalışılıyor',
  KONTROLDE: 'Kontrolde',
  TAMAMLANDI: 'Tamamlandı'
};

// Öncelik etiketleri
export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'Düşük',
  MEDIUM: 'Orta',
  HIGH: 'Yüksek',
  URGENT: 'Acil'
};

// Bildirim Türleri
export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'STATUS_CHANGED'
  | 'COMMENT_ADDED'
  | 'DUE_DATE_NEAR'
  | 'TASK_OVERDUE'
  | 'SUBTASK_COMPLETED';

// Bildirim
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  taskId?: string;
  isRead: boolean;
  createdAt: string;
}

// Alt Görev
export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  completedAt?: string;
  completedById?: string;
  createdAt: string;
}

// Yorum
export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

// İş Şablonu
export interface TaskTemplate {
  id: string;
  name: string;
  title: string;
  description: string;
  categoryId: string;
  priority: Priority;
  subtasks: string[]; // Alt görev başlıkları
  createdById: string;
  createdAt: string;
}

// Tekrar Sıklığı
export type RecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

// Tekrarlayan İş
export interface RecurringTask {
  id: string;
  templateId?: string;
  title: string;
  description: string;
  categoryId: string;
  clientId: string;
  priority: Priority;
  frequency: RecurrenceFrequency;
  dayOfMonth?: number; // Aylık için
  dayOfWeek?: number; // Haftalık için (0-6)
  nextRunDate: string;
  isActive: boolean;
  assigneeIds: string[];
  createdById: string;
  createdAt: string;
}

// Bildirim Etiketleri
export const NOTIFICATION_LABELS: Record<NotificationType, string> = {
  TASK_ASSIGNED: 'İş Atandı',
  STATUS_CHANGED: 'Durum Değişti',
  COMMENT_ADDED: 'Yorum Eklendi',
  DUE_DATE_NEAR: 'Son Tarih Yaklaşıyor',
  TASK_OVERDUE: 'İş Gecikmiş',
  SUBTASK_COMPLETED: 'Alt Görev Tamamlandı'
};

// Tekrar Sıklığı Etiketleri
export const FREQUENCY_LABELS: Record<RecurrenceFrequency, string> = {
  DAILY: 'Günlük',
  WEEKLY: 'Haftalık',
  MONTHLY: 'Aylık',
  YEARLY: 'Yıllık'
};
