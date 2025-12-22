import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import {
  uploadProductImage,
  deleteProductImage,
  updateProductWithVariants,
} from "../services/productService";
import { getProductDetailsByVariantByBranch } from "../services/branchService";

export default function EditProduct({
  product,
  isOpen,
  onClose,
  onProductUpdated,
}) {
  const [formData, setFormData] = useState({
    nombre_web: "",
    descripcion_web: "",
    precio_web: "",
    slug: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [variantsByBranch, setVariantsByBranch] = useState([]);
  const [enTiendaOnline, setEnTiendaOnline] = useState(true);

  // Initialize data when product changes
  useEffect(() => {
    if (product) {
      console.log("📝 Producto seleccionado para editar:", product);
      setFormData({
        nombre_web: product.nombre_web || "",
        descripcion_web: product.descripcion_web || "",
        precio_web: product.precio_web || "",
        slug: product.slug || "",
      });
      setEnTiendaOnline(product.en_tienda_online !== false);
      setExistingImages(product.images || []);
      setUploadedImages([]);

      loadVariants();
    }
  }, [product]);

  const loadVariants = async () => {
    if (!product) return;

    try {
      console.log(
        `🔄 Llamando a getProductDetailsByVariantByBranch(${product.id})...`
      );
      const variantsData = await getProductDetailsByVariantByBranch(product.id);
      console.log(
        "🔍 Datos RAW del backend:",
        JSON.stringify(variantsData, null, 2)
      );
      console.log(
        "📊 Cantidad de sucursales recibidas:",
        variantsData?.length || 0
      );

      const variantsWithWeb = (variantsData || []).map((branch) => ({
        ...branch,
        variants: (branch.variants || []).map((variant) => {
          console.log("🔍 Variante individual:", variant);
          return {
            ...variant,
            id: variant.variant_id || variant.id, // IMPORTANTE: variant_id primero
            cantidad_web: variant.cantidad_web || 0,
            mostrar_en_web: variant.mostrar_en_web !== false,
          };
        }),
      }));

      console.log("✅ Variantes procesadas:", variantsWithWeb);
      setVariantsByBranch(variantsWithWeb);
    } catch (error) {
      console.error("Error loading variants:", error);
      toast.error("Error al cargar variantes");
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

  // Remove uploaded image
  const removeUploadedImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove existing image
  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Update web stock for a variant in a branch
  const handleUpdateWebStock = (branchIndex, variantIndex, value) => {
    const updatedVariants = [...variantsByBranch];
    const variant = updatedVariants[branchIndex].variants[variantIndex];
    const maxStock = variant.quantity; // Stock físico disponible

    // Validar que sea un número válido
    if (value === "") {
      variant.cantidad_web = 0;
    } else if (/^\d+$/.test(value)) {
      // Solo permite números enteros positivos
      const numValue = parseInt(value, 10);
      variant.cantidad_web = Math.max(0, Math.min(numValue, maxStock));
    }
    // Si no es un número válido, no actualiza el valor

    setVariantsByBranch(updatedVariants);
  };

  const handleToggleVariantVisibility = (branchIndex, variantIndex) => {
    const updatedVariants = [...variantsByBranch];
    updatedVariants[branchIndex].variants[variantIndex].mostrar_en_web =
      !updatedVariants[branchIndex].variants[variantIndex].mostrar_en_web;
    setVariantsByBranch(updatedVariants);
  };

  const handleUpdateProduct = async () => {
    if (!product) return;

    if (!formData.nombre_web || !formData.precio_web) {
      toast.error("El nombre y precio son requeridos");
      return;
    }

    try {
      setLoading(true);

      const uploadPromises = uploadedImages.map((file) =>
        uploadProductImage(product.id, file)
      );
      const uploadedImageResults = await Promise.all(uploadPromises);

      if (uploadedImageResults.length > 0) {
        toast.success(`${uploadedImageResults.length} imágenes subidas`);
      }

      const currentImageIds = existingImages.map((img) => img.id);
      const originalImageIds = product.images?.map((img) => img.id) || [];
      const imagesToDelete = originalImageIds.filter(
        (id) => !currentImageIds.includes(id)
      );

      const deletePromises = imagesToDelete.map((imageId) =>
        deleteProductImage(product.id, imageId)
      );
      await Promise.all(deletePromises);

      if (imagesToDelete.length > 0) {
        toast.success(`${imagesToDelete.length} imágenes eliminadas`);
      }

      // Step 3: Update product data with variants
      console.log("🚀 Preparando variantes para enviar al backend...");
      console.log("📦 variantsByBranch:", variantsByBranch);

      const variantesMap = new Map();

      variantsByBranch.forEach((branch) => {
        branch.variants.forEach((variant) => {
          console.log("🔍 Procesando variante:", { id: variant.id, variant });
          if (!variant.id) {
            console.warn("⚠️ Variante sin ID, saltando:", variant);
            return; // Skip si no tiene ID
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

      const productData = {
        nombre: formData.nombre_web,
        descripcion: formData.descripcion_web || "",
        precio_web: parseFloat(formData.precio_web),
        en_tienda_online: enTiendaOnline,
        variantes: Array.from(variantesMap.values()),
      };

      console.log(
        "📤 Datos finales a enviar al backend:",
        JSON.stringify(productData, null, 2)
      );
      await updateProductWithVariants(product.id, productData);

      toast.success("Producto actualizado correctamente!");

      // Reset state
      setUploadedImages([]);
      setExistingImages([]);
      setVariantsByBranch([]);

      // Notify parent
      if (onProductUpdated) {
        await onProductUpdated();
      }

      // Close modal
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(error.detail || "Error al actualizar producto");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUploadedImages([]);
    setExistingImages([]);
    setVariantsByBranch([]);
    if (onClose) {
      onClose();
    }
  };

  if (!product) return null;


  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-8"
          >
            <div className="card bg-base-100 w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">
                  Editar producto: {product.nombre_web}
                </h2>

                <div className="space-y-4">
                  {/* Product Info Form */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">
                        Product Name (for web) *
                      </span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={formData.nombre_web}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nombre_web: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Description (for web)</span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered h-24"
                      value={formData.descripcion_web}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          descripcion_web: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Web Price *</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="input input-bordered"
                      value={formData.precio_web}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          precio_web: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Slug (optional)</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                      placeholder="product-name-slug"
                    />
                  </div>

                  {/* Show in Online Store Toggle */}
                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-4">
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={enTiendaOnline}
                        onChange={(e) => setEnTiendaOnline(e.target.checked)}
                      />
                      <span className="label-text font-semibold">
                        Mostrar en Tienda Online
                      </span>
                    </label>
                  </div>

                  {/* Variants Section */}
                  <div className="divider">Variantes y Stock por Sucursal</div>

                  {variantsByBranch.length === 0 ? (
                    <div className="alert alert-info">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="stroke-current shrink-0 w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>
                        No se encontraron variantes para este producto
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {variantsByBranch.map((branch, bIndex) => (
                        <div
                          key={branch.branch_id}
                          className="card bg-base-200 shadow-md"
                        >
                          <div className="card-body p-4">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                              <span className="badge badge-primary">
                                {branch.branch_name}
                              </span>
                            </h3>

                            {/* Variants Table */}
                            <div className="overflow-x-auto">
                              <table className="table table-sm table-zebra">
                                <thead>
                                  <tr>
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
                                        <div className="flex items-center gap-2">
                                          <div
                                            className="w-4 h-4 rounded-full border"
                                            style={{
                                              backgroundColor:
                                                variant.color_hex,
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
                      <strong>Stock Web:</strong> Cantidad de unidades que se
                      mostrarán disponibles en la tienda online. No puede
                      exceder el stock físico disponible en cada sucursal.
                    </span>
                  </div>

                  {/* Images Section */}
                  <div className="divider">Imagen del producto</div>

                  {/* Existing Images */}
                  {existingImages.length > 0 && (
                    <div>
                      <label className="label">
                        <span className="label-text font-semibold">
                          Existing Images
                        </span>
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        {existingImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={
                                image.startsWith("http")
                                  ? image
                                  : `${
                                      import.meta.env.VITE_IMAGE_URL ||
                                      "http://localhost:8080"
                                    }${image}`
                              }
                              alt={`Product ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => removeExistingImage(index)}
                              className="absolute top-1 right-1 btn btn-xs btn-circle btn-error opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dropzone for new images */}
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">
                        Add New Images
                      </span>
                    </label>
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                        isDragActive
                          ? "border-primary bg-primary/10"
                          : "border-base-300 hover:border-primary"
                      }`}
                    >
                      <input {...getInputProps()} />
                      <Upload
                        className="mx-auto mb-4 text-base-content/40"
                        size={48}
                      />
                      {isDragActive ? (
                        <p className="text-primary">Drop the images here...</p>
                      ) : (
                        <div>
                          <p className="text-base-content/60 mb-2">
                            Drag & drop images here, or click to select
                          </p>
                          <p className="text-xs text-base-content/40">
                            Accepted formats: JPG, PNG, WEBP (Max 5MB each)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Preview of uploaded images */}
                  {uploadedImages.length > 0 && (
                    <div>
                      <label className="label">
                        <span className="label-text font-semibold">
                          New Images to Upload ({uploadedImages.length})
                        </span>
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        {uploadedImages.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={file.preview}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => removeUploadedImage(index)}
                              className="absolute top-1 right-1 btn btn-xs btn-circle btn-error opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={14} />
                            </button>
                            <div className="absolute bottom-1 left-1 badge badge-sm badge-info">
                              New
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="card-actions justify-end mt-6 pt-4 border-t">
                  <button className="btn btn-ghost" onClick={handleClose}>
                    Cancelar
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleUpdateProduct}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <ImageIcon size={18} />
                        Actualizar Producto
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
