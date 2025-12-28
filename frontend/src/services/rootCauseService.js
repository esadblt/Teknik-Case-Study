import api from './api';

/**
 * Root Cause Service
 * Handles all root cause analysis API operations
 */
export const rootCauseService = {
    /**
     * Get root cause tree for a problem
     * @param {number} problemId - Problem ID
     * @returns {Promise<Array>}
     */
    getTree: async (problemId) => {
        const response = await api.get(`/root_causes.php?problem_id=${problemId}`);
        return Array.isArray(response) ? response : [];
    },

    /**
     * Add new root cause
     * @param {Object} data - Root cause data
     * @returns {Promise<Object>}
     */
    add: (data) => api.post('/root_causes.php', data),

    /**
     * Update root cause
     * @param {number} id - Root cause ID
     * @param {Object} data - Updated data
     * @returns {Promise<Object>}
     */
    update: (id, data) => api.put('/root_causes.php', { id, ...data }),

    /**
     * Delete root cause
     * @param {number} id - Root cause ID
     * @returns {Promise<Object>}
     */
    delete: (id) => api.delete(`/root_causes.php?id=${id}`),
};

// Named exports for backward compatibility
export const getRootCauseTree = (problemId) => rootCauseService.getTree(problemId);
export const addRootCause = (data) => rootCauseService.add(data);
export const updateRootCause = (id, data) => rootCauseService.update(id, data);
export const deleteRootCause = (id) => rootCauseService.delete(id);

export default rootCauseService;
