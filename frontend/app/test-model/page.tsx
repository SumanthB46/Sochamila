"use client";

import { Suspense, useState, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";

// Ensure Draco decoder is available (for Draco-compressed GLBs)
useGLTF.setDecoderPath?.("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");

function centerAndScale(scene: THREE.Group, size = 2) {
  const box = new THREE.Box3().setFromObject(scene);
  const center = box.getCenter(new THREE.Vector3());
  const extent = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(extent.x, extent.y, extent.z, 0.001);
  const scale = size / maxDim;
  scene.position.sub(center);
  scene.scale.setScalar(scale);
  scene.updateMatrixWorld(true);
}

function makeVisible(scene: THREE.Group, color = 0x2563eb) {
  scene.traverse((child: any) => {
    if (!child.isMesh) return;
    child.material = new THREE.MeshBasicMaterial({
      color,
      side: THREE.DoubleSide,
    });
  });
}

function Model3D({ path, onInspect }: { path: string; onInspect: (mats: string[], meshes: string[]) => void }) {
  const { scene } = useGLTF(path);
  const inspected = useRef(false);
  const cloned = useMemo(() => {
    const c = scene.clone();
    centerAndScale(c, 2.2);
    makeVisible(c, 0x2563eb);
    return c;
  }, [scene]);

  useFrame(() => {
    if (!inspected.current && scene) {
      inspected.current = true;
      const mats: string[] = [];
      const meshes: string[] = [];
      scene.traverse((child: any) => {
        if (child.isMesh) {
          meshes.push(`${child.name} (material: ${child.material?.name || "unnamed"})`);
          if (child.material && !mats.includes(child.material.name)) mats.push(child.material.name);
        }
      });
      onInspect(mats, meshes);
    }
  });

  return <primitive object={cloned} position={[0, 0, 0]} />;
}

export default function TestModelPage() {
  const [modelPath, setModelPath] = useState("/models/jersey.glb");
  const [materialList, setMaterialList] = useState<string[]>([]);
  const [meshList, setMeshList] = useState<string[]>([]);

  const handleInspect = (mats: string[], meshes: string[]) => {
    setMaterialList(mats);
    setMeshList(meshes);
  };

  return (
    <div className="h-screen relative">
      {/* UI Overlay - Outside Canvas */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={() => setModelPath("/models/jersey.glb")}
          className={`px-4 py-2 rounded shadow ${modelPath.includes('jersey') ? 'bg-blue-600 text-white' : 'bg-white'}`}
        >
          Jersey
        </button>
        <button
          onClick={() => setModelPath("/models/shorts.glb")}
          className={`px-4 py-2 rounded shadow ${modelPath.includes('shorts') ? 'bg-blue-600 text-white' : 'bg-white'}`}
        >
          Shorts
        </button>
      </div>

      {/* Material Inspector Panel */}
      <div className="absolute top-4 left-4 z-10 bg-white/95 p-4 rounded-lg shadow-lg max-w-sm max-h-[80vh] overflow-auto">
        <h3 className="font-bold mb-2 text-gray-900">Materials Found:</h3>
        <ul className="text-sm space-y-1 mb-4">
          {materialList.length === 0 && <li className="text-gray-500">Loading...</li>}
          {materialList.map((m) => (
            <li key={m} className="text-blue-600 font-mono bg-blue-50 px-2 py-1 rounded">{m}</li>
          ))}
        </ul>
        <h3 className="font-bold mb-2 text-gray-900">Meshes:</h3>
        <ul className="text-xs space-y-1 text-gray-600">
          {meshList.slice(0, 15).map((m, i) => (
            <li key={i} className="border-b border-gray-100 pb-1">{m}</li>
          ))}
          {meshList.length > 15 && <li className="text-gray-400">...and {meshList.length - 15} more</li>}
        </ul>
      </div>
      
      {/* 3D Canvas - explicit size and gray background so viewport is visible */}
      <div className="absolute inset-0 min-h-[400px]" style={{ background: "#e5e7eb" }}>
        <Canvas
          camera={{ position: [0, 0, 4], fov: 50 }}
          style={{ display: "block", width: "100%", height: "100%", background: "#e5e7eb" }}
          onCreated={({ gl }) => gl.setClearColor(0xe5e7eb, 1)}
        >
          <ambientLight intensity={1} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <Environment preset="studio" />
          {/* Floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
            <planeGeometry args={[10, 10]} />
            <meshStandardMaterial color="#d1d5db" />
          </mesh>
          <Suspense fallback={null}>
            <Model3D path={modelPath} onInspect={handleInspect} />
          </Suspense>
          <OrbitControls />
        </Canvas>
      </div>
    </div>
  );
}
