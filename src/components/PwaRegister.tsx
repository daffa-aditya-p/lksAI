"use client";

import { useEffect } from "react";

/**
 * Registrasi Service Worker (PWA). Di-import di layout — berjalan sekali.
 */
export default function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      // Di mode development, unregister Service Worker agar tidak meng-cache bundle/chunk dan memicu hydration error
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch((e) => {
      console.warn("[pwa] gagal register SW:", e);
    });
  }, []);

  return null;
}
