import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { getOrderDetailsByPaymentId } from '../utils/paymentUtils.js';
import { formatCurrency } from '../utils/nameMapper.js';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';
import styles from './OrderSuccessPage.module.css';

/**
 * Order Success Page - Shown after successful payment
 */
const OrderSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const orderId = searchParams.get('orderId');
    const paymentId = searchParams.get('paymentId');

    useEffect(() => {
        if (orderId) {
            fetchOrderDetails();
        } else {
            setError('No order ID provided');
            setLoading(false);
        }
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            // Use the enhanced payment utility with better error handling
            const orderData = await getOrderDetailsByPaymentId(orderId);
            setOrder(orderData);
        } catch (err) {
            console.error('Failed to fetch order details:', err);
            // Use the user-friendly error message from the utility
            setError(err.message || 'Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const handleContinue = () => {
        navigate('/my-orders');
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Loader centered fullHeight text="Loading order details..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <div className={styles.errorContent}>
                    <div className={styles.errorIcon}>❌</div>
                    <h2>Something went wrong</h2>
                    <p>{error}</p>
                    <div className={styles.errorActions}>
                        <Button onClick={() => navigate('/my-orders')} variant="primary">
                            Go to My Orders
                        </Button>
                        <Button onClick={() => navigate('/gigs')} variant="outline">
                            Browse More Gigs
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.successPage}>
            <div className={styles.container}>
                {/* Success Header */}
                <div className={styles.successHeader}>
                    <div className={styles.successIcon}>
                        <div className={styles.checkmark}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="m9 12 2 2 4-4" />
                                <circle cx="12" cy="12" r="10" />
                            </svg>
                        </div>
                    </div>
                    <h1 className={styles.successTitle}>Payment Successful!</h1>
                    <p className={styles.successSubtitle}>
                        Your order has been placed successfully. The freelancer will start working on your project soon.
                    </p>
                </div>

                {/* Order Details Card */}
                {order && (
                    <div className={styles.orderCard}>
                        <div className={styles.orderCardHeader}>
                            <h3>Order Details</h3>
                            <div className={styles.orderStatus}>
                                <span className={styles.statusBadge}>
                                    ✓ Confirmed
                                </span>
                            </div>
                        </div>

                        <div className={styles.orderInfo}>
                            <div className={styles.gigInfo}>
                                <h4 className={styles.gigTitle}>
                                    {order.title || order.gigTitle || order.requirementTitle || 'Order'}
                                </h4>
                                <p className={styles.freelancerName}>
                                    by {order.freelancerName || order.freelancer?.name || 'Freelancer'}
                                </p>
                                {order.orderType && (
                                    <span className={styles.orderType}>
                                        {order.orderType === 'GIG_PURCHASE' ? '🛍️ Gig Purchase' : '🎯 Custom Project'}
                                    </span>
                                )}
                            </div>

                            <div className={styles.orderMeta}>
                                <div className={styles.metaRow}>
                                    <span className={styles.metaLabel}>Order ID:</span>
                                    <span className={styles.metaValue}>#{order.id}</span>
                                </div>
                                <div className={styles.metaRow}>
                                    <span className={styles.metaLabel}>Amount Paid:</span>
                                    <span className={styles.metaValue}>{formatCurrency(order.amount)}</span>
                                </div>
                                {paymentId && (
                                    <div className={styles.metaRow}>
                                        <span className={styles.metaLabel}>Payment ID:</span>
                                        <span className={styles.metaValue}>{paymentId}</span>
                                    </div>
                                )}
                                <div className={styles.metaRow}>
                                    <span className={styles.metaLabel}>Order Date:</span>
                                    <span className={styles.metaValue}>
                                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                                {order.expectedDelivery && (
                                    <div className={styles.metaRow}>
                                        <span className={styles.metaLabel}>Expected Delivery:</span>
                                        <span className={styles.metaValue}>
                                            {new Date(order.expectedDelivery).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Next Steps */}
                <div className={styles.nextSteps}>
                    <h3>What happens next?</h3>
                    <div className={styles.stepsList}>
                        <div className={styles.step}>
                            <div className={styles.stepIcon}>1</div>
                            <div className={styles.stepContent}>
                                <h4>Freelancer Notification</h4>
                                <p>The freelancer has been notified about your order and will start working on it soon.</p>
                            </div>
                        </div>
                        <div className={styles.step}>
                            <div className={styles.stepIcon}>2</div>
                            <div className={styles.stepContent}>
                                <h4>Work in Progress</h4>
                                <p>You'll receive updates as the freelancer progresses with your project.</p>
                            </div>
                        </div>
                        <div className={styles.step}>
                            <div className={styles.stepIcon}>3</div>
                            <div className={styles.stepContent}>
                                <h4>Delivery & Review</h4>
                                <p>Once completed, you can review the work and request revisions if needed.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className={styles.actions}>
                    <Button onClick={handleContinue} variant="primary" size="large">
                        View My Orders
                    </Button>
                    <Link to="/gigs">
                        <Button variant="outline" size="large">
                            Browse More Gigs
                        </Button>
                    </Link>
                </div>

                {/* Support Note */}
                <div className={styles.supportNote}>
                    <p>
                        Need help with your order? <Link to="/support" className={styles.supportLink}>Contact Support</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccessPage;