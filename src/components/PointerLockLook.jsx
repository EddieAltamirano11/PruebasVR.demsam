import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Configuración del control "tipo juego" de la Experiencia 2D con mouse.
 * - sensitivity: radianes de giro por píxel de movimiento del mouse.
 * - maxPitch: inclinación máxima arriba/abajo (para no voltear la vista).
 */
export const POINTER_LOOK = {
  sensitivity: 0.0011, // ~0.06° por píxel (la mitad del valor inicial, que se sentía demasiado sensible)
  maxPitch: THREE.MathUtils.degToRad(55) // igual que el límite de OrbitControls en 2D
};

/** true si el cursor está capturado por `element` (Pointer Lock activo). */
export function isPointerLockedTo(element) {
  return typeof document !== 'undefined' && Boolean(element) && document.pointerLockElement === element;
}

/**
 * Nueva dirección de la mirada tras mover el mouse (movementX/Y en píxeles).
 * Mover a la derecha gira a la derecha; mover hacia abajo inclina hacia abajo.
 * Devuelve un vector unitario nuevo (no modifica `dir`).
 */
export function rotateLookDirection(dir, movementX, movementY, cfg = POINTER_LOOK) {
  const d = dir.clone().normalize();
  let yaw = Math.atan2(d.x, d.z);
  let pitch = Math.asin(THREE.MathUtils.clamp(d.y, -1, 1));
  yaw -= movementX * cfg.sensitivity;
  pitch = THREE.MathUtils.clamp(pitch - movementY * cfg.sensitivity, -cfg.maxPitch, cfg.maxPitch);
  const cp = Math.cos(pitch);
  return new THREE.Vector3(Math.sin(yaw) * cp, Math.sin(pitch), Math.cos(yaw) * cp);
}

/**
 * Experiencia 2D con mouse "como en un juego":
 * - Clic en la escena: se captura el cursor (Pointer Lock) y deja de verse; solo queda el punto central.
 * - Mover el mouse gira la vista en primera persona (la cámara no se desplaza).
 * - Los clics se disparan en el punto central (lo resuelve GazeReticle).
 * - Cualquier tecla (o Esc) libera el cursor para usar los botones de la barra superior.
 * La vista gira moviendo el objetivo de OrbitControls alrededor de la cámara, así que la
 * navegación a salas y el arrastre con el cursor libre siguen funcionando igual.
 */
export function PointerLockLook({ enabled, orbitRef, onUserLook }) {
  const { gl, camera } = useThree();
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const onUserLookRef = useRef(onUserLook);
  onUserLookRef.current = onUserLook;

  useEffect(() => {
    const el = gl.domElement;
    const dir = new THREE.Vector3();

    const onPointerDown = (e) => {
      if (!enabledRef.current || e.pointerType !== 'mouse' || e.button !== 0) return;
      if (isPointerLockedTo(el) || typeof el.requestPointerLock !== 'function') return;
      try {
        // Chrome devuelve una promesa (puede rechazar si se pide justo después de pulsar Esc)
        const result = el.requestPointerLock();
        if (result && typeof result.catch === 'function') result.catch(() => {});
      } catch {
        // Sin Pointer Lock (iframe sin permiso, navegador antiguo): se mantiene el arrastre normal
      }
    };

    const onMouseMove = (e) => {
      const controls = orbitRef?.current;
      if (!enabledRef.current || !controls || !isPointerLockedTo(el)) return;
      if (!e.movementX && !e.movementY) return;
      onUserLookRef.current?.(e.movementX, e.movementY);
      dir.copy(controls.target).sub(camera.position);
      const dist = dir.length() || 1;
      const next = rotateLookDirection(dir, e.movementX, e.movementY);
      controls.target.copy(camera.position).addScaledVector(next, dist);
      controls.update();
    };

    // Cualquier tecla libera el cursor (además de Esc, que lo hace el navegador)
    const onKeyDown = (e) => {
      if (!isPointerLockedTo(el)) return;
      e.preventDefault();
      document.exitPointerLock?.();
    };

    el.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('mousemove', onMouseMove);
    window.addEventListener('keydown', onKeyDown, true);
    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('keydown', onKeyDown, true);
    };
  }, [gl, camera, orbitRef]);

  // Al entrar a VR (o desactivarse) se libera el cursor
  useEffect(() => {
    if (!enabled && isPointerLockedTo(gl.domElement)) document.exitPointerLock?.();
  }, [enabled, gl]);

  // Mientras el cursor está capturado, el arrastre de OrbitControls no aplica
  useEffect(() => {
    const el = gl.domElement;
    const onChange = () => {
      const controls = orbitRef?.current;
      if (controls) controls.enableRotate = !isPointerLockedTo(el);
    };
    document.addEventListener('pointerlockchange', onChange);
    return () => document.removeEventListener('pointerlockchange', onChange);
  }, [gl, orbitRef]);

  return null;
}

export default PointerLockLook;
