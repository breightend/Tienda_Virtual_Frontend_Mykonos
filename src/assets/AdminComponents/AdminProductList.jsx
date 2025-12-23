import AdminLayout from "../AdminComponents/AdminLayout";
import EditProduct from "../AdminComponents/EditProduct";
import AdminNewProduct from "../AdminComponents/AdminNewProduct";
import { useState, useEffect } from "react";
import {
  fetchProducts,
  fetchAllProducts,
  toggleProductOnline,
  searchProductsByBarcodeAdmin,
  searProductByIdAdmin,
} from "../services/productService";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";
import { Plus, Search, X, BrushCleaning } from "lucide-react";

export default function AdminProductList() {
  const [onlineProducts, setOnlineProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [searchBarcode, setSearchBarcode] = useState("");
  const [searchOnlineBarcode, setSearchOnlineBarcode] = useState("");
  const [filteredOnlineProducts, setFilteredOnlineProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    nombre_web: "",
    descripcion_web: "",
    precio_web: "",
    slug: "",
  });

  useEffect(() => {
    loadOnlineProducts();
  }, []);

  const loadOnlineProducts = async () => {
    try {
      setLoading(true);
      const products = await fetchProducts();
      setOnlineProducts(products);
      setFilteredOnlineProducts(products);
      setError(null);
    } catch (error) {
      console.error("Error loading products:", error);
      setError("Error loading products");
    } finally {
      setLoading(false);
    }
  };

  console.log("Online Products:", onlineProducts);
  const handleBarcodeSearch = async () => {
    if (!searchBarcode.trim()) {
      toast.error("Por favor ingresa un código de barras");
      return;
    }

    try {
      setSearchLoading(true);
      setError(null);
      console.log("🔍 Buscando productos con código:", searchBarcode);
      const products = await fetchAllProducts(searchBarcode);
      console.log("📦 Productos recibidos del backend:", products);
      console.log("📦 Tipo de productos:", typeof products);
      console.log("📦 Es array?:", Array.isArray(products));

      // Asegurar que products sea un array
      const productsArray = Array.isArray(products)
        ? products
        : products
        ? [products]
        : [];
      console.log("📦 Productos como array:", productsArray);

      if (productsArray.length === 0) {
        toast.error("No se encontraron productos con ese código de barras");
        setAllProducts([]);
      } else {
        setAllProducts(productsArray);
        setShowAddModal(true);
        toast.success(`${productsArray.length} producto(s) encontrado(s)`);
      }
    } catch (error) {
      console.error("Error searching products:", error);
      toast.error("Error al buscar productos");
      setAllProducts([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Filter online products by barcode
  const handleOnlineProductSearch = async () => {
    if (!searchOnlineBarcode.trim()) {
      setFilteredOnlineProducts(onlineProducts);
      setError(null);
      return;
    }

    try {
      setSearchLoading(true);
      setError(null);
      const results = await searchProductsByBarcodeAdmin(searchOnlineBarcode);

      const resultsArray = Array.isArray(results) ? results : [results];

      const onlineResults = resultsArray.filter((p) => p && p.en_tienda_online);

      if (onlineResults.length === 0) {
        toast.error(
          "No se encontraron productos en línea con ese código de barras"
        );
        setFilteredOnlineProducts([]);
      } else {
        setFilteredOnlineProducts(onlineResults);
        toast.success(`${onlineResults.length} producto(s) encontrado(s)`);
      }
    } catch (error) {
      console.error("Error searching online products:", error);
      toast.error("Error al buscar productos");
      setFilteredOnlineProducts([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Clear online product search
  const handleClearOnlineSearch = () => {
    setSearchOnlineBarcode("");
    setFilteredOnlineProducts(onlineProducts);
    setError(null);
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setFormData({
      nombre_web: product.product_name || "",
      descripcion_web: product.description || "",
      precio_web: product.sale_price || "",
      slug: "",
    });
  };

  const handleAddToOnlineStore = async () => {
    if (!selectedProduct) {
      setError("Please select a product");
      return;
    }

    if (!formData.nombre_web || !formData.precio_web) {
      setError("Product name and price are required");
      return;
    }

    try {
      setLoading(true);
      await toggleProductOnline(selectedProduct.id, {
        en_tienda_online: true,
        nombre_web: formData.nombre_web,
        descripcion_web: formData.descripcion_web,
        precio_web: parseFloat(formData.precio_web),
        slug: formData.slug || undefined,
      });

      await loadOnlineProducts();

      setShowAddModal(false);
      setSelectedProduct(null);
      setSearchBarcode("");
      setAllProducts([]);
      setFormData({
        nombre_web: "",
        descripcion_web: "",
        precio_web: "",
        slug: "",
      });
      setError(null);
    } catch (error) {
      console.error("Error al agregar productos a la tienda online:", error);
      setError(error.detail || "Error al agregar producto a la tienda online");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromOnlineStore = async (productId) => {
    if (
      !confirm(
        "¿Está seguro de que desea eliminar este producto de la tienda en línea?"
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await toggleProductOnline(productId, {
        en_tienda_online: false,
      });

      // Reload products
      await loadOnlineProducts();
      setError(null);
    } catch (error) {
      console.error("Error removing product:", error);
      setError("Error removing product from online store");
    } finally {
      setLoading(false);
    }
  };

  // Handle double click to edit product
  const handleProductDoubleClick = (product) => {
    setEditingProduct(product);
  };

  const handleCloseEditModal = () => {
    setEditingProduct(null);
  };

  const handleProductUpdated = async () => {
    await loadOnlineProducts();
  };


  if (newProduct) {
    return (
      <AdminNewProduct
        product={newProduct}
        onClose={() => setNewProduct(null)}
        onProductAdded={handleProductUpdated}
      />
    );
  }

  // Si hay un producto siendo editado, mostrar la página de edición
  if (editingProduct) {
    return (
      <EditProduct
        product={editingProduct}
        onClose={handleCloseEditModal}
        onProductUpdated={handleProductUpdated}
      />
    );
  }

  return (
    <AdminLayout>
      <div>
        <h1 className="text-4xl font-bold mb-2 tracking-wide">
          Gestor de productos
        </h1>
        <p className="text-base-content/60 mb-8">
          Gestiona los productos en la tienda online
        </p>

        {/* Error Alert */}
        {error && (
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
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="btn btn-sm btn-ghost"
            >
              ✕
            </button>
          </div>
        )}

        {/* Add Product Section */}
        <div className="card bg-base-100 shadow-lg mb-8">
          <div className="card-body">
            <h2 className="card-title text-primary">
              Agregar productos en la tienda virtual{" "}
            </h2>
            <p className="text-sm text-base-content/60 mb-4"></p>

            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Ingresa el código de barras del producto"
                className="input input-bordered flex-1"
                value={searchBarcode}
                onChange={(e) => setSearchBarcode(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleBarcodeSearch()}
              />
              <button
                className="btn btn-primary"
                onClick={handleBarcodeSearch}
                disabled={searchLoading}
              >
                {searchLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <Search className=" h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Online Products List */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title text-primary">
                Productos en la tienda online:
              </h2>
              <div className="badge badge-info badge-sm">
                Doble clic en cualquier fila para editar
              </div>
            </div>

            {/* Search filter for online products */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Buscar por código de barras..."
                className="input input-bordered flex-1"
                value={searchOnlineBarcode}
                onChange={(e) => setSearchOnlineBarcode(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && handleOnlineProductSearch()
                }
              />
              <button
                className="btn btn-primary"
                onClick={handleOnlineProductSearch}
                disabled={searchLoading}
              >
                {searchLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "Buscar"
                )}
              </button>
              {searchOnlineBarcode && (
                <button
                  className="btn btn-ghost"
                  onClick={handleClearOnlineSearch}
                >
                  Limpiar
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : filteredOnlineProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-base-content/60">
                  {searchOnlineBarcode
                    ? "No se encontraron productos con ese código de barras"
                    : "No products in online store yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Imagen</th>
                      <th>Nombre</th>
                      <th>Proveedor</th>
                      <th>Categoría</th>
                      <th>Precio original web</th>
                      <th>Descuento</th>
                      <th>Precio final web</th>
                      <th>Stock</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOnlineProducts.map((product) => {
                      // Calcular stock real sumando el stock de todas las variantes
                      const stockTotal =
                        product.variantes?.reduce((total, variant) => {
                          return total + (variant.stock || 0);
                        }, 0) || 0;

                      return (
                        <tr
                          key={product.id}
                          onDoubleClick={() =>
                            handleProductDoubleClick(product)
                          }
                          className="cursor-pointer hover:bg-base-200 transition-colors"
                          title="Double click to edit"
                        >
                          <td>{product.id}</td>
                          <td>
                            {product.images && product.images.length > 0 ? (
                              <div className="avatar">
                                <div className="w-12 h-12 rounded">
                                  <img
                                    src={`${
                                      import.meta.env.VITE_API_URL ||
                                      "http://localhost:3000"
                                    }${product.images[0]}`}
                                    alt={product.nombre_web}
                                    className="object-cover"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="w-12 h-12 bg-base-300 rounded flex items-center justify-center">
                                <span className="text-xs">Sin imagen</span>
                              </div>
                            )}
                          </td>
                          <td className="font-medium">{product.nombre_web}</td>
                          <td className="text-sm">{product.provider || "-"}</td>
                          <td className="text-sm">{product.category || "-"}</td>
                          <td className="font-semibold text-primary">
                            ${(product.precio_web || 0).toLocaleString("es-AR")}
                          </td>
                          <td>
                            {product.discount_percentage ? (
                              <div className="flex flex-wrap gap-1">
                                <span className="badge badge-info badge-sm">
                                  {product.discount_percentage}% off
                                </span>
                              </div>
                            ) : (
                              <span className="text-base-content/40">0%</span>
                            )}
                          </td>
                          <td className="font-bold text-accent">
                            $
                            {(
                              product.precio_web *
                              (1 - (product.discount_percentage || 0) / 100)
                            ).toLocaleString("es-AR")}
                          </td>

                          <td>
                            <div className="flex flex-col gap-1">
                              <span
                                className={`badge badge-sm ${
                                  stockTotal > 0
                                    ? "badge-success"
                                    : "badge-error"
                                }`}
                              >
                                {stockTotal} unidades
                              </span>
                              {product.variantes &&
                                product.variantes.length > 1 && (
                                  <span className="text-xs text-base-content/60">
                                    {product.variantes.length} variantes
                                  </span>
                                )}
                            </div>
                          </td>

                          <td>
                            <button
                              className="btn btn-sm btn-error btn-outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFromOnlineStore(product.id);
                              }}
                            >
                              <BrushCleaning className=" h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Add Product Modal */}
        <AnimatePresence>
          {showAddModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setShowAddModal(false);
                  setAllProducts([]);
                }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-0 flex items-center justify-center z-50 p-8"
              >
                <div className="card bg-base-100 w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto">
                  <div className="card-body">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="card-title text-2xl">
                        Resultados de búsqueda
                      </h2>
                      <button
                        onClick={() => {
                          setShowAddModal(false);
                          setAllProducts([]);
                        }}
                        className="btn btn-sm btn-circle btn-ghost"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {/* Search Results - Diseño horizontal */}
                    {allProducts.length > 0 && (
                      <div className="flex flex-col gap-4">
                        {allProducts.map((product) => (
                          <div
                            key={product.id}
                            className="card card-side bg-base-200 shadow-md hover:shadow-xl transition-all"
                          >
                            {/* Imagen del producto a la izquierda */}
                            <figure className="w-64 flex-shrink-0">
                              {product.image_url ? (
                                <img
                                  src={`${
                                    import.meta.env.VITE_API_URL ||
                                    "http://localhost:3000"
                                  }${product.image_url}`}
                                  alt={product.product_name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.parentElement.innerHTML =
                                      '<div class="w-full h-full flex items-center justify-center bg-base-300 text-base-content/40"><span>Sin imagen</span></div>';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-base-300 text-base-content/40">
                                  <span>Sin imagen</span>
                                </div>
                              )}
                            </figure>

                            {/* Información del producto a la derecha */}
                            <div className="card-body flex-1">
                              <h2 className="card-title text-xl">
                                {product.product_name}
                              </h2>

                              <div className="flex flex-wrap gap-2 mb-2">
                                <span className="badge badge-primary badge-sm">
                                  {product.group_name || "Sin grupo"}
                                </span>
                                <span
                                  className={`badge badge-sm ${
                                    product.en_tienda_online
                                      ? "badge-success"
                                      : "badge-ghost"
                                  }`}
                                >
                                  {product.en_tienda_online
                                    ? "✅ Ya en tienda"
                                    : "⭕ No publicado"}
                                </span>
                                {product.discount_percentage > 0 && (
                                  <span className="badge badge-warning badge-sm">
                                    {product.discount_percentage}% OFF
                                  </span>
                                )}
                              </div>

                              {product.description && (
                                <p className="text-sm text-base-content/70 line-clamp-2 mb-3">
                                  {product.description}
                                </p>
                              )}

                              <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                                <div>
                                  <p className="text-base-content/60">
                                    Código:
                                  </p>
                                  <p className="font-mono font-semibold">
                                    {product.provider_code}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-base-content/60">
                                    Precio:
                                  </p>
                                  <p className="font-bold text-primary text-lg">
                                    $
                                    {product.sale_price?.toLocaleString(
                                      "es-AR"
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-base-content/60">
                                    Proveedor:
                                  </p>
                                  <p className="font-semibold">
                                    {product.provider_name}
                                  </p>
                                </div>
                              </div>

                              <div className="card-actions justify-end">
                                {product.en_tienda_online ? (
                                  <button
                                    className="btn btn-outline"
                                    onClick={() => {
                                      const fullProduct = onlineProducts.find(
                                        (p) => p.id === product.id
                                      );
                                      if (fullProduct) {
                                        setEditingProduct(fullProduct);
                                        setShowAddModal(false);
                                      }
                                    }}
                                  >
                                    Editar producto
                                  </button>
                                ) : (
                                  <button
                                    className="btn btn-primary gap-2"
                                    onClick={async () => {
                                      try {
                                        setSearchLoading(true);
                                        console.log(
                                          "🔍 Obteniendo datos completos del producto ID:",
                                          product.id
                                        );
                                        const fullProductData =
                                          await searProductByIdAdmin(
                                            product.id
                                          );
                                        console.log(
                                          "✅ Datos completos obtenidos:",
                                          fullProductData
                                        );
                                        setNewProduct(fullProductData);
                                        setShowAddModal(false);
                                      } catch (error) {
                                        console.error(
                                          "Error obteniendo datos completos:",
                                          error
                                        );
                                        toast.error(
                                          "Error al cargar información completa del producto"
                                        );
                                      } finally {
                                        setSearchLoading(false);
                                      }
                                    }}
                                    disabled={searchLoading}
                                  >
                                    {searchLoading ? (
                                      <span className="loading loading-spinner loading-xs"></span>
                                    ) : (
                                      <Plus size={18} />
                                    )}
                                    Agregar a tienda web
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
