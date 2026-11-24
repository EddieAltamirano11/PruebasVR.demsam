import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SoundFX } from '../services/audioService.js';
import { WIXARIKA_ARTWORKS, WIXARIKA_GASTRONOMY_DISHES } from './wixarika/wixarikaArtworksData.js';
import { setOutlineRoot } from './HoverOutline.jsx';

export function MuseumModel({
  onSelectArtwork,
  onOpenAbout,
  onOpenMenu,
  registerMesh,
  unregisterMesh
}) {
  const group = useRef();
  const { gl } = useThree();
  // Carga del modelo 3D oficial v16 del Museo Wixarika (Bienvenida: Portal + Logos ITT/CECAN/Solón + Botones 3D Acerca de/Menú estilo Deidad ampliado)
  const { scene } = useGLTF('./museo_wixarika_v16.glb?v=16.7');

  useEffect(() => {
    if (!scene) return;
    const maxAnisotropy = gl?.capabilities?.getMaxAnisotropy?.() || 8;
    const registered = [];

    // 1. Configurar filtrado anisotrópico y visibilidad de comidas en la escena
    scene.traverse((child) => {
      // Asegurar visibilidad del letrero superior y emblema de gastronomía
      if (child.name.includes('letrero_seccion') || child.name.includes('emblema_gastronomia')) {
        child.visible = true;
      }

      // Ocultar comidas y recuadros no enviados (caldo de toro, perruri, elotes)
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
            setOutlineRoot(child, stationObj);

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
        setOutlineRoot(canvasObj, canvasObj);
        registerMesh?.(canvasObj);
        registered.push(canvasObj);
      }
    });

    // 3. Mapeo interactivo de los botones GLB de Bienvenida ("ACERCA DE" y "MENÚ")
    // Construidos directamente en el GLB con marco de madera, bisel de oro, fondo de cantera y texto 3D oro idéntico a las deidades
    const btnAcercaObj = scene.getObjectByName('boton_bienvenida_acerca_de');
    if (btnAcercaObj) {
      const handleAcercaClick = () => {
        SoundFX.playClick();
        onOpenAbout?.();
      };
      btnAcercaObj.userData = {
        id: 'btn-glb-wall-about',
        onClick: handleAcercaClick,
        onSelect: handleAcercaClick
      };
      btnAcercaObj.traverse((child) => {
        if (child.isMesh) {
          child.userData = {
            id: `btn-glb-wall-about-${child.name}`,
            onClick: handleAcercaClick,
            onSelect: handleAcercaClick
          };
          setOutlineRoot(child, btnAcercaObj);
          registerMesh?.(child);
          registered.push(child);
        }
      });
    }

    const btnMenuObj = scene.getObjectByName('boton_bienvenida_menu');
    if (btnMenuObj) {
      const handleMenuClick = () => {
        SoundFX.playClick();
        onOpenMenu?.();
      };
      btnMenuObj.userData = {
        id: 'btn-glb-wall-menu',
        onClick: handleMenuClick,
        onSelect: handleMenuClick
      };
      btnMenuObj.traverse((child) => {
        if (child.isMesh) {
          child.userData = {
            id: `btn-glb-wall-menu-${child.name}`,
            onClick: handleMenuClick,
            onSelect: handleMenuClick
          };
          setOutlineRoot(child, btnMenuObj);
          registerMesh?.(child);
          registered.push(child);
        }
      });
    }

    // 4. Mapeo de los 4 recuadros en muro y platillos sobre mesas para Gastronomía Tradicional
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous');

    WIXARIKA_GASTRONOMY_DISHES.forEach((dish) => {
      const recuadroObj = scene.getObjectByName(dish.recuadroNodeName);
      const canvasObj = scene.getObjectByName(dish.canvasNodeName);
      const tableStationObj = scene.getObjectByName(dish.tableStationName);
      const tableDishObj = scene.getObjectByName(dish.tableDishNodeName);

      // Cargar la textura auténtica provista por el usuario
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

            // Texturizar el cuadro en el muro
            if (canvasObj?.material) {
              const baseMat = Array.isArray(canvasObj.material) ? canvasObj.material[0] : canvasObj.material;
              const mat = baseMat.clone();
              mat.map = tex;
              mat.needsUpdate = true;
              canvasObj.material = mat;
            }

            // Texturizar el plato sobre la mesa
            if (tableDishObj?.material) {
              const baseMat = Array.isArray(tableDishObj.material) ? tableDishObj.material[0] : tableDishObj.material;
              const mat = baseMat.clone();
              mat.map = tex;
              mat.needsUpdate = true;
              tableDishObj.material = mat;
            }
          },
          undefined,
          (err) => console.warn(`[MuseumModel] Error cargando textura para ${dish.title}:`, err)
        );
      }

      // Obtener posición del mundo
      const worldPos = new THREE.Vector3();
      if (canvasObj) {
        canvasObj.getWorldPosition(worldPos);
      } else if (recuadroObj) {
        recuadroObj.getWorldPosition(worldPos);
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
        } else if (recuadroObj) {
          recuadroObj.getWorldPosition(currentWorldPos);
        } else {
          currentWorldPos.set(...dish.stationPosition);
        }
        onSelectArtwork?.({
          ...dishArtworkData,
          worldPosition: currentWorldPos
        });
      };

      // Interactividad en el recuadro en muro
      if (recuadroObj) {
        recuadroObj.userData = {
          id: `recuadro-${dish.id}`,
          artworkId: dish.id,
          artwork: dishArtworkData,
          onClick: handleSelectDish,
          onSelect: handleSelectDish
        };
        recuadroObj.traverse((child) => {
          if (child.isMesh) {
            child.userData = {
              id: `recuadro-${dish.id}-${child.name}`,
              artworkId: dish.id,
              artwork: dishArtworkData,
              onClick: handleSelectDish,
              onSelect: handleSelectDish
            };
            setOutlineRoot(child, recuadroObj);
            registerMesh?.(child);
            registered.push(child);
          }
        });
      }

      // Interactividad en el platillo de mesa
      if (tableStationObj) {
        tableStationObj.userData = {
          id: `table-dish-${dish.id}`,
          artworkId: dish.id,
          artwork: dishArtworkData,
          onClick: handleSelectDish,
          onSelect: handleSelectDish
        };
        tableStationObj.traverse((child) => {
          if (child.isMesh) {
            child.userData = {
              id: `table-dish-${dish.id}-${child.name}`,
              artworkId: dish.id,
              artwork: dishArtworkData,
              onClick: handleSelectDish,
              onSelect: handleSelectDish
            };
            setOutlineRoot(child, tableStationObj);
            registerMesh?.(child);
            registered.push(child);
          }
        });
      }
    });

    return () => {
      if (unregisterMesh) {
        registered.forEach((mesh) => unregisterMesh(mesh));
      }
    };
  }, [scene, gl, onSelectArtwork, onOpenAbout, onOpenMenu, registerMesh, unregisterMesh]);

  // Manejador de clics directos del puntero/ratón en modo computadora
  // Usa onClick (en lugar de onPointerDown) y filtra arrastres de OrbitControls para
  // no interceptar nunca clics sobre botones de menús flotantes situados al frente.
  const handleArtworkClick = (e) => {
    if (e.delta > 8) return;
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
      onClick={handleArtworkClick}
    />
  );
}

useGLTF.preload('./museo_wixarika_v16.glb?v=16.7');
export default MuseumModel;
