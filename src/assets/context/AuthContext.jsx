/**
 * Authentication Context
 * Provides global authentication state and functions
 */

import { createContext, useContext, useState, useEffect } from "react";
import * as authService from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = authService.getAuthToken();
        const storedUser = authService.getUser();

        if (token && storedUser) {
          // Verify token is still valid by fetching current user
          try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
            setIsAuthenticated(true);
          } catch (error) {
            // Token is invalid, clear storage
            authService.removeAuthToken();
            authService.removeUser();
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Register new user
   */
  const register = async (userData) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await authService.register(userData);
      
      setUser(response.user);
      setIsAuthenticated(true);
      
      return response;
    } catch (error) {
      setError(error.detail || "Registration failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login user
   */
  const login = async (credentials) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await authService.login(credentials);
      
      setUser(response.user);
      setIsAuthenticated(true);
      
      return response;
    } catch (error) {
      setError(error.detail || "Login failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  /**
   * Update user profile
   */
  const updateUser = async (userData) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const updatedUser = await authService.updateProfile(userData);
      setUser(updatedUser);
      
      return updatedUser;
    } catch (error) {
      setError(error.detail || "Update failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Verify email with token
   */
  const verifyEmail = async (token) => {
    try {
      setError(null);
      const response = await authService.verifyEmail(token);
      
      // Update user's email_verified status
      if (user) {
        setUser({ ...user, email_verified: true });
      }
      
      return response;
    } catch (error) {
      setError(error.detail || "Email verification failed");
      throw error;
    }
  };

  /**
   * Resend verification email
   */
  const resendVerification = async (email) => {
    try {
      setError(null);
      return await authService.resendVerification(email);
    } catch (error) {
      setError(error.detail || "Failed to resend verification");
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    register,
    login,
    logout,
    updateUser,
    verifyEmail,
    resendVerification,
    setError, // Allow components to clear errors
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
