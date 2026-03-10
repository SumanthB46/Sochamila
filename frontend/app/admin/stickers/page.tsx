"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import {
  Search,
  Eye,
  EyeOff,
  Plus,
  TrendingUp,
  X,
  Trash2,
  Upload,
} from "lucide-react";

/* ================= TYPES ================= */

interface Category {
  id: string;
  name: string;
  _count?: { stickers: number };
}

interface Sticker {
  id: string;
  name: string;
  imageUrl: string;
  usageCount: number;
  isActive: boolean;
  category: Category;
}

/* ================= API PATHS ================= */

const API = {
  stickers: "/admin/stickers",
  upload: "/admin/stickers/upload",
  toggle: (id: string) => `/admin/stickers/${id}/toggle`,
  delete: (id: string) => `/admin/stickers/${id}`,
  move: (id: string) => `/admin/stickers/${id}/category`,

  categories: "/admin/sticker-categories",
  createCategory: "/admin/sticker-categories",
  updateCategory: (id: string) =>
    `/admin/sticker-categories/${id}`,
  deleteCategory: (id: string) =>
    `/admin/sticker-categories/${id}`,
};

/* ================= HELPERS ================= */

const resolveImage = (url: string) =>
  url.startsWith("http")
    ? url
    : `http://localhost:5000${url}`;

/* ================= PAGE ================= */

