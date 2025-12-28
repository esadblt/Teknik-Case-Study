export const API_URL = 'http://localhost/8d-projects/backend/api';

// API Helper Object
const api = {
    get: async (url) => {
        try {
            const response = await fetch(API_URL + url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'API request failed');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API GET Error:', error);
            throw error;
        }
    },
    
    post: async (url, data) => {
        try {
            const response = await fetch(API_URL + url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                const responseData = await response.json();
                throw new Error(responseData.error || 'API request failed');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API POST Error:', error);
            throw error;
        }
    },
    
    put: async (url, data) => {
        try {
            const response = await fetch(API_URL + url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                const responseData = await response.json();
                throw new Error(responseData.error || 'API request failed');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API PUT Error:', error);
            throw error;
        }
    },
    
    delete: async (url) => {
        try {
            const response = await fetch(API_URL + url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'API request failed');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API DELETE Error:', error);
            throw error;
        }
    }
};

export default api;

// Ortak Fetch Fonksiyonu (backward compatibility)
export const apiRequest = async (url, options = {}) => {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};