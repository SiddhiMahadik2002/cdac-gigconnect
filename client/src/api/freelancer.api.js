import apiClient from './axios.js';

// Get freelancer profile
// Backend route uses plural '/freelancers/:id' and returns fields like { freelancerId, firstName, lastName, email, averageRating, recentReviews }
export const getFreelancerProfile = async (id) => {
    const response = await apiClient.get(`/freelancers/${id}`);
    const data = response.data;

    // Normalize response to frontend-friendly shape
    return {
        id: data.freelancerId ?? data.id,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        email: data.email || null,
        title: data.title || null,
        description: data.description || null,
        linkedin: data.linkedin || data.linkedinUrl || '',
        github: data.github || data.githubUrl || '',
        portfolio: data.portfolio || data.portfolioUrl || '',
        skills: data.skills || [],
        averageRating: typeof data.averageRating === 'number' ? data.averageRating : null,
        ratingCount: data.ratingCount ?? 0,
        recentReviews: Array.isArray(data.recentReviews) ? data.recentReviews : [],
        totalEarnings: typeof data.totalEarnings === 'number' ? data.totalEarnings : (data.totalEarnings ? Number(data.totalEarnings) : 0),
    };
};

// Update freelancer profile
export const updateFreelancerProfile = async (profileData) => {
    // Backend expects the authenticated freelancer to update their own profile
    // at the `/freelancers/me` endpoint.
    const response = await apiClient.put('/freelancers/me', profileData);
    return response.data;
};

// Get freelancer dashboard stats
export const getFreelancerStats = async () => {
    const response = await apiClient.get('/freelancer/stats');
    return response.data;
};