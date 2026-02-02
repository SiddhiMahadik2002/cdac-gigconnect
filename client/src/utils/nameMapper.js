// Name conversion utility for backend compatibility
export const toFullName = (firstName, lastName) =>
    `${firstName.trim()} ${lastName.trim()}`;

// Parse fullName back to firstName and lastName for UI display
export const parseFullName = (fullName) => {
    if (!fullName) return { firstName: '', lastName: '' };

    const parts = fullName.trim().split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';

    return { firstName, lastName };
};

// Format currency
export const formatCurrency = (amount, currency = 'INR') => {
    const num = Number(amount) || 0;
    if (currency === 'INR') {
        const formatted = new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(num);
        return `Rs ${formatted}`;
    }

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(num);
};

// Format date
export const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date(date));
};

// Debounce function for search inputs
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Generate unique ID
export const generateId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};