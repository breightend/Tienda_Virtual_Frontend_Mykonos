/**
 * Admin Service
 * Handles all admin-related API calls
 */

import axios from "axios";
import { getAuthToken } from "./authService";

const API_URL = import.meta.env.VITE_API_URL;

// ============================================================================
// USER MANAGEMENT
// ============================================================================

/**
 * Get all users (Admin only)
 * @param {number} limit - Maximum number of users
 * @param {number} offset - Number of users to skip
 * @param {string} role - Filter by role (optional)
 * @returns {Promise<Array>} Array of users
 */
export const getAllUsers = async (limit = 50, offset = 0, role = null) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");

    const params = new URLSearchParams();
    params.append('limit', limit);
    params.append('offset', offset);
    if (role) params.append('role', role);

    const response = await axios.get(`${API_URL}/admin/users?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error.response?.data || error;
  }
};

/**
 * Change user role (Admin only)
 * @param {number} userId - User ID
 * @param {string} role - New role (admin or customer)
 * @returns {Promise<Object>} Updated user
 */
export const changeUserRole = async (userId, role) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");

    const response = await axios.patch(
      `${API_URL}/admin/users/${userId}/role`,
      { role },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error(`Error changing user ${userId} role:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Change user status (Admin only)
 * @param {number} userId - User ID
 * @param {string} status - New status (active or inactive)
 * @returns {Promise<Object>} Updated user
 */
export const changeUserStatus = async (userId, status) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");

    const response = await axios.patch(
      `${API_URL}/admin/users/${userId}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error(`Error changing user ${userId} status:`, error);
    throw error.response?.data || error;
  }
};

// ============================================================================
// ORDER MANAGEMENT
// ============================================================================

/**
 * Get all orders (Admin only)
 * @param {number} limit - Maximum number of orders
 * @param {number} offset - Number of orders to skip
 * @param {string} status - Filter by status (optional)
 * @returns {Promise<Array>} Array of orders
 */
export const getAllOrders = async (limit = 50, offset = 0, status = null) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");

    const params = new URLSearchParams();
    params.append('limit', limit);
    params.append('offset', offset);
    if (status) params.append('status', status);

    const response = await axios.get(`${API_URL}/admin/orders?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error.response?.data || error;
  }
};

/**
 * Get order details (Admin only)
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} Order details
 */
export const getOrderDetails = async (orderId) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");

    const response = await axios.get(`${API_URL}/admin/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Update order status (Admin only)
 * @param {number} orderId - Order ID
 * @param {Object} data - Status update data
 * @param {string} data.status - New status
 * @param {string} data.tracking_number - Tracking number (optional)
 * @param {string} data.notes - Notes (optional)
 * @returns {Promise<Object>} Updated order
 */
export const updateOrderStatus = async (orderId, data) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");

    const response = await axios.patch(
      `${API_URL}/admin/orders/${orderId}/status`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating order ${orderId} status:`, error);
    throw error.response?.data || error;
  }
};

// ============================================================================
// DISCOUNT MANAGEMENT
// ============================================================================

/**
 * Apply discount to a product group (Admin only)
 * @param {Object} data - Discount data
 * @param {number} data.group_id - Group ID
 * @param {number} data.discount_percentage - Discount percentage
 * @param {string} data.start_date - Start date (optional)
 * @param {string} data.end_date - End date (optional)
 * @param {boolean} data.apply_to_children - Apply to subgroups (optional)
 * @returns {Promise<Object>} Discount result
 */
export const applyGroupDiscount = async (data) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");

    const response = await axios.post(
      `${API_URL}/admin/discounts/group`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error applying group discount:", error);
    throw error.response?.data || error;
  }
};

/**
 * Get all discounts (Admin only)
 * @returns {Promise<Array>} Array of discounts
 */
export const getAllDiscounts = async () => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");

    const response = await axios.get(`${API_URL}/admin/discounts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching discounts:", error);
    throw error.response?.data || error;
  }
};

/**
 * Update discount (Admin only)
 * @param {number} discountId - Discount ID
 * @param {Object} data - Updated discount data
 * @returns {Promise<Object>} Updated discount
 */
export const updateDiscount = async (discountId, data) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");

    const response = await axios.patch(
      `${API_URL}/admin/discounts/${discountId}`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating discount ${discountId}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Delete discount (Admin only)
 * @param {number} discountId - Discount ID
 * @returns {Promise<void>}
 */
export const deleteDiscount = async (discountId) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");

    await axios.delete(`${API_URL}/admin/discounts/${discountId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error(`Error deleting discount ${discountId}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Apply discount to individual product (Admin only)
 * @param {number} productId - Product ID
 * @param {Object} data - Discount data
 * @param {number} data.has_discount - 1 or 0
 * @param {number} data.discount_percentage - Discount percentage
 * @param {number} data.original_price - Original price (optional)
 * @returns {Promise<Object>} Updated product
 */
export const applyProductDiscount = async (productId, data) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");

    const response = await axios.patch(
      `${API_URL}/products/${productId}/discount`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error(`Error applying discount to product ${productId}:`, error);
    throw error.response?.data || error;
  }
};

// ============================================================================
// PRICE MANAGEMENT
// ============================================================================

/**
 * Update product web price (Admin only)
 * @param {number} productId - Product ID
 * @param {number} precio_web - New web price
 * @returns {Promise<Object>} Updated product
 */
export const updateProductWebPrice = async (productId, precio_web) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");

    const response = await axios.patch(
      `${API_URL}/products/${productId}/web-price`,
      { precio_web },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating product ${productId} web price:`, error);
    throw error.response?.data || error;
  }
};

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Get admin dashboard statistics (Admin only)
 * @returns {Promise<Object>} Dashboard statistics
 */
export const getAdminStats = async () => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");

    const response = await axios.get(`${API_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    throw error.response?.data || error;
  }
};
