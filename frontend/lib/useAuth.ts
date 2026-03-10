import { useEffect, useState } from "react";
import api from "./axios";

export interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
  avatarUrl?: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        if (typeof window === "undefined") {
          setLoading(false);
          setChecked(true);
          return;
        }

        // Check sessionStorage first (primary), then localStorage (fallback)
        const token = 
          sessionStorage.getItem("token") ||
          localStorage.getItem("token") || 
          localStorage.getItem("authToken");
        
        console.log("[useAuth] Token found:", !!token);

        if (token) {
          try {
            // Decode JWT to get user info
            const parts = token.split(".");
            if (parts.length !== 3) {
              throw new Error("Invalid token format");
            }

            const payload = JSON.parse(atob(parts[1]));
            console.log("[useAuth] Decoded payload:", { id: payload.id, role: payload.role });

            setUser({
              id: payload.id,
              email: payload.email || "",
              role: payload.role || "CUSTOMER",
              name: payload.name || payload.fullName || `${payload.firstName || ""}${payload.lastName ? " " + payload.lastName : ""}`.trim() || undefined,
            });
          } catch (error) {
            console.error("[useAuth] Failed to parse auth token:", error);
            // Clear invalid token
            sessionStorage.removeItem("token");
            localStorage.removeItem("token");
            setUser(null);
          }
        } else {
          console.log("[useAuth] No token found in storage");
          setUser(null);
        }
      } finally {
        setLoading(false);
        setChecked(true);
      }
    };

    checkAuth();

    // Listen for storage changes to update auth state when user logs in/out in another tab
    const handleStorageChange = () => {
      checkAuth();
    };

    typeof window !== "undefined" && 
      window.addEventListener("storage", handleStorageChange);

    return () => {
      typeof window !== "undefined" && 
        window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    // Remove cookie as well
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // Clear cart on logout
    localStorage.removeItem("cart");
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      // attempt to get authoritative profile from server
      const res = await api.get("/customer/profile");
      const data = res?.data?.data;
      if (data) {
        setUser({
          id: data.id,
          email: data.email || "",
          role: data.role || "CUSTOMER",
          name: data.name || undefined,
          avatarUrl: data.avatarUrl ?? null,
        });
        return data;
      }
    } catch (err) {
      // ignore - user may not be logged in
      console.debug("refreshUser: no profile available", err);
    }
    return null;
  };

  return { user, loading, checked, logout, refreshUser };
}
