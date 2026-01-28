import { useState, useCallback } from 'react';
import { loadRazorpayScript } from '../utils/loadRazorpayScript.js';
import { createRazorpayOrder, verifyRazorpayPayment, convertToPaise } from '../api/paymentApi.js';
import { getOrderByPaymentId } from '../api/orderApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { RAZORPAY_CONFIG } from '../utils/constants.js';

/**
 * Custom hook for Razorpay payment integration
 * Handles the complete payment flow: order creation, payment processing, and verification
 */
const useRazorpayPayment = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    /**
     * Start the payment process
     * @param {Object} paymentData - The payment data
     * @param {string} paymentData.referenceType - The reference type ('GIG' or 'PROPOSAL')
     * @param {string} paymentData.referenceId - The reference ID (UUID)
     * @param {number} paymentData.amount - The amount in rupees
     * @param {Function} onSuccess - Success callback function
     * @param {Function} onFailure - Failure callback function
     * @returns {Promise<boolean>} Success status
     */
    const startPayment = useCallback(async ({
        referenceType,
        referenceId,
        amount,
        onSuccess,
        onFailure
    }) => {
        try {
            setIsLoading(true);
            setError(null);

            // Validate input parameters
            if (!referenceType || !referenceId || !amount) {
                throw new Error('Missing required payment parameters');
            }

            if (!user) {
                throw new Error('User authentication required');
            }

            if (amount <= 0) {
                throw new Error('Invalid payment amount');
            }

            // Step 1: Load Razorpay script
            const isScriptLoaded = await loadRazorpayScript();
            if (!isScriptLoaded) {
                throw new Error('Failed to load Razorpay checkout');
            }

            // Step 2: Create order from backend
            const orderData = {
                referenceType,
                referenceId,
                amount: convertToPaise(amount), // Convert to paise
            };

            const orderResponse = await createRazorpayOrder(orderData);
            const { orderId, amount: orderAmount, currency, key } = orderResponse;

            // Step 3: Configure Razorpay options
            const options = {
                key: orderResponse.key || RAZORPAY_CONFIG.KEY_ID, // Razorpay key ID from backend or env
                amount: orderAmount, // Amount in paise
                currency: currency,
                order_id: orderId,
                name: "Freelancing Platform",
                description: referenceType === 'GIG' ? "Gig Purchase" : "Proposal Payment",
                image: "", // Add your logo URL here if needed
                handler: async function (response) {
                    await handlePaymentSuccess(response, {
                        orderId,
                        referenceType,
                        referenceId,
                        amount,
                        onSuccess,
                        onFailure
                    });
                },
                prefill: {
                    name: user.name || '',
                    email: user.email || '',
                    contact: user.phone || '',
                },
                notes: {
                    referenceType,
                    referenceId,
                },
                theme: {
                    color: "#10b981", // Match your brand color
                },
                modal: {
                    ondismiss: function () {
                        // Handle payment modal dismissal
                        setIsLoading(false);
                        const dismissError = new Error('Payment cancelled by user');
                        setError(dismissError.message);
                        if (onFailure) {
                            onFailure(dismissError);
                        }
                    }
                },
                retry: {
                    enabled: true,
                    max_count: 3,
                },
                timeout: 300, // 5 minutes timeout
                remember_customer: false,
            };

            // Step 5: Open Razorpay checkout
            const rzp = new window.Razorpay(options);

            // Handle payment failure
            rzp.on('payment.failed', function (response) {
                console.error('Payment failed:', response.error);
                const paymentError = new Error(response.error.description || 'Payment failed');
                setError(paymentError.message);
                setIsLoading(false);
                if (onFailure) {
                    onFailure(paymentError);
                }
            });

            rzp.open();
            return true;

        } catch (error) {
            console.error('Payment initiation failed:', error);
            setError(error.message);
            setIsLoading(false);
            if (onFailure) {
                onFailure(error);
            }
            return false;
        }
    }, [user]);

    /**
     * Handle payment success flow with verification and order retrieval
     * Following backend team's recommended workflow
     */
    const handlePaymentSuccess = useCallback(async (razorpayResponse, paymentContext) => {
        const {
            orderId,
            referenceType,
            referenceId,
            amount,
            onSuccess,
            onFailure
        } = paymentContext;

        try {
            // Step 1: Verify payment with backend
            const verificationData = {
                orderId: orderId,
                paymentId: razorpayResponse.razorpay_payment_id,
                signature: razorpayResponse.razorpay_signature,
            };

            const verificationResult = await verifyRazorpayPayment(verificationData);

            // Step 2: Get the created order details using payment ID (Razorpay order ID)
            const orderDetails = await getOrderByPaymentId(orderId);

            console.log('Order created successfully:', orderDetails);

            // Payment and order retrieval successful
            setIsLoading(false);

            if (onSuccess) {
                onSuccess({
                    paymentId: razorpayResponse.razorpay_payment_id,
                    orderId: orderId,
                    orderDetails: orderDetails, // Include full order details
                    referenceType,
                    referenceId,
                    amount,
                    verificationResult,
                });
            }
        } catch (error) {
            console.error('Payment verification or order retrieval failed:', error);
            setError(error.message);
            setIsLoading(false);

            if (onFailure) {
                onFailure(error);
            }
        }
    }, []);

    /**
     * Clear any existing error
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        startPayment,
        isLoading,
        error,
        clearError,
    };
};

export default useRazorpayPayment;