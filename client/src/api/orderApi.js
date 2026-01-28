import apiClient from './axios.js';
import { API_ENDPOINTS, ORDER_STATUS, ORDER_TYPE, ORDER_SOURCE } from '../utils/constants.js';

/**
 * Get client's gig orders
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 0)
 * @param {number} options.size - Page size (default: 10)
 * @param {string} options.status - Order status filter
 * @returns {Promise<Object>} The orders response
 */
export const getClientOrders = async (options = {}) => {
    try {
        const { page = 0, size = 10, status } = options;
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
        });

        if (status) {
            params.append('status', status);
        }

        const response = await apiClient.get(`${API_ENDPOINTS.GIG_ORDERS.BY_CLIENT}?${params}`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch client orders:', error);
        throw error;
    }
};

/**
 * Get freelancer's gig orders
 * @param {string} freelancerId - The freelancer ID (optional for /my-work endpoint)
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 0)
 * @param {number} options.size - Page size (default: 10)
 * @returns {Promise<Object>} The orders response
 */
export const getFreelancerOrders = async (freelancerId = null, options = {}) => {
    try {
        const { page = 0, size = 10 } = options;
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
        });

        // Use /my-work endpoint when freelancerId is not provided
        const endpoint = freelancerId
            ? `${API_ENDPOINTS.GIG_ORDERS.BY_FREELANCER}/${freelancerId}`
            : API_ENDPOINTS.GIG_ORDERS.BY_FREELANCER;

        const response = await apiClient.get(`${endpoint}?${params}`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch freelancer orders:', error);
        throw error;
    }
};

/**
 * Get order details by ID
 * @param {string} orderId - The order ID
 * @returns {Promise<Object>} The order details
 */
