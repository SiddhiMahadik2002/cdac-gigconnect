import apiClient from './axios.js';

// Get current user profile
export const getUserProfile = async () => {
    const response = await apiClient.get('/user/profile');
    return response.data;
};

// Update user profile
export const updateUserProfile = async (userData) => {
    const response = await apiClient.put('/user/profile', userData);
    return response.data;
};