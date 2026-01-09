import AdminLayout from "./AdminLayout";
import { useEffect, useState } from "react";
import { getAdminStats } from "../services/adminService";
import {
  Boxes,
  HandCoins,
  Shirt,
  ShoppingCart,
  Users,
  BellRing,
} from "lucide-react";

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
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 tracking-wide">
          Resumen
        </h1>
        <p className="text-base-content/60 mb-6 md:mb-8 text-sm md:text-base">
          Bienvenido al panel de administración
        </p>

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
                <div className="card-body p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="card-title text-primary text-xs md:text-sm font-light tracking-wide">
                        PRODUCTOS
                      </h2>
                      <p className="text-2xl md:text-3xl lg:text-4xl font-bold mt-2">
                        {stats.total_products}
                      </p>
                      <p className="text-xs md:text-sm text-base-content/60 mt-1">
                        {stats.products_online} en tienda online
                      </p>
                    </div>
                    <span className="text-5xl opacity-20 hidden md:block">
                      <Shirt className="h-12 w-12 md:h-16 md:w-16" />
                    </span>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
                <div className="card-body p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="card-title text-primary text-xs md:text-sm font-light tracking-wide">
                        ÓRDENES
                      </h2>
                      <p className="text-2xl md:text-3xl lg:text-4xl font-bold mt-2">
                        {stats.total_orders}
                      </p>
                      <p className="text-xs md:text-sm text-base-content/60 mt-1">
                        {stats.orders_pending} pendientes
                      </p>
                    </div>
                    <span className="text-5xl opacity-20 hidden md:block">
                      <ShoppingCart className="h-12 w-12 md:h-16 md:w-16" />
                    </span>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
                <div className="card-body p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="card-title text-primary text-xs md:text-sm font-light tracking-wide">
                        USUARIOS
                      </h2>
                      <p className="text-2xl md:text-3xl lg:text-4xl font-bold mt-2">
                        {stats.total_users}
                      </p>
                      <p className="text-xs md:text-sm text-base-content/60 mt-1">
                        {stats.total_customers} clientes
                      </p>
                    </div>
                    <span className="text-5xl opacity-20 hidden md:block">
                      <Users className="h-12 w-12 md:h-16 md:w-16" />
                    </span>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
                <div className="card-body p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="card-title text-primary text-xs md:text-sm font-light tracking-wide">
                        VENTAS (MES)
                      </h2>
                      <p className="text-2xl md:text-3xl lg:text-4xl font-bold mt-2">
                        {stats.orders_this_month}
                      </p>
                      <p className="text-xs md:text-sm text-base-content/60 mt-1">
                        $
                        {stats.revenue_this_month?.toLocaleString("es-AR") || 0}
                      </p>
                    </div>
                    <span className="text-5xl opacity-20 hidden md:block">
                      <HandCoins className="h-12 w-12 md:h-16 md:w-16" />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="card bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg">
                <div className="card-body p-4 md:p-6">
                  <h3 className="text-base md:text-lg font-semibold mb-2">
                    Ingresos del Mes
                  </h3>
                  <p className="text-2xl md:text-3xl font-bold text-primary">
                    ${stats.revenue_this_month?.toLocaleString("es-AR") || 0}
                  </p>
                  <p className="text-xs md:text-sm text-base-content/60 mt-2">
                    {stats.orders_this_month} órdenes este mes
                  </p>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-success/10 to-success/5 shadow-lg">
                <div className="card-body p-4 md:p-6">
                  <h3 className="text-base md:text-lg font-semibold mb-2">
                    Ingresos Totales
                  </h3>
                  <p className="text-2xl md:text-3xl font-bold text-success">
                    ${stats.revenue_total?.toLocaleString("es-AR") || 0}
                  </p>
                  <p className="text-xs md:text-sm text-base-content/60 mt-2">
                    {stats.total_orders} órdenes en total
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 md:mt-12">
              <h2 className="text-xl md:text-2xl font-bold mb-4">
                Acciones Rápidas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                <a
                  href="/admin/products"
                  className="btn btn-outline btn-primary btn-md md:btn-lg justify-start"
                >
                  <span className="text-2xl mr-3">
                    <Boxes className="h-5 w-5 md:h-6 md:w-6" />
                  </span>
                  Gestionar Productos
                </a>

                <a
                  href="/admin/orders"
                  className="btn btn-outline btn-accent btn-md md:btn-lg justify-start"
                >
                  <span className="text-2xl mr-3">
                    <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
                  </span>
                  Ver Órdenes
                </a>

                <a
                  href="/admin/users"
                  className="btn btn-outline btn-secondary btn-md md:btn-lg justify-start"
                >
                  <span className="text-2xl mr-3">
                    <Users className="h-5 w-5 md:h-6 md:w-6" />
                  </span>
                  Gestión Usuarios
                </a>

                <a
                  href="/admin/broadcasts"
                  className="btn btn-outline btn-info btn-md md:btn-lg justify-start"
                >
                  <span className="text-2xl mr-3">
                    <BellRing className="h-5 w-5 md:h-6 md:w-6" />
                  </span>
                  Difusiones
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
