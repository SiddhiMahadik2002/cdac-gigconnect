import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getRequirementById } from '../api/requirement.api';
import { submitProposal, getMyProposals } from '../api/proposal.api';
import { deliverWork } from '../api/orderApi.js';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES } from '../utils/constants';
import { getStatusDisplay, canRequestCompletion } from '../utils/statusHelpers';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import TextArea from '../components/common/TextArea';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import { formatCurrency } from '../utils/nameMapper';
import styles from './RequirementDetailPage.module.css';

export function RequirementDetailPage() {
    const { requirementId } = useParams();
    const navigate = useNavigate();
    const { user, role } = useAuth();
    const [requirement, setRequirement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showProposalModal, setShowProposalModal] = useState(false);
    const [proposalMessage, setProposalMessage] = useState('');
    const [proposedPrice, setProposedPrice] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [userProposal, setUserProposal] = useState(null);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [completionNotes, setCompletionNotes] = useState('');
    const [deliverableLinks, setDeliverableLinks] = useState('');

    useEffect(() => {
        loadRequirement();
        if (role === USER_ROLES.FREELANCER) {
            loadUserProposal();
        }
    }, [requirementId, role]);

    const loadRequirement = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getRequirementById(requirementId);
            setRequirement(data);
        } catch (error) {
            console.error('Failed to load requirement:', error);
            setError('Failed to load requirement details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const loadUserProposal = async () => {
        try {
            const orders = await getMyProposals(); // This now returns orders
            // Check if user has an order for this requirement (CUSTOM_PROJECT with matching requirementId)
            const order = orders.find(o =>
                o.orderType === 'CUSTOM_PROJECT' &&
                o.requirementId === parseInt(requirementId)
            );
            // Map order back to proposal-like structure for backward compatibility
            if (order) {
                setUserProposal({
                    id: order.proposalId, // The original proposal ID for display
                    orderId: order.id, // The order ID for delivery operations
                    requirementId: order.requirementId,
                    status: order.status === 'CONFIRMED' ? 'ACCEPTED' :
                        order.status === 'IN_PROGRESS' ? 'IN_PROGRESS' :
                            order.status === 'DELIVERED' ? 'COMPLETION_REQUESTED' :
                                order.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
                    proposedPrice: order.amount,
                    message: order.description,
                    // clientFeedback should prefer revisionNotes (client requested changes) when present
                    clientFeedback: order.revisionNotes || order.clientNotes || null,
                    // expose revisionNotes separately as well
                    revisionNotes: order.revisionNotes || null,
                    // completion/delivery info
                    completionNotes: order.deliveryNotes || null,
                    deliverableLinks: order.deliveryLinks || null,
                    createdAt: order.createdAt
                });
            } else {
                setUserProposal(null);
            }
        } catch (error) {
            console.error('Failed to load user proposal:', error);
        }
    };

    // Prefer order/proposal status for display when we have a mapped userProposal
    const displayedStatus = userProposal?.status || requirement?.status;

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Loader />
            </div>
        );
    }

    if (error || !requirement) {
        return (
            <div className={styles.errorContainer}>
                <h2>Requirement Not Found</h2>
                <p>{error || 'The requirement you are looking for does not exist or you don\'t have access to it.'}</p>
                <Button onClick={() => navigate('/my-requirements')}>
                    Back to My Requirements
                </Button>
            </div>
        );
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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

    const handleSubmitProposal = async (e) => {
        e.preventDefault();

        if (!proposalMessage.trim() || !proposedPrice) {
            setSubmitError('Please fill in all fields');
            return;
        }

        try {
            setSubmitting(true);
            setSubmitError(null);

            await submitProposal(requirementId, {
                message: proposalMessage,
                proposedPrice: parseFloat(proposedPrice)
            });

            setSubmitSuccess(true);
            setTimeout(() => {
                setShowProposalModal(false);
                setProposalMessage('');
                setProposedPrice('');
                setSubmitSuccess(false);
                loadRequirement(); // Reload to update proposal count
            }, 2000);
        } catch (err) {
            console.error('Failed to submit proposal:', err);
            setSubmitError(err.response?.data?.message || 'Failed to submit proposal. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitCompletion = async (e) => {
        e.preventDefault();

        if (!completionNotes.trim()) {
            setSubmitError('Please provide completion notes');
            return;
        }

        try {
            setSubmitting(true);
            setSubmitError(null);

            // Use unified order API for delivery (works for all order types)
            const deliveryNotes = `${completionNotes.trim()}${deliverableLinks.trim() ? '\n\nDeliverable Links: ' + deliverableLinks.trim() : ''}`;

            await deliverWork(userProposal.orderId, deliveryNotes);

            setSubmitSuccess(true);
            setTimeout(() => {
                setShowCompletionModal(false);
                setCompletionNotes('');
                setDeliverableLinks('');
                setSubmitSuccess(false);
                loadUserProposal(); // Reload proposal to update status
            }, 2000);
        } catch (err) {
            console.error('Failed to submit completion request:', err);
            setSubmitError(err.response?.data?.message || 'Failed to submit completion request.');
        } finally {
            setSubmitting(false);
        }
    };

    const isOwner = user?.id === requirement.clientId;
    const isFreelancer = role === USER_ROLES.FREELANCER;
    const isClient = role === USER_ROLES.CLIENT;

    return (
        <div className={styles.requirementDetail}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.breadcrumb}>
                        <Link
                            to={isClient ? "/my-requirements" : "/requirements"}
                            className={styles.breadcrumbLink}
                        >
                            {isClient ? "My Requirements" : "Browse Requirements"}
                        </Link>
                        <span className={styles.breadcrumbSeparator}>/</span>
                        <span className={styles.breadcrumbCurrent}>Requirement Details</span>
                    </div>

                    <div className={styles.headerContent}>
                        <div className={styles.titleSection}>
                            <h1 className={styles.title}>{requirement.title}</h1>
                            <span className={styles.statusBadge} style={{
                                backgroundColor: getStatusDisplay(displayedStatus).color,
                                padding: '6px 16px',
                                borderRadius: '20px',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#fff'
                            }}>
                                {getStatusDisplay(displayedStatus).icon} {getStatusDisplay(displayedStatus).label}
                            </span>
                        </div>

                        {isOwner && (
                            <div className={styles.ownerActions}>
                                <Link
                                    to={`/requirements/${requirement.id}/proposals`}
                                    className={styles.proposalsButton}
                                >
                                    View Proposals ({requirement.totalProposals || 0})
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.content}>
                    <div className={styles.mainContent}>
                        {/* Client Feedback Section - For Freelancers */}
                        {isFreelancer && userProposal && userProposal.clientFeedback && (
                            <div className={styles.feedbackSection}>
                                <div className={styles.sectionHeader}>
                                    <h2>Client Feedback</h2>
                                    <span className={styles.feedbackLabel}>Changes Requested</span>
                                </div>
                                <div className={styles.feedbackBox}>
                                    <p className={styles.feedbackMessage}>
                                        {userProposal.clientFeedback.split('\n\n')[0]}
                                    </p>
                                    {userProposal.clientFeedback.includes('Requested Changes:') && (
                                        <>
                                            <div className={styles.divider}></div>
                                            <div className={styles.changesRequested}>
                                                <strong>Requested Changes:</strong>
                                                <p>{userProposal.clientFeedback.split('Requested Changes:')[1]?.trim()}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className={styles.section}>
                            <h2>Description</h2>
                            <div className={styles.description}>
                                {requirement.description.split('\n').map((paragraph, index) => (
                                    <p key={index}>{paragraph}</p>
                                ))}
                            </div>
                        </div>

                        <div className={styles.section}>
                            <h2>Requirements & Skills</h2>
                            <div className={styles.requirementDetails}>
                                <div className={styles.detail}>
                                    <span className={styles.detailLabel}>Budget Range:</span>
                                    <span className={styles.detailValue}>
                                        {formatBudget(requirement.minPrice, requirement.maxPrice)}
                                    </span>
                                </div>

                                {requirement.yoeRequired && (
                                    <div className={styles.detail}>
                                        <span className={styles.detailLabel}>Experience Required:</span>
                                        <span className={styles.detailValue}>
                                            {requirement.yoeRequired}+ years
                                        </span>
                                    </div>
                                )}

                                {requirement.skills && requirement.skills.length > 0 && (
                                    <div className={styles.detail}>
                                        <span className={styles.detailLabel}>Required Skills:</span>
                                        <div className={styles.skillsContainer}>
                                            {requirement.skills.map((skill, index) => (
                                                <span key={index} className={styles.skillTag}>
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className={styles.detail}>
                                    <span className={styles.detailLabel}>Proposals Received:</span>
                                    <span className={styles.detailValue}>
                                        {requirement.totalProposals || 0}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.section}>
                            <h2>Timeline</h2>
                            <div className={styles.timeline}>
                                <div className={styles.timelineItem}>
                                    <div className={styles.timelineLabel}>Posted:</div>
                                    <div className={styles.timelineValue}>
                                        {formatDate(requirement.createdAt)}
                                    </div>
                                </div>
                                {requirement.updatedAt !== requirement.createdAt && (
                                    <div className={styles.timelineItem}>
                                        <div className={styles.timelineLabel}>Last Updated:</div>
                                        <div className={styles.timelineValue}>
                                            {formatDate(requirement.updatedAt)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={styles.sidebar}>
                        {isFreelancer && (
                            <div className={styles.clientCard}>
                                <h3>Client Information</h3>
                                <div className={styles.clientInfo}>
                                    <div className={styles.clientAvatar}>
                                        {requirement.clientName?.[0]?.toUpperCase() || 'C'}
                                    </div>
                                    <div className={styles.clientDetails}>
                                        <h4>{requirement.clientName || 'Client'}</h4>
                                        <p>{requirement.client?.title || 'Project Client'}</p>
                                    </div>
                                </div>

                                {requirement.client?.joinedDate && (
                                    <div className={styles.clientMeta}>
                                        <div className={styles.metaItem}>
                                            <span>Member since:</span>
                                            <span>{formatDate(requirement.client.joinedDate)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {isFreelancer && (
                            <div className={styles.actionCard}>
                                <h3>Actions</h3>
                                <div className={styles.actionButtons}>
                                    {!isOwner && requirement.status === 'OPEN' && !userProposal && (
                                        <Button
                                            className={styles.fullWidthButton}
                                            onClick={() => setShowProposalModal(true)}
                                        >
                                            💼 Submit Proposal
                                        </Button>
                                    )}
                                    {userProposal && canRequestCompletion(userProposal.status) && (
                                        <Button
                                            className={styles.fullWidthButton}
                                            onClick={() => setShowCompletionModal(true)}
                                        >
                                            ✓ {userProposal.status === 'REVISION_REQUESTED' ? 'Resubmit Completion' : 'Request Completion'}
                                        </Button>
                                    )}
                                    {userProposal && userProposal.status === 'COMPLETION_REQUESTED' && (
                                        <div className={styles.infoNotice}>
                                            <span>⏳</span>
                                            <p>Completion submitted, awaiting client approval</p>
                                        </div>
                                    )}
                                    {userProposal && userProposal.status === 'AWAITING_COMPLETION' && (
                                        <div className={styles.infoNotice}>
                                            <span>⏳</span>
                                            <p>Completion submitted, awaiting client approval</p>
                                        </div>
                                    )}
                                    {userProposal && userProposal.status === 'PENDING' && (
                                        <div className={styles.infoNotice}>
                                            <span>⏳</span>
                                            <p>Your proposal is pending review</p>
                                        </div>
                                    )}
                                    {requirement.status === 'CLOSED' && !userProposal && (
                                        <div className={styles.closedNotice}>
                                            <span>🔒</span>
                                            <p>This requirement is closed</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className={styles.tipsCard}>
                            <h3>💡 Tips</h3>
                            <div className={styles.tips}>
                                {isClient && (
                                    <>
                                        <div className={styles.tip}>
                                            <strong>Review Proposals Carefully:</strong>
                                            <p>Take time to review each proposal and the freelancer's profile before making a decision.</p>
                                        </div>
                                        <div className={styles.tip}>
                                            <strong>Communicate Clearly:</strong>
                                            <p>Be specific about your requirements to attract the right freelancers.</p>
                                        </div>
                                    </>
                                )}
                                {isFreelancer && (
                                    <>
                                        <div className={styles.tip}>
                                            <strong>Write a Strong Proposal:</strong>
                                            <p>Explain why you're the best fit and include relevant experience and portfolio examples.</p>
                                        </div>
                                        <div className={styles.tip}>
                                            <strong>Competitive Pricing:</strong>
                                            <p>Review the budget range and propose a fair price that reflects your skills and the project scope.</p>
                                        </div>
                                        <div className={styles.tip}>
                                            <strong>Respond Quickly:</strong>
                                            <p>Fast response times improve your chances. Submit your proposal while the opportunity is fresh.</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Proposal Submission Modal */}
            {showProposalModal && (
                <div className={styles.modalOverlay} onClick={() => setShowProposalModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Submit Your Proposal</h2>
                            <button className={styles.closeButton} onClick={() => setShowProposalModal(false)}>✕</button>
                        </div>

                        <form onSubmit={handleSubmitProposal} className={styles.proposalForm}>
                            <div className={styles.formGroup}>
                                <label>Budget Range</label>
                                <div className={styles.budgetInfo}>
                                    {formatBudget(requirement.minPrice, requirement.maxPrice)}
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="proposedPrice">Your Proposed Price *</label>
                                <Input
                                    id="proposedPrice"
                                    type="number"
                                    placeholder="Enter your price"
                                    value={proposedPrice}
                                    onChange={(e) => setProposedPrice(e.target.value)}
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="proposalMessage">Cover Letter / Proposal Message *</label>
                                <TextArea
                                    id="proposalMessage"
                                    placeholder="Explain why you're the best fit for this project. Include relevant experience, portfolio examples, and your approach..."
                                    value={proposalMessage}
                                    onChange={(e) => setProposalMessage(e.target.value)}
                                    rows={8}
                                    required
                                />
                                <div className={styles.charCount}>{proposalMessage.length} characters</div>
                            </div>

                            {submitError && (
                                <div className={styles.errorMessage}>
                                    <span>⚠️</span>
                                    {submitError}
                                </div>
                            )}

                            {submitSuccess && (
                                <div className={styles.successMessage}>
                                    <span>✅</span>
                                    Proposal submitted successfully!
                                </div>
                            )}

                            <div className={styles.modalActions}>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowProposalModal(false)}
                                    disabled={submitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    loading={submitting}
                                    disabled={submitting || submitSuccess}
                                >
                                    {submitting ? 'Submitting...' : 'Submit Proposal'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Completion Request Modal */}
            {showCompletionModal && (
                <Modal
                    isOpen={showCompletionModal}
                    onClose={() => setShowCompletionModal(false)}
                    title="Request Project Completion"
                >
                    <form onSubmit={handleSubmitCompletion}>
                        <div className={styles.formGroup}>
                            <label htmlFor="completionNotes">Completion Notes *</label>
                            <TextArea
                                id="completionNotes"
                                placeholder="Describe the work completed, key features implemented, and any important notes for the client..."
                                value={completionNotes}
                                onChange={(e) => setCompletionNotes(e.target.value)}
                                rows={6}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="deliverableLinks">Deliverable Links (Optional)</label>
                            <Input
                                id="deliverableLinks"
                                type="text"
                                placeholder="GitHub repo, live demo, files, etc."
                                value={deliverableLinks}
                                onChange={(e) => setDeliverableLinks(e.target.value)}
                            />
                        </div>

                        {submitError && (
                            <div className={styles.errorMessage}>
                                <span>⚠️</span>
                                {submitError}
                            </div>
                        )}

                        {submitSuccess && (
                            <div className={styles.successMessage}>
                                <span>✅</span>
                                Completion request submitted successfully!
                            </div>
                        )}

                        <div className={styles.modalActions}>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setShowCompletionModal(false)}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={submitting || submitSuccess}
                            >
                                {submitting ? 'Submitting...' : 'Submit for Approval'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}

export default RequirementDetailPage;