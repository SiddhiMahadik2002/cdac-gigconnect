import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllRequirements } from '../api/requirement.api';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import { formatCurrency } from '../utils/nameMapper';
import styles from './BrowseRequirementsPage.module.css';
import { WarningIcon, NoteIcon, BriefcaseIcon, CalendarIcon } from '../components/icons/Icons.jsx';

const BrowseRequirementsPage = () => {
  const { user } = useAuth();
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchRequirements();
  }, [currentPage]);

  const fetchRequirements = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page: currentPage,
        size: 20,
        sort: 'createdAt,desc'
      };

      const data = await getAllRequirements(params);

      // Handle paginated response
      setRequirements(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error('Error fetching requirements:', err);
      setError('Failed to load requirements. Please try again.');
      // Use mock data as fallback
      setRequirements([
        {
          id: 1,
          clientId: 2,
          clientName: "Jane Smith",
          title: "Build E-commerce Website",
          description: "Need a full-stack developer to build a modern e-commerce platform with React and Spring Boot",
          minPrice: 5000,
          maxPrice: 10000,
          skills: ["React", "Spring Boot", "PostgreSQL", "Docker"],
          yoeRequired: 3,
          status: "OPEN",
          createdAt: "2026-01-24T01:30:00Z",
          totalProposals: 5
        },
        {
          id: 2,
          clientId: 3,
          clientName: "Mike Johnson",
          title: "Mobile App Development",
          description: "Looking for an experienced React Native developer to build a cross-platform mobile application",
          minPrice: 3000,
          maxPrice: 6000,
          skills: ["React Native", "JavaScript", "Firebase"],
          yoeRequired: 2,
          status: "OPEN",
          createdAt: "2026-01-23T10:00:00Z",
          totalProposals: 3
        },
        {
          id: 3,
          clientId: 4,
          clientName: "Sarah Williams",
          title: "UI/UX Design for SaaS Platform",
          description: "Need a talented designer to create modern UI/UX designs for our SaaS platform",
          minPrice: 2000,
          maxPrice: 4000,
          skills: ["Figma", "UI Design", "UX Research", "Prototyping"],
          yoeRequired: 4,
          status: "OPEN",
          createdAt: "2026-01-22T15:30:00Z",
          totalProposals: 8
        }
      ]);
      setTotalElements(3);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatBudget = (min, max) => {
    if (min && max) {
      return `${formatCurrency(min)} - ${formatCurrency(max)}`;
    } else if (min) {
      return `${formatCurrency(min)}+`;
    } else if (max) {
      return `Up to ${formatCurrency(max)}`;
    }
    return 'Budget not specified';
  };

  if (loading) {
    return <Loader centered fullHeight text="Loading requirements..." />;
  }

  return (
    <div className={styles.browseRequirements}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Browse Requirements</h1>
            <p className={styles.subtitle}>
              Find new projects and submit proposals • {totalElements} opportunities available
            </p>
          </div>
          <div className={styles.headerActions}>
            <Link to="/freelancer/gigs/new">
              <Button variant="secondary">Create Gig</Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className={styles.error}>
            <span><WarningIcon /></span>
            {error}
          </div>
        )}

        {requirements.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><NoteIcon /></div>
            <h3>No requirements available</h3>
            <p>Check back later for new opportunities or create a gig to showcase your skills.</p>
            <Link to="/freelancer/gigs/new">
              <Button variant="primary">Create Your First Gig</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.stats}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{totalElements}</span>
                <span className={styles.statLabel}>Total Requirements</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{requirements.filter(r => r.totalProposals < 5).length}</span>
                <span className={styles.statLabel}>Low Competition</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>
                  {formatCurrency(
                    requirements.reduce((sum, r) => sum + ((r.minPrice + r.maxPrice) / 2), 0) / requirements.length
                  )}
                </span>
                <span className={styles.statLabel}>Avg Budget</span>
              </div>
            </div>

            <div className={styles.requirementsList}>
              {requirements.map((requirement) => (
                <div key={requirement.id} className={styles.requirementCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.clientInfo}>
                      <div className={styles.clientAvatar}>
                        {requirement.clientName?.charAt(0) || 'C'}
                      </div>
                      <div className={styles.clientDetails}>
                        <h4 className={styles.clientName}>{requirement.clientName}</h4>
                        <span className={styles.postedDate}>Posted {formatDate(requirement.createdAt)}</span>
                      </div>
                    </div>
                    <div className={styles.budget}>
                      {formatBudget(requirement.minPrice, requirement.maxPrice)}
                    </div>
                  </div>

                  <div className={styles.cardContent}>
                    <h3 className={styles.requirementTitle}>{requirement.title}</h3>
                    <p className={styles.requirementDescription}>{requirement.description}</p>

                    <div className={styles.requirementMeta}>
                      {requirement.yoeRequired && (
                        <div className={styles.metaItem}>
                          <span className={styles.metaIcon}><BriefcaseIcon /></span>
                          <span>{requirement.yoeRequired}+ years experience</span>
                        </div>
                      )}
                      <div className={styles.metaItem}>
                        <span className={styles.metaIcon}><NoteIcon /></span>
                        <span>{requirement.totalProposals} proposals</span>
                      </div>
                      <div className={styles.metaItem}>
                        <span className={styles.metaIcon}><CalendarIcon /></span>
                        <span>{formatDate(requirement.createdAt)}</span>
                      </div>
                    </div>

                    {requirement.skills && requirement.skills.length > 0 && (
                      <div className={styles.skillTags}>
                        {requirement.skills.slice(0, 5).map((skill, index) => (
                          <span key={index} className={styles.skillTag}>{skill}</span>
                        ))}
                        {requirement.skills.length > 5 && (
                          <span className={styles.skillTag}>+{requirement.skills.length - 5}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className={styles.cardFooter}>
                    <Link to={`/requirements/${requirement.id}`}>
                      <Button variant="primary">View Details & Submit Proposal</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <Button
                  variant="secondary"
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <span className={styles.pageInfo}>
                  Page {currentPage + 1} of {totalPages}
                </span>
                <Button
                  variant="secondary"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage >= totalPages - 1}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BrowseRequirementsPage;
