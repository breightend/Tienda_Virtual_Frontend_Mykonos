import { useLocation } from "wouter";
import { useCart } from "./context/CartContext";
import { useAuth } from "./context/AuthContext";
import { Trash2, Plus, Minus, ShoppingBag, BrushCleaning } from "lucide-react";
import { useState } from "react";

export default function Carrito() {
  const [location, setLocation] = useLocation();
  const { cart, loading, removeItem, updateQuantity, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [processingItem, setProcessingItem] = useState(null);
  const [limpiarCarrito, setLimpiarCarrito] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
        <div className="card bg-base-100 shadow-xl max-w-md w-full">
          <div className="card-body text-center">
            <h2 className="card-title justify-center text-2xl">
              Inicia Sesión
            </h2>
            <p className="text-base-content/60">
              Debes iniciar sesión para ver tu carrito
            </p>
            <button
              onClick={() => setLocation("/login")}
              className="btn btn-primary mt-4"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    setProcessingItem(cartItemId);
    await updateQuantity(cartItemId, newQuantity);
    setProcessingItem(null);
  };

  const handleRemoveItem = async (cartItemId) => {
    if (confirm("¿Eliminar este producto del carrito?")) {
      setProcessingItem(cartItemId);
      await removeItem(cartItemId);
      setProcessingItem(null);
    }
  };

  const handleClearCart = async () => {
    setLimpiarCarrito(true);
    await clearCart();
    setLimpiarCarrito(false);
    document.getElementById("eliminarCarritoModal").close();
  };

  const keepShopping = () => {
    setLocation("/store");
  };

  const goToCheckout = () => {
    setLocation("/checkout");
  };

  if (loading && !cart) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const isEmpty = !cart?.items || cart.items.length === 0;
  const hasCartError = cart?.hasError;

  return (
    <div className="min-h-screen bg-base-200 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-light tracking-widest mb-2">CARRITO</h1>
          <div className="w-16 h-px bg-primary"></div>
        </div>

        {/* Error Alert */}
        {hasCartError && (
          <div className="alert alert-error mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-bold">Error en el carrito</h3>
              <div className="text-sm">
                Tu carrito contiene productos con precios no configurados. Por
                favor elimina los productos problemáticos o contacta al
                administrador.
              </div>
            </div>
          </div>
        )}

        {isEmpty ? (
          /* Empty Cart */
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body text-center py-16">
              <ShoppingBag
                size={64}
                className="mx-auto text-base-content/20 mb-4"
              />
              <h2 className="text-2xl font-light mb-2">
                Tu carrito está vacío
              </h2>
              <p className="text-base-content/60 mb-6">
                Agrega productos para comenzar tu compra
              </p>
              <button onClick={keepShopping} className="btn btn-primary">
                Ir a la Tienda
              </button>
            </div>
          </div>
        ) : (
          /* Cart with Items */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.cart_item_id}
                  className="card bg-base-100 shadow-lg"
                >
                  <div className="card-body">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-24 h-24 bg-base-200 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product_image ? (
                          <img
                            src={
                              item.product_image.startsWith("http")
                                ? item.product_image
                                : `${
                                    import.meta.env.VITE_API_URL ||
                                    "http://localhost:8000"
                                  }${item.product_image}`
                            }
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-base-content/20">
                            <ShoppingBag size={32} />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {item.product_name}
                        </h3>
                        {item.unit_price ? (
                          <p className="text-primary font-bold mt-1">
                            ${item.unit_price?.toLocaleString("es-AR")}
                          </p>
                        ) : (
                          <div className="mt-1">
                            <p className="text-error font-bold">
                              Precio no disponible
                            </p>
                            <p className="text-xs text-error/70">
                              Este producto tiene un problema de configuración
                            </p>
                          </div>
                        )}
                        {item.stock_available !== undefined && (
                          <p className="text-sm text-base-content/60 mt-1">
                            Stock disponible: {item.stock_available}
                          </p>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                item.cart_item_id,
                                item.quantity - 1
                              )
                            }
                            className="btn btn-sm btn-circle btn-ghost"
                            disabled={
                              processingItem === item.cart_item_id ||
                              item.quantity <= 1
                            }
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-12 text-center font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                item.cart_item_id,
                                item.quantity + 1
                              )
                            }
                            className="btn btn-sm btn-circle btn-ghost"
                            disabled={processingItem === item.cart_item_id}
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        {item.subtotal ? (
                          <p className="text-lg font-bold">
                            ${item.subtotal?.toLocaleString("es-AR")}
                          </p>
                        ) : (
                          <p className="text-error font-bold">--</p>
                        )}

                        <button
                          onClick={() => handleRemoveItem(item.cart_item_id)}
                          className="btn btn-sm btn-error btn-outline gap-1"
                          disabled={processingItem === item.cart_item_id}
                        >
                          <Trash2 size={14} />
                          Eliminar
                        </button>

                        {!item.unit_price && (
                          <div className="badge badge-error badge-sm">
                            Eliminar este producto
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Clear Cart Button */}
              <button
                onClick={() =>
                  document.getElementById("eliminarCarritoModal").showModal()
                }
                className="btn btn-ghost btn-sm text-error"
              >
                <Trash2 size={16} />
                Vaciar Carrito
              </button>
            </div>

            <dialog id="eliminarCarritoModal" className="modal">
              <div className="modal-box">
                <h3 className="font-bold text-lg">¿Estás seguro?</h3>
                <p className="py-4">
                  ¿Deseas vaciar todo el carrito? Esta acción no se puede
                  deshacer.
                </p>
                <div className="modal-action">
                  <form method="dialog" className="gap-2 flex">
                    <button className="btn btn-neutral btn-outline">
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="btn btn-error btn-outline"
                      onClick={handleClearCart}
                      disabled={limpiarCarrito}
                    >
                      {limpiarCarrito ? (
                        <>
                          <span className="loading loading-spinner loading-xs"></span>
                          Vaciando...
                        </>
                      ) : (
                        <>
                          <BrushCleaning />
                          Vaciar carrito
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </dialog>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="card bg-base-100 shadow-xl sticky top-20">
                <div className="card-body">
                  <h2 className="card-title text-xl font-light tracking-wide">
                    Resumen
                  </h2>
                  <div className="divider my-2"></div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-base-content/60">
                        Productos ({cart.total_items})
                      </span>
                      <span>${cart.subtotal?.toLocaleString("es-AR")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-base-content/60">Envío</span>
                      <span className="text-success">A coordinar</span>
                    </div>
                  </div>

                  <div className="divider my-2"></div>

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">
                      ${cart.subtotal?.toLocaleString("es-AR")}
                    </span>
                  </div>

                  <div className="card-actions flex-col gap-2 mt-4">
                    <button
                      onClick={goToCheckout}
                      className="btn btn-primary btn-block"
                    >
                      Finalizar Compra
                    </button>
                    <button
                      onClick={keepShopping}
                      className="btn btn-outline btn-block"
                    >
                      Seguir Comprando
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
