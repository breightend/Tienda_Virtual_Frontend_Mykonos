import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { fetchProducts, fetchProductsByGroupName } from "../services/productService";
import CategoryFilter from "../components/CategoryFilter";

export default function StorePage() {
  const [selectedCard, setSelectedCard] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        let data;
        
        if (selectedCategory) {
          // Fetch products filtered by selected category (includes all children)
          data = await fetchProductsByGroupName(selectedCategory.group_name);
        } else {
          // Fetch all products
          data = await fetchProducts();
        }
        
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error("Error loading products:", err);
        setError("No se pudieron cargar los productos. Por favor, intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [selectedCategory]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  // Get unique colors and sizes from variants
  const getUniqueColors = (variantes) => {
    const colorMap = new Map();
    variantes.forEach(v => {
      if (!colorMap.has(v.color)) {
        colorMap.set(v.color, v.color_hex);
      }
    });
    return Array.from(colorMap.entries()).map(([color, hex]) => ({ color, hex }));
  };

  const getUniqueSizes = (variantes) => {
    return [...new Set(variantes.map(v => v.talle))];
  };

  return (
    <div className="bg-base-100 min-h-screen py-12 px-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-5xl font-light tracking-widest mb-4 text-base-content">
            COLECCIÓN
          </h1>
          <div className="w-16 h-px bg-primary mx-auto mb-6"></div>
          <p className="text-base-content/70 text-lg font-light">
            Primavera / Verano 2025
          </p>
        </motion.div>
      </div>

      {/* Main Content: Sidebar + Products */}
      <div className="max-w-7xl mx-auto flex gap-8">
        {/* Category Filter Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:block"
        >
          <CategoryFilter 
            onSelectCategory={handleCategorySelect}
            selectedCategory={selectedCategory}
          />
        </motion.div>

        {/* Products Section */}
        <div className="flex-1">
          {/* Selected Category Info */}
          {selectedCategory && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center gap-3"
            >
              <span className="text-base-content/60 font-light">Mostrando:</span>
              <span className="badge badge-primary badge-lg font-light tracking-wide">
                {selectedCategory.group_name}
              </span>
              <button
                onClick={() => setSelectedCategory(null)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          )}

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                        src={product.images[0] || "https://via.placeholder.com/400x600"}
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
                        ${product.precio_web.toFixed(2)}
                      </p>
                      
                      {/* Colors */}
                      <div className="mb-3">
                        <p className="text-xs text-base-content/60 mb-2 font-light tracking-wide">COLORES</p>
                        <div className="flex gap-2 flex-wrap">
                          {uniqueColors.map(({ color, hex }) => (
                            <div
                              key={color}
                              className="tooltip"
                              data-tip={color}
                            >
                              <div
                                className="w-6 h-6 rounded-full border-2 border-base-content/20 hover:border-primary transition-colors"
                                style={{ backgroundColor: hex }}
                              ></div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Sizes */}
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

                      <div className="card-actions justify-end mt-4">
                        <button className="btn btn-primary btn-sm font-light tracking-wide">
                          VER DETALLES
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
              className="fixed inset-0 flex items-center justify-center z-50 p-8"
              onClick={() => setSelectedCard(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="card bg-base-100 w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
              >
                <figure className="h-96">
                  <img
                    src={selectedCard.images[0] || "https://via.placeholder.com/800x600"}
                    alt={selectedCard.nombre_web}
                    className="w-full h-full object-cover"
                  />
                </figure>
                <div className="card-body p-8">
                  <h2 className="text-3xl font-light text-base-content tracking-wide mb-2">
                    {selectedCard.nombre_web}
                  </h2>
                  <p className="text-2xl text-primary font-light mb-6">
                    ${selectedCard.precio_web.toFixed(2)}
                  </p>
                  <div className="w-12 h-px bg-primary/30 mb-6"></div>
                  <p className="text-lg text-base-content/80 leading-relaxed mb-8">
                    {selectedCard.descripcion_web}
                  </p>

                  {/* Variant Details */}
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

                  <div className="card-actions justify-between items-center mt-8">
                    <button
                      className="btn btn-ghost font-light tracking-wide"
                      onClick={() => setSelectedCard(null)}
                    >
                      CERRAR
                    </button>
                    <button 
                      className="btn btn-primary btn-lg font-light tracking-wide px-8"
                      disabled={selectedCard.stock_disponible === 0}
                    >
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
  );
}
