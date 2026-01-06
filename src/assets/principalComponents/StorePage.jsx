import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef } from "react";
import {
  fetchProducts,
  fetchProductsByGroupName,
} from "../services/productService";
import { getWebProductsVariantsByBranch } from "../services/branchService";
import CategoryFilter from "../components/CategoryFilter";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "wouter";
import { ShoppingCart, Filter, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [thumbnailPage, setThumbnailPage] = useState(0);

  const THUMBNAILS_PER_PAGE = 5;

  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  const modalRef = useRef(null);

  const nextImage = (product, e) => {
    if (e) e.stopPropagation();
    setCurrentImageIndex((prev) => {
      const nextIdx = prev === product.images.length - 1 ? 0 : prev + 1;
      const newPage = Math.floor(nextIdx / THUMBNAILS_PER_PAGE);
      setThumbnailPage(newPage);
      return nextIdx;
    });
  };

  const previousImage = (product, e) => {
    if (e) e.stopPropagation();
    setCurrentImageIndex((prev) => {
      const prevIdx = prev === 0 ? product.images.length - 1 : prev - 1;
      const newPage = Math.floor(prevIdx / THUMBNAILS_PER_PAGE);
      setThumbnailPage(newPage);
      return prevIdx;
    });
  };

  const handleCardClick = (product) => {
    setCurrentImageIndex(0);
    setThumbnailPage(0);
    setSelectedCard(product);
  };

  const getPaginatedThumbnails = (images) => {
    const startIdx = thumbnailPage * THUMBNAILS_PER_PAGE;
    const endIdx = startIdx + THUMBNAILS_PER_PAGE;
    return images.slice(startIdx, endIdx);
  };

  const getTotalPages = (images) => {
    return Math.ceil(images.length / THUMBNAILS_PER_PAGE);
  };

  const canGoToPrevPage = () => thumbnailPage > 0;
  const canGoToNextPage = (images) => thumbnailPage < getTotalPages(images) - 1;

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/400x600";
    if (imagePath.startsWith("http")) return imagePath;
    const imageBaseUrl =
      import.meta.env.VITE_API_URL || "http://localhost:8000";
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

        if (selectedBranch) {
          const productsWithBranchStock = await Promise.all(
            data.map(async (product) => {
              try {
                const branchData = await getWebProductsVariantsByBranch(
                  product.id,
                  selectedBranch.id
                );

                if (
                  branchData &&
                  branchData.length > 0 &&
                  branchData[0].variants
                ) {
                  const branchVariants = branchData[0].variants;

                  const availableVariants = branchVariants.filter(
                    (v) => v.quantity > 0
                  );

                  if (availableVariants.length === 0) {
                    return null;
                  }

                  return {
                    ...product,
                    variantes: availableVariants.map((v) => ({
                      variant_id: v.variant_id,
                      talle: v.size,
                      color: v.color,
                      color_hex: v.color_hex,
                      stock: v.quantity,
                    })),
                    stock_disponible: availableVariants.reduce(
                      (sum, v) => sum + v.quantity,
                      0
                    ),
                  };
                }
                return null;
              } catch (err) {
                console.error(
                  `Error fetching variants for product ${product.id}:`,
                  err
                );
                return null;
              }
            })
          );

          data = productsWithBranchStock.filter((p) => p !== null);
        } else {
          // When no branch is selected, log the raw data structure
          console.log(
            "🔍 Products from backend (no branch):",
            JSON.stringify(data, null, 2)
          );

          // When no branch is selected, normalize variant structure
          data = data.map((product) => {
            if (product.variantes && product.variantes.length > 0) {
              console.log(
                `🔍 BEFORE normalization - Product ${product.id} (${product.nombre_web}):`,
                JSON.stringify(product.variantes, null, 2)
              );

              const normalizedVariants = product.variantes.map((v) => {
                const normalized = {
                  variant_id: v.variant_id || v.id,
                  talle: v.talle || v.size,
                  color: v.color,
                  color_hex: v.color_hex,
                  stock: v.stock || v.quantity,
                };
                console.log(`🔍 Variant mapping for product ${product.id}:`, {
                  original: v,
                  normalized: normalized,
                  "v.variant_id": v.variant_id,
                  "v.id": v.id,
                });
                return normalized;
              });

              console.log(
                `🔍 AFTER normalization - Product ${product.id}:`,
                normalizedVariants
              );
              return {
                ...product,
                variantes: normalizedVariants,
              };
            }
            return product;
          });
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
  }, [selectedCategory, selectedBranch]);

  const getUniqueColors = (variantes) => {
    if (!variantes || variantes.length === 0) return [];
    const colorMap = new Map();
    variantes.forEach((v) => {
      if (v.color && !colorMap.has(v.color)) {
        colorMap.set(v.color, v.color_hex || "#cccccc");
      }
    });
    return Array.from(colorMap.entries()).map(([color, hex]) => ({
      color,
      hex,
    }));
  };

  const getUniqueSizes = (variantes) => {
    if (!variantes || variantes.length === 0) return [];
    const sizes = variantes.map((v) => v.talle).filter(Boolean);
    return [...new Set(sizes)];
  };

  const handleAddToCartClick = (product, e) => {
    if (e) e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para agregar productos al carrito");
      setLocation("/login");
      return;
    }

    const price = product.precio_web || product.sale_price;
    if (!price || price <= 0) {
      toast.error("Este producto no tiene un precio válido configurado");
      console.error("Product without valid price:", {
        id: product.id,
        name: product.nombre_web,
        precio_web: product.precio_web,
        sale_price: product.sale_price,
      });
      return;
    }

    if (!product.variantes || product.variantes.length === 0) {
      toast.error("Este producto no tiene variantes disponibles");
      console.error("Product without variants:", product);
      return;
    }


    if (product.variantes.length === 1) {
      const variantId = product.variantes[0].variant_id;
      console.log("Single variant - Using variant_id:", variantId);
      addToCartDirectly(product.id, 1, variantId);
    } else {
      setSelectedProduct(product);
      setSelectedColor(null);
      setSelectedSize(null);
      setQuantity(1);
      setShowVariantModal(true);
      setTimeout(() => modalRef.current?.showModal(), 100);
    }
  };

  const addToCartDirectly = async (productId, qty, variantId) => {
    try {
      setAddingToCart(true);
      const result = await addToCart(productId, qty, variantId);

      if (result.success) {
        toast.success("¡Producto agregado al carrito!");
        console.log("Added to cart:", { productId, qty, variantId });
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

    const price = selectedProduct.precio_web || selectedProduct.sale_price;
    if (!price || price <= 0) {
      toast.error("Este producto no tiene un precio válido configurado");
      console.error("Product without valid price in modal:", {
        id: selectedProduct.id,
        name: selectedProduct.nombre_web,
        precio_web: selectedProduct.precio_web,
        sale_price: selectedProduct.sale_price,
      });
      closeVariantModal();
      return;
    }

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
    let variantId = null;

    if (selectedProduct.variantes && selectedProduct.variantes.length > 0) {
      if (selectedProduct.variantes.length === 1) {
        variantId = selectedProduct.variantes[0].variant_id;
      } else {
        const selectedVariant = selectedProduct.variantes.find(
          (v) =>
            (uniqueColors.length === 0 || v.color === selectedColor) &&
            (uniqueSizes.length === 0 || v.talle === selectedSize)
        );

        if (!selectedVariant) {
          toast.error("Esta combinación de color y talle no está disponible");
          return;
        }
        variantId = selectedVariant.variant_id;
      }
    }



    try {
      setAddingToCart(true);
      const result = await addToCart(selectedProduct.id, quantity, variantId);

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
        <div className="max-w-7xl mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl font-light tracking-widest mb-4 text-base-content">
                COLECCIÓN
              </h1>
              <div className="w-16 h-px bg-primary mx-auto"></div>
            </motion.div>
          </div>

          {/* Toggle Filter Button - Desktop only */}
          <div className="hidden md:flex justify-end mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-sm btn-ghost gap-2 hover:btn-primary"
            >
              {showFilters ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                  Ocultar Filtros
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                  Mostrar Filtros
                </>
              )}
            </button>
          </div>

          {/* Main Content - Full Width with Filters Flush Left */}
          <div className="flex md:flex-row flex-col gap-8">
            {/* Left Sidebar - Filters (Collapsible on desktop) */}
            {showFilters && (
              <div className="w-full md:w-64 md:flex-shrink-0">
              <CategoryFilter
                onSelectCategory={setSelectedCategory}
                selectedCategory={selectedCategory}
                onSelectBranch={setSelectedBranch}
                selectedBranch={selectedBranch}
              />

              {/* Active Filters Display */}
              {(selectedCategory || selectedBranch) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-base-200 rounded-lg space-y-3"
                >
                  {selectedCategory && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">
                          Categoría:
                        </span>
                        <button
                          onClick={() => setSelectedCategory(null)}
                          className="btn btn-ghost btn-xs btn-circle"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                      <span className="badge badge-primary badge-sm">
                        {selectedCategory.group_name}
                      </span>
                    </div>
                  )}

                  {selectedBranch && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">Sucursal:</span>
                        <button
                          onClick={() => setSelectedBranch(null)}
                          className="btn btn-ghost btn-xs btn-circle"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                      <span className="badge badge-secondary badge-sm">
                        {selectedBranch.name}
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
            )}

            {/* Right Content - Products */}
            <div className="flex-1 min-w-0">
            {/* Loading State */}
            {loading && (
              <div className="flex flex-col justify-center items-center min-h-[400px] gap-8">
                {/* Animated SVG Logo */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-32 h-32"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 800 800"
                    width="100%"
                    height="100%"
                  >
                    {/* Cuadrado completo (superior izquierdo) - animado */}
                    <motion.rect
                      x="40"
                      y="40"
                      width="300"
                      height="300"
                      fill="none"
                      stroke="#FF6B1A"
                      strokeWidth="16"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{
                        pathLength: 0,
                        opacity: 0,
                      }}
                      animate={{
                        pathLength: [0, 1, 1],
                        opacity: [0, 1, 1],
                      }}
                      transition={{
                        pathLength: {
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          times: [0, 0.5, 1],
                        },
                        opacity: {
                          duration: 0.3,
                          repeat: Infinity,
                          repeatDelay: 1.7,
                        },
                      }}
                    />

                    {/* Cuadrado incompleto (forma en L) - animado con delay */}
                    <motion.path
                      d="M 90 390 L 90 760 L 760 760 L 760 90 L 380 90 L 380 390 Z"
                      fill="none"
                      stroke="#FF6B1A"
                      strokeWidth="16"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{
                        pathLength: 0,
                        opacity: 0,
                      }}
                      animate={{
                        pathLength: [0, 1, 1],
                        opacity: [0, 1, 1],
                      }}
                      transition={{
                        pathLength: {
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.3,
                          times: [0, 0.5, 1],
                        },
                        opacity: {
                          duration: 0.3,
                          repeat: Infinity,
                          repeatDelay: 1.7,
                          delay: 0.3,
                        },
                      }}
                    />
                  </svg>
                </motion.div>

                {/* Loading text */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="text-base-content/60 text-lg font-light tracking-wide"
                >
                  Cargando productos...
                </motion.p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="alert alert-error">
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product, index) => {
                  const uniqueColors = getUniqueColors(product.variantes);
                  const uniqueSizes = getUniqueSizes(product.variantes);
                  const hasValidPrice =
                    product.precio_web || product.sale_price;
                  const isAvailable =
                    product.stock_disponible > 0 && hasValidPrice;

                  return (
                    <motion.div
                      key={product.id}
                      onClick={() => handleCardClick(product)}
                      className="card bg-base-200 shadow-lg hover:shadow-xl cursor-pointer group"
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ y: -8 }}
                    >
                      <figure className="relative overflow-hidden aspect-[3/4] group">
                        {/* Image */}
                        <img
                          src={getImageUrl(product.images[0])}
                          alt={product.nombre_web}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />

                        {/* Discount Badge */}
                        {product.discount_percentage > 0 && (
                          <div className="absolute top-2 right-2 z-10">
                            <div className="badge badge-error badge-lg gap-1 shadow-lg">
                              <span className="text-lg font-bold">
                                {product.discount_percentage}%
                              </span>
                              <span className="text-xs">OFF</span>
                            </div>
                          </div>
                        )}

                        {/* Carousel indicators */}
                        {product.images && product.images.length > 1 && (
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                            {product.images.map((_, idx) => (
                              <div
                                key={idx}
                                className="w-1.5 h-1.5 rounded-full bg-white/60 transition-all"
                              />
                            ))}
                          </div>
                        )}

                        {/* Overlay badges */}
                        {product.stock_disponible === 0 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white text-xl font-light tracking-wide">
                              SIN STOCK
                            </span>
                          </div>
                        )}
                        {!hasValidPrice && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white text-xl font-light tracking-wide">
                              PRECIO NO DISPONIBLE
                            </span>
                          </div>
                        )}
                      </figure>
                      <div className="card-body p-6">
                        <h2 className="card-title text-xl font-light text-base-content tracking-wide">
                          {product.nombre_web}
                        </h2>

                        {/* Price with discount */}
                        {product.discount_percentage > 0 ? (
                          <div className="mb-2">
                            <p className="text-base-content/50 font-light text-sm line-through">
                              $
                              {(
                                product.precio_web ||
                                product.sale_price ||
                                0
                              ).toFixed(2)}
                            </p>
                            <p className="text-error font-semibold text-2xl">
                              $
                              {(
                                (product.precio_web ||
                                  product.sale_price ||
                                  0) *
                                (1 - product.discount_percentage / 100)
                              ).toFixed(2)}
                            </p>
                          </div>
                        ) : (
                          <p className="text-primary font-light text-lg mb-2">
                            $
                            {(
                              product.precio_web ||
                              product.sale_price ||
                              0
                            ).toFixed(2)}
                          </p>
                        )}

                        {/* Colors */}
                        {uniqueColors.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-base-content/60 mb-2 font-light tracking-wide">
                              COLORES
                            </p>
                            <div className="flex gap-2 flex-wrap">
                              {uniqueColors.map(({ color, hex }) => (
                                <div
                                  key={color}
                                  className="flex items-center gap-1 badge badge-outline badge-sm"
                                >
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
                            <p className="text-xs text-base-content/60 mb-2 font-light tracking-wide">
                              TALLES
                            </p>
                            <div className="flex gap-2 flex-wrap">
                              {uniqueSizes.map((size) => (
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
                              handleCardClick(product);
                            }}
                            className="btn btn-ghost btn-sm font-light tracking-wide"
                          >
                            VER DETALLES
                          </button>
                          <button
                            onClick={(e) => handleAddToCartClick(product, e)}
                            className="btn btn-primary btn-sm font-light tracking-wide gap-2"
                            disabled={!isAvailable}
                            title={
                              !hasValidPrice
                                ? "Precio no disponible"
                                : product.stock_disponible === 0
                                ? "Sin stock"
                                : "Agregar al carrito"
                            }
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
              <h3 className="font-bold text-lg">
                {selectedProduct.nombre_web}
              </h3>

              {/* Price with discount in modal */}
              {selectedProduct.discount_percentage > 0 ? (
                <div className="my-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="badge badge-error gap-1">
                      <span className="font-bold">
                        {selectedProduct.discount_percentage}%
                      </span>
                      <span className="text-xs">OFF</span>
                    </div>
                  </div>
                  <p className="text-base-content/50 text-sm line-through">
                    $
                    {(
                      selectedProduct.precio_web ||
                      selectedProduct.sale_price ||
                      0
                    ).toFixed(2)}
                  </p>
                  <p className="text-error text-2xl font-bold">
                    $
                    {(
                      (selectedProduct.precio_web ||
                        selectedProduct.sale_price ||
                        0) *
                      (1 - selectedProduct.discount_percentage / 100)
                    ).toFixed(2)}
                  </p>
                </div>
              ) : (
                <p className="text-primary text-xl font-bold my-4">
                  $
                  {(
                    selectedProduct.precio_web ||
                    selectedProduct.sale_price ||
                    0
                  ).toFixed(2)}
                </p>
              )}

              {/* Color Selection */}
              {getUniqueColors(selectedProduct.variantes).length > 0 && (
                <div className="mb-4">
                  <label className="label">
                    <span className="label-text font-semibold">Color *</span>
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {getUniqueColors(selectedProduct.variantes).map(
                      ({ color, hex }) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`btn btn-sm gap-2 ${
                            selectedColor === color
                              ? "btn-primary"
                              : "btn-outline"
                          }`}
                        >
                          <div
                            className="w-4 h-4 rounded-full border-2 border-base-content/30"
                            style={{ backgroundColor: hex }}
                          />
                          {color}
                        </button>
                      )
                    )}
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
                    {getUniqueSizes(selectedProduct.variantes).map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`btn btn-sm ${
                          selectedSize === size ? "btn-primary" : "btn-outline"
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
                  <span className="text-xl font-bold w-12 text-center">
                    {quantity}
                  </span>
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
                {/* Carousel Container */}
                <div className="flex flex-col md:flex-row h-auto md:h-[85vh] max-h-[90vh]">
                  {/* Left Side - Image Gallery with Hover Effect */}
                  <div className="w-full md:w-1/2 relative bg-base-200 flex items-center justify-center p-4 md:p-8">
                    {/* Conditional: Use hover-gallery only for multiple images */}
                    {selectedCard.images && selectedCard.images.length > 1 ? (
                      /* DaisyUI Hover Gallery - For 2-10 images */
                      <figure className="hover-gallery relative w-full h-[50vh] md:h-full max-h-[600px] md:max-h-full rounded-lg overflow-hidden shadow-xl">
                        {selectedCard.images.slice(0, 10).map((img, idx) => (
                          <img
                            key={idx}
                            src={getImageUrl(img)}
                            alt={`${selectedCard.nombre_web} - ${idx + 1}`}
                            className="w-full h-full object-contain"
                          />
                        ))}
                      </figure>
                    ) : (
                      /* Single Image - No hover effect */
                      <figure className="relative w-full h-[50vh] md:h-full max-h-[600px] md:max-h-full rounded-lg overflow-hidden shadow-xl">
                        <img
                          src={getImageUrl(selectedCard.images[0])}
                          alt={selectedCard.nombre_web}
                          className="w-full h-full object-contain"
                        />
                      </figure>
                    )}
                    
                    {/* Discount Badge - Outside figure to avoid interference */}
                    {selectedCard.discount_percentage > 0 && (
                      <div className="absolute top-8 right-8 z-20 pointer-events-none">
                        <div className="badge badge-error badge-lg gap-1 shadow-lg">
                          <span className="text-lg font-bold">
                            {selectedCard.discount_percentage}%
                          </span>
                          <span className="text-xs">OFF</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Image Counter - Only show for multiple images */}
                    {selectedCard.images && selectedCard.images.length > 1 && (
                      <div className="absolute bottom-8 right-8 bg-base-100/90 px-3 py-1.5 rounded-full text-sm font-light z-20 backdrop-blur-sm pointer-events-none">
                        {selectedCard.images.length > 10 
                          ? `10 de ${selectedCard.images.length} imágenes` 
                          : `${selectedCard.images.length} imágenes`}
                      </div>
                    )}
                    
                    {/* Info hint for hover - Only show for multiple images */}
                    {selectedCard.images && selectedCard.images.length > 1 && (
                      <div className="absolute top-8 left-8 bg-base-100/90 px-3 py-1.5 rounded-lg text-xs font-light z-20 backdrop-blur-sm pointer-events-none opacity-70">
                        <span className="hidden md:block">← Mueve el mouse →</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Right Side - Product Information */}
                  <div className="w-full md:w-1/2 overflow-y-auto p-6 md:p-8 lg:p-10 bg-base-100">
                    <div className="max-w-xl mx-auto">
                      <h2 className="text-3xl md:text-4xl font-light text-base-content tracking-wide mb-3">
                        {selectedCard.nombre_web}
                      </h2>
                      
                      {/* Price Section */}
                      {selectedCard.discount_percentage > 0 ? (
                        <div className="mb-6">
                          <p className="text-base-content/50 font-light text-lg line-through mb-1">
                            ${(selectedCard.precio_web || selectedCard.sale_price || 0).toFixed(2)}
                          </p>
                          <p className="text-error font-semibold text-3xl md:text-4xl">
                            ${(
                              (selectedCard.precio_web || selectedCard.sale_price || 0) *
                              (1 - selectedCard.discount_percentage / 100)
                            ).toFixed(2)}
                          </p>
                        </div>
                      ) : (
                        <p className="text-primary font-light text-3xl md:text-4xl mb-6">
                          ${(selectedCard.precio_web || selectedCard.sale_price || 0).toFixed(2)}
                        </p>
                      )}
                      
                      <div className="w-16 h-px bg-primary/30 mb-6"></div>
                      
                      {/* Description */}
                      <p className="text-base md:text-lg text-base-content/80 leading-relaxed mb-8 font-light">
                        {selectedCard.descripcion_web || "Sin descripción disponible"}
                      </p>
                      
                      {/* Stock Information */}
                      <div className="mb-6">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-light tracking-wide text-base-content/60">
                            DISPONIBILIDAD:
                          </span>
                          <span
                            className={`badge ${
                              selectedCard.stock_disponible > 0
                                ? "badge-success"
                                : "badge-error"
                            }`}
                          >
                            {selectedCard.stock_disponible > 0
                              ? `${selectedCard.stock_disponible} unidades disponibles`
                              : "Sin stock"}
                          </span>
                        </div>
                      </div>
                      
                      {/* Variant Details */}
                      {selectedCard.variantes && selectedCard.variantes.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-sm font-light tracking-widest text-base-content/60 mb-4">
                            VARIANTES DISPONIBLES
                          </h3>
                          <div className="grid grid-cols-1 gap-3">
                            {selectedCard.variantes.map((variant) => (
                              <div
                                key={variant.variant_id}
                                className="flex items-center justify-between p-4 bg-base-200/50 rounded-lg hover:bg-base-200 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-10 h-10 rounded-full border-2 border-base-content/20 flex-shrink-0"
                                    style={{ backgroundColor: variant.color_hex }}
                                  ></div>
                                  <div>
                                    <p className="font-light text-base">
                                      {variant.color} - Talle {variant.talle}
                                    </p>
                                    <p className="text-xs text-base-content/60">
                                      Stock: {variant.stock} unidades
                                    </p>
                                  </div>
                                </div>
                                {variant.stock === 0 && (
                                  <span className="badge badge-error badge-sm">
                                    Sin stock
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col gap-3 mt-8 pt-6 border-t border-base-300">
                        <button
                          className="btn btn-primary btn-lg font-light tracking-wide w-full gap-2"
                          disabled={selectedCard.stock_disponible === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCard(null);
                            handleAddToCartClick(selectedCard, null);
                          }}
                        >
                          <ShoppingCart size={20} />
                          {selectedCard.stock_disponible === 0
                            ? "SIN STOCK"
                            : "AGREGAR AL CARRITO"}
                        </button>
                        <button
                          className="btn btn-ghost font-light tracking-wide w-full"
                          onClick={() => setSelectedCard(null)}
                        >
                          CERRAR
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
    </div>
  );
}
