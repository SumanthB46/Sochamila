"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../lib/useAuth";

const API_BASE = "http://localhost:5000/api";

function OrdersList({ orders }: { orders: Array<any> }) {
  if (!orders.length) return <div className="p-4 text-sm text-gray-600">No orders found.</div>;
  const formatINR = (v?: number | string) => {
    const n = typeof v === "number" ? v : parseFloat(String(v || "0"));
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);
  };

  return (
    <ul className="space-y-3">
      {orders.map((o) => (
        <li key={o.id} className="p-3 bg-white rounded shadow-sm flex justify-between">
          <div>
            <div className="font-semibold">Order #{o.id}</div>
            <div className="text-sm text-gray-500">{o.status} · {new Date(o.createdAt).toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-1">Items: {o.items ? o.items.length : (o.customItems? o.customItems.length : 0)}</div>
          </div>
          <div className="font-medium">{o.totalAmount ? formatINR(o.totalAmount) : (o.total ? formatINR(Number(o.total)) : "-")}</div>
        </li>
      ))}
    </ul>
  );
}

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Array<any>>([]);
  const [fetching, setFetching] = useState(false);

  const fetchOrders = async () => {
    if (!user) return;
    setFetching(true);
    try {
      const res = await fetch(`${API_BASE}/orders`);
      if (!res.ok) {
        setOrders([]);
        return;
      }
      const data = await res.json();
      const allOrders = Array.isArray(data.orders) ? data.orders : data.data || [];
      const myOrders = allOrders.filter((o: any) => (o.userId === user.id) || (o.user && o.user.id === user.id));
      setOrders(myOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setOrders([]);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (user && !loading) fetchOrders();
  }, [user, loading]);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Your Orders</h1>

      {fetching ? <div className="p-4">Fetching orders...</div> : <OrdersList orders={orders} />}

      <div className="mt-6">
        <Link href="/products" className="text-indigo-600">Continue shopping</Link>
      </div>
    </div>
  );
}
