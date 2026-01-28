import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyRequirements } from '../api/requirement.api';
import { USER_ROLES } from '../utils/constants';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import styles from './ClientRequirementsPage.module.css';

export function ClientRequirementsPage() {
    const { user, role } = useAuth();
    const navigate = useNavigate();
    const [requirements, setRequirements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // all, open, closed

    // Redirect if not client
    if (role !== USER_ROLES.CLIENT) {
        return (
            <div className={styles.errorContainer}>
                <h2>Access Denied</h2>
                <p>Only clients can view requirements.</p>
                <Button onClick={() => navigate('/gigs')}>
                    Browse Gigs Instead
                </Button>
            </div>
        );
    }

    useEffect(() => {
        loadRequirements();
    }, []);

    const loadRequirements = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getMyRequirements();
            setRequirements(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load requirements:', error);
            setError('Failed to load requirements. Please try again.');
            setRequirements([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredRequirements = requirements.filter(requirement => {
        if (filter === 'all') return true;
        return requirement.status.toLowerCase() === filter;
    });

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Loader />
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <h2>Something went wrong</h2>
                <p>{error}</p>
                <Button onClick={loadRequirements}>Try Again</Button>
            </div>
        );
    }

    return (
        <div className={styles.clientRequirements}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <h1 className={styles.title}>My Requirements</h1>
                        <p className={styles.subtitle}>
                            Manage your project requirements and view proposals from freelancers
                        </p>
                    </div>
                    <Link to="/create-requirement">
                        <Button>Post New Requirement</Button>
                    </Link>
                </div>

                {requirements.length > 0 && (
                    <div className={styles.controls}>
                        <div className={styles.filterTabs}>
                            <button
                                className={`${styles.filterTab} ${filter === 'all' ? styles.active : ''}`}
                                onClick={() => setFilter('all')}
                            >
                                All ({requirements.length})
                            </button>
                            <button
                                className={`${styles.filterTab} ${filter === 'open' ? styles.active : ''}`}
                                onClick={() => setFilter('open')}
                            >
                                Open ({requirements.filter(r => r.status.toLowerCase() === 'open').length})
                            </button>
                            <button
                                className={`${styles.filterTab} ${filter === 'closed' ? styles.active : ''}`}
                                onClick={() => setFilter('closed')}
                            >
                                Closed ({requirements.filter(r => r.status.toLowerCase() === 'closed').length})
                            </button>
                        </div>
                    </div>
                )}

                {requirements.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📝</div>
                        <h3>No Requirements Posted</h3>
                        <p>
                            Start by posting your first project requirement to receive proposals from talented freelancers.
                        </p>
                        <Link to="/create-requirement">
                            <Button>Post Your First Requirement</Button>
                        </Link>
                    </div>
                ) : filteredRequirements.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>🔍</div>
                        <h3>No {filter} Requirements</h3>
                        <p>
                            No requirements found with the current filter. Try selecting a different status.
                        </p>
                    </div>
                ) : (
                    <div className={styles.requirementsList}>
                        {filteredRequirements.map((requirement) => (
                            <RequirementCard
                                key={requirement.id}
                                requirement={requirement}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function RequirementCard({ requirement }) {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatBudget = (min, max) => {
        if (min && max) {
            return `$${min} - $${max}`;
        } else if (min) {
            return `$${min}+`;
        } else if (max) {
            return `Up to $${max}`;
        }
        return 'Budget not specified';
    };

    return (
        <div className={styles.requirementCard}>
            <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                    <h3>{requirement.title}</h3>
                    <span className={`${styles.statusBadge} ${requirement.status.toLowerCase() === 'open'
                        ? styles.statusOpen
                        : styles.statusClosed
                        }`}>
                        {requirement.status}
                    </span>
                </div>
                <div className={styles.cardMeta}>
                    <span className={styles.postedDate}>
                        Posted {formatDate(requirement.createdAt)}
                    </span>
                </div>
            </div>

            <div className={styles.cardContent}>
                <p className={styles.description}>{requirement.description}</p>

                <div className={styles.requirementDetails}>
                    <div className={styles.detail}>
                        <span className={styles.detailLabel}>Budget:</span>
                        <span className={styles.detailValue}>
                            {formatBudget(requirement.minPrice, requirement.maxPrice)}
                        </span>
                    </div>
                    {requirement.yoeRequired && (
                        <div className={styles.detail}>
                            <span className={styles.detailLabel}>Experience:</span>
                            <span className={styles.detailValue}>
                                {requirement.yoeRequired}+ years required
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.cardActions}>
                <Link
                    to={`/requirements/${requirement.id}`}
                    className={styles.viewLink}
                >
                    View Details
                </Link>
                <Link
                    to={`/requirements/${requirement.id}/proposals`}
                    className={styles.proposalsLink}
                >
                    View Proposals ({requirement.totalProposals || 0})
                </Link>
            </div>
        </div>
    );
}

export default ClientRequirementsPage;
