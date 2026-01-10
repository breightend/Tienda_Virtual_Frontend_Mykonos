import {
  BellRing,
  CheckCircle,
  Clock,
  Edit,
  FileText,
  Megaphone,
  Save,
  Send,
  Upload,
  Users,
  X
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { useNotifications } from "../context/NotificationContext";
import {
  createBroadcast,
  getAllBroadcasts,
  updateBroadcast,
  uploadNotificationImage,
} from "../services/notificationService";
import AdminLayout from "./AdminLayout";

export default function AdminBroadcasts() {
  const { refreshNotifications } = useNotifications();
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    target_role: "all",
    image_url: "",
    link_url: "",
    active: true, // Default to published
  });
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadPromotion, setShowUploadPromotion] = useState(false);
  const [editingBroadcast, setEditingBroadcast] = useState(null); // ID being edited

  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    // ... (same as before) ...
    const file = acceptedFiles[0];
    if (file) {
      setIsUploading(true);
      try {
        const url = await uploadNotificationImage(file);
        setFormData((prev) => ({
          ...prev,
          image_url: url,
        }));
        toast.success("Imagen subida correctamente");
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Error al subir la imagen");
      } finally {
        setIsUploading(false);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    multiple: false,
  });

  const loadHistory = async () => {
    try {
      const data = await getAllBroadcasts();
      // Sort: Drafts first, then by date descending
      setHistory(
        data.sort((a, b) => {
          if (a.active === b.active) {
            return new Date(b.created_at) - new Date(a.created_at);
          }
          return a.active ? 1 : -1; // Drafts (active:false) first
        })
      );
    } catch (error) {
      console.error("Error loading broadcasts:", error);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleEdit = (broadcast) => {
    setEditingBroadcast(broadcast.id);
    setFormData({
      title: broadcast.title,
      message: broadcast.message,
      target_role: broadcast.target_role,
      image_url: broadcast.image_url || "",
      link_url: broadcast.link_url || "",
      active: broadcast.active,
    });
    setShowUploadPromotion(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCleanup = async () => {
    if (
      !confirm(
        "¿Estás seguro de eliminar notificaciones antiguas (más de 6 meses)?"
      )
    )
      return;
    try {
      await cleanupNotifications();
      toast.success("Limpieza completada");
      loadHistory();
    } catch (error) {
      console.error("Error cleanup:", error);
      toast.error("Error en limpieza");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      toast.error("Título y mensaje son requeridos");
      return;
    }

    setIsLoading(true);
    try {
      if (editingBroadcast) {
        // Update existing
        await updateBroadcast(editingBroadcast, formData);
        toast.success(
          formData.active
            ? "Difusión actualizada y publicada"
            : "Borrador actualizado"
        );
      } else {
        // Create new
        await createBroadcast(formData);
        toast.success(
          formData.active
            ? "Difusión enviada correctamente"
            : "Borrador guardado"
        );
      }

      setFormData({
        title: "",
        message: "",
        target_role: "all",
        image_url: "",
        link_url: "",
        active: true,
      });
      setEditingBroadcast(null);
      setShowUploadPromotion(false);
      loadHistory(); // Refresh history
      if (formData.active) refreshNotifications(); // Only refresh if published
    } catch (error) {
      console.error("Error submit broadcast:", error);
      toast.error(
        error.response?.data?.detail || "Error al procesar la difusión"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUploadPromotion = () => {
    setShowUploadPromotion(!showUploadPromotion);
    if (showUploadPromotion) {
      setEditingBroadcast(null); // Reset edit mode on close
      setFormData({
        title: "",
        message: "",
        target_role: "all",
        image_url: "",
        link_url: "",
        active: true,
      });
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-primary/10 p-4 rounded-full text-primary">
            <BellRing size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Difusiones</h1>
            <p className="text-base-content/60">
              Envía notificaciones a todos los usuarios o grupos específicos.
            </p>
          </div>
        </div>

        <div className="flex justify-end mb-6">
          <button
            className={`btn gap-2 ${
              showUploadPromotion
                ? "btn-ghost text-base-content/70 hover:bg-base-200"
                : "btn-primary shadow-lg hover:shadow-primary/25 hover:scale-[1.02] transition-all"
            }`}
            onClick={toggleUploadPromotion}
          >
            {showUploadPromotion ? (
              <>
                <X size={20} />
                <span>Cancelar</span>
              </>
            ) : (
              <>
                <Megaphone size={20} />
                <span>
                  {editingBroadcast ? "Editar Difusión" : "Nueva Difusión"}
                </span>
              </>
            )}
          </button>
        </div>
        {showUploadPromotion && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-6 flex items-center gap-2">
                {editingBroadcast ? (
                  <Edit size={24} className="text-primary" />
                ) : (
                  <Megaphone size={24} className="text-primary" />
                )}
                {editingBroadcast ? "Editar Difusión" : "Nueva Difusión"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Título</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Ej: ¡Oferta Flash!"
                      className="input input-bordered w-full focus:input-primary"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">
                        Destinatarios
                      </span>
                    </label>
                    <select
                      name="target_role"
                      value={formData.target_role}
                      onChange={handleChange}
                      className="select select-bordered w-full focus:select-primary"
                    >
                      <option value="all">Todos los usuarios</option>
                      <option value="customer">Solo Clientes</option>
                      <option value="admin">Solo Administradores</option>
                    </select>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Mensaje</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Escribe el contenido de la notificación..."
                    className="textarea textarea-bordered h-32 w-full focus:textarea-primary text-base"
                    required
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">
                        Imagen (Opcional)
                      </span>
                    </label>

                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                        isDragActive
                          ? "border-primary bg-primary/5"
                          : "border-base-300 hover:border-primary"
                      }`}
                    >
                      <input {...getInputProps()} />
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-2 text-base-content/60">
                          <span className="loading loading-spinner text-primary"></span>
                          <p className="text-sm">Subiendo imagen...</p>
                        </div>
                      ) : formData.image_url ? (
                        <div className="relative inline-block group w-full">
                          <img
                            src={
                              formData.image_url.startsWith("http")
                                ? formData.image_url
                                : `${import.meta.env.VITE_API_URL}${
                                    formData.image_url
                                  }`
                            }
                            alt="Preview"
                            className="h-32 w-full object-contain rounded-md shadow-sm bg-base-200"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                            <p className="text-white text-xs font-medium">
                              Cambiar imagen
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-base-content/60">
                          <Upload size={32} strokeWidth={1.5} />
                          <p className="text-sm">
                            Arrastra una imagen o haz clic para subir
                          </p>
                        </div>
                      )}
                    </div>
                    <label className="label">
                      <span className="label-text-alt text-base-content/50">
                        Soporta JPG, PNG, WEBP (Max 5MB)
                      </span>
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">
                        Enlace de Acción (Opcional)
                      </span>
                    </label>
                    <input
                      type="text"
                      name="link_url"
                      value={formData.link_url}
                      onChange={handleChange}
                      placeholder="/store/category/sale"
                      className="input input-bordered w-full focus:input-primary"
                    />
                  </div>
                </div>

                <div className="form-control mt-4">
                  <label className="label cursor-pointer justify-start gap-4 p-4 border rounded-lg hover:bg-base-200 transition-colors w-fit">
                    <input
                      type="checkbox"
                      name="active"
                      className="toggle toggle-success"
                      checked={formData.active}
                      onChange={(e) =>
                        setFormData({ ...formData, active: e.target.checked })
                      }
                    />
                    <div>
                      <span className="label-text font-bold block">
                        {formData.active
                          ? "Publicar Inmediatamente"
                          : "Guardar como Borrador"}
                      </span>
                      <span className="label-text-alt text-base-content/60">
                        {formData.active
                          ? "Visible para todos los usuarios"
                          : "Solo visible para admins"}
                      </span>
                    </div>
                  </label>
                </div>

                <div className="card-actions justify-end mt-8">
                  <button
                    type="submit"
                    className={`btn ${
                      formData.active ? "btn-primary" : "btn-neutral"
                    } px-8 ${isLoading ? "loading" : ""}`}
                    disabled={isLoading}
                  >
                    {!isLoading &&
                      (formData.active ? (
                        <Send size={20} className="mr-2" />
                      ) : (
                        <Save size={20} className="mr-2" />
                      ))}
                    {isLoading
                      ? "Procesando..."
                      : formData.active
                      ? editingBroadcast
                        ? "Actualizar y Publicar"
                        : "Enviar Difusión"
                      : "Guardar Borrador"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* History Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6" />
            Historial de Difusiones
          </h2>

          <div className="overflow-x-auto bg-base-100 rounded-lg shadow-xl">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Título</th>
                  <th>Mensaje</th>
                  <th>Destinatarios</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 opacity-50">
                      No hay difusiones enviadas aún
                    </td>
                  </tr>
                ) : (
                  history.map((broadcast) => (
                    <tr
                      key={broadcast.id}
                      className={!broadcast.active ? "bg-base-200/50" : ""}
                    >
                      <td>
                        {broadcast.active ? (
                          <div className="badge badge-success gap-1 text-xs font-bold text-white">
                            <CheckCircle size={12} /> PUBLICADA
                          </div>
                        ) : (
                          <div className="badge badge-neutral gap-1 text-xs">
                            <FileText size={12} /> BORRADOR
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap opacity-70">
                        {new Date(broadcast.created_at).toLocaleDateString()}
                        <br />
                        <span className="text-xs">
                          {new Date(broadcast.created_at).toLocaleTimeString()}
                        </span>
                      </td>
                      <td className="font-semibold">{broadcast.title}</td>
                      <td
                        className="max-w-xs truncate"
                        title={broadcast.message}
                      >
                        {broadcast.message}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Users size={16} />
                          <span className="badge badge-sm badge-outline uppercase">
                            {broadcast.target_role || "Todos"}
                          </span>
                        </div>
                      </td>
                      <td>
                        {!broadcast.active && (
                          <button
                            className="btn btn-ghost btn-sm text-primary tooltip"
                            data-tip="Editar Borrador"
                            onClick={() => handleEdit(broadcast)}
                          >
                            <Edit size={16} />
                          </button>
                        )}
                        {broadcast.active && (
                          <span className="text-xs opacity-50 italic">
                            Solo lectura
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
