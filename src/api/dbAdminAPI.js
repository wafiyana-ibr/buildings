import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: `${API_URL}/admin`,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Important for sending cookies with requests
});

// Add authorization token to each request if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Dashboard
export const getDashboardStats = async () => {
  try {
    const response = await apiClient.get('/dashboard');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching dashboard statistics' };
  }
};

// Users
export const getUsers = async (page = 1, limit = 10, search = '') => {
  try {
    const response = await apiClient.get('/users', {
      params: { page, limit, search }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching users' };
  }
};

export const getUserById = async (id) => {
  try {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching user' };
  }
};

export const createUser = async (userData) => {
  try {
    const response = await apiClient.post('/users', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error creating user' };
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error updating user' };
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error deleting user' };
  }
};

// Categories
export const getCategories = async () => {
  try {
    const response = await apiClient.get('/categories');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching categories' };
  }
};

export const getCategoryById = async (id) => {
  try {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching category' };
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await apiClient.post('/categories', categoryData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error creating category' };
  }
};

export const updateCategory = async (id, categoryData) => {
  try {
    const response = await apiClient.put(`/categories/${id}`, categoryData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error updating category' };
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error deleting category' };
  }
};

// Types
export const getTypes = async (page = 1, limit = 10, search = '', category = '') => {
  try {
    const response = await apiClient.get('/types', {
      params: { page, limit, search, category }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching types' };
  }
};

export const getTypeById = async (id) => {
  try {
    const response = await apiClient.get(`/types/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching type' };
  }
};

export const createType = async (typeData) => {
  try {
    const response = await apiClient.post('/types', typeData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error creating type' };
  }
};

export const updateType = async (id, typeData) => {
  try {
    const response = await apiClient.put(`/types/${id}`, typeData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error updating type' };
  }
};

export const deleteType = async (id) => {
  try {
    const response = await apiClient.delete(`/types/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error deleting type' };
  }
};

// Bases
export const getBases = async (page = 1, limit = 10, search = '') => {
  try {
    const response = await apiClient.get('/bases', {
      params: { page, limit, search }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching bases' };
  }
};

export const getBaseById = async (id) => {
  try {
    const response = await apiClient.get(`/bases/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching base' };
  }
};

export const createBase = async (baseData) => {
  try {
    const response = await apiClient.post('/bases', baseData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error creating base' };
  }
};

export const updateBase = async (id, baseData) => {
  try {
    const response = await apiClient.put(`/bases/${id}`, baseData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error updating base' };
  }
};

export const deleteBase = async (id) => {
  try {
    const response = await apiClient.delete(`/bases/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error deleting base' };
  }
};

// Objects
export const getObjects = async (baseId, page = 1, limit = 10) => {
  try {
    const response = await apiClient.get('/objects', {
      params: { baseId, page, limit }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching objects' };
  }
};

export const getObjectById = async (id) => {
  try {
    const response = await apiClient.get(`/objects/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching object' };
  }
};

export const createObject = async (objectData) => {
  try {
    const response = await apiClient.post('/objects', objectData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error creating object' };
  }
};

export const updateObject = async (id, objectData) => {
  try {
    const response = await apiClient.put(`/objects/${id}`, objectData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error updating object' };
  }
};

export const deleteObject = async (id) => {
  try {
    const response = await apiClient.delete(`/objects/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error deleting object' };
  }
};

// Default export with all APIs
export default {
  // Dashboard
  getDashboardStats,
  
  // Users
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  
  // Categories
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  
  // Types
  getTypes,
  getTypeById,
  createType,
  updateType,
  deleteType,
  
  // Bases
  getBases,
  getBaseById,
  createBase,
  updateBase,
  deleteBase,
  
  // Objects
  getObjects,
  getObjectById,
  createObject,
  updateObject,
  deleteObject
};
