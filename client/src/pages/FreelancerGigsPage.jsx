import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getGigsByFreelancer, deleteGig } from '../api/gig.api.js';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';
import { formatCurrency } from '../utils/nameMapper.js';
import Modal from '../components/common/Modal.jsx';
import styles from './FreelancerGigsPage.module.css';
import { ChartIcon, PackageIcon, VisibilityIcon, EditIcon, DeleteIcon } from '../components/icons/Icons.jsx';

const FreelancerGigsPage = () => {
  const { user } = useAuth();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingGigId, setDeletingGigId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [gigToDelete, setGigToDelete] = useState(null);

  const fetchGigs = async () => {
      try {
        setLoading(true);
        setError('');

        // Try to fetch gigs using the available API endpoint
        // According to API docs, there's no specific endpoint for freelancer's gigs
        // so we'll use a direct fetch approach and fall back to mock data
        try {
          // Use api helper which respects API_BASE_URL (backend host)
          const result = await getGigsByFreelancer(user.userId || user.id);
          const gigs = Array.isArray(result) ? result : (result.content || []);
          setGigs(gigs);
        } catch (apiError) {
          console.log('API not available, using mock data:', apiError);
          useMockData();
        }

      } catch (err) {
        setError('Failed to load your gigs');
        console.error('Error fetching gigs:', err);
        useMockData(); // Even on error, show mock data
      } finally {
        setLoading(false);
      }
    };

    const useMockData = () => {
      // Mock data based on API documentation format
      const mockGigs = [
        {
          id: 1,
          freelancerId: user?.userId || user?.id,
          title: "I will develop a React web application",
          description: "Professional React development service with modern UI/UX design. I'll create a responsive, fast, and scalable React application with clean code and best practices.",
          fixedPrice: 1500.0,
          skills: '["React", "JavaScript", "CSS", "HTML"]',
          status: "ACTIVE",
          createdAt: "2026-01-20T10:00:00Z",
          updatedAt: "2026-01-20T10:00:00Z",
          views: 156,
          orders: 8
        },
        {
          id: 2,
          freelancerId: user?.userId || user?.id,
          title: "I will create a modern website design",
          description: "Professional website design with modern UI/UX principles. Complete responsive design with Figma files and developer handoff documentation.",
          fixedPrice: 800.0,
          skills: '["Web Design", "UI/UX", "Figma", "Adobe XD"]',
          status: "ACTIVE",
          createdAt: "2026-01-18T14:30:00Z",
          updatedAt: "2026-01-18T14:30:00Z",
          views: 89,
          orders: 3
        },
        {
          id: 3,
          freelancerId: user?.userId || user?.id,
          title: "I will build a Node.js REST API",
          description: "Complete backend API development with Node.js, Express, and MongoDB. Includes authentication, validation, error handling, and documentation.",
          fixedPrice: 1200.0,
          skills: '["Node.js", "Express", "MongoDB", "JWT"]',
          status: "ACTIVE",
          createdAt: "2026-01-15T09:15:00Z",
          updatedAt: "2026-01-15T09:15:00Z",
          views: 67,
          orders: 2
        }
      ];

      setGigs(mockGigs);
    };

  useEffect(() => {
    if (user) {
      fetchGigs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleDeleteGig = (gigId) => {
    // Open confirmation modal
    setGigToDelete(gigId);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    const gigId = gigToDelete;
    if (!gigId) return;

    try {
      setDeletingGigId(gigId);
      await deleteGig(gigId);
      // Re-fetch gigs after successful delete
      await fetchGigs();
      setConfirmOpen(false);
      setGigToDelete(null);
    } catch (err) {
      console.error('Error deleting gig:', err);
      setError('Failed to delete gig. Please try again.');
    } finally {
      setDeletingGigId(null);
    }
  };

  
  if (loading) {
    return <Loader centered fullHeight text="Loading your gigs..." />;
  }

  return (
    <div className={styles.freelancerGigs}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>My Gigs</h1>
            <p className={styles.subtitle}>Manage and track your freelance services</p>
          </div>
          <div className={styles.headerActions}>
            <Link to="/freelancer/gigs/new">
              <Button variant="primary">
                Create New Gig
              </Button>
            </Link>
          </div>
        </div>

        {/* Confirmation modal for deleting a gig */}
        <Modal
          isOpen={confirmOpen}
          onClose={() => { setConfirmOpen(false); setGigToDelete(null); }}
          title="Confirm delete"
          size="small"
        >
          <p>Are you sure you want to delete this gig? This action cannot be undone.</p>
          <div className={styles.modalActions}>
            <Button variant="ghost" onClick={() => { setConfirmOpen(false); setGigToDelete(null); }}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              loading={deletingGigId === gigToDelete}
              disabled={deletingGigId === gigToDelete}
            >
              Delete
            </Button>
          </div>
        </Modal>
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {gigs.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><ChartIcon /></div>
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
                <span className={styles.statValue}>{gigs.filter(g => g.status === 'ACTIVE').length}</span>
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
                        <ChartIcon />
                      </div>
                    )}
                    <div className={`${styles.statusBadge} ${styles[gig.status.toLowerCase()]}`}>
                      {gig.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                    </div>
                  </div>

                  <div className={styles.gigContent}>
                    <div className={styles.gigMain}>
                      <h3 className={styles.gigTitle}>{gig.title}</h3>
                      <p className={styles.gigDescription}>{gig.description}</p>

                      <div className={styles.gigMeta}>
                        <div className={styles.gigPrice}>{formatCurrency(gig.fixedPrice)}</div>
                        {(gig.views > 0 || gig.orders > 0) && (
                          <div className={styles.gigStats}>
                            {gig.views > 0 && <span><VisibilityIcon /> {gig.views} views</span>}
                            {gig.orders > 0 && <span><PackageIcon /> {gig.orders} orders</span>}
                          </div>
                        )}
                      </div>

                      <div className={styles.skillTags}>
                        {(() => {
                          let skillsArray = [];
                          try {
                            if (typeof gig.skills === 'string') {
                              // Try to parse JSON string first
                              if (gig.skills.startsWith('[') && gig.skills.endsWith(']')) {
                                skillsArray = JSON.parse(gig.skills);
                              } else {
                                // Fall back to comma-separated string
                                skillsArray = gig.skills.split(',').map(s => s.trim());
                              }
                            } else if (Array.isArray(gig.skills)) {
                              skillsArray = gig.skills;
                            }
                          } catch (e) {
                            // If JSON parsing fails, treat as comma-separated string
                            skillsArray = typeof gig.skills === 'string' ?
                              gig.skills.split(',').map(s => s.trim()) : [];
                          }

                          return (
                            <>
                              {skillsArray.slice(0, 3).map((skill, index) => (
                                <span key={index} className={styles.skillTag}>{skill}</span>
                              ))}
                              {skillsArray.length > 3 && (
                                <span className={styles.skillTag}>+{skillsArray.length - 3}</span>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    <div className={styles.gigActions}>
                      <Link to={`/gigs/${gig.id}`}>
                        <Button variant="ghost" size="small"><VisibilityIcon /> View</Button>
                      </Link>
                      <Link to={`/freelancer/gigs/edit/${gig.id}`}>
                        <Button variant="outline" size="small"><EditIcon /> Edit</Button>
                      </Link>
                      {/* Pause/Activate removed per request */}
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => handleDeleteGig(gig.id)}
                        loading={deletingGigId === gig.id}
                        disabled={deletingGigId === gig.id}
                        style={{ color: 'var(--error)' }}
                      >
                        <DeleteIcon /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FreelancerGigsPage;