/**
 * Accessibility Utilities
 * Based on Siemens IX Accessibility Guidelines
 * https://ix.siemens.io/docs/guidelines/accessibility/code
 */

/**
 * Announce a message to screen readers using the live region
 * @param {string} message - Message to announce
 * @param {'polite' | 'assertive'} priority - Announcement priority
 */
export const announce = (message, priority = 'polite') => {
    const announcer = document.getElementById('live-announcer');
    if (announcer) {
        // Clear the previous message
        announcer.textContent = '';

        // Set the priority
        announcer.setAttribute('aria-live', priority);

        // Use setTimeout to ensure the DOM update triggers the announcement
        setTimeout(() => {
            announcer.textContent = message;
        }, 100);
    }
};

/**
 * Announce a polite message (non-interruptive)
 * @param {string} message - Message to announce
 */
export const announcePolitely = (message) => announce(message, 'polite');

/**
 * Announce an assertive message (interruptive - for errors/urgent)
 * @param {string} message - Message to announce
 */
export const announceAssertively = (message) => announce(message, 'assertive');

/**
 * Generate a unique ID for ARIA relationships
 * @param {string} prefix - Prefix for the ID
 * @returns {string} Unique ID
 */
export const generateAriaId = (prefix = 'aria') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Trap focus within a container (for modals/dialogs)
 * @param {HTMLElement} container - Container element
 * @returns {Function} Cleanup function to remove the trap
 */
export const trapFocus = (container) => {
    const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleKeydown = (event) => {
        if (event.key === 'Tab') {
            if (event.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    event.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    event.preventDefault();
                }
            }
        }
    };

    container.addEventListener('keydown', handleKeydown);

    // Return cleanup function
    return () => {
        container.removeEventListener('keydown', handleKeydown);
    };
};

/**
 * Check if user prefers reduced motion
 * @returns {boolean} True if user prefers reduced motion
 */
export const prefersReducedMotion = () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get appropriate animation duration based on user preference
 * @param {number} normalDuration - Normal duration in ms
 * @returns {number} Adjusted duration
 */
export const getAnimationDuration = (normalDuration = 300) => {
    return prefersReducedMotion() ? 0 : normalDuration;
};
