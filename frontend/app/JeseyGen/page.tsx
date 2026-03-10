"use client";

import { useState, useCallback, useEffect } from "react";

/* ================= HARD-CODED SYSTEM PROMPT ================= */

const SYSTEM_PROMPT = `
You are a professional sports apparel designer and advanced AI image generator specializing in football jerseys.

Your task is to generate exactly two ultra-realistic, high-resolution images of a football jersey based strictly on the user's design requirements.

IMAGE REQUIREMENTS:

Image 1: Front view of the football jersey
Image 2: Back view of the football jersey

DESIGN RULES:

- Follow the user's instructions for colors, patterns, logos, text, name, and number precisely
- Ensure perfect design consistency between front and back (same fabric, colors, and patterns)
- Jersey must look professionally manufactured, suitable for real match play
- Use clean stitching, realistic fabric folds, and accurate textures
- No human model - display jersey as flat-lay or on a neutral mannequin

JERSEY PRESENTATION:

- Plain neutral background (white, gray, or studio background)
- Center the jersey clearly in the frame
- No watermarks, no extra text, no background objects

FRONT VIEW (Image 1 must show):

- Primary and secondary colors clearly visible
- Collar type (round, V-neck, polo, crew neck, etc.)
- Sleeve design and patterns exactly as specified
- Team logo placement on chest (if provided)
- Sponsor text or logo (if provided)
- Any side panels or special design elements

BACK VIEW (Image 2 must show):

- Player name clearly printed in bold font
- Jersey number in large, bold, readable font
- Back panel or side design elements matching front
- Same fabric and color alignment as front view
- All back details exactly as specified

QUALITY STANDARDS:

- Photorealistic lighting and shadows
- High sharpness and clarity
- Professional sports apparel quality
- Realistic fabric texture and material appearance
- Perfect consistency between both images

CRITICAL REQUIREMENTS:

- Generate EXACTLY 2 images - no more, no fewer
- Both images must show the SAME jersey design from different angles
- Must be suitable for professional product photography
- No human models, no unnecessary backgrounds
`;


/* ================= TYPES ================= */

type FormState = {
  primaryColor: string;
  secondaryColor: string;
  jerseyStyle: string;
  sleeveDesign: string;
  collar: string;
  fabric: string;
  frontDetails: string;
  backDetails: string;
  extraDetails: string;
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
  jerseyStyle: "Modern and aggressive",
  sleeveDesign: "White geometric patterns",
  collar: "V-neck",
  fabric: "Matte mesh",
  frontDetails: "Club logo on left chest, sponsor text in center",
  backDetails: 'Player name "SUMANTH", number "10" in bold modern font',
  extraDetails: "Gold side panels",
};

