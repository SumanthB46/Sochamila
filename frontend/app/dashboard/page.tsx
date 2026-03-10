"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../../lib/useAuth";
import api from "@/lib/axios";

function OrdersList({ orders }: { orders: Array<{ id: string; total: string; status: string }> }) {
  if (!orders.length) return <div className="p-4 text-sm text-gray-600">No orders found.</div>;
  return (
    <ul className="space-y-2">
      {orders.map((o) => (
        <li key={o.id} className="p-3 bg-white rounded shadow-sm flex justify-between">
          <div>
            <div className="font-semibold">Order #{o.id}</div>
            <div className="text-sm text-gray-500">{o.status}</div>
          </div>
          <div className="font-medium">{o.total}</div>
        </li>
      ))}
    </ul>
  );
}

function Wishlist({ items }: { items: Array<{ id: string; title: string }> }) {
  if (!items.length) return <div className="p-4 text-sm text-gray-600">Your wishlist is empty.</div>;
  return (
    <ul className="space-y-2">
      {items.map((it) => (
        <li key={it.id} className="p-3 bg-white rounded shadow-sm flex items-center justify-between">
          <div className="truncate">{it.title}</div>
          <Link href={`/products/${it.id}`} className="text-indigo-600 font-semibold">View</Link>
        </li>
      ))}
    </ul>
  );
}

export default function CustomerDashboardPage() {
  const { user, loading, refreshUser, logout } = useAuth() as any;
  const router = useRouter();
  const [orders, setOrders] = useState<Array<any>>([]);
  const [wishlist, setWishlist] = useState<Array<{ id: string; title: string }>>([]);
  const [fetching, setFetching] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);

  const fetchOrders = async (signal?: AbortSignal) => {
    if (!user) return;
    setFetching(true);
    try {
      const res = await api.get("/customer/orders", { signal } as any);
      const data = res?.data?.data || [];
      setOrders(data);
      
      // Sync stats with fetched orders (override backend stats with actual order data)
      // totalAmount from backend is already in rupees (not paise)
      const totalOrders = data.length;
      const totalSpent = data.reduce((sum: number, o: any) => {
        const amount = o.totalAmount != null ? Number(o.totalAmount) : o.total != null ? Number(o.total) : 0;
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
      const completedOrders = data.filter((o: any) => o.status === "DELIVERED").length;
      
      setStats({
        totalOrders: totalOrders || 0,
        totalSpent: totalOrders > 0 ? parseFloat(totalSpent.toFixed(2)) : 0,
        completedOrders: completedOrders || 0,
      });
      

    } catch (err: any) {
      if (err?.name === "CanceledError" || err?.name === "AbortError") return;
      console.error("Error fetching orders:", err);
      setOrders([]);
      // Set default stats on error
      setStats({
        totalOrders: 0,
        totalSpent: 0,
        completedOrders: 0,
      });
    } finally {
      setFetching(false);
    }
  };

  const fetchWishlist = async () => {
    if (!user) return;
    try {
      const res = await api.get("/wishlist");
      const data = res?.data?.data || [];
      // Expect items as [{id,title}]
      setWishlist(data);
    } catch (err) {
      console.debug("No wishlist available", err);
      setWishlist([]);
    }
  };

  const formatINR = (value?: number | string) => {
    const n = typeof value === "number" ? value : parseFloat(String(value || "0"));
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);
  };

  useEffect(() => {
    // on mount: refresh authoritative profile once and then fetch stats & orders
    let ac = new AbortController();
    (async () => {
      try {
        await refreshUser?.();
      } catch (e) {
        // ignore
      }
    })();

    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch orders and wishlist when user is loaded
  useEffect(() => {
    if (!user || loaded) return;
    
    let ac = new AbortController();
    (async () => {
      await fetchOrders(ac.signal);
      await fetchWishlist();
      setLoaded(true);
    })();

    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // No manual order creation in dashboard — orders are fetched from backend

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Compact header like Myntra/Nykaa */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt={user.name || "avatar"} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-semibold text-gray-700">{(user?.name || user?.email || "U").charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <div className="text-sm text-gray-500">Welcome back,</div>
            <div className="text-lg font-bold">{user ? user.name || user.email : "Guest"}</div>
            <div className="text-xs text-gray-400">{user ? user.email : ""}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/orders" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm">Orders</Link>
          <Link href="/wishlist" className="px-4 py-2 border border-gray-200 rounded-md text-sm">Wishlist</Link>
          <Link href="/account" className="px-4 py-2 border border-gray-200 rounded-md text-sm">Account</Link>
          <button 
            onClick={() => {
              logout?.();
              router.replace('/login');
            }}
            className="px-4 py-2 border border-red-200 text-red-600 rounded-md text-sm hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow-sm flex flex-col">
          <div className="text-sm text-gray-500">Total Orders</div>
          <div className="text-2xl font-semibold">{stats?.totalOrders ?? 0}</div>
        </div>
        <div className="bg-white p-4 rounded shadow-sm flex flex-col">
          <div className="text-sm text-gray-500">Total Spent</div>
          <div className="text-2xl font-semibold">{formatINR(stats?.totalSpent ?? 0)}</div>
        </div>
        <div className="bg-white p-4 rounded shadow-sm flex flex-col">
          <div className="text-sm text-gray-500">Completed</div>
          <div className="text-2xl font-semibold">{stats?.completedOrders ?? 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-50 p-4 rounded">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Recent Orders</h2>
            <div className="text-sm text-gray-500">{fetching ? "Refreshing…" : `${orders?.length || 0} orders`}</div>
          </div>

          {fetching ? (
            <div className="p-4">Fetching orders...</div>
          ) : (
            <div className="space-y-3">
              <OrdersList
                orders={orders.map((o) => {
                  // totalAmount from backend is already in rupees (not paise)
                  const amountRupees = o.totalAmount != null ? Number(o.totalAmount) : o.total != null ? Number(o.total) : 0;
                  return {
                    id: o.id,
                    total: formatINR(isNaN(amountRupees) ? 0 : amountRupees),
                    status: o.status || (o.paymentStatus ? o.paymentStatus : ""),
                  };
                })}
              />
            </div>
          )}
          <div className="mt-3 text-right">
            <Link href="/orders" className="text-indigo-600 font-medium">View all orders</Link>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Wishlist</h2>
            <div className="text-sm text-gray-500">{wishlist?.length || 0}</div>
          </div>
          <Wishlist items={wishlist} />
          <div className="mt-3 text-right">
            <Link href="/wishlist" className="text-indigo-600 font-medium">Manage wishlist</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
