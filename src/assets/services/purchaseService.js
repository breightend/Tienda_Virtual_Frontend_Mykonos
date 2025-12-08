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
