import apiClient from './axios.js';
import { API_ENDPOINTS } from '../utils/constants.js';

// Create a new requirement (CLIENT only)
export const createRequirement = async (requirementData) => {
    const response = await apiClient.post(API_ENDPOINTS.REQUIREMENTS, requirementData);
    return response.data;
};

// Get all requirements (FREELANCER view)
export const getAllRequirements = async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.REQUIREMENTS, { params });
    return response.data;
};

// Get client's own requirements (CLIENT only)
export const getMyRequirements = async (params = {}) => {
    const response = await apiClient.get(`${API_ENDPOINTS.REQUIREMENTS}/me`, { params });
    return response.data;
};

// Get single requirement by ID
export const getRequirementById = async (requirementId) => {
    const response = await apiClient.get(`${API_ENDPOINTS.REQUIREMENTS}/${requirementId}`);
    return response.data;
};

// Get proposals for a specific requirement (CLIENT only)
export const getRequirementProposals = async (requirementId, params = {}) => {
    const response = await apiClient.get(`${API_ENDPOINTS.REQUIREMENTS}/${requirementId}/proposals`, { params });
    return response.data;
};

// Update requirement status
export const updateRequirementStatus = async (requirementId, status) => {
    const response = await apiClient.patch(`${API_ENDPOINTS.REQUIREMENTS}/${requirementId}/status`, { status });
    return response.data;
};