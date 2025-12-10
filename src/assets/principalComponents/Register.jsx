import { motion } from "motion/react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegisterError("");
    setError(null);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setRegisterError("Las contraseñas no coinciden");
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setRegisterError("La contraseña debe tener al menos 6 caracteres");
      return;
    }


    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      
      setShowSuccess(true);
      
      // Backend now handles sending verification email
      
      setTimeout(() => {
        setLocation("/");
      }, 3000);
    } catch (error) {
      setRegisterError(error.detail || "Registration failed. Please try again.");
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

  // TODO: Implement Google OAuth registration
  const handleGoogleRegister = () => {
    // When Google OAuth is configured, implement this function
    // See GOOGLE_OAUTH_SETUP.md for instructions
    alert("Google registration will be available soon!");
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card bg-base-100 shadow-2xl max-w-md w-full"
        >
          <div className="card-body text-center p-8">
            <div className="text-success text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-light tracking-wide mb-4">
              ¡Registro Exitoso!
            </h2>
            <p className="text-base-content/60 font-light mb-6">
              Por favor, revisa tu correo electrónico para verificar tu cuenta.
            </p>
            <p className="text-sm text-base-content/40 font-light">
              Serás redirigido en unos segundos...
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

            {/* Form */}
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
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  className="input input-bordered w-full font-light bg-base-200 focus:outline-none focus:border-primary transition-colors"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  minLength={6}
                />
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
                onClick={handleGoogleRegister}
                className="btn btn-outline w-full font-light tracking-wide hover:bg-base-200 transition-colors"
                type="button"
              >
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
