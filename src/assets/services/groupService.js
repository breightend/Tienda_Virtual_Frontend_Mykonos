import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL + "groups";


/**
 * Fetch all groups from the database
 * @returns {Promise<Array>} Array of all groups
 */
const fetchGroups = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching groups:", error);
    throw error;
  }
};


/**
 * Fetch only root groups (top-level categories)
 * @returns {Promise<Array>} Array of root groups
 */
const fetchRootGroups = async () => {
  try {
    const response = await axios.get(`${API_URL}/root`);
    return response.data;
  } catch (error) {
    console.error("Error fetching root groups:", error);
    throw error;
  }
};


/**
 * Fetch groups organized in hierarchical structure
 * @returns {Promise<Array>} Array of root groups with nested children
 */
const fetchGroupsHierarchy = async () => {
  try {
    const response = await axios.get(`${API_URL}/hierarchy`);
    return response.data;
  } catch (error) {
    console.error("Error fetching groups hierarchy:", error);
    throw error;
  }
};


/**
 * Fetch a specific group by ID
 * @param {number} groupId - The ID of the group to fetch
 * @returns {Promise<Object>} Group object
 */
const fetchGroupById = async (groupId) => {
  try {
    const response = await axios.get(`${API_URL}/${groupId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching group with ID ${groupId}:`, error);
    throw error;
  }
};


export { 
  fetchGroups, 
  fetchRootGroups, 
  fetchGroupsHierarchy, 
  fetchGroupById 
};
