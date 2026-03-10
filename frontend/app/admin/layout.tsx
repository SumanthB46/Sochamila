"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import {
  LayoutDashboard,
  Package,
  PlusSquare,
  Users,
  ShoppingBag,
  Sticker,
  Image,
  LogOut,
  CheckCircle,
  XCircle,
  X,
  Clock,
} from "lucide-react";

/* ================= TYPES ================= */

type JwtPayload = {
  id: string;
  role: "ADMIN" | "VENDOR" | "CUSTOMER";
  exp: number;
};

/* ================= LAYOUT ================= */

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [toasts, setToasts] = useState<Array<{ id: string; type: 'success' | 'error'; message: string }>>([]);
  const [authChecked, setAuthChecked] = useState(false);
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  /* ================= AUTH GUARD ================= */
  /* Require login; if no token or expired, clear and redirect to login (re-login) */

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      console.log("[ADMIN] No token found, redirecting to login");
      router.replace("/login");
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      
      // Check token expiration
      if (decoded.exp * 1000 < Date.now()) {
        console.log("[ADMIN] Token expired");
        sessionStorage.removeItem("token");
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        router.replace("/login");
        return;
      }

      // Check admin role
      if (decoded.role !== "ADMIN") {
        console.log("[ADMIN] User role is not ADMIN, redirecting. Role:", decoded.role);
        sessionStorage.removeItem("token");
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        router.replace("/");
        return;
      }

      console.log("[ADMIN] Auth check passed for admin user:", decoded.id);
      setAuthChecked(true);
    } catch (error) {
      console.error("[ADMIN] Auth check error:", error);
      sessionStorage.removeItem("token");
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      router.replace("/login");
    }
  }, [router]);

  /* ================= AUTO LOGOUT ON PAGE LEAVE ================= */

  useEffect(() => {
    const handleBeforeUnload = () => {
      // Check if navigating away from /admin
      if (!window.location.pathname.startsWith("/admin")) {
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
      console.log("Inactivity timeout - logging out");
      sessionStorage.removeItem("token");
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      router.replace("/login");
    }, INACTIVITY_TIMEOUT);
  };

  useEffect(() => {
    // Activity events to track
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

    // Set initial timer
    resetInactivityTimer();

    // Add event listeners
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

  /* ================= TOAST NOTIFICATIONS ================= */

  useEffect(() => {
    const checkNotifications = () => {
      const notification = sessionStorage.getItem("adminNotification");
      if (notification) {
        try {
          const parsed = JSON.parse(notification);
          const id = Math.random().toString(36);
          setToasts(prev => [...prev, { id, ...parsed }]);
          
          // Auto-remove after 3 seconds
          setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
          }, 3000);
          
          sessionStorage.removeItem("adminNotification");
        } catch (e) {
          // ignore parse errors
        }
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 500);
    return () => clearInterval(interval);
  }, []);

  /* ================= LOGOUT ================= */

  const logout = () => {
    sessionStorage.removeItem("token");
    router.replace("/login");
  };

  // Don't render anything until auth is checked
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  /* ================= VENDOR ROUTE PASS-THROUGH ================= */
  /* If vendor route accessed by VENDOR user, skip admin layout - vendor layout handles its own rendering */
  const token = sessionStorage.getItem("token");
  let isAdmin = false;
    
  if (token) {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      isAdmin = decoded.role === "ADMIN";
    } catch (error) {
      console.error("[ADMIN] Failed to decode token for role check:", error);
    }
  }
    
  if (pathname.startsWith("/admin/vendors") && !isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* ================= TOAST NOTIFICATIONS ================= */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast key={toast.id} type={toast.type} message={toast.message} onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} />
        ))}
      </div>

      {/* ================= SIDEBAR ================= */}
      <aside className="fixed left-0 top-0 w-64 h-screen bg-white border-r flex flex-col z-40">

        {/* BRAND */}
        <div className="px-6 py-5 border-b">
          <h1 className="text-2xl font-extrabold text-indigo-600">
            Sochamila
          </h1>
          <p className="text-xs text-gray-500">Admin Panel</p>
        </div>

        {/* NAV */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">

          <NavLink href="/admin" active={pathname === "/admin"} icon={<LayoutDashboard size={18} />}>
            Dashboard
          </NavLink>

          <Section title="Products">
            <NavLink href="/admin/products" active={pathname === "/admin/products"} icon={<Package size={18} />}>
              All Products
            </NavLink>
            <NavLink href="/admin/products/new" active={pathname === "/admin/products/new"} icon={<PlusSquare size={18} />}>
              Add Product
            </NavLink>
          </Section>

          <Section title="Assets">
            <NavLink href="/admin/graphics" active={pathname.startsWith("/admin/graphics")} icon={<Image size={18} />}>
              Graphics
            </NavLink>
            <NavLink href="/admin/stickers" active={pathname.startsWith("/admin/stickers")} icon={<Sticker size={18} />}>
              Stickers
            </NavLink>
            <AssetsPreview />
          </Section>

          <Section title="Management">
            <NavLink href="/admin/vendors" active={pathname === "/admin/vendors" || (pathname.startsWith("/admin/vendors/") && !pathname.includes("/admin/vendors/dashboard"))} icon={<Users size={18} />}>
              All Vendors
            </NavLink>
            <NavLink href="/admin/vendors/pending-list" active={pathname === "/admin/vendors/pending-list"} icon={<Clock size={18} />}>
              Pending Vendors
            </NavLink>
            <NavLink href="/admin/orders" active={pathname.startsWith("/admin/orders")} icon={<ShoppingBag size={18} />}>
              Orders
            </NavLink>
          </Section>
        </nav>

        {/* LOGOUT */}
        <div className="p-4 border-t">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 font-medium"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="ml-64 min-h-screen p-8">
        {children}
      </main>
    </div>
  );
}

