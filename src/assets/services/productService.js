import axios from "axios";
import { getAuthToken } from "./authService";

const API_URL = import.meta.env.VITE_API_URL + "/products";

// ============================================================================
// PUBLIC / USER-FACING ENDPOINTS
// ============================================================================

/**
 * Fetch all products available in online store
 * @param {Object} filters - Optional filters
 * @param {string} filters.search - Search text (searches in name, description, provider code, barcode)
 * @param {number} filters.group_id - Filter by group/category ID
 * @returns {Promise<Array>} Array of online store products
 */
const fetchProducts = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.search) {
      params.append("search", filters.search);
    }
    if (filters.group_id) {
      params.append("group_id", filters.group_id);
    }

    const useFilteredEndpoint = filters.search || filters.group_id;
    const endpoint = useFilteredEndpoint ? `${API_URL}/all` : API_URL;
    const url = params.toString()
      ? `${endpoint}?${params.toString()}`
      : endpoint;

    console.log("🌐 Llamando a:", url);

    // Si usamos /products/all, necesitamos token de autenticación
    const config = {};
    if (useFilteredEndpoint) {
      const token = getAuthToken();
      if (token) {
        config.headers = { Authorization: `Bearer ${token}` };
      }
    }

    const response = await axios.get(url, config);

    console.log("🔍 Raw backend response from", url, ":", response.data);

    // Si usamos /products/all, necesitamos normalizar la respuesta para que coincida
    // con el formato esperado por los componentes
    if (useFilteredEndpoint && response.data) {
      return response.data.map((product) => ({
        id: product.id,
        nombre_web: product.product_name,
        descripcion_web: product.description || "",
        precio_web: product.original_price,
        images: product.image_url ? [product.image_url] : [],
        provider: product.provider_name,
        category: product.group_name,
        discount_percentage: product.discount_percentage || 0,
        en_tienda_online: product.en_tienda_online,
        variantes: [], // /products/all no devuelve variantes, las cargaremos al editar
        // Agregar campos originales por si se necesitan
        _original: product,
      }));
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

const fetchAdminInfoProducts = async () => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");
    const response = await axios.get(`${API_URL}/info-matrix`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching admin info products:", error);
    throw error.response?.data || error;
  }
};
/**
 * Fetch product by ID
 * @param {number} productId - Product ID
 * @returns {Promise<Object>} Product details
 */
const fetchProductById = async (productId) => {
  try {
    const response = await axios.get(`${API_URL}/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product with ID ${productId}:`, error);
    throw error;
  }
};

/**
 * Fetch products by category (deprecated - use fetchProductsByGroupName)
 * @param {string} category - Category name
 * @returns {Promise<Array>} Array of products
 */
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
    const response = await axios.get(
      `${API_URL}/productsByGroup/${encodeURIComponent(groupName)}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching products for group ${groupName}:`, error);
    throw error;
  }
};

/**
 * Fetch products for online store with pagination
 * @param {string} category - Optional category filter
 * @param {number} limit - Maximum number of products (default: 50)
 * @param {number} offset - Number of products to skip (default: 0)
 * @returns {Promise<Array>} Array of online store products
 */
