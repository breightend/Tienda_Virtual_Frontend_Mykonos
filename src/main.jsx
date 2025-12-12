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
import MyPurchases from "./assets/principalComponents/MyPurchases.jsx";
import EmailVerification from "./assets/supportComponents/EmailVerification.jsx";
import OrderTracking from "./assets/principalComponents/OrderTracking.jsx";
import ProtectedRoute from "./assets/components/ProtectedRoute.jsx";
import AdminDashboard from "./assets/principalComponents/AdminDashboard.jsx";
import AdminProductList from "./assets/principalComponents/AdminProductList.jsx";
import AdminOrders from "./assets/principalComponents/AdminOrders.jsx";
import AdminUsers from "./assets/principalComponents/AdminUsers.jsx";
import AdminDiscounts from "./assets/principalComponents/AdminDiscounts.jsx";

function App() {
  const [location] = useLocation();
  const hideNavbar = location === "/email-verification" || location.startsWith("/admin");

  return (
    <>
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
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <Router>
        <App />
      </Router>
    </AuthProvider>
  </StrictMode>
);
