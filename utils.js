export const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

export const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00'); // Ensure date is parsed as local time
    return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const saveCards = (cards) => localStorage.setItem('cards', JSON.stringify(cards));

export const getCards = () => JSON.parse(localStorage.getItem('cards')) || [];

// NEW: Utility to set up modal close listeners
export const setupModalClose = (modalElement) => {
    if (!modalElement) return; // Add null check
    modalElement.addEventListener('click', (e) => {
        if (e.target.matches('.close') || e.target === modalElement) {
            modalElement.close();
        }
    });
};

// NEW: Alert-related utilities
export const saveAlertSettings = (settings) => localStorage.setItem('alertSettings', JSON.stringify(settings));

export const getAlertSettings = () => {
    const defaultSettings = {
        daysAdvance: 3, 
        enablePaymentDue: true,
        enableCutoffDate: false
    };
    return JSON.parse(localStorage.getItem('alertSettings')) || defaultSettings;
};

// Alert history for notifications: Tracks which notifications have been shown
export const saveAlertHistory = (history) => localStorage.setItem('alertNotificationHistory', JSON.stringify(history));

export const getAlertHistory = () => JSON.parse(localStorage.getItem('alertNotificationHistory')) || [];

export const markAlertAsSent = (notificationId) => {
    const history = getAlertHistory();
    if (!history.includes(notificationId)) {
        history.push(notificationId);
        saveAlertHistory(history);
    }
};

export const wasAlertSent = (notificationId) => {
    const history = getAlertHistory();
    return history.includes(notificationId);
};

// parseSpanishDate helper function 
const getMonthNumber = (monthName) => {
    if (!monthName) return '01';
    const months = {
        'ene': '01', 'feb': '02', 'mar': '03', 'abr': '04',
        'may': '05', 'jun': '06', 'jul': '07', 'ago': '08',
        'sep': '09', 'oct': '10', 'nov': '11', 'dic': '12'
    };
    return months[monthName.toLowerCase().trim()] || '01';
};

export const parseSpanishDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return null;
    
    try {
        let parts;
        // Try format with "de": "15 de ene de 2024"
        if (dateStr.includes(' de ')) {
            parts = dateStr.split(' de ');
            if (parts.length === 3) {
                const day = parts[0].padStart(2, '0');
                const month = getMonthNumber(parts[1]);
                const year = parts[2];
                return new Date(`${year}-${month}-${day}`);
            }
        }
        // Try format without "de": "15 ene 2024"
        parts = dateStr.split(' ');
        if (parts.length === 3) {
            const day = parts[0].padStart(2, '0');
            const month = getMonthNumber(parts[1]);
            const year = parts[2];
            return new Date(`${year}-${month}-${day}`);
        }
        
        // Fallback: try to parse as is (e.g., "YYYY-MM-DD")
        return new Date(dateStr);
    } catch (error) {
        console.warn('Could not parse date:', dateStr, error);
        return null;
    }
};