export default function AdminStickersPage() {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  /* ================= LOAD DATA ================= */

  const loadAll = async () => {
    try {
      setLoading(true);

      const [stickersRes, categoriesRes] = await Promise.all([
        api.get(API.stickers),
        api.get(API.categories),
      ]);

      setStickers(stickersRes.data || []);
      setCategories(categoriesRes.data || []);

      if (
        !selectedCategoryId &&
        categoriesRes.data?.length
      ) {
        setSelectedCategoryId(categoriesRes.data[0].id);
      }
    } catch (error) {
      console.error("Failed to load stickers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  /* ================= CATEGORY ================= */

  const createCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;

    if (
      categories.some(
        (c) => c.name.toLowerCase() === name.toLowerCase()
      )
    ) {
      alert("Category already exists");
      return;
    }

    try {
      const res = await api.post(API.createCategory, {
        name,
      });

      setCategories((p) => [...p, res.data]);
      setSelectedCategoryId(res.data.id);
      setNewCategoryName("");
    } catch (error) {
      console.error("Create category failed:", error);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      await api.delete(API.deleteCategory(id));
      setCategories((p) => p.filter((c) => c.id !== id));
      if (selectedCategoryId === id) {
        setSelectedCategoryId(categories[0]?.id || "");
      }
    } catch (error) {
      console.error("Delete category failed:", error);
    }
  };

  /* ================= STICKERS ================= */

  const toggleSticker = async (id: string) => {
    try {
      await api.patch(API.toggle(id));
      setStickers((p) =>
        p.map((s) =>
          s.id === id
            ? { ...s, isActive: !s.isActive }
            : s
        )
      );
    } catch (error) {
      console.error("Toggle sticker failed:", error);
    }
  };

  const moveSticker = async (
    stickerId: string,
    categoryId: string
  ) => {
    try {
      await api.patch(API.move(stickerId), {
        categoryId,
      });

      setStickers((p) =>
        p.map((s) =>
          s.id === stickerId
            ? {
                ...s,
                category: {
                  ...s.category,
                  id: categoryId,
                },
              }
            : s
        )
      );
    } catch (error) {
      console.error("Move sticker failed:", error);
    }
  };

  /* ================= UPLOAD STICKERS ================= */

  const uploadStickers = async (files: File[]) => {
    if (!selectedCategoryId) {
      alert("Please select a category first");
      return;
    }

    if (files.length === 0) return;

    try {
      setUploadingFiles(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append("categoryId", selectedCategoryId);

      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await api.post(API.upload, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) /
                progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        },
      });

      // Add newly uploaded stickers to the list
      if (response.data && Array.isArray(response.data)) {
        setStickers((p) => [...response.data, ...p]);
      }

      setUploadProgress(0);
      alert("Stickers uploaded successfully!");
    } catch (error) {
      console.error("Upload stickers failed:", error);
      alert("Failed to upload stickers");
      setUploadProgress(0);
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleFileInput = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      uploadStickers(files);
    }
    // Reset input
    e.target.value = "";
  };

  /* ================= FILTERS ================= */

  const filteredStickers = useMemo(() => {
    return stickers.filter(
      (s) =>
        s.name
          .toLowerCase()
          .includes(search.toLowerCase()) &&
        (!selectedCategoryId ||
          s.category.id === selectedCategoryId)
    );
  }, [stickers, search, selectedCategoryId]);

  const trending = useMemo(() => {
    return [...stickers]
      .filter((s) => s.isActive)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5);
  }, [stickers]);

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Sticker Manager
      </h1>

      {/* SEARCH + FILTER + CATEGORY MANAGEMENT */}
      <div className="bg-white border rounded-xl p-4 space-y-4">
        <div className="flex gap-3 items-center flex-wrap">
          <div className="relative flex-1 min-w-60">
            <Search
              size={16}
              className="absolute left-3 top-2.5 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stickers"
              className="pl-9 pr-3 py-2 border rounded-lg w-full text-sm"
            />
          </div>

          <select
            value={selectedCategoryId}
            onChange={(e) =>
              setSelectedCategoryId(e.target.value)
            }
            className="border rounded-lg px-3 py-2 text-sm font-medium bg-white"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c._count?.stickers || 0})
              </option>
            ))}
          </select>
        </div>

        {/* ADD CATEGORY */}
        <div className="border-t pt-4">
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Add New Category
          </label>
          <div className="flex gap-2">
            <input
              value={newCategoryName}
              onChange={(e) =>
                setNewCategoryName(e.target.value)
              }
              placeholder="Category name"
              className="flex-1 border px-3 py-2 rounded-lg text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") createCategory();
              }}
            />

            <button
              onClick={createCategory}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={16} />
              Add
            </button>
          </div>

          {/* CATEGORY LIST */}
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((c) => (
              <div
                key={c.id}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setSelectedCategoryId(c.id);
                  }
                }}
                onClick={() => setSelectedCategoryId(c.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
                  selectedCategoryId === c.id
                    ? "bg-indigo-100 border-indigo-500 shadow-md"
                    : "bg-gray-100 border-gray-300 hover:border-gray-400"
                }`}
              >
                <span className="text-sm font-medium">{c.name}</span>
                <span className="text-xs text-gray-600">
                  ({c._count?.stickers || 0})
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteCategory(c.id);
                  }}
                  className="ml-1 text-gray-400 hover:text-red-600 transition-colors"
                  aria-label={`Delete category ${c.name}`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* QUICK UPLOAD - Right after category selection */}
        {selectedCategoryId && (
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Upload size={16} className="text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">
                Upload to: <span className="text-blue-600">
                  {categories.find((c) => c.id === selectedCategoryId)?.name}
                </span>
              </span>
            </div>

            <label className="block">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInput}
                disabled={uploadingFiles}
                className="hidden"
                id="sticker-upload"
              />
              <label
                htmlFor="sticker-upload"
                className={`cursor-pointer flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-6 transition-all ${
                  uploadingFiles
                    ? "bg-gray-50 border-gray-300 opacity-50 cursor-not-allowed"
                    : "bg-blue-50 border-blue-300 hover:border-blue-500 hover:bg-blue-100"
                }`}
              >
                <Upload
                  size={20}
                  className={
                    uploadingFiles ? "text-gray-400" : "text-blue-600"
                  }
                />
                <div className="text-center">
                  <p className="font-medium text-gray-800 text-sm">
                    {uploadingFiles
                      ? "Uploading..."
                      : "Click to upload sticker images"}
                  </p>
                  <p className="text-xs text-gray-600">
                    PNG, JPG, GIF, WebP (up to 50 files)
                  </p>
                </div>
              </label>
            </label>

            {/* UPLOAD PROGRESS */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-blue-600">
                    {uploadProgress}% uploaded
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* TRENDING */}
      <div className="bg-white border rounded-xl p-4">
        <h3 className="flex items-center gap-2 font-semibold mb-3">
          <TrendingUp size={18} className="text-amber-500" />
          Trending Stickers
        </h3>

        {trending.length > 0 ? (
          <div className="grid grid-cols-5 gap-4">
            {trending.map((s) => (
              <div
                key={s.id}
                className="cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setPreviewImage(resolveImage(s.imageUrl))}
              >
                <div className="border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <img
                    src={resolveImage(s.imageUrl)}
                    className="h-20 w-full object-contain"
                    alt={s.name}
                  />
                  <p className="text-xs text-gray-600 mt-2 text-center font-medium">
                    {s.usageCount} uses
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No trending stickers yet</p>
        )}
      </div>

      {/* STICKERS GRID */}
      <div className="bg-white border rounded-xl p-4">
        <h3 className="font-semibold mb-4">
          Stickers ({filteredStickers.length})
        </h3>
        <div className="grid grid-cols-4 gap-4 lg:grid-cols-6 md:grid-cols-5">
          {loading && (
            <p className="text-sm text-gray-500 col-span-full">
              Loading stickers...
            </p>
          )}

          {!loading &&
            filteredStickers.map((sticker) => (
              <div
                key={sticker.id}
                className={`border rounded-xl p-3 relative group hover:shadow-lg transition-all ${
                  !sticker.isActive
                    ? "opacity-50 bg-gray-50"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                {/* Image Preview */}
                <div
                  className="h-24 mx-auto object-contain flex items-center justify-center cursor-pointer"
                  onClick={() =>
                    setPreviewImage(
                      resolveImage(sticker.imageUrl)
                    )
                  }
                >
                  <img
                    src={resolveImage(sticker.imageUrl)}
                    className="max-h-24 max-w-full object-contain"
                    alt={sticker.name}
                  />
                </div>

                {/* Name and Hover Info */}
                <div className="mt-2 text-xs">
                  <p className="font-semibold text-gray-800 truncate">
                    {sticker.name}
                  </p>
                  <p className="text-gray-500">
                    {sticker.usageCount} uses
                  </p>
                </div>

                {/* Category Select */}
                <select
                  value={sticker.category.id}
                  onChange={(e) =>
                    moveSticker(
                      sticker.id,
                      e.target.value
                    )
                  }
                  className="mt-2 w-full border rounded text-xs px-2 py-1 bg-white hover:bg-gray-50"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                {/* Toggle Button */}
                <button
                  onClick={() =>
                    toggleSticker(sticker.id)
                  }
                  className="absolute top-2 right-2 p-1.5 bg-white rounded-lg shadow-sm hover:shadow-md transition-all opacity-0 group-hover:opacity-100"
                  title={
                    sticker.isActive
                      ? "Hide sticker"
                      : "Show sticker"
                  }
                >
                  {sticker.isActive ? (
                    <EyeOff size={16} className="text-gray-600" />
                  ) : (
                    <Eye size={16} className="text-gray-400" />
                  )}
                </button>
              </div>
            ))}
        </div>

        {!loading && filteredStickers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No stickers found in this category
            </p>
          </div>
        )}
      </div>

      {/* IMAGE PREVIEW MODAL */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Image Preview
              </h3>
              <button
                onClick={() => setPreviewImage(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center min-h-96">
              <img
                src={previewImage}
                alt="Preview"
                className="max-w-full max-h-96 object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
