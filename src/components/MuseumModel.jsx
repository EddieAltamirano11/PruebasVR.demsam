import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SoundFX } from '../services/audioService.js';
import { WIXARIKA_ARTWORKS } from './wixarika/wixarikaArtworksData.js';

export function MuseumModel({ onSelectArtwork, registerMesh, unregisterMesh }) {
  const group = useRef();
  const { gl } = useThree();
  // Carga del modelo 3D oficial v14 del Museo Wixarika
  const { scene } = useGLTF('./museo_wixarika_v14.glb');

  useEffect(() => {
    if (!scene) return;
    const maxAnisotropy = gl?.capabilities?.getMaxAnisotropy?.() || 8;
    const registered = [];

    // 1. Configurar filtrado anisotrópico en todas las texturas de la escena
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

    // 2. Mapeo exacto 1 a 1 de los 9 cuadros sagrados (6 Deidades y 3 Fiestas)
    WIXARIKA_ARTWORKS.forEach((art) => {
      const stationObj = scene.getObjectByName(art.stationName);
      const canvasObj = scene.getObjectByName(art.canvasNodeName);

      // Extraer textura original del lienzo cargado en el GLB
      let originalTexture = null;
      if (canvasObj?.material) {
        const mat = Array.isArray(canvasObj.material) ? canvasObj.material[0] : canvasObj.material;
        if (mat?.map) {
          originalTexture = mat.map;
        }
      }

      // Obtener posición en el espacio del mundo 3D del lienzo o estación
      const worldPos = new THREE.Vector3();
      if (canvasObj) {
        canvasObj.getWorldPosition(worldPos);
      } else if (stationObj) {
        stationObj.getWorldPosition(worldPos);
      } else {
        worldPos.set(...art.stationPosition);
      }

      const artworkData = {
        ...art,
        texture: originalTexture,
        worldPosition: worldPos
      };

      const handleSelect = () => {
        SoundFX.playClick();
        onSelectArtwork?.(artworkData);
      };

      // Si existe el objeto estación, vincular todos sus hijos para que cualquier clic en el cuadro sea interactivo
      if (stationObj) {
        stationObj.userData = {
          id: `station-${art.id}`,
          artworkId: art.id,
          artwork: artworkData,
          onClick: handleSelect,
          onSelect: handleSelect
        };

        stationObj.traverse((child) => {
          if (child.isMesh) {
            child.userData = {
              id: `artwork-${art.id}-${child.name}`,
              artworkId: art.id,
              artwork: artworkData,
              onClick: handleSelect,
              onSelect: handleSelect
            };

            // Registrar para interacción con Gaze Fuse (3.0s) en modo VR
            const isTargetForReticle =
              child.name === art.canvasNodeName ||
              child.name.includes('lienzo') ||
              child.name.includes('cuadro') ||
              child.name.includes('placa') ||
              child.name.includes('marco');

            if (isTargetForReticle) {
              registerMesh?.(child);
              registered.push(child);
            }
          }
        });
      } else if (canvasObj) {
        // En caso de que solo se encuentre el lienzo directamente
        canvasObj.userData = {
          id: `canvas-${art.id}`,
          artworkId: art.id,
          artwork: artworkData,
          onClick: handleSelect,
          onSelect: handleSelect
        };
        registerMesh?.(canvasObj);
        registered.push(canvasObj);
      }
    });

    return () => {
      if (unregisterMesh) {
        registered.forEach((mesh) => unregisterMesh(mesh));
      }
    };
  }, [scene, gl, onSelectArtwork, registerMesh, unregisterMesh]);

  // Manejador de clics directos del puntero/ratón en modo computadora
  const handlePointerDown = (e) => {
    e.stopPropagation?.();
    let curr = e.object;
    while (curr && curr !== scene) {
      if (curr.userData?.onClick) {
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
export default MuseumModel;