const fetchOnlineStoreProducts = async (
  category = null,
  limit = 50,
  offset = 0
) => {
  try {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    params.append("limit", limit);
    params.append("offset", offset);

    const response = await axios.get(
      `${API_URL}/online-store?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching online store products:", error);
    throw error;
  }
};

/**
 * Fetch product by slug
 * @param {string} slug - URL-friendly product slug
 * @returns {Promise<Object>} Product details
 */
const fetchProductBySlug = async (slug) => {
  try {
    const response = await axios.get(
      `${API_URL}/online-store/${encodeURIComponent(slug)}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching product with slug ${slug}:`, error);
    throw error;
  }
};

// ============================================================================
// ADMIN-ONLY ENDPOINTS
// ============================================================================

/**
 * Fetch ALL products (including those not in online store) - Admin only
 * @param {string} providerCode - Optional provider code (barcode) to filter
 * @returns {Promise<Array>} Array of all products
 */
const fetchAllProducts = async (providerCode = null) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");

    const params = providerCode
      ? `?barcode=${encodeURIComponent(providerCode)}`
      : "";
    console.log("🌐 Haciendo petición a:", `${API_URL}/all${params}`);
    const response = await axios.get(`${API_URL}/all${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("✅ Respuesta del backend:", response);
    console.log("📦 response.data:", response.data);
    console.log("📦 Tipo de response.data:", typeof response.data);
    console.log("📦 Es array response.data?:", Array.isArray(response.data));
    return response.data;
  } catch (error) {
    console.error("Error fetching all products:", error);
    throw error.response?.data || error;
  }
};

/**
 * Create a new product - Admin only
 * @param {Object} productData - Product data
 * @returns {Promise<Object>} Created product
 */
const createProduct = async (productData) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");

    const response = await axios.post(`${API_URL}/`, productData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error.response?.data || error;
  }
};

/**
 * Update an existing product - Admin only
 * @param {number} productId - Product ID
 * @param {Object} productData - Updated product data
 * @returns {Promise<Object>} Updated product
 */
const updateProduct = async (productId, productData) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");

    const response = await axios.put(`${API_URL}/${productId}`, productData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating product ${productId}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Delete a product - Admin only
 * @param {number} productId - Product ID
 * @returns {Promise<void>}
 */
const deleteProduct = async (productId) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");

    await axios.delete(`${API_URL}/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error(`Error deleting product ${productId}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Toggle product online status and update web fields - Admin only
 * @param {number} productId - Product ID
 * @param {Object} data - Data to update
 * @param {boolean} data.en_tienda_online - Whether product should be in online store
 * @param {string} data.nombre_web - Product name for web (optional)
 * @param {string} data.descripcion_web - Product description for web (optional)
 * @param {number} data.precio_web - Product price for web (optional)
 * @param {string} data.slug - URL-friendly slug (optional)
 * @returns {Promise<Object>} Updated product
 */
const toggleProductOnline = async (productId, data) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");

    const response = await axios.patch(
      `${API_URL}/${productId}/toggle-online`,
      data,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error toggling product ${productId} online status:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Add image to product - Admin only
 * @param {number} productId - Product ID
 * @param {string} imageUrl - Image URL
 * @returns {Promise<Object>} Created image record
 */
const addProductImage = async (productId, imageUrl) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");

    const response = await axios.post(
      `${API_URL}/${productId}/images`,
      { image_url: imageUrl },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error(`Error adding image to product ${productId}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Delete product image - Admin only
 * @param {number} productId - Product ID
 * @param {number} imageId - Image ID
 * @returns {Promise<void>}
 */
const deleteProductImage = async (productId, imageId) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");

    await axios.delete(
      `${API_URL}/${productId}/images/${imageId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  } catch (error) {
    console.error(`Error deleting image ${imageId} from product ${productId}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Upload image for product (base64) - Admin only
 * @param {number} productId - Product ID
 * @param {File} file - Image file
 * @param {number|null} orden - Optional order for the image (0 = first)
 * @returns {Promise<Object>} Image data with id, URL, and orden
 */
const uploadProductImage = async (productId, file, orden = null) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");

    // Convert file to base64
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const requestBody = {
      image_data: base64,
      filename: file.name,
    };

    // Only include orden if specified
    if (orden !== null && orden !== undefined) {
      requestBody.orden = orden;
    }

    const response = await axios.post(
      `${API_URL}/${productId}/images`,
      requestBody,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error uploading image for product ${productId}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Reorder product images - Admin only
 * @param {number} productId - Product ID
 * @param {Array} images - Array of {image_id, orden} objects
 * @returns {Promise<Object>} Result with message and updated_count
 */
const reorderProductImages = async (productId, images) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");

    const response = await axios.patch(
      `${API_URL}/${productId}/images/reorder`,
      { images },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error reordering images for product ${productId}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Get all images for a product
 * @param {number} productId - Product ID
 * @returns {Promise<Array>} Array of image objects with id, image_url, and orden
 */
const getProductImages = async (productId) => {
  try {
    const response = await axios.get(`${API_URL}/${productId}/images`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching images for product ${productId}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Get all variants for a product with their stock configuration
 * @param {number} productId - Product ID
 * @returns {Promise<Array>} Array of variants with stock configuration
 */
const getProductVariants = async (productId) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");

    const response = await axios.get(`${API_URL}/${productId}/variantes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching variants for product ${productId}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Update product with variants and stock configuration
 * @param {number} productId - Product ID
 * @param {Object} data - Product data with variants
 * @param {string} data.nombre - Product name
 * @param {string} data.descripcion - Product description
 * @param {number} data.precio_web - Web price
 * @param {boolean} data.en_tienda_online - Whether product is online
 * @param {Array} data.variantes - Array of variants with stock configuration
 * @returns {Promise<Object>} Updated product
 */

const updateProductWithVariants = async (productId, data) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");

    const response = await axios.put(`${API_URL}/${productId}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating product ${productId} with variants:`, error);
    throw error.response?.data || error;
  }
};

const searchProductsByBarcodeAdmin = async (barcode) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");
    const response = await axios.get(
      `${API_URL}/search-by-barcode/${encodeURIComponent(barcode)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error searching products by barcode ${barcode}:`, error);
    throw error.response?.data || error;
  }
};

const searProductByIdAdmin = async (id) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");

    const response = await axios.get(`${API_URL}/allProductsInfo/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    throw error.response?.data || error;
  }
};

export {
  // Public
  fetchProducts,
  fetchProductById,
  fetchProductsByCategory,
  fetchProductsByGroupName,
  fetchOnlineStoreProducts,
  fetchProductBySlug,
  fetchAdminInfoProducts,

  // Admin
  fetchAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductOnline,
  addProductImage,
  uploadProductImage,
  deleteProductImage,
  reorderProductImages,
  getProductImages,
  getProductVariants,
  updateProductWithVariants,
  searchProductsByBarcodeAdmin,
  searProductByIdAdmin,
};
