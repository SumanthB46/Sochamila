"use client";

import { useEffect, useState, useMemo } from "react";
import api from "@/lib/axios";
import {
  Upload,
  Search,
  Trash2,
  Eye,
  Download,
  Copy,
  CheckCircle,
} from "lucide-react";

/* ================= TYPES ================= */

interface Graphic {
  id: string;
  imageUrl: string;
  createdAt: string;
}

/* ================= PAGE ================= */

export default function AdminGraphicsPage() {
  const [files, setFiles] = useState<Graphic[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [search, setSearch] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  /* ================= HELPERS ================= */

  const resolveImage = (url: string) =>
    url.startsWith("http")
      ? url
      : `http://localhost:5000${url}`;

  /* ================= LOAD ================= */

  const loadGraphics = async () => {
    try {
      setLoading(true);
      const res = await api.get("/graphics");
      setFiles(res.data?.data || []);
    } catch (err) {
      console.error("Load graphics failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGraphics();
  }, []);

  /* ================= SEARCH/FILTER ================= */

  const filteredFiles = useMemo(() => {
    return files.filter((file) =>
      file.id.toLowerCase().includes(search.toLowerCase())
    );
  }, [files, search]);

  /* ================= UPLOAD ================= */

  const uploadGraphics = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files?.length) return;

    const selectedFiles = Array.from(e.target.files);

    try {
      setUploadingFiles(true);
      setUploadProgress(0);

      const form = new FormData();
      selectedFiles.forEach((file) =>
        form.append("files", file)
      );

      await api.post("/graphics/upload", form, {
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

      await loadGraphics();
      setUploadProgress(0);
      alert("Graphics uploaded successfully!");
      e.target.value = "";
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload graphics");
      setUploadProgress(0);
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleFileInput = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    uploadGraphics(e);
  };

  /* ================= DELETE ================= */

  const deleteGraphic = async (id: string) => {
    if (
      !confirm("Are you sure you want to delete this graphic?")
    )
      return;

    try {
      await api.delete(`/graphics/${id}`);
      setFiles((p) => p.filter((f) => f.id !== id));
      alert("Graphic deleted successfully!");
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete graphic");
    }
  };

  /* ================= COPY URL ================= */

  const copyUrl = (graphic: Graphic) => {
    const url = resolveImage(graphic.imageUrl);
    navigator.clipboard.writeText(url);
    setCopiedId(graphic.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Graphics Library
      </h1>

      {/* SEARCH + INFO */}
      <div className="bg-white border rounded-xl p-4">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-gray-600">Total Graphics</p>
            <p className="text-2xl font-bold text-blue-600">
              {files.length}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-gray-600">Available for Design</p>
            <p className="text-2xl font-bold text-green-600">
              {filteredFiles.length}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-gray-600">Storage Used</p>
            <p className="text-2xl font-bold text-purple-600">
              {(files.length * 0.5).toFixed(1)} MB
            </p>
          </div>
        </div>

        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-3 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search graphics by ID..."
            className="pl-9 pr-3 py-2 border rounded-lg w-full text-sm"
          />
        </div>
      </div>

      {/* UPLOAD SECTION */}
      <div className="bg-white border rounded-xl p-4">
        <h3 className="flex items-center gap-2 font-semibold mb-4">
          <Upload size={18} className="text-blue-600" />
          Upload Graphics
        </h3>

        <label className="block">
          <input
            type="file"
            multiple
            accept="image/*,.svg"
            onChange={handleFileInput}
            disabled={uploadingFiles}
            className="hidden"
            id="graphics-upload"
          />
          <label
            htmlFor="graphics-upload"
            className={`cursor-pointer flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-8 transition-all ${
              uploadingFiles
                ? "bg-gray-50 border-gray-300 opacity-50 cursor-not-allowed"
                : "bg-blue-50 border-blue-300 hover:border-blue-500 hover:bg-blue-100"
            }`}
          >
            <Upload
              size={32}
              className={
                uploadingFiles ? "text-gray-400" : "text-blue-600"
              }
            />
            <div className="text-center">
              <p className="font-medium text-gray-800">
                {uploadingFiles
                  ? "Uploading..."
                  : "Click to upload graphics"}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                PNG, JPG, SVG, GIF, WebP (max 50 files)
              </p>
            </div>
          </label>
        </label>

        {/* UPLOAD PROGRESS */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
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

      {/* GRAPHICS GRID */}
      <div className="bg-white border rounded-xl p-4">
        <h3 className="font-semibold mb-4">
          Graphics ({filteredFiles.length})
        </h3>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading graphics...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {search ? "No graphics found" : "No graphics uploaded yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredFiles.map((graphic) => (
              <div
                key={graphic.id}
                className="border rounded-xl p-2 hover:shadow-lg transition-all group bg-white"
              >
                {/* Image Preview */}
                <div
                  className="relative bg-gray-100 rounded-lg overflow-hidden mb-2 cursor-pointer h-24 flex items-center justify-center"
                  onClick={() =>
                    setPreviewImage(
                      resolveImage(graphic.imageUrl)
                    )
                  }
                >
                  <img
                    src={resolveImage(graphic.imageUrl)}
                    alt="graphic"
                    className="h-full w-full object-contain hover:scale-110 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Eye size={20} className="text-white" />
                  </div>
                </div>

                {/* ID Info */}
                <p className="text-xs text-gray-600 truncate font-mono">
                  {graphic.id.slice(0, 8)}...
                </p>

                {/* Actions */}
                <div className="flex gap-1 mt-2">
                  <button
                    onClick={() => copyUrl(graphic)}
                    className={`flex-1 p-1.5 rounded text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                      copiedId === graphic.id
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    title="Copy URL to clipboard"
                  >
                    {copiedId === graphic.id ? (
                      <>
                        <CheckCircle size={12} />
                        <span className="hidden sm:inline">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span className="hidden sm:inline">Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => deleteGraphic(graphic.id)}
                    className="flex-1 p-1.5 rounded text-xs font-medium bg-red-100 text-red-600 hover:bg-red-200 transition-all flex items-center justify-center gap-1"
                    title="Delete graphic"
                  >
                    <Trash2 size={12} />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>

                {/* Upload Date */}
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {new Date(graphic.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
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
            className="bg-white rounded-2xl p-6 max-w-3xl w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Graphic Preview
              </h3>
              <button
                onClick={() => setPreviewImage(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
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
