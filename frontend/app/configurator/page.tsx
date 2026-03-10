"use client";

import { Component, ReactNode } from "react";
import dynamic from "next/dynamic";
import { ConfiguratorProvider, useConfigurator } from "@/components/configurator/ConfiguratorContext";
import Sidebar from "@/components/configurator/Sidebar";
import RightPanel from "@/components/configurator/RightPanel";
import BottomBar from "@/components/configurator/BottomBar";

/* ======================================================
   ERROR BOUNDARY – show message if 3D viewer or model fails
====================================================== */

class ViewerErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[400px] flex-1 min-h-0 flex items-center justify-center bg-gray-100 p-6 overflow-auto">
          <div className="text-center max-w-md">
            <p className="text-gray-800 font-medium mb-1">3D viewer couldn’t load</p>
            <p className="text-sm text-gray-600 mb-4">
              Add <code className="bg-gray-200 px-1 rounded">jersey.glb</code> (and optionally{" "}
              <code className="bg-gray-200 px-1 rounded">shorts.glb</code>) into{" "}
              <code className="bg-gray-200 px-1 rounded">public/models/</code> so the configurator can display the product.
            </p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false })}
              className="text-sm text-blue-600 hover:underline"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return <div className="absolute inset-0 min-h-[400px]">{this.props.children}</div>;
  }
}

/* ======================================================
   DYNAMIC IMPORT FOR 3D VIEWER
   
   This prevents SSR issues with Three.js
====================================================== */

const ProductViewer = dynamic(
  () => import("@/components/configurator/three/ProductViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading 3D Viewer...</p>
        </div>
      </div>
    ),
  }
);

/* ======================================================
   VIEWER WITH DYNAMIC PRODUCT TYPE
====================================================== */

function ViewerWithProduct() {
  const { selectedProduct } = useConfigurator();
  return <ProductViewer productType={selectedProduct} />;
}

/* ======================================================
   MAIN CONFIGURATOR PAGE
====================================================== */

export default function ConfiguratorPage() {
  return (
    <ConfiguratorProvider>
      <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Left Sidebar - Narrow tabs only */}
          <Sidebar />

          {/* Center - 3D Viewer: ensure min width and visible background */}
          <div className="flex-1 relative min-h-0 min-w-[280px] bg-gray-200">
            <div className="absolute inset-0 bg-gray-200">
              <ViewerErrorBoundary>
                <ViewerWithProduct />
              </ViewerErrorBoundary>
            </div>
          </div>

          {/* Right Panel - Design selection */}
          <RightPanel />
        </div>

        {/* Bottom Bar */}
        <BottomBar />
      </div>
    </ConfiguratorProvider>
  );
}
