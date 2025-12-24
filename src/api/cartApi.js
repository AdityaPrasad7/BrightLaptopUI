import axiosInstance from './axiosConfig';

/**
 * Add product to cart
 * @param {string} productId - Product ID
 * @param {number} quantity - Quantity to add
 * @param {Object} options - Additional options (selectedConfig, selectedWarranty)
 * @returns {Promise} Response with updated cart
 */
export const addToCart = async (productId, quantity = 1, options = {}) => {
  // Build request body explicitly to ensure all fields are included
  const requestBody = {
    productId,
    quantity
  };

  // Only add selectedConfig if it exists and has values
  if (options.selectedConfig && Object.keys(options.selectedConfig).length > 0) {
    requestBody.selectedConfig = options.selectedConfig;
  }

  // Always include selectedWarranty (even if 'default')
  if (options.selectedWarranty !== undefined) {
    requestBody.selectedWarranty = options.selectedWarranty;
  }

  console.log('[Cart API] Sending add to cart request:', JSON.stringify(requestBody, null, 2));

  const response = await axiosInstance.post('/laptops/cart/add', requestBody);
  
  console.log('[Cart API] Add to cart response:', JSON.stringify(response.data, null, 2));
  
  return response.data;
};

/**
 * Get user's cart
 * @returns {Promise} Response with cart data
 */
export const getCart = async () => {
  const response = await axiosInstance.get('/laptops/cart');
  return response.data;
};

/**
 * Update cart item quantity
 * @param {string} productId - Product ID
 * @param {number} quantity - New quantity
 * @returns {Promise} Response with updated cart
 */
export const updateCartItem = async (productId, quantity) => {
  const response = await axiosInstance.put('/laptops/cart/update', {
    productId,
    quantity,
  });
  return response.data;
};

/**
 * Remove product from cart
 * @param {string} productId - Product ID
 * @returns {Promise} Response with updated cart
 */
export const removeFromCart = async (productId) => {
  const response = await axiosInstance.delete(`/laptops/cart/remove/${productId}`);
  return response.data;
};

/**
 * Clear entire cart
 * @returns {Promise} Response with cleared cart
 */
export const clearCart = async () => {
  const response = await axiosInstance.delete('/laptops/cart/clear');
  return response.data;
};

/**
 * Checkout cart - convert cart to order
 * @param {Object} checkoutData - Checkout data
 * @param {Object} checkoutData.shippingAddress - Shipping address object
 * @param {Object} [checkoutData.billingAddress] - Billing address object (optional)
 * @param {string} checkoutData.contactEmail - Contact email
 * @param {string} checkoutData.contactPhone - Contact phone
 * @param {string} checkoutData.paymentMethod - Payment method (COD, CREDIT_CARD, etc.)
 * @param {string} [checkoutData.deliveryDate] - Delivery date (optional)
 * @param {string} [checkoutData.deliveryTime] - Delivery time (optional)
 * @param {string} [checkoutData.notes] - Order notes (optional)
 * @returns {Promise} Response with created order
 */
export const checkout = async (checkoutData) => {
  const response = await axiosInstance.post('/laptops/cart/checkout', checkoutData);
  return response.data;
};

/**
 * Create order directly (direct buy)
 * @param {Object} orderData - Order data
 * @param {Array} orderData.products - Array of { productId, quantity }
 * @param {string} [orderData.notes] - Order notes (optional)
 * @returns {Promise} Response with created order
 */
export const createOrder = async (orderData) => {
  const response = await axiosInstance.post('/laptops/orders', orderData);
  return response.data;
};

