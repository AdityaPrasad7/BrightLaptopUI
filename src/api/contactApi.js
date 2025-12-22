import axiosInstance from './axiosConfig';

/**
 * Contact API service for laptops domain
 */

/**
 * Submit contact form
 * @param {Object} contactData - Contact form data
 * @param {string} contactData.name - Sender's name
 * @param {string} contactData.email - Sender's email
 * @param {string} [contactData.phone] - Sender's phone (optional)
 * @param {string} contactData.message - Message content
 * @returns {Promise} Response with success message
 */
export const submitContactForm = async (contactData) => {
  const response = await axiosInstance.post('/laptops/contact', contactData);
  return response.data;
};


