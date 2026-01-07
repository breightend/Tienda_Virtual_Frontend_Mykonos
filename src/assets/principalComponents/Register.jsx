import { motion } from "motion/react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, Mail, CheckCircle, RefreshCw } from "lucide-react";
import { getGoogleOAuthUrl } from "../services/authService";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Register() {
  const [location, setLocation] = useLocation();
  const { register, isLoading, error, setError } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [registerError, setRegisterError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegisterError("");
    setError(null);

    
    if (formData.password !== formData.confirmPassword) {
      setRegisterError("Las contraseñas no coinciden");
      return;
    }

    
    if (formData.password.length < 6) {
      setRegisterError("La contraseña debe tener al menos 6 caracteres");
      return;
    }


    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      
      setRegisteredEmail(formData.email);
      setShowSuccess(true);
    } catch (error) {
      setRegisterError(error.detail || "Registration failed. Please try again.");
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendMessage("");
    
    try {
      const response = await fetch(`${API_URL}/auth/resend-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: registeredEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setResendMessage("✓ Email de verificación enviado exitosamente");
      } else {
        setResendMessage("✗ " + (data.detail || "Error al enviar el email"));
      }
    } catch (error) {
      setResendMessage("✗ Error de conexión con el servidor");
      console.error("Resend error:", error);
    } finally {
      setIsResending(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const goToLogin = () => {
    setLocation("/login");
  };

  // Google OAuth registration - redirect to Google
  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      setRegisterError("");
      
      // Get OAuth URL from backend
      const oauthUrl = await getGoogleOAuthUrl();
      
      // Redirect to Google login
      window.location.href = oauthUrl;
    } catch (error) {
      console.error("Error initiating Google registration:", error);
      toast.error("Error al registrarse con Google");
      setGoogleLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card bg-base-100 shadow-2xl max-w-lg w-full"
        >
          <div className="card-body text-center p-8">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="flex justify-center mb-6"
            >
              <div className="bg-success/20 p-4 rounded-full">
                <CheckCircle className="h-16 w-16 text-success" />
              </div>
            </motion.div>

            {/* Title */}
            <h2 className="text-3xl font-light tracking-wide mb-4">
              ¡Cuenta Creada!
            </h2>

            {/* Email Icon and Message */}
            <div className="bg-info/10 border border-info/20 rounded-lg p-6 mb-6">
              <Mail className="h-12 w-12 text-info mx-auto mb-4" />
              <p className="text-base-content/80 font-light mb-2">
                Hemos enviado un correo de verificación a:
              </p>
              <p className="text-lg font-medium text-primary mb-4">
                {registeredEmail}
              </p>
              <p className="text-sm text-base-content/60 font-light">
                Por favor, revisa tu bandeja de entrada y{" "}
                <span className="font-semibold">carpeta de spam</span> y haz clic en el
                enlace de verificación para activar tu cuenta.
              </p>
            </div>

            {/* Resend Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn btn-outline btn-info w-full mb-3"
              onClick={handleResendVerification}
              disabled={isResending}
            >
              {isResending ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Reenviar Email de Verificación
                </>
              )}
            </motion.button>

            {/* Resend Message */}
            {resendMessage && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-sm mb-4 ${
                  resendMessage.startsWith("✓") 
                    ? "text-success" 
                    : resendMessage.startsWith("⚠️")
                    ? "text-warning"
                    : "text-error"
                }`}
              >
                {resendMessage}
              </motion.p>
            )}

            {/* Go to Login Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn btn-primary w-full"
              onClick={() => setLocation("/login")}
            >
              Ir al Login
            </motion.button>

            {/* Note */}
            <p className="text-xs text-base-content/40 font-light mt-6">
              Nota: Debes verificar tu email antes de poder iniciar sesión
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Card de Registro */}
        <div className="card bg-base-100 shadow-2xl">
          <div className="card-body p-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl font-light tracking-widest text-base-content mb-2">
                MYKONOS
              </h1>
              <div className="w-12 h-px bg-primary mx-auto mb-4"></div>
              <p className="text-base-content/60 font-light tracking-wide">
                Crear nueva cuenta
              </p>
            </motion.div>

            {/* Error Alert */}
            {(registerError || error) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="alert alert-error mb-4"
              >
                <span className="text-sm">{registerError || error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="form-control"
              >
                <label className="label">
                  <span className="label-text font-light tracking-wide text-base-content/80">
                    Nombre de Usuario
                  </span>
                </label>
                <input
                  type="text"
                  name="username"
                  placeholder="usuario123"
                  className="input input-bordered w-full font-light bg-base-200 focus:outline-none focus:border-primary transition-colors"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  minLength={3}
                  maxLength={50}
                />
              </motion.div>

              {/* Full Name Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35, duration: 0.6 }}
                className="form-control"
              >
                <label className="label">
                  <span className="label-text font-light tracking-wide text-base-content/80">
                    Nombre Completo (Opcional)
                  </span>
                </label>
                <input
                  type="text"
                  name="fullname"
                  placeholder="Juan Pérez"
                  className="input input-bordered w-full font-light bg-base-200 focus:outline-none focus:border-primary transition-colors"
                  value={formData.fullname}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </motion.div>

              {/* Email Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="form-control"
              >
                <label className="label">
                  <span className="label-text font-light tracking-wide text-base-content/80">
                    Correo Electrónico
                  </span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="ejemplo@correo.com"
                  className="input input-bordered w-full font-light bg-base-200 focus:outline-none focus:border-primary transition-colors"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </motion.div>

              {/* Password Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="form-control"
              >
                <label className="label">
                  <span className="label-text font-light tracking-wide text-base-content/80">
                    Contraseña
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    className="input input-bordered w-full font-light bg-base-200 focus:outline-none focus:border-primary transition-colors pr-12"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                  <button 
                    className="btn btn-ghost btn-circle btn-xs absolute right-2 top-1/2 -translate-y-1/2" 
                    type="button" 
                    onClick={togglePassword}
                  >
                    {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
                <label className="label">
                  <span className="label-text-alt text-base-content/60 font-light">
                    Mínimo 6 caracteres
                  </span>
                </label>
              </motion.div>

              {/* Confirm Password Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="form-control"
              >
                <label className="label">
                  <span className="label-text font-light tracking-wide text-base-content/80">
                    Confirmar Contraseña
                  </span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  className="input input-bordered w-full font-light bg-base-200 focus:outline-none focus:border-primary transition-colors"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="form-control mt-8"
              >
                <motion.button
                  type="submit"
                  className="btn btn-primary w-full font-light tracking-widest"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "CREAR CUENTA"
                  )}
                </motion.button>
              </motion.div>
            </form>

            {/* Divider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="divider font-light text-base-content/40 my-8"
            >
              O
            </motion.div>

            {/* Social Register */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="space-y-3"
            >
              <button
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="btn btn-outline w-full font-light tracking-wide hover:bg-base-200 transition-colors"
                type="button"
              >
                {googleLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Registrarse con Google
                  </>
                )}
              </button>
            </motion.div>

            {/* Login Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="text-center mt-8"
            >
              <p className="text-base-content/60 font-light">
                ¿Ya tiene una cuenta?{" "}
                <a
                  href="#"
                  onClick={goToLogin}
                  className="text-primary hover:underline font-light tracking-wide"
                >
                  Inicie sesión aquí
                </a>
              </p>
            </motion.div>
          </div>
        </div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="text-center text-base-content/40 text-sm font-light mt-8"
        >
          Al crear una cuenta, acepta nuestros términos de servicio y política
          de privacidad
        </motion.p>
      </motion.div>
    </div>
  );
}
