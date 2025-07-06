export const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

export const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00'); // Ensure date is parsed as local time
    return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const saveCards = (cards) => localStorage.setItem('cards', JSON.stringify(cards));

export const getCards = () => JSON.parse(localStorage.getItem('cards')) || [];

// Utility to set up modal close listeners
export const setupModalClose = (modalElement) => {
    if (!modalElement) return; // Add null check
    modalElement.addEventListener('click', (e) => {
        if (e.target.matches('.close') || e.target === modalElement) {
            modalElement.close();
        }
    });
};

// Alert-related utilities
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

// Helper function to convert localized month names to numbers
// Expected monthName format from formatDate is like "may.", "jun.", etc.
const getMonthNumber = (monthName) => {
    // Remove the dot if present and convert to lowercase for comparison
    const cleanMonthName = monthName.replace('.', '').toLowerCase().trim();
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const index = months.indexOf(cleanMonthName);
    if (index > -1) {
        return (index + 1).toString().padStart(2, '0'); // Return 0-indexed month number + 1, padded
    }
    return null; // Return null if month name is not found
};

export const parseSpanishDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return null;
    
    try {
        // Expected format from formatDate: "DD MMM. YYYY" (e.g., "15 may. 2024")
        const parts = dateStr.split(' ');
        if (parts.length === 3) {
            const day = parts[0].padStart(2, '0');
            const monthNumber = getMonthNumber(parts[1]);
            const year = parts[2];

            if (monthNumber) { // Check if month was successfully mapped
                // Create Date object in YYYY-MM-DD format to avoid locale issues
                return new Date(`${year}-${monthNumber}-${day}T00:00:00`); 
            }
        }
        
        // Fallback for standard ISO or other universally parsable formats (e.g., "YYYY-MM-DD")
        const genericDate = new Date(dateStr);
        if (!isNaN(genericDate.getTime())) { // Check if it's a valid date
            return genericDate;
        }

        console.warn('Could not parse date with any known format:', dateStr);
        return null;
    } catch (error) {
        console.warn('Error during date parsing:', dateStr, error);
        return null;
    }
};