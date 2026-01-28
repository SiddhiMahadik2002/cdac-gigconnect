import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getClientOrders, getFreelancerOrders } from '../api/orderApi.js';
import { USER_ROLES, ORDER_STATUS } from '../utils/constants.js';
import { formatCurrency } from '../utils/nameMapper.js';
import Loader from '../components/common/Loader.jsx';
import Button from '../components/common/Button.jsx';
import { Link } from 'react-router-dom';
import styles from './MyOrdersPage.module.css';

/**
 * My Orders Page - Shows client's gig orders or freelancer's received orders
 */
const MyOrdersPage = () => {
    const { user, role } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('ALL');
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        if (user) {
            loadOrders();
        }
    }, [user, filter, page]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            setError('');

            let ordersData;
            const options = {
                page,
                size: 10,
                ...(filter !== 'ALL' && { status: filter })
            };

            if (role === USER_ROLES.CLIENT) {
                ordersData = await getClientOrders(options);
            } else if (role === USER_ROLES.FREELANCER) {
                ordersData = await getFreelancerOrders(user.id, options);
            }

            if (page === 0) {
                setOrders(ordersData.content || []);
            } else {
                setOrders(prev => [...prev, ...(ordersData.content || [])]);
            }

            setHasMore(!ordersData.last);
        } catch (err) {
            console.error('Failed to load orders:', err);
            setError('Failed to load orders. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        setPage(prev => prev + 1);
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setPage(0);
    };

    const getOrderStatusInfo = (status) => {
        const statusMap = {
            [ORDER_STATUS.CONFIRMED]: { label: 'Confirmed', color: 'blue', icon: '✓' },
            [ORDER_STATUS.IN_PROGRESS]: { label: 'In Progress', color: 'orange', icon: '🔄' },
            [ORDER_STATUS.DELIVERED]: { label: 'Delivered', color: 'purple', icon: '📦' },
            [ORDER_STATUS.REVISION_REQUESTED]: { label: 'Revision Requested', color: 'yellow', icon: '🔄' },
            [ORDER_STATUS.COMPLETED]: { label: 'Completed', color: 'green', icon: '✅' },
            [ORDER_STATUS.CANCELLED]: { label: 'Cancelled', color: 'red', icon: '❌' }
        };
        return statusMap[status] || { label: 'Unknown', color: 'gray', icon: '?' };
    };

    if (loading && page === 0) {
        return <Loader centered fullHeight text="Loading orders..." />;
    }

    return (
        <div className={styles.ordersPage}>
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>
                        {role === USER_ROLES.CLIENT ? 'My Orders' : 'Received Orders'}
                    </h1>
                    <p className={styles.subtitle}>
                        {role === USER_ROLES.CLIENT
                            ? 'Track your gig purchases and project progress'
                            : 'Manage orders from clients'}
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className={styles.filterTabs}>
                    {[
                        { key: 'ALL', label: 'All Orders' },
                        { key: ORDER_STATUS.CONFIRMED, label: 'Confirmed' },
                        { key: ORDER_STATUS.IN_PROGRESS, label: 'In Progress' },
                        { key: ORDER_STATUS.DELIVERED, label: 'Delivered' },
                        { key: ORDER_STATUS.COMPLETED, label: 'Completed' },
                        { key: ORDER_STATUS.CANCELLED, label: 'Cancelled' }
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            className={`${styles.filterTab} ${filter === key ? styles.active : ''}`}
                            onClick={() => handleFilterChange(key)}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                {error && (
                    <div className={styles.error}>
                        <p>{error}</p>
                        <Button onClick={loadOrders} variant="outline" size="small">
                            Try Again
                        </Button>
                    </div>
                )}

                {orders.length === 0 && !loading ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📋</div>
                        <h3>No Orders Found</h3>
                        <p>
                            {role === USER_ROLES.CLIENT
                                ? "You haven't placed any orders yet. Start by browsing gigs!"
                                : "You haven't received any orders yet. Create amazing gigs to attract clients!"}
                        </p>
                        <Link to="/gigs">
                            <Button variant="primary">
                                {role === USER_ROLES.CLIENT ? 'Browse Gigs' : 'View My Gigs'}
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className={styles.ordersList}>
                        {orders.map(order => (
                            <OrderCard key={order.id} order={order} userRole={role} />
                        ))}

                        {/* Load More Button */}
                        {hasMore && (
                            <div className={styles.loadMoreContainer}>
                                <Button
                                    onClick={loadMore}
                                    loading={loading}
                                    variant="outline"
                                    disabled={loading}
                                >
                                    {loading ? 'Loading...' : 'Load More Orders'}
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * Order Card Component
 */
const OrderCard = ({ order, userRole }) => {
    // Move getOrderStatusInfo function before it's used
    const getOrderStatusInfo = (status) => {
        const statusMap = {
            [ORDER_STATUS.CONFIRMED]: { label: 'Confirmed', color: 'blue', icon: '✓' },
            [ORDER_STATUS.IN_PROGRESS]: { label: 'In Progress', color: 'orange', icon: '🔄' },
            [ORDER_STATUS.DELIVERED]: { label: 'Delivered', color: 'purple', icon: '📦' },
            [ORDER_STATUS.REVISION_REQUESTED]: { label: 'Revision Requested', color: 'yellow', icon: '🔄' },
            [ORDER_STATUS.COMPLETED]: { label: 'Completed', color: 'green', icon: '✅' },
            [ORDER_STATUS.CANCELLED]: { label: 'Cancelled', color: 'red', icon: '❌' }
        };
        return statusMap[status] || { label: 'Unknown', color: 'gray', icon: '?' };
    };

    const statusInfo = getOrderStatusInfo(order.status);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={styles.orderCard}>
            <div className={styles.orderHeader}>
                <div className={styles.orderInfo}>
                    <h3 className={styles.gigTitle}>
                        {order.title || order.gigTitle || order.requirementTitle || 'Order'}
                    </h3>
                    <p className={styles.orderId}>Order #{order.id}</p>
                    {order.orderType && (
                        <span className={styles.orderType}>
                            {order.orderType === 'GIG_PURCHASE' ? '🛍️ Gig Purchase' : '🎯 Custom Project'}
                        </span>
                    )}
                </div>
                <div className={`${styles.statusBadge} ${styles[statusInfo.color]}`}>
                    <span className={styles.statusIcon}>{statusInfo.icon}</span>
                    <span>{statusInfo.label}</span>
                </div>
            </div>

            <div className={styles.orderDetails}>
                <div className={styles.detailRow}>
                    <span className={styles.label}>
                        {userRole === USER_ROLES.CLIENT ? 'Freelancer:' : 'Client:'}
                    </span>
                    <span className={styles.value}>
                        {userRole === USER_ROLES.CLIENT
                            ? order.freelancerName || order.freelancer?.name || 'Unknown'
                            : order.clientName || order.client?.name || 'Unknown'}
                    </span>
                </div>
                <div className={styles.detailRow}>
                    <span className={styles.label}>Amount:</span>
                    <span className={styles.value}>{formatCurrency(order.amount)}</span>
                </div>
                <div className={styles.detailRow}>
                    <span className={styles.label}>Order Date:</span>
                    <span className={styles.value}>{formatDate(order.createdAt)}</span>
                </div>
                {order.deliveryDate && (
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Delivery Date:</span>
                        <span className={styles.value}>{formatDate(order.deliveryDate)}</span>
                    </div>
                )}
            </div>

            {order.statusNote && (
                <div className={styles.statusNote}>
                    <strong>Note:</strong> {order.statusNote}
                </div>
            )}

            <div className={styles.orderActions}>
                <Link to={`/orders/${order.id}`}>
                    <Button variant="outline" size="small">
                        View Details
                    </Button>
                </Link>

                {userRole === USER_ROLES.CLIENT && order.gig && (
                    <Link to={`/gigs/${order.gig.id}`}>
                        <Button variant="outline" size="small">
                            View Gig
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    );
};

export default MyOrdersPage;