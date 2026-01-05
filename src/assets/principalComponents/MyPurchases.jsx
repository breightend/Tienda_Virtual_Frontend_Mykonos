import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import * as purchaseService from "../services/purchaseService";

export default function MyPurchases() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
      return;
    }

    const fetchPurchases = async () => {
      try {
        setIsLoading(true);
        const data = await purchaseService.getMyPurchases();
        setPurchases(data);
      } catch (err) {
        setError(err.detail || "Error al cargar el historial de compras");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPurchases();
  }, [isAuthenticated, setLocation]);

  const formatDate = (dateString) => {
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      Completada: "badge-success",
      Pendiente: "badge-warning",
      Cancelada: "badge-error",
      Reembolsada: "badge-info",
    };
    return statusConfig[status] || "badge-ghost";
  };

  const getShippingStatusBadge = (status) => {
    const statusConfig = {
      pendiente: "badge-warning",
      preparando: "badge-info",
      despachado: "badge-primary",
      en_transito: "badge-info",
      entregado: "badge-success",
      cancelado: "badge-error",
    };
    return statusConfig[status] || "badge-ghost";
  };

  const getShippingStatusLabel = (status) => {
    const statusLabels = {
      pendiente: "Pendiente",
      preparando: "Preparando",
      despachado: "Despachado",
      en_transito: "En Tránsito",
      entregado: "Entregado",
      cancelado: "Cancelado",
    };
    return statusLabels[status] || status;
  };

  const getDeliveryTypeLabel = (deliveryType) => {
    return deliveryType === "envio" ? "🚚 Envío" : "🏪 Retiro";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
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
            <p className="text-base-content/60 font-light">{error}</p>
            <button
              className="btn btn-primary mt-4"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-base-100 shadow-xl max-w-md w-full"
        >
          <div className="card-body text-center">
            <div className="text-6xl mb-4">🛍️</div>
            <h2 className="card-title justify-center text-2xl font-light">
              Sin Compras
            </h2>
            <p className="text-base-content/60 font-light">
              Aún no has realizado ninguna compra.
            </p>
            <button
              className="btn btn-primary mt-4"
              onClick={() => setLocation("/store")}
            >
              Ir a la Tienda
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-light tracking-widest text-base-content mb-2">
            MIS COMPRAS
          </h1>
          <div className="w-16 h-px bg-primary mb-4"></div>
          <p className="text-base-content/60 font-light">
            Historial de tus pedidos
          </p>
        </motion.div>

        {/* Purchases List */}
        <div className="space-y-6">
          {purchases.map((purchase, index) => (
            <motion.div
              key={purchase.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
            >
              <div className="card-body">
                {/* Purchase Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-light tracking-wide">
                      Orden #{purchase.id}
                    </h3>
                    <p className="text-sm text-base-content/60 font-light">
                      {formatDate(purchase.sale_date)}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span
                      className={`badge ${getStatusBadge(
                        purchase.status
                      )} font-light`}
                    >
                      {purchase.status}
                    </span>
                    {purchase.shipping_status && (
                      <span
                        className={`badge ${getShippingStatusBadge(
                          purchase.shipping_status
                        )} font-light`}
                      >
                        {getShippingStatusLabel(purchase.shipping_status)}
                      </span>
                    )}
                    {purchase.delivery_type && (
                      <span className="badge badge-ghost font-light">
                        {getDeliveryTypeLabel(purchase.delivery_type)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Products */}
                <div className="space-y-3">
                  {purchase.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-3 bg-base-200 rounded-lg"
                    >
                      {/* Product Image */}
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

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-light text-base-content truncate">
                          {item.product_name}
                        </h4>
                        <div className="flex gap-2 text-sm text-base-content/60 font-light mt-1">
                          {item.size_name && (
                            <span>Talle: {item.size_name}</span>
                          )}
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

                      {/* Price */}
                      <div className="text-right flex-shrink-0">
                        <p className="font-light text-base-content">
                          {formatPrice(item.total)}
                        </p>
                        {item.discount_amount > 0 && (
                          <p className="text-sm text-success font-light">
                            -{formatPrice(item.discount_amount)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Purchase Summary */}
                <div className="divider"></div>
                <div className="space-y-2">
                  <div className="flex justify-between text-base-content/60 font-light">
                    <span>Subtotal</span>
                    <span>{formatPrice(purchase.subtotal)}</span>
                  </div>
                  {purchase.discount > 0 && (
                    <div className="flex justify-between text-success font-light">
                      <span>Descuento</span>
                      <span>-{formatPrice(purchase.discount)}</span>
                    </div>
                  )}
                  {purchase.shipping_cost > 0 && (
                    <div className="flex justify-between text-base-content/60 font-light">
                      <span>Envío</span>
                      <span>{formatPrice(purchase.shipping_cost)}</span>
                    </div>
                  )}
                  {purchase.tax_amount > 0 && (
                    <div className="flex justify-between text-base-content/60 font-light">
                      <span>Impuestos</span>
                      <span>{formatPrice(purchase.tax_amount)}</span>
                    </div>
                  )}
                  <div className="divider my-2"></div>
                  <div className="flex justify-between text-lg font-light">
                    <span>Total</span>
                    <span className="text-primary">
                      {formatPrice(purchase.total)}
                    </span>
                  </div>
                </div>

                {/* Shipping Address */}
                {purchase.shipping_address && (
                  <div className="mt-4 p-3 bg-base-200 rounded-lg">
                    <p className="text-sm font-light text-base-content/60 mb-1">
                      Dirección de Envío:
                    </p>
                    <p className="font-light">{purchase.shipping_address}</p>
                  </div>
                )}

                {/* Notes */}
                {purchase.notes && (
                  <div className="mt-2">
                    <p className="text-sm font-light text-base-content/60">
                      Notas: {purchase.notes}
                    </p>
                  </div>
                )}

                {/* Tracking Button */}
                <div className="mt-4">
                  <motion.button
                    className="btn btn-primary btn-sm w-full sm:w-auto"
                    onClick={() =>
                      setLocation(`/order-tracking/${purchase.id}`)
                    }
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    📍 Ver Seguimiento
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
