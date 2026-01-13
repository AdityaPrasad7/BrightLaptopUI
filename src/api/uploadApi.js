/**
 * Upload API Service
 * Handles file uploads (images) to Cloudinary
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Upload single image for refurbishment requests
 * @param {File} file - Image file
 * @returns {Promise} Response with uploaded image URL
 */
export const uploadRefurbishmentImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', 'laptops/refurbishment');

    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_BASE_URL}/laptops/upload/refurbishment-image`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type - axios will set it automatically with boundary
        }
      }
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to upload image',
      details: error.response?.data,
    };
  }
};

/**
 * Upload multiple images for refurbishment requests
 * @param {File[]} files - Array of image files
 * @returns {Promise} Response with uploaded image URLs
 */
export const uploadRefurbishmentImages = async (files) => {
  try {
    const uploadPromises = files.map(file => uploadRefurbishmentImage(file));
    const results = await Promise.all(uploadPromises);
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    if (failed.length > 0) {
      return {
        success: false,
        error: `${failed.length} image(s) failed to upload`,
        details: failed,
      };
    }
    
    return {
      success: true,
      data: successful.map(r => r.data),
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to upload images',
    };
  }
};

/**
 * Upload voice message for complaints
 * @param {Blob} audioBlob - Audio blob from MediaRecorder
 * @returns {Promise} Response with uploaded audio URL
 */
export const uploadVoiceMessage = async (audioBlob) => {
  try {
    const formData = new FormData();
    // Convert blob to file - MediaRecorder typically uses 'audio/webm' or 'video/webm'
    // Ensure we set a proper MIME type
    const mimeType = audioBlob.type || 'audio/webm';
    const audioFile = new File([audioBlob], 'voice-message.webm', { type: mimeType });
    formData.append('audio', audioFile);
    formData.append('folder', 'laptops/complaints/voice');

    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_BASE_URL}/laptops/upload/voice-message`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to upload voice message',
      details: error.response?.data,
    };
  }
};
