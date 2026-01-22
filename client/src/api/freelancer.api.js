import apiClient from './axios.js';

// Get freelancer profile
export const getFreelancerProfile = async (id) => {
    const response = await apiClient.get(`/freelancer/${id}`);
    return response.data;
};

// Update freelancer profile
export const updateFreelancerProfile = async (profileData) => {
    const response = await apiClient.put('/freelancer/profile', profileData);
    return response.data;
};

// Get freelancer dashboard stats
export const getFreelancerStats = async () => {
    const response = await apiClient.get('/freelancer/stats');
    return response.data;
};