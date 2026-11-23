import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SoundFX } from '../services/audioService.js';
import { WIXARIKA_ARTWORKS, WIXARIKA_GASTRONOMY_DISHES } from './wixarika/wixarikaArtworksData.js';

export function MuseumModel({ onSelectArtwork, registerMesh, unregisterMesh }) {
  const group = useRef();
  const { gl } = useThree();
  // Carga del modelo 3D oficial v15 del Museo Wixarika (Paredes a 5.4m y Techo a 7.0m)
  const { scene } = useGLTF('./museo_wixarika_v15.glb?v=15.2');

  useEffect(() => {
    if (!scene) return;
    const maxAnisotropy = gl?.capabilities?.getMaxAnisotropy?.() || 8;
    const registered = [];

    // 1. Configurar filtrado anisotrópico y visibilidad de comidas
    scene.traverse((child) => {
      // Asegurar que el letrero superior monumental original del modelo 3D ("el que ya estaba") esté siempre visible
      if (child.name.includes('letrero_seccion') || child.name.includes('emblema_gastronomia')) {
        child.visible = true;
      }

      // Ocultar únicamente las comidas de las mesas que no fueron enviadas (caldo de toro, perruri, elotes)
      const isUnsentFood =
        child.name.includes('caldo') ||
        child.name.includes('perruri') ||
        child.name.includes('elote');

      if (isUnsentFood) {
        child.visible = false;
        return;
      }

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
        // Obtener posición en el espacio mundial en el momento exacto del clic (considera la rotación dinámica del quiosco)
        const currentWorldPos = new THREE.Vector3();
        if (canvasObj) {
          canvasObj.getWorldPosition(currentWorldPos);
        } else if (stationObj) {
          stationObj.getWorldPosition(currentWorldPos);
        } else {
          currentWorldPos.set(...art.stationPosition);
        }
        onSelectArtwork?.({
          ...artworkData,
          worldPosition: currentWorldPos
        });
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

    // 3. Cargar texturas de los 4 platillos tradicionales en los platos de exhibición y hacerlos interactivos
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous');

    WIXARIKA_GASTRONOMY_DISHES.forEach((dish) => {
      const stationObj = scene.getObjectByName(dish.stationName);
      const canvasObj = scene.getObjectByName(dish.canvasNodeName);

      // Cargar textura auténtica proporcionada por el usuario
      if (dish.image) {
        textureLoader.load(
          dish.image,
          (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.anisotropy = maxAnisotropy;
            tex.minFilter = THREE.LinearMipmapLinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.generateMipmaps = true;
            tex.needsUpdate = true;

            if (canvasObj?.material) {
              const mat = Array.isArray(canvasObj.material) ? canvasObj.material[0] : canvasObj.material;
              mat.map = tex;
              mat.needsUpdate = true;
            }
          },
          undefined,
          (err) => console.warn(`[MuseumModel] Error cargando textura de platillo ${dish.image}:`, err)
        );
      }

      // Posición en mundo
      const worldPos = new THREE.Vector3();
      if (canvasObj) {
        canvasObj.getWorldPosition(worldPos);
      } else if (stationObj) {
        stationObj.getWorldPosition(worldPos);
      } else {
        worldPos.set(...dish.stationPosition);
      }

      const dishArtworkData = {
        ...dish,
        worldPosition: worldPos
      };

      const handleSelectDish = () => {
        SoundFX.playClick();
        const currentWorldPos = new THREE.Vector3();
        if (canvasObj) {
          canvasObj.getWorldPosition(currentWorldPos);
        } else if (stationObj) {
          stationObj.getWorldPosition(currentWorldPos);
        } else {
          currentWorldPos.set(...dish.stationPosition);
        }
        onSelectArtwork?.({
          ...dishArtworkData,
          worldPosition: currentWorldPos
        });
      };

      if (stationObj) {
        stationObj.userData = {
          id: `station-${dish.id}`,
          artworkId: dish.id,
          artwork: dishArtworkData,
          onClick: handleSelectDish,
          onSelect: handleSelectDish
        };
        stationObj.traverse((child) => {
          if (child.isMesh) {
            child.userData = {
              id: `gastro-${dish.id}-${child.name}`,
              artworkId: dish.id,
              artwork: dishArtworkData,
              onClick: handleSelectDish,
              onSelect: handleSelectDish
            };
            registerMesh?.(child);
            registered.push(child);
          }
        });
      } else if (canvasObj) {
        canvasObj.userData = {
          id: `canvas-${dish.id}`,
          artworkId: dish.id,
          artwork: dishArtworkData,
          onClick: handleSelectDish,
          onSelect: handleSelectDish
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

useGLTF.preload('./museo_wixarika_v15.glb?v=15.2');
export default MuseumModel;
