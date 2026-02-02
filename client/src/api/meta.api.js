import apiClient from './axios.js';

export const getMeta = async () => {
    return apiClient.get('/meta');
};

export default { getMeta };
