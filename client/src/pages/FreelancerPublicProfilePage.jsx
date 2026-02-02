import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getFreelancerProfile } from '../api/freelancer.api.js';
import Loader from '../components/common/Loader.jsx';
import Button from '../components/common/Button.jsx';
import styles from './FreelancerProfilePage.module.css';

const FreelancerPublicProfilePage = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getFreelancerProfile(id);
        setProfile(data);
      } catch (err) {
        console.error('Failed to load freelancer profile:', err);
        setError('Unable to load profile');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) return <Loader centered text="Loading profile..." />;

  if (error) return (
    <div className={styles.profilePage}>
      <div className={styles.alert + ' ' + styles.error}>{error}</div>
    </div>
  );

  if (!profile) return null;

  const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Freelancer';

  return (
    <div className={`${styles.profilePage} ${styles.publicProfile}`}>
      <div className={styles.profileContainer}>
        <div className={styles.profileHeader}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              <span className={styles.avatarText}>{(fullName.charAt(0) || 'F').toUpperCase()}</span>
            </div>
            <div className={styles.profileInfo}>
              <h1 className={styles.profileName}>{fullName}</h1>
              <p className={styles.profileEmail}>{profile.email}</p>
              {profile.title && <p className={styles.profileTitle}>{profile.title}</p>}
            </div>
          </div>

          <div className={styles.profileStats}>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{profile.averageRating ?? '—'}</div>
              <div className={styles.statLabel}>Rating</div>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{profile.ratingCount ?? 0}</div>
              <div className={styles.statLabel}>Reviews</div>
            </div>
            {/* Contact CTA removed for public profile */}
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>About</h3>
          <p className={styles.sectionDescription}>{profile.description || 'No description provided.'}</p>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Recent Reviews</h3>
          {profile.recentReviews && profile.recentReviews.length > 0 ? (
            profile.recentReviews.map((r) => (
              <div key={r.id} className={styles.reviewItem}>
                <div className={styles.reviewHeader}>
                  <strong>{r.clientName || 'Client'}</strong>
                  <span className={styles.reviewRating}>⭐ {r.rating ?? '—'}</span>
                </div>
                {r.clientFeedback && <p className={styles.reviewText}>{r.clientFeedback}</p>}
                {r.completedAt && <div className={styles.reviewMeta}>Completed: {new Date(r.completedAt).toLocaleDateString()}</div>}
              </div>
            ))
          ) : (
            <p>No reviews yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreelancerPublicProfilePage;
