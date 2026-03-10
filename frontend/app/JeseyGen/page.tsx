"use client";

import { useState, useCallback, useEffect } from "react";

/* ================= JERSEY PRESETS ================= */

const JERSEY_PRESETS = [
  { id: 'classic', name: 'Classic Striped', description: 'Traditional vertical stripes' },
  { id: 'modern', name: 'Modern Minimal', description: 'Clean, contemporary design' },
  { id: 'aggressive', name: 'Aggressive Sport', description: 'Bold, dynamic patterns' },
  { id: 'retro', name: 'Retro Vintage', description: 'Nostalgic old-school style' },
  { id: 'gradient', name: 'Gradient Fade', description: 'Smooth color transitions' },
  { id: 'camo', name: 'Camo Tactical', description: 'Camouflage inspired design' },
  { id: 'neon', name: 'Neon Electric', description: 'Bright, high-visibility colors' },
  { id: 'marble', name: 'Marble Luxury', description: 'Elegant marble texture' }
];


/* ================= TYPES ================= */

type FormState = {
  primaryColor: string;
  secondaryColor: string;
  preset: string;
  playerName: string;
  playerNumber: string;
  teamName: string;
  customInstructions: string;
};

type ErrorState = {
  message: string;
  timestamp: number;
};

interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

interface SelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  required?: boolean;
}

/* ================= COMPONENT ================= */

const DEFAULT_FORM: FormState = {
  primaryColor: "Royal blue",
  secondaryColor: "White and gold accents",
  preset: "modern",
  playerName: "SUMANTH",
  playerNumber: "10",
  teamName: "",
  customInstructions: "",
};

