import axiosInstance from './axiosConfig';

/**
 * User API service for laptops domain
 */

/**
 * Get user addresses
 * @returns {Promise} Response with list of addresses
 */
export const getAddresses = async () => {
    const response = await axiosInstance.get('/laptops/user/addresses');
    return response.data;
};

/**
 * Add a new address
 * @param {Object} addressData - Address details
 * @returns {Promise} Response with updated addresses
 */
export const addAddress = async (addressData) => {
    const response = await axiosInstance.post('/laptops/user/addresses', addressData);
    return response.data;
};

/**
 * Remove an address
 * @param {string} addressId - ID of address to remove
 * @returns {Promise} Response with updated addresses
 */
export const removeAddress = async (addressId) => {
    const response = await axiosInstance.delete(`/laptops/user/addresses/${addressId}`);
    return response.data;
};
