"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

type JwtPayload = {
  id: string;
  role: "ADMIN" | "VENDOR" | "CUSTOMER";
  exp: number;
};

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  /* ================= AUTH GUARD ================= */
  /* Allow ADMIN (managing vendors) or VENDOR (own dashboard) */

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      console.log("[VENDOR] No token found, redirecting to login");
      router.replace("/login");
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      if (decoded.exp * 1000 < Date.now()) {
        console.log("[VENDOR] Token expired");
        sessionStorage.removeItem("token");
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        router.replace("/login");
        return;
      }
      // Allow both ADMIN (managing vendors) and VENDOR (own dashboard)
      if (decoded.role !== "ADMIN" && decoded.role !== "VENDOR") {
        console.log("[VENDOR] User role is not ADMIN or VENDOR, redirecting. Role:", decoded.role);
        sessionStorage.removeItem("token");
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        router.replace("/");
        return;
      }
      console.log("[VENDOR] Auth check passed for user:", decoded.id, "Role:", decoded.role);
      setAuthChecked(true);
    } catch (error) {
      console.error("[VENDOR] Auth check error:", error);
      sessionStorage.removeItem("token");
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      router.replace("/login");
    }
  }, [router]);

  /* ================= AUTO LOGOUT ON PAGE LEAVE ================= */

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!window.location.pathname.startsWith("/admin/vendors")) {
        sessionStorage.removeItem("token");
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  /* ================= AUTO LOGOUT ON INACTIVITY ================= */

  const resetInactivityTimer = () => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }

    inactivityTimeoutRef.current = setTimeout(() => {
      console.log("Inactivity timeout - logging out vendor");
      sessionStorage.removeItem("token");
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      router.replace("/login");
    }, INACTIVITY_TIMEOUT);
  };

  useEffect(() => {
    const activityEvents = [
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    const handleActivity = () => {
      resetInactivityTimer();
    };

    resetInactivityTimer();

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [router]);

  // Don't render anything until auth is checked
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying vendor access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
