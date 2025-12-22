import axiosInstance from './axiosConfig';

/**
 * Product API service for laptops domain
 */

/**
 * Get all products
 * @param {Object} params - Query parameters
 * @param {string} [params.sellerId] - Filter by seller ID
 * @param {boolean} [params.isActive] - Filter by active status
 * @param {string} [params.category] - Filter by category
 * @returns {Promise} Response with products data
 */
export const getProducts = async (params = {}) => {
  const response = await axiosInstance.get('/laptops/products', { params });
  return response.data;
};

/**
 * Get product by ID
 * @param {string} id - Product ID
 * @returns {Promise} Response with product data
 */
export const getProductById = async (id) => {
  const response = await axiosInstance.get(`/laptops/products/${id}`);
  return response.data;
};

/**
 * Get products by category name
 * @param {string} categoryName - Category name (e.g., "windows", "gaming", "mini-pcs")
 * @param {Object} params - Additional query parameters
 * @param {string} [params.sellerId] - Filter by seller ID
 * @param {boolean} [params.isActive] - Filter by active status
 * @returns {Promise} Response with products data
 */
export const getProductsByCategory = async (categoryName, params = {}) => {
  // Normalize category name: convert hyphens to spaces and lowercase
  // This matches how the backend stores categories (with spaces, lowercase)
  const normalizedCategory = categoryName.trim().toLowerCase().replace(/-/g, ' ');
  const response = await axiosInstance.get(`/laptops/categories/${encodeURIComponent(normalizedCategory)}/products`, { params });
  return response.data;
};

/**
 * Get all product categories list
 * @returns {Promise} Response with categories array
 */
export const getProductCategoriesList = async () => {
  const response = await axiosInstance.get('/laptops/products/categories/list');
  return response.data;
};

/**
 * Get best selling products
 * @param {Object} params - Query parameters
 * @param {number} [params.limit] - Number of products to return (default: 10)
 * @returns {Promise} Response with best selling products
 */
export const getBestSellers = async (params = {}) => {
  const response = await axiosInstance.get('/laptops/products/best-sellers', { params });
  return response.data;
};

/**
 * Get products with best deals (highest discounts)
 * @param {Object} params - Query parameters
 * @param {number} [params.limit] - Number of products to return (default: 10)
 * @returns {Promise} Response with best deal products
 */
export const getBestDeals = async (params = {}) => {
  const response = await axiosInstance.get('/laptops/products/best-deals', { params });
  return response.data;
};

/**
 * Get top picks - products with high ratings and good reviews
 * @param {Object} params - Query parameters
 * @param {number} [params.limit] - Number of products to return (default: 10)
 * @returns {Promise} Response with top pick products
 */
export const getTopPicks = async (params = {}) => {
  const response = await axiosInstance.get('/laptops/products/top-picks', { params });
  return response.data;
};

/**
 * Get unique brands with their images from products
 * @returns {Promise} Response with brands data
 */
export const getBrands = async () => {
  const response = await axiosInstance.get('/laptops/products/brands');
  return response.data;
};

/**
 * Search products by query string
 * @param {Object} params - Query parameters
 * @param {string} params.q - Search query string
 * @param {number} [params.limit] - Number of results to return (default: 10, max: 20)
 * @returns {Promise} Response with search results
 */
export const searchProducts = async (params = {}) => {
  const response = await axiosInstance.get('/laptops/products/search', { params });
  return response.data;
};


