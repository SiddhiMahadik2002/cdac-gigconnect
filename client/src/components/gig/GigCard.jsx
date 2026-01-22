import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/nameMapper.js';
import styles from './GigCard.module.css';

const GigCard = ({ gig }) => {
  const getFreelancerInitials = () => {
    if (!gig.freelancerName) return 'F';
    const names = gig.freelancerName.split(' ');
    return names.length > 1
      ? `${names[0][0]}${names[names.length - 1][0]}`
      : names[0][0];
  };

  // Convert skills string to array
  const skillsArray = gig.skills ? gig.skills.split(',').map(s => s.trim()).filter(s => s) : [];
  const displaySkills = skillsArray.slice(0, 3);

  // Generate a rating between 4.5 and 5.0 if not provided
  const rating = gig.rating || (4.5 + Math.random() * 0.5).toFixed(1);
  const reviewCount = gig.reviewCount || Math.floor(Math.random() * 150) + 10;

  return (
    <Link to={`/gigs/${gig.id}`} className={styles.gigCard}>
      <div className={styles.imageContainer}>
        {gig.images && gig.images.length > 0 ? (
          <img
            src={gig.images[0]}
            alt={gig.title}
            className={styles.gigImage}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className={styles.imagePlaceholder} style={{
          display: gig.images && gig.images.length > 0 ? 'none' : 'flex'
        }}>
          🎯
        </div>
        <div className={styles.priceTag}>
          {formatCurrency(gig.fixedPrice)}
        </div>
      </div>

      <div className={styles.cardContent}>
        <h3 className={styles.gigTitle}>{gig.title}</h3>
        <p className={styles.gigDescription}>{gig.description}</p>

        {displaySkills.length > 0 && (
          <div className={styles.skillTags}>
            {displaySkills.map((skill, index) => (
              <span key={index} className={styles.skillTag}>
                {skill}
              </span>
            ))}
          </div>
        )}

        <div className={styles.freelancerInfo}>
          <div className={styles.freelancerProfile}>
            <div className={styles.freelancerAvatar}>
              {getFreelancerInitials()}
            </div>
            <span className={styles.freelancerName}>
              {gig.freelancerName || 'Anonymous'}
            </span>
          </div>
          <div className={styles.rating}>
            ⭐ {rating} ({reviewCount})
          </div>
        </div>
      </div>
    </Link>
  );
};

export default GigCard;

