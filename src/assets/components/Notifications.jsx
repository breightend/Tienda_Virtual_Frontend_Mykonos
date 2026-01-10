import { useNotifications } from "../context/NotificationContext";
import { Bell, Trash2, CheckCheck, X, BellRing } from "lucide-react";
import { useLocation } from "wouter";

export default function Notifications() {
  const [, setLocation] = useLocation();
  const {
    notifications,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    clearAllNotifications,
  } = useNotifications();

  // Helper to format date if date-fns is not available/desired,
  // but for now I'll use a simple native formatter to avoid assuming dependencies not listed
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-light tracking-widest flex items-center gap-3">
            <Bell className="w-8 h-8" />
            NOTIFICACIONES
          </h1>

          <div className="flex gap-2">
            {notifications.length > 0 && (
              <>
                <button
                  onClick={markAllAsRead}
                  className="btn btn-ghost btn-sm tooltip"
                  data-tip="Marcar todas como leídas"
                >
                  <CheckCheck size={18} />
                </button>
                <button
                  onClick={clearAllNotifications}
                  className="btn btn-ghost btn-sm text-error tooltip"
                  data-tip="Borrar todas"
                >
                  <Trash2 size={18} />
                </button>
              </>
            )}
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body text-center py-12">
              <Bell className="w-16 h-16 mx-auto opacity-20 mb-4" />
              <p className="text-xl opacity-60">No tienes notificaciones</p>
            </div>
          </div>
        ) : (
          <ul className="list bg-base-100 rounded-box shadow-md divide-y divide-base-200">
            <li className="p-4 pb-2 text-xs opacity-60 tracking-wide uppercase font-semibold">
              Recientes
            </li>

            {notifications.map((notification) => {
              const isBroadcast = notification.target_role !== undefined;
              return (
                <li
                  key={`${isBroadcast ? "b" : "n"}-${notification.id}`}
                  className={`list-row hover:bg-base-200/50 transition-colors cursor-pointer ${
                    !notification.is_read ? "bg-base-200/30" : ""
                  }`}
                  onClick={() => {
                    markAsRead(notification.id, isBroadcast);
                    if (notification.link_url) {
                      if (notification.link_url.startsWith("http")) {
                        window.open(notification.link_url, "_blank");
                      } else {
                        setLocation(notification.link_url);
                      }
                    }
                  }}
                >
                  <div className="flex items-center justify-center">
                    <div
                      className={`size-10 rounded-box flex items-center justify-center ${
                        isBroadcast
                          ? "bg-secondary/10 text-secondary"
                          : notification.type === "order_success"
                          ? "bg-success/10 text-success"
                          : notification.type === "order_shipped"
                          ? "bg-info/10 text-info"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {isBroadcast ? (
                        <BellRing size={20} />
                      ) : (
                        <Bell size={20} />
                      )}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div
                      className={`font-semibold text-lg md:text-xl flex items-center gap-2 mb-1 ${
                        !notification.is_read ? "text-primary" : ""
                      }`}
                    >
                      {notification.title}
                      {isBroadcast && (
                        <span className="badge badge-sm badge-secondary">
                          INFO
                        </span>
                      )}
                    </div>
                    <div className="text-sm md:text-base font-medium opacity-70 leading-relaxed">
                      {notification.message}
                    </div>
                    <div className="text-xs opacity-40 mt-2 font-medium">
                      {formatDate(notification.created_at)}
                    </div>
                  </div>

                  {notification.image_url && (
                    <div className="ml-4 shrink-0">
                      <img
                        src={
                          notification.image_url.startsWith("http")
                            ? notification.image_url
                            : `${import.meta.env.VITE_API_URL}${
                                notification.image_url
                              }`
                        }
                        alt="Notification attachment"
                        className="h-24 w-24 md:h-32 md:w-32 object-cover rounded-md border border-base-300 bg-base-100"
                      />
                    </div>
                  )}

                  <button
                    className="btn btn-square btn-ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                  >
                    <X className="size-[1.2em]" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
