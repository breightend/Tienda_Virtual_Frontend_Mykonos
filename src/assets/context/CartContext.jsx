import { createContext, useContext, useState, useEffect } from "react";
import {
  getCart,
  addToCart as addToCartAPI,
  updateCartItem,
  removeFromCart as removeFromCartAPI,
  clearCart as clearCartAPI,
} from "../services/cartService";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total_price, setTotalPrice] = useState(0);

  // Load cart when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const data = await getCart();
      setCart(data);
      setError(null);
    } catch (error) {
      console.error("Error loading cart:", error);
      // If cart doesn't exist, initialize empty cart
      if (error.status === 404) {
        setCart({ items: [], total_items: 0, subtotal: 0 });
      } else if (
        error.detail &&
        error.detail.includes("float() argument must be a string")
      ) {
        // Backend error due to invalid price data
        setError(
          "Tu carrito contiene productos con precios inválidos. Por favor elimina los productos problemáticos."
        );
        toast.error(
          "Algunos productos en tu carrito tienen precios no configurados. Contacta al administrador."
        );
        // Set a partial cart state so user can at least remove items
        setCart({ items: [], total_items: 0, subtotal: 0, hasError: true });
      } else {
        setError("Error al cargar el carrito");
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity, variantId) => {
    try {
      setLoading(true);
      await addToCartAPI(productId, quantity, variantId);
      await loadCart();
      setError(null);
      return { success: true };
    } catch (error) {
      console.error("Error adding to cart:", error);
      let errorMessage = "Error al agregar al carrito";

      // Extract error message from response
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail[0]?.msg || errorMessage;
        } else if (typeof error.response.data.detail === "string") {
          errorMessage = error.response.data.detail;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      setLoading(true);
      await updateCartItem(cartItemId, quantity);
      await loadCart();
      setError(null);
      return { success: true };
    } catch (error) {
      console.error("Error updating quantity:", error);
      setError(error.detail || "Error al actualizar cantidad");
      return {
        success: false,
        error: error.detail || "Error al actualizar cantidad",
      };
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      setLoading(true);
      await removeFromCartAPI(cartItemId);
      await loadCart();
      setError(null);
      return { success: true };
    } catch (error) {
      console.error("Error removing item:", error);
      setError(error.detail || "Error al eliminar producto");
      return {
        success: false,
        error: error.detail || "Error al eliminar producto",
      };
    } finally {
      setLoading(false);
    }
  };

  const clearCartItems = async () => {
    try {
      setLoading(true);
      await clearCartAPI();
      await loadCart();
      setError(null);
      return { success: true };
    } catch (error) {
      console.error("Error clearing cart:", error);
      setError(error.detail || "Error al vaciar el carrito");
      return {
        success: false,
        error: error.detail || "Error al vaciar el carrito",
      };
    } finally {
      setLoading(false);
    }
  };

  const getItemCount = () => {
    return cart?.total_items || 0;
  };

  const getTotalPrice = () => {
    return total_price;
  };

  const getSubtotal = () => {
    return cart?.subtotal || 0;
  };

  const value = {
    cart,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart: clearCartItems,
    refreshCart: loadCart,
    itemCount: getItemCount(),
    totalPrice: getTotalPrice(),
    subtotal: getSubtotal(),
    total_price: total_price,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
