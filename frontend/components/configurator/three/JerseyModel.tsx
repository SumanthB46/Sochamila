"use client";

import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useConfigurator } from "../ConfiguratorContext";

/* ======================================================
   JERSEY MODEL – same approach as /test-model (clone, center,
   solid color) so the jersey displays in the configurator too.
====================================================== */

const MODEL_URL = "/models/jersey.glb";

useGLTF.setDecoderPath?.("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");

function centerAndScaleScene(scene: THREE.Group, size = 2.2) {
  const box = new THREE.Box3().setFromObject(scene);
  const center = box.getCenter(new THREE.Vector3());
  const extent = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(extent.x, extent.y, extent.z, 0.001);
  const scale = Math.min(Math.max(size / maxDim, 0.1), 100);
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
  scene.updateMatrixWorld(true);
}

function countMeshes(group: THREE.Group): number {
  let n = 0;
  group.traverse((child: any) => {
    if (child.isMesh) n++;
  });
  return n;
}

const MATERIAL_ZONES: Record<string, { materials: string[]; meshNames?: string[] }> = {
  front: { materials: ["material206960"], meshNames: ["front", "body_front", "torso_front"] },
  back: { materials: ["material206960"], meshNames: ["back", "body_back", "torso_back"] },
  leftSleeve: { materials: ["material206971"], meshNames: ["left_sleeve", "sleeve_l", "leftsleeve"] },
  rightSleeve: { materials: ["material206971"], meshNames: ["right_sleeve", "sleeve_r", "rightsleeve"] },
  collar: { materials: ["material206971"], meshNames: ["collar", "neck"] },
  element1: { materials: ["material206960", "material206971"], meshNames: ["element", "stripe", "trim"] },
};

interface JerseyModelProps {
  rotation?: number;
}

export default function JerseyModel({ rotation = 0 }: JerseyModelProps) {
  const { scene } = useGLTF(MODEL_URL);
  const { colors, patterns, gradients, fillTypes } = useConfigurator();

  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    centerAndScaleScene(clone, 2.2);
    makeVisible(clone, 0x2563eb);
    return clone;
  }, [scene]);

  useEffect(() => {
    if (!clonedScene) return;
    const defaultColor = colors.front || "#2563eb";
    clonedScene.traverse((child: any) => {
      if (!child.isMesh || !child.material || !child.material.color) return;
      const materialName = (child.material?.name || "").toLowerCase();
      const meshName = (child.name || "").toLowerCase();
      let zone: string | null = null;
      for (const [zoneKey, config] of Object.entries(MATERIAL_ZONES)) {
        if (config.meshNames?.some((n) => meshName.includes(n.toLowerCase()))) {
          zone = zoneKey;
          break;
        }
      }
      if (!zone) {
        for (const [zoneKey, config] of Object.entries(MATERIAL_ZONES)) {
          if (config.materials.some((n) => materialName.includes(n.toLowerCase()))) {
            zone = zoneKey;
            break;
          }
        }
      }
      if (!zone) zone = "front";
      const fillType = fillTypes[zone as keyof typeof fillTypes] || "color";
      const target = child.material;
      if (fillType === "color" && colors[zone as keyof typeof colors]) {
        target.color.set(colors[zone as keyof typeof colors]);
      } else if (fillType === "gradient" && gradients[zone as keyof typeof gradients]?.enabled) {
        target.color.set(gradients[zone as keyof typeof gradients]?.startColor || "#2563eb");
      } else if (fillType === "pattern" && patterns[zone as keyof typeof patterns]) {
        target.color.set(patterns[zone as keyof typeof patterns]?.color || "#ffffff");
      } else {
        target.color.set(defaultColor);
      }
    });
  }, [clonedScene, colors, patterns, gradients, fillTypes]);

  const hasMeshes = countMeshes(clonedScene) > 0;
  if (!hasMeshes) {
    return (
      <group position={[0, 0.5, 0]} rotation={[0, rotation, 0]}>
        <mesh>
          <boxGeometry args={[2, 2, 2]} />
          <meshBasicMaterial color="#2563eb" />
        </mesh>
      </group>
    );
  }

  return (
    <group position={[0, 0.5, 0]} rotation={[0, rotation, 0]}>
      <primitive object={clonedScene} />
    </group>
  );
}

useGLTF.preload(MODEL_URL);
