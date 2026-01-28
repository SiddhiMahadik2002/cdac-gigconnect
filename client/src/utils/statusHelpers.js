import { STATUS_CONFIG, STATUS_PERMISSIONS, PROPOSAL_STATUS, REQUIREMENT_STATUS } from './constants.js';

/**
 * Get display configuration for a status
 * @param {string} status - Status value from backend (e.g., 'IN_PROGRESS')
 * @returns {object} Display configuration with label, icon, color, description
 */
export const getStatusDisplay = (status) => {
    return STATUS_CONFIG[status] || {
        label: status?.replace(/_/g, ' ') || 'Unknown',
        icon: '📌',
        color: 'gray',
        description: 'Status unknown',
    };
};

/**
 * Check if freelancer can request completion for a proposal
 * @param {string} status - Proposal status
 * @returns {boolean}
 */
export const canRequestCompletion = (status) => {
    return STATUS_PERMISSIONS.canRequestCompletion.includes(status);
};

/**
 * Check if client can accept a proposal
 * @param {string} status - Proposal status
 * @returns {boolean}
 */
export const canAcceptProposal = (status) => {
    return STATUS_PERMISSIONS.canAcceptProposal.includes(status);
};

/**
 * Check if client can review completion (approve/reject)
 * @param {string} status - Proposal status
 * @returns {boolean}
 */
export const canReviewCompletion = (status) => {
    return STATUS_PERMISSIONS.canReviewCompletion.includes(status);
};

/**
 * Check if a proposal is considered "active" (ongoing work)
 * @param {string} status - Proposal status
 * @returns {boolean}
 */
export const isActiveProposal = (status) => {
    return STATUS_PERMISSIONS.activeProposals.includes(status);
};

/**
 * Check if a requirement is accepting new proposals
 * @param {string} status - Requirement status
 * @returns {boolean}
 */
export const isAcceptingProposals = (status) => {
    return STATUS_PERMISSIONS.acceptingProposals.includes(status);
};

/**
 * Get CSS class name for status styling
 * @param {string} status - Status value
 * @returns {string} CSS class name
 */
export const getStatusClassName = (status) => {
    return status?.toLowerCase().replace(/_/g, '_') || 'default';
};

/**
 * Get user-friendly action text based on proposal status
 * @param {string} status - Proposal status
 * @returns {string} Action text for buttons/messages
 */
export const getProposalActionText = (status) => {
    switch (status) {
        case PROPOSAL_STATUS.PENDING:
            return 'Awaiting client response';
        case PROPOSAL_STATUS.ACCEPTED:
        case PROPOSAL_STATUS.IN_PROGRESS:
            return 'Request Completion';
        case PROPOSAL_STATUS.COMPLETION_REQUESTED:
            return 'Awaiting client approval';
        case PROPOSAL_STATUS.REVISION_REQUESTED:
            return 'Resubmit completion';
        case PROPOSAL_STATUS.COMPLETED:
            return 'Completed';
        case PROPOSAL_STATUS.REJECTED:
            return 'Rejected';
        default:
            return 'Unknown status';
    }
};

/**
 * Get message to display for why an action is disabled
 * @param {string} action - Action type ('accept', 'requestCompletion', etc.)
 * @param {string} currentStatus - Current status
 * @returns {string} Explanation message
 */
export const getActionDisabledReason = (action, currentStatus) => {
    const statusDisplay = getStatusDisplay(currentStatus);

    switch (action) {
        case 'acceptProposal':
            if (currentStatus === PROPOSAL_STATUS.ACCEPTED || currentStatus === PROPOSAL_STATUS.IN_PROGRESS) {
                return 'This proposal has already been accepted and work is in progress.';
            }
            if (currentStatus === PROPOSAL_STATUS.REJECTED) {
                return 'This proposal has been rejected.';
            }
            if (currentStatus === PROPOSAL_STATUS.COMPLETED) {
                return 'This project has already been completed.';
            }
            return `Cannot accept proposal with status: ${statusDisplay.label}`;

        case 'requestCompletion':
            if (currentStatus === PROPOSAL_STATUS.PENDING) {
                return 'Wait for client to accept your proposal first.';
            }
            if (currentStatus === PROPOSAL_STATUS.COMPLETION_REQUESTED) {
                return 'Completion already requested. Waiting for client approval.';
            }
            if (currentStatus === PROPOSAL_STATUS.COMPLETED) {
                return 'This project has already been completed.';
            }
            return `Cannot request completion with status: ${statusDisplay.label}`;

        case 'submitProposal':
            if (currentStatus === REQUIREMENT_STATUS.CLOSED) {
                return 'This requirement is no longer accepting proposals.';
            }
            if (currentStatus === REQUIREMENT_STATUS.IN_PROGRESS) {
                return 'This project is already in progress with another freelancer.';
            }
            if (currentStatus === REQUIREMENT_STATUS.COMPLETED) {
                return 'This project has been completed.';
            }
            return `Cannot submit proposal for requirement with status: ${statusDisplay.label}`;

        default:
            return 'This action is not available.';
    }
};

/**
 * Check if a status transition is valid
 * @param {string} fromStatus - Current status
 * @param {string} toStatus - Desired status
 * @returns {boolean}
 */
export const isValidStatusTransition = (fromStatus, toStatus) => {
    const validTransitions = {
        [PROPOSAL_STATUS.PENDING]: [PROPOSAL_STATUS.ACCEPTED, PROPOSAL_STATUS.REJECTED],
        [PROPOSAL_STATUS.ACCEPTED]: [PROPOSAL_STATUS.IN_PROGRESS, PROPOSAL_STATUS.COMPLETION_REQUESTED],
        [PROPOSAL_STATUS.IN_PROGRESS]: [PROPOSAL_STATUS.COMPLETION_REQUESTED],
        [PROPOSAL_STATUS.COMPLETION_REQUESTED]: [PROPOSAL_STATUS.COMPLETED, PROPOSAL_STATUS.REVISION_REQUESTED],
        [PROPOSAL_STATUS.REVISION_REQUESTED]: [PROPOSAL_STATUS.COMPLETION_REQUESTED],
        [PROPOSAL_STATUS.COMPLETED]: [], // Terminal state
        [PROPOSAL_STATUS.REJECTED]: [], // Terminal state
    };

    return validTransitions[fromStatus]?.includes(toStatus) || false;
};
