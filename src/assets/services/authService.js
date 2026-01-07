/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Token management
export const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

export const setAuthToken = (token) => {
  localStorage.setItem("authToken", token);
};

export const removeAuthToken = () => {
  localStorage.removeItem("authToken");
};

export const getUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

export const setUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const removeUser = () => {
  localStorage.removeItem("user");
};

// API calls
/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.username - Username (3-50 characters)
 * @param {string} userData.email - Email address
 * @param {string} userData.password - Password (min 6 characters)
 * @param {string} [userData.fullname] - Full name (optional)
 * @returns {Promise<Object>} Response with token and user data
 */
export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    
    // Save token and user data
    if (response.data.token) {
      setAuthToken(response.data.token);
      setUser(response.data.user);
    }
    
    // TODO: Send verification email using EmailJS
    // After successful registration, send verification email from frontend
    // Example:
    // import emailjs from '@emailjs/browser';
    // emailjs.send(
    //   import.meta.env.VITE_EMAILJS_SERVICE_ID,
    //   import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    //   {
    //     to_email: userData.email,
    //     to_name: userData.fullname || userData.username,
    //     verification_link: `${window.location.origin}/verify-email?token=${response.data.verification_token}`
    //   },
    //   import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    // );
    
    return response.data;
  } catch (error) {
    console.error("Error during registration:", error);
    throw error.response?.data || error;
  }
};

/**
 * Login user
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.username - Username or email
 * @param {string} credentials.password - Password
 * @returns {Promise<Object>} Response with token and user data
 */
export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    
    // Save token and user data
    if (response.data.token) {
      setAuthToken(response.data.token);
      setUser(response.data.user);
    }
    
    return response.data;
  } catch (error) {
    console.error("Error during login:", error);
    throw error.response?.data || error;
  }
};

/**
 * Logout user
 * @returns {Promise<Object>} Logout response
 */
export const logout = async () => {
  try {
    const token = getAuthToken();
    if (token) {
      await axios.post(
        `${API_URL}/logout`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    }
  } catch (error) {
    console.error("Error during logout:", error);
  } finally {
    // Always clear local storage
    removeAuthToken();
    removeUser();
  }
};

/**
 * Get current user profile
 * @returns {Promise<Object>} User data
 */
export const getCurrentUser = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Update stored user data
    setUser(response.data);
    
    return response.data;
  } catch (error) {
    console.error("Error fetching current user:", error);
    // If token is invalid, clear storage
    if (error.response?.status === 401) {
      removeAuthToken();
      removeUser();
    }
    throw error.response?.data || error;
  }
};

/**
 * Update user profile
 * @param {Object} userData - User data to update (fullname, phone, domicilio, cuit)
 * @returns {Promise<Object>} Updated user data
 */
export const updateProfile = async (userData) => {
  try {
    const token = getAuthToken();
    const user = getUser();
    
    if (!token) {
      throw new Error("No authentication token found");
    }
    
    if (!user || !user.id) {
      throw new Error("User ID not found");
    }

    const response = await axios.put(`${API_URL}/users/${user.id}`, userData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Update stored user data
    setUser(response.data);
    
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error.response?.data || error;
  }
};

/**
 * Change user password
 * @param {Object} passwords - Current and new password
 * @param {string} passwords.current_password - Current password
 * @param {string} passwords.new_password - New password
 * @returns {Promise<Object>} Response message
 */
export const changePassword = async (passwords) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.post(`${API_URL}/change-password`, passwords, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    return response.data;
  } catch (error) {
    console.error("Error changing password:", error);
    throw error.response?.data || error;
  }
};

/**
 * Verify email with token
 * @param {string} token - Verification token from email
 * @returns {Promise<Object>} Verification response
 */
export const verifyEmail = async (token) => {
  try {
    const response = await axios.post(`${API_URL}/auth/verify-email`, { token });
    return response.data;
  } catch (error) {
    console.error("Error verifying email:", error);
    throw error.response?.data || error;
  }
};

/**
 * Resend verification email
 * @param {string} email - Email address
 * @returns {Promise<Object>} Response message
 */
export const resendVerification = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/resend-verification`, { email });
    
    // TODO: Send verification email using EmailJS
    // After backend generates new token, send email from frontend
    // See register() function above for EmailJS example
    
    return response.data;
  } catch (error) {
    console.error("Error resending verification:", error);
    throw error.response?.data || error;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has valid token
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};

/**
 * Check if current user is admin
 * @returns {boolean} True if user has admin role
 */
export const isAdmin = () => {
  const user = getUser();
  return user?.role === "admin";
};


/**
 * Get Google OAuth URL from backend
 * @returns {Promise<string>} OAuth URL to redirect user to Google login
 */
export const getGoogleOAuthUrl = async () => {
  try {
    const response = await axios.get(`${API_URL}/auth/google/login`);
    return response.data.oauth_url;
  } catch (error) {
    console.error("Error getting Google OAuth URL:", error);
    throw error.response?.data || error;
  }
};