export default function JerseyGeneratorPage() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [reviewText, setReviewText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<ErrorState | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");

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
    const required = ["primaryColor", "secondaryColor", "jerseyStyle"];
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

  const convertToText = () => {
    if (!validateForm()) return;

    const text = `
Primary color: ${form.primaryColor}
Secondary color: ${form.secondaryColor}

Jersey style: ${form.jerseyStyle}
Sleeves: ${form.sleeveDesign}
Collar: ${form.collar}
Fabric: ${form.fabric}

Front: ${form.frontDetails}
Back: ${form.backDetails}

Extra: ${form.extraDetails || "None"}

Logo: ${logoFile ? `Uploaded (${logoFile.name})` : "No logo uploaded"}

Custom Instructions: ${customPrompt || "None"}
    `.trim();

    setReviewText(text);
    setError(null);
  };

  const generateImages = async () => {
    if (!reviewText.trim()) {
      setError({
        message: "Please convert form to text first",
        timestamp: Date.now(),
      });
      return;
    }

    setIsGenerating(true);
    setImages([]);
    setError(null);

    try {
      const res = await fetch("http://localhost:5000/api/jersey/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: reviewText,
          customInstructions: customPrompt || undefined
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
    setReviewText("");
    setImages([]);
    setError(null);
    setLogoFile(null);
    setLogoPreview(null);
    setCustomPrompt("");
  };

  const copyReviewText = () => {
    navigator.clipboard.writeText(reviewText);
  };

  // Keyboard shortcut: Ctrl+Enter or Cmd+Enter to generate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && reviewText) {
        generateImages();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [reviewText]);

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
              label="Secondary Color *"
              value={form.secondaryColor}
              onChange={(v) => updateField("secondaryColor", v)}
              placeholder="e.g., White and gold accents"
              required
            />

            <Select
              label="Jersey Style *"
              value={form.jerseyStyle}
              options={[
                "Modern",
                "Classic",
                "Minimal",
                "Aggressive",
                "Modern and aggressive",
              ]}
              onChange={(v) => updateField("jerseyStyle", v)}
              required
            />

            <Select
              label="Sleeve Design"
              value={form.sleeveDesign}
              options={[
                "Plain",
                "Stripes",
                "Geometric patterns",
                "White geometric patterns",
              ]}
              onChange={(v) => updateField("sleeveDesign", v)}
            />

            <Select
              label="Collar"
              value={form.collar}
              options={["Round", "V-neck", "Polo", "Crew neck"]}
              onChange={(v) => updateField("collar", v)}
            />

            <Select
              label="Fabric"
              value={form.fabric}
              options={["Matte", "Mesh", "Glossy", "Matte mesh", "Breathable"]}
              onChange={(v) => updateField("fabric", v)}
            />

            {/* Logo Upload Section */}
            <div className="border-t pt-4">
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Logo Upload
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleLogoUpload(e.target.files?.[0] || null)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Upload logo"
              />
              <p className="text-xs text-gray-500 mt-1">
                Max 5MB. Accepted formats: JPG, PNG, SVG, etc.
              </p>

              {logoPreview && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Logo Preview:
                  </p>
                  <div className="flex items-start gap-3">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="h-20 w-20 object-contain border border-gray-200 rounded-lg p-1"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 font-medium">
                        {logoFile?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(logoFile?.size || 0) / 1024 < 1000
                          ? `${((logoFile?.size || 0) / 1024).toFixed(1)} KB`
                          : `${((logoFile?.size || 0) / (1024 * 1024)).toFixed(1)} MB`}
                      </p>
                      <button
                        onClick={() => handleLogoUpload(null)}
                        className="text-xs text-red-600 hover:text-red-800 font-semibold mt-2"
                      >
                        Remove Logo
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Input
              label="Front Details"
              value={form.frontDetails}
              onChange={(v) => updateField("frontDetails", v)}
              placeholder="e.g., Club logo on left chest"
            />
            <Input
              label="Back Details"
              value={form.backDetails}
              onChange={(v) => updateField("backDetails", v)}
              placeholder='e.g., Player name "NAME", number "10"'
            />
            <Input
              label="Extra Details"
              value={form.extraDetails}
              onChange={(v) => updateField("extraDetails", v)}
              placeholder="e.g., Gold side panels"
            />

            {/* Custom Instructions Section */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Custom Instructions (Optional)
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={4}
                placeholder="e.g., Remove background, Change primary color to red, Add metallic sheen, Make the design more aggressive, Add team logo..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 font-normal text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors resize-none"
                aria-label="Custom instructions for image generation"
              />
              <p className="text-xs text-gray-500 mt-1">
                Add any specific changes or adjustments you want the AI to make to the design
              </p>
            </div>

            <button
              onClick={convertToText}
              className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              📋 Convert to Text
            </button>
          </div>

          {/* RIGHT PANEL - OUTPUT */}
          <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Result</h2>

            {!reviewText && (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-400 text-center">
                  📝 Fill the form and convert to text to continue.
                </p>
              </div>
            )}

            {reviewText && (
              <>
                {/* Textarea with improved styling */}
                <div className="mb-4">
                  <textarea
                    value={reviewText}
                    onChange={(e) => {
                      setReviewText(e.target.value);
                      setError(null);
                    }}
                    rows={10}
                    className="w-full border border-gray-300 rounded-lg p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Your design specifications appear here..."
                  />
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 mb-4">
                  <button
                    onClick={generateImages}
                    disabled={isGenerating}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    title="Generate images (Ctrl+Enter)"
                  >
                    {isGenerating ? (
                      <>
                        <span className="animate-spin">⊙</span> Generating...
                      </>
                    ) : (
                      <>🎨 Generate Images</>
                    )}
                  </button>
                  <button
                    onClick={copyReviewText}
                    className="px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
                    title="Copy to clipboard"
                  >
                    📋
                  </button>
                </div>

                {isGenerating && (
                  <div className="flex items-center justify-center py-8">
                    <div className="relative w-12 h-12">
                      <div className="absolute inset-0 bg-linear-to-r from-purple-400 to-purple-600 rounded-full animate-spin"></div>
                      <div className="absolute inset-1 bg-white rounded-full"></div>
                    </div>
                    <p className="ml-4 text-purple-600 font-semibold">
                      Generating your jersey designs...
                    </p>
                  </div>
                )}

                {images.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {images.map((img, i) => (
                        <div key={i} className="relative group">
                          <img
                            src={img}
                            alt={`Jersey ${i + 1}`}
                            className="rounded-lg shadow border border-gray-200 w-full"
                          />
                          <button
                            onClick={() => downloadImage(img, i)}
                            className="absolute top-2 right-2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            title={`Download jersey ${i + 1}`}
                          >
                            ⬇️ Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
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