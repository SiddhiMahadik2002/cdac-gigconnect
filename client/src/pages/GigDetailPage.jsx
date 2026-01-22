import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getGigById } from '../api/gig.api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';
import { formatCurrency } from '../utils/nameMapper.js';
import { USER_ROLES } from '../utils/constants.js';
import styles from './GigDetailPage.module.css';

const GigDetailPage = () => {
  const { id } = useParams();
  const { user, role, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [orderLoading, setOrderLoading] = useState(false);

  useEffect(() => {
    const fetchGig = async () => {
      try {
        setLoading(true);
        setError('');

        // Use real API call
        const response = await getGigById(id);
        setGig(response);

        // Mock gig data for demo (remove when API is working)
        /*
        const mockGig = {
          id: parseInt(id),
          title: "I will create a modern website design for your business",
          description: `I'm a professional web designer with over 5 years of experience creating stunning, modern websites that convert visitors into customers.

🎯 What you'll get:
• Custom website design tailored to your brand
• Mobile-responsive layout
• Modern UI/UX principles
• Fast loading times
• SEO-friendly structure
• 3 rounds of revisions

💼 My process:
1. Discovery call to understand your business
2. Research your industry and competitors
3. Create wireframes and mockups
4. Design the final website
5. Deliver files and provide support

✨ Why choose me:
• 500+ satisfied clients
• Quick turnaround time
• Unlimited revisions until you're happy
• Post-delivery support

Ready to take your business online? Let's create something amazing together!

Feel free to message me before placing an order to discuss your specific requirements.`,
          fixedPrice: 299,
          skills: "Web Design,UI/UX,Figma,Adobe XD,Responsive Design",
          images: [
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop"
          ],
          freelancerName: "Sarah Johnson",
          freelancerId: "freelancer-123",
          freelancerAvatar: "SJ",
          freelancerTitle: "Senior Web Designer",
          freelancerRating: 4.9,
          freelancerReviews: 156,
          freelancerLevel: "Top Rated Seller",
          deliveryTime: "3-5 days",
          revisions: "3 revisions included",
          responseTime: "1 hour",
          createdAt: "2024-01-15"
        };
        
        setGig(mockGig);
        */
        // setGig(response);

      } catch (err) {
        setError('Failed to load gig details');
        console.error('Error fetching gig:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGig();
  }, [id]);

  const handleOrderNow = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }

    setOrderLoading(true);
    // Simulate order process
    setTimeout(() => {
      setOrderLoading(false);
      alert('Order functionality coming soon!');
    }, 2000);
  };

  const handleContactFreelancer = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }

    alert('Messaging functionality coming soon!');
  };

  if (loading) {
    return <Loader centered fullHeight text="Loading gig..." />;
  }

  if (error || !gig) {
    return (
      <div className={styles.errorContainer}>
        <h2>Gig Not Found</h2>
        <p>{error || 'The gig you are looking for does not exist.'}</p>
        <Button onClick={() => navigate('/gigs')}>Back to Gigs</Button>
      </div>
    );
  }

  const isOwner = user && gig.freelancerId === user.id;
  const canEdit = isOwner && role === USER_ROLES.FREELANCER;

  // Mock additional data for better UI
  const skillsArray = gig.skills ? (typeof gig.skills === 'string' ? gig.skills.split(',').map(s => s.trim()) : gig.skills) : [];
  const rating = gig.freelancerRating || (4.5 + Math.random() * 0.5).toFixed(1);
  const reviewCount = gig.freelancerReviews || Math.floor(Math.random() * 150) + 10;

  return (
    <div className={styles.gigDetail}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link to="/" className={styles.breadcrumbLink}>Home</Link>
        <span className={styles.breadcrumbSeparator}>›</span>
        <Link to="/gigs" className={styles.breadcrumbLink}>Browse Gigs</Link>
        <span className={styles.breadcrumbSeparator}>›</span>
        <span className={styles.breadcrumbCurrent}>{gig.title}</span>
      </div>

      <div className={styles.content}>
        {/* Left Column - Main Content */}
        <div className={styles.mainContent}>
          {/* Gig Header */}
          <div className={styles.gigHeader}>
            <div className={styles.gigHeaderContent}>
              <h1 className={styles.gigTitle}>{gig.title}</h1>
              <div className={styles.gigMeta}>
                <div className={styles.freelancerMeta}>
                  <div className={styles.freelancerAvatar}>
                    {gig.freelancerAvatar ? (
                      <img src={gig.freelancerAvatar} alt={gig.freelancerName} className={styles.avatarImage} />
                    ) : (
                      <svg className={styles.avatarIcon} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    )}
                  </div>
                  <div className={styles.freelancerInfo}>
                    <Link to={`/freelancer/profile/${gig.freelancerId}`} className={styles.freelancerName}>
                      {gig.freelancerName || 'Anonymous Freelancer'}
                    </Link>
                    <div className={styles.freelancerRating}>
                      ⭐ {rating} ({reviewCount} reviews) • Top Rated Seller
                    </div>
                  </div>
                </div>
                {canEdit && (
                  <Link to={`/freelancer/gigs/edit/${gig.id}`}>
                    <Button variant="outline" size="small">✏️ Edit Gig</Button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          <div className={styles.imageGallery}>
            {gig.images && gig.images.length > 0 ? (
              <>
                <div className={styles.mainImage}>
                  <img
                    src={gig.images[selectedImageIndex]}
                    alt={gig.title}
                    className={styles.image}
                  />
                </div>
                {gig.images.length > 1 && (
                  <div className={styles.thumbnails}>
                    {gig.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${gig.title} ${index + 1}`}
                        className={`${styles.thumbnail} ${index === selectedImageIndex ? styles.activeThumbnail : ''}`}
                        onClick={() => setSelectedImageIndex(index)}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className={styles.imagePlaceholder}>
                <div className={styles.placeholderIcon}>🎯</div>
                <h3>No images available</h3>
                <p>This gig doesn't have any images to display</p>
              </div>
            )}
          </div>

          {/* Content Tabs */}
          <div className={styles.contentTabs}>
            <div className={styles.tabsNav}>
              <button
                className={`${styles.tabButton} ${activeTab === 'description' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button
                className={`${styles.tabButton} ${activeTab === 'about' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('about')}
              >
                About Freelancer
              </button>
              <button
                className={`${styles.tabButton} ${activeTab === 'reviews' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews ({reviewCount})
              </button>
            </div>

            <div className={styles.tabContent}>
              {activeTab === 'description' && (
                <div className={styles.description}>
                  <div className={styles.descriptionContent}>
                    {gig.description ? gig.description.split('\n').map((line, index) => (
                      <p key={index}>{line}</p>
                    )) : (
                      <p>No description available for this gig.</p>
                    )}
                  </div>

                  {skillsArray.length > 0 && (
                    <div className={styles.skillsSection}>
                      <h3>Skills & Expertise</h3>
                      <div className={styles.skillTags}>
                        {skillsArray.slice(0, 8).map((skill, index) => (
                          <span key={index} className={styles.skillTag}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'about' && (
                <div className={styles.aboutFreelancer}>
                  <div className={styles.freelancerCard}>
                    <div className={styles.freelancerHeader}>
                      <div className={styles.freelancerAvatarLarge}>
                        {gig.freelancerAvatar ? (
                          <img src={gig.freelancerAvatar} alt={gig.freelancerName} className={styles.avatarImageLarge} />
                        ) : (
                          <svg className={styles.avatarIconLarge} viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        )}
                      </div>
                      <div className={styles.freelancerDetails}>
                        <h3>{gig.freelancerName || 'Anonymous Freelancer'}</h3>
                        <p>{gig.freelancerTitle || 'Professional Freelancer'}</p>
                        <div className={styles.freelancerStats}>
                          <div className={styles.stat}>
                            <span className={styles.statValue}>⭐ {rating}</span>
                            <span className={styles.statLabel}>Rating</span>
                          </div>
                          <div className={styles.stat}>
                            <span className={styles.statValue}>{reviewCount}</span>
                            <span className={styles.statLabel}>Reviews</span>
                          </div>
                          <div className={styles.stat}>
                            <span className={styles.statValue}>24h</span>
                            <span className={styles.statLabel}>Response</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className={styles.reviews}>
                  <div className={styles.reviewsPlaceholder}>
                    <h3>Customer Reviews</h3>
                    <p>Reviews functionality coming soon!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.orderCard}>
            <div className={styles.priceSection}>
              <div className={styles.priceHeader}>
                <span className={styles.price}>{formatCurrency(gig.fixedPrice)}</span>
                <span className={styles.priceLabel}>Starting at</span>
              </div>
            </div>

            <div className={styles.packageFeatures}>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>⏱️</span>
                <span className={styles.featureText}>{gig.deliveryTime || '3 days'} delivery</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>🔄</span>
                <span className={styles.featureText}>{gig.revisions || '2'} revisions</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>💬</span>
                <span className={styles.featureText}>24h response time</span>
              </div>
            </div>

            {!isOwner ? (
              <div className={styles.orderActions}>
                <Button
                  variant="primary"
                  fullWidth
                  size="large"
                  onClick={handleOrderNow}
                  loading={orderLoading}
                  disabled={orderLoading}
                  className={styles.orderButton}
                >
                  Continue ({formatCurrency(gig.fixedPrice)})
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={handleContactFreelancer}
                  className={styles.contactButton}
                >
                  💬 Contact Seller
                </Button>
              </div>
            ) : (
              <div className={styles.ownerActions}>
                <div className={styles.ownerNote}>
                  <span className={styles.ownerIcon}>👤</span>
                  <span>This is your gig</span>
                </div>
                <Link to={`/freelancer/gigs/edit/${gig.id}`}>
                  <Button variant="primary" fullWidth size="large">
                    Edit Gig
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Additional Info Card */}
          <div className={styles.infoCard}>
            <h4>Why choose this freelancer?</h4>
            <div className={styles.highlights}>
              <div className={styles.highlight}>
                <span className={styles.highlightIcon}>✅</span>
                <span>Top-rated seller</span>
              </div>
              <div className={styles.highlight}>
                <span className={styles.highlightIcon}>⚡</span>
                <span>Fast 24h response</span>
              </div>
              <div className={styles.highlight}>
                <span className={styles.highlightIcon}>🏆</span>
                <span>98% completion rate</span>
              </div>
              <div className={styles.highlight}>
                <span className={styles.highlightIcon}>🔄</span>
                <span>Unlimited revisions</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GigDetailPage;