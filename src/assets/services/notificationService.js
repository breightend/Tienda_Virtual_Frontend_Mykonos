import axios from "axios";
import { getAuthToken } from "./authService";

const API_URL = import.meta.env.VITE_API_URL;

const getHeaders = () => {
  const token = getAuthToken();
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

/**
 * Fetch personal notifications for the current user
 */
export const getNotifications = async () => {
  const response = await axios.get(`${API_URL}/notifications/`, getHeaders());
  return response.data;
};

/**
 * Fetch broadcast notifications visible to the current user
 */
export const getBroadcasts = async () => {
  const response = await axios.get(
    `${API_URL}/notifications/broadcasts`,
    getHeaders()
  );
  return response.data;
};

export const getAllBroadcasts = async () => {
  const response = await axios.get(
    `${API_URL}/notifications/broadcasts/all`,
    getHeaders()
  );
  return response.data;
};

/**
 * Get the total count of unread notifications (personal + broadcasts)
 */
export const getUnreadCount = async () => {
  const response = await axios.get(
    `${API_URL}/notifications/unread-count`,
    getHeaders()
  );
  return response.data;
};

/**
 * Mark a personal notification as read
 * @param {number} id - Notification ID
 */
export const markNotificationAsRead = async (id) => {
  const response = await axios.put(
    `${API_URL}/notifications/${id}/read`,
    null,
    getHeaders()
  );
  return response.data;
};

/**
 * Mark a broadcast notification as read for the current user
 * @param {number} id - Broadcast ID
 */
export const markBroadcastAsRead = async (id) => {
  const response = await axios.put(
    `${API_URL}/notifications/broadcasts/${id}/read`,
    null,
    getHeaders()
  );
  return response.data;
};

/**
 * Create a new personal notification (Admin only)
 * @param {Object} notificationData - { user_id, title, message, type, order_id, image_url, link_url }
 */
export const createPersonalNotification = async (notificationData) => {
  const response = await axios.post(
    `${API_URL}/notifications/`,
    notificationData,
    getHeaders()
  );
  return response.data;
};

/**
 * Create a new broadcast notification (Admin only)
 * @param {Object} broadcastData - { title, message, image_url, link_url, target_role, active }
 */
export const createBroadcast = async (broadcastData) => {
  const response = await axios.post(
    `${API_URL}/notifications/broadcasts`,
    broadcastData,
    getHeaders()
  );
  return response.data;
};

/**
 * Update an existing broadcast (Admin only)
 * Only works for drafts (active: false). If active: true, returns 400.
 * @param {number} id - Broadcast ID
 * @param {Object} broadcastData - Updated data
 */
export const updateBroadcast = async (id, broadcastData) => {
  const response = await axios.put(
    `${API_URL}/notifications/broadcasts/${id}`,
    broadcastData,
    getHeaders()
  );
  return response.data;
};

/**
 * Upload an image for a notification/broadcast (Admin only)
 * Replicates product image upload logic: Sends Base64 JSON
 * @param {File} file - Image file
 * @returns {Promise<string>} Image URL
 */
export const uploadNotificationImage = async (file) => {
  try {
    // 1. Convert file to base64 (logic from productService.js)
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

    // 2. Send as JSON
    const response = await axios.post(
      `${API_URL}/notifications/upload-image`,
      requestBody,
      getHeaders() // Content-Type: application/json is default for axios with object body
    );
    return response.data.image_url;
  } catch (error) {
    console.error("Error uploading notification image:", error);
    throw error;
  }
};
