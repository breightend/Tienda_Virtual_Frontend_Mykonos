import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL + "products";


const fetchProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}/productos`);
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};


const fetchProductById = async (productId) => {
  try {
    const response = await axios.get(`${API_URL}/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product with ID ${productId}:`, error);
    throw error;
  }
};


const fetchProductsByCategory = async (category) => {
  try {
    const response = await axios.get(`${API_URL}?category=${category}`);
    return response.data;
    } catch (error) {
    console.error(`Error fetching products in category ${category}:`, error);
    throw error;
  }
};


/**
 * Fetch products by group name (hierarchical - includes all descendant groups)
 * @param {string} groupName - The name of the group to filter by
 * @returns {Promise<Array>} Array of products in the group and all its children
 */
const fetchProductsByGroupName = async (groupName) => {
  try {
    const response = await axios.get(`${API_URL}/productsByGroup/${encodeURIComponent(groupName)}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching products for group ${groupName}:`, error);
    throw error;
  }
};



export { fetchProducts, fetchProductById, fetchProductsByCategory, fetchProductsByGroupName };