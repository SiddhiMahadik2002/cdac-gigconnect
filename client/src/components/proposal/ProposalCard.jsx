import React from 'react';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/nameMapper';
import {
    getStatusDisplay,
    canAcceptProposal,
    getActionDisabledReason,
    getStatusClassName
} from '../../utils/statusHelpers';
import { PROPOSAL_STATUS } from '../../utils/constants';
import styles from './ProposalCard.module.css';

/**
 * Reusable Proposal Card with status-aware action buttons
 * Properly disables actions based on proposal status
 */
const ProposalCard = ({
    proposal,
    onAccept,
    onReject,
    showActions = true,
    isClient = false,
    className = ''
}) => {
    const statusInfo = getStatusDisplay(proposal.status);
    const canAccept = canAcceptProposal(proposal.status);
    const isAccepting = proposal.status === PROPOSAL_STATUS.PENDING;

    const handleAccept = () => {
        if (canAccept && onAccept) {
            onAccept(proposal.id);
        }
    };

    const handleReject = () => {
        if (isAccepting && onReject) {
            onReject(proposal.id);
        }
    };

    const getDisabledMessage = () => {
        if (!canAccept) {
            return getActionDisabledReason('acceptProposal', proposal.status);
        }
        return null;
    };

    return (
        <div className={`${styles.proposalCard} ${className}`}>
            {/* Status Badge */}
            <div className={styles.cardHeader}>
                <span className={`${styles.statusBadge} ${styles[getStatusClassName(proposal.status)]}`}>
                    {statusInfo.icon} {statusInfo.label}
                </span>
                <span className={styles.proposedPrice}>{formatCurrency(proposal.proposedPrice)}</span>
            </div>

            {/* Freelancer Info */}
            <div className={styles.freelancerInfo}>
                <div className={styles.freelancerAvatar}>
                    {proposal.freelancerName?.charAt(0) || 'F'}
                </div>
                <div>
                    <h4 className={styles.freelancerName}>{proposal.freelancerName || 'Freelancer'}</h4>
                    <span className={styles.submittedDate}>
                        Submitted on {new Date(proposal.createdAt).toLocaleDateString()}
                    </span>
                </div>
            </div>

            {/* Proposal Message */}
            <div className={styles.proposalMessage}>
                <p>{proposal.message}</p>
            </div>

            {/* Status-specific Information */}
            {proposal.status === PROPOSAL_STATUS.COMPLETION_REQUESTED && proposal.completionNotes && (
                <div className={styles.completionInfo}>
                    <div className={styles.infoHeader}>
                        <span className={styles.infoIcon}>✓</span>
                        <strong>Completion Submitted</strong>
                    </div>
                    <p className={styles.infoText}>{proposal.completionNotes}</p>
                    {proposal.deliverableLinks && (
                        <a href={proposal.deliverableLinks} target="_blank" rel="noopener noreferrer" className={styles.deliverableLink}>
                            View Deliverables →
                        </a>
                    )}
                </div>
            )}

            {proposal.status === PROPOSAL_STATUS.REVISION_REQUESTED && proposal.rejectionReason && (
                <div className={styles.revisionInfo}>
                    <div className={styles.infoHeader}>
                        <span className={styles.infoIcon}>🔄</span>
                        <strong>Revision Requested</strong>
                    </div>
                    <p className={styles.infoText}>{proposal.rejectionReason}</p>
                </div>
            )}

            {proposal.status === PROPOSAL_STATUS.REJECTED && proposal.rejectionReason && (
                <div className={styles.rejectedInfo}>
                    <div className={styles.infoHeader}>
                        <span className={styles.infoIcon}>❌</span>
                        <strong>Not Selected</strong>
                    </div>
                    <p className={styles.infoText}>{proposal.rejectionReason}</p>
                </div>
            )}

            {/* Action Buttons (for Clients) */}
            {showActions && isClient && (
                <div className={styles.actions}>
                    {/* Show Accept button only for PENDING proposals */}
                    {canAccept ? (
                        <>
                            <Button
                                variant="success"
                                onClick={handleAccept}
                                size="small"
                            >
                                ✓ Accept Proposal
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleReject}
                                size="small"
                            >
                                Decline
                            </Button>
                        </>
                    ) : (
                        <div className={styles.disabledInfo}>
                            <Button variant="outline" size="small" disabled>
                                {statusInfo.icon} {statusInfo.label}
                            </Button>
                            <span className={styles.disabledReason}>
                                {getDisabledMessage()}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Freelancer View - No Actions, just status display */}
            {!isClient && (
                <div className={styles.statusDescription}>
                    <span className={styles.statusDescriptionText}>
                        {statusInfo.description}
                    </span>
                </div>
            )}
        </div>
    );
};

export default ProposalCard;
