import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./App.css";
import Navbar from "./assets/Navbar.jsx";
import LandingPage from "./assets/principalComponents/LandingPage.jsx";
import StorePage from "./assets/principalComponents/StorePage.jsx";
import UserInfo from "./assets/principalComponents/UserInfo.jsx";
import { Route, Router } from "wouter";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Navbar />
    <div style={{ paddingTop: "64px" }}>
      <Router>
        <Route path="/" component={LandingPage} />
        <Route path="/store" component={StorePage} />
        <Route path="/user-info" component={UserInfo} />
      </Router>
    </div>
  </StrictMode>
);
