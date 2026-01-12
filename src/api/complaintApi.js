import axiosInstance from './axiosConfig';

/**
 * Create a new complaint
 * @param {Object} complaintData - Complaint data
 * @param {string} complaintData.orderId - Order ID
 * @param {string} complaintData.productId - Product ID (optional)
 * @param {string} complaintData.description - Description
 * @param {string} complaintData.category - Category
 * @returns {Promise} Response with complaint data
 */
export const createComplaint = async (complaintData) => {
  const response = await axiosInstance.post('/laptops/support/complaints', complaintData);
  return response.data;
};

/**
 * Get complaints
 * @param {Object} params - Query parameters
 * @param {string} [params.status] - Filter by status
 * @param {string} [params.orderId] - Filter by order ID
 * @param {string} [params.category] - Filter by category
 * @returns {Promise} Response with complaints data
 */
export const getComplaints = async (params = {}) => {
  const response = await axiosInstance.get('/laptops/support/complaints', { params });
  return response.data;
};

/**
 * Get complaint by ID
 * @param {string} complaintId - Complaint ID
 * @returns {Promise} Response with complaint data
 */
export const getComplaintById = async (complaintId) => {
  const response = await axiosInstance.get(`/laptops/support/complaints/${complaintId}`);
  return response.data;
};

/**
 * Update complaint status (Admin/Seller only)
 * @param {string} complaintId - Complaint ID
 * @param {string} status - New status
 * @returns {Promise} Response with updated complaint data
 */
export const updateComplaintStatus = async (complaintId, status) => {
  const response = await axiosInstance.put(`/laptops/support/complaints/${complaintId}/status`, { status });
  return response.data;
};