export const getOrderById = async (orderId) => {
    try {
        const response = await apiClient.get(`${API_ENDPOINTS.GIG_ORDERS.BASE}/${orderId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch order details:', error);
        throw error;
    }
};

/**
 * Get order details by Razorpay payment ID
 * @param {string} paymentId - The Razorpay order ID (e.g., order_S8SqoUHOcW3P4F)
 * @returns {Promise<Object>} The order details
 */
export const getOrderByPaymentId = async (paymentId) => {
    try {
        const response = await apiClient.get(`${API_ENDPOINTS.GIG_ORDERS.BY_PAYMENT_ID}/${paymentId}`);
        return response.data;
    } catch (error) {
        // Enhanced error handling based on backend team recommendations
        if (error.response) {
            const { status } = error.response;

            if (status === 404) {
                throw new Error('Order not found for this payment');
            } else if (status === 403) {
                throw new Error('Access denied to view this order');
            } else if (status >= 500) {
                throw new Error('Server error occurred while retrieving order details');
            } else {
                throw new Error('Failed to retrieve order details');
            }
        } else if (error.request) {
            throw new Error('Network error: Unable to connect to server');
        } else {
            console.error('Error getting order by payment ID:', error);
            throw new Error('An unexpected error occurred');
        }
    }
};

/**
 * Update order status (freelancer only)
 * @param {string} orderId - The order ID
 * @param {Object} statusData - Status update data
 * @param {string} statusData.status - New status
 * @param {string} statusData.statusNote - Optional status note
 * @returns {Promise<Object>} The updated order
 */
export const updateOrderStatus = async (orderId, statusData) => {
    try {
        const endpoint = API_ENDPOINTS.GIG_ORDERS.UPDATE_STATUS.replace('{id}', orderId);
        const response = await apiClient.put(endpoint, statusData);
        return response.data;
    } catch (error) {
        console.error('Failed to update order status:', error);
        throw error;
    }
};

/**
 * Complete order (freelancer submits work)
 * @param {string} orderId - The order ID
 * @param {Object} completionData - Completion data
 * @param {string} completionData.completionNote - Completion note
 * @param {string} completionData.deliverableLinks - Optional deliverable links
 * @returns {Promise<Object>} The updated order
 */
export const completeOrder = async (orderId, completionData) => {
    try {
        const endpoint = API_ENDPOINTS.GIG_ORDERS.COMPLETE.replace('{id}', orderId);
        const response = await apiClient.post(endpoint, completionData);
        return response.data;
    } catch (error) {
        console.error('Failed to complete order:', error);
        throw error;
    }
};

/**
 * Request revision (client requests changes)
 * @param {string} orderId - The order ID
 * @param {Object} revisionData - Revision request data
 * @param {string} revisionData.revisionNote - Revision note/feedback
 * @param {string} revisionData.requestedChanges - Specific changes requested
 * @returns {Promise<Object>} The updated order
 */
export const requestRevision = async (orderId, revisionData) => {
    try {
        const response = await apiClient.post(`${API_ENDPOINTS.GIG_ORDERS.BASE}/${orderId}/request-revision`, revisionData);
        return response.data;
    } catch (error) {
        console.error('Failed to request revision:', error);
        throw error;
    }
};

/**
 * Accept order completion (client accepts the work)
 * @param {string} orderId - The order ID
 * @param {Object} acceptanceData - Acceptance data
 * @param {string} acceptanceData.rating - Rating (1-5)
 * @param {string} acceptanceData.review - Optional review
 * @returns {Promise<Object>} The updated order
 */
export const acceptOrderCompletion = async (orderId, acceptanceData) => {
    try {
        const response = await apiClient.post(`${API_ENDPOINTS.GIG_ORDERS.BASE}/${orderId}/accept`, acceptanceData);
        return response.data;
    } catch (error) {
        console.error('Failed to accept order completion:', error);
        throw error;
    }
};

/**
 * Cancel order
 * @param {string} orderId - The order ID
 * @param {Object} cancellationData - Cancellation data
 * @param {string} cancellationData.reason - Cancellation reason
 * @returns {Promise<Object>} The cancelled order
 */
export const cancelOrder = async (orderId, cancellationData) => {
    try {
        const response = await apiClient.post(`${API_ENDPOINTS.GIG_ORDERS.BASE}/${orderId}/cancel`, cancellationData);
        return response.data;
    } catch (error) {
        console.error('Failed to cancel order:', error);
        throw error;
    }
};

/**
 * Get order status display information
 * @param {string} status - Order status
 * @returns {Object} Status display info
 */
export const getOrderStatusInfo = (status) => {
    const statusMap = {
        [ORDER_STATUS.CONFIRMED]: {
            label: 'Confirmed',
            color: 'blue',
            icon: '✓',
            description: 'Order placed and payment verified'
        },
        [ORDER_STATUS.IN_PROGRESS]: {
            label: 'In Progress',
            color: 'orange',
            icon: '🔄',
            description: 'Freelancer is working on your project'
        },
        [ORDER_STATUS.DELIVERED]: {
            label: 'Delivered',
            color: 'purple',
            icon: '📦',
            description: 'Work has been submitted for review'
        },
        [ORDER_STATUS.REVISION_REQUESTED]: {
            label: 'Revision Requested',
            color: 'yellow',
            icon: '🔄',
            description: 'Changes have been requested'
        },
        [ORDER_STATUS.COMPLETED]: {
            label: 'Completed',
            color: 'green',
            icon: '✅',
            description: 'Project completed successfully'
        },
        [ORDER_STATUS.CANCELLED]: {
            label: 'Cancelled',
            color: 'red',
            icon: '❌',
            description: 'Order has been cancelled'
        }
    };

    return statusMap[status] || {
        label: 'Unknown',
        color: 'gray',
        icon: '?',
        description: 'Unknown status'
    };
};

/**
 * NEW WORKFLOW APIS - Based on migration document
 */

/**
 * Purchase gig - creates order from gig
 * @param {string} gigId - The gig ID
 * @param {Object} purchaseData - Purchase data
 * @param {string} purchaseData.paymentId - Razorpay payment ID
 * @param {string} purchaseData.clientNotes - Optional client notes
 * @returns {Promise<Object>} The created order
 */
export const purchaseGig = async (gigId, purchaseData) => {
    try {
        const endpoint = API_ENDPOINTS.GIG_ORDERS.PURCHASE_GIG.replace('{gigId}', gigId);
        const response = await apiClient.post(endpoint, purchaseData);
        return response.data;
    } catch (error) {
        console.error('Failed to purchase gig:', error);
        throw error;
    }
};

/**
 * Accept proposal - creates order from proposal
 * @param {string} proposalId - The proposal ID
 * @param {Object} acceptanceData - Acceptance data
 * @param {string} acceptanceData.paymentId - Razorpay payment ID
 * @param {string} acceptanceData.clientNotes - Optional client notes
 * @returns {Promise<Object>} The created order
 */
export const acceptProposal = async (proposalId, acceptanceData) => {
    try {
        const endpoint = API_ENDPOINTS.GIG_ORDERS.ACCEPT_PROPOSAL.replace('{proposalId}', proposalId);
        const response = await apiClient.post(endpoint, acceptanceData);
        return response.data;
    } catch (error) {
        console.error('Failed to accept proposal:', error);
        throw error;
    }
};

/**
 * Start work on order
 * @param {string} orderId - The order ID
 * @returns {Promise<Object>} The updated order
 */
export const startWork = async (orderId) => {
    try {
        const endpoint = API_ENDPOINTS.GIG_ORDERS.START_WORK.replace('{id}', orderId);
        const response = await apiClient.put(endpoint);
        return response.data;
    } catch (error) {
        console.error('Failed to start work:', error);
        throw error;
    }
};

/**
 * Deliver work
 * @param {string} orderId - The order ID
 * @param {string} deliveryNotes - Delivery notes
 * @returns {Promise<Object>} The updated order
 */
export const deliverWork = async (orderId, deliveryNotes) => {
    try {
        const endpoint = API_ENDPOINTS.GIG_ORDERS.DELIVER.replace('{id}', orderId);
        const response = await apiClient.put(endpoint, deliveryNotes, {
            headers: { 'Content-Type': 'text/plain' }
        });
        return response.data;
    } catch (error) {
        console.error('Failed to deliver work:', error);
        throw error;
    }
};

/**
 * Approve work
 * @param {string} orderId - The order ID
 * @param {string} clientNotes - Client approval notes
 * @returns {Promise<Object>} The updated order
 */
export const approveWork = async (orderId, clientNotes) => {
    try {
        const endpoint = API_ENDPOINTS.GIG_ORDERS.APPROVE.replace('{id}', orderId);
        const response = await apiClient.put(endpoint, clientNotes, {
            headers: { 'Content-Type': 'text/plain' }
        });
        return response.data;
    } catch (error) {
        console.error('Failed to approve work:', error);
        throw error;
    }
};

/**
 * Request revision
 * @param {string} orderId - The order ID
 * @param {string} revisionNotes - Revision request notes
 * @returns {Promise<Object>} The updated order
 */
export const requestWorkRevision = async (orderId, revisionNotes) => {
    try {
        const endpoint = API_ENDPOINTS.GIG_ORDERS.REQUEST_REVISION.replace('{id}', orderId);
        const response = await apiClient.put(endpoint, revisionNotes, {
            headers: { 'Content-Type': 'text/plain' }
        });
        return response.data;
    } catch (error) {
        console.error('Failed to request revision:', error);
        throw error;
    }
};

/**
 * Get order type display information
 * @param {string} orderType - Order type
 * @param {string} orderSource - Order source
 * @returns {Object} Order type display info
 */
export const getOrderTypeInfo = (orderType, orderSource) => {
    if (orderType === ORDER_TYPE.GIG_PURCHASE) {
        return {
            label: 'Gig Purchase',
            icon: '🛍️',
            description: 'Direct gig purchase'
        };
    } else if (orderType === ORDER_TYPE.CUSTOM_PROJECT) {
        return {
            label: 'Custom Project',
            icon: '🎯',
            description: 'Project from proposal acceptance'
        };
    }
    return {
        label: 'Unknown',
        icon: '❓',
        description: 'Unknown order type'
    };
};