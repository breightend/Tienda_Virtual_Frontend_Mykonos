import AdminLayout from "./AdminLayout";
import { useState, useEffect } from "react";
import { getAllOrders, getOrderDetails, updateOrderStatus } from "../services/adminService";
import { Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const statusFilter = filter === "all" ? null : filter;
      const data = await getAllOrders(100, 0, statusFilter);
      setOrders(data);
      setError(null);
    } catch (error) {
      console.error("Error loading orders:", error);
      setError("Error al cargar órdenes");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (orderId) => {
    try {
      const details = await getOrderDetails(orderId);
      setSelectedOrder(details);
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Error loading order details:", error);
      setError("Error al cargar detalles de la orden");
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, { status: newStatus });
      await loadOrders();
      if (selectedOrder?.order_id === orderId) {
        const details = await getOrderDetails(orderId);
        setSelectedOrder(details);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      setError("Error al actualizar estado de la orden");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: "badge-warning", icon: Clock, label: "Pendiente" },
      processing: { class: "badge-info", icon: Package, label: "Procesando" },
      shipped: { class: "badge-primary", icon: Truck, label: "Enviado" },
      delivered: { class: "badge-success", icon: CheckCircle, label: "Entregado" },
      cancelled: { class: "badge-error", icon: XCircle, label: "Cancelado" },
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`badge ${badge.class} gap-1`}>
        <Icon size={14} />
        {badge.label}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div>
        <h1 className="text-4xl font-bold mb-2 tracking-wide">Gestión de Órdenes</h1>
        <p className="text-base-content/60 mb-8">Administrar órdenes y envíos</p>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error mb-6">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="btn btn-sm btn-ghost">✕</button>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`btn btn-sm ${filter === "all" ? "btn-primary" : "btn-ghost"}`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`btn btn-sm ${filter === "pending" ? "btn-warning" : "btn-ghost"}`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setFilter("processing")}
            className={`btn btn-sm ${filter === "processing" ? "btn-info" : "btn-ghost"}`}
          >
            Procesando
          </button>
          <button
            onClick={() => setFilter("shipped")}
            className={`btn btn-sm ${filter === "shipped" ? "btn-primary" : "btn-ghost"}`}
          >
            Enviadas
          </button>
          <button
            onClick={() => setFilter("delivered")}
            className={`btn btn-sm ${filter === "delivered" ? "btn-success" : "btn-ghost"}`}
          >
            Entregadas
          </button>
        </div>

        {/* Orders Table */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-base-content/60">No se encontraron órdenes</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Cliente</th>
                      <th>Fecha</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.order_id}>
                        <td className="font-mono">#{order.order_id}</td>
                        <td>
                          <div>
                            <p className="font-medium">{order.customer?.username}</p>
                            <p className="text-sm text-base-content/60">{order.customer?.email}</p>
                          </div>
                        </td>
                        <td className="text-sm">
                          {order.order_date ? new Date(order.order_date).toLocaleDateString('es-AR') : 'N/A'}
                        </td>
                        <td className="text-center">{order.items_count}</td>
                        <td className="font-semibold">${order.total?.toLocaleString('es-AR')}</td>
                        <td>{getStatusBadge(order.status)}</td>
                        <td>
                          <button
                            onClick={() => handleViewDetails(order.order_id)}
                            className="btn btn-sm btn-primary"
                          >
                            Ver Detalles
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Order Details Modal */}
        <AnimatePresence>
          {showDetailsModal && selectedOrder && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowDetailsModal(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-0 flex items-center justify-center z-50 p-8"
              >
                <div className="card bg-base-100 w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto">
                  <div className="card-body">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="card-title text-2xl">Orden #{selectedOrder.order_id}</h2>
                        <p className="text-sm text-base-content/60">
                          {selectedOrder.order_date ? new Date(selectedOrder.order_date).toLocaleString('es-AR') : 'N/A'}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowDetailsModal(false)}
                        className="btn btn-sm btn-circle btn-ghost"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-base-200 p-4 rounded-lg mb-4">
                      <h3 className="font-bold mb-2">Cliente</h3>
                      <p><strong>Nombre:</strong> {selectedOrder.customer?.username}</p>
                      <p><strong>Email:</strong> {selectedOrder.customer?.email}</p>
                      <p><strong>Dirección:</strong> {selectedOrder.shipping_address || 'No especificada'}</p>
                    </div>

                    {/* Items */}
                    <div className="mb-4">
                      <h3 className="font-bold mb-2">Productos</h3>
                      <div className="overflow-x-auto">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Producto</th>
                              <th>Cantidad</th>
                              <th>Precio Unit.</th>
                              <th>Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedOrder.items?.map((item, index) => (
                              <tr key={index}>
                                <td>{item.product_name}</td>
                                <td>{item.quantity}</td>
                                <td>${item.unit_price?.toLocaleString('es-AR')}</td>
                                <td>${item.subtotal?.toLocaleString('es-AR')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="bg-base-200 p-4 rounded-lg mb-4">
                      <div className="flex justify-between mb-2">
                        <span>Subtotal:</span>
                        <span>${selectedOrder.subtotal?.toLocaleString('es-AR')}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>Envío:</span>
                        <span>${selectedOrder.shipping_cost?.toLocaleString('es-AR') || 0}</span>
                      </div>
                      <div className="divider my-2"></div>
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>${selectedOrder.total?.toLocaleString('es-AR')}</span>
                      </div>
                    </div>

                    {/* Status Update */}
                    <div className="mb-4">
                      <h3 className="font-bold mb-2">Actualizar Estado</h3>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder.order_id, "pending")}
                          className="btn btn-sm btn-warning"
                          disabled={selectedOrder.status === "pending"}
                        >
                          Pendiente
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder.order_id, "processing")}
                          className="btn btn-sm btn-info"
                          disabled={selectedOrder.status === "processing"}
                        >
                          Procesando
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder.order_id, "shipped")}
                          className="btn btn-sm btn-primary"
                          disabled={selectedOrder.status === "shipped"}
                        >
                          Enviado
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder.order_id, "delivered")}
                          className="btn btn-sm btn-success"
                          disabled={selectedOrder.status === "delivered"}
                        >
                          Entregado
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder.order_id, "cancelled")}
                          className="btn btn-sm btn-error"
                          disabled={selectedOrder.status === "cancelled"}
                        >
                          Cancelado
                        </button>
                      </div>
                    </div>

                    <div className="card-actions justify-end">
                      <button
                        onClick={() => setShowDetailsModal(false)}
                        className="btn btn-ghost"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
