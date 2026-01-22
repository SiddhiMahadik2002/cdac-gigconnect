import apiClient from './axios.js';
import { API_ENDPOINTS } from '../utils/constants.js';

// Register user
export const registerUser = async (userData) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    return response.data;
};

// Login user
export const loginUser = async (credentials) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
};

// Get current user info
export const getCurrentUser = async () => {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
    return response.data;
};

// Logout user (client-side only since JWT is stateless)
export const logoutUser = () => {
    // Token removal is handled by the auth context
    return Promise.resolve();
};