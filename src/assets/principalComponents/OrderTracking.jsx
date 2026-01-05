import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useAuth } from "../context/AuthContext";
import * as purchaseService from "../services/purchaseService";

export default function OrderTracking() {
  const [location, setLocation] = useLocation();
  const [match, params] = useRoute("/order-tracking/:orderId");
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
      return;
    }

    if (!match || !params.orderId) {
      setLocation("/my-purchases");
      return;
    }

    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        const data = await purchaseService.getPurchaseDetail(params.orderId);
        setOrder(data);
      } catch (err) {
        setError(err.detail || "Error al cargar el pedido");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [isAuthenticated, match, params, setLocation]);

  const formatDate = (dateString) => {
    if (!dateString) return "Pendiente";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price);
  };

  const getTrackingSteps = () => {
    const status = order?.shipping_status || "pendiente";

    // If we have detailed tracking history, use that
    if (order?.tracking_history && order.tracking_history.length > 0) {
      return order.tracking_history.map((history, index) => ({
        id: history.id,
        title: getStatusTitle(history.status),
        description: history.description || "Actualización de estado",
        location: history.location,
        timestamp: history.created_at,
        changedBy: history.changed_by,
        icon: getIconForStatus(history.status),
        completed: true,
        active: index === order.tracking_history.length - 1,
      }));
    }

    // Fallback to default steps if no tracking history
    const steps = [
      {
        id: 1,
        title: "Pedido Recibido",
        description: "Tu pedido ha sido recibido y está siendo procesado",
        icon: "📝",
        status: "pendiente",
      },
      {
        id: 2,
        title: "Preparando Pedido",
        description: "Estamos preparando tu pedido",
        icon: "📦",
        status: "preparando",
      },
      {
        id: 3,
        title:
          order?.delivery_type === "envio" ? "Despachado" : "Listo para Retiro",
        description:
          order?.delivery_type === "envio"
            ? "Tu pedido ha sido despachado"
            : "Tu pedido está listo para retiro en sucursal",
        icon: order?.delivery_type === "envio" ? "🚚" : "🏪",
        status: "despachado",
      },
    ];

    // Add "en_transito" step only for shipments
    if (order?.delivery_type === "envio") {
      steps.push({
        id: 4,
        title: "En Tránsito",
        description: "Tu pedido está en camino",
        icon: "🛣️",
        status: "en_transito",
      });
    }

    // Add final step
    steps.push({
      id: steps.length + 1,
      title: order?.delivery_type === "envio" ? "Entregado" : "Retirado",
      description:
        order?.delivery_type === "envio"
          ? "Tu pedido ha sido entregado"
          : "Has retirado tu pedido",
      icon: "✅",
      status: "entregado",
    });

    // Determine which steps are completed
    const statusOrder = [
      "pendiente",
      "preparando",
      "despachado",
      "en_transito",
      "entregado",
    ];
    const currentIndex = statusOrder.indexOf(status);

    return steps.map((step, index) => ({
      ...step,
      completed: statusOrder.indexOf(step.status) <= currentIndex,
      active: step.status === status,
    }));
  };

  const getStatusTitle = (status) => {
    const statusTitles = {
      pendiente: "Pedido Recibido",
      preparando: "Preparando Pedido",
      despachado: "Despachado",
      en_transito: "En Tránsito",
      entregado: "Entregado",
      cancelado: "Cancelado",
    };
    return statusTitles[status.toLowerCase()] || status;
  };

  const getIconForStatus = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("pendiente")) return "📝";
    if (
      statusLower.includes("preparando") ||
      statusLower.includes("empaquetado") ||
      statusLower.includes("empacado")
    )
      return "📦";
    if (statusLower.includes("despachado")) return "🚀";
    if (
      statusLower.includes("enviado") ||
      statusLower.includes("camino") ||
      statusLower.includes("transito")
    )
      return "🚚";
    if (statusLower.includes("listo") || statusLower.includes("retiro"))
      return "🏪";
    if (
      statusLower.includes("entregado") ||
      statusLower.includes("retirado") ||
      statusLower.includes("completado")
    )
      return "✅";
    if (statusLower.includes("cancelado")) return "❌";
    return "📍";
  };

  if (isLoading) {
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
            <div className="text-error text-5xl mb-4">⚠️</div>
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

  const trackingSteps = getTrackingSteps();
  const hasDetailedHistory =
    order?.tracking_history && order.tracking_history.length > 0;

  return (
    <div className="min-h-screen bg-base-200 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => setLocation("/my-purchases")}
            className="btn btn-ghost btn-sm mb-4"
          >
            ← Volver a Mis Compras
          </button>
          <h1 className="text-4xl font-light tracking-widest text-base-content mb-2">
            SEGUIMIENTO DE PEDIDO
          </h1>
          <div className="w-16 h-px bg-primary mb-4"></div>
          <p className="text-base-content/60 font-light">
            Orden #{order.id} • {formatDate(order.sale_date)}
          </p>
        </motion.div>

        {/* Tracking Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card bg-base-100 shadow-xl mb-6"
        >
          <div className="card-body">
            <h2 className="text-2xl font-light tracking-wide mb-6">
              {hasDetailedHistory ? "Historial Detallado" : "Estado del Pedido"}
            </h2>

            {/* Timeline */}
            <div className="relative">
              {trackingSteps.map((step, index) => (
                <div key={step.id} className="flex gap-4 mb-8 last:mb-0">
                  {/* Icon and Line */}
                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
                        step.completed
                          ? "bg-primary text-primary-content"
                          : "bg-base-300 text-base-content/40"
                      } ${
                        step.active ? "ring-4 ring-primary ring-opacity-30" : ""
                      }`}
                    >
                      {step.icon}
                    </motion.div>
                    {index < trackingSteps.length - 1 && (
                      <div
                        className={`w-1 flex-1 mt-2 ${
                          step.completed ? "bg-primary" : "bg-base-300"
                        }`}
                        style={{ minHeight: "40px" }}
                      ></div>
                    )}
                  </div>

                  {/* Content */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex-1 pb-4"
                  >
                    <h3
                      className={`text-lg font-light ${
                        step.completed
                          ? "text-base-content"
                          : "text-base-content/40"
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p
                      className={`text-sm font-light ${
                        step.completed
                          ? "text-base-content/60"
                          : "text-base-content/30"
                      }`}
                    >
                      {step.description}
                    </p>

                    {/* Additional details for tracking history */}
                    {hasDetailedHistory && (
                      <>
                        {step.location && (
                          <p className="text-xs text-base-content/50 font-light mt-1">
                            📍 {step.location}
                          </p>
                        )}
                        {step.timestamp && (
                          <p className="text-xs text-base-content/50 font-light mt-1">
                            🕐 {formatDate(step.timestamp)}
                          </p>
                        )}
                        {step.changedBy && (
                          <p className="text-xs text-base-content/50 font-light mt-1">
                            👤 Actualizado por: {step.changedBy}
                          </p>
                        )}
                      </>
                    )}

                    {step.active && !hasDetailedHistory && (
                      <span className="badge badge-primary badge-sm mt-2">
                        Estado Actual
                      </span>
                    )}
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Shipping Info */}
        {order.shipping_address && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card bg-base-100 shadow-xl mb-6"
          >
            <div className="card-body">
              <h2 className="text-xl font-light tracking-wide mb-4">
                Información de Envío
              </h2>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-base-content/60 font-light">
                    Dirección de Entrega:
                  </p>
                  <p className="font-light">{order.shipping_address}</p>
                </div>
                {order.shipping_cost > 0 && (
                  <div>
                    <p className="text-sm text-base-content/60 font-light">
                      Costo de Envío:
                    </p>
                    <p className="font-light">
                      {formatPrice(order.shipping_cost)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card bg-base-100 shadow-xl mb-6"
        >
          <div className="card-body">
            <h2 className="text-xl font-light tracking-wide mb-4">Productos</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 bg-base-200 rounded-lg"
                >
                  <div className="w-20 h-20 flex-shrink-0">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full bg-base-300 rounded flex items-center justify-center">
                        <span className="text-2xl">📦</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-light">{item.product_name}</h4>
                    <div className="flex gap-2 text-sm text-base-content/60 font-light mt-1">
                      {item.size_name && <span>Talle: {item.size_name}</span>}
                      {item.color_name && (
                        <span>• Color: {item.color_name}</span>
                      )}
                    </div>
                    <p className="text-sm text-base-content/60 font-light mt-1">
                      Cantidad: {item.quantity}
                    </p>
                    {item.variant_barcode && (
                      <p className="text-xs text-base-content/40 font-mono font-light mt-1">
                        Código: {item.variant_barcode}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-light">{formatPrice(item.total)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card bg-base-100 shadow-xl"
        >
          <div className="card-body">
            <h2 className="text-xl font-light tracking-wide mb-4">
              Resumen del Pedido
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-base-content/60 font-light">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-success font-light">
                  <span>Descuento</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              {order.shipping_cost > 0 && (
                <div className="flex justify-between text-base-content/60 font-light">
                  <span>Envío</span>
                  <span>{formatPrice(order.shipping_cost)}</span>
                </div>
              )}
              {order.tax_amount > 0 && (
                <div className="flex justify-between text-base-content/60 font-light">
                  <span>Impuestos</span>
                  <span>{formatPrice(order.tax_amount)}</span>
                </div>
              )}
              <div className="divider my-2"></div>
              <div className="flex justify-between text-lg font-light">
                <span>Total</span>
                <span className="text-primary">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
