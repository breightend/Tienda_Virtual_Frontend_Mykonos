/**
 * Branch Service
 * Handles all branch/sucursal-related API calls
 */

import axios from "axios";
import { getAuthToken } from "./authService";

const API_URL = import.meta.env.VITE_API_URL + "/branch";

/**
 * Get all branches/sucursales
 * @returns {Promise<Array>} Array of branches
 */
export const getAllBranches = async () => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");

    const response = await axios.get(`${API_URL}/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching branches:", error);
    throw error.response?.data || error;
  }
};

/**
 * Get product details by ID by variant by branch
 * @param {number} productId - Product ID
 * @returns {Promise<Array>} Array of branches with variants
 */
export const getProductDetailsByVariantByBranch = async (productId) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");

    const response = await axios.get(
      `${API_URL}/productsVariantsByBranch/${productId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching product details for product ${productId}:`,
      error
    );
    throw error.response?.data || error;
  }
};

/**
 * Get a single branch by ID
 * @param {number} branchId - Branch ID
 * @returns {Promise<Object>} Branch details
 */
export const getBranchById = async (branchId) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");

    const response = await axios.get(`${API_URL}/${branchId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching branch ${branchId}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Get web variants for a specific product and branch (for catalog filtering)
 * Returns variant details with stock assigned to the specific branch
 * @param {number} productId - Product ID
 * @param {number} branchId - Branch ID
 * @returns {Promise<Array>} Array with single branch object containing variants
 * Response format:
 * [{
 *   branch_id: 1,
 *   branch_name: "Sucursal Centro",
 *   variants: [{
 *     variant_id: 101,        // web_variants.id
 *     size: "M",
 *     color: "Rojo",
 *     color_hex: "#FF0000",
 *     quantity: 5,            // Stock assigned to this branch (web_variant_branch_assignment)
 *     barcode: null,
 *     cantidad_web: 20,       // Total web stock (web_variants.displayed_stock)
 *     mostrar_en_web: true    // web_variants.is_active
 *   }]
 * }]
 */
export const getWebProductsVariantsByBranch = async (productId, branchId) => {
  try {
    const response = await axios.get(
      `${API_URL}/webProductsVariantsByBranch/${productId}/${branchId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching web variants for product ${productId} in branch ${branchId}:`,
      error
    );
    throw error.response?.data || error;
  }
};
