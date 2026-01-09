import {
  Moon,
  ShoppingCart,
  Sun,
  Menu,
  X,
  User,
  Shield,
  BellRing,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  AnimatePresence,
} from "motion/react";
import { useAuth } from "./context/AuthContext";
import { useCart } from "./context/CartContext";
import { useNotifications } from "./context/NotificationContext";
import { Bell } from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount, totalPrice } = useCart();
  const { unreadCount } = useNotifications();
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "lightMykonos"
  );
  const [location, setLocation] = useLocation();
  const [hidden, setHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (latest > previous && latest > 150) {
      setHidden(true);
      setMobileMenuOpen(false);
    } else {
      setHidden(false);
    }
  });

  const handleToggle = (e) => {
    if (e.target.checked) {
      setTheme("darkMykonos");
    } else {
      setTheme("lightMykonos");
    }
  };

  const goHome = () => {
    setLocation("/");
    setMobileMenuOpen(false);
  };

  const goToInfoProfile = () => {
    setLocation("/user-info");
    setMobileMenuOpen(false);
  };

  const goToStore = () => {
    setLocation("/store");
    setMobileMenuOpen(false);
  };

  const goToLogin = () => {
    setLocation("/login");
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const goToShoppingCart = () => {
    setLocation("/carrito");
    setMobileMenuOpen(false);
  };

  const goToContactUs = () => {
    setLocation("/contact-us");
    setMobileMenuOpen(false);
  };

  const goToMyPurchases = () => {
    setLocation("/my-purchases");
    setMobileMenuOpen(false);
  };

  const goToNotifications = () => {
    setLocation("/notifications");
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/");
    setMobileMenuOpen(false);
  };

  const goToAdminPanel = () => {
    setLocation("/admin");
    setMobileMenuOpen(false);
  };

  return (
    <>
      <motion.div
        className="navbar bg-base-300 shadow-sm fixed top-0 left-0 right-0 z-50 px-4"
        variants={{
          visible: { y: 0 },
          hidden: { y: "-100%" },
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
      >
        {/* Logo */}
        <div className="flex-1">
          <a
            className="btn btn-ghost text-base sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-light tracking-widest text-base-content gap-2 hover:bg-transparent"
            onClick={goHome}
          >
            <img
              src="/logoMks.svg"
              alt="Mykonos Logo"
              className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 object-contain"
            />
            <span className="hidden sm:inline">MYKONOS BOUTIQUE</span>
            <span className="inline sm:hidden">MYKONOS</span>
          </a>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex gap-4 items-center">
          <motion.button
            className="btn btn-ghost font-light tracking-widest text-base-content hover:text-primary transition-colors relative group"
            onClick={goToStore}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            TIENDA
            <span className="absolute bottom-0 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full"></span>
          </motion.button>

          <motion.button
            className="btn btn-ghost font-light tracking-widest text-base-content hover:text-primary transition-colors relative group"
            onClick={goToContactUs}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            CONTACTANOS
            <span className="absolute bottom-0 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full"></span>
          </motion.button>

          {user && (
            <motion.button
              className="btn btn-ghost tooltip tooltip-bottom font-light tracking-widest text-base-content hover:text-primary transition-colors relative group"
              onClick={goToNotifications}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              data-tip="Notificaciones"
            >
              <div className="indicator">
                {unreadCount > 1 ? (
                  <>
                    <BellRing className="h-5 w-5 animate-pulse text-primary" />
                    <span className="badge badge-xs badge-primary indicator-item animate-bounce">
                      {unreadCount}
                    </span>
                  </>
                ) : (
                  <>
                    <Bell className="h-5 w-5" />
                  </>
                )}
              </div>
              <span className="absolute bottom-0 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full"></span>
            </motion.button>
          )}

          <div className="dropdown dropdown-end">
            <motion.div
              tabIndex={0}
              role="button"
              className="btn btn-ghost tooltip tooltip-bottom font-light tracking-widest text-base-content hover:text-primary transition-colors relative group"
              data-tip="Carrito"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="indicator">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="badge badge-sm indicator-item badge-primary">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="absolute bottom-0 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full"></span>
            </motion.div>
            <div
              tabIndex={0}
              className="card card-compact dropdown-content bg-base-100 z-1 mt-3 w-52 shadow"
            >
              <div className="card-body">
                <span className="text-lg font-bold">
                  {itemCount} {itemCount === 1 ? "Item" : "Items"}
                </span>
                <span className="text-info">
                  Subtotal: ${totalPrice?.toLocaleString("es-AR") || 0}
                </span>
                <div className="card-actions">
                  <button
                    onClick={goToShoppingCart}
                    className="btn btn-primary btn-block"
                  >
                    Ir al carrito
                  </button>
                </div>
              </div>
            </div>
          </div>

          <motion.button
            className="btn btn-ghost tooltip tooltip-bottom font-light tracking-widest text-base-content hover:text-primary transition-colors relative group"
            onClick={() =>
              setTheme(theme === "darkMykonos" ? "lightMykonos" : "darkMykonos")
            }
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            data-tip="Cambiar tema"
          >
            {theme === "darkMykonos" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="absolute bottom-0 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full"></span>
          </motion.button>

          <div className="flex gap-4">
            {/* User Section */}
            <div className="dropdown dropdown-end">
              {isAuthenticated ? (
                <>
                  <div
                    tabIndex={0}
                    role="button"
                    className={`btn btn-ghost gap-2 ${
                      isAdmin ? "text-warning" : "text-info"
                    }`}
                    onClick={goToInfoProfile}
                  >
                    {isAdmin ? <Shield size={20} /> : <User size={20} />}
                    <span className="font-medium">
                      {user?.username || user?.fullname}
                    </span>
                    {isAdmin && (
                      <span className="badge badge-warning badge-sm">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <ul
                    tabIndex={0}
                    className="menu menu-md dropdown-content bg-base-200 rounded-box z-[1] mt-3 w-52 p-2 shadow"
                  >
                    <li onClick={goToInfoProfile}>
                      <a className="justify-between">
                        <span>Perfil</span>
                        <User size={16} />
                      </a>
                    </li>
                    {isAdmin && (
                      <li onClick={goToAdminPanel}>
                        <a className="justify-between text-warning">
                          <span>Panel Admin</span>
                          <Shield size={16} />
                        </a>
                      </li>
                    )}
                    <li onClick={goToMyPurchases}>
                      <a>Mis Compras</a>
                    </li>
                    <div className="divider my-1"></div>
                    <li onClick={handleLogout}>
                      <a className="text-error">Cerrar sesión</a>
                    </li>
                  </ul>
                </>
              ) : (
                <button onClick={goToLogin} className="btn btn-primary gap-2">
                  <User size={20} />
                  Iniciar Sesión
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center gap-2">
          <label className="swap swap-rotate">
            <input
              type="checkbox"
              className="theme-controller"
              checked={theme === "darkMykonos"}
              onChange={handleToggle}
            />
            <Sun className="swap-off h-6 w-6 fill-current" />
            <Moon className="swap-on h-6 w-6 fill-current" />
          </label>

          <motion.button
            className="btn btn-ghost btn-circle"
            onClick={toggleMobileMenu}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              {mobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-base-300 z-40 lg:hidden"
            style={{ top: "64px" }}
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="flex flex-col h-full p-6 space-y-6">
              {/* Menu Items */}
              <motion.button
                className="btn btn-ghost btn-lg justify-start font-light tracking-widest text-base-content text-xl"
                onClick={goToStore}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                whileTap={{ scale: 0.95 }}
              >
                Tienda
              </motion.button>

              {user && (
                <>
                  <motion.div
                    className="divider"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.15 }}
                  ></motion.div>
                  <motion.button
                    className="btn btn-ghost btn-lg justify-start font-light tracking-widest text-base-content text-xl"
                    onClick={goToNotifications}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Notificaciones
                  </motion.button>
                </>
              )}

              <motion.div
                className="divider"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.15 }}
              ></motion.div>

              <motion.button
                className="btn btn-ghost btn-lg justify-start font-light tracking-widest text-base-content text-xl"
                onClick={goToContactUs}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                whileTap={{ scale: 0.95 }}
              >
                Contactanos
              </motion.button>

              <motion.div
                className="divider"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.15 }}
              ></motion.div>

              {/* Cart */}
              <motion.button
                className="btn btn-ghost btn-lg justify-start font-light tracking-widest text-base-content text-xl"
                onClick={goToShoppingCart}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center gap-3 w-full">
                  <ShoppingCart className="h-6 w-6" />
                  <div className="flex-1 text-left">
                    <p className="font-semibold">CARRITO</p>
                    <p className="text-sm text-base-content/70 font-normal">
                      {itemCount} Items - $
                      {totalPrice?.toLocaleString("es-AR") || 0}
                    </p>
                  </div>
                  {itemCount > 0 && (
                    <span className="badge badge-primary">{itemCount}</span>
                  )}
                </div>
              </motion.button>

              {/* Profile Section */}
              <motion.div
                className="flex flex-col gap-3 mt-auto"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                {isAuthenticated ? (
                  <>
                    <div
                      className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer ${
                        isAdmin ? "bg-warning/10" : "bg-info/10"
                      }`}
                      onClick={goToInfoProfile}
                    >
                      <div className={`avatar placeholder`}>
                        <div
                          className={`w-12 rounded-full ${
                            isAdmin
                              ? "bg-warning text-warning-content"
                              : "bg-info text-info-content"
                          }`}
                        >
                          {isAdmin ? <Shield size={24} /> : <User size={24} />}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">
                          {user?.username || user?.fullname}
                        </p>
                        <p
                          className={`text-sm ${
                            isAdmin ? "text-warning" : "text-info"
                          }`}
                        >
                          {isAdmin ? "Administrador" : "Cliente"}
                        </p>
                      </div>
                    </div>

                    <button
                      className="btn btn-ghost justify-start"
                      onClick={goToInfoProfile}
                    >
                      <User size={18} />
                      Perfil
                    </button>

                    {isAdmin && (
                      <button
                        className="btn btn-ghost justify-start text-warning"
                        onClick={goToAdminPanel}
                      >
                        <Shield size={18} />
                        Panel Admin
                      </button>
                    )}

                    <button
                      className="btn btn-ghost justify-start text-error"
                      onClick={handleLogout}
                    >
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={goToLogin}
                  >
                    <User size={20} />
                    Iniciar Sesión
                  </button>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
