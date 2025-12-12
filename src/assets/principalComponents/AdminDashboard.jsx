import AdminLayout from "./AdminLayout";
import { useEffect, useState } from "react";
import { getAdminStats } from "../services/adminService";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_users: 0,
    total_customers: 0,
    total_admins: 0,
    total_products: 0,
    products_online: 0,
    total_orders: 0,
    orders_pending: 0,
    orders_this_month: 0,
    revenue_this_month: 0,
    revenue_total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await getAdminStats();
        setStats(data);
      } catch (error) {
        console.error("Error loading dashboard stats:", error);
        setError("Error al cargar estadísticas");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <AdminLayout>
      <div>
        <h1 className="text-4xl font-bold mb-2 tracking-wide">Dashboard</h1>
        <p className="text-base-content/60 mb-8">Bienvenido al panel de administración</p>
        
        {error && (
          <div className="alert alert-error mb-6">
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : (
          <>
            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="card-title text-primary text-sm font-light tracking-wide">PRODUCTOS</h2>
                      <p className="text-4xl font-bold mt-2">{stats.total_products}</p>
                      <p className="text-sm text-base-content/60 mt-1">
                        {stats.products_online} en tienda online
                      </p>
                    </div>
                    <span className="text-5xl opacity-20">📦</span>
                  </div>
                </div>
              </div>
              
              <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="card-title text-primary text-sm font-light tracking-wide">ÓRDENES</h2>
                      <p className="text-4xl font-bold mt-2">{stats.total_orders}</p>
                      <p className="text-sm text-base-content/60 mt-1">
                        {stats.orders_pending} pendientes
                      </p>
                    </div>
                    <span className="text-5xl opacity-20">🛒</span>
                  </div>
                </div>
              </div>
              
              <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="card-title text-primary text-sm font-light tracking-wide">USUARIOS</h2>
                      <p className="text-4xl font-bold mt-2">{stats.total_users}</p>
                      <p className="text-sm text-base-content/60 mt-1">
                        {stats.total_customers} clientes
                      </p>
                    </div>
                    <span className="text-5xl opacity-20">👥</span>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="card-title text-primary text-sm font-light tracking-wide">VENTAS (MES)</h2>
                      <p className="text-4xl font-bold mt-2">{stats.orders_this_month}</p>
                      <p className="text-sm text-base-content/60 mt-1">
                        ${stats.revenue_this_month?.toLocaleString('es-AR') || 0}
                      </p>
                    </div>
                    <span className="text-5xl opacity-20">💰</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="card bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg">
                <div className="card-body">
                  <h3 className="text-lg font-semibold mb-2">Ingresos del Mes</h3>
                  <p className="text-3xl font-bold text-primary">
                    ${stats.revenue_this_month?.toLocaleString('es-AR') || 0}
                  </p>
                  <p className="text-sm text-base-content/60 mt-2">
                    {stats.orders_this_month} órdenes este mes
                  </p>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-success/10 to-success/5 shadow-lg">
                <div className="card-body">
                  <h3 className="text-lg font-semibold mb-2">Ingresos Totales</h3>
                  <p className="text-3xl font-bold text-success">
                    ${stats.revenue_total?.toLocaleString('es-AR') || 0}
                  </p>
                  <p className="text-sm text-base-content/60 mt-2">
                    {stats.total_orders} órdenes en total
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-4">Acciones Rápidas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <a href="/admin/products" className="btn btn-primary btn-lg justify-start">
                  <span className="text-2xl mr-3">📦</span>
                  Gestionar Productos
                </a>
                <a href="/admin/orders" className="btn btn-outline btn-lg justify-start">
                  <span className="text-2xl mr-3">🛒</span>
                  Ver Órdenes
                </a>
                <a href="/admin/users" className="btn btn-outline btn-lg justify-start">
                  <span className="text-2xl mr-3">👥</span>
                  Gestionar Usuarios
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
