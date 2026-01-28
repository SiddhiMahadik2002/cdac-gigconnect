import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import TextArea from '../components/common/TextArea';
import Input from '../components/common/Input';
import { formatCurrency } from '../utils/nameMapper.js';
import { getMyRequirements, getRequirementProposals } from '../api/requirement.api.js';
import { getClientOrders, approveWork, requestWorkRevision } from '../api/orderApi.js';
import { USER_ROLES, PROPOSAL_STATUS, ORDER_STATUS } from '../utils/constants.js';
import { getStatusDisplay, canReviewCompletion } from '../utils/statusHelpers.js';
import styles from './ClientProjectsPage.module.css';

const ClientProjectsPage = () => {
    const { user, role } = useAuth();
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('ALL'); // ALL, IN_PROGRESS, COMPLETION_REQUESTED
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [rating, setRating] = useState(5);
    const [requestedChanges, setRequestedChanges] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Redirect if not client
    if (role !== USER_ROLES.CLIENT) {
        navigate('/dashboard');
        return null;
    }

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            setError('');

            // Fetch client orders (unified endpoint) and map to project view
            const response = await getClientOrders();
            const orders = response.content || response;

            const clientProjects = orders.map(order => ({
                id: order.id,
                proposalId: order.proposalId,
                orderId: order.id,
                requirementId: order.requirementId,
                title: order.title || order.requirementTitle || `Project #${order.id}`,
                description: order.description || order.requirementDescription,
                price: order.amount,
                status: order.status,
                freelancerName: order.freelancerName || `Freelancer #${order.freelancerId}`,
                freelancerId: order.freelancerId,
                acceptedAt: order.createdAt,
                completionNotes: order.deliveryNotes,
                deliverableLinks: order.deliveryLinks || null,
                submittedAt: order.deliveredAt,
                message: order.clientNotes
            }));

            setProjects(clientProjects);
        } catch (err) {
            setError('Failed to load projects: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = (project) => {
        setSelectedProject(project);
        setShowApprovalModal(true);
        setFeedback('');
        setRating(5);
    };

    const handleReject = (project) => {
        setSelectedProject(project);
        setShowRejectionModal(true);
        setFeedback('');
        setRequestedChanges('');
    };

    const handleSubmitApproval = async (e) => {
        e.preventDefault();

        if (!feedback.trim()) {
            setError('Please provide feedback');
            return;
        }

        try {
            setSubmitting(true);
            setError('');

            // Use unified order API - combine feedback and rating into client notes
            const clientNotes = `${feedback.trim()}${rating ? '\n\nRating: ' + parseInt(rating) : ''}`;
            await approveWork(selectedProject.id, clientNotes);

            setShowApprovalModal(false);
            setFeedback('');
            setRating(5);
            await fetchProjects(); // Refresh projects list
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to approve completion');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitRejection = async (e) => {
        e.preventDefault();

        if (!feedback.trim() || !requestedChanges.trim()) {
            setError('Please provide feedback and requested changes');
            return;
        }

        try {
            setSubmitting(true);
            setError('');

            // Use unified order API for revision requests
            const revisionNotes = `${feedback.trim()}${requestedChanges.trim() ? '\n\nRequested Changes: ' + requestedChanges.trim() : ''}`;
            await requestWorkRevision(selectedProject.id, revisionNotes);

            setShowRejectionModal(false);
            setFeedback('');
            setRequestedChanges('');
            await fetchProjects(); // Refresh projects list
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to request revision');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredProjects = projects.filter(project => {
        if (filter === 'ALL') return true;
        // In Progress: proposal accepted or explicitly in-progress order
        if (filter === 'IN_PROGRESS') return (
            project.status === PROPOSAL_STATUS.IN_PROGRESS ||
            project.status === PROPOSAL_STATUS.ACCEPTED ||
            project.status === ORDER_STATUS.IN_PROGRESS
        );
        // Awaiting Approval / Completion Requested: include legacy proposal statuses, backend SUBMITTED_FOR_REVIEW, and delivered orders
        if (filter === 'COMPLETION_REQUESTED') return (
            project.status === PROPOSAL_STATUS.COMPLETION_REQUESTED ||
            project.status === PROPOSAL_STATUS.AWAITING_COMPLETION ||
            project.status === 'SUBMITTED_FOR_REVIEW' ||
            project.status === ORDER_STATUS.DELIVERED
        );
        return true;
    });

    const activeCount = projects.filter(p => (
        p.status === PROPOSAL_STATUS.IN_PROGRESS ||
        p.status === PROPOSAL_STATUS.ACCEPTED ||
        p.status === ORDER_STATUS.IN_PROGRESS
    )).length;
    const awaitingApprovalCount = projects.filter(p => (
        p.status === PROPOSAL_STATUS.COMPLETION_REQUESTED ||
        p.status === PROPOSAL_STATUS.AWAITING_COMPLETION ||
        p.status === 'SUBMITTED_FOR_REVIEW' ||
        p.status === ORDER_STATUS.DELIVERED
    )).length;

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Loader />
            </div>
        );
    }

    return (
        <div className={styles.projectsPage}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <h1 className={styles.title}>My Projects</h1>
                        <p className={styles.subtitle}>
                            Manage your ongoing projects and review completion requests
                        </p>
                    </div>
                </div>

                {error && (
                    <div className={styles.errorBanner}>
                        <span>⚠️</span>
                        {error}
                    </div>
                )}

                <div className={styles.filterSection}>
                    <div className={styles.filterButtons}>
                        <button
                            className={`${styles.filterButton} ${filter === 'ALL' ? styles.active : ''}`}
                            onClick={() => setFilter('ALL')}
                        >
                            All Projects ({projects.length})
                        </button>
                        <button
                            className={`${styles.filterButton} ${filter === 'IN_PROGRESS' ? styles.active : ''}`}
                            onClick={() => setFilter('IN_PROGRESS')}
                        >
                            In Progress ({activeCount})
                        </button>
                        <button
                            className={`${styles.filterButton} ${filter === 'COMPLETION_REQUESTED' ? styles.active : ''}`}
                            onClick={() => setFilter('COMPLETION_REQUESTED')}
                        >
                            🔔 Awaiting Approval ({awaitingApprovalCount})
                        </button>
                    </div>
                </div>

                {filteredProjects.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📋</div>
                        <h3>No Projects Found</h3>
                        <p>
                            {filter === 'ALL'
                                ? "You don't have any active projects yet. Post a requirement to get started!"
                                : `No projects in "${filter}" status.`
                            }
                        </p>
                        <Link to="/create-requirement">
                            <Button>Post a Requirement</Button>
                        </Link>
                    </div>
                ) : (
                    <div className={styles.projectsGrid}>
                        {filteredProjects.map((project) => {
                            const statusInfo = getStatusDisplay(project.status);
                            const canReview = canReviewCompletion(project.status);

                            return (
                                <div key={project.id} className={styles.projectCard}>
                                    <div className={styles.projectHeader}>
                                        <div className={styles.projectInfo}>
                                            <h3 className={styles.projectTitle}>{project.title}</h3>
                                            <span className={styles.projectId}>Requirement #{project.requirementId}</span>
                                        </div>
                                        <div className={styles.projectStatus}>
                                            <span
                                                className={styles.statusBadge}
                                                style={{
                                                    backgroundColor: statusInfo.color,
                                                    color: '#fff'
                                                }}
                                            >
                                                {statusInfo.icon} {statusInfo.label}
                                            </span>
                                        </div>
                                    </div>

                                    <p className={styles.projectDescription}>
                                        {project.description?.substring(0, 150) || project.message?.substring(0, 150) || 'No description'}
                                        {(project.description?.length > 150 || project.message?.length > 150) && '...'}
                                    </p>

                                    {/* Show completion request details */}
                                    {(project.status === PROPOSAL_STATUS.COMPLETION_REQUESTED || project.status === PROPOSAL_STATUS.AWAITING_COMPLETION) && (
                                        <div className={styles.completionBox}>
                                            <div className={styles.completionBoxHeader}>
                                                <span className={styles.completionBoxIcon}>📋</span>
                                                <strong>Completion Request</strong>
                                            </div>
                                            {project.completionNotes && (
                                                <div className={styles.completionDetail}>
                                                    <span className={styles.detailLabel}>Notes:</span>
                                                    <p className={styles.detailText}>{project.completionNotes}</p>
                                                </div>
                                            )}
                                            {project.deliverableLinks && (
                                                <div className={styles.completionDetail}>
                                                    <span className={styles.detailLabel}>Deliverables:</span>
                                                    <p className={styles.detailText}>
                                                        <a href={project.deliverableLinks} target="_blank" rel="noopener noreferrer">
                                                            {project.deliverableLinks}
                                                        </a>
                                                    </p>
                                                </div>
                                            )}
                                            <div className={styles.completionDetail}>
                                                <span className={styles.detailLabel}>Submitted:</span>
                                                <span className={styles.detailText}>
                                                    {new Date(project.submittedAt).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <div className={styles.projectMeta}>
                                        <div className={styles.projectMetaItem}>
                                            <span className={styles.metaIcon}>💰</span>
                                            <div>
                                                <span className={styles.metaLabel}>Project Value</span>
                                                <span className={styles.metaValue}>{formatCurrency(project.price)}</span>
                                            </div>
                                        </div>
                                        <div className={styles.projectMetaItem}>
                                            <span className={styles.metaIcon}>👤</span>
                                            <div>
                                                <span className={styles.metaLabel}>Freelancer</span>
                                                <span className={styles.metaValue}>{project.freelancerName}</span>
                                            </div>
                                        </div>
                                        {project.acceptedAt && (
                                            <div className={styles.projectMetaItem}>
                                                <span className={styles.metaIcon}>📅</span>
                                                <div>
                                                    <span className={styles.metaLabel}>Started</span>
                                                    <span className={styles.metaValue}>
                                                        {new Date(project.acceptedAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className={styles.projectActions}>
                                        <Link to={`/requirements/${project.requirementId}`}>
                                            <Button variant="secondary" size="small">
                                                View Details
                                            </Button>
                                        </Link>

                                        {canReview && (
                                            <>
                                                <Button
                                                    variant="success"
                                                    size="small"
                                                    onClick={() => handleApprove(project)}
                                                >
                                                    ✓ Approve
                                                </Button>
                                                <Button
                                                    variant="warning"
                                                    size="small"
                                                    onClick={() => handleReject(project)}
                                                >
                                                    🔄 Request Changes
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Approval Modal */}
            {showApprovalModal && (
                <Modal
                    isOpen={showApprovalModal}
                    onClose={() => setShowApprovalModal(false)}
                    title="Approve Project Completion"
                >
                    <form onSubmit={handleSubmitApproval}>
                        <div className={styles.formGroup}>
                            <label htmlFor="rating">Rating *</label>
                            <select
                                id="rating"
                                value={rating}
                                onChange={(e) => setRating(e.target.value)}
                                className={styles.ratingSelect}
                                required
                            >
                                <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                                <option value="4">⭐⭐⭐⭐ Good</option>
                                <option value="3">⭐⭐⭐ Average</option>
                                <option value="2">⭐⭐ Below Average</option>
                                <option value="1">⭐ Poor</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="feedback">Feedback *</label>
                            <TextArea
                                id="feedback"
                                placeholder="Share your experience working with the freelancer..."
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                rows={5}
                                required
                            />
                        </div>

                        <div className={styles.modalActions}>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setShowApprovalModal(false)}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="success"
                                disabled={submitting}
                            >
                                {submitting ? 'Approving...' : 'Approve & Complete'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Rejection Modal */}
            {showRejectionModal && (
                <Modal
                    isOpen={showRejectionModal}
                    onClose={() => setShowRejectionModal(false)}
                    title="Request Revisions"
                >
                    <form onSubmit={handleSubmitRejection}>
                        <div className={styles.formGroup}>
                            <label htmlFor="rejectionFeedback">Feedback *</label>
                            <TextArea
                                id="rejectionFeedback"
                                placeholder="Explain what needs to be revised..."
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                rows={4}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="requestedChanges">Specific Changes Required *</label>
                            <TextArea
                                id="requestedChanges"
                                placeholder="List the specific changes or improvements needed..."
                                value={requestedChanges}
                                onChange={(e) => setRequestedChanges(e.target.value)}
                                rows={4}
                                required
                            />
                        </div>

                        <div className={styles.modalActions}>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setShowRejectionModal(false)}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="warning"
                                disabled={submitting}
                            >
                                {submitting ? 'Sending...' : 'Request Revisions'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default ClientProjectsPage;
