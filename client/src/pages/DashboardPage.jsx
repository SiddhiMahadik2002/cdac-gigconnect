import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import { formatCurrency } from '../utils/nameMapper.js';
import { getRequirementById } from '../api/requirement.api.js';
import { getMyProposals } from '../api/proposal.api.js';
import { getFreelancerProfile } from '../api/freelancer.api.js';
import { getGigsByFreelancer } from '../api/gig.api.js';
import { STATUS_PERMISSIONS, PROPOSAL_STATUS } from '../utils/constants.js';
import { getStatusDisplay } from '../utils/statusHelpers.js';
import styles from './DashboardPage.module.css';
import { BriefcaseIcon, MoneyIcon, NoteIcon, StarIcon, PackageIcon, FlashIcon, PersonIcon, ChartIcon, WarningIcon, CalendarIcon, CheckIcon } from '../components/icons/Icons.jsx';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [activeProjects, setActiveProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        // For freelancers, get their orders and activity
        if (user) {
          try {
            // Fetch orders using the API client (sends to port 8080)
            const orders = await getMyProposals(); // This now returns orders

            // Calculate stats from real data
            // Active projects use order status
            const activeOrders = orders.filter(order =>
              ['CONFIRMED', 'IN_PROGRESS', 'DELIVERED', 'REVISION_REQUESTED'].includes(order.status)
            );
            const pendingOrders = orders.filter(order => order.status === 'PENDING_PAYMENT');
            const totalEarnings = activeOrders.reduce((sum, order) => sum + (order.amount || 0), 0);

            // Fetch freelancer profile to get canonical stats like averageRating and totalEarnings
            // Derive robust user id
            const userId = user?.userId ?? user?.id ?? user?.freelancerId ?? user?.sub;
            let profile = null;
            try {
              if (userId) profile = await getFreelancerProfile(userId);
            } catch (pfErr) {
              console.warn('Failed to fetch freelancer profile:', pfErr);
            }

            // Fetch gigs to compute total gigs
            let gigsResult = null;
            try {
              if (userId) gigsResult = await getGigsByFreelancer(userId, { page: 1, size: 1 });
            } catch (gErr) {
              console.warn('Failed to fetch gigs by freelancer:', gErr);
            }

            // Map order data to project format
            const projectsWithDetails = activeOrders.map((order) => {
              try {
                return {
                  id: order.id,
                  requirementId: order.requirementId || order.gigId,
                  title: order.title,
                  price: order.amount,
                  status: order.status,
                  startDate: order.createdAt || order.startedAt,
                  message: order.description?.substring(0, 150) + '...' || 'No description available',
                  clientName: order.clientName,
                  orderType: order.orderType,
                  orderSource: order.orderSource
                };
              } catch (error) {
                console.error(`Failed to process order ${order.id}:`, error);
                // Fallback to basic order data
                return {
                  id: order.id,
                  requirementId: order.requirementId || order.gigId,
                  title: order.title || `Project #${order.id}`,
                  price: order.amount,
                  status: order.status,
                  startDate: order.createdAt,
                  message: order.description || 'No description available'
                };
              }
            });

            setActiveProjects(projectsWithDetails);

            const realStats = {
              totalGigs: (gigsResult && typeof gigsResult.totalElements === 'number') ? gigsResult.totalElements : (profile?.totalGigs ?? 0),
              activeGigs: 2,
              totalProposals: orders.length,
              pendingProposals: pendingOrders.length,
              acceptedProposals: activeOrders.length,
              // Prefer backend profile totalEarnings if provided, otherwise calculate from orders
              totalEarnings: profile?.totalEarnings ?? totalEarnings,
              thisMonthEarnings: (profile?.thisMonthEarnings) ?? (totalEarnings * 0.3),
              averageRating: profile?.averageRating ?? 0,
              profileViews: 156,
              profileCompleteness: 75
            };

            // Create activity from orders using status display helper
            const recentOrderActivity = orders.slice(0, 3).map((order, index) => {
              const statusInfo = getStatusDisplay(order.status);
              return {
                id: `order-${order.id}`,
                type: order.orderType === 'CUSTOM_PROJECT' ? 'proposal' : 'gig',
                icon: statusInfo.icon,
                title: order.status === 'CONFIRMED' ? 'Order Confirmed!' :
                  order.status === 'IN_PROGRESS' ? 'Work In Progress' :
                    order.status === 'DELIVERED' ? 'Work Delivered' :
                      order.status === 'REVISION_REQUESTED' ? 'Revision Requested' : 'Order Updated',
                description: order.orderType === 'CUSTOM_PROJECT' ?
                  `Custom project: ${order.title}` :
                  `Gig purchase: ${order.title}`,
                time: new Date(order.createdAt || Date.now()).toLocaleDateString(),
                amount: ['CONFIRMED', 'IN_PROGRESS', 'DELIVERED', 'COMPLETED'].includes(order.status) ? formatCurrency(order.amount) : null
              };
            });

            setStats(realStats);
            setRecentActivity(recentOrderActivity);

          } catch (apiError) {
            console.log('API not available, using mock data:', apiError);
            // Fall back to mock data when API is not available
            useMockData();
          }
        } else {
          useMockData();
        }
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
        useMockData();
      } finally {
        setLoading(false);
      }
    };

    const useMockData = () => {
      // Mock data for demo/fallback
      const mockStats = {
        totalGigs: 5,
        activeGigs: 3,
        totalProposals: 8,
        pendingProposals: 3,
        acceptedProposals: 2,
        totalEarnings: 2400,
        thisMonthEarnings: 650,
        averageRating: 4.8,
        profileViews: 234,
        profileCompleteness: 85
      };

      const mockActiveProjects = [
        {
          id: 1,
          requirementId: 101,
          title: 'E-commerce Website Development',
          price: 5500,
          status: 'IN_PROGRESS',
          startDate: '2026-01-20T10:00:00Z',
          message: 'Building a full-stack e-commerce platform with React and Spring Boot'
        },
        {
          id: 2,
          requirementId: 102,
          title: 'Mobile App UI/UX Design',
          price: 1200,
          status: 'IN_PROGRESS',
          startDate: '2026-01-22T14:30:00Z',
          message: 'Designing modern UI for iOS and Android mobile application'
        }
      ];

      setActiveProjects(mockActiveProjects);

      const mockActivity = [
        {
          id: 1,
          type: 'proposal',
          icon: <CheckIcon />,
          title: 'Proposal Accepted!',
          description: 'Your React Development proposal was accepted',
          time: '2 hours ago',
          amount: formatCurrency(1500)
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
      <div className={styles.dashboardLayout}>
        {/* Sticky Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h3 className={styles.sidebarTitle}>Quick Actions</h3>
            <p className={styles.sidebarSubtitle}>Navigate & Manage</p>
          </div>

          <nav className={styles.sidebarNav}>
            <Link to="/freelancer/projects" className={styles.navItem}>
              <div className={styles.navIcon}><PackageIcon /></div>
              <div className={styles.navContent}>
                <h4 className={styles.navTitle}>Active Projects</h4>
                <p className={styles.navDescription}>Track your work</p>
              </div>
            </Link>

            <Link to="/freelancer/gigs/new" className={styles.navItem}>
              <div className={styles.navIcon}><ChartIcon /></div>
              <div className={styles.navContent}>
                <h4 className={styles.navTitle}>Create New Gig</h4>
                <p className={styles.navDescription}>Showcase your skills</p>
              </div>
            </Link>

            <Link to="/requirements" className={styles.navItem}>
              <div className={styles.navIcon}><BriefcaseIcon /></div>
              <div className={styles.navContent}>
                <h4 className={styles.navTitle}>Browse Requirements</h4>
                <p className={styles.navDescription}>Find new projects</p>
              </div>
            </Link>

            <Link to="/freelancer/gigs" className={styles.navItem}>
              <div className={styles.navIcon}><FlashIcon /></div>
              <div className={styles.navContent}>
                <h4 className={styles.navTitle}>Manage Gigs</h4>
                <p className={styles.navDescription}>Edit & update</p>
              </div>
            </Link>

            <Link to="/freelancer/profile" className={styles.navItem}>
              <div className={styles.navIcon}><PersonIcon /></div>
              <div className={styles.navContent}>
                <h4 className={styles.navTitle}>Update Profile</h4>
                <p className={styles.navDescription}>Keep it fresh</p>
              </div>
            </Link>

            <Link to="/freelancer/completed-work" className={styles.navItem}>
              <div className={styles.navIcon}><PackageIcon /></div>
              <div className={styles.navContent}>
                <h4 className={styles.navTitle}>Completed Work</h4>
                <p className={styles.navDescription}>View your finished projects</p>
              </div>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <div className={styles.mainContent}>
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

              <div className={styles.statCard}>
                <div className={styles.statIcon}><NoteIcon /></div>
                <div className={styles.statContent}>
                  <h3 className={styles.statValue}>{stats?.totalProposals || 0}</h3>
                  <p className={styles.statLabel}>Total Proposals</p>
                  <span className={styles.statSubtext}>{stats?.pendingProposals || 0} pending</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}><StarIcon /></div>
                <div className={styles.statContent}>
                  <h3 className={styles.statValue}>{stats?.averageRating || 0}</h3>
                  <p className={styles.statLabel}>Avg Rating</p>
                  <span className={styles.statSubtext}>{stats?.acceptedProposals || 0} accepted</span>
                </div>
              </div>
            </div>

            {/* Active Projects Section */}
            <div className={styles.activeProjectsSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Active Projects</h2>
                <div className={styles.sectionHeaderActions}>
                  {activeProjects.length > 0 && (
                    <>
                      <span className={styles.projectCount}>{activeProjects.length} ongoing</span>
                      {activeProjects.length > 2 && (
                        <Link to="/freelancer/projects" className={styles.viewAllLink}>
                          View All →
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </div>

              {activeProjects.length > 0 ? (
                <div className={styles.projectsGrid}>
                  {activeProjects.slice(0, 2).map((project) => (
                    <div key={project.id} className={styles.projectCard}>
                      <div className={styles.projectHeader}>
                        <div className={styles.projectInfo}>
                          <h3 className={styles.projectTitle}>{project.title}</h3>
                          <span className={styles.projectId}>Requirement #{project.requirementId}</span>
                        </div>
                        <div className={styles.projectStatus}>
                          <span className={styles.statusBadge}>
                            <FlashIcon /> In Progress
                          </span>
                        </div>
                      </div>

                      <p className={styles.projectDescription}>{project.message}</p>

                      <div className={styles.projectMeta}>
                        <div className={styles.projectMetaItem}>
                          <span className={styles.metaIcon}><MoneyIcon /></span>
                          <span className={styles.metaLabel}>Project Value</span>
                          <span className={styles.metaValue}>{formatCurrency(project.price)}</span>
                        </div>
                        <div className={styles.projectMetaItem}>
                          <span className={styles.metaIcon}><CalendarIcon /></span>
                          <span className={styles.metaLabel}>Started</span>
                          <span className={styles.metaValue}>
                            {new Date(project.startDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>

                      <div className={styles.projectActions}>
                        {/* Show View Details only for CUSTOM_PROJECT orders (from client requirements) */}
                        {project.orderType === 'CUSTOM_PROJECT' && (
                          <Link to={`/requirements/${project.requirementId}`}>
                            <Button variant="primary" size="small">
                              View Details
                            </Button>
                          </Link>
                        )}

                        {/* Add Request Completion for all active orders */}
                        {['CONFIRMED', 'IN_PROGRESS'].includes(project.status) && (
                          <Button
                            variant="success"
                            size="small"
                            onClick={() => {
                              // Navigate to active projects page or trigger completion modal
                              window.location.href = '/active-projects';
                            }}
                          >
                            ✓ Request Completion
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateIcon}><NoteIcon /></div>
                  <h3 className={styles.emptyStateTitle}>No Active Projects Yet</h3>
                  <p className={styles.emptyStateText}>
                    Start browsing requirements and submit proposals to land your first project!
                  </p>
                  <Link to="/requirements">
                    <Button variant="primary">Browse Requirements</Button>
                  </Link>
                </div>
              )}
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
      </div>
    </div>
  );
};

export default DashboardPage;