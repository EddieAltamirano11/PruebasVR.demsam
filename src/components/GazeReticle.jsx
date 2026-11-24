import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useFrame, useThree, createPortal } from '@react-three/fiber';
import * as THREE from 'three';
import { SoundFX } from '../services/audioService.js';
import { GazeFuseController, GAZE_FUSE_DEFAULT_DURATION } from '../services/gazeFuseService.js';
import { isPointerLockedTo } from './PointerLockLook.jsx';

const PHYSICAL_TRIGGER_DEBOUNCE_MS = 260;
const HTML_INTERACTIVE_SELECTOR = 'button, a, input, select, textarea, [role="button"], [data-vr-ui="true"]';

/**
 * Resuelve el callback ejecutable (onSelect o onClick) subiendo por la jerarquía 3D.
 */
function resolveTargetCallback(target) {
  let curr = target;
  while (curr) {
    if (curr.userData?.disabled) return null;
    if (typeof curr.userData?.onSelect === 'function') return curr.userData.onSelect;
    if (typeof curr.userData?.onClick === 'function') return curr.userData.onClick;
    curr = curr.parent;
  }
  return null;
}

/**
 * Comprueba que un objeto 3D y todos sus ancestros sean visibles.
 */
function isVisibleInHierarchy(obj) {
  let curr = obj;
  while (curr) {
    if (curr.visible === false) return false;
    curr = curr.parent;
  }
  return true;
}

/**
 * GazeReticle - Retícula Central con Gaze Fuse + Gatillo Físico Homido Grab / Cardboard / WebXR
 * Cumple con norma ISO 9241-210 y criterios WCAG 2.1 (HU-06).
 *
 * Características:
 * - Mira fija en el centro del eje visual de la cámara (z = -1.2m).
 * - Anillo de contraste exterior (WCAG AAA) para legibilidad en salas iluminadas.
 * - Temporizador circular de mirada (Gaze Fuse) calibrado a 2.0 segundos.
 * - Soporte completo de gatillo físico Homido Grab / Cardboard:
 *   1. WebXR nativo (`XRSession` selectstart/select + `gl.xr.getController(0/1)`),
 *      capturando los eventos `gaze`/`screen` de Chrome Android WebXR.
 *   2. Toque capacitivo en pantalla (`touchstart`/`pointerdown` en fase capture)
 *      en modo visor estereoscópico con antirrebote (260ms) para evitar dobles disparos.
 *   3. Controlador Bluetooth / teclado (`Enter`, `Space`, `AudioVolumeUp`) en modo VR.
 * - Retroalimentación auditiva y pulso visual inmediato al accionar el botón.
 */
