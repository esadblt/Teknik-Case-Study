/**
 * Toast Notification Utility
 * Siemens IX Design System compliant toast notifications
 * Uses showToast from @siemens/ix-react
 * @module utils/toast
 */

import { showToast as ixShowToast } from '@siemens/ix-react';
import { setToastPosition } from '@siemens/ix';

// Set toast position to top-right on module load
setToastPosition('top-right');

/**
 * Toast types mapping
 */
const TOAST_TYPES = {
    success: 'success',
    error: 'error',
    warning: 'warning',
    info: 'info'
};

/**
 * Show a toast notification using Siemens IX toast component
 * 
 * @param {string} message - The message to display
 * @param {('success'|'error'|'warning'|'info')} type - Toast type
 * @param {Object} options - Additional configuration
 * @param {string} options.title - Optional title for the toast
 * @param {boolean} options.autoClose - Whether to auto close (default: true)
 * @param {number} options.autoCloseDelay - Delay in ms before auto close (default: 5000)
 * @returns {Promise} Toast instance
 */
export const showToast = async (message, type = 'info', options = {}) => {
    const { 
        title, 
        autoClose = true, 
        autoCloseDelay = 5000 
    } = options;

    try {
        const toastInstance = await ixShowToast({
            message: message,
            title: title,
            type: TOAST_TYPES[type] || 'info',
            autoClose: autoClose,
            autoCloseDelay: autoCloseDelay
        });
        
        return toastInstance;
    } catch (error) {
        console.error('Toast error:', error);
    }
};

/**
 * Convenience methods for different toast types
 */
showToast.success = (message, options = {}) => {
    return showToast(message, 'success', { title: 'Başarılı', ...options });
};

showToast.error = (message, options = {}) => {
    return showToast(message, 'error', { title: 'Hata', ...options });
};

showToast.warning = (message, options = {}) => {
    return showToast(message, 'warning', { title: 'Uyarı', ...options });
};

showToast.info = (message, options = {}) => {
    return showToast(message, 'info', { title: 'Bilgi', ...options });
};

export default showToast;
