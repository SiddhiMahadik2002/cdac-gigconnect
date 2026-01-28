import apiClient from './axios.js';
import { API_ENDPOINTS } from '../utils/constants.js';
import { acceptProposal as acceptProposalOrder, getFreelancerOrders, deliverWork, approveWork, requestWorkRevision } from './orderApi.js';

// Submit a proposal to a requirement (FREELANCER only)
export const submitProposal = async (requirementId, proposalData) => {
    const response = await apiClient.post(`${API_ENDPOINTS.PROPOSALS}/requirements/${requirementId}/submit`, proposalData);
    return response.data;
};

// Get freelancer's own work (FREELANCER only) - NOW SHOWS ALL WORK (gig purchases + accepted proposals)
export const getMyProposals = async (params = {}) => {
    // MIGRATION: Changed from /proposals/me to /orders/my-work to show all work
    console.warn('DEPRECATED: getMyProposals now uses /orders/my-work. Consider using getFreelancerOrders directly.');
    const response = await getFreelancerOrders(null, params);

    // Extract content from paginated response to maintain backward compatibility
    return response.content || response;
};

// Accept a proposal (CLIENT only) - NOW CREATES ORDER
export const acceptProposal = async (proposalId, acceptanceData) => {
    // Use the new order API endpoint
    return await acceptProposalOrder(proposalId, acceptanceData);
};

// Get single proposal by ID
export const getProposalById = async (proposalId) => {
    const response = await apiClient.get(`${API_ENDPOINTS.PROPOSALS}/${proposalId}`);
    return response.data;
};

// DEPRECATED - Use order APIs for completion workflow
// These functions now reference order endpoints for backward compatibility

// Request project completion (FREELANCER only) - NOW REDIRECTS TO ORDER API
export const requestCompletion = async (proposalIdOrOrderId, data) => {
    // MIGRATION: This function now redirects to the unified order API
    console.warn('DEPRECATED: requestCompletion() now redirects to deliverWork(). Use deliverWork(orderId, deliveryNotes) directly.');

    // Combine completion notes and deliverable links into delivery notes
    const deliveryNotes = `${data.completionNotes || ''}${data.deliverableLinks ? '\n\nDeliverable Links: ' + data.deliverableLinks : ''}`;

    // Use the new unified delivery endpoint
    return await deliverWork(proposalIdOrOrderId, deliveryNotes);
};

// Approve project completion (CLIENT only) - USE ORDER API
export const approveCompletion = async (proposalOrOrderId, data) => {
    // MIGRATION: Redirect to unified order API. Accepts orderId where possible.
    console.warn('DEPRECATED: approveCompletion() now redirects to approveWork(). Use approveWork(orderId, clientNotes) directly.');

    const clientNotes = `${data.feedback || ''}${data.rating ? '\n\nRating: ' + data.rating : ''}`;
    return await approveWork(proposalOrOrderId, clientNotes);
};

// Reject project completion (CLIENT only) - USE ORDER API
export const rejectCompletion = async (proposalOrOrderId, data) => {
    // MIGRATION: Redirect to unified order API. Accepts orderId where possible.
    console.warn('DEPRECATED: rejectCompletion() now redirects to requestWorkRevision(). Use requestWorkRevision(orderId, revisionNotes) directly.');

    const revisionNotes = `${data.feedback || ''}${data.requestedChanges ? '\n\nRequested Changes: ' + data.requestedChanges : ''}`;
    return await requestWorkRevision(proposalOrOrderId, revisionNotes);
};