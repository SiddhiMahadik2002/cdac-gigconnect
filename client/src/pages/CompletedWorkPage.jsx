import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getFreelancerOrders } from '../api/orderApi.js';
import { USER_ROLES, ORDER_STATUS } from '../utils/constants.js';
import { formatCurrency } from '../utils/nameMapper.js';
import Loader from '../components/common/Loader.jsx';
import Button from '../components/common/Button.jsx';
import { Link } from 'react-router-dom';
import styles from './MyOrdersPage.module.css';
import { CheckIcon, PackageIcon, ChartIcon } from '../components/icons/Icons.jsx';

const CompletedWorkPage = () => {
    const { user, role } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);

    useEffect(() => {
        if (user) loadCompleted();
    }, [user, page]);

    const loadCompleted = async () => {
        try {
            setLoading(true);
            setError('');

            const options = { page, size: 10, status: ORDER_STATUS.COMPLETED };
            const data = await getFreelancerOrders(user.id, options);

            const items = data.content || [];
            if (page === 0) setOrders(items);
            else setOrders(prev => [...prev, ...items]);

            setHasMore(!data.last);
        } catch (err) {
            console.error('Failed to load completed work:', err);
            setError('Failed to load completed work.');
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => setPage(prev => prev + 1);

    if (loading && page === 0) return <Loader centered fullHeight text="Loading completed work..." />;

    return (
        <div className={styles.ordersPage}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Completed Work</h1>
                    <p className={styles.subtitle}>All projects you've completed</p>
                </div>

                {error && (
                    <div className={styles.error}>
                        <p>{error}</p>
                        <Button onClick={loadCompleted} variant="outline" size="small">Try Again</Button>
                    </div>
                )}

                {orders.length === 0 && !loading ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}><CheckIcon /></div>
                        <h3>No Completed Work Yet</h3>
                        <p>When you finish projects, they'll appear here.</p>
                        <Link to="/requirements">
                            <Button variant="primary">Browse Requirements</Button>
                        </Link>
                    </div>
                ) : (
                    <div className={styles.ordersList}>
                        {orders.map(order => (
                            <div key={order.id} className={styles.orderCard}>
                                <div className={styles.orderHeader}>
                                    <div className={styles.orderInfo}>
                                        <h3 className={styles.gigTitle}>{order.title || order.requirementTitle || 'Completed Project'}</h3>
                                        <p className={styles.orderId}>Order #{order.id}</p>
                                        <span className={styles.orderType}>{order.orderType === 'GIG_PURCHASE' ? (<><PackageIcon /> <span>Gig</span></>) : (<><ChartIcon /> <span>Project</span></>)}</span>
                                    </div>
                                    <div className={`${styles.statusBadge} ${styles.green}`}>
                                        <span className={styles.statusIcon}><CheckIcon /></span>
                                        <span>Completed</span>
                                    </div>
                                </div>

                                <div className={styles.orderDetails}>
                                    <div className={styles.detailRow}>
                                        <span className={styles.label}>Client:</span>
                                        <span className={styles.value}>{order.clientName || 'Client'}</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span className={styles.label}>Amount:</span>
                                        <span className={styles.value}>{formatCurrency(order.amount)}</span>
                                    </div>
                                    {order.completedAt && (
                                        <div className={styles.detailRow}>
                                            <span className={styles.label}>Completed:</span>
                                            <span className={styles.value}>{new Date(order.completedAt).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.orderActions}>
                                    <Link to={`/requirements/${order.requirementId}`}>
                                        <Button variant="outline" size="small">View Requirement</Button>
                                    </Link>
                                    <Link to={`/orders/${order.id}`}>
                                        <Button variant="outline" size="small">View Details</Button>
                                    </Link>
                                </div>
                            </div>
                        ))}

                        {hasMore && (
                            <div className={styles.loadMoreContainer}>
                                <Button onClick={loadMore} loading={loading} variant="outline">{loading ? 'Loading...' : 'Load More'}</Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompletedWorkPage;
