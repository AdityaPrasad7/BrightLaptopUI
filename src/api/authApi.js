import axiosInstance from './axiosConfig';

/**
 * Auth API service for laptops domain
 */

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.name - User's full name
 * @param {string} userData.email - User's email
 * @param {string} userData.password - User's password
 * @param {string} userData.role - User role (B2C_BUYER, B2B_BUYER, SELLER, ADMIN)
 * @param {string} [userData.companyName] - Company name (required for B2B_BUYER)
 * @returns {Promise} Response with user data and token
 */
export const register = async (userData) => {
  const response = await axiosInstance.post('/laptops/auth/register', userData);
  return response.data;
};

/**
 * Login user
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User's email
 * @param {string} credentials.password - User's password
 * @returns {Promise} Response with user data and token
 */
export const login = async (credentials) => {
  const response = await axiosInstance.post('/laptops/auth/login', credentials);
  return response.data;
};

/**
 * Get current user profile
 * @returns {Promise} Response with user data
 */
export const getMe = async () => {
  const response = await axiosInstance.get('/laptops/auth/me');
  return response.data;
};

/**
 * Logout user (clears local storage)
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if token exists
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

/**
 * Get stored user data
 * @returns {Object|null} User data or null
 */
export const getStoredUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Store authentication data
 * @param {string} token - JWT token
 * @param {Object} user - User data
 */
export const storeAuthData = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

