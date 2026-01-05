import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * MercadoPago Button Component
 * Requires MercadoPago SDK to be loaded
 * Add to index.html: <script src="https://sdk.mercadopago.com/js/v2"></script>
 */
export default function MercadoPagoButton({
  orderId,
  amount,
  description,
  onSuccess,
  onError,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mp, setMp] = useState(null);

  useEffect(() => {
    // Check if MercadoPago SDK is loaded
    if (typeof window.MercadoPago === "undefined") {
      setError("MercadoPago SDK no está cargado");
      setLoading(false);
      return;
    }

    // Initialize MercadoPago
    // TODO: Replace with your actual public key from environment variable
    const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;

    if (!publicKey) {
      setError("Clave pública de MercadoPago no configurada");
      setLoading(false);
      return;
    }

    try {
      const mercadopago = new window.MercadoPago(publicKey);
      setMp(mercadopago);
      setLoading(false);
    } catch (err) {
      console.error("Error initializing MercadoPago:", err);
      setError("Error al inicializar MercadoPago");
      setLoading(false);
    }
  }, []);

  const handlePayment = async () => {
    if (!mp) {
      setError("MercadoPago no está inicializado");
      return;
    }

    setLoading(true);

    try {
      // TODO: Call your backend to create a preference
      // This endpoint should be created in your backend
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/payments/create-preference`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            order_id: orderId,
            amount: amount,
            description: description,
          }),
        }
      );

      const { preference_id } = await response.json();

      // Redirect to MercadoPago checkout
      mp.checkout({
        preference: {
          id: preference_id,
        },
        autoOpen: true,
      });

      // Optional: Handle success callback
      if (onSuccess) {
        onSuccess(preference_id);
      }
    } catch (err) {
      console.error("Error creating payment:", err);
      setError("Error al procesar el pago");
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="alert alert-error">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="btn btn-primary w-full gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" size={18} />
          Cargando...
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            className="w-5 h-5 fill-current"
          >
            <path d="M201.3 103.4c-9.4-9.4-24.6-9.4-33.9 0L95 175.7c-9.4 9.4-9.4 24.6 0 33.9l72.4 72.4c9.4 9.4 24.6 9.4 33.9 0l72.4-72.4c9.4-9.4 9.4-24.6 0-33.9l-72.4-72.3zM360 271.7c-9.4-9.4-24.6-9.4-33.9 0l-72.4 72.4c-9.4 9.4-9.4 24.6 0 33.9l72.4 72.4c9.4 9.4 24.6 9.4 33.9 0l72.4-72.4c9.4-9.4 9.4-24.6 0-33.9L360 271.7z" />
          </svg>
          Pagar con MercadoPago
        </>
      )}
    </button>
  );
}
