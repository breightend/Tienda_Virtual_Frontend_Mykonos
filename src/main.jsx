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
import { Route, Router } from "wouter";
import { AuthProvider } from "./assets/context/AuthContext.jsx";
import MyPurchases from "./assets/principalComponents/MyPurchases.jsx";
import EmailVerification from "./assets/supportComponents/EmailVerification.jsx";
import OrderTracking from "./assets/principalComponents/OrderTracking.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <Navbar />
      <div style={{ paddingTop: "64px" }}>
        <Router>
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
        </Router>
      </div>
    </AuthProvider>
  </StrictMode>
);
