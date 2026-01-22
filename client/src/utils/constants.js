// API Base URL - adjust based on your backend setup
export const API_BASE_URL = 'http://localhost:8080/api/v1';

// User roles
export const USER_ROLES = {
    CLIENT: 'CLIENT',
    FREELANCER: 'FREELANCER',
};

// Local storage keys
export const STORAGE_KEYS = {
    USER_DATA: 'user_data', // Keep this for any non-sensitive user preferences
};

// API endpoints
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        ME: '/auth/me',
    },
    GIGS: '/gigs',
    FREELANCER: '/freelancer',
};

// Pagination
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 12,
    MAX_PAGE_SIZE: 50,
};

// File upload
export const FILE_UPLOAD = {
    MAX_IMAGES: 3,
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
};

// Form validation
export const VALIDATION = {
    MIN_PASSWORD_LENGTH: 6,
    MAX_TITLE_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 2000,
    MIN_PRICE: 5,
    MAX_PRICE: 10000,
};

// Toast notification types
export const TOAST_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
};

// Skills list (can be expanded based on your needs)
export const COMMON_SKILLS = [
    'JavaScript',
    'React',
    'Node.js',
    'Python',
    'Java',
    'HTML/CSS',
    'UI/UX Design',
    'Graphic Design',
    'Content Writing',
    'SEO',
    'Digital Marketing',
    'Data Analysis',
    'WordPress',
    'Mobile Development',
    'Machine Learning',
];