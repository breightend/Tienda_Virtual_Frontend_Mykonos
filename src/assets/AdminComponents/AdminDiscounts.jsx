import AdminLayout from "./AdminLayout";
import { useState, useEffect } from "react";
import {
  getAllDiscounts,
  applyGroupDiscount,
  applyProductDiscount,
  updateDiscount,
  deleteDiscount,
} from "../services/adminService";
import { fetchGroups } from "../services/groupService";
import { Percent, Trash2, Edit, Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function AdminDiscounts() {
  const [discounts, setDiscounts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [discountToDelete, setDiscountToDelete] = useState(null);

  const [formData, setFormData] = useState({
    type: "group",
    group_id: "",
    discount_percentage: "",
    start_date: "",
    end_date: "",
    apply_to_children: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [discountsData, groupsData] = await Promise.all([
        getAllDiscounts(),
        fetchGroups(),
      ]);
      setDiscounts(discountsData);
      setGroups(groupsData);
      setError(null);
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Error al cargar descuentos");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiscount = async (e) => {
    e.preventDefault();

    if (!formData.group_id || !formData.discount_percentage) {
      setError("Por favor completa todos los campos requeridos");
      return;
    }

    try {
      // Construir el payload solo con los campos que tienen valor
      const payload = {
        group_id: parseInt(formData.group_id),
        discount_percentage: parseFloat(formData.discount_percentage),
        apply_to_children: formData.apply_to_children,
      };

      // Solo agregar fechas si tienen valor
      if (formData.start_date) {
        payload.start_date = formData.start_date;
      }
      if (formData.end_date) {
        payload.end_date = formData.end_date;
      }

      await applyGroupDiscount(payload);

      setSuccess("Descuento aplicado exitosamente");
      setShowCreateModal(false);
      setFormData({
        type: "group",
        group_id: "",
        discount_percentage: "",
        start_date: "",
        end_date: "",
        apply_to_children: true,
      });
      await loadData();
    } catch (error) {
      console.error("Error creating discount:", error);
      setError(error.detail || "Error al crear descuento");
    }
  };

  const handleDeleteDiscount = (discountId) => {
    setDiscountToDelete(discountId);
    document.getElementById("delete_modal").showModal();
  };

  const confirmDeleteDiscount = async () => {
    if (!discountToDelete) return;

    try {
      await deleteDiscount(discountToDelete);
      setSuccess("Descuento eliminado exitosamente");
      setDiscountToDelete(null);
      await loadData();
    } catch (error) {
      console.error("Error deleting discount:", error);
      setError("Error al eliminar descuento");
    }
  };

  const handleToggleDiscount = async (discountId, currentStatus) => {
    try {
      await updateDiscount(discountId, {
        is_active: !currentStatus,
      });
      await loadData();
    } catch (error) {
      console.error("Error toggling discount:", error);
      setError("Error al actualizar descuento");
    }
  };

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 tracking-wide">
              Gestión de Descuentos
            </h1>
            <p className="text-base-content/60">
              Administrar descuentos por grupos de productos
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary gap-2"
          >
            <Plus size={20} />
            Nuevo Descuento
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert alert-error mb-6">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="btn btn-sm btn-ghost"
            >
              ✕
            </button>
          </div>
        )}

        {success && (
          <div className="alert alert-success mb-6">
            <span>{success}</span>
            <button
              onClick={() => setSuccess(null)}
              className="btn btn-sm btn-ghost"
            >
              ✕
            </button>
          </div>
        )}

        {/* Discounts Table */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : discounts.length === 0 ? (
              <div className="text-center py-16">
                <Percent
                  size={48}
                  className="mx-auto text-base-content/20 mb-4"
                />
                <p className="text-base-content/60">
                  No hay descuentos activos
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-primary mt-4"
                >
                  Crear Primer Descuento
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tipo</th>
                      <th>Objetivo</th>
                      <th>Descuento</th>
                      <th>Productos Afectados</th>
                      <th>Vigencia</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {discounts.map((discount) => (
                      <tr key={discount.discount_id}>
                        <td className="font-mono">#{discount.discount_id}</td>
                        <td>
                          <span className="badge badge-info">
                            {discount.type === "group" ? "Grupo" : "Producto"}
                          </span>
                        </td>
                        <td className="font-medium">{discount.target_name}</td>
                        <td>
                          <span className="badge badge-success gap-1">
                            <Percent size={14} />
                            {discount.discount_percentage}%
                          </span>
                        </td>
                        <td className="text-center">
                          {discount.affected_products}
                        </td>
                        <td className="text-sm">
                          {discount.start_date && (
                            <div>
                              Desde:{" "}
                              {new Date(discount.start_date).toLocaleDateString(
                                "es-AR"
                              )}
                            </div>
                          )}
                          {discount.end_date && (
                            <div>
                              Hasta:{" "}
                              {new Date(discount.end_date).toLocaleDateString(
                                "es-AR"
                              )}
                            </div>
                          )}
                          {!discount.start_date &&
                            !discount.end_date &&
                            "Sin límite"}
                        </td>
                        <td>
                          <div className="form-control">
                            <label className="label cursor-pointer gap-2">
                              <input
                                type="checkbox"
                                className="toggle toggle-success"
                                checked={discount.is_active}
                                onChange={() =>
                                  handleToggleDiscount(
                                    discount.discount_id,
                                    discount.is_active
                                  )
                                }
                              />
                              <span className="label-text">
                                {discount.is_active ? "Activo" : "Inactivo"}
                              </span>
                            </label>
                          </div>
                        </td>
                        <td>
                          <button
                            onClick={() =>
                              handleDeleteDiscount(discount.discount_id)
                            }
                            className="btn btn-sm btn-error btn-outline gap-1"
                          >
                            <Trash2 size={14} />
                            Eliminar
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

        {/* Create Discount Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowCreateModal(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-0 flex items-center justify-center z-50 p-8"
              >
                <div className="card bg-base-100 w-full max-w-2xl shadow-2xl">
                  <div className="card-body">
                    <h2 className="card-title text-2xl mb-4">
                      Crear Nuevo Descuento
                    </h2>

                    <form onSubmit={handleCreateDiscount} className="space-y-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">
                            Grupo de Productos *
                          </span>
                        </label>
                        <select
                          className="select select-bordered"
                          value={formData.group_id}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              group_id: e.target.value,
                            })
                          }
                          required
                        >
                          <option value="">Seleccionar grupo...</option>
                          {groups.map((group) => (
                            <option key={group.id} value={group.id}>
                              {group.group_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">
                            Porcentaje de Descuento * (%)
                          </span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          className="input input-bordered"
                          value={formData.discount_percentage}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              discount_percentage: e.target.value,
                            })
                          }
                          placeholder="Ej: 10"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">
                              Fecha Inicio (opcional)
                            </span>
                          </label>
                          <input
                            type="datetime-local"
                            className="input input-bordered"
                            value={formData.start_date}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                start_date: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">
                              Fecha Fin (opcional)
                            </span>
                          </label>
                          <input
                            type="datetime-local"
                            className="input input-bordered"
                            value={formData.end_date}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                end_date: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="form-control">
                        <label className="label cursor-pointer">
                          <span className="label-text">
                            Aplicar a subgrupos también
                          </span>
                          <input
                            type="checkbox"
                            className="checkbox checkbox-primary"
                            checked={formData.apply_to_children}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                apply_to_children: e.target.checked,
                              })
                            }
                          />
                        </label>
                      </div>

                      <div className="card-actions justify-end mt-6">
                        <button
                          type="button"
                          onClick={() => setShowCreateModal(false)}
                          className="btn btn-ghost"
                        >
                          Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">
                          Crear Descuento
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <dialog id="delete_modal" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirmar Eliminación</h3>
            <p className="py-4">
              ¿Estás seguro de eliminar este descuento? Los precios se
              restaurarán a sus valores originales.
            </p>
            <div className="modal-action">
              <form method="dialog">
                <button className="btn btn-ghost mr-2">Cancelar</button>
                <button
                  className="btn btn-error"
                  onClick={confirmDeleteDiscount}
                >
                  Eliminar
                </button>
              </form>
            </div>
          </div>
        </dialog>
      </div>
    </AdminLayout>
  );
}
