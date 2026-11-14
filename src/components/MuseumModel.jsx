import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SoundFX } from '../services/audioService.js';
import { findArtworkByNodeName } from './wixarika/wixarikaArtworksData.js';

export function MuseumModel({ onSelectArtwork, registerMesh, unregisterMesh }) {
  const group = useRef();
  const { gl } = useThree();
  // Carga del modelo 3D oficial v14 con paredes elevadas, letreros monumentales y deidades centradas
  const { scene } = useGLTF('./museo_wixarika_v14.glb');

  useEffect(() => {
    if (!scene) return;
    const maxAnisotropy = gl?.capabilities?.getMaxAnisotropy?.() || 8;
    const registered = [];

    // Recorrer todas las mallas para habilitar filtrado anisótropo e interactividad en los 9 cuadros
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

        // Identificar si la malla corresponde a alguno de los 9 cuadros (6 deidades o 3 fiestas)
        if (child.name) {
          const artwork = findArtworkByNodeName(child.name);
          if (artwork) {
            const isTargetMesh =
              child.name.includes('lienzo') ||
              child.name.includes('cuadro') ||
              child.name.includes('relieve') ||
              child.name.includes('placa') ||
              child.name.includes('marco');

            if (isTargetMesh) {
              const handleSelect = () => {
                SoundFX.playClick();
                onSelectArtwork?.(artwork);
              };

              child.userData = {
                id: `artwork-${artwork.id}-${child.name}`,
                artworkId: artwork.id,
                artwork,
                onClick: handleSelect,
                onSelect: handleSelect
              };

              if (registerMesh) {
                registerMesh(child);
                registered.push(child);
              }
            }
          }
        }
      }
    });

    return () => {
      if (unregisterMesh) {
        registered.forEach((mesh) => unregisterMesh(mesh));
      }
    };
  }, [scene, gl, onSelectArtwork, registerMesh, unregisterMesh]);

  // Manejador de clics con puntero/ratón en modo computadora
  const handlePointerDown = (e) => {
    e.stopPropagation?.();
    let curr = e.object;
    while (curr && curr !== scene) {
      if (curr.userData?.artwork && curr.userData?.onClick) {
        curr.userData.onClick();
        return;
      }
      curr = curr.parent;
    }
  };

  return (
    <primitive
      ref={group}
      object={scene}
      position={[0, 0, 0]}
      dispose={null}
      onPointerDown={handlePointerDown}
    />
  );
}

useGLTF.preload('./museo_wixarika_v14.glb');
