export const useAlert = () => {
    const showAlert = (message, type = 'polite') => {
        const alertEl = document.createElement('div');
        alertEl.setAttribute('role', type === 'error' ? 'alert' : 'status');
        alertEl.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
        alertEl.textContent = message;
        alertEl.className = 'sr-alert';
        document.body.appendChild(alertEl);
        setTimeout(() => alertEl.remove(), 3000);
    };

    return { showAlert };
};