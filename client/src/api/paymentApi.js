import apiClient from './axios.js';
import { API_ENDPOINTS, RAZORPAY_CONFIG } from '../utils/constants.js';

/**
 * Create a new Razorpay order
 * @param {Object} orderData - The order data
 * @param {string} orderData.referenceType - The reference type ('GIG' or 'PROPOSAL')
 * @param {string} orderData.referenceId - The reference ID (UUID)
 * @param {number} orderData.amount - The amount in paise (smallest currency unit)
 * @returns {Promise<Object>} The order creation response
 */
export const createRazorpayOrder = async (orderData) => {
    try {
        // Convert the format to match backend expectations from integration guide
        const requestData = {
            amount: orderData.amount, // Should already be in paise
            currency: "INR",
            referenceType: orderData.referenceType,
            referenceId: orderData.referenceId
        };

        const response = await apiClient.post(API_ENDPOINTS.PAYMENTS.CREATE, requestData);

        if (!response.data) {
            throw new Error('Invalid response from server');
        }

        const { orderId, amount, currency, key } = response.data;

        // Validate required fields
        if (!orderId || !amount || !currency) {
            throw new Error('Incomplete order data received from server');
        }

        return {
            orderId,
            amount,
            currency,
            key: key || RAZORPAY_CONFIG.KEY_ID,
        };
    } catch (error) {
        // Handle different types of errors
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;

            if (status === 400) {
                throw new Error(data.message || 'Invalid order request');
            } else if (status === 401) {
                throw new Error('Authentication required');
            } else if (status === 403) {
                throw new Error('Not authorized to create order');
            } else if (status >= 500) {
                throw new Error('Server error. Please try again later');
            } else {
                throw new Error(data.message || 'Failed to create order');
            }
        } else if (error.request) {
            // Network error
            throw new Error('Network error. Please check your connection');
        } else {
            // Other error
            throw error;
        }
    }
};

/**
 * Verify a Razorpay payment
 * @param {Object} verificationData - The payment verification data
 * @param {string} verificationData.orderId - The Razorpay order ID
 * @param {string} verificationData.paymentId - The Razorpay payment ID
 * @param {string} verificationData.signature - The Razorpay signature
 * @returns {Promise<Object>} The verification response
 */
export const verifyRazorpayPayment = async (verificationData) => {
    try {
        const response = await apiClient.post(API_ENDPOINTS.PAYMENTS.VERIFY, verificationData);

        if (!response.data) {
            throw new Error('Invalid response from server');
        }

        return response.data;
    } catch (error) {
        // Handle different types of errors
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;

            if (status === 400) {
                throw new Error(data.message || 'Invalid payment verification request');
            } else if (status === 401) {
                throw new Error('Authentication required');
            } else if (status === 403) {
                throw new Error('Not authorized to verify payment');
            } else if (status === 422) {
                throw new Error('Payment verification failed. Invalid signature');
            } else if (status >= 500) {
                throw new Error('Server error. Please try again later');
            } else {
                throw new Error(data.message || 'Payment verification failed');
            }
        } else if (error.request) {
            // Network error
            throw new Error('Network error. Please check your connection');
        } else {
            // Other error
            throw error;
        }
    }
};

/**
 * Convert amount to paise (smallest currency unit)
 * @param {number} amount - Amount in rupees
 * @returns {number} Amount in paise
 */
export const convertToPaise = (amount) => {
    return Math.round(amount * 100);
};

/**
 * Convert amount from paise to rupees
 * @param {number} paise - Amount in paise
 * @returns {number} Amount in rupees
 */
export const convertFromPaise = (paise) => {
    return paise / 100;
};