import api from './api';

/**
 * Problem Service
 * Handles all problem-related API operations
 */
export const problemService = {
    /**
     * Get all problems
     * @returns {Promise<Array>}
     */
    getAll: () => api.get('/problems.php'),

    /**
     * Get single problem by ID
     * @param {number} id - Problem ID
     * @returns {Promise<Object>}
     */
    getById: (id) => api.get(`/problems.php?id=${id}`),

    /**
     * Create new problem
     * @param {Object} data - Problem data
     * @returns {Promise<Object>}
     */
    create: (data) => api.post('/problems.php', data),

    /**
     * Update existing problem
     * @param {number} id - Problem ID
     * @param {Object} data - Updated problem data
     * @returns {Promise<Object>}
     */
    update: (id, data) => api.put(`/problems.php?id=${id}`, data),

    /**
     * Delete problem
     * @param {number} id - Problem ID
     * @returns {Promise<Object>}
     */
    delete: (id) => api.delete(`/problems.php?id=${id}`),
};

// Named exports for backward compatibility
export const getProblems = () => problemService.getAll();
export const getProblem = (id) => problemService.getById(id);
export const createProblem = (data) => problemService.create(data);
export const updateProblem = (id, data) => problemService.update(id, data);
export const deleteProblem = (id) => problemService.delete(id);

export default problemService;
