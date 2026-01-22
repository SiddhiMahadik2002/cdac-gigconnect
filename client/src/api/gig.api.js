import apiClient from './axios.js';
import { API_ENDPOINTS } from '../utils/constants.js';

// Get all gigs with optional filters
export const getGigs = async (params = {}) => {
    // Convert page to 0-based for Spring Boot
    const apiParams = { ...params };
    if (apiParams.page !== undefined) {
        apiParams.page = Math.max(0, apiParams.page - 1);
    }

    const response = await apiClient.get(API_ENDPOINTS.GIGS, { params: apiParams });

    // Transform Spring Boot Page response to our expected format
    const data = response.data;
    return {
        content: data.content || [],
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0,
        currentPage: (data.number || 0) + 1, // Convert back to 1-based
        pageSize: data.size || 10,
        hasNext: !data.last,
        hasPrevious: !data.first
    };
};

// Get single gig by ID
export const getGigById = async (id) => {
    const response = await apiClient.get(`${API_ENDPOINTS.GIGS}/${id}`);
    return response.data;
};

// Create new gig (freelancer only)
export const createGig = async (gigData) => {
    const response = await apiClient.post(API_ENDPOINTS.GIGS, gigData);
    return response.data;
};

// Update existing gig (freelancer only)
export const updateGig = async (id, gigData) => {
    const response = await apiClient.put(`${API_ENDPOINTS.GIGS}/${id}`, gigData);
    return response.data;
};

// Delete gig (freelancer only)
export const deleteGig = async (id) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.GIGS}/${id}`);
    return response.data;
};

// Get gigs by freelancer
export const getGigsByFreelancer = async (freelancerId, params = {}) => {
    // Convert page to 0-based for Spring Boot
    const apiParams = { ...params };
    if (apiParams.page !== undefined) {
        apiParams.page = Math.max(0, apiParams.page - 1);
    }

    const response = await apiClient.get(`${API_ENDPOINTS.GIGS}/freelancer/${freelancerId}`, { params: apiParams });

    // Transform Spring Boot Page response to our expected format
    const data = response.data;
    return {
        content: data.content || [],
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0,
        currentPage: (data.number || 0) + 1, // Convert back to 1-based
        pageSize: data.size || 10,
        hasNext: !data.last,
        hasPrevious: !data.first
    };
};