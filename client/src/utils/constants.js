// API Base URL - adjust based on your backend setup
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

// User roles
export const USER_ROLES = {
    CLIENT: 'CLIENT',
    FREELANCER: 'FREELANCER',
};

// Local storage keys
export const STORAGE_KEYS = {
    USER_DATA: 'user_data', // Keep this for any non-sensitive user preferences
    AUTH_TOKEN: 'auth_token', // Key used to store auth token when applicable
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
    REQUIREMENTS: '/requirements',
    PROPOSALS: '/proposals',
    PAYMENTS: {
        CREATE: '/payments/create-order',
        VERIFY: '/payments/verify',
    },
    GIG_ORDERS: {
        BASE: '/orders',
        BY_CLIENT: '/orders/my-orders',
        BY_FREELANCER: '/orders/my-work',
        BY_PAYMENT_ID: '/orders/payment',
        UPDATE_STATUS: '/orders/{id}/status',
        COMPLETE: '/orders/{id}/complete',
        START_WORK: '/orders/{id}/start-work',
        DELIVER: '/orders/{id}/deliver',
        APPROVE: '/orders/{id}/approve',
        REQUEST_REVISION: '/orders/{id}/request-revision',
        PURCHASE_GIG: '/orders/gig/{gigId}/purchase',
        ACCEPT_PROPOSAL: '/orders/proposal/{proposalId}/accept',
    },
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

// Order status constants
export const ORDER_STATUS = {
    PENDING_PAYMENT: 'PENDING_PAYMENT',
    CONFIRMED: 'CONFIRMED',
    IN_PROGRESS: 'IN_PROGRESS',
    DELIVERED: 'DELIVERED',
    REVISION_REQUESTED: 'REVISION_REQUESTED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    REFUNDED: 'REFUNDED',
};

// Order types - NEW
export const ORDER_TYPE = {
    GIG_PURCHASE: 'GIG_PURCHASE',
    CUSTOM_PROJECT: 'CUSTOM_PROJECT',
};

// Order source - NEW  
export const ORDER_SOURCE = {
    DIRECT_GIG: 'DIRECT_GIG',
    PROPOSAL_ACCEPTANCE: 'PROPOSAL_ACCEPTANCE',
};

// Razorpay configuration
export const RAZORPAY_CONFIG = {
    KEY_ID: import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_S8RNMZsxP10KBU',
    CURRENCY: 'INR',
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

// Proposal Status Definitions
export const PROPOSAL_STATUS = {
    PENDING: 'PENDING',
    ACCEPTED: 'ACCEPTED',
    REJECTED: 'REJECTED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETION_REQUESTED: 'COMPLETION_REQUESTED',
    AWAITING_COMPLETION: 'AWAITING_COMPLETION', // Backend uses this
    REVISION_REQUESTED: 'REVISION_REQUESTED',
    COMPLETED: 'COMPLETED',
};

// Requirement Status Definitions
export const REQUIREMENT_STATUS = {
    OPEN: 'OPEN',
    IN_PROGRESS: 'IN_PROGRESS',
    CLOSED: 'CLOSED',
    COMPLETED: 'COMPLETED',
};

// Status Display Configuration (for UI)
export const STATUS_CONFIG = {
    // Proposal Statuses
    [PROPOSAL_STATUS.PENDING]: {
        label: 'Pending Review',
        icon: '⏳',
        color: '#3b82f6',
        description: 'Waiting for client decision',
    },
    [PROPOSAL_STATUS.ACCEPTED]: {
        label: 'Accepted',
        icon: '✅',
        color: '#10b981',
        description: 'Proposal accepted, ready to start',
    },
    [PROPOSAL_STATUS.REJECTED]: {
        label: 'Rejected',
        icon: '❌',
        color: '#ef4444',
        description: 'Proposal not selected',
    },
    [PROPOSAL_STATUS.IN_PROGRESS]: {
        label: 'In Progress',
        icon: '🔥',
        color: '#f97316',
        description: 'Work is ongoing',
    },
    [PROPOSAL_STATUS.COMPLETION_REQUESTED]: {
        label: 'Awaiting Approval',
        icon: '⏳',
        color: '#3b82f6',
        description: 'Work submitted, awaiting client approval',
    },
    [PROPOSAL_STATUS.AWAITING_COMPLETION]: {
        label: 'Awaiting Approval',
        icon: '⏳',
        color: '#3b82f6',
        description: 'Work submitted, awaiting client approval',
    },
    // Some backends use SUBMITTED_FOR_REVIEW for the same lifecycle state
    SUBMITTED_FOR_REVIEW: {
        label: 'Awaiting Approval',
        icon: '⏳',
        color: '#3b82f6',
        description: 'Work submitted, awaiting client approval',
    },
    [PROPOSAL_STATUS.REVISION_REQUESTED]: {
        label: 'Revision Needed',
        icon: '🔄',
        color: '#f97316',
        description: 'Client requested changes',
    },
    [PROPOSAL_STATUS.COMPLETED]: {
        label: 'Completed',
        icon: '✓',
        color: '#10b981',
        description: 'Project successfully completed',
    },
    // Requirement Statuses
    [REQUIREMENT_STATUS.OPEN]: {
        label: 'Open',
        icon: '📢',
        color: '#10b981',
        description: 'Accepting proposals',
    },
    [REQUIREMENT_STATUS.IN_PROGRESS]: {
        label: 'In Progress',
        icon: '🔥',
        color: '#f97316',
        description: 'Work in progress',
    },
    [REQUIREMENT_STATUS.CLOSED]: {
        label: 'Closed',
        icon: '🔒',
        color: '#6b7280',
        description: 'No longer accepting proposals',
    },
    [REQUIREMENT_STATUS.COMPLETED]: {
        label: 'Completed',
        icon: '✓',
        color: '#10b981',
        description: 'Project completed',
    },
};

// Business Logic: Which statuses allow specific actions
export const STATUS_PERMISSIONS = {
    // Freelancer can request completion (updated for order statuses)
    canRequestCompletion: [
        // Old proposal statuses (for backward compatibility)
        PROPOSAL_STATUS.ACCEPTED,
        PROPOSAL_STATUS.IN_PROGRESS,
        PROPOSAL_STATUS.REVISION_REQUESTED,
        // New order statuses
        ORDER_STATUS.CONFIRMED,
        ORDER_STATUS.IN_PROGRESS,
        ORDER_STATUS.REVISION_REQUESTED,
    ],
    // Client can accept proposal
    canAcceptProposal: [
        PROPOSAL_STATUS.PENDING,
    ],
    // Client can approve/reject completion
    canReviewCompletion: [
        PROPOSAL_STATUS.COMPLETION_REQUESTED,
        PROPOSAL_STATUS.AWAITING_COMPLETION,
        // Order statuses that indicate delivery/submission for review
        ORDER_STATUS.DELIVERED,
        // Backend may return this string for submitted-for-review
        'SUBMITTED_FOR_REVIEW',
    ],
    // Orders/Proposals considered "active" for freelancer dashboard (updated for order statuses)
    activeProposals: [
        // Old proposal statuses (for backward compatibility)
        PROPOSAL_STATUS.ACCEPTED,
        PROPOSAL_STATUS.IN_PROGRESS,
        PROPOSAL_STATUS.COMPLETION_REQUESTED,
        PROPOSAL_STATUS.AWAITING_COMPLETION,
        PROPOSAL_STATUS.REVISION_REQUESTED,
        PROPOSAL_STATUS.COMPLETED,
        // New order statuses
        ORDER_STATUS.CONFIRMED,
        ORDER_STATUS.IN_PROGRESS,
        ORDER_STATUS.DELIVERED,
        ORDER_STATUS.REVISION_REQUESTED,
        ORDER_STATUS.COMPLETED,
    ],
    // Requirements that accept new proposals
    acceptingProposals: [
        REQUIREMENT_STATUS.OPEN,
    ],
};