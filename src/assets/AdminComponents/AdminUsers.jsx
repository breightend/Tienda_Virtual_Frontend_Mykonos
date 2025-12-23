import AdminLayout from "./AdminLayout";
import { useState, useEffect } from "react";
import { getAllUsers, changeUserRole } from "../services/adminService";
import { User, Shield, CheckCircle, XCircle, Crown } from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [confirmAction, setConfirmAction] = useState(null); // Para controlar el modal de confirmación

  useEffect(() => {
    loadUsers();
  }, [filter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const roleFilter = filter === "all" ? null : filter;
      const data = await getAllUsers(100, 0, roleFilter);
      setUsers(data);
      setError(null);
    } catch (error) {
      console.error("Error loading users:", error);
      setError("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "customer" : "admin";

    if (currentRole === "admin") {
      setConfirmAction({
        type: "removeAdmin",
        userId,
        newRole,
      });
      document.getElementById("confirm_modal").showModal();
      return;
    }

    try {
      await changeUserRole(userId, newRole);
      await loadUsers();
    } catch (error) {
      console.error("Error changing user role:", error);
      setError(error.detail || "Error al cambiar rol de usuario");
    }
  };

  const confirmChangeRole = async () => {
    if (!confirmAction) return;

    try {
      await changeUserRole(confirmAction.userId, confirmAction.newRole);
      await loadUsers();
      setConfirmAction(null);
    } catch (error) {
      console.error("Error changing user role:", error);
      setError(error.detail || "Error al cambiar rol de usuario");
    }
  };

  return (
    <AdminLayout>
      <div>
        <h1 className="text-4xl font-bold mb-2 tracking-wide">
          Gestión de Usuarios
        </h1>
        <p className="text-base-content/60 mb-8">
          Administrar usuarios del sistema
        </p>

        {/* Error Alert */}
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

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`btn btn-sm ${
              filter === "all" ? "btn-primary" : "btn-ghost"
            }`}
          >
            Todos ({users.length})
          </button>
          <button
            onClick={() => setFilter("customer")}
            className={`btn btn-sm ${
              filter === "customer" ? "btn-info" : "btn-ghost"
            }`}
          >
            Clientes
          </button>
          <button
            onClick={() => setFilter("admin")}
            className={`btn btn-sm ${
              filter === "admin" ? "btn-warning" : "btn-ghost"
            }`}
          >
            Administradores
          </button>
        </div>

        {/* Users Table */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-base-content/60">
                  No se encontraron usuarios
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th>Email Verificado</th>
                      <th>Compras</th>
                      <th>Fecha Registro</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div className="flex items-center gap-2">
                            {user.role === "admin" ? (
                              <Crown size={16} className="text-warning" />
                            ) : (
                              <User size={16} className="text-info" />
                            )}
                            <div>
                              <p className="font-medium">{user.username}</p>
                              <p className="text-sm text-base-content/60">
                                {user.fullname}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="text-sm">{user.email}</td>
                        <td>
                          <span
                            className={`badge ${
                              user.role === "admin"
                                ? "badge-warning"
                                : "badge-info"
                            }`}
                          >
                            {user.role === "admin" ? "Admin" : "Cliente"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              user.status === "active"
                                ? "badge-success"
                                : "badge-error"
                            }`}
                          >
                            {user.status === "active" ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td>
                          {user.email_verified ? (
                            <CheckCircle size={20} className="text-success" />
                          ) : (
                            <XCircle size={20} className="text-error" />
                          )}
                        </td>
                        <td className="text-center">
                          {user.total_purchases || 0}
                        </td>
                        <td className="text-sm">
                          {user.created_at
                            ? new Date(user.created_at).toLocaleDateString(
                                "es-AR"
                              )
                            : "N/A"}
                        </td>
                        <td>
                          <button
                            onClick={() => handleChangeRole(user.id, user.role)}
                            className={`btn btn-xs ${
                              user.role === "admin" ? "btn-warning" : "btn-info"
                            }`}
                            title={
                              user.role === "admin"
                                ? "Quitar admin"
                                : "Hacer admin"
                            }
                          >
                            {user.role === "admin"
                              ? "Quitar Admin"
                              : "Hacer Admin"}
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

        {/* Modal de Confirmación */}
        <dialog id="confirm_modal" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirmar Acción</h3>
            <p className="py-4">
              ¿Estás seguro de quitar privilegios de administrador a este
              usuario?
            </p>
            <div className="modal-action">
              <form method="dialog">
                <button className="btn btn-ghost mr-2">Cancelar</button>
                <button className="btn btn-warning" onClick={confirmChangeRole}>
                  Confirmar
                </button>
              </form>
            </div>
          </div>
        </dialog>
      </div>
    </AdminLayout>
  );
}
