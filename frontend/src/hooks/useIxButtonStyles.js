import { useEffect } from 'react';

/**
 * IX Button stillerini Shadow DOM içine inject eden hook
 * Sadece border-radius değiştirir
 */
const useIxButtonStyles = () => {
    useEffect(() => {
        const injectStyles = () => {
            const ixButtons = document.querySelectorAll('ix-button');
            const ixIconButtons = document.querySelectorAll('ix-icon-button');
            
            const buttonStyles = `
                button {
                    border-radius: 12px !important;
                }
            `;
            
            const iconButtonStyles = `
                button {
                    border-radius: 10px !important;
                }
            `;

            ixButtons.forEach(btn => {
                if (btn.shadowRoot && !btn.shadowRoot.querySelector('#custom-ix-styles')) {
                    const styleEl = document.createElement('style');
                    styleEl.id = 'custom-ix-styles';
                    styleEl.textContent = buttonStyles;
                    btn.shadowRoot.appendChild(styleEl);
                }
            });

            ixIconButtons.forEach(btn => {
                if (btn.shadowRoot && !btn.shadowRoot.querySelector('#custom-ix-styles')) {
                    const styleEl = document.createElement('style');
                    styleEl.id = 'custom-ix-styles';
                    styleEl.textContent = iconButtonStyles;
                    btn.shadowRoot.appendChild(styleEl);
                }
            });
        };

        // İlk çalıştırma - biraz gecikme ile
        setTimeout(injectStyles, 200);

        // MutationObserver ile yeni butonları izle
        const observer = new MutationObserver(() => {
            setTimeout(injectStyles, 100);
        });

        observer.observe(document.body, { childList: true, subtree: true });

        return () => observer.disconnect();
    }, []);
};

export default useIxButtonStyles;