import { Check, Mail, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function EmailVerification() {
    const [, setLocation] = useLocation();
    const [status, setStatus] = useState("verifying"); // verifying, success, error, resend
    const [message, setMessage] = useState("");
    const [email, setEmail] = useState("");
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        // Get token from URL query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");

        if (token) {
            verifyEmail(token);
        } else {
            setStatus("error");
            setMessage("Token de verificación no encontrado en la URL");
        }
    }, []);

    const verifyEmail = async (token) => {
        try {
            const response = await fetch(`${API_URL}/auth/verify-email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus("success");
                setMessage(data.message || "Email verificado exitosamente");
                
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    setLocation("/login");
                }, 3000);
            } else {
                setStatus("error");
                setMessage(data.detail || "Error al verificar el email");
            }
        } catch (error) {
            setStatus("error");
            setMessage("Error de conexión con el servidor");
            console.error("Verification error:", error);
        }
    };

    const handleResendVerification = async () => {
        if (!email) {
            setMessage("Por favor ingrese su email");
            return;
        }

        setIsResending(true);
        try {
            const response = await fetch(`${API_URL}/auth/resend-verification`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || "Email de verificación enviado");
                setStatus("resend");
            } else {
                setMessage(data.detail || "Error al enviar el email");
            }
        } catch (error) {
            setMessage("Error de conexión con el servidor");
            console.error("Resend error:", error);
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-base-200">
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="card bg-base-100 shadow-2xl max-w-md w-full"
            >
                <div className="card-body p-8">
                    <AnimatePresence mode="wait">
                        {status === "verifying" && (
                            <motion.div
                                key="verifying"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center"
                            >
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2, duration: 0.6 }}
                                    className="flex justify-center mb-6"
                                >
                                    <div className="relative">
                                        <motion.div 
                                            animate={{ 
                                                scale: [1, 1.2, 1],
                                                opacity: [0.5, 0.2, 0.5]
                                            }}
                                            transition={{ 
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                            className="absolute inset-0 bg-primary/20 rounded-full"
                                        />
                                        <div className="relative bg-gradient-to-br from-primary to-secondary p-4 rounded-full">
                                            <Mail className="h-12 w-12 text-primary-content" />
                                        </div>
                                    </div>
                                </motion.div>

                                <h1 className="text-3xl font-light tracking-widest text-base-content mb-4">
                                    Verificando Email...
                                </h1>
                                <span className="loading loading-spinner loading-lg text-primary"></span>
                            </motion.div>
                        )}

                        {status === "success" && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center"
                            >
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                    className="flex justify-center mb-6"
                                >
                                    <div className="bg-success/20 p-4 rounded-full">
                                        <Check className="h-16 w-16 text-success" />
                                    </div>
                                </motion.div>

                                <h1 className="text-3xl font-light tracking-widest text-base-content mb-4">
                                    ¡Email Verificado!
                                </h1>
                                <p className="text-base-content/60 font-light tracking-wide mb-6">
                                    {message}
                                </p>
                                <p className="text-sm text-base-content/40 font-light">
                                    Redirigiendo al login en 3 segundos...
                                </p>
                            </motion.div>
                        )}

                        {status === "error" && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center"
                            >
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

                                <h1 className="text-3xl font-light tracking-widest text-base-content mb-4">
                                    Error de Verificación
                                </h1>
                                <p className="text-base-content/60 font-light tracking-wide mb-6">
                                    {message}
                                </p>

                                <div className="divider my-6">o</div>

                                <p className="text-base-content/60 font-light tracking-wide text-center mb-4">
                                    Ingrese su email para recibir un nuevo enlace de verificación
                                </p>

                                <div className="form-control mb-4">
                                    <input
                                        type="email"
                                        placeholder="ejemplo@correo.com"
                                        className="input input-bordered w-full"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                <motion.button 
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="btn btn-primary w-full mb-4"
                                    onClick={handleResendVerification}
                                    disabled={isResending}
                                >
                                    {isResending ? (
                                        <span className="loading loading-spinner loading-sm"></span>
                                    ) : (
                                        <>
                                            <Mail className="w-5 h-5" />
                                            Solicitar nuevo correo
                                        </>
                                    )}
                                </motion.button>

                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="btn btn-ghost w-full"
                                    onClick={() => setLocation("/login")}
                                >
                                    Volver al Login
                                </motion.button>
                            </motion.div>
                        )}

                        {status === "resend" && (
                            <motion.div
                                key="resend"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center"
                            >
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                    className="flex justify-center mb-6"
                                >
                                    <div className="bg-info/20 p-4 rounded-full">
                                        <Mail className="h-16 w-16 text-info" />
                                    </div>
                                </motion.div>

                                <h1 className="text-3xl font-light tracking-widest text-base-content mb-4">
                                    Email Enviado
                                </h1>
                                <p className="text-base-content/60 font-light tracking-wide mb-6">
                                    {message}
                                </p>
                                <p className="text-sm text-base-content/40 font-light mb-6">
                                    Por favor revise su bandeja de entrada y spam
                                </p>

                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="btn btn-primary w-full"
                                    onClick={() => setLocation("/login")}
                                >
                                    Ir al Login
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}