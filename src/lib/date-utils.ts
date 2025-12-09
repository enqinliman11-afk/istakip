/**
 * Tarih Yardımcı Fonksiyonları
 * Tüm uygulama genelinde tutarlı tarih formatlaması için
 * Timezone: Europe/Istanbul (UTC+3)
 */

const LOCALE = 'tr-TR';
const TIMEZONE = 'Europe/Istanbul';

// ==========================================
// FORMATLAMA FONKSİYONLARI
// ==========================================

/**
 * Kısa tarih formatı: "9 Ara 2025"
 */
export function formatDate(date: string | Date | undefined): string {
    if (!date) return '-';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '-';

    return d.toLocaleDateString(LOCALE, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: TIMEZONE,
    });
}

/**
 * Uzun tarih formatı: "9 Aralık 2025"
 */
export function formatDateLong(date: string | Date | undefined): string {
    if (!date) return '-';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '-';

    return d.toLocaleDateString(LOCALE, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: TIMEZONE,
    });
}

/**
 * Sadece saat formatı: "23:54"
 */
export function formatTime(date: string | Date | undefined): string {
    if (!date) return '-';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '-';

    return d.toLocaleTimeString(LOCALE, {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: TIMEZONE,
    });
}

/**
 * Tarih ve saat formatı: "9 Ara 2025, 23:54"
 */
export function formatDateTime(date: string | Date | undefined): string {
    if (!date) return '-';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '-';

    return d.toLocaleString(LOCALE, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: TIMEZONE,
    });
}

/**
 * Uzun tarih ve saat formatı: "9 Aralık 2025, 23:54"
 */
export function formatDateTimeLong(date: string | Date | undefined): string {
    if (!date) return '-';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '-';

    return d.toLocaleString(LOCALE, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: TIMEZONE,
    });
}

/**
 * Göreceli zaman formatı: "2 saat önce", "3 gün önce"
 */
export function formatRelative(date: string | Date | undefined): string {
    if (!date) return '-';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '-';

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);

    if (diffSec < 60) return 'Az önce';
    if (diffMin < 60) return `${diffMin} dakika önce`;
    if (diffHour < 24) return `${diffHour} saat önce`;
    if (diffDay < 7) return `${diffDay} gün önce`;
    if (diffWeek < 4) return `${diffWeek} hafta önce`;
    if (diffMonth < 12) return `${diffMonth} ay önce`;

    return formatDate(d);
}

/**
 * Kısa tarih (gün/ay): "9 Ara"
 */
export function formatDateShort(date: string | Date | undefined): string {
    if (!date) return '-';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '-';

    return d.toLocaleDateString(LOCALE, {
        day: 'numeric',
        month: 'short',
        timeZone: TIMEZONE,
    });
}

// ==========================================
// KONTROL FONKSİYONLARI
// ==========================================

/**
 * Tarih geçmiş mi? (overdue kontrolü)
 */
export function isOverdue(date: string | Date | undefined): boolean {
    if (!date) return false;
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return false;

    return d.getTime() < Date.now();
}

/**
 * Bugün mü?
 */
export function isToday(date: string | Date | undefined): boolean {
    if (!date) return false;
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return false;

    const today = new Date();
    return d.toDateString() === today.toDateString();
}

/**
 * Bu hafta mı?
 */
export function isThisWeek(date: string | Date | undefined): boolean {
    if (!date) return false;
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return false;

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    return d >= startOfWeek && d < endOfWeek;
}

/**
 * Kalan gün sayısı
 */
export function getDaysRemaining(date: string | Date | undefined): number {
    if (!date) return 0;
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 0;

    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

// ==========================================
// HESAPLAMA FONKSİYONLARI
// ==========================================

/**
 * İki tarih arasındaki süreyi hesapla
 * Örnek: "2 saat 30 dakika" veya "3 gün 5 saat"
 */
export function calculateDuration(
    startDate: string | Date | undefined,
    endDate: string | Date | undefined
): string {
    if (!startDate || !endDate) return '-';

    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return '-';

    const diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) return '-';

    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const remainingHours = hours % 24;
    const remainingMinutes = minutes % 60;

    if (days > 0) {
        if (remainingHours > 0) {
            return `${days} gün ${remainingHours} saat`;
        }
        return `${days} gün`;
    }

    if (hours > 0) {
        if (remainingMinutes > 0) {
            return `${hours} saat ${remainingMinutes} dakika`;
        }
        return `${hours} saat`;
    }

    return `${minutes} dakika`;
}

/**
 * İki tarih arasındaki süreyi saat cinsinden hesapla
 */
export function calculateDurationHours(
    startDate: string | Date | undefined,
    endDate: string | Date | undefined
): number {
    if (!startDate || !endDate) return 0;

    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;

    const diffMs = end.getTime() - start.getTime();
    return Math.max(0, diffMs / (1000 * 60 * 60));
}

// ==========================================
// INPUT DÖNÜŞTÜRME FONKSİYONLARI
// ==========================================

/**
 * HTML date input için tarih string'i: "2025-12-09"
 */
export function toDateInputValue(date: string | Date | undefined): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

/**
 * HTML datetime-local input için tarih string'i: "2025-12-09T23:54"
 */
export function toDateTimeInputValue(date: string | Date | undefined): string {
    if (!date) {
        // Şu anki zamanı döndür
        return new Date().toISOString().slice(0, 16);
    }
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 16);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Şu anki zamanı ISO string olarak
 */
export function nowISO(): string {
    return new Date().toISOString();
}

/**
 * Şu anki zamanı datetime-local input formatında
 */
export function nowLocal(): string {
    return toDateTimeInputValue(new Date());
}

// ==========================================
// PARSE FONKSİYONLARI
// ==========================================

/**
 * String'den Date objesine çevir
 */
export function parseDate(date: string | undefined): Date | null {
    if (!date) return null;
    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d;
}

/**
 * Input value'dan ISO string'e çevir
 */
export function inputToISO(inputValue: string): string {
    if (!inputValue) return '';
    const d = new Date(inputValue);
    return isNaN(d.getTime()) ? '' : d.toISOString();
}