export default function JerseyGeneratorPage() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<ErrorState | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  /* ================= HANDLERS ================= */

  const updateField = useCallback((key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }, []);

  const handleLogoUpload = useCallback((file: File | null) => {
    if (!file) {
      setLogoFile(null);
      setLogoPreview(null);
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError({
        message: "Please upload an image file (JPG, PNG, etc.)",
        timestamp: Date.now(),
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError({
        message: "File size must be less than 5MB",
        timestamp: Date.now(),
      });
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const validateForm = (): boolean => {
    const required = ["primaryColor", "playerName", "playerNumber"];
    const missing = required.filter(
      (field) => !form[field as keyof FormState]?.trim()
    );

    if (missing.length > 0) {
      setError({
        message: `Please fill in: ${missing.join(", ")}`,
        timestamp: Date.now(),
      });
      return false;
    }
    return true;
  };

  const generateImages = async () => {
    if (!validateForm()) return;

    setIsGenerating(true);
    setImages([]);
    setError(null);

    try {
      // Convert logo to base64 if uploaded
      let sourceFiles: string[] = [];
      if (logoPreview) {
        const base64 = logoPreview.split(',')[1];
        if (base64) {
          sourceFiles = [base64];
        }
      }

      const res = await fetch("http://localhost:5000/api/jersey/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: `${form.primaryColor} jersey with ${form.secondaryColor} accents`,
          preset: form.preset as any,
          playerName: form.playerName,
          playerNumber: form.playerNumber,
          teamName: form.teamName || undefined,
          customInstructions: form.customInstructions || undefined,
          sourceFiles: sourceFiles.length > 0 ? sourceFiles : undefined
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `API error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();

      if (!data.success || !data.images || data.images.length === 0) {
        throw new Error(data.error || "No images returned from API");
      }

      setImages(data.images);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Image generation failed";
      setError({
        message,
        timestamp: Date.now(),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async (img: string, index: number) => {
    try {
      const response = await fetch(img);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `jersey-${index + 1}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError({
        message: "Failed to download image",
        timestamp: Date.now(),
      });
    }
  };

  const resetForm = () => {
    setForm(DEFAULT_FORM);
    setImages([]);
    setError(null);
    setLogoFile(null);
    setLogoPreview(null);
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Jersey Generator
          </h1>
          <p className="text-gray-600">
            Design your perfect jersey with AI-powered visualization
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start justify-between">
            <div>
              <p className="text-red-800 font-semibold">Error</p>
              <p className="text-red-700 text-sm">{error.message}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 font-bold"
              aria-label="Close error"
            >
              ×
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT PANEL - FORM */}
          <div className="bg-white p-6 rounded-2xl shadow-lg space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Jersey Configuration
              </h2>
              <button
                onClick={resetForm}
                className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors"
                title="Reset form to defaults"
              >
                Reset
              </button>
            </div>

            <Input
              label="Primary Color *"
              value={form.primaryColor}
              onChange={(v) => updateField("primaryColor", v)}
              placeholder="e.g., Royal blue, Red, Navy"
              required
            />
            <Input
              label="Secondary Color/Accents"
              value={form.secondaryColor}
              onChange={(v) => updateField("secondaryColor", v)}
              placeholder="e.g., White and gold accents"
            />

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Design Preset *
              </label>
              <select
                value={form.preset}
                onChange={(e) => updateField("preset", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors bg-white cursor-pointer"
              >
                {JERSEY_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name} - {preset.description}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Player Name *"
                value={form.playerName}
                onChange={(v) => updateField("playerName", v)}
                placeholder="e.g., RONALDO"
                required
              />
              <Input
                label="Player Number *"
                value={form.playerNumber}
                onChange={(v) => updateField("playerNumber", v)}
                placeholder="e.g., 7"
                required
              />
            </div>

            <Input
              label="Team Name (Optional)"
              value={form.teamName}
              onChange={(v) => updateField("teamName", v)}
              placeholder="e.g., Manchester United"
            />

            {/* Custom Instructions Section */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Custom Instructions (Optional)
              </label>
              <textarea
                value={form.customInstructions}
                onChange={(e) => updateField("customInstructions", e.target.value)}
                rows={4}
                placeholder="e.g., Add metallic sheen, Make the design more aggressive, Include team crest..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 font-normal text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors resize-none"
                aria-label="Custom instructions for image generation"
              />
              <p className="text-xs text-gray-500 mt-1">
                Add any specific changes or adjustments you want the AI to make
              </p>
            </div>

            <button
              onClick={generateImages}
              disabled={isGenerating}
              className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <span className="animate-spin">⊙</span> Generating...
                </>
              ) : (
                <>🎨 Generate Jersey (4 Views)</>
              )}
            </button>
          </div>

          {/* RIGHT PANEL - OUTPUT */}
          <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Generated Jersey Design</h2>

            {isGenerating && (
              <div className="flex-1 flex items-center justify-center flex-col">
                <div className="relative w-16 h-16 mb-4">
                  <div className="absolute inset-0 bg-linear-to-r from-indigo-400 to-indigo-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-1 bg-white rounded-full"></div>
                </div>
                <p className="text-indigo-600 font-semibold text-center">
                  Generating your 4-view jersey design...<br/>
                  <span className="text-sm text-gray-500">Front, Back, Left Side, Right Side</span>
                </p>
              </div>
            )}

            {!isGenerating && images.length === 0 && (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-400 text-center">
                  🎨 Fill the form and click Generate to create your jersey design.
                </p>
              </div>
            )}

            {images.length > 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {images.map((img, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={img}
                        alt={`Jersey view ${i + 1}`}
                        className="rounded-lg shadow border border-gray-200 w-full"
                      />
                      <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs font-semibold">
                        {i === 0 ? 'FRONT' : i === 1 ? 'BACK' : i === 2 ? 'LEFT' : 'RIGHT'}
                      </div>
                      <button
                        onClick={() => downloadImage(img, i)}
                        className="absolute top-2 right-2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        title={`Download view ${i + 1}`}
                      >
                        ⬇️
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 text-center mt-4">
                  2×2 grid showing Front, Back, Left Side, and Right Side views
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= ENHANCED UI HELPERS ================= */

function Input({
  label,
  value,
  onChange,
  placeholder,
  required,
}: InputProps) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-700">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
        aria-label={label}
      />
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
  required,
}: SelectProps) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-700">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors bg-white cursor-pointer"
        aria-label={label}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}