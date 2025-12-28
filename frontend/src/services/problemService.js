import { API_URL, apiRequest } from './api';

// Tüm problemleri getir
export const getProblems = async () => {
    return apiRequest(`${API_URL}/problems.php`);
};

// Tek problem getir
export const getProblem = async (id) => {
    return apiRequest(`${API_URL}/problems.php?id=${id}`);
};

// Yeni problem ekle
export const createProblem = async (problemData) => {
    return apiRequest(`${API_URL}/problems.php`, {
        method: 'POST',
        body: JSON.stringify(problemData),
    });
};

// Problem güncelle
export const updateProblem = async (id, problemData) => {
    return apiRequest(`${API_URL}/problems.php?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify(problemData),
    });
};

// Problem sil
export const deleteProblem = async (id) => {
    return apiRequest(`${API_URL}/problems.php?id=${id}`, {
        method: 'DELETE',
    });
};
