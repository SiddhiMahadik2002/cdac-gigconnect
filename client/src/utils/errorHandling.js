/**
 * Error handling utilities for API responses
 * Handles common error scenarios as outlined in the integration guide
 */

/**
 * Handle API errors with proper status code handling
 * @param {Error} error - The error object
 * @param {Response} response - The response object (if available)
 * @returns {string} User-friendly error message
 */
export const handleApiError = (error, response = null) => {
    // Check for response status codes
    if (response) {
        switch (response.status) {
            case 401:
                // Unauthorized - clear tokens and redirect to login
                localStorage.removeItem('authToken');
                localStorage.removeItem('user_data');

                // Only redirect if not already on login page
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
                return 'Your session has expired. Please log in again.';

            case 403:
                // Forbidden - access denied
                return 'Access denied. You don\'t have permission for this action.';

            case 404:
                // Not found
                return 'The requested resource was not found.';

            case 409:
                // Conflict
                return 'This action conflicts with existing data. Please refresh and try again.';

            case 422:
                // Unprocessable Entity - validation errors
                return error.message || 'Invalid data provided. Please check your input.';

            case 429:
                // Too many requests
                return 'Too many requests. Please wait a moment and try again.';

            case 500:
            case 502:
            case 503:
            case 504:
                // Server errors
                return 'Server error. Please try again later.';

            default:
                if (response.status >= 400 && response.status < 500) {
                    // Client errors
                    return error.message || 'Request failed. Please check your input.';
                } else if (response.status >= 500) {
                    // Server errors
                    return 'Server error. Please try again later.';
                }
        }
    }

    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return 'Network error. Please check your internet connection.';
    }

    // Handle timeout errors
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
        return 'Request timeout. Please try again.';
    }

    // Default error message
    return error.message || 'Something went wrong. Please try again.';
};

/**
 * Handle payment-specific errors
 * @param {Error} error - The payment error
 * @returns {string} User-friendly payment error message
 */
export const handlePaymentError = (error) => {
    const errorMessage = error.message?.toLowerCase() || '';

    if (errorMessage.includes('cancel') || errorMessage.includes('dismiss')) {
        return 'Payment was cancelled by user.';
    }

    if (errorMessage.includes('network') || errorMessage.includes('connection')) {
        return 'Network error during payment. Please check your connection and try again.';
    }

    if (errorMessage.includes('verification') || errorMessage.includes('signature')) {
        return 'Payment verification failed. Please contact support if amount was deducted.';
    }

    if (errorMessage.includes('card') || errorMessage.includes('declined')) {
        return 'Payment failed. Please check your card details or try a different payment method.';
    }

    if (errorMessage.includes('insufficient') || errorMessage.includes('balance')) {
        return 'Payment failed due to insufficient balance. Please check your account.';
    }

    if (errorMessage.includes('limit') || errorMessage.includes('exceeded')) {
        return 'Payment failed due to transaction limit. Please contact your bank.';
    }

    if (errorMessage.includes('expired') || errorMessage.includes('invalid')) {
        return 'Payment failed due to invalid or expired payment details.';
    }

    // Default payment error
    return error.message || 'Payment failed. Please try again or contact support.';
};

/**
 * Log errors for debugging (in development) or error tracking (in production)
 * @param {string} context - Context where the error occurred
 * @param {Error} error - The error object
 * @param {Object} metadata - Additional metadata about the error
 */
export const logError = (context, error, metadata = {}) => {
    const errorInfo = {
        context,
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        ...metadata
    };

    // In development, log to console
    if (import.meta.env.DEV) {
        console.error('Error Log:', errorInfo);
    }

    // In production, send to error tracking service (e.g., Sentry)
    if (import.meta.env.PROD) {
        // Example: Send to error tracking service
        // Sentry.captureException(error, { extra: errorInfo });

        // Or send to custom error endpoint
        // fetch('/api/errors', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(errorInfo)
        // }).catch(() => {}); // Silently fail if error logging fails
    }
};

/**
 * Create a standardized error object
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {Object} details - Additional error details
 * @returns {Error} Standardized error object
 */
export const createError = (message, code = 'UNKNOWN_ERROR', details = {}) => {
    const error = new Error(message);
    error.code = code;
    error.details = details;
    return error;
};

/**
 * Retry wrapper for API calls
 * @param {Function} apiCall - The API call function
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Delay between retries in milliseconds
 * @returns {Promise} The API call result
 */
export const retryApiCall = async (apiCall, maxRetries = 3, delay = 1000) => {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await apiCall();
        } catch (error) {
            lastError = error;

            // Don't retry for client errors (4xx) except 429 (rate limit)
            if (error.response?.status >= 400 && error.response?.status < 500 && error.response?.status !== 429) {
                throw error;
            }

            // Don't retry on the last attempt
            if (attempt === maxRetries) {
                break;
            }

            // Wait before retrying with exponential backoff
            await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
    }

    throw lastError;
};

/**
 * Validate environment variables and provide helpful error messages
 */
export const validateEnvironment = () => {
    const requiredEnvVars = [
        'VITE_API_BASE_URL',
        'VITE_RAZORPAY_KEY'
    ];

    const missing = requiredEnvVars.filter(envVar => !import.meta.env[envVar]);

    if (missing.length > 0) {
        const errorMessage = `Missing required environment variables: ${missing.join(', ')}\n\nPlease check your .env file and ensure all required variables are set.`;

        console.error(errorMessage);

        // In development, show a more helpful error
        if (import.meta.env.DEV) {
            alert(errorMessage);
        }

        throw new Error('Environment configuration incomplete');
    }
};

/**
 * Check if user has a valid authentication token
 * @returns {boolean} True if user appears to be authenticated
 */
export const isUserAuthenticated = () => {
    const token = localStorage.getItem('authToken');
    return !!(token && token !== 'null' && token !== 'undefined');
};

/**
 * Safe JSON parse with error handling
 * @param {string} jsonString - JSON string to parse
 * @param {*} defaultValue - Default value if parsing fails
 * @returns {*} Parsed object or default value
 */
export const safeJsonParse = (jsonString, defaultValue = null) => {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.warn('Failed to parse JSON:', jsonString, error);
        return defaultValue;
    }
};

/**
 * Format error for user display
 * @param {Error|string} error - Error to format
 * @returns {string} Formatted error message
 */
export const formatErrorForUser = (error) => {
    if (typeof error === 'string') {
        return error;
    }

    if (error?.message) {
        return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
};