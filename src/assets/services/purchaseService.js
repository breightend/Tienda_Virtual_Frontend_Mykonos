/**
 * Purchase Service
 * Handles all purchase-related API calls
 */

import axios from "axios";
import { getAuthToken } from "./authService";

const API_URL = import.meta.env.VITE_API_URL + "/purchases";

/**
 * Get all purchases for the authenticated user
 * @returns {Promise<Array>} Array of purchases with details
 */
export const getMyPurchases = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.get(`${API_URL}/my-purchases`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching purchases:", error);
    throw error.response?.data || error;
  }
};

/**
 * Get detailed information about a specific purchase
 * @param {number} purchaseId - ID of the purchase
 * @returns {Promise<Object>} Purchase details
 */
export const getPurchaseDetail = async (purchaseId) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.get(`${API_URL}/my-purchases/${purchaseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    console.error(`Error fetching purchase ${purchaseId}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Create a new order from the user's cart
 * @param {Object} orderData - Order creation data
 * @param {string} orderData.shipping_address - Shipping address (required)
 * @param {string} orderData.delivery_type - 'envio' or 'retiro' (required)
 * @param {number} orderData.shipping_cost - Shipping cost (optional, default: 0)
 * @param {string} orderData.notes - Additional notes (optional)
 * @param {string} orderData.payment_method - Payment method (optional, for future)
 * @returns {Promise<Object>} Created order details with tracking link
 */
export const createOrderFromCart = async (orderData) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.post(`${API_URL}/create-order`, orderData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error.response?.data || error;
  }
};

/**
 * Update the tracking status of an order
 * @param {number} purchaseId - ID of the purchase
 * @param {Object} trackingData - Tracking update data
 * @param {string} trackingData.status - Status: 'preparando', 'despachado', 'en_transito', 'entregado', 'cancelado'
 * @param {string} trackingData.description - Description of the update
 * @param {string} trackingData.location - Current location (optional)
 * @param {boolean} trackingData.notify_customer - Whether to notify customer (default: true)
 * @returns {Promise<Object>} Tracking update confirmation
 */
export const updateOrderTracking = async (purchaseId, trackingData) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.post(
      `${API_URL}/${purchaseId}/tracking`,
      trackingData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(`Error updating tracking for purchase ${purchaseId}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Confirm payment for a pending order
 * @param {number} orderId - ID of the order
 * @param {Object} paymentData - Payment confirmation data
 * @param {string} paymentData.payment_method - 'transferencia', 'efectivo', 'mercadopago'
 * @param {string} paymentData.payment_proof - Base64 encoded payment proof image (for transferencia)
 * @param {string} paymentData.transaction_id - Transaction ID (for mercadopago)
 * @param {string} paymentData.notes - Additional notes (optional)
 * @returns {Promise<Object>} Payment confirmation response
 */
export const confirmPayment = async (orderId, paymentData) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.post(
      `${API_URL}/${orderId}/confirm-payment`,
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(`Error confirming payment for order ${orderId}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Cancel a pending order
 * @param {number} orderId - ID of the order to cancel
 * @param {string} reason - Reason for cancellation (optional)
 * @returns {Promise<Object>} Cancellation confirmation
 */
export const cancelOrder = async (orderId, reason = "") => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.post(
      `${API_URL}/${orderId}/cancel`,
      { reason },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(`Error canceling order ${orderId}:`, error);
    throw error.response?.data || error;
  }
};
