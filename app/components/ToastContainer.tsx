import React from "react";

export type Toast = {
  id: number;
  msg: string;
  type: "success" | "error" | "info";
};

interface ToastContainerProps {
  toasts: Toast[];
  dir?: "ltr" | "rtl" | string;
}

export default function ToastContainer({ toasts, dir = "ltr" }: ToastContainerProps) {
  return (
    <div className={`fixed bottom-6 ${dir === "rtl" ? "left-6" : "right-6"} z-50 space-y-3 pointer-events-none`}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto px-5 py-3.5 rounded-2xl border shadow-2xl backdrop-blur-xl text-sm font-semibold flex items-center gap-3 transition-all animate-bounce ${
            toast.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-300 shadow-emerald-900/20"
              : toast.type === "error"
              ? "bg-rose-950/90 border-rose-500/40 text-rose-300 shadow-rose-900/20"
              : "bg-slate-900/90 border-purple-500/40 text-slate-200 shadow-purple-900/20"
          }`}
        >
          <span>{toast.msg}</span>
        </div>
      ))}
    </div>
  );
}