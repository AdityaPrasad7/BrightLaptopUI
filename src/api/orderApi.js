import axiosInstance from './axiosConfig';

/**
 * Get user's orders
 * @param {Object} params - Query parameters
 * @param {string} [params.status] - Filter by status (PENDING, APPROVED, SHIPPED, CANCELLED)
 * @param {string} [params.orderType] - Filter by order type (B2B, B2C)
 * @returns {Promise} Response with orders data
 */
export const getOrders = async (params = {}) => {
  const response = await axiosInstance.get('/laptops/orders', { params });
  return response.data;
};

/**
 * Get order by ID
 * @param {string} orderId - Order ID
 * @returns {Promise} Response with order data
 */
export const getOrderById = async (orderId) => {
  const response = await axiosInstance.get(`/laptops/orders/${orderId}`);
  return response.data;
};

