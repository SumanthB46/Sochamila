"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Trash2, Pencil } from "lucide-react";

interface Category {
  id: string;
  name: string;
  isActive: boolean;
}

const API = {
  base: "/api/admin/sticker-categories",
};

export default function StickerCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD ================= */

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get(API.base);
      setCategories(res.data || []);
    } catch (err) {
      console.error("Load categories failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* ================= SAVE ================= */

  const save = async () => {
    const value = name.trim();
    if (!value) return;

    try {
      if (editing) {
        await api.put(`${API.base}/${editing.id}`, {
          name: value,
        });
      } else {
        await api.post(API.base, { name: value });
      }

      setName("");
      setEditing(null);
      load();
    } catch (err) {
      console.error("Save category failed", err);
    }
  };

  /* ================= DELETE ================= */

  const remove = async (id: string) => {
    if (!confirm("Delete this category permanently?")) return;

    try {
      await api.delete(`${API.base}/${id}`);
      load();
    } catch (err) {
      console.error("Delete category failed", err);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="space-y-6 max-w-xl">

      <h1 className="text-2xl font-bold">
        Sticker Categories
      </h1>

      {/* CREATE / EDIT */}
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          className="border px-3 py-2 rounded w-full"
        />

        <button
          onClick={save}
          className="bg-indigo-600 text-white px-4 rounded"
        >
          {editing ? "Update" : "Add"}
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-2">
        {loading && (
          <p className="text-sm text-gray-500">
            Loading categories...
          </p>
        )}

        {!loading &&
          categories.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between border rounded px-4 py-2"
            >
              <span>{c.name}</span>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEditing(c);
                    setName(c.name);
                  }}
                >
                  <Pencil size={16} />
                </button>

                <button
                  onClick={() => remove(c.id)}
                >
                  <Trash2
                    size={16}
                    className="text-red-600"
                  />
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