export function GazeReticle({
  interactiveObjects = [],
  onTrigger,
  onHoverChange,
  fuseDuration = GAZE_FUSE_DEFAULT_DURATION,
  distance = 1.2,
  enabled = true,
  vrMode = false
}) {
  const { camera, gl } = useThree();
  const [hoveredId, setHoveredId] = useState(null);
  const [fuseProgress, setFuseProgress] = useState(0);

  const progressMeshRef = useRef();
  const ringMeshRef = useRef();
  const pulseTimeoutRef = useRef(null);
  const lastPhysicalTriggerRef = useRef(0);
  const raycaster = useRef(new THREE.Raycaster());
  const rayOrigin = useRef(new THREE.Vector3());
  const rayDir = useRef(new THREE.Vector3());

  const triggerRingPulse = useCallback((scale = 1.32) => {
    if (!ringMeshRef.current) return;
    ringMeshRef.current.scale.set(scale, scale, 1);
    if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
    pulseTimeoutRef.current = setTimeout(() => {
      if (ringMeshRef.current) {
        ringMeshRef.current.scale.set(1, 1, 1);
      }
    }, 180);
  }, []);

  useEffect(() => {
    return () => {
      if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
    };
  }, []);

  // Raycast central sincronizado con la pose real de la cámara (camera hereda siempre cameraRigRef,
  // incluso en WebXR donde WebXRManager sincroniza camera con la pose local de la cabeza;
  // nunca debemos llamar updateMatrixWorld sobre gl.xr.getCamera() porque borraría el rig).
  const performCenterRaycast = useCallback(() => {
    if (!camera) return null;

    camera.updateWorldMatrix(true, false);
    camera.getWorldPosition(rayOrigin.current);
    camera.getWorldDirection(rayDir.current);
    raycaster.current.set(rayOrigin.current, rayDir.current);

    const objectsToTest = Array.isArray(interactiveObjects)
      ? interactiveObjects
      : typeof interactiveObjects === 'function'
      ? interactiveObjects()
      : [];

    if (objectsToTest.length === 0) return null;

    const intersects = raycaster.current.intersectObjects(objectsToTest, true);
    for (let i = 0; i < intersects.length; i++) {
      const candidate = intersects[i].object;
      if (!isVisibleInHierarchy(candidate)) continue;
      // Si el rayo golpea un panel bloqueador sólido (ej. fondo del menú principal o modal),
      // detener aquí para jamás atravesar el menú hacia cuadros detrás.
      if (candidate.userData?.isBlocker) return null;
      if (candidate.userData?.disabled) continue;
      return candidate;
    }
    return null;
  }, [camera, interactiveObjects]);

  // Control de estado y lógica del temporizador Gaze Fuse
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
        const cb = resolveTargetCallback(target);
        if (cb) {
          try {
            cb(target);
          } catch (err) {
            console.warn('GazeReticle onSelect error:', err);
          }
        }
        onTrigger?.(target);
        triggerRingPulse(1.32);
      },
      onProgress: (p) => {
        setFuseProgress(p);
        if (progressMeshRef.current) {
          progressMeshRef.current.scale.set(p, p, 1);
        }
      }
    });
  }, [fuseDuration, onTrigger, onHoverChange, triggerRingPulse]);

  // Disparo unificado y antirrebote del botón físico (Homido Grab / Cardboard / WebXR)
  const firePhysicalTrigger = useCallback(() => {
    if (!enabled) return false;

    const now = Date.now();
    if (now - lastPhysicalTriggerRef.current < PHYSICAL_TRIGGER_DEBOUNCE_MS) {
      return false;
    }
    lastPhysicalTriggerRef.current = now;

    // Raycast síncrono en el instante exacto de presionar el botón para nunca perder el objetivo
    const liveHit = performCenterRaycast() || controller.currentTarget;
    if (liveHit) {
      return controller.triggerImmediate(liveHit);
    }

    // Pulso visual sutil incluso si no apunta a un botón para confirmar que el botón físico respondió
    triggerRingPulse(1.18);
    return false;
  }, [enabled, performCenterRaycast, controller, triggerRingPulse]);

  // 1. Listeners nativos WebXR (Chrome Android + Homido Grab / Cardboard / visores XR)
  useEffect(() => {
    const xr = gl?.xr;
    if (!xr) return;

    let activeSession = null;

    const onXRSelect = () => {
      firePhysicalTrigger();
    };

    const bindSession = (session) => {
      if (!session || session === activeSession) return;
      activeSession = session;
      session.addEventListener('selectstart', onXRSelect);
      session.addEventListener('select', onXRSelect);
    };

    const unbindSession = () => {
      if (!activeSession) return;
      activeSession.removeEventListener('selectstart', onXRSelect);
      activeSession.removeEventListener('select', onXRSelect);
      activeSession = null;
    };

    const onSessionStart = () => {
      bindSession(xr.getSession?.());
    };

    const onSessionEnd = () => {
      unbindSession();
    };

    // Enlazar sesión si ya estaba activa al montar el componente
    const currentSession = xr.getSession?.();
    if (currentSession) {
      bindSession(currentSession);
    }

    xr.addEventListener('sessionstart', onSessionStart);
    xr.addEventListener('sessionend', onSessionEnd);

    // Enlazar también controladores WebXR 0 y 1 (Cardboard gaze/screen y mandos XR)
    const controllers = [];
    if (typeof xr.getController === 'function') {
      for (const idx of [0, 1]) {
        const ctrl = xr.getController(idx);
        if (ctrl) {
          ctrl.addEventListener('selectstart', onXRSelect);
          ctrl.addEventListener('select', onXRSelect);
          controllers.push(ctrl);
        }
      }
    }

    return () => {
      unbindSession();
      xr.removeEventListener('sessionstart', onSessionStart);
      xr.removeEventListener('sessionend', onSessionEnd);
      controllers.forEach((ctrl) => {
        ctrl.removeEventListener('selectstart', onXRSelect);
        ctrl.removeEventListener('select', onXRSelect);
      });
    };
  }, [gl, firePhysicalTrigger]);

  // 2. Listeners táctiles capacitivos (Homido Grab en modo estereoscópico / iOS / Android sin WebXR)
  //    y teclado/disparador Bluetooth en modo VR
  useEffect(() => {
    const isHtmlControl = (target) => {
      return Boolean(target && typeof target.closest === 'function' && target.closest(HTML_INTERACTIVE_SELECTOR));
    };

    const onTouchStart = (e) => {
      // Solo en modo visor el toque es el "botón" del Homido Grab. En la Experiencia 2D los
      // toques son para girar la vista (OrbitControls) y para tocar objetos directamente
      // (onClick de R3F); si disparaban la retícula, arrastrar seleccionaba lo que estuviera
      // al centro y la cámara se iba a otra sala.
      if (!enabled || !vrMode) return;
      if (isHtmlControl(e.target)) return;
      // En modo visor (Homido Grab), el toque del pad capacitivo dispara exclusivamente la retícula central
      e.stopPropagation();
      firePhysicalTrigger();
    };

    // Experiencia 2D "tipo juego": con el cursor capturado (Pointer Lock) el clic se dispara en el
    // punto central. Se detiene la propagación para que R3F no haga clic con la posición del
    // cursor oculto (que se queda congelada donde estaba al capturarlo).
    const isLocked = () => !vrMode && isPointerLockedTo(gl?.domElement);
    const blockWhileLocked = (e) => {
      if (isLocked()) e.stopPropagation();
    };

    const onPointerDown = (e) => {
      if (!enabled) return;
      if (isLocked()) {
        e.stopPropagation();
        if (e.button === 0) firePhysicalTrigger();
        return;
      }
      if (isHtmlControl(e.target)) return;

      // Fuera del modo visor (mouse o toque) la retícula no se dispara: se usa el onClick directo
      if (!vrMode) return;

      e.stopPropagation();
      firePhysicalTrigger();
    };

    const onClickCapture = (e) => {
      if (isLocked()) {
        e.stopPropagation();
        return;
      }
      if (!enabled || !vrMode) return;
      if (isHtmlControl(e.target)) return;
      // Evitar que el clic sintetizado del pad capacitivo en la esquina superior derecha
      // active por coordenadas 2D un botón 3D distinto al que apunta la retícula central
      e.stopPropagation();
      firePhysicalTrigger();
    };

    const onKeyDown = (e) => {
      if (!enabled || !vrMode) return;
      if (isHtmlControl(e.target)) return;
      if (
        e.key === 'Enter' ||
        e.key === ' ' ||
        e.code === 'Space' ||
        e.key === 'AudioVolumeUp' ||
        e.key === 'MediaPlayPause'
      ) {
        e.preventDefault();
        firePhysicalTrigger();
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true, capture: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true, capture: true });
    window.addEventListener('click', onClickCapture, { capture: true });
    window.addEventListener('pointerup', blockWhileLocked, { capture: true });
    window.addEventListener('dblclick', blockWhileLocked, { capture: true });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('touchstart', onTouchStart, { capture: true });
      window.removeEventListener('pointerdown', onPointerDown, { capture: true });
      window.removeEventListener('click', onClickCapture, { capture: true });
      window.removeEventListener('pointerup', blockWhileLocked, { capture: true });
      window.removeEventListener('dblclick', blockWhileLocked, { capture: true });
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [enabled, vrMode, gl, firePhysicalTrigger]);

  // Bucle por cuadro: raycast central + actualización de tiempo de mirada (Gaze Fuse)
  useFrame((_, delta) => {
    if (!enabled || !camera) return;
    const hitTarget = performCenterRaycast();
    controller.update(hitTarget, delta);
  });

  const isHovered = hoveredId !== null;

  return (
    <>
      {camera &&
        createPortal(
          <group position={[0, 0, -distance]} renderOrder={9999}>
            {/* 1. Punto central sólido para máxima precisión de puntería */}
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

            {/* 4. Disco interior de progreso Gaze Fuse (se expande circularmente de 0 a 2.0s) */}
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
