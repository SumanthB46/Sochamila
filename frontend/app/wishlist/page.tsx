"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../lib/useAuth";

const API_BASE = "http://localhost:5000/api";

export default function WishlistPage() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<Array<{ id: string; title: string }>>([]);
  const [fetching, setFetching] = useState(false);

  const fetchWishlist = async () => {
    if (!user) return;
    setFetching(true);
    try {
      const res = await fetch(`${API_BASE}/wishlist`);
      if (!res.ok) {
        setItems([]);
        return;
      }
      const data = await res.json();
      const list = Array.isArray(data.items) ? data.items : data.data || [];
      setItems(list);
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
      setItems([]);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (user && !loading) fetchWishlist();
  }, [user, loading]);

  const removeItem = async (id: string) => {
    // optimistic UI
    const prev = items;
    setItems(items.filter((i) => i.id !== id));
    try {
      const res = await fetch(`${API_BASE}/wishlist/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove");
    } catch (err) {
      console.error("Remove wishlist item failed:", err);
      setItems(prev);
      alert("Failed to remove item");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Wishlist</h1>

      {fetching ? (
        <div className="p-4">Fetching wishlist...</div>
      ) : items.length === 0 ? (
        <div className="p-4 text-sm text-gray-600">Your wishlist is empty.</div>
      ) : (
        <ul className="space-y-3">
          {items.map((it) => (
            <li key={it.id} className="p-3 bg-white rounded shadow-sm flex items-center justify-between">
              <div className="truncate">{it.title}</div>
              <div className="flex gap-3 items-center">
                <Link href={`/products/${it.id}`} className="text-indigo-600">View</Link>
                <button className="text-sm text-red-500" onClick={() => removeItem(it.id)}>Remove</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6">
        <Link href="/products" className="text-indigo-600">Continue shopping</Link>
      </div>
    </div>
  );
}
