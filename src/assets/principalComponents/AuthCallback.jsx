import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { setAuthToken, getCurrentUser } from "../services/authService";
import toast from "react-hot-toast";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function AuthCallback() {
  const [location, setLocation] = useLocation();
  const { setUser } = useAuth();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      // Get URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      const error = urlParams.get("error");

      if (error) {
        setStatus("error");
        setErrorMessage(
          error === "authentication_failed"
            ? "No se pudo completar la autenticación con Google"
            : "Error en la autenticación"
        );
        toast.error("Error al autenticar con Google");
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          setLocation("/login");
        }, 3000);
        return;
      }

      if (token) {
        try {
          // Save token to localStorage
          setAuthToken(token);

          // Get user data from backend
          const userData = await getCurrentUser();
          
          // Update auth context
          setUser(userData);

          setStatus("success");
          toast.success("¡Autenticación exitosa!");

          // Redirect to home after 1.5 seconds
          setTimeout(() => {
            setLocation("/");
          }, 1500);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setStatus("error");
          setErrorMessage("Error al obtener datos del usuario");
          toast.error("Error al completar la autenticación");
          
          setTimeout(() => {
            setLocation("/login");
          }, 3000);
        }
      } else {
        // No token and no error - shouldn't happen
        setStatus("error");
        setErrorMessage("Parámetros de callback inválidos");
        setTimeout(() => {
          setLocation("/login");
        }, 3000);
      }
    };

    handleCallback();
  }, [setUser, setLocation]);

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card bg-base-100 shadow-2xl max-w-md w-full"
      >
        <div className="card-body text-center p-8">
          {status === "loading" && (
            <>
              <div className="flex justify-center mb-6">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
              <h2 className="text-2xl font-light tracking-wide mb-2">
                Completando autenticación...
              </h2>
              <p className="text-base-content/60 font-light">
                Por favor espera un momento
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="flex justify-center mb-6"
              >
                <div className="bg-success/20 p-4 rounded-full">
                  <CheckCircle className="h-16 w-16 text-success" />
                </div>
              </motion.div>
              <h2 className="text-2xl font-light tracking-wide mb-2">
                ¡Autenticación Exitosa!
              </h2>
              <p className="text-base-content/60 font-light">
                Redirigiendo a la página principal...
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="flex justify-center mb-6"
              >
                <div className="bg-error/20 p-4 rounded-full">
                  <AlertCircle className="h-16 w-16 text-error" />
                </div>
              </motion.div>
              <h2 className="text-2xl font-light tracking-wide mb-2">
                Error de Autenticación
              </h2>
              <p className="text-base-content/60 font-light mb-4">
                {errorMessage}
              </p>
              <p className="text-sm text-base-content/40 font-light">
                Redirigiendo al login...
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
