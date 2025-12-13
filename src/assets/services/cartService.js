/**
 * Cart Service
 * Handles all shopping cart related API calls
 */

import axios from "axios";
import { getAuthToken } from "./authService";

const API_URL = import.meta.env.VITE_API_URL;

// ============================================================================
// CART MANAGEMENT
// ============================================================================

/**
 * Get current user's cart
 * @returns {Promise<Object>} Cart with items
 */
export const getCart = async () => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");

    const response = await axios.get(`${API_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error.response?.data || error;
  }
};



/**
 * Add product to cart
 * @param {number} productId - Product ID
 * @param {number} variantId - Product variant ID
 * @param {number} quantity - Quantity to add
 * @returns {Promise<Object>} Updated cart item
 */
export const addToCart = async (productId, quantity ,variantId) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");

    const response = await axios.post(
      `${API_URL}/cart/items`,
      { product_id: productId, quantity: quantity, variant_id: variantId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error.response?.data || error;
  }
};

/**
 * Update cart item quantity
 * @param {number} cartItemId - Cart item ID
 * @param {number} quantity - New quantity
 * @returns {Promise<Object>} Updated cart item
 */
export const updateCartItem = async (cartItemId, quantity) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");

    const response = await axios.patch(
      `${API_URL}/cart/items/${cartItemId}`,
      { quantity },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating cart item ${cartItemId}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Remove item from cart
 * @param {number} cartItemId - Cart item ID
 * @returns {Promise<void>}
 */
export const removeFromCart = async (cartItemId) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");

    await axios.delete(`${API_URL}/cart/items/${cartItemId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error(`Error removing cart item ${cartItemId}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Clear entire cart
 * @returns {Promise<void>}
 */
export const clearCart = async () => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");

    await axios.delete(`${API_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error.response?.data || error;
  }
};

// ============================================================================
// CHECKOUT
// ============================================================================

/**
 * Create order from cart (checkout)
 * @param {Object} checkoutData - Checkout information
 * @param {string} checkoutData.shipping_address - Shipping address
 * @param {string} checkoutData.payment_method - Payment method
 * @param {string} checkoutData.notes - Optional notes
 * @returns {Promise<Object>} Created order
 */
export const checkout = async (checkoutData) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");

    const response = await axios.post(
      `${API_URL}/orders/checkout`,
      checkoutData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error during checkout:", error);
    throw error.response?.data || error;
  }
};
