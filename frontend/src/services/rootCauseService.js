import api from './api';

// GET - Root cause tree
export const getRootCauseTree = async (problemId) => {
    try {
        const response = await api.get(`/root_causes.php?problem_id=${problemId}`);
        // API directly returns array, no .data wrapper
        return Array.isArray(response) ? response : (response.data || []);
    } catch (error) {
        console.error('Error fetching root cause tree:', error);
        throw error;
    }
};

// POST - Add new root cause
export const addRootCause = async (data) => {
    try {
        const response = await api.post('/root_causes.php', data);
        // API returns { success, id, message }
        return response;
    } catch (error) {
        console.error('Error adding root cause:', error);
        throw error;
    }
};

// PUT - Update root cause
export const updateRootCause = async (id, data) => {
    try {
        console.log('updateRootCause service called:', { id, data }); // Debug
        
        // ✅ ID'yi data içine ekle
        const payload = {
            id: id,
            ...data
        };
        
        console.log('Sending payload:', payload); // Debug
        
        const response = await api.put('/root_causes.php', payload);
        
        console.log('Update response:', response); // Debug
        
        return response;
    } catch (error) {
        console.error('Error updating root cause:', error);
        throw error;
    }
};

// DELETE - Delete root cause
export const deleteRootCause = async (id) => {
    try {
        const response = await api.delete(`/root_causes.php?id=${id}`);
        return response;
    } catch (error) {
        console.error('Error deleting root cause:', error);
        throw error;
    }
};
