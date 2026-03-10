"use client";

import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { useConfigurator } from "../ConfiguratorContext";

/* ======================================================
   SHORTS MODEL COMPONENT
   Loads GLB manually (no Suspense) so we always show loading or error state.
====================================================== */

const MODEL_URL = "/models/shorts.glb";

/** Center scene at origin and scale to fit in a size-2 box so it's always in view. */
function centerAndScaleScene(scene: THREE.Group, size = 2.5) {
  const box = new THREE.Box3().setFromObject(scene);
  const center = box.getCenter(new THREE.Vector3());
  const extent = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(extent.x, extent.y, extent.z, 0.001);
  const scale = size / maxDim;
  scene.position.sub(center);
  scene.scale.setScalar(scale);
  scene.updateMatrixWorld(true);
}

const MATERIAL_ZONES = {
  front: ["front", "front_panel", "main_front"],
  back: ["back", "back_panel", "main_back"],
  waistband: ["waistband", "waist", "band", "elastic"],
  legs: ["legs", "leg", "shorts_main", "main"],
  element1: ["element1", "stripe", "side_stripe", "trim"],
};

interface ShortsModelProps {
  rotation?: number;
}

function ModelFallback({ message }: { message: string }) {
  return (
    <>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>
      <Html center>
        <div className="text-center bg-white/95 rounded-lg shadow-lg px-4 py-3 max-w-[260px]">
          <p className="text-sm font-medium text-gray-800">{message}</p>
          <p className="text-xs text-gray-600 mt-1">
            Add <code className="bg-gray-200 px-1 rounded">shorts.glb</code> to{" "}
            <code className="bg-gray-200 px-1 rounded">public/models/</code>
          </p>
        </div>
      </Html>
    </>
  );
}

export default function ShortsModel({ rotation = 0 }: ShortsModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [modelScene, setModelScene] = useState<THREE.Group | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const { colors, patterns, gradients, fillTypes } = useConfigurator();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const loader = new GLTFLoader();
    loader.load(
      MODEL_URL,
      (gltf) => {
        if (cancelled) return;
        const cloned = gltf.scene.clone();
        centerAndScaleScene(cloned);
        setModelScene(cloned);
        setLoading(false);
      },
      undefined,
      (err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setModelScene(null);
        setLoading(false);
      }
    );

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!modelScene) return;

    modelScene.traverse((child: any) => {
      if (!child.isMesh || !child.material) return;

      const materials = Array.isArray(child.material) ? child.material : [child.material];
      const materialName = materials[0]?.name?.toLowerCase() || "";
      const meshName = (child.name || "").toLowerCase();

      let zone: keyof typeof MATERIAL_ZONES | null = null;
      for (const [zoneKey, possibleNames] of Object.entries(MATERIAL_ZONES)) {
        if (possibleNames.some((n) => materialName.includes(n.toLowerCase()) || meshName.includes(n.toLowerCase()))) {
          zone = zoneKey as keyof typeof MATERIAL_ZONES;
          break;
        }
      }

      if (!zone || !fillTypes[zone]) return;

      const fillType = fillTypes[zone];
      const color =
        fillType === "color" && colors[zone]
          ? colors[zone]
          : fillType === "gradient" && gradients[zone]?.enabled
            ? (gradients[zone]?.startColor ?? "#2563eb")
            : fillType === "pattern" && patterns[zone]
              ? (patterns[zone]?.color ?? "#ffffff")
              : null;
      if (!color) return;

      const toUpdate = Array.isArray(child.material) ? child.material : [child.material];
      toUpdate.forEach((mat: any, i: number) => {
        if (!mat.userData?.customized) {
          const cloned = mat.clone();
          cloned.userData.customized = true;
          if (Array.isArray(child.material)) child.material[i] = cloned;
          else child.material = cloned;
        }
        const target = Array.isArray(child.material) ? child.material[i] : child.material;
        if (target?.color) target.color.set(color);
        if (target?.map) target.map = null;
        if (target?.needsUpdate !== undefined) target.needsUpdate = true;
      });
    });
  }, [modelScene, colors, patterns, gradients, fillTypes]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  if (error) {
    return <ModelFallback message="Shorts model failed to load" />;
  }

  if (loading || !modelScene) {
    return (
      <>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#e5e7eb" />
        </mesh>
        <Html center>
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-gray-600 text-sm">Loading Shorts...</p>
          </div>
        </Html>
      </>
    );
  }

  return (
    <group ref={groupRef}>
      <group rotation={[0, rotation, 0]}>
        <primitive object={modelScene} />
      </group>
    </group>
  );
}
