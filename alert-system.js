// Alert System Module - Handles alert checking and browser notification display

import { formatDate, formatCurrency, getAlertSettings, wasAlertSent, markAlertAsSent, parseSpanishDate } from './utils.js';
import { calculateCardDetails } from './calculations.js';

/**
 * Checks all cards for upcoming payment due dates and returns notification data.
 * @param {Array} cards - The array of card objects.
 * @returns {Array<Object>} An array of notification data objects.
 */
export const getNotificationsForCards = (cards) => {
    const settings = getAlertSettings();
    // Default to 3 days if settings don't provide it
    const daysAdvance = settings.daysAdvance || 3; 

    if (!settings.enablePaymentDue) {
        return []; // Notifications are disabled
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    
    const notificationsData = [];

    cards.forEach(card => {
        const details = calculateCardDetails(card);
        const paymentDueDate = parseSpanishDate(details.paymentDueDate);

        if (paymentDueDate) {
            paymentDueDate.setHours(0, 0, 0, 0); // Normalize to start of day
            const daysUntilPayment = Math.ceil((paymentDueDate - today) / (1000 * 60 * 60 * 24));
            
            // Check if the payment is due in 'daysAdvance' days and hasn't been notified yet
            if (daysUntilPayment === daysAdvance && details.paymentForPeriod > 0) {
                // Ensure the alias is used, and fallback to bank if alias is empty for the title
                const cardDisplayName = card.alias ? card.alias : card.bank;
                const notificationId = `payment-due-${card.id}-${paymentDueDate.toISOString().split('T')[0]}`;
                
                if (!wasAlertSent(notificationId)) {
                    // Message format: "[Nombre de la tarjeta]: Recuerda que debes pagar al menos [monto] antes del [fecha límite] para evitar intereses."
                    const message = `${cardDisplayName} (${card.bank}): Recuerda que debes pagar al menos ${formatCurrency(details.paymentForPeriod)} antes del ${details.paymentDueDate} para evitar intereses.`;
                    
                    notificationsData.push({
                        id: notificationId,
                        title: `¡Pago de ${cardDisplayName} pronto!`,
                        body: message,
                        icon: '/icon-cards.png' // Use an existing icon asset
                    });
                }
            }
        }
    });

    return notificationsData;
};

/**
 * Displays a browser notification.
 * @param {Object} notificationData - Object containing id, title, body, and icon.
 */
export const showBrowserNotification = (notificationData) => {
    // Check if Notification API is supported and permission is granted
    if ('Notification' in window && Notification.permission === 'granted') {
        const { id, title, body, icon } = notificationData;
        
        // Show the notification
        // Note: For true Web Push notifications (which arrive when browser is closed),
        // you would use navigator.serviceWorker.ready.then(registration => registration.showNotification(title, options));
        // However, this requires a backend to send push events to the service worker.
        // As per the prompt's "sin backend" constraint, we are using client-side Notification API.
        const notification = new Notification(title, {
            body: body,
            icon: icon,
            tag: id, // Use tag to group/replace notifications
            renotify: true // Allow re-notifying if new info comes (might show multiple times for same tag depending on browser)
        });

        // Mark this specific notification as sent to prevent immediate re-display
        markAlertAsSent(id);

        // Optional: Handle click event for the notification
        notification.onclick = () => {
            console.log('Notification clicked:', id);
            // You could bring the app to foreground, navigate to a specific card, etc.
            // window.focus(); // May work, but browser security policies vary.
        };

        notification.onclose = () => {
            console.log('Notification closed:', id);
        };

    } else if (Notification.permission === 'denied') {
        console.warn('Notification permission denied by user. Cannot show browser notifications.');
    } else {
        console.warn('Notification API not supported or permission not yet requested/granted. User needs to grant permission.');
    }
};

// Helper function to convert month names to numbers
const getMonthNumber = (monthName) => {
    if (!monthName) return '01';
    const months = {
        'ene': '01', 'feb': '02', 'mar': '03', 'abr': '04',
        'may': '05', 'jun': '06', 'jul': '07', 'ago': '08',
        'sep': '09', '10': 'oct', 'nov': '11', 'dic': '12' // Fixed typo for oct, added 10 for 0-indexed month
    };
    // Ensure monthName is lowercase and trim spaces
    return months[monthName.toLowerCase().trim()] || '01';
};

// Helper function to parse Spanish formatted dates
// This function is still needed here as it was used directly in checkForAlerts.
// It's also in utils.js. Let's make sure `alert-system.js` uses the one from `utils.js` consistently.
// Current `alert-system.js` already imports `parseSpanishDate` from `utils.js`, so this local helper can be removed.
// Just ensuring `parseSpanishDate` in utils.js is robust.
/*
const parseSpanishDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return null;
    
    try {
        let parts;
        if (dateStr.includes(' de ')) {
            parts = dateStr.split(' de ');
            if (parts.length === 3) {
                const day = parts[0].padStart(2, '0');
                const month = getMonthNumber(parts[1]);
                const year = parts[2];
                return new Date(`${year}-${month}-${day}`);
            }
        }
        parts = dateStr.split(' ');
        if (parts.length === 3) {
            const day = parts[0].padStart(2, '0');
            const month = getMonthNumber(parts[1]);
            const year = parts[2];
            return new Date(`${year}-${month}-${day}`);
        }
        return new Date(dateStr);
    } catch (error) {
        console.warn('Could not parse date:', dateStr, error);
        return null;
    }
};
*/