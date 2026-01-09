import { useNotifications } from "../context/NotificationContext";
import { Bell, Trash2, CheckCheck, X } from "lucide-react";


export default function Notifications() {
  const { notifications, markAsRead, deleteNotification, markAllAsRead, clearAllNotifications } = useNotifications();

  // Helper to format date if date-fns is not available/desired, 
  // but for now I'll use a simple native formatter to avoid assuming dependencies not listed
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit'
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
            
            {notifications.map((notification) => (
              <li key={notification.id} className={`list-row hover:bg-base-200/50 transition-colors ${!notification.read ? 'bg-base-200/30' : ''}`}>
                <div className="flex items-center justify-center">
                    <div className={`size-10 rounded-box flex items-center justify-center ${
                        notification.type === 'success' ? 'bg-success/10 text-success' :
                        notification.type === 'info' ? 'bg-info/10 text-info' :
                        notification.type === 'warning' ? 'bg-warning/10 text-warning' :
                        'bg-primary/10 text-primary'
                    }`}>
                         {/* Icon based on type or default image */}
                         <Bell size={20} />
                    </div>
                </div>
                
                <div className="flex-1 cursor-pointer" onClick={() => markAsRead(notification.id)}>
                  <div className={`font-medium ${!notification.read ? 'text-primary' : ''}`}>
                    {notification.title}
                  </div>
                  <div className="text-xs uppercase font-semibold opacity-60">
                    {notification.message}
                  </div>
                  <div className="text-[10px] opacity-40 mt-1">
                    {formatDate(notification.timestamp)}
                  </div>
                </div>

                <button 
                    className="btn btn-square btn-ghost"
                    onClick={() => deleteNotification(notification.id)}
                >
                  <X className="size-[1.2em]" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
