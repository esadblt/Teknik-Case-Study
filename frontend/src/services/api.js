/**
 * API Service
 * Centralized API communication layer
 * Clean Architecture - Single Responsibility
 */

// Production URL for Railway, fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL ||
    (window.location.hostname === 'localhost'
        ? 'http://localhost/8d-projects/backend/api'
        : 'https://teknik-case-study-production-0076.up.railway.app/api');

/**
 * Custom API Error class for better error handling
 */
class ApiError extends Error {
    constructor(message, status) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

/**
 * API Service class - singleton pattern
 */
class ApiService {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    /**
     * Core request method
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise<any>} Response data
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new ApiError(data.error || 'API request failed', response.status);
            }

            return data;
        } catch (error) {
            if (error instanceof ApiError) {
                console.error(`API Error [${error.status}]:`, error.message);
                throw error;
            }
            console.error('Network Error:', error.message);
            throw new ApiError(error.message, 0);
        }
    }

    /**
     * GET request
     * @param {string} endpoint - API endpoint
     * @returns {Promise<any>}
     */
    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    /**
     * POST request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body
     * @returns {Promise<any>}
     */
    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * PUT request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body
     * @returns {Promise<any>}
     */
    put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    /**
     * DELETE request
     * @param {string} endpoint - API endpoint
     * @returns {Promise<any>}
     */
    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

// Singleton instance
const api = new ApiService(API_URL);

export { api, ApiError, API_URL };
export default api;