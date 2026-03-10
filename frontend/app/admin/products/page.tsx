"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import { Pencil, Trash2, Plus } from "lucide-react";

/* ======================================================
   CONFIG
====================================================== */
const API_URL = "http://localhost:5000";

/* ======================================================
   TYPES
====================================================== */
type Product = {
  id: string;
  name: string;
  audience: string;
  productType: string;
  isActive: boolean;

  images?: {
    imageUrl: string;
  }[];

  colors?: {
    images?: {
      imageUrl: string;
    }[];
  }[];
};

/* ======================================================
   COMPONENT
====================================================== */
export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

  /* ======================================================
     IMAGE RESOLVER
  ====================================================== */
  const getImageUrl = useCallback((product: Product): string | null => {
    const imagePath =
      product.images?.[0]?.imageUrl ||
      product.colors?.[0]?.images?.[0]?.imageUrl ||
      null;

    if (!imagePath) return null;

    // Normalize: replace backslashes, trim, remove Windows drive letters
    let p = String(imagePath).replace(/\\/g, "/").trim();
    p = p.replace(/^[A-Za-z]:\//, "");
    
    // Ensure uploads/ paths have leading slash
    if (p.startsWith("uploads/")) p = "/" + p;
    
    // Build full URL
    if (p.startsWith("http")) return p;
    if (p.startsWith("/uploads/")) return `${API_URL}${p}`;
    if (p.startsWith("/")) return `${API_URL}${p}`;
    return `${API_URL}/uploads/${p}`;
  }, []);

  /* ======================================================
     FETCH PRODUCTS
  ====================================================== */
  useEffect(() => {
    let mounted = true;

    const fetchProducts = async () => {
      try {
        const res = await api.get("/admin/products");
        if (mounted) {
          setProducts(res.data?.data ?? []);
        }
      } catch (err) {
        console.error("FETCH PRODUCTS ERROR:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      mounted = false;
    };
  }, []);

  /* ======================================================
     ACTIONS
  ====================================================== */

  const toggleStatus = useCallback(async (id: string, current: boolean) => {
    try {
      await api.patch(`/admin/products/${id}/status`, {
        isActive: !current,
      });

      setProducts(prev =>
        prev.map(p =>
          p.id === id ? { ...p, isActive: !current } : p
        )
      );
    } catch (err) {
      console.error("TOGGLE STATUS ERROR:", err);
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Delete this product?")) return;

    try {
      await api.delete(`/admin/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      const msg = (err as any)?.response?.data?.message || "Failed to delete product";
      // If deletion is blocked because of existing orders, offer to hide the product instead
      if (msg.toLowerCase().includes("associated orders")) {
        const doHide = confirm(msg + "\n\nHide this product instead?");
        if (doHide) {
          try {
            await api.patch(`/admin/products/${id}/status`, { isActive: false });
            setProducts(prev => prev.map(p => p.id === id ? { ...p, isActive: false } : p));
            alert("Product hidden (deactivated)");
          } catch (hideErr) {
            alert("Failed to hide product");
          }
        }
        return;
      }

      alert(msg);
    }
  }, []);

  /* ======================================================
     LOADING
  ====================================================== */
  if (loading) {
    return (
      <p className="py-20 text-center text-gray-500">
        Loading products…
      </p>
    );
  }

  /* ======================================================
     UI
  ====================================================== */
  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-sm text-gray-500">
            Manage all products on Sochamila
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left">Product</th>
              <th className="px-6 py-4 text-center">Audience</th>
              <th className="px-6 py-4 text-center">Type</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {products.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-16 text-center text-gray-500"
                >
                  No products found
                </td>
              </tr>
            )}

            {products.map(product => {
              const imageUrl = getImageUrl(product);
              const showImage =
                imageUrl && !brokenImages.has(product.id);

              return (
                <tr key={product.id} className="hover:bg-gray-50">

                  {/* PRODUCT */}
                  <td className="px-6 py-4 flex items-center gap-4">
                    {showImage ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-14 h-14 rounded-lg object-cover border"
                        onError={() =>
                          setBrokenImages(prev =>
                            new Set(prev).add(product.id)
                          )
                        }
                      />
                    ) : (
                      <div className="w-14 h-14 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-600">
                        No Image
                      </div>
                    )}

                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-xs text-gray-400">
                        {product.id.slice(0, 8)}…
                      </p>
                    </div>
                  </td>

                  {/* AUDIENCE */}
                  <td className="px-6 py-4 text-center">
                    {product.audience}
                  </td>

                  {/* TYPE */}
                  <td className="px-6 py-4 text-center">
                    {product.productType}
                  </td>

                  {/* STATUS */}
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() =>
                        toggleStatus(product.id, product.isActive)
                      }
                      className={`px-4 py-1 rounded-full text-xs font-semibold ${
                        product.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {product.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>

                  {/* ACTIONS */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-4">
                      <Link href={`/admin/products/edit/${product.id}`}>
                        <Pencil size={16} />
                      </Link>

                      <button onClick={() => handleDelete(product.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
