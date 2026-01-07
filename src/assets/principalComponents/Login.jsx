import { motion } from "motion/react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeClosed } from "lucide-react";
import { getGoogleOAuthUrl } from "../services/authService";
import toast from "react-hot-toast";

export default function Login() {
  const [location, setLocation] = useLocation();
  const { login, isLoading, error, setError } = useAuth();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    setError(null);

    try {
      await login({ username, password });
      // Redirect to home on successful login
      setLocation("/");
    } catch (error) {
      setLoginError(error.detail || "Login failed. Please check your credentials.");
    }
  };

  const goToRegister = () => {
    setLocation("/register");
  };

  // Google OAuth login - redirect to Google
  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      
      // Get OAuth URL from backend
      const oauthUrl = await getGoogleOAuthUrl();
      
      // Redirect to Google login
      window.location.href = oauthUrl;
    } catch (error) {
      console.error("Error initiating Google login:", error);
      toast.error("Error al iniciar sesión con Google");
      setGoogleLoading(false);
    }
  };

  const handleWatchPassword = () => {
    setPasswordVisible(!passwordVisible);
  };
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Card de Login */}
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
                Acceso a su cuenta
              </p>
            </motion.div>

            {/* Error Alert */}
            {(loginError || error) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="alert alert-error mb-4"
              >
                <span className="text-sm">{loginError || error}</span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username/Email Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="form-control"
              >
                <label className="label">
                  <span className="label-text font-light tracking-wide text-base-content/80">
                    Usuario o Correo Electrónico
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="usuario o email@ejemplo.com"
                  className="input input-bordered w-full font-light bg-base-200 focus:outline-none focus:border-primary transition-colors"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </motion.div>

              {/* Password Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="form-control"
              >
                <label className="label">
                  <span className="label-text font-light tracking-wide text-base-content/80">
                    Contraseña
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    placeholder="••••••••"
                    className="input input-bordered w-full font-light bg-base-200 focus:outline-none focus:border-primary transition-colors pr-12"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                  <button 
                    type="button"
                    onClick={handleWatchPassword} 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/60 hover:text-primary transition-colors"
                  >
                    {passwordVisible ? <Eye size={20} /> : <EyeClosed size={20} />}
                  </button>
                </div>
                <label className="label">
                  <a
                    href="#"
                    className="label-text-alt link link-hover font-light text-base-content/60 hover:text-primary transition-colors"
                  >
                    ¿Olvidó su contraseña?
                  </a>
                </label>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
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
                    "INICIAR SESIÓN"
                  )}
                </motion.button>
              </motion.div>
            </form>

            {/* Divider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="divider font-light text-base-content/40 my-8"
            >
              O
            </motion.div>

            {/* Social Login */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
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
                    Continuar con Google
                  </>
                )}
              </button>
            </motion.div>

            {/* Register Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="text-center mt-8"
            >
              <p className="text-base-content/60 font-light">
                ¿No tiene una cuenta?{" "}
                <a
                  href="#"
                  onClick={goToRegister}
                  className="text-primary hover:underline font-light tracking-wide"
                >
                  Regístrese aquí
                </a>
              </p>
            </motion.div>
          </div>
        </div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="text-center text-base-content/40 text-sm font-light mt-8"
        >
          Al continuar, acepta nuestros términos de servicio y política de
          privacidad
        </motion.p>
      </motion.div>
    </div>
  );
}
