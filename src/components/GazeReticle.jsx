import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useFrame, useThree, createPortal } from '@react-three/fiber';
import * as THREE from 'three';
import { SoundFX } from '../services/audioService.js';
import { GazeFuseController, GAZE_FUSE_DEFAULT_DURATION } from '../services/gazeFuseService.js';

/**
 * GazeReticle - Reticula Central con Gaze Fuse Interactivo a 1.2 segundos
 * Cumple con norma ISO 9241-210 y criterios WCAG 2.1 (HU-06).
 *
 * Caracteristicas:
 * - Mira fija en el centro del eje visual de la camara (z = -1.2m).
 * - Anillo de contraste exterior (WCAG AAA) para legibilidad en cielos o salas iluminadas.
 * - Temporizador circular de mirada (Gaze Fuse) calibrado a 1.2 segundos exactos.
 * - Soporte de gatillo dual: toque capacitivo / boton superior Homido Grab para accion inmediata.
 * - Retroalimentacion auditiva sintetica integrada (SoundFX).
 */
export function GazeReticle({
  interactiveObjects = [],
  onTrigger,
  onHoverChange,
  fuseDuration = GAZE_FUSE_DEFAULT_DURATION,
  distance = 1.2,
  enabled = true
}) {
  const { camera, gl } = useThree();
  const [hoveredId, setHoveredId] = useState(null);
  const [fuseProgress, setFuseProgress] = useState(0);

  const progressMeshRef = useRef();
  const ringMeshRef = useRef();
  const raycaster = useRef(new THREE.Raycaster());
  const centerCoord = useMemo(() => new THREE.Vector2(0, 0), []);

  // Control de estado y logica del temporizador Gaze Fuse
  const controller = useMemo(() => {
    return new GazeFuseController({
      fuseDuration,
      onHoverStart: (target) => {
        SoundFX.playHover();
        const id = target?.uuid || target?.name || 'interactive_target';
        setHoveredId(id);
        onHoverChange?.(target, true);
      },
      onHoverEnd: (target) => {
        setHoveredId(null);
        setFuseProgress(0);
        if (progressMeshRef.current) {
          progressMeshRef.current.scale.set(0, 0, 1);
        }
        onHoverChange?.(target, false);
      },
      onTrigger: (target) => {
        SoundFX.playClick();
        if (target?.userData?.onSelect) {
          try {
            target.userData.onSelect(target);
          } catch (err) {
            console.warn('GazeReticle onSelect error:', err);
          }
        }
        onTrigger?.(target);
        // Pulso visual al completar
        if (ringMeshRef.current) {
          ringMeshRef.current.scale.set(1.25, 1.25, 1);
          setTimeout(() => {
            if (ringMeshRef.current) {
              ringMeshRef.current.scale.set(1, 1, 1);
            }
          }, 180);
        }
      },
      onProgress: (p) => {
        setFuseProgress(p);
        if (progressMeshRef.current) {
          progressMeshRef.current.scale.set(p, p, 1);
        }
      }
    });
  }, [fuseDuration, onTrigger, onHoverChange]);

  // Soporte de Gatillo Dual (Boton fisico Homido Grab / toque de pantalla en visor)
  const handlePhysicalTrigger = useCallback(() => {
    if (!enabled) return;
    controller.triggerImmediate();
  }, [controller, enabled]);

  useEffect(() => {
    const domEl = gl?.domElement || window;
    domEl.addEventListener('pointerdown', handlePhysicalTrigger);
    domEl.addEventListener('click', handlePhysicalTrigger);
    domEl.addEventListener('touchstart', handlePhysicalTrigger, { passive: true });

    return () => {
      domEl.removeEventListener('pointerdown', handlePhysicalTrigger);
      domEl.removeEventListener('click', handlePhysicalTrigger);
      domEl.removeEventListener('touchstart', handlePhysicalTrigger);
    };
  }, [gl, handlePhysicalTrigger]);

  // Bucle por cuadro: raycast central + actualizacion de tiempo de mirada
  useFrame((_, delta) => {
    if (!enabled || !camera) return;

    // Lanzar rayo desde el centro exacto de la vista del usuario
    raycaster.current.setFromCamera(centerCoord, camera);

    // Obtener lista plana de objetos interactivos a evaluar
    const objectsToTest = Array.isArray(interactiveObjects)
      ? interactiveObjects
      : typeof interactiveObjects === 'function'
      ? interactiveObjects()
      : [];

    let hitTarget = null;
    if (objectsToTest.length > 0) {
      const intersects = raycaster.current.intersectObjects(objectsToTest, true);
      if (intersects.length > 0) {
        // Encontrar el objeto interactivo mas cercano
        hitTarget = intersects[0].object;
      }
    }

    controller.update(hitTarget, delta);
  });

  const isHovered = hoveredId !== null;

  return (
    <>
      {camera &&
        createPortal(
          <group position={[0, 0, -distance]} renderOrder={9999}>
            {/* 1. Punto central solido para maxima precision de punteria */}
            <mesh renderOrder={9999}>
              <circleGeometry args={[0.006, 24]} />
              <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={0.95}
                depthTest={false}
                depthWrite={false}
                side={THREE.DoubleSide}
                toneMapped={false}
              />
            </mesh>

            {/* 2. Anillo de contraste exterior oscuro (WCAG 2.1 - ratio > 7:1 en fondos claros) */}
            <mesh position={[0, 0, -0.001]} renderOrder={9998}>
              <ringGeometry args={[0.014, 0.024, 32]} />
              <meshBasicMaterial
                color="#000000"
                transparent
                opacity={0.55}
                depthTest={false}
                depthWrite={false}
                side={THREE.DoubleSide}
                toneMapped={false}
              />
            </mesh>

            {/* 3. Anillo interactivo brillante (cambia a cian #38bdf8 al enfocar elemento) */}
            <mesh ref={ringMeshRef} renderOrder={9999}>
              <ringGeometry args={[0.015, 0.022, 32]} />
              <meshBasicMaterial
                color={isHovered ? '#38bdf8' : '#ffffff'}
                transparent
                opacity={isHovered ? 1.0 : 0.75}
                depthTest={false}
                depthWrite={false}
                side={THREE.DoubleSide}
                toneMapped={false}
              />
            </mesh>

            {/* 4. Disco interior de progreso Gaze Fuse (se expande circularmente de 0 a 1.2s) */}
            <mesh ref={progressMeshRef} scale={[0, 0, 1]} renderOrder={9999}>
              <circleGeometry args={[0.0145, 32]} />
              <meshBasicMaterial
                color={fuseProgress >= 1.0 ? '#22c55e' : '#38bdf8'}
                transparent
                opacity={0.88}
                depthTest={false}
                depthWrite={false}
                side={THREE.DoubleSide}
                toneMapped={false}
              />
            </mesh>
          </group>,
          camera
        )}
    </>
  );
}

export default GazeReticle;
