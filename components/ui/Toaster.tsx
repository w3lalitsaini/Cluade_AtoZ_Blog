"use client";
import { Toaster as HotToaster } from "react-hot-toast";

export function Toaster() {
  return (
    <HotToaster
      position="bottom-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: "#1a1a1a",
          color: "#f0f0f0",
          border: "1px solid #2a2a2a",
          borderRadius: "8px",
          fontSize: "14px",
        },
        success: { iconTheme: { primary: "#f97316", secondary: "#fff" } },
        error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
      }}
    />
  );
}
