import { Link, useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import {
  ChartColumn,
  Package,
  ShoppingCart,
  Users,
  TicketPercent,
  Home,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  BellRing,
} from "lucide-react";

export default function AdminLayout({ children }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Start collapsed by default

  const menuItems = [
    { path: "/admin", label: "Resumen", icon: ChartColumn },
    { path: "/admin/products", label: "Productos", icon: Package },
    { path: "/admin/orders", label: "Pedidos", icon: ShoppingCart },
    { path: "/admin/users", label: "Usuarios", icon: Users },
    { path: "/admin/discounts", label: "Descuentos", icon: TicketPercent },
    { path: "/admin/broadcasts", label: "Difusiones", icon: BellRing },
  ];

  return (
    <div className="flex min-h-screen bg-base-200">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-base-100 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-xl font-bold text-primary tracking-wide">
            Mykonos Admin
          </h2>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn btn-ghost btn-square"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          sidebarCollapsed ? "w-20" : "w-64"
        } bg-base-100 shadow-lg fixed h-full z-40 transition-all duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Header */}
        <div
          className={`p-6 border-b border-base-300 ${
            sidebarCollapsed ? "px-3" : ""
          }`}
        >
          {!sidebarCollapsed ? (
            <>
              <h2 className="text-2xl font-bold text-primary tracking-wide">
                Mykonos Admin
              </h2>
              <p className="text-sm text-base-content/60 mt-1">
                {user?.username}
              </p>
              <span className="badge badge-primary badge-sm mt-2">
                Administrator
              </span>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-content font-bold">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
        </div>

        {/* Toggle Button for Desktop */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex absolute -right-3 top-20 bg-primary text-primary-content rounded-full p-1 shadow-lg hover:bg-primary-focus transition-colors z-50"
          title={sidebarCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight size={16} />
          ) : (
            <ChevronLeft size={16} />
          )}
        </button>

        {/* Navigation */}
        <nav className="mt-6">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link key={item.path} href={item.path}>
                <div
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 ${
                    sidebarCollapsed ? "justify-center px-3" : "px-6"
                  } py-3 hover:bg-base-200 transition-colors cursor-pointer ${
                    location === item.path
                      ? "bg-base-200 border-l-4 border-primary"
                      : ""
                  }`}
                  title={sidebarCollapsed ? item.label : ""}
                >
                  <IconComponent
                    size={20}
                    className={location === item.path ? "text-primary" : ""}
                  />
                  {!sidebarCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          className={`absolute bottom-0 ${
            sidebarCollapsed ? "w-20" : "w-64"
          } p-6 border-t border-base-300 bg-base-100 ${
            sidebarCollapsed ? "px-3" : ""
          }`}
        >
          <Link href="/">
            <div
              className={`btn btn-outline btn-sm w-full mb-2 ${
                sidebarCollapsed ? "btn-square" : "gap-2"
              }`}
              title={sidebarCollapsed ? "Volver a la Tienda" : ""}
            >
              <Home size={16} />
              {!sidebarCollapsed && "Volver a la Tienda"}
            </div>
          </Link>
          <button
            onClick={logout}
            className={`btn btn-ghost btn-sm w-full ${
              sidebarCollapsed ? "btn-square" : "gap-2"
            }`}
            title={sidebarCollapsed ? "Cerrar Sesión" : ""}
          >
            <LogOut size={16} />
            {!sidebarCollapsed && "Cerrar Sesión"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 ${
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        } p-4 md:p-6 lg:p-8 pt-20 lg:pt-8 transition-all duration-300`}
      >
        {children}
      </main>
    </div>
  );
}
