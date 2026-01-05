import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useAuth } from "../context/AuthContext";
import * as purchaseService from "../services/purchaseService";
import { motion } from "motion/react";
import {
  CreditCard,
  Building2,
  Wallet,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function PaymentConfirmation() {
  const [location, setLocation] = useLocation();
  const [match, params] = useRoute("/payment/:orderId");
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const [selectedMethod, setSelectedMethod] = useState("");
  const [paymentProof, setPaymentProof] = useState(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
      return;
    }

    if (!match || !params.orderId) {
      setLocation("/my-purchases");
      return;
    }

    loadOrder();
  }, [isAuthenticated, match, params]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await purchaseService.getPurchaseDetail(params.orderId);

      // Verificar que el pedido esté pendiente de pago
      if (data.status !== "Pendiente") {
        toast.error("Este pedido ya fue procesado");
        setTimeout(
          () => setLocation(`/order-tracking/${params.orderId}`),
          2000
        );
        return;
      }

      setOrder(data);
    } catch (err) {
      setError(err.detail || "Error al cargar el pedido");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        toast.error("Por favor selecciona una imagen válida");
        return;
      }

      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen no debe superar los 5MB");
        return;
      }

      // Convertir a base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProof(reader.result);
        setPaymentProofPreview(URL.createObjectURL(file));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedMethod) {
      toast.error("Por favor selecciona un método de pago");
      return;
    }

    if (selectedMethod === "transferencia" && !paymentProof) {
      toast.error("Por favor sube el comprobante de transferencia");
      return;
    }

    setProcessing(true);

    try {
      const paymentData = {
        payment_method: selectedMethod,
        notes: notes || undefined,
      };

      if (selectedMethod === "transferencia") {
        paymentData.payment_proof = paymentProof;
      }

      const result = await purchaseService.confirmPayment(
        params.orderId,
        paymentData
      );

      toast.success("¡Pago confirmado exitosamente!");

      // Redirigir a tracking
      setTimeout(() => {
        setLocation(`/order-tracking/${params.orderId}`);
      }, 1500);
    } catch (error) {
      console.error("Error confirming payment:", error);
      toast.error(
        error.detail ||
          "Error al confirmar el pago. Por favor intenta nuevamente."
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm("¿Estás seguro de que deseas cancelar este pedido?")) {
      return;
    }

    try {
      setProcessing(true);
      await purchaseService.cancelOrder(
        params.orderId,
        "Cancelado por el usuario"
      );
      toast.success("Pedido cancelado exitosamente");
      setTimeout(() => {
        setLocation("/my-purchases");
      }, 1500);
    } catch (error) {
      console.error("Error canceling order:", error);
      toast.error("Error al cancelar el pedido");
    } finally {
      setProcessing(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-base-100 shadow-xl max-w-md w-full"
        >
          <div className="card-body text-center">
            <AlertCircle className="mx-auto text-error" size={48} />
            <h2 className="card-title justify-center text-2xl font-light">
              Error
            </h2>
            <p className="text-base-content/60 font-light">
              {error || "No se pudo cargar el pedido"}
            </p>
            <button
              className="btn btn-primary mt-4"
              onClick={() => setLocation("/my-purchases")}
            >
              Volver a Mis Compras
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-light tracking-widest text-base-content mb-2">
            CONFIRMAR PAGO
          </h1>
          <div className="w-16 h-px bg-primary mb-4"></div>
          <p className="text-base-content/60 font-light">
            Orden #{order.id} • {formatPrice(order.total)}
          </p>
        </motion.div>

        {/* Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="alert alert-warning mb-6"
        >
          <Clock size={24} />
          <div>
            <h3 className="font-bold">Pedido Pendiente de Pago</h3>
            <div className="text-xs">
              Por favor confirma tu pago para que procesemos tu pedido. Tu
              reserva de stock expira en 30 minutos.
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card bg-base-100 shadow-xl"
            >
              <div className="card-body">
                <h2 className="text-2xl font-light mb-6">Método de Pago</h2>

                {/* Payment Options */}
                <div className="space-y-4">
                  {/* MercadoPago */}
                  <label
                    className={`label cursor-pointer justify-start gap-4 p-4 border rounded-lg hover:bg-base-200 transition-colors ${
                      selectedMethod === "mercadopago"
                        ? "border-primary bg-primary/5"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      className="radio radio-primary"
                      checked={selectedMethod === "mercadopago"}
                      onChange={() => setSelectedMethod("mercadopago")}
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <CreditCard className="text-primary" size={24} />
                      <div className="flex-1">
                        <span className="label-text font-semibold block">
                          MercadoPago
                        </span>
                        <p className="text-xs text-base-content/60">
                          Paga con tarjeta de crédito, débito o dinero en cuenta
                        </p>
                      </div>
                      <span className="badge badge-success badge-sm">
                        Instantáneo
                      </span>
                    </div>
                  </label>

                  {/* Transferencia */}
                  <label
                    className={`label cursor-pointer justify-start gap-4 p-4 border rounded-lg hover:bg-base-200 transition-colors ${
                      selectedMethod === "transferencia"
                        ? "border-primary bg-primary/5"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      className="radio radio-primary"
                      checked={selectedMethod === "transferencia"}
                      onChange={() => setSelectedMethod("transferencia")}
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <Building2 className="text-primary" size={24} />
                      <div className="flex-1">
                        <span className="label-text font-semibold block">
                          Transferencia Bancaria
                        </span>
                        <p className="text-xs text-base-content/60">
                          Realiza una transferencia y sube el comprobante
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* Efectivo */}
                  {order.delivery_type === "retiro" && (
                    <label
                      className={`label cursor-pointer justify-start gap-4 p-4 border rounded-lg hover:bg-base-200 transition-colors ${
                        selectedMethod === "efectivo"
                          ? "border-primary bg-primary/5"
                          : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        className="radio radio-primary"
                        checked={selectedMethod === "efectivo"}
                        onChange={() => setSelectedMethod("efectivo")}
                      />
                      <div className="flex items-center gap-3 flex-1">
                        <Wallet className="text-primary" size={24} />
                        <div className="flex-1">
                          <span className="label-text font-semibold block">
                            Efectivo al Retirar
                          </span>
                          <p className="text-xs text-base-content/60">
                            Paga en efectivo al retirar en sucursal
                          </p>
                        </div>
                      </div>
                    </label>
                  )}
                </div>

                {/* Transferencia Details */}
                {selectedMethod === "transferencia" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 bg-base-200 p-4 rounded-lg space-y-4"
                  >
                    <h3 className="font-semibold mb-3">Datos Bancarios</h3>

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-semibold">Banco:</span> Banco
                        Provincia
                      </div>
                      <div>
                        <span className="font-semibold">CBU:</span>{" "}
                        0140999903000123456789
                      </div>
                      <div>
                        <span className="font-semibold">Alias:</span>{" "}
                        MYKONOS.BOUTIQUE
                      </div>
                      <div>
                        <span className="font-semibold">CUIT:</span>{" "}
                        20-12345678-9
                      </div>
                      <div>
                        <span className="font-semibold">Titular:</span> Mykonos
                        Boutique S.A.
                      </div>
                    </div>

                    {/* Upload Proof */}
                    <div className="form-control mt-4">
                      <label className="label">
                        <span className="label-text font-semibold">
                          Comprobante de Transferencia *
                        </span>
                      </label>

                      {!paymentProofPreview ? (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-base-300 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload
                              className="mb-2 text-base-content/60"
                              size={32}
                            />
                            <p className="text-xs text-base-content/60">
                              Click para subir imagen del comprobante
                            </p>
                            <p className="text-xs text-base-content/40">
                              PNG, JPG (MAX. 5MB)
                            </p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                        </label>
                      ) : (
                        <div className="relative">
                          <img
                            src={paymentProofPreview}
                            alt="Comprobante"
                            className="w-full h-48 object-contain bg-base-300 rounded-lg"
                          />
                          <button
                            onClick={() => {
                              setPaymentProof(null);
                              setPaymentProofPreview(null);
                            }}
                            className="btn btn-sm btn-circle btn-error absolute top-2 right-2"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* MercadoPago Details */}
                {selectedMethod === "mercadopago" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 bg-base-200 p-4 rounded-lg"
                  >
                    <p className="text-sm text-base-content/60 mb-4">
                      Serás redirigido a MercadoPago para completar el pago de
                      forma segura.
                    </p>
                    <div className="alert alert-info">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="stroke-current shrink-0 w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      <span className="text-xs">
                        MercadoPago procesará tu pago automáticamente y
                        confirmaremos tu pedido.
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Efectivo Details */}
                {selectedMethod === "efectivo" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 bg-base-200 p-4 rounded-lg"
                  >
                    <p className="text-sm text-base-content/60 mb-2">
                      Tu pedido quedará reservado. Paga en efectivo al momento
                      de retirar en sucursal.
                    </p>
                    <div className="alert alert-warning mt-3">
                      <Clock size={20} />
                      <span className="text-xs">
                        Recuerda traer el monto exacto:{" "}
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Notes */}
                <div className="form-control mt-6">
                  <label className="label">
                    <span className="label-text">Notas adicionales</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered"
                    placeholder="Información adicional sobre tu pago..."
                    rows="2"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  ></textarea>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                  <button
                    onClick={handleCancelOrder}
                    className="btn btn-ghost flex-1"
                    disabled={processing}
                  >
                    Cancelar Pedido
                  </button>
                  <button
                    onClick={handleConfirmPayment}
                    className="btn btn-primary flex-1 gap-2"
                    disabled={processing || !selectedMethod}
                  >
                    {processing ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        Confirmar Pago
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card bg-base-100 shadow-xl sticky top-20"
            >
              <div className="card-body">
                <h2 className="card-title text-xl font-light">
                  Resumen del Pedido
                </h2>
                <div className="divider my-2"></div>

                {/* Items */}
                <div className="space-y-2 mb-4">
                  {order.items?.map((item, index) => (
                    <div key={index} className="text-sm">
                      <div className="font-medium">{item.product_name}</div>
                      <div className="text-base-content/60">
                        {item.quantity} x {formatPrice(item.unit_price)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="divider my-2"></div>

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-base-content/60">Subtotal</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  {order.shipping_cost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-base-content/60">Envío</span>
                      <span>{formatPrice(order.shipping_cost)}</span>
                    </div>
                  )}
                  <div className="divider my-2"></div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="mt-4 p-3 bg-base-200 rounded-lg">
                  <p className="text-xs font-semibold mb-1">
                    {order.delivery_type === "envio"
                      ? "📦 Envío a:"
                      : "🏪 Retiro en:"}
                  </p>
                  <p className="text-xs text-base-content/60">
                    {order.shipping_address}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
