import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getFreelancerStats } from '../api/freelancer.api.js';
import { getGigsByFreelancer } from '../api/gig.api.js';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';
import GigCard from '../components/gig/GigCard.jsx';
import { formatCurrency } from '../utils/nameMapper.js';
import styles from './DashboardPage.module.css';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentGigs, setRecentGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        // Mock data for demo since API might not be ready
        const mockStats = {
          totalGigs: 5,
          totalEarnings: 2400,
          averageRating: 4.8,
          totalOrders: 12,
          activeOrders: 3,
          completedOrders: 9
        };

        const mockGigs = [
          {
            id: 1,
            title: "I will create a modern website design",
            description: "Professional website design with modern UI/UX principles",
            price: 299,
            skills: ["Web Design", "UI/UX", "Figma"],
            images: [],
            freelancerName: user?.fullName || "You"
          },
          {
            id: 2,
            title: "I will develop a React application",
            description: "Full-stack React application with modern features",
            price: 599,
            skills: ["React", "Node.js", "MongoDB"],
            images: [],
            freelancerName: user?.fullName || "You"
          }
        ];

        setStats(mockStats);
        setRecentGigs(mockGigs);

        // Uncomment when API is ready
        // const [statsResponse, gigsResponse] = await Promise.allSettled([
        //   getFreelancerStats(),
        //   getGigsByFreelancer(user.id)
        // ]);
        // 
        // if (statsResponse.status === 'fulfilled') {
        //   setStats(statsResponse.value);
        // }
        // 
        // if (gigsResponse.status === 'fulfilled') {
        //   const gigs = gigsResponse.value.content || gigsResponse.value;
        //   setRecentGigs(gigs.slice(0, 3));
        // }
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
    return <Loader centered fullHeight text="Loading dashboard..." />;
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Welcome back, {user?.fullName?.split(' ')[0] || 'Freelancer'}!</h1>
          <p className={styles.subtitle}>Here's what's happening with your freelance business</p>
        </div>
        <Link to="/freelancer/gigs/new">
          <Button variant="primary">
            Create New Gig
          </Button>
        </Link>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <Link to="/freelancer/gigs/new" className={styles.actionCard}>
          <div className={styles.actionIcon}>➕</div>
          <h3>Create New Gig</h3>
          <p>Share your skills with potential clients</p>
        </Link>

        <Link to="/freelancer/gigs" className={styles.actionCard}>
          <div className={styles.actionIcon}>📊</div>
          <h3>Manage Gigs</h3>
          <p>View and edit your existing gigs</p>
        </Link>

        <Link to="/freelancer/profile" className={styles.actionCard}>
          <div className={styles.actionIcon}>👤</div>
          <h3>Update Profile</h3>
          <p>Keep your profile information current</p>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Your Performance</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>💼</div>
            <div className={styles.statContent}>
              <h3 className={styles.statValue}>{stats?.totalGigs || 0}</h3>
              <p className={styles.statLabel}>Active Gigs</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>💰</div>
            <div className={styles.statContent}>
              <h3 className={styles.statValue}>{formatCurrency(stats?.totalEarnings || 0)}</h3>
              <p className={styles.statLabel}>Total Earnings</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>⭐</div>
            <div className={styles.statContent}>
              <h3 className={styles.statValue}>{stats?.averageRating?.toFixed(1) || '5.0'}</h3>
              <p className={styles.statLabel}>Average Rating</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>📦</div>
            <div className={styles.statContent}>
              <h3 className={styles.statValue}>{stats?.totalOrders || 0}</h3>
              <p className={styles.statLabel}>Total Orders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Activity</h2>
        </div>

        <div className={styles.activityList}>
          <div className={styles.activityItem}>
            <div className={styles.activityIcon}>🎉</div>
            <div className={styles.activityContent}>
              <h4>Welcome to FreelanceHub!</h4>
              <p>Complete your profile to start attracting clients</p>
              <span className={styles.activityTime}>Just now</span>
            </div>
          </div>

          <div className={styles.activityItem}>
            <div className={styles.activityIcon}>🚀</div>
            <div className={styles.activityContent}>
              <h4>Ready to start earning?</h4>
              <p>Create your first gig to showcase your skills</p>
              <span className={styles.activityTime}>5 minutes ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Gigs */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Your Recent Gigs</h2>
          <Link to="/freelancer/gigs" className={styles.sectionLink}>
            View All Gigs
          </Link>
        </div>

        {recentGigs.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🎯</div>
            <h3>No gigs yet</h3>
            <p>Create your first gig to start attracting clients and earning money!</p>
            <Link to="/freelancer/gigs/new">
              <Button variant="primary">Create Your First Gig</Button>
            </Link>
          </div>
        ) : (
          <div className={styles.gigsGrid}>
            {recentGigs.map((gig) => (
              <GigCard key={gig.id} gig={gig} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;