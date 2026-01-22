import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getGigsByFreelancer, deleteGig } from '../api/gig.api.js';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';
import { formatCurrency } from '../utils/nameMapper.js';
import styles from './FreelancerGigsPage.module.css';

const FreelancerGigsPage = () => {
  const { user } = useAuth();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingGigId, setDeletingGigId] = useState(null);

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        setLoading(true);
        setError('');

        // Use real API instead of mock data
        const response = await getGigsByFreelancer(user.id, { page: 1 });
        setGigs(response.content || []);

        // Mock data for demo (remove when API is working)
        /*
        const mockGigs = [
          {
            id: 1,
            title: "I will create a modern website design",
            description: "Professional website design with modern UI/UX principles. I'll create a stunning, responsive design that converts visitors into customers.",
            fixedPrice: 299,
            skills: "Web Design,UI/UX,Figma,Adobe XD",
            images: [],
            freelancerName: user?.fullName || "You",
            status: "Active",
            views: 156,
            orders: 8,
            createdAt: "2024-01-15"
          },
          {
            id: 2,
            title: "I will develop a React application",
            description: "Full-stack React application with modern features including authentication, database integration, and responsive design.",
            fixedPrice: 599,
            skills: "React,Node.js,MongoDB,Express",
            images: [],
            freelancerName: user?.fullName || "You",
            status: "Active",
            views: 89,
            orders: 3,
            createdAt: "2024-01-10"
          },
          {
            id: 3,
            title: "I will create mobile app designs",
            description: "Beautiful mobile app designs for iOS and Android with complete UI/UX flow and interactive prototypes.",
            fixedPrice: 450,
            skills: "Mobile Design,UI/UX,Sketch,Principle",
            images: [],
            freelancerName: user?.fullName || "You",
            status: "Paused",
            views: 67,
            orders: 2,
            createdAt: "2024-01-05"
          }
        ];
        
        setGigs(mockGigs);
        */

      } catch (err) {
        setError('Failed to load your gigs');
        console.error('Error fetching gigs:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchGigs();
    }
  }, [user?.id]);

  const handleDeleteGig = async (gigId) => {
    if (!window.confirm('Are you sure you want to delete this gig? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingGigId(gigId);
      await deleteGig(gigId);
      setGigs(gigs.filter(gig => gig.id !== gigId));
    } catch (err) {
      console.error('Error deleting gig:', err);
      setError('Failed to delete gig. Please try again.');
    } finally {
      setDeletingGigId(null);
    }
  };

  const toggleGigStatus = (gigId) => {
    setGigs(gigs.map(gig =>
      gig.id === gigId
        ? { ...gig, status: gig.status === 'Active' ? 'Paused' : 'Active' }
        : gig
    ));
  };

  if (loading) {
    return <Loader centered fullHeight text="Loading your gigs..." />;
  }

  return (
    <div className={styles.freelancerGigs}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Gigs</h1>
          <p className={styles.subtitle}>Manage and track your freelance services</p>
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

      {gigs.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🎯</div>
          <h3>No gigs yet</h3>
          <p>Create your first gig to start showcasing your skills and attracting clients.</p>
          <Link to="/freelancer/gigs/new">
            <Button variant="primary">Create Your First Gig</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{gigs.length}</span>
              <span className={styles.statLabel}>Total Gigs</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{gigs.filter(g => g.status === 'Active').length}</span>
              <span className={styles.statLabel}>Active</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{gigs.reduce((sum, g) => sum + (g.views || 0), 0)}</span>
              <span className={styles.statLabel}>Total Views</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{gigs.reduce((sum, g) => sum + (g.orders || 0), 0)}</span>
              <span className={styles.statLabel}>Total Orders</span>
            </div>
          </div>

          <div className={styles.gigsList}>
            {gigs.map((gig) => (
              <div key={gig.id} className={styles.gigCard}>
                <div className={styles.gigImage}>
                  {gig.images && gig.images.length > 0 ? (
                    <img src={gig.images[0]} alt={gig.title} />
                  ) : (
                    <div className={styles.imagePlaceholder}>
                      <span>🎯</span>
                    </div>
                  )}
                  <div className={`${styles.statusBadge} ${styles[gig.status.toLowerCase()]}`}>
                    {gig.status}
                  </div>
                </div>

                <div className={styles.gigContent}>
                  <div className={styles.gigMain}>
                    <h3 className={styles.gigTitle}>{gig.title}</h3>
                    <p className={styles.gigDescription}>{gig.description}</p>

                    <div className={styles.gigMeta}>
                      <div className={styles.gigPrice}>{formatCurrency(gig.fixedPrice)}</div>
                      <div className={styles.gigStats}>
                        <span>👀 {gig.views || 0} views</span>
                        <span>📦 {gig.orders || 0} orders</span>
                      </div>
                    </div>

                    <div className={styles.skillTags}>
                      {(typeof gig.skills === 'string'
                        ? gig.skills.split(',').map(s => s.trim())
                        : gig.skills || []
                      ).slice(0, 3).map((skill, index) => (
                        <span key={index} className={styles.skillTag}>{skill}</span>
                      ))}
                      {(typeof gig.skills === 'string'
                        ? gig.skills.split(',').length
                        : gig.skills?.length || 0
                      ) > 3 && (
                          <span className={styles.skillTag}>+{(typeof gig.skills === 'string'
                            ? gig.skills.split(',').length
                            : gig.skills?.length || 0
                          ) - 3}</span>
                        )}
                    </div>
                  </div>

                  <div className={styles.gigActions}>
                    <Link to={`/gigs/${gig.id}`}>
                      <Button variant="ghost" size="small">👀 View</Button>
                    </Link>
                    <Link to={`/freelancer/gigs/edit/${gig.id}`}>
                      <Button variant="outline" size="small">✏️ Edit</Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => toggleGigStatus(gig.id)}
                    >
                      {gig.status === 'Active' ? '⏸️ Pause' : '▶️ Activate'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => handleDeleteGig(gig.id)}
                      loading={deletingGigId === gig.id}
                      disabled={deletingGigId === gig.id}
                      style={{ color: 'var(--error)' }}
                    >
                      🗑️ Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FreelancerGigsPage;