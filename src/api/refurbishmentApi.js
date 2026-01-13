import axiosInstance from './axiosConfig';

/**
 * Create a new refurbishment request
 * @param {Object} requestData - Refurbishment request data
 * @param {string} requestData.orderId - Order ID
 * @param {string} requestData.productId - Product ID
 * @param {Array<string>} requestData.images - Array of image URLs
 * @param {string} requestData.issueText - Issue description
 * @param {Array<string>} requestData.accessories - Array of accessories (e.g., charger)
 * @returns {Promise} Response with request data
 */
export const createRefurbishmentRequest = async (requestData) => {
  const response = await axiosInstance.post('/laptops/refurbishment/requests', requestData);
  return response.data;
};

/**
 * Get refurbishment requests
 * @param {Object} params - Query parameters
 * @param {string} [params.status] - Filter by status
 * @param {string} [params.orderId] - Filter by order ID
 * @returns {Promise} Response with requests data
 */
export const getRefurbishmentRequests = async (params = {}) => {
  const response = await axiosInstance.get('/laptops/refurbishment/requests', { params });
  return response.data;
};

/**
 * Get refurbishment request by ID
 * @param {string} requestId - Request ID
 * @returns {Promise} Response with request data
 */
export const getRefurbishmentRequestById = async (requestId) => {
  const response = await axiosInstance.get(`/laptops/refurbishment/requests/${requestId}`);
  return response.data;
};
