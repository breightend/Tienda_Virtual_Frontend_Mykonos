import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { fetchProducts, fetchProductsByGroupName } from "../services/productService";
import CategoryFilter from "../components/CategoryFilter";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "wouter";
import { ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";

export default function StorePage() {
  const [location, setLocation] = useLocation();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  
  const [selectedCard, setSelectedCard] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Variant selection modal state
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const modalRef = useRef(null);

  // Helper function to build image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/400x600";
    if (imagePath.startsWith('http')) return imagePath;
    const imageBaseUrl = import.meta.env.VITE_IMAGE_URL || 'http://localhost:8080';
    return `${imageBaseUrl}${imagePath}`;
  };

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        let data;
        
        if (selectedCategory) {
          data = await fetchProductsByGroupName(selectedCategory.group_name);
        } else {
          data = await fetchProducts();
        }
        
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error("Error loading products:", err);
        setError("Error al cargar los productos");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [selectedCategory]);

  // Get unique colors and sizes from variants
  const getUniqueColors = (variantes) => {
    if (!variantes || variantes.length === 0) return [];
    const colorMap = new Map();
    variantes.forEach(v => {
      if (v.color && !colorMap.has(v.color)) {
        colorMap.set(v.color, v.color_hex || '#cccccc');
      }
    });
    return Array.from(colorMap.entries()).map(([color, hex]) => ({ color, hex }));
  };

  const getUniqueSizes = (variantes) => {
    if (!variantes || variantes.length === 0) return [];
    const sizes = variantes.map(v => v.talle).filter(Boolean);
    return [...new Set(sizes)];
  };

  const handleAddToCartClick = (product, e) => {
    if (e) e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para agregar productos al carrito");
      setLocation("/login");
      return;
    }

    // If product has variants, show modal to select color/size
    if (product.variantes && product.variantes.length > 0) {
      setSelectedProduct(product);
      setSelectedColor(null);
      setSelectedSize(null);
      setQuantity(1);
      setShowVariantModal(true);
      // Open DaisyUI modal
      setTimeout(() => modalRef.current?.showModal(), 100);
    } else {
      // No variants, add directly
      addToCartDirectly(product.id, 1);
    }
  };

  const addToCartDirectly = async (productId, qty) => {
    try {
      setAddingToCart(true);
      const result = await addToCart(productId, qty);
      
      if (result.success) {
        toast.success("¡Producto agregado al carrito!");
      } else {
        toast.error(result.error || "Error al agregar al carrito");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Error al agregar al carrito");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleConfirmAddToCart = async () => {
    if (!selectedProduct) return;

    // Validate variant selection
    const uniqueColors = getUniqueColors(selectedProduct.variantes);
    const uniqueSizes = getUniqueSizes(selectedProduct.variantes);

    if (uniqueColors.length > 0 && !selectedColor) {
      toast.error("Por favor selecciona un color");
      return;
    }

    if (uniqueSizes.length > 0 && !selectedSize) {
      toast.error("Por favor selecciona un talle");
      return;
    }

    // Add to cart
    try {
      setAddingToCart(true);
      const result = await addToCart(selectedProduct.id, quantity);
      
      if (result.success) {
        toast.success(`¡${selectedProduct.nombre_web} agregado al carrito!`);
        closeVariantModal();
      } else {
        toast.error(result.error || "Error al agregar al carrito");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Error al agregar al carrito");
    } finally {
      setAddingToCart(false);
    }
  };

  const closeVariantModal = () => {
    setShowVariantModal(false);
    modalRef.current?.close();
    setSelectedProduct(null);
    setSelectedColor(null);
    setSelectedSize(null);
    setQuantity(1);
  };

  return (
    <div>
      <div className="bg-base-100 min-h-screen py-12">
      {/* Header */}
        <div className="max-w-7xl mx-auto mb-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl font-light tracking-widest mb-4 text-base-content">
              COLECCIÓN
            </h1>
            <div className="w-16 h-px bg-primary mx-auto"></div>
          </motion.div>
        </div>

      {/* Main Content - Full Width with Filters Flush Left */}
      <div className="flex md:flex-row flex-col gap-24 pl-2 pr-2">
        {/* Left Sidebar - Filters (Flush Left) */}
        <div className="w-48 flex-shrink-0">
          <div className="md:sticky top-24">
            <CategoryFilter
              onSelectCategory={setSelectedCategory}
              selectedCategory={selectedCategory}
            />
            
            {selectedCategory && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-base-200 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Filtrando por:</span>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="btn btn-ghost btn-xs btn-circle"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <span className="badge badge-primary badge-sm">
                  {selectedCategory.group_name}
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Content - Products */}
        <div className="flex-1 ">
            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center min-h-[400px]">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* No Products Message */}
            {!loading && !error && products.length === 0 && (
              <div className="text-center py-16">
                <p className="text-base-content/60 text-lg font-light">
                  No se encontraron productos en esta categoría
                </p>
              </div>
            )}

            {/* Products Grid */}
            {!loading && !error && products.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, index) => {
                  const uniqueColors = getUniqueColors(product.variantes);
                  const uniqueSizes = getUniqueSizes(product.variantes);
                  
                  return (
                    <motion.div
                      key={product.id}
                      onClick={() => setSelectedCard(product)}
                      className="card bg-base-200 shadow-lg hover:shadow-xl cursor-pointer group"
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ y: -8 }}
                    >
                      <figure className="relative overflow-hidden aspect-[3/4]">
                        <img
                          src={getImageUrl(product.images[0])}
                          alt={product.nombre_web}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {product.stock_disponible === 0 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white text-xl font-light tracking-wide">SIN STOCK</span>
                          </div>
                        )}
                      </figure>
                      <div className="card-body p-6">
                        <h2 className="card-title text-xl font-light text-base-content tracking-wide">
                          {product.nombre_web}
                        </h2>
                        <p className="text-primary font-light text-lg mb-2">
                          ${(product.precio_web || product.sale_price || 0).toFixed(2)}
                        </p>
                        
                        {/* Colors */}
                        {uniqueColors.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-base-content/60 mb-2 font-light tracking-wide">COLORES</p>
                            <div className="flex gap-2 flex-wrap">
                              {uniqueColors.map(({ color, hex }) => (
                                <div key={color} className="flex items-center gap-1 badge badge-outline badge-sm">
                                  <div 
                                    className="w-3 h-3 rounded-full border border-base-content/20"
                                    style={{ backgroundColor: hex }}
                                  />
                                  <span className="font-light">{color}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Sizes */}
                        {uniqueSizes.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-base-content/60 mb-2 font-light tracking-wide">TALLES</p>
                            <div className="flex gap-2 flex-wrap">
                              {uniqueSizes.map(size => (
                                <span
                                  key={size}
                                  className="badge badge-outline badge-sm font-light"
                                >
                                  {size}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="card-actions justify-between mt-4">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCard(product);
                            }}
                            className="btn btn-ghost btn-sm font-light tracking-wide"
                          >
                            VER DETALLES
                          </button>
                          <button 
                            onClick={(e) => handleAddToCartClick(product, e)}
                            className="btn btn-primary btn-sm font-light tracking-wide gap-2"
                            disabled={product.stock_disponible === 0}
                          >
                            <ShoppingCart size={16} />
                            AGREGAR
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    
    <dialog ref={modalRef} className="modal">
        <div className="modal-box">
          {selectedProduct && (
            <>
              <h3 className="font-bold text-lg">{selectedProduct.nombre_web}</h3>
              <p className="text-primary text-xl font-bold my-4">
                ${(selectedProduct.precio_web || selectedProduct.sale_price || 0).toFixed(2)}
              </p>

              {/* Color Selection */}
              {getUniqueColors(selectedProduct.variantes).length > 0 && (
                <div className="mb-4">
                  <label className="label">
                    <span className="label-text font-semibold">Color *</span>
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {getUniqueColors(selectedProduct.variantes).map(({ color, hex }) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`btn btn-sm gap-2 ${
                          selectedColor === color ? 'btn-primary' : 'btn-outline'
                        }`}
                      >
                        <div 
                          className="w-4 h-4 rounded-full border-2 border-base-content/30"
                          style={{ backgroundColor: hex }}
                        />
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {getUniqueSizes(selectedProduct.variantes).length > 0 && (
                <div className="mb-4">
                  <label className="label">
                    <span className="label-text font-semibold">Talle *</span>
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {getUniqueSizes(selectedProduct.variantes).map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`btn btn-sm ${
                          selectedSize === size ? 'btn-primary' : 'btn-outline'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-4">
                <label className="label">
                  <span className="label-text font-semibold">Cantidad</span>
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="btn btn-circle btn-sm"
                  >
                    -
                  </button>
                  <span className="text-xl font-bold w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="btn btn-circle btn-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="modal-action">
                <button onClick={closeVariantModal} className="btn btn-ghost">
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmAddToCart}
                  className="btn btn-primary gap-2"
                  disabled={addingToCart}
                >
                  {addingToCart ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Agregando...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={16} />
                      Agregar al Carrito
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={closeVariantModal}>close</button>
        </form>
    </dialog>

      {/* Expanded Product Card Modal */}
      <AnimatePresence>
        {selectedCard && (
          <>
            {/* Backdrop con blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedCard(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
              style={{ backdropFilter: "blur(10px)" }}
            />

            {/* Card expandida */}
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50 p-4 md:p-8"
              onClick={() => setSelectedCard(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="bg-base-100 w-full max-w-4xl shadow-2xl max-h-[95vh] overflow-y-auto rounded-lg"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Large Image */}
                <div className="w-full h-[60vh] md:h-[70vh] overflow-hidden">
                  <img
                    src={getImageUrl(selectedCard.images[0])}
                    alt={selectedCard.nombre_web}
                    className="w-full h-full object-contain bg-base-200"
                  />
                </div>

                {/* Scrollable Content */}
                <div className="p-6 md:p-8">
                  <h2 className="text-3xl font-light text-base-content tracking-wide mb-2">
                    {selectedCard.nombre_web}
                  </h2>
                  <p className="text-2xl text-primary font-light mb-6">
                    ${(selectedCard.precio_web || selectedCard.sale_price || 0).toFixed(2)}
                  </p>
                  <div className="w-12 h-px bg-primary/30 mb-6"></div>
                  <p className="text-lg text-base-content/80 leading-relaxed mb-8">
                    {selectedCard.descripcion_web}
                  </p>

                  {/* Variant Details */}
                  {selectedCard.variantes && selectedCard.variantes.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-light tracking-wide text-base-content/60 mb-3">VARIANTES DISPONIBLES</h3>
                      <div className="grid grid-cols-1 gap-2">
                        {selectedCard.variantes.map(variant => (
                          <div
                            key={variant.variant_id}
                            className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-full border-2 border-base-content/20"
                                style={{ backgroundColor: variant.color_hex }}
                              ></div>
                              <div>
                                <p className="font-light">{variant.color} - Talle {variant.talle}</p>
                                <p className="text-xs text-base-content/60">Stock: {variant.stock} unidades</p>
                              </div>
                            </div>
                            {variant.stock === 0 && (
                              <span className="badge badge-error badge-sm">Sin stock</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mt-8 pt-6 border-t border-base-300">
                    <button
                      className="btn btn-ghost font-light tracking-wide w-full sm:w-auto"
                      onClick={() => setSelectedCard(null)}
                    >
                      CERRAR
                    </button>
                    <button 
                      className="btn btn-primary btn-lg font-light tracking-wide px-8 gap-2 w-full sm:w-auto"
                      disabled={selectedCard.stock_disponible === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCard(null);
                        handleAddToCartClick(selectedCard, null);
                      }}
                    >
                      <ShoppingCart size={20} />
                      AGREGAR AL CARRITO
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}  
      </AnimatePresence>
    </div>
  ) 
}
