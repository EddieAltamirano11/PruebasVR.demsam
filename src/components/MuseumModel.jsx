import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

export function MuseumModel() {
  const group = useRef();
  const { gl } = useThree();
  // Carga del modelo 3D oficial v14 con paredes elevadas, letreros monumentales y deidades centradas
  const { scene } = useGLTF('./museo_wixarika_v14.glb');

  useEffect(() => {
    if (!scene) return;
    const maxAnisotropy = gl?.capabilities?.getMaxAnisotropy?.() || 8;

    // Recorrer todas las mallas para habilitar filtrado anisótropo máximo en texturas (elimina borrosidad en ángulos VR)
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((mat) => {
          ['map', 'emissiveMap', 'normalMap', 'roughnessMap', 'metalnessMap'].forEach((key) => {
            if (mat[key] && mat[key].isTexture) {
              mat[key].anisotropy = maxAnisotropy;
              mat[key].minFilter = THREE.LinearMipmapLinearFilter;
              mat[key].magFilter = THREE.LinearFilter;
              mat[key].generateMipmaps = true;
              mat[key].needsUpdate = true;
            }
          });
        });
      }
    });
  }, [scene, gl]);

  return (
    <primitive
      ref={group}
      object={scene}
      position={[0, 0, 0]}
      dispose={null}
    />
  );
}

useGLTF.preload('./museo_wixarika_v14.glb');