/* ================= HELPERS ================= */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="pt-4">
      <p className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase">
        {title}
      </p>
      {children}
    </div>
  );
}

function NavLink({
  href,
  icon,
  active,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition
        ${active ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-indigo-100"}`}
    >
      {icon}
      {children}
    </Link>
  );
}

function Toast({
  type,
  message,
  onClose,
}: {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white animate-in fade-in slide-in-from-top-2 ${
        type === 'success' ? 'bg-green-600' : 'bg-red-600'
      }`}
    >
      {type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
      <span className="flex-1 text-sm font-medium">{message}</span>
      <button onClick={onClose} className="p-1 hover:opacity-80">
        <X size={16} />
      </button>
    </div>
  );
}

function AssetsPreview() {
  const [stickers, setStickers] = useState<any[]>([]);
  const [graphics, setGraphics] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [sRes, gRes] = await Promise.all([
          fetch('/api/stickers').then(r => r.json()),
          fetch('/api/graphics').then(r => r.json()),
        ]);

        if (!mounted) return;
        setStickers(Array.isArray(sRes.data) ? sRes.data.slice(0,4) : []);
        setGraphics(Array.isArray(gRes.data) ? gRes.data.slice(0,4) : []);
      } catch (e) {
        // ignore
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  if (stickers.length === 0 && graphics.length === 0) return null;

  return (
    <div className="mt-3 px-2">
      <div className="text-xs text-gray-400 mb-2">Recent assets</div>
      <div className="grid grid-cols-4 gap-2">
        {stickers.map((s) => (
          <img key={s.id} src={s.imageUrl.startsWith('http') ? s.imageUrl : `http://localhost:5000${s.imageUrl}`} alt={s.name} className="h-10 w-10 object-contain rounded" />
        ))}
        {graphics.map((g) => (
          <img key={g.id} src={g.imageUrl.startsWith('http') ? g.imageUrl : `http://localhost:5000${g.imageUrl}`} alt={g.name} className="h-10 w-10 object-contain rounded" />
        ))}
      </div>
    </div>
  );
}
