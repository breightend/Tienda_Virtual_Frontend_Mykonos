import { Moon, ShoppingCart, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion, useScroll, useMotionValueEvent } from "motion/react";

export default function Navbar() {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "lightMykonos"
  );
  const [location, setLocation] = useLocation();
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (latest > previous && latest > 150) {
      setHidden(true);
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
  };

  const goToInfoProfile = () => {
    setLocation("/user-info");
  };

  const goToStore = () => {
    setLocation("/store");
  };

  return (
    <motion.div
      className="navbar bg-base-100 shadow-sm fixed top-0 left-0 right-0 z-50"
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
    >
      <div className="flex-1">
        <a
          className="btn btn-ghost text-3xl tracking-wider font-semibold"
          onClick={goHome}
        >
          Mykonos
        </a>
      </div>
      <div className="flex gap-4">
        <button className="btn btn-outline btn-primary" onClick={goToStore}>
          Tienda
        </button>
        <label className="swap swap-rotate">
          <input
            type="checkbox"
            className="theme-controller"
            checked={theme === "darkMykonos"}
            onChange={handleToggle}
          />
          <Sun className="swap-off h-8 w-8 fill-current" />
          <Moon className="swap-on h-8 w-8 fill-current" />
        </label>
        <div className="flex gap-4">
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle"
            >
              <div className="indicator">
                <ShoppingCart />
                <span className="badge badge-sm indicator-item">8</span>
              </div>
            </div>
            <div
              tabIndex={0}
              className="card card-compact dropdown-content bg-base-100 z-1 mt-3 w-52 shadow"
            >
              <div className="card-body">
                <span className="text-lg font-bold">8 Items</span>
                <span className="text-info">Subtotal: $999</span>
                <div className="card-actions">
                  <button className="btn btn-primary btn-block">
                    View cart
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 rounded-full">
                <img
                  alt="Tailwind CSS Navbar component"
                  src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                />
              </div>
            </div>
            <ul
              tabIndex="-1"
              className="menu menu-md dropdown-content bg-base-200 rounded-box z-1 mt-3 w-52 p-2 shadow"
            >
              <li onClick={goToInfoProfile}>
                <a className="justify-between">Perfil</a>
              </li>
              <li>
                <a>Configuración</a>
              </li>
              <li>
                <a>Cerrar sesión</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
