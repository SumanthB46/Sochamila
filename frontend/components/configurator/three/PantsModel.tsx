"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useConfigurator } from "../ConfiguratorContext";

/* ======================================================
   PANTS MODEL COMPONENT
   
   Placeholder 3D model using basic geometries.
   Colors are driven by configurator state (legs, waistband, element1).
====================================================== */

interface PantsModelProps {
  rotation?: number;
}

export default function PantsModel({ rotation = 0 }: PantsModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { colors, fillTypes } = useConfigurator();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  const mainMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#1e3a8a",
      roughness: 0.6,
      metalness: 0.1,
    });
  }, []);

  const waistbandMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#172554",
      roughness: 0.7,
      metalness: 0.05,
    });
  }, []);

  const stripeMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#ffffff",
      roughness: 0.6,
      metalness: 0.1,
    });
  }, []);

  // Apply configurator colors to placeholder materials
  useEffect(() => {
    const c = colors;
    if (fillTypes.legs === "color" && c.legs) mainMaterial.color.set(c.legs);
    if (fillTypes.front === "color" && c.front) mainMaterial.color.set(c.front);
    if (fillTypes.back === "color" && c.back) mainMaterial.color.set(c.back);
    if (fillTypes.waistband === "color" && c.waistband) waistbandMaterial.color.set(c.waistband);
    if (fillTypes.element1 === "color" && c.element1) stripeMaterial.color.set(c.element1);
  }, [colors, fillTypes, mainMaterial, waistbandMaterial, stripeMaterial]);

  return (
    <group ref={groupRef} position={[0, -0.5, 0]} scale={1.2} rotation={[0, rotation, 0]}>
      {/* Waistband */}
      <mesh
        position={[0, 1.5, 0]}
        castShadow
        receiveShadow
        material={waistbandMaterial}
      >
        <cylinderGeometry args={[0.7, 0.7, 0.2, 32]} />
      </mesh>

      {/* Left Leg - Upper */}
      <mesh
        position={[-0.35, 0.8, 0]}
        castShadow
        receiveShadow
        material={mainMaterial}
      >
        <cylinderGeometry args={[0.32, 0.3, 1, 32]} />
      </mesh>

      {/* Left Leg - Lower */}
      <mesh
        position={[-0.35, -0.3, 0]}
        castShadow
        receiveShadow
        material={mainMaterial}
      >
        <cylinderGeometry args={[0.3, 0.25, 1.2, 32]} />
      </mesh>

      {/* Right Leg - Upper */}
      <mesh
        position={[0.35, 0.8, 0]}
        castShadow
        receiveShadow
        material={mainMaterial}
      >
        <cylinderGeometry args={[0.32, 0.3, 1, 32]} />
      </mesh>

      {/* Right Leg - Lower */}
      <mesh
        position={[0.35, -0.3, 0]}
        castShadow
        receiveShadow
        material={mainMaterial}
      >
        <cylinderGeometry args={[0.3, 0.25, 1.2, 32]} />
      </mesh>

      {/* Left Leg Stripe */}
      <mesh
        position={[-0.65, 0.3, 0]}
        castShadow
        receiveShadow
        material={stripeMaterial}
      >
        <boxGeometry args={[0.04, 2.2, 0.35]} />
      </mesh>

      {/* Right Leg Stripe */}
      <mesh
        position={[0.65, 0.3, 0]}
        castShadow
        receiveShadow
        material={stripeMaterial}
      >
        <boxGeometry args={[0.04, 2.2, 0.35]} />
      </mesh>
    </group>
  );
}
