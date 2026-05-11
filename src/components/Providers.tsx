"use client";

import { AuthProvider } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";
import { ToastProvider } from "@/context/ToastContext";
import ChatWidget from "@/components/ChatWidget";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <DataProvider>
        <ToastProvider>
          {children}
          <ChatWidget />
        </ToastProvider>
      </DataProvider>
    </AuthProvider>
  );
}
