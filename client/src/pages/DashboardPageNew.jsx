import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import styles from './DashboardPage.module.css';
import { BriefcaseIcon, MoneyIcon, PackageIcon, StarIcon, FlashIcon, PersonIcon, ChartIcon, NoteIcon, WarningIcon } from '../components/icons/Icons.jsx';
import { formatCurrency } from '../utils/nameMapper.js';

const DashboardPage = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError('');

                // Mock data for demo
                const mockStats = {
                    totalGigs: 5,
                    activeGigs: 3,
                    totalEarnings: 2400,
                    thisMonthEarnings: 650,
                    totalOrders: 12,
                    activeOrders: 3,
                    completedOrders: 9,
                    averageRating: 4.8,
                    profileViews: 234,
                    profileCompleteness: 85
                };

                const mockActivity = [
                    {
                        id: 1,
                        type: 'order',
                        icon: <BriefcaseIcon />,
                        title: 'New order received',
                        description: 'React Development project from John Doe',
                        time: '2 hours ago',
                        amount: 'Rs 299'
                    },
                    {
                        id: 2,
                        type: 'gig',
                        icon: <FlashIcon />,
                        title: 'Gig performance boost',
                        description: 'Your "Website Design" gig got 15 new views',
                        time: '1 day ago',
                        amount: null
                    },
                    {
                        id: 3,
                        type: 'profile',
                        icon: <PersonIcon />,
                        title: 'Profile viewed',
                        description: '5 potential clients viewed your profile',
                        time: '2 days ago',
                        amount: null
                    }
                ];

                setStats(mockStats);
                setRecentActivity(mockActivity);
            } catch (err) {
                setError('Failed to load dashboard data');
                console.error('Dashboard error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Loader />
            </div>
        );
    }

    return (
        <div className={styles.dashboard}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <h1 className={styles.title}>
                            Welcome back, {user?.fullName?.split(' ')[0] || 'Freelancer'}!
                        </h1>
                        <p className={styles.subtitle}>
                            Here's an overview of your freelancing journey and recent activity
                        </p>
                    </div>
                    <div className={styles.headerActions}>
                        <Link to="/freelancer/gigs/new">
                            <Button>Create New Gig</Button>
                        </Link>
                    </div>
                </div>

                {error && (
                    <div className={styles.errorAlert}>
                        <span className={styles.errorIcon}><WarningIcon /></span>
                        {error}
                    </div>
                )}

                {/* Stats Grid */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}><BriefcaseIcon /></div>
                        <div className={styles.statContent}>
                            <h3 className={styles.statValue}>{stats?.totalGigs || 0}</h3>
                            <p className={styles.statLabel}>Total Gigs</p>
                            <span className={styles.statSubtext}>{stats?.activeGigs || 0} active</span>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIcon}><MoneyIcon /></div>
                        <div className={styles.statContent}>
                            <h3 className={styles.statValue}>{formatCurrency(stats?.totalEarnings || 0)}</h3>
                            <p className={styles.statLabel}>Total Earnings</p>
                            <span className={styles.statSubtext}>+{formatCurrency(stats?.thisMonthEarnings || 0)} this month</span>
                        </div>
                    </div>

                    {stats?.totalOrders > 0 && (
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}><PackageIcon /></div>
                            <div className={styles.statContent}>
                                <h3 className={styles.statValue}>{stats?.totalOrders || 0}</h3>
                                <p className={styles.statLabel}>Total Orders</p>
                                <span className={styles.statSubtext}>{stats?.activeOrders || 0} active</span>
                            </div>
                        </div>
                    )}

                    <div className={styles.statCard}>
                        <div className={styles.statIcon}><StarIcon /></div>
                        <div className={styles.statContent}>
                            <h3 className={styles.statValue}>{stats?.averageRating || 0}</h3>
                            <p className={styles.statLabel}>Avg Rating</p>
                            <span className={styles.statSubtext}>From {stats?.completedOrders || 0} orders</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className={styles.quickActionsSection}>
                    <h2 className={styles.sectionTitle}>Quick Actions</h2>
                    <div className={styles.quickActionsGrid}>
                        <Link to="/freelancer/gigs/new" className={styles.quickAction}>
                            <div className={styles.quickActionIcon}><ChartIcon /></div>
                            <div className={styles.quickActionContent}>
                                <h3>Create New Gig</h3>
                                <p>Showcase your skills and attract clients</p>
                            </div>
                        </Link>

                        <Link to="/freelancer/gigs" className={styles.quickAction}>
                            <div className={styles.quickActionIcon}><FlashIcon /></div>
                            <div className={styles.quickActionContent}>
                                <h3>Manage Gigs</h3>
                                <p>Edit, update, or delete your gigs</p>
                            </div>
                        </Link>

                        <Link to="/freelancer/profile" className={styles.quickAction}>
                            <div className={styles.quickActionIcon}><PersonIcon /></div>
                            <div className={styles.quickActionContent}>
                                <h3>Update Profile</h3>
                                <p>Keep your profile fresh and complete</p>
                            </div>
                        </Link>

                        <a href="#" className={styles.quickAction} onClick={(e) => { e.preventDefault(); alert('Analytics coming soon!'); }}>
                            <div className={styles.quickActionIcon}><ChartIcon /></div>
                            <div className={styles.quickActionContent}>
                                <h3>View Analytics</h3>
                                <p>Track your performance and growth</p>
                            </div>
                        </a>
                    </div>
                </div>

                <div className={styles.contentGrid}>
                    {/* Recent Activity */}
                    <div className={styles.activitySection}>
                        <h2 className={styles.sectionTitle}>Recent Activity</h2>
                        <div className={styles.activityList}>
                            {recentActivity.length > 0 ? (
                                recentActivity.map((activity) => (
                                    <div key={activity.id} className={styles.activityItem}>
                                        <div className={styles.activityIcon}>{activity.icon}</div>
                                        <div className={styles.activityContent}>
                                            <h4 className={styles.activityTitle}>{activity.title}</h4>
                                            <p className={styles.activityDescription}>{activity.description}</p>
                                            <span className={styles.activityTime}>{activity.time}</span>
                                        </div>
                                        {activity.amount && (
                                            <div className={styles.activityAmount}>{activity.amount}</div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className={styles.emptyActivity}>
                                    <div className={styles.emptyIcon}><NoteIcon /></div>
                                    <h3>No recent activity</h3>
                                    <p>Start creating gigs to see your activity here</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Profile Status */}
                    <div className={styles.profileSection}>
                        <h2 className={styles.sectionTitle}>Profile Status</h2>
                        <div className={styles.profileCard}>
                            <div className={styles.profileProgress}>
                                <div className={styles.progressHeader}>
                                    <span>Profile Completion</span>
                                    <span className={styles.progressValue}>{stats?.profileCompleteness || 0}%</span>
                                </div>
                                <div className={styles.progressBar}>
                                    <div
                                        className={styles.progressFill}
                                        style={{ width: `${stats?.profileCompleteness || 0}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className={styles.profileStats}>
                                <div className={styles.profileStat}>
                                    <span className={styles.profileStatLabel}>Profile Views</span>
                                    <span className={styles.profileStatValue}>{stats?.profileViews || 0}</span>
                                </div>
                                <div className={styles.profileStat}>
                                    <span className={styles.profileStatLabel}>This Month</span>
                                    <span className={styles.profileStatValue}>+42</span>
                                </div>
                            </div>

                            <Link to="/freelancer/profile">
                                <Button variant="secondary" className={styles.profileButton}>
                                    Complete Profile
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;