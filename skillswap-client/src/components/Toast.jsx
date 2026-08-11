import { createContext, useCallback, useContext, useState } from "react";
import { FiCheckCircle, FiInfo, FiAlertTriangle, FiX } from "react-icons/fi";

const ToastContext = createContext(null);

const styles = {
  success: { icon: FiCheckCircle, className: "bg-ink text-white [&_svg]:text-emerald-400" },
  info: { icon: FiInfo, className: "bg-ink text-white [&_svg]:text-brand-300" },
  error: { icon: FiAlertTriangle, className: "bg-ink text-white [&_svg]:text-red-400" },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id));
    }, 3200);
  }, []);

  const dismiss = (id) => setToasts((t) => t.filter((toast) => toast.id !== id));

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 items-end pointer-events-none">
        {toasts.map(({ id, message, type }) => {
          const { icon: Icon, className } = styles[type] || styles.success;
          return (
            <div
              key={id}
              className={`pointer-events-auto flex items-center gap-2.5 pl-4 pr-3 py-3 rounded-xl shadow-lg shadow-black/10 text-sm font-medium animate-toast-in ${className}`}
            >
              <Icon size={17} className="shrink-0" />
              <span>{message}</span>
              <button
                onClick={() => dismiss(id)}
                className="ml-1 text-white/50 hover:text-white shrink-0"
                aria-label="Dismiss"
              >
                <FiX size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
