/**
 * Payment utility functions following backend team's recommended patterns
 * Provides complete workflow functions for common payment scenarios
 */

import { createRazorpayOrder, verifyRazorpayPayment, convertToPaise } from '../api/paymentApi.js';
import { getOrderByPaymentId } from '../api/orderApi.js';
import { loadRazorpayScript } from './loadRazorpayScript.js';
import { RAZORPAY_CONFIG } from './constants.js';

/**
 * Complete gig purchase workflow
 * Implements the backend team's recommended flow
 */
export const purchaseGig = async (gigId, gigPrice, gigTitle, options = {}) => {
    const {
        onSuccess,
        onFailure,
        onProgress,
        userToken = null
    } = options;

    try {
        if (onProgress) onProgress('Creating payment order...');

        // Step 1: Create payment order
        const orderData = await createPaymentOrder('GIG', gigId, gigPrice);

        if (onProgress) onProgress('Opening payment gateway...');

        // Step 2: Open Razorpay checkout
        const paymentOptions = {
            key: RAZORPAY_CONFIG.KEY_ID,
            amount: convertToPaise(gigPrice),
            currency: 'INR',
            name: 'Freelancing Platform',
            description: `Purchase: ${gigTitle}`,
            order_id: orderData.orderId,
            handler: async function (response) {
                if (onProgress) onProgress('Verifying payment...');

                // Step 3: Verify payment and get order
                await handlePaymentVerificationAndOrder(response, {
                    onSuccess,
                    onFailure,
                    onProgress,
                    userToken
                });
            },
            modal: {
                ondismiss: function () {
                    if (onFailure) {
                        onFailure(new Error('Payment cancelled by user'));
                    }
                }
            }
        };

        const isScriptLoaded = await loadRazorpayScript();
        if (!isScriptLoaded) {
            throw new Error('Failed to load payment gateway');
        }

        const paymentObject = new window.Razorpay(paymentOptions);
        paymentObject.open();

    } catch (error) {
        console.error('Purchase failed:', error);
        if (onFailure) {
            onFailure(error);
        }
    }
};

/**
 * Complete proposal payment workflow
 * Similar to gig purchase but for proposals
 */
export const payProposal = async (proposalId, proposalAmount, proposalTitle, options = {}) => {
    return purchaseGig(proposalId, proposalAmount, `Proposal: ${proposalTitle}`, {
        ...options,
        referenceType: 'PROPOSAL'
    });
};

/**
 * Create payment order for any reference type
 * @private
 */
const createPaymentOrder = async (referenceType, referenceId, amount) => {
    const orderData = {
        referenceType,
        referenceId,
        amount: convertToPaise(amount)
    };

    return await createRazorpayOrder(orderData);
};

/**
 * Handle payment verification and order retrieval
 * Implements backend team's recommended verification flow
 * @private
 */
const handlePaymentVerificationAndOrder = async (razorpayResponse, options = {}) => {
    const { onSuccess, onFailure, onProgress, userToken } = options;

    try {
        if (onProgress) onProgress('Verifying payment...');

        // Step 1: Verify payment
        const verificationData = {
            orderId: razorpayResponse.razorpay_order_id,
            paymentId: razorpayResponse.razorpay_payment_id,
            signature: razorpayResponse.razorpay_signature
        };

        const verificationResult = await verifyRazorpayPayment(verificationData);

        if (onProgress) onProgress('Retrieving order details...');

        // Step 2: Get order details using payment ID (as recommended by backend team)
        const orderDetails = await getOrderByPaymentId(razorpayResponse.razorpay_order_id);

        // Step 3: Success callback with complete data
        if (onSuccess) {
            onSuccess({
                paymentData: razorpayResponse,
                orderDetails: orderDetails,
                verificationResult: verificationResult,
                message: `Order ${orderDetails.id} created successfully!`
            });
        }

        // Optional: Auto-redirect to order page after delay
        setTimeout(() => {
            if (window.location && orderDetails.id) {
                window.location.href = `/orders/${orderDetails.id}`;
            }
        }, 2000);

    } catch (error) {
        console.error('Payment verification or order retrieval failed:', error);

        if (onFailure) {
            onFailure(error);
        }
    }
};

/**
 * Get order details by payment ID with enhanced error handling
 * Wrapper function that provides user-friendly error messages
 */
export const getOrderDetailsByPaymentId = async (razorpayOrderId) => {
    try {
        return await getOrderByPaymentId(razorpayOrderId);
    } catch (error) {
        // Provide user-friendly error messages
        if (error.message.includes('Order not found')) {
            throw new Error('Order not found. The payment may not have been processed correctly.');
        } else if (error.message.includes('Access denied')) {
            throw new Error('You do not have permission to view this order.');
        } else if (error.message.includes('Network error')) {
            throw new Error('Unable to connect to the server. Please check your internet connection.');
        } else {
            throw new Error('Failed to retrieve order details. Please contact support if the issue persists.');
        }
    }
};

/**
 * Utility function to show success message and redirect
 * Following backend team's recommended UX pattern
 */
export const showOrderSuccess = (orderDetails) => {
    // This can be customized based on your notification system
    const message = `Order #${orderDetails.id} created successfully!`;

    // If using a toast/notification system
    if (window.showNotification) {
        window.showNotification(message, 'success');
    } else {
        alert(message); // Fallback
    }

    return message;
};

/**
 * Utility function to format payment success data for display
 */
export const formatPaymentSuccessData = (paymentData) => {
    const { orderDetails, paymentData: razorpayData } = paymentData;

    return {
        orderId: orderDetails.id,
        paymentId: razorpayData.razorpay_payment_id,
        title: orderDetails.title, // NEW field from unified response
        orderType: orderDetails.orderType, // NEW field
        orderSource: orderDetails.orderSource, // NEW field
        gigTitle: orderDetails.gigTitle, // Available for GIG_PURCHASE
        requirementTitle: orderDetails.requirementTitle, // Available for CUSTOM_PROJECT
        amount: orderDetails.amount,
        clientName: orderDetails.clientName,
        freelancerName: orderDetails.freelancerName,
        status: orderDetails.status, // CHANGED from orderStatus
        createdAt: orderDetails.createdAt,
        updatedAt: orderDetails.updatedAt, // NEW field
    };
};