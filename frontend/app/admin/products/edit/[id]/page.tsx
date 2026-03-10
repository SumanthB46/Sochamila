"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/axios";

/* ======================================================
   TYPES
====================================================== */

type Image = {
  imageUrl: string;
};

type Size = {
  size: string;
  mrp: number;
  price: number;
  stock: number;
};

type Color = {
  name: string;
  hexCode?: string | null;
  images: Image[];
  sizes: Size[];
  id?: string;
};

type Product = {
  id: string;
  name: string;
  description?: string | null;
  gender: string;
  department: string;
  productType: string;
  isActive: boolean;
  images: Image[];
  colors: Color[];
  shippingPolicy?: string;
  returnPolicy?: string;
};

/* ======================================================
   CONSTANTS
====================================================== */

const COLOR_OPTIONS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#ffffff" },
  { name: "Red", hex: "#ef4444" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "Green", hex: "#22c55e" },
  { name: "Yellow", hex: "#eab308" },
];

/* ======================================================
   HELPERS
====================================================== */

const reorder = <T,>(list: T[], from: number, to: number): T[] => {
  const updated = [...list];
  const [moved] = updated.splice(from, 1);
  updated.splice(to, 0, moved);
  return updated;
};

/* ======================================================
   COMPONENT
====================================================== */

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ======================================================
     FETCH PRODUCT
  ====================================================== */

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await api.get(`/admin/products/${id}`);
        if (mounted) setProduct(res.data.data);
      } catch {
        alert("Product not found");
        router.push("/admin/products");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id, router]);

  /* ======================================================
     UPDATE HELPERS
  ====================================================== */

  const updateColor = (colorIndex: number, colorName: string) => {
    const selected = COLOR_OPTIONS.find(c => c.name === colorName);

    setProduct(prev =>
      prev
        ? {
            ...prev,
            colors: prev.colors.map((c, ci) =>
              ci === colorIndex
                ? {
                    ...c,
                    name: selected?.name ?? c.name,
                    hexCode: selected?.hex ?? c.hexCode,
                  }
                : c
            ),
          }
        : prev
    );
  };

  const updateSize = (
    colorIndex: number,
    sizeIndex: number,
    field: keyof Size,
    value: number
  ) => {
    setProduct(prev =>
      prev
        ? {
            ...prev,
            colors: prev.colors.map((c, ci) =>
              ci === colorIndex
                ? {
                    ...c,
                    sizes: c.sizes.map((s, si) =>
                      si === sizeIndex
                        ? { ...s, [field]: value }
                        : s
                    ),
                  }
                : c
            ),
          }
        : prev
    );
  };

  /* ======================================================
     SAVE
  ====================================================== */

  const handleSave = async () => {
    if (!product) return;
    setSaving(true);

    try {
      const payload = {
        name: product.name,
        description: product.description,
        gender: product.gender,
        department: product.department,
        productType: product.productType,
        shippingPolicy: product.shippingPolicy,
        returnPolicy: product.returnPolicy,
        images: product.images.map((img, i) => ({
          imageUrl: img.imageUrl,
          sortOrder: i,
        })),
        colors: product.colors.map(color => ({
          id: (color as any).id || undefined,
          name: color.name,
          hexCode: color.hexCode,
          sizes: color.sizes,
          images: color.images.map((img, i) => ({
            imageUrl: img.imageUrl,
            sortOrder: i,
          })),
        })),
      };

      console.log('[EditProduct] Saving payload:', payload);
      await api.put(`/admin/products/${product.id}`, payload);

      alert("Product updated successfully");
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      alert("Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  /* ======================================================
     LOADING
  ====================================================== */

  if (loading) {
    return (
      <p className="py-20 text-center text-gray-500">
        Loading product…
      </p>
    );
  }

  if (!product) return null;

  /* ======================================================
     UI
  ====================================================== */

  return (
    <div className="max-w-6xl mx-auto space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <p className="text-sm text-gray-500">
          Images, colors, prices & stock
        </p>
      </div>

      {/* BASIC INFO */}
      <section className="bg-white border rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold">Basic Info</h2>

        <input
          value={product.name}
          onChange={e =>
            setProduct({ ...product, name: e.target.value })
          }
          className="w-full border rounded-lg px-4 py-2"
          placeholder="Product name"
        />

        <textarea
          value={product.description ?? ""}
          onChange={e =>
            setProduct({
              ...product,
              description: e.target.value,
            })
          }
          rows={3}
          className="w-full border rounded-lg px-4 py-2"
          placeholder="Description"
        />

        {/* Gender & Department */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={product.gender}
            onChange={e => setProduct({ ...product, gender: e.target.value })}
            className="border rounded-lg px-4 py-2"
          >
            <option value="MEN">Men</option>
            <option value="WOMEN">Women</option>
            <option value="KIDS">Kids</option>
            <option value="UNISEX">Unisex</option>
          </select>

          <select
            value={product.department}
            onChange={e => setProduct({ ...product, department: e.target.value })}
            className="border rounded-lg px-4 py-2"
          >
            <option value="CLOTHING">Clothing</option>
            <option value="ACCESSORIES">Accessories</option>
            <option value="HOME">Home</option>
          </select>

          <input
            value={product.productType}
            onChange={e => setProduct({ ...product, productType: e.target.value })}
            className="border rounded-lg px-4 py-2"
            placeholder="Product Type (e.g., TSHIRT)"
          />
        </div>
      </section>

      {/* POLICIES */}
      <section className="bg-white border rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold">Policies</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Policy</label>
          <textarea
            value={product.shippingPolicy ?? ""}
            onChange={e => setProduct({ ...product, shippingPolicy: e.target.value })}
            rows={4}
            className="w-full border rounded-lg px-4 py-2"
            placeholder="Enter shipping policy..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Return Policy</label>
          <textarea
            value={product.returnPolicy ?? ""}
            onChange={e => setProduct({ ...product, returnPolicy: e.target.value })}
            rows={4}
            className="w-full border rounded-lg px-4 py-2"
            placeholder="Enter return policy..."
          />
        </div>
      </section>

      {/* PRODUCT IMAGES */}
      <section className="bg-white border rounded-2xl p-6">
        <h2 className="font-semibold mb-4">
          Product Images (drag to reorder)
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {product.images.map((img, i) => (
            <img
              key={i}
              src={`http://localhost:5000${img.imageUrl}`}
              draggable
              onDragStart={e =>
                e.dataTransfer.setData("index", i.toString())
              }
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                const from = Number(
                  e.dataTransfer.getData("index")
                );
                setProduct(prev =>
                  prev
                    ? {
                        ...prev,
                        images: reorder(prev.images, from, i),
                      }
                    : prev
                );
              }}
              className="h-28 object-cover rounded-lg border cursor-move"
            />
          ))}
        </div>
      </section>

      {/* COLORS + SIZES */}
      {product.colors.map((color, ci) => (
        <section
          key={ci}
          className="bg-white border rounded-2xl p-6 space-y-4"
        >
          <h3 className="font-semibold text-lg">
            Color {ci + 1}
          </h3>

          {/* COLOR SELECT */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <select
              value={color.name}
              onChange={e => updateColor(ci, e.target.value)}
              className="border rounded px-3 py-2"
            >
              {COLOR_OPTIONS.map(c => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <input
              value={color.hexCode ?? ""}
              disabled
              className="border rounded px-3 py-2 bg-gray-100"
            />

            <div
              className="h-10 rounded border"
              style={{
                backgroundColor: color.hexCode ?? "#eee",
              }}
            />
          </div>

          {/* SIZES */}
          <table className="w-full text-sm border">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2">Size</th>
                <th className="p-2">MRP</th>
                <th className="p-2">Price</th>
                <th className="p-2">Stock</th>
              </tr>
            </thead>
            <tbody>
              {color.sizes.map((size, si) => (
                <tr key={si} className="border-t">
                  <td className="p-2 text-center">{size.size}</td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={size.mrp}
                      onChange={e =>
                        updateSize(
                          ci,
                          si,
                          "mrp",
                          Number(e.target.value)
                        )
                      }
                      className="w-full border rounded px-2 py-1"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={size.price}
                      onChange={e =>
                        updateSize(
                          ci,
                          si,
                          "price",
                          Number(e.target.value)
                        )
                      }
                      className="w-full border rounded px-2 py-1"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={size.stock}
                      onChange={e =>
                        updateSize(
                          ci,
                          si,
                          "stock",
                          Number(e.target.value)
                        )
                      }
                      className="w-full border rounded px-2 py-1"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      {/* ACTIONS */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => router.push("/admin/products")}
          className="px-6 py-3 border rounded-xl"
        >
          Cancel
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
