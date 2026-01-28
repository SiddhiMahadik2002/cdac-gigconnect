import React, { useState } from 'react';
import Button from '../common/Button.jsx';
import useRazorpayPayment from '../../hooks/useRazorpayPayment.js';
import { formatCurrency } from '../../utils/nameMapper.js';
import styles from './PayNowButton.module.css';

/**
 * Reusable payment button component for Razorpay integration
 * Handles payment flow for gigs and proposals
 */
const PayNowButton = ({
    referenceType,
    referenceId,
    amount,
    onSuccess,
    onFailure,
    disabled = false,
    variant = 'primary',
    size = 'medium',
    fullWidth = false,
    className = '',
    children,
    ...props
}) => {
    const { startPayment, isLoading, error, clearError } = useRazorpayPayment();
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('success'); // 'success' or 'error'

    /**
     * Show toast notification
     */
    const showNotification = (message, type = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);

        // Auto-hide toast after 5 seconds
        setTimeout(() => {
            setShowToast(false);
        }, 5000);
    };

    /**
     * Handle payment button click
     */
    const handlePaymentClick = async () => {
        // Clear any existing errors
        clearError();

        try {
            await startPayment({
                referenceType,
                referenceId,
                amount,
                onSuccess: (paymentData) => {
                    // Enhanced success handling with order details
                    const { orderDetails, paymentId } = paymentData;

                    let successMessage = 'Payment completed successfully!';
                    if (orderDetails) {
                        successMessage = `Order #${orderDetails.id} created successfully! Payment ID: ${paymentId}`;
                    }

                    showNotification(successMessage, 'success');

                    if (onSuccess) {
                        onSuccess(paymentData);
                    }
                },
                onFailure: (error) => {
                    const errorMessage = error.message || 'Payment failed. Please try again.';
                    showNotification(errorMessage, 'error');
                    if (onFailure) {
                        onFailure(error);
                    }
                },
            });
        } catch (error) {
            const errorMessage = error.message || 'Failed to initiate payment. Please try again.';
            showNotification(errorMessage, 'error');
            if (onFailure) {
                onFailure(error);
            }
        }
    };

    /**
     * Get button content based on state
     */
    const getButtonContent = () => {
        if (isLoading) {
            return (
                <div className={styles.loadingContent}>
                    <div className={styles.spinner}></div>
                    <span>Processing Payment...</span>
                </div>
            );
        }

        if (children) {
            return children;
        }

        return (
            <div className={styles.buttonContent}>
                <svg
                    className={styles.paymentIcon}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                >
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                <span>Pay {formatCurrency(amount)}</span>
            </div>
        );
    };

    return (
        <>
            <Button
                variant={variant}
                size={size}
                fullWidth={fullWidth}
                loading={isLoading}
                disabled={disabled || isLoading}
                onClick={handlePaymentClick}
                className={`${styles.payNowButton} ${className}`}
                {...props}
            >
                {getButtonContent()}
            </Button>

            {/* Toast Notification */}
            {showToast && (
                <div className={`${styles.toast} ${styles[toastType]} ${showToast ? styles.show : ''}`}>
                    <div className={styles.toastContent}>
                        <div className={styles.toastIcon}>
                            {toastType === 'success' ? (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="m9 12 2 2 4-4" />
                                    <circle cx="12" cy="12" r="10" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="15" y1="9" x2="9" y2="15" />
                                    <line x1="9" y1="9" x2="15" y2="15" />
                                </svg>
                            )}
                        </div>
                        <span className={styles.toastMessage}>{toastMessage}</span>
                        <button
                            className={styles.toastClose}
                            onClick={() => setShowToast(false)}
                            aria-label="Close notification"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Error Display (optional, mainly for debugging) */}
            {error && !showToast && (
                <div className={styles.errorMessage}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}
        </>
    );
};

export default PayNowButton;