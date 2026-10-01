export const TELEGRAM_CONFIG = {
    TOKEN: 'HIDDEN_IN_CLOUDFLARE',
    CHAT_ID: 'HIDDEN_IN_CLOUDFLARE',
    API_URL: 'https://white-bonus-3e20.davawirasena74.workers.dev'
};

export const escapeHTML = (text: string): string => {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};
