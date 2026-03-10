"use client";

import { Component, Suspense, useRef, useState, createContext, useContext, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Html,
  PerspectiveCamera,
} from "@react-three/drei";
import * as THREE from "three";

import JerseyModel from "./JerseyModel";
import ShortsModel from "./ShortsModel";
import PantsModel from "./PantsModel";
import TracksuitModel from "./TracksuitModel";

import { ProductType, ViewerSettings } from "@/types/configurator";

/* ======================================================
   ERROR BOUNDARY INSIDE CANVAS
   Catches model load errors so we never show a blank canvas.
====================================================== */

class SceneErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Context for model rotation
const ModelRotationContext = createContext<{
  rotation: number;
  setRotation: (r: number) => void;
}>({ rotation: 0, setRotation: () => {} });

/* ======================================================
   PROPS
====================================================== */

interface ProductViewerProps {
  productType: ProductType;
  settings?: ViewerSettings;
}

/* ======================================================
   LIGHTING SETUP
====================================================== */

function Lighting() {
  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight
        position={[5, 10, 7]}
        intensity={1.5}
        castShadow={false}
      />
      <directionalLight
        position={[-5, 5, -5]}
        intensity={0.8}
        castShadow={false}
      />
      <pointLight position={[0, 5, 5]} intensity={1} />
    </>
  );
}

/* ======================================================
   MODEL ROTATION CONTROLS
====================================================== */

function ModelRotationControls() {
  const { rotation, setRotation } = useContext(ModelRotationContext);
  const isDragging = useRef(false);
  const lastX = useRef(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    lastX.current = e.clientX;
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const delta = e.clientX - lastX.current;
    setRotation(rotation + delta * 0.01);
    lastX.current = e.clientX;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  return (
    <mesh
      visible={false}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <planeGeometry args={[10, 10]} />
    </mesh>
  );
}

/* ======================================================
   PRODUCT RENDERER
====================================================== */

function ProductRenderer({ productType }: { productType: ProductType }) {
  const { rotation } = useContext(ModelRotationContext);

  switch (productType) {
    case "jersey":
      return <JerseyModel rotation={rotation} />;
    case "shorts":
      return <ShortsModel rotation={rotation} />;
    case "pants":
      return <PantsModel rotation={rotation} />;
    case "tracksuit":
      return <TracksuitModel rotation={rotation} />;
    default:
      return <JerseyModel rotation={rotation} />;
  }
}

/* ======================================================
   MAIN VIEWER COMPONENT
====================================================== */

export default function ProductViewer({
  productType,
  settings = {
    autoRotate: false,
    showShadows: true,
    backgroundColor: "#f3f4f6",
  },
}: ProductViewerProps) {
  const [rotation, setRotation] = useState(0.5); // Initial angle like Spized

  return (
    <ModelRotationContext.Provider value={{ rotation, setRotation }}>
      <div
        className="absolute inset-0 min-h-[400px] bg-gray-200"
        style={{ background: settings.backgroundColor }}
      >
        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{ 
            antialias: false,
            alpha: true,
            powerPreference: "high-performance",
            failIfMajorPerformanceCaveat: false,
          }}
          style={{ width: "100%", height: "100%", display: "block", background: settings.backgroundColor }}
          onError={(e) => console.error("Canvas error:", e)}
          onCreated={({ gl }) => {
            gl.setClearColor(0xf3f4f6, 1);
          }}
        >
          <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={40} />
          <Lighting />
          
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="#e5e7eb" />
          </mesh>
          <SceneErrorBoundary
            fallback={
              <>
                <mesh position={[0, 0.5, 0]}>
                  <boxGeometry args={[2, 2, 2]} />
                  <meshStandardMaterial color="#93c5fd" />
                </mesh>
                <Html center>
                  <div className="text-center bg-white rounded-lg shadow-xl px-6 py-4 border border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">Something went wrong</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Add <code className="bg-gray-200 px-1 rounded">jersey.glb</code> to public/models/
                    </p>
                  </div>
                </Html>
              </>
            }
          >
            <Suspense
              fallback={
                <>
                  <mesh position={[0, 0.5, 0]}>
                    <boxGeometry args={[2, 2, 2]} />
                    <meshStandardMaterial color="#93c5fd" />
                  </mesh>
                  <Html center>
                    <div className="text-center bg-white rounded-lg shadow-xl px-6 py-4 border border-gray-200">
                      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-gray-800 font-medium">Loading 3D model...</p>
                    </div>
                  </Html>
                </>
              }
            >
              <ProductRenderer productType={productType} />
              <ModelRotationControls />
            </Suspense>
          </SceneErrorBoundary>
        </Canvas>

      {/* Controls Overlay */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          className="bg-white p-2 rounded-lg shadow-md hover:shadow-lg transition"
          title="Reset View"
          onClick={() => {
            // Reset camera logic can be added here
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12" />
            <path d="M3 3v9h9" />
          </svg>
        </button>
        <button
          className="bg-white p-2 rounded-lg shadow-md hover:shadow-lg transition"
          title="Zoom In"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>
        <button
          className="bg-white p-2 rounded-lg shadow-md hover:shadow-lg transition"
          title="Zoom Out"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>
      </div>
      </div>
    </ModelRotationContext.Provider>
  );
}
