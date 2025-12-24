import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, ArrowLeft, Save, Info, Percent, Store } from "lucide-react";
import toast from "react-hot-toast";
import AdminLayout from "./AdminLayout";
import {
  uploadProductImage,
  toggleProductOnline,
  updateProductWithVariants,
} from "../services/productService";
import { getProductDetailsByVariantByBranch } from "../services/branchService";

export default function AdminNewProduct({ product, onClose, onProductAdded }) {
  const [formData, setFormData] = useState({
    nombre_web: "",
    descripcion_web: "",
    precio_web: "",
    slug: "",
    descuento: "",
    start_date: "",
    end_date: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [variantsByBranch, setVariantsByBranch] = useState([]);
  const [enTiendaOnline, setEnTiendaOnline] = useState(true);

  useEffect(() => {
    if (product) {
      console.log("📝 Producto para agregar:", product);
      setFormData({
        nombre_web: product.product_name || "",
        descripcion_web: product.description || "",
        precio_web: product.sale_price || "",
        slug: "",
        descuento: product.discount_percentage || "",
        start_date: "",
        end_date: "",
      });

      loadVariants();
    }
  }, [product]);

  console.log("Informacion del backedn: ", product);
  const loadVariants = async () => {
    if (!product) return;

    try {
      console.log(`🔄 Cargando variantes del producto ${product.id}...`);
      const variantsData = await getProductDetailsByVariantByBranch(product.id);

      const variantsWithWeb = (variantsData || []).map((branch) => ({
        ...branch,
        variants: (branch.variants || []).map((variant) => ({
          ...variant,
          id: variant.variant_id || variant.id,
          cantidad_web: 0, // Inicialmente 0 para producto nuevo
          mostrar_en_web: true, // Por defecto visible
        })),
      }));

      console.log("✅ Variantes cargadas:", variantsWithWeb);
      setVariantsByBranch(variantsWithWeb);
    } catch (error) {
      console.error("Error loading variants:", error);
      toast.error("Error al cargar variantes del producto");
      setVariantsByBranch([]);
    }
  };

  // Dropzone configuration
  const onDrop = useCallback((acceptedFiles) => {
    const newImages = acceptedFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
      })
    );
    setUploadedImages((prev) => [...prev, ...newImages]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxSize: 5242880, // 5MB
  });

  const removeUploadedImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateWebStock = (branchIndex, variantIndex, value) => {
    const updatedVariants = [...variantsByBranch];
    const variant = updatedVariants[branchIndex].variants[variantIndex];
    const maxStock = variant.quantity;

    if (value === "") {
      variant.cantidad_web = 0;
    } else if (/^\d+$/.test(value)) {
      const numValue = parseInt(value, 10);
      variant.cantidad_web = Math.max(0, Math.min(numValue, maxStock));
    }

    setVariantsByBranch(updatedVariants);
  };

  const handleToggleVariantVisibility = (branchIndex, variantIndex) => {
    const updatedVariants = [...variantsByBranch];
    updatedVariants[branchIndex].variants[variantIndex].mostrar_en_web =
      !updatedVariants[branchIndex].variants[variantIndex].mostrar_en_web;
    setVariantsByBranch(updatedVariants);
  };

  const handleRemoveDiscount = () => {
    setFormData({
      ...formData,
      descuento: "",
      start_date: "",
      end_date: "",
    });
    toast.success("Descuento eliminado");
  };

  const handleAddProduct = async () => {
    if (!product) return;

    if (!formData.nombre_web || !formData.precio_web) {
      toast.error("El nombre y precio son requeridos");
      return;
    }

    // Validar que la fecha desde no sea mayor que la fecha hasta
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.start_date) > new Date(formData.end_date)) {
        toast.error("La fecha desde no puede ser mayor que la fecha hasta");
        return;
      }
    }

    try {
      setLoading(true);

      // 1. Subir imágenes si hay
      if (uploadedImages.length > 0) {
        const uploadPromises = uploadedImages.map((file) =>
          uploadProductImage(product.id, file)
        );
        await Promise.all(uploadPromises);
        toast.success(`${uploadedImages.length} imágenes subidas`);
      }

      // 2. Preparar variantes
      const variantesMap = new Map();

      variantsByBranch.forEach((branch) => {
        branch.variants.forEach((variant) => {
          if (!variant.id) {
            console.warn("⚠️ Variante sin ID, saltando:", variant);
            return;
          }

          if (!variantesMap.has(variant.id)) {
            variantesMap.set(variant.id, {
              id: variant.id,
              mostrar_en_web: variant.mostrar_en_web !== false,
              configuracion_stock: [],
            });
          }

          const variantData = variantesMap.get(variant.id);
          if (variant.cantidad_web > 0) {
            variantData.configuracion_stock.push({
              sucursal_id: branch.branch_id,
              cantidad_asignada: variant.cantidad_web,
            });
          }
        });
      });

      const variantes = Array.from(variantesMap.values());

      // 3. Activar producto en tienda online primero
      await toggleProductOnline(product.id, {
        en_tienda_online: enTiendaOnline,
      });

      // 4. Actualizar producto con descuentos y variantes
      const productData = {
        nombre: formData.nombre_web,
        descripcion: formData.descripcion_web || "",
        precio_web: parseFloat(formData.precio_web),
        en_tienda_online: enTiendaOnline,
        discount_percentage: parseFloat(formData.descuento) || 0,
        variantes: variantes,
      };

      // Solo agregar fechas y affected_products si hay descuento
      if (formData.descuento && parseFloat(formData.descuento) > 0) {
        productData.affected_products = 1;

        if (formData.start_date) {
          productData.discount_start_date = formData.start_date;
        }
        if (formData.end_date) {
          productData.discount_end_date = formData.end_date;
        }
      }

      console.log("📤 Actualizando producto con descuentos:", productData);
      await updateProductWithVariants(product.id, productData);

      toast.success("¡Producto agregado a la tienda online correctamente!");

      if (onProductAdded) {
        await onProductAdded();
      }

      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error(error.detail || "Error al agregar producto a la tienda");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUploadedImages([]);
    setVariantsByBranch([]);
    if (onClose) {
      onClose();
    }
  };

  if (!product) return null;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header - Sticky */}
        <div className="sticky top-0 z-50 bg-base-100 pb-4 pt-2 -mx-4 px-4 shadow-md mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleClose}
                className="btn btn-ghost btn-circle"
                title="Volver"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-3xl font-bold">Agregar Producto</h1>
                <p className="text-base-content/60 text-sm">
                  Configura el producto para la tienda online
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="btn btn-ghost"
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                className="btn btn-success flex items-center gap-2"
                onClick={handleAddProduct}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Agregar a tienda
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Images */}
          <div className="lg:col-span-1 space-y-6">
            {/* Información de referencia del producto */}
            <div className="card bg-info/10 border border-info shadow-lg">
              <div className="card-body p-4">
                <h3 className="font-bold text-sm flex items-center gap-2 mb-3">
                  <Info size={16} />
                  Datos de la Tienda Física
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Nombre:</span>
                    <span className="font-semibold text-right max-w-[60%]">
                      {product?.product_name || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Grupo:</span>
                    <span className="font-semibold">
                      {product?.group_name || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Proveedor:</span>
                    <span className="font-semibold">
                      {product?.provider_name || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Código:</span>
                    <span className="font-mono text-xs">
                      {product?.provider_code || "-"}
                    </span>
                  </div>
                  <div className="divider my-2"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-base-content/60">Precio tienda:</span>
                    <span className="font-bold text-lg text-primary">
                      ${product?.sale_price?.toLocaleString("es-AR") || "0"}
                    </span>
                  </div>
                  {product?.discount_percentage > 0 && (
                    <div className="flex justify-between">
                      <span className="text-base-content/60">Descuento:</span>
                      <span className="badge badge-warning badge-sm">
                        {product.discount_percentage}% OFF
                      </span>
                    </div>
                  )}
                </div>
                <div className="alert alert-info mt-3 p-2">
                  <Info size={14} />
                  <span className="text-xs">
                    Estos son los datos actuales en la tienda física. Úsalos
                    como referencia.
                  </span>
                </div>
              </div>
            </div>

            {/* Imagen existente del producto */}
            {product.image_url && (
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title text-lg">Imagen actual</h2>
                  <img
                    src={`${
                      import.meta.env.VITE_API_URL || "http://localhost:8000"
                    }${product.image_url}`}
                    alt={product.product_name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <p className="text-xs text-base-content/60 text-center">
                    Esta imagen ya existe en el sistema
                  </p>
                </div>
              </div>
            )}

            {/* Upload New Images */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h3 className="font-semibold mb-2">Agregar más imágenes</h3>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? "border-primary bg-primary/10"
                      : "border-base-300 hover:border-primary"
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload
                    className="mx-auto mb-2 text-base-content/40"
                    size={40}
                  />
                  {isDragActive ? (
                    <p className="text-primary text-sm">
                      Suelta las imágenes aquí...
                    </p>
                  ) : (
                    <div>
                      <p className="text-base-content/60 text-sm mb-1">
                        Arrastra imágenes o haz clic
                      </p>
                      <p className="text-xs text-base-content/40">
                        JPG, PNG, WEBP (Max 5MB)
                      </p>
                    </div>
                  )}
                </div>

                {uploadedImages.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold mb-2">
                      Nuevas imágenes ({uploadedImages.length})
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {uploadedImages.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={file.preview}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeUploadedImage(index)}
                            className="absolute top-2 right-2 btn btn-xs btn-circle btn-error opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} />
                          </button>
                          <div className="absolute bottom-2 left-2 badge badge-sm badge-success">
                            Nueva
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Online Store Visibility */}
            <div
              className={`card shadow-xl border-2 transition-all ${
                enTiendaOnline
                  ? "bg-success/10 border-success"
                  : "bg-error/10 border-error"
              }`}
            >
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-full ${
                        enTiendaOnline
                          ? "bg-success text-success-content"
                          : "bg-error text-error-content"
                      }`}
                    >
                      <Store size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">
                        Visibilidad en Tienda Online
                      </h3>
                      <p className="text-sm opacity-80">
                        {enTiendaOnline
                          ? "✅ Este producto se publicará en la tienda"
                          : "❌ Este producto NO se publicará"}
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-lg toggle-success"
                    checked={enTiendaOnline}
                    onChange={(e) => setEnTiendaOnline(e.target.checked)}
                  />
                </div>
              </div>
            </div>

            {/* Product Information */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-xl font-semibold mb-6">
                  <Info size={20} className="inline-block mr-2" />
                  Información del producto
                </h2>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-bold text-base">
                          Nombre del producto *
                        </span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered input-lg"
                        value={formData.nombre_web}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nombre_web: e.target.value,
                          })
                        }
                        required
                        placeholder="Ej: Remera básica de algodón"
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-bold text-base">
                          Precio web *
                        </span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold opacity-60">
                          $
                        </span>
                        <input
                          type="text"
                          inputMode="decimal"
                          className="input input-bordered input-lg pl-10 font-bold text-xl"
                          value={formData.precio_web}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "" || /^\d*\.?\d*$/.test(value)) {
                              setFormData({
                                ...formData,
                                precio_web: value,
                              });
                            }
                          }}
                          required
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold text-base">
                        Descripción del producto
                      </span>
                      <span className="label-text-alt text-xs opacity-60">
                        Opcional
                      </span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered h-28 text-base"
                      value={formData.descripcion_web}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          descripcion_web: e.target.value,
                        })
                      }
                      placeholder="Describe las características principales del producto..."
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">
                        URL personalizada (Slug)
                      </span>
                      <span className="label-text-alt text-xs opacity-60">
                        Opcional - Se genera automáticamente
                      </span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                      placeholder="producto-slug-personalizado"
                    />
                    {formData.slug && (
                      <label className="label">
                        <span className="label-text-alt">
                          Vista previa:{" "}
                          <code className="bg-base-200 px-2 py-1 rounded">
                            /productos/{formData.slug}
                          </code>
                        </span>
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Discounts Section */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="card-title text-xl font-semibold">
                    <Percent size={20} className="inline-block mr-2" />
                    Descuentos
                  </h2>
                  {formData.descuento > 0 && (
                    <button
                      type="button"
                      onClick={handleRemoveDiscount}
                      className="btn btn-sm btn-error btn-outline gap-2"
                    >
                      <X size={16} />
                      Eliminar Descuento
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">
                        Descuento
                      </span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        className="input input-bordered flex-1"
                        value={formData.descuento}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "" || /^\d*\.?\d*$/.test(value)) {
                            const numValue = parseFloat(value);
                            if (
                              value === "" ||
                              (numValue >= 0 && numValue <= 100)
                            ) {
                              setFormData({
                                ...formData,
                                descuento: value,
                              });
                            }
                          }
                        }}
                        placeholder="0"
                      />
                      <span className="text-lg font-semibold">%</span>
                    </div>
                  </div>

                  {formData.descuento > 0 && (
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">
                          Precio con descuento
                        </span>
                      </label>
                      <div className="input input-bordered flex items-center bg-base-200">
                        <span className="font-semibold text-success">
                          $
                          {(
                            formData.precio_web *
                            (1 - formData.descuento / 100)
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                {/* Campos de fecha para el descuento */}
                {formData.descuento > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">
                          Fecha Inicio (opcional)
                        </span>
                      </label>
                      <input
                        type="datetime-local"
                        className="input input-bordered"
                        value={formData.start_date}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            start_date: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">
                          Fecha Fin (opcional)
                        </span>
                      </label>
                      <input
                        type="datetime-local"
                        className="input input-bordered"
                        value={formData.end_date}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            end_date: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                )}{" "}
              </div>
            </div>

            {/* Stock Section */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-xl font-semibold mb-4">
                  <Store size={20} className="inline-block mr-2" />
                  Stock por Sucursal
                </h2>

                {variantsByBranch.length === 0 ? (
                  <div className="alert alert-info">
                    <Info size={20} />
                    <span>Cargando variantes del producto...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {variantsByBranch.map((branch, bIndex) => (
                      <div
                        key={branch.branch_id}
                        className="collapse collapse-arrow bg-base-200"
                      >
                        <input type="checkbox" defaultChecked />
                        <div className="collapse-title font-semibold flex items-center gap-2">
                          <span className="badge badge-primary">
                            {branch.branch_name}
                          </span>
                          <span className="text-sm text-base-content/60">
                            {branch.variants.length} variantes
                          </span>
                        </div>
                        <div className="collapse-content">
                          <div className="overflow-x-auto">
                            <table className="table table-sm table-zebra">
                              <thead>
                                <tr>
                                  <th>Código</th>
                                  <th>Color</th>
                                  <th>Talle</th>
                                  <th>Stock Físico</th>
                                  <th>Stock Web</th>
                                  <th>Mostrar</th>
                                </tr>
                              </thead>
                              <tbody>
                                {branch.variants.map((variant, vIndex) => (
                                  <tr key={vIndex}>
                                    <td>
                                      <span className="font-mono text-xs badge badge-ghost">
                                        {variant.barcode || "-"}
                                      </span>
                                    </td>
                                    <td>
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="w-4 h-4 rounded-full border"
                                          style={{
                                            backgroundColor: variant.color_hex,
                                          }}
                                        ></div>
                                        <span className="text-sm">
                                          {variant.color}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="font-semibold">
                                      {variant.size}
                                    </td>
                                    <td>
                                      <span className="badge badge-info">
                                        {variant.quantity} unidades
                                      </span>
                                    </td>
                                    <td>
                                      <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        className="input input-bordered input-sm w-20"
                                        value={variant.cantidad_web}
                                        onChange={(e) =>
                                          handleUpdateWebStock(
                                            bIndex,
                                            vIndex,
                                            e.target.value
                                          )
                                        }
                                        placeholder="0"
                                      />
                                    </td>
                                    <td>
                                      <input
                                        type="checkbox"
                                        className="checkbox checkbox-primary checkbox-sm"
                                        checked={
                                          variant.mostrar_en_web !== false
                                        }
                                        onChange={() =>
                                          handleToggleVariantVisibility(
                                            bIndex,
                                            vIndex
                                          )
                                        }
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="alert alert-warning mt-4">
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span className="text-sm">
                    <strong>Stock Web:</strong> Asigna la cantidad que estará
                    disponible en la tienda online (no puede exceder el stock
                    físico).
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
