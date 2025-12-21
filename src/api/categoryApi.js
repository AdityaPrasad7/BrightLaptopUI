import axiosInstance from './axiosConfig';

/**
 * Category API service for laptops domain
 */

/**
 * Get all categories
 * @param {Object} params - Optional query parameters
 * @param {string} [params.type] - Filter by category type
 * @param {boolean} [params.isActive] - Filter by active status
 * @returns {Promise} Response with categories data
 */
export const getCategories = async (params = {}) => {
  const response = await axiosInstance.get('/laptops/categories', { params });
  return response.data;
};

/**
 * Get category by ID
 * @param {string} id - Category ID
 * @returns {Promise} Response with category data
 */
export const getCategoryById = async (id) => {
  const response = await axiosInstance.get(`/laptops/categories/${id}`);
  return response.data;
};

/**
 * Get category by slug
 * @param {string} slug - Category slug
 * @returns {Promise} Response with category data
 */
export const getCategoryBySlug = async (slug) => {
  const response = await axiosInstance.get(`/laptops/categories/slug/${slug}`);
  return response.data;
};

/**
 * Get all product categories list (returns array of category name strings)
 * @returns {Promise} Response with categories array
 */
export const getProductCategoriesList = async () => {
  const response = await axiosInstance.get('/laptops/products/categories/list');
  return response.data;
};

