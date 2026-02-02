import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getRequirementProposals, getRequirementById } from '../api/requirement.api';
import { acceptProposal } from '../api/proposal.api';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES } from '../utils/constants';
import { canAcceptProposal as canAcceptProposalHelper, getStatusDisplay, getActionDisabledReason } from '../utils/statusHelpers';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import PayNowButton from '../components/payment/PayNowButton';
import { formatCurrency } from '../utils/nameMapper';
import styles from './RequirementProposalsPage.module.css';

export function RequirementProposalsPage() {
    const { requirementId } = useParams();
    const navigate = useNavigate();
    const { role } = useAuth();
    const [requirement, setRequirement] = useState(null);
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [acceptingProposal, setAcceptingProposal] = useState(null);

    // Redirect if not client
    if (role !== USER_ROLES.CLIENT) {
        return (
            <div className={styles.errorContainer}>
                <h2>Access Denied</h2>
                <p>Only clients can view requirement proposals.</p>
                <Button onClick={() => navigate('/gigs')}>
                    Browse Gigs Instead
                </Button>
            </div>
        );
    }

    useEffect(() => {
        loadProposals();
    }, [requirementId]);

    const loadProposals = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load requirement and proposals separately
            const [requirementData, proposalsData] = await Promise.all([
                getRequirementById(requirementId),
                getRequirementProposals(requirementId)
            ]);

            setRequirement(requirementData || {});
            setProposals(Array.isArray(proposalsData) ? proposalsData : []);
        } catch (error) {
            console.error('Failed to load proposals:', error);
            setError('Failed to load proposals. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptProposal = async (proposalId) => {
        try {
            setAcceptingProposal(proposalId);

            // For direct acceptance (without payment integration), we need to provide the required payload
            const acceptanceData = {
                paymentId: null, // No payment for direct acceptance
                clientNotes: "Proposal accepted directly"
            };

            await acceptProposal(proposalId, acceptanceData);

            // Refresh the proposals to show updated status
            await loadProposals();

            // Show success message or redirect
            alert('Proposal accepted successfully!');
        } catch (error) {
            console.error('Failed to accept proposal:', error);
            alert('Failed to accept proposal. Please try again.');
        } finally {
            setAcceptingProposal(null);
        }
    };

    const handlePaymentSuccess = async (paymentData) => {
        console.log('Payment successful for proposal:', paymentData);

        try {
            // Accept the proposal after successful payment with payment details
            const acceptanceData = {
                paymentId: paymentData.paymentId, // Use the actual payment ID
                clientNotes: "Payment completed and proposal accepted"
            };

            await acceptProposal(paymentData.referenceId, acceptanceData);

            // Refresh the proposals to show updated status
            await loadProposals();

            // Redirect to success page
            const searchParams = new URLSearchParams({
                orderId: paymentData.orderId || 'unknown',
                paymentId: paymentData.paymentId,
                referenceType: paymentData.referenceType,
                referenceId: paymentData.referenceId
            });

            navigate(`/orders/success?${searchParams.toString()}`);
        } catch (error) {
            console.error('Failed to accept proposal after payment:', error);
            alert('Payment successful but failed to accept proposal. Please contact support.');
        }
    };

    const handlePaymentFailure = (error) => {
        console.error('Payment failed for proposal:', error);
        setAcceptingProposal(null);
    };

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
                <Button onClick={loadProposals}>Try Again</Button>
            </div>
        );
    }

    return (
        <div className={styles.proposalsPage}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.breadcrumb}>
                        <Link to="/my-requirements" className={styles.breadcrumbLink}>
                            My Requirements
                        </Link>
                        <span className={styles.breadcrumbSeparator}>/</span>
                        <span className={styles.breadcrumbCurrent}>Proposals</span>
                    </div>

                    <div className={styles.headerContent}>
                        <h1 className={styles.title}>{requirement.title}</h1>
                        <p className={styles.subtitle}>
                            {proposals.length} proposal{proposals.length !== 1 ? 's' : ''} received
                        </p>
                    </div>
                </div>

                {requirement && (
                    <div className={styles.requirementSummary}>
                        <h3>Requirement Summary</h3>
                        <p className={styles.description}>{requirement.description}</p>
                        <div className={styles.requirementMeta}>
                            <div className={styles.metaItem}>
                                <span className={styles.metaLabel}>Budget:</span>
                                <span className={styles.metaValue}>
                                    ${requirement.minPrice} - ${requirement.maxPrice}
                                </span>
                            </div>
                            {requirement.yoeRequired && (
                                <div className={styles.metaItem}>
                                    <span className={styles.metaLabel}>Experience Required:</span>
                                    <span className={styles.metaValue}>
                                        {requirement.yoeRequired}+ years
                                    </span>
                                </div>
                            )}
                            <div className={styles.metaItem}>
                                <span className={styles.metaLabel}>Status:</span>
                                <span className={styles.metaValue} style={{
                                    backgroundColor: getStatusDisplay(requirement.status).color,
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    color: '#fff',
                                    display: 'inline-block'
                                }}>
                                    {getStatusDisplay(requirement.status).icon} {getStatusDisplay(requirement.status).label}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {proposals.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📬</div>
                        <h3>No Proposals Yet</h3>
                        <p>
                            Your requirement is live and freelancers can submit proposals.
                            You'll see them here as they come in.
                        </p>
                        <Link to="/my-requirements">
                            <Button>Back to My Requirements</Button>
                        </Link>
                    </div>
                ) : (
                    <div className={styles.proposalsList}>
                        {proposals.map((proposal) => (
                            <ProposalCard
                                key={proposal.id}
                                proposal={proposal}
                                onAccept={handleAcceptProposal}
                                onPaymentSuccess={handlePaymentSuccess}
                                onPaymentFailure={handlePaymentFailure}
                                isAccepting={acceptingProposal === proposal.id}
                                requirementStatus={requirement.status}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function ProposalCard({ proposal, onAccept, onPaymentSuccess, onPaymentFailure, isAccepting, requirementStatus }) {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const isRequirementClosed = requirementStatus === 'CLOSED';
    const canAccept = canAcceptProposalHelper(proposal.status) && !isRequirementClosed;
    const statusInfo = getStatusDisplay(proposal.status);
    const disabledReason = !canAccept ?
        (isRequirementClosed ? 'Requirement is closed' : getActionDisabledReason('acceptProposal', proposal.status))
        : null;

    return (
        <div className={`${styles.proposalCard} ${proposal.status === 'ACCEPTED' ? styles.accepted : ''}`}>
            <div className={styles.proposalHeader}>
                <div className={styles.freelancerInfo}>
                    <div className={styles.freelancerAvatar}>
                        {proposal.freelancer?.name?.[0]?.toUpperCase() || 'F'}
                    </div>
                    <div className={styles.freelancerDetails}>
                        <h3 className={styles.freelancerName}>
                            {proposal.freelancer?.name || `Freelancer ID: ${proposal.freelancerId}`}
                        </h3>
                        <p className={styles.freelancerTitle}>
                            {proposal.freelancer?.title || 'Professional Freelancer'}
                        </p>
                    </div>
                </div>

                <div className={styles.proposalMeta}>
                    <div className={styles.statusBadge} style={{
                        backgroundColor: statusInfo.color,
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#fff'
                    }}>
                        {statusInfo.icon} {statusInfo.label}
                    </div>
                    <div className={styles.proposalPrice}>
                        ${proposal.proposedPrice || proposal.bidAmount}
                    </div>
                    <div className={styles.proposalDate}>
                        {formatDate(proposal.createdAt)}
                    </div>
                </div>
            </div>

            <div className={styles.proposalContent}>
                <div className={styles.coverLetter}>
                    <h4>Cover Letter</h4>
                    <p>{proposal.message || proposal.coverLetter}</p>
                </div>

                <div className={styles.proposalDetails}>
                    <div className={styles.detail}>
                        <span className={styles.detailLabel}>Delivery Time:</span>
                        <span className={styles.detailValue}>{proposal.deliveryTime || 'Not specified'} days</span>
                    </div>
                </div>
            </div>

            {proposal.status === 'ACCEPTED' && (
                <div className={styles.acceptedBanner}>
                    <span className={styles.acceptedIcon}>✅</span>
                    <span>This proposal has been accepted</span>
                </div>
            )}

            {proposal.status === 'COMPLETION_REQUESTED' && proposal.completionNotes && (
                <div className={styles.completionInfo}>
                    <h4>📋 Completion Requested</h4>
                    <p><strong>Notes:</strong> {proposal.completionNotes}</p>
                    {proposal.deliverableLinks && (
                        <p><strong>Deliverables:</strong> {proposal.deliverableLinks}</p>
                    )}
                </div>
            )}

            {proposal.status === 'REVISION_REQUESTED' && proposal.revisionFeedback && (
                <div className={styles.revisionInfo}>
                    <h4>🔄 Revision Requested</h4>
                    <p><strong>Feedback:</strong> {proposal.revisionFeedback}</p>
                    {proposal.requestedChanges && (
                        <p><strong>Changes:</strong> {proposal.requestedChanges}</p>
                    )}
                </div>
            )}

            <div className={styles.proposalActions}>
                {/* <Link
                    to={`/freelancer/${proposal.freelancer?.id}`}
                    className={styles.viewProfileLink}
                >
                    View Profile
                </Link> */}

                {canAccept && (
                    <div className={styles.paymentSection}>
                        <div className={styles.paymentInfo}>
                            <span className={styles.paymentLabel}>Accept & Pay:</span>
                            <span className={styles.paymentAmount}>{formatCurrency(proposal.proposedPrice)}</span>
                        </div>
                        <PayNowButton
                            referenceType="PROPOSAL"
                            referenceId={proposal.id}
                            amount={proposal.proposedPrice}
                            onSuccess={onPaymentSuccess}
                            onFailure={onPaymentFailure}
                            variant="primary"
                            size="small"
                            className={styles.payNowButton}
                        >
                            Accept & Pay {formatCurrency(proposal.proposedPrice)}
                        </PayNowButton>
                    </div>
                )}

                {disabledReason && (
                    <div className={styles.disabledInfo}>
                        <span className={styles.disabledReason}>{disabledReason}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RequirementProposalsPage;