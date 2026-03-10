"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useConfigurator } from "../ConfiguratorContext";

/* ======================================================
   TRACKSUIT MODEL COMPONENT
   
   Placeholder 3D model using basic geometries.
   Colors driven by configurator (front, back, sleeves, collar, waistband, legs, element1).
====================================================== */

interface TracksuitModelProps {
  rotation?: number;
}

export default function TracksuitModel({ rotation = 0 }: TracksuitModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { colors, fillTypes } = useConfigurator();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  const jacketMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#1e3a8a",
      roughness: 0.6,
      metalness: 0.1,
    });
  }, []);

  const pantsMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#172554",
      roughness: 0.6,
      metalness: 0.1,
    });
  }, []);

  const stripeMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#ffffff",
      roughness: 0.6,
      metalness: 0.1,
    });
  }, []);

  const zipperMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#94a3b8",
      roughness: 0.3,
      metalness: 0.8,
    });
  }, []);

  // Apply configurator colors
  useEffect(() => {
    const c = colors;
    if (fillTypes.front === "color" && c.front) jacketMaterial.color.set(c.front);
    if (fillTypes.back === "color" && c.back) jacketMaterial.color.set(c.back);
    if (fillTypes.leftSleeve === "color" && c.leftSleeve) jacketMaterial.color.set(c.leftSleeve);
    if (fillTypes.rightSleeve === "color" && c.rightSleeve) jacketMaterial.color.set(c.rightSleeve);
    if (fillTypes.collar === "color" && c.collar) jacketMaterial.color.set(c.collar);
    if (fillTypes.waistband === "color" && c.waistband) pantsMaterial.color.set(c.waistband);
    if (fillTypes.legs === "color" && c.legs) pantsMaterial.color.set(c.legs);
    if (fillTypes.element1 === "color" && c.element1) stripeMaterial.color.set(c.element1);
  }, [colors, fillTypes, jacketMaterial, pantsMaterial, stripeMaterial]);

  return (
    <group ref={groupRef} position={[0, -0.3, 0]} scale={1.1} rotation={[0, rotation, 0]}>
      {/* === JACKET TOP === */}
      
      {/* Main Body - Front */}
      <mesh position={[0, 0.8, 0.15]} castShadow receiveShadow material={jacketMaterial}>
        <boxGeometry args={[1.4, 1.4, 0.1]} />
      </mesh>

      {/* Main Body - Back */}
      <mesh position={[0, 0.8, -0.15]} castShadow receiveShadow material={jacketMaterial}>
        <boxGeometry args={[1.4, 1.4, 0.1]} />
      </mesh>

      {/* Left Sleeve */}
      <mesh
        position={[-0.9, 1.2, 0]}
        rotation={[0, 0, -0.3]}
        castShadow
        receiveShadow
        material={jacketMaterial}
      >
        <boxGeometry args={[0.55, 0.9, 0.22]} />
      </mesh>

      {/* Right Sleeve */}
      <mesh
        position={[0.9, 1.2, 0]}
        rotation={[0, 0, 0.3]}
        castShadow
        receiveShadow
        material={jacketMaterial}
      >
        <boxGeometry args={[0.55, 0.9, 0.22]} />
      </mesh>

      {/* Collar */}
      <mesh
        position={[0, 1.55, 0]}
        castShadow
        receiveShadow
        material={jacketMaterial}
      >
        <cylinderGeometry args={[0.25, 0.3, 0.15, 32]} />
      </mesh>

      {/* Zipper */}
      <mesh
        position={[0, 0.8, 0.21]}
        castShadow
        receiveShadow
        material={zipperMaterial}
      >
        <boxGeometry args={[0.06, 1.2, 0.02]} />
      </mesh>

      {/* === PANTS BOTTOM === */}
      
      {/* Waistband */}
      <mesh
        position={[0, 0, 0]}
        castShadow
        receiveShadow
        material={pantsMaterial}
      >
        <cylinderGeometry args={[0.68, 0.68, 0.18, 32]} />
      </mesh>

      {/* Left Leg */}
      <mesh
        position={[-0.32, -0.8, 0]}
        castShadow
        receiveShadow
        material={pantsMaterial}
      >
        <cylinderGeometry args={[0.3, 0.25, 1.4, 32]} />
      </mesh>

      {/* Right Leg */}
      <mesh
        position={[0.32, -0.8, 0]}
        castShadow
        receiveShadow
        material={pantsMaterial}
      >
        <cylinderGeometry args={[0.3, 0.25, 1.4, 32]} />
      </mesh>

      {/* Left Leg Stripe */}
      <mesh
        position={[-0.6, -0.8, 0]}
        castShadow
        receiveShadow
        material={stripeMaterial}
      >
        <boxGeometry args={[0.04, 1.3, 0.3]} />
      </mesh>

      {/* Right Leg Stripe */}
      <mesh
        position={[0.6, -0.8, 0]}
        castShadow
        receiveShadow
        material={stripeMaterial}
      >
        <boxGeometry args={[0.04, 1.3, 0.3]} />
      </mesh>

      {/* Sleeve Stripes */}
      <mesh
        position={[-1.15, 1.2, 0]}
        rotation={[0, 0, -0.3]}
        castShadow
        receiveShadow
        material={stripeMaterial}
      >
        <boxGeometry args={[0.04, 0.5, 0.15]} />
      </mesh>
      <mesh
        position={[1.15, 1.2, 0]}
        rotation={[0, 0, 0.3]}
        castShadow
        receiveShadow
        material={stripeMaterial}
      >
        <boxGeometry args={[0.04, 0.5, 0.15]} />
      </mesh>
    </group>
  );
}
