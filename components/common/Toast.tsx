"use client";

import { useEffect } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export default function Toaster({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex w-full max-w-sm flex-col gap-2.5 pointer-events-none sm:right-6">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4500);

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const config = {
    success: {
      border: "border-emerald-200",
      bg: "bg-white",
      iconBg: "bg-emerald-100 text-emerald-600",
      progress: "bg-emerald-500",
      icon: CheckCircle2,
      defaultTitle: "Success",
    },
    error: {
      border: "border-red-200",
      bg: "bg-white",
      iconBg: "bg-red-100 text-red-600",
      progress: "bg-red-500",
      icon: AlertCircle,
      defaultTitle: "Error",
    },
    warning: {
      border: "border-amber-200",
      bg: "bg-white",
      iconBg: "bg-amber-100 text-amber-600",
      progress: "bg-amber-500",
      icon: AlertTriangle,
      defaultTitle: "Warning",
    },
    info: {
      border: "border-blue-200",
      bg: "bg-white",
      iconBg: "bg-blue-100 text-blue-600",
      progress: "bg-blue-500",
      icon: Info,
      defaultTitle: "Information",
    },
  }[toast.type];

  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={`pointer-events-auto relative overflow-hidden rounded-2xl border ${config.border} ${config.bg} p-4 shadow-xl transition-all duration-300 animate-in slide-in-from-top-3 fade-in`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${config.iconBg}`}
        >
          <Icon size={18} />
        </div>

        <div className="flex-1 min-w-0 pr-2 pt-0.5">
          <p className="text-xs font-bold text-gray-900 leading-tight">
            {toast.title || config.defaultTitle}
          </p>
          <p className="mt-0.5 text-xs text-gray-600 leading-relaxed break-words">
            {toast.message}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="shrink-0 rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          aria-label="Dismiss toast"
        >
          <X size={15} />
        </button>
      </div>

      {/* Progress countdown bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
        <div
          className={`h-full ${config.progress} transition-all`}
          style={{
            animation: "toast-progress 4.5s linear forwards",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes toast-progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
