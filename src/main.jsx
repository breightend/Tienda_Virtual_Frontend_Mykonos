import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./App.css";
import Navbar from "./assets/Navbar.jsx";
import LandingPage from "./assets/principalComponents/LandingPage.jsx";
import StorePage from "./assets/principalComponents/StorePage.jsx";
import UserInfo from "./assets/principalComponents/UserInfo.jsx";
import Register from "./assets/principalComponents/Register.jsx";
import Login from "./assets/principalComponents/Login.jsx";
import ContactUs from "./assets/principalComponents/ContactUs.jsx";
import Carrito from "./assets/Carrito.jsx";
import { Route, Router, useLocation } from "wouter";
import { AuthProvider } from "./assets/context/AuthContext.jsx";
import { CartProvider } from "./assets/context/CartContext.jsx";
import MyPurchases from "./assets/principalComponents/MyPurchases.jsx";
import EmailVerification from "./assets/supportComponents/EmailVerification.jsx";
import OrderTracking from "./assets/principalComponents/OrderTracking.jsx";
import ProtectedRoute from "./assets/components/ProtectedRoute.jsx";
import AdminDashboard from "./assets/AdminComponents/AdminDashboard.jsx";
import AdminProductList from "./assets/AdminComponents/AdminProductList.jsx";
import AdminOrders from "./assets/AdminComponents/AdminOrders.jsx";
import AdminUsers from "./assets/AdminComponents/AdminUsers.jsx";
import AdminDiscounts from "./assets/AdminComponents/AdminDiscounts.jsx";
import { Toaster } from "react-hot-toast";
import CheckOut from "./assets/principalComponents/CheckOut.jsx";
import AdminNewProduct from "./assets/AdminComponents/AdminNewProduct.jsx";
import InitialLoader from "./assets/supportComponents/InitialLoader.jsx";
import { useState, useEffect } from "react";
import { fetchProducts } from "./assets/services/productService.js";
import { AnimatePresence } from "motion/react";

function App() {
  const [location] = useLocation();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const hideNavbar =
    location === "/email-verification" || location.startsWith("/admin");

  useEffect(() => {
    // Precargar datos iniciales
    const preloadData = async () => {
      try {
        // Simular carga mínima para mejor UX
        const minLoadTime = new Promise((resolve) => setTimeout(resolve, 2000));

        // Precargar productos de la tienda
        const productsPromise = fetchProducts().catch((err) => {
          console.error("Error precargando productos:", err);
          return [];
        });

        // Esperar ambas promesas
        await Promise.all([minLoadTime, productsPromise]);
      } catch (error) {
        console.error("Error en precarga:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    preloadData();
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {isInitialLoading && <InitialLoader key="loader" />}
      </AnimatePresence>

      {!isInitialLoading && (
        <>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#363636",
                color: "#fff",
              },
              success: {
                duration: 2000,
                iconTheme: {
                  primary: "#10b981",
                  secondary: "#fff",
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fff",
                },
              },
            }}
          />
          {!hideNavbar && <Navbar />}
          <div style={{ paddingTop: hideNavbar ? "0" : "64px" }}>
            <Route path="/" component={LandingPage} />
            <Route path="/store" component={StorePage} />
            <Route path="/user-info" component={UserInfo} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/carrito" component={Carrito} />
            <Route path="/contact-us" component={ContactUs} />
            <Route path="/my-purchases" component={MyPurchases} />
            <Route path="/email-verification" component={EmailVerification} />
            <Route path="/order-tracking/:orderId" component={OrderTracking} />
            <Route path="/checkout" component={CheckOut} />
            <Route path="'/newProducto" component={AdminNewProduct} />

            {/* Admin Routes */}
            <Route path="/admin">
              {() => <ProtectedRoute component={AdminDashboard} />}
            </Route>
            <Route path="/admin/products">
              {() => <ProtectedRoute component={AdminProductList} />}
            </Route>
            <Route path="/admin/orders">
              {() => <ProtectedRoute component={AdminOrders} />}
            </Route>
            <Route path="/admin/users">
              {() => <ProtectedRoute component={AdminUsers} />}
            </Route>
            <Route path="/admin/discounts">
              {() => <ProtectedRoute component={AdminDiscounts} />}
            </Route>
          </div>
        </>
      )}
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <Router>
          <App />
        </Router>
      </CartProvider>
    </AuthProvider>
  </StrictMode>
);
