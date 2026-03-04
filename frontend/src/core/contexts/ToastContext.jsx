import React, { createContext, useCallback, useContext, useState } from "react";
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import { cn } from "@utils/cn";

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children, position = "top-right", maxToasts = 5 }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(
    (toastOrMessage, options = {}) => {
      const toast =
        typeof toastOrMessage === "string"
          ? {
              message: toastOrMessage,
              ...(typeof options === "string"
                ? { type: options, variant: options }
                : options),
            }
          : toastOrMessage || {};

      const id = Math.random().toString(36).slice(2, 11);
      const normalizedType = toast.type || toast.variant || "info";

      const nextToast = {
        id,
        title: toast.title || "",
        message: toast.message || "",
        type: normalizedType,
        variant: normalizedType,
        duration: toast.duration || 5000,
        onClose: toast.onClose,
        createdAt: Date.now(),
      };

      setToasts((prev) => [nextToast, ...prev].slice(0, maxToasts));
      return id;
    },
    [maxToasts]
  );

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message, options = {}) => {
    return addToast({ message, type: "success", variant: "success", ...options });
  }, [addToast]);

  const error = useCallback((message, options = {}) => {
    return addToast({ message, type: "error", variant: "error", ...options });
  }, [addToast]);

  const info = useCallback((message, options = {}) => {
    return addToast({ message, type: "info", variant: "info", ...options });
  }, [addToast]);

  const warning = useCallback((message, options = {}) => {
    return addToast({ message, type: "warning", variant: "warning", ...options });
  }, [addToast]);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "top-center": "top-4 left-1/2 -translate-x-1/2",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
  };

  const contextValue = {
    addToast,
    success,
    error,
    info,
    warning,
    removeToast,
    clearAll,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div
        className={cn(
          "fixed z-50 flex max-w-md flex-col gap-2 pointer-events-none",
          positionClasses[position],
          position.includes("center") && "items-center",
          position.includes("right") && "items-end",
          position.includes("left") && "items-start"
        )}
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({
  title,
  message,
  type = "info",
  duration = 5000,
  onClose,
  className,
  dismissible = true,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const timerRef = React.useRef(null);
  const progressRef = React.useRef(null);

  const typeIcons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
  };

  const typeClasses = {
    success:
      "bg-success-50 border-success-200 text-success-800 dark:bg-success-900/30 dark:border-success-800 dark:text-success-200",
    error:
      "bg-danger-50 border-danger-200 text-danger-800 dark:bg-danger-900/30 dark:border-danger-800 dark:text-danger-200",
    info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-200",
    warning:
      "bg-warning-50 border-warning-200 text-warning-800 dark:bg-warning-900/30 dark:border-warning-800 dark:text-warning-200",
  };

  const Icon = typeIcons[type] || Info;

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  }, [onClose]);

  React.useEffect(() => {
    if (duration <= 0) return undefined;

    const startTime = Date.now();
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      setProgress((remaining / duration) * 100);

      if (remaining <= 0) {
        handleClose();
      } else {
        progressRef.current = requestAnimationFrame(updateProgress);
      }
    };

    timerRef.current = setTimeout(handleClose, duration);
    progressRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressRef.current) cancelAnimationFrame(progressRef.current);
    };
  }, [duration, handleClose]);

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressRef.current) cancelAnimationFrame(progressRef.current);
  };

  const handleMouseLeave = () => {
    const remaining = (progress / 100) * duration;
    timerRef.current = setTimeout(handleClose, remaining);

    const startTime = Date.now();
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const nextRemaining = Math.max(0, remaining - elapsed);
      setProgress((nextRemaining / duration) * 100);
      if (nextRemaining <= 0) {
        handleClose();
      } else {
        progressRef.current = requestAnimationFrame(updateProgress);
      }
    };
    progressRef.current = requestAnimationFrame(updateProgress);
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "relative w-80 rounded-lg border p-4 shadow-lg animate-slide-up pointer-events-auto",
        typeClasses[type] || typeClasses.info,
        className
      )}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {duration > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 overflow-hidden rounded-t-lg">
          <div
            className={cn(
              "h-full transition-all duration-100",
              type === "success" && "bg-success-500",
              type === "error" && "bg-danger-500",
              type === "info" && "bg-blue-500",
              type === "warning" && "bg-warning-500"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex items-start gap-3">
        <Icon
          className={cn(
            "h-5 w-5 flex-shrink-0 mt-0.5",
            type === "success" && "text-success-600",
            type === "error" && "text-danger-600",
            type === "info" && "text-blue-600",
            type === "warning" && "text-warning-600"
          )}
        />

        <div className="flex-1">
          {title && <h4 className="mb-1 text-sm font-semibold">{title}</h4>}
          <p className="text-sm">{message}</p>
        </div>

        {dismissible && (
          <button
            type="button"
            onClick={handleClose}
            className="ml-2 rounded p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
            aria-label="Close notification"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ToastProvider;
