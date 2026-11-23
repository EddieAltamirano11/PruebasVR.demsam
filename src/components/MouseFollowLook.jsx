import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Configuración de "la vista sigue al mouse" (Experiencia 2D con mouse).
 * - deadZone: fracción central de la pantalla (0–1 desde el centro) donde la vista no se mueve,
 *   para poder apuntar y hacer clic con calma.
 * - Fuera de esa zona, la vista gira hacia donde está el cursor; más rápido cuanto más cerca del borde.
 */
export const MOUSE_FOLLOW = {
  deadZone: 0.45,
  maxYawSpeed: 1.1, // rad/s en el borde izquierdo/derecho (~63°/s)
  maxPitchSpeed: 0.55, // rad/s en el borde superior/inferior
  minPolar: Math.PI * 0.3, // límites para no voltear la vista al techo o al piso
  maxPolar: Math.PI * 0.7
};

const ramp = (n, deadZone) => {
  const mag = Math.abs(n);
  if (mag <= deadZone) return 0;
  const t = Math.min(1, (mag - deadZone) / (1 - deadZone));
  return Math.sign(n) * t * t; // curva suave: arranca lento cerca de la zona muerta
};

/**
 * Velocidades de giro (rad/s) según la posición normalizada del cursor:
 * nx de −1 (izquierda) a 1 (derecha), ny de −1 (abajo) a 1 (arriba).
 * yaw > 0 gira la vista a la derecha; pitch > 0 la inclina hacia arriba.
 */
export function computeFollowRates(nx, ny, cfg = MOUSE_FOLLOW) {
  return {
    yaw: ramp(nx, cfg.deadZone) * cfg.maxYawSpeed,
    pitch: ramp(ny, cfg.deadZone) * cfg.maxPitchSpeed
  };
}

/**
 * Hace que la vista de la Experiencia 2D siga al mouse sin necesidad de arrastrar.
 * Gira la cámara alrededor del objetivo de OrbitControls (igual que el arrastre), así que
 * ambos métodos conviven. Solo actúa con mouse (no con toque) y cuando `enabled` es true.
 */
export function MouseFollowLook({ enabled, orbitRef }) {
  const { gl, camera } = useThree();
  const pointer = useRef(null);
  const dragging = useRef(false);
  const offset = useRef(new THREE.Vector3());
  const spherical = useRef(new THREE.Spherical());

  useEffect(() => {
    const el = gl.domElement;
    const onMove = (e) => {
      if (e.pointerType !== 'mouse') {
        pointer.current = null;
        return;
      }
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      pointer.current = {
        nx: ((e.clientX - rect.left) / rect.width) * 2 - 1,
        ny: -(((e.clientY - rect.top) / rect.height) * 2 - 1)
      };
      dragging.current = e.buttons !== 0;
    };
    const onDown = (e) => {
      if (e.pointerType === 'mouse') dragging.current = true;
    };
    const onUp = () => {
      dragging.current = false;
    };
    const onLeave = () => {
      pointer.current = null;
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointerleave', onLeave);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('blur', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('blur', onLeave);
    };
  }, [gl]);

  useFrame((_, delta) => {
    const controls = orbitRef?.current;
    if (!enabled || !controls || !pointer.current || dragging.current) return;

    const { yaw, pitch } = computeFollowRates(pointer.current.nx, pointer.current.ny);
    if (yaw === 0 && pitch === 0) return;

    const dt = Math.min(delta, 0.05);
    offset.current.copy(camera.position).sub(controls.target);
    spherical.current.setFromVector3(offset.current);

    // Girar a la derecha = disminuir theta del desplazamiento cámara–objetivo
    spherical.current.theta -= yaw * dt;

    // Inclinar hacia arriba = bajar la cámara (aumentar phi), dentro de límites cómodos
    // (si el arrastre dejó la vista fuera del rango, no se fuerza el regreso: solo no se aleja más)
    const phi = spherical.current.phi;
    const lo = Math.min(MOUSE_FOLLOW.minPolar, phi);
    const hi = Math.max(MOUSE_FOLLOW.maxPolar, phi);
    spherical.current.phi = THREE.MathUtils.clamp(phi + pitch * dt, lo, hi);

    offset.current.setFromSpherical(spherical.current);
    camera.position.copy(controls.target).add(offset.current);
    camera.lookAt(controls.target);
    controls.update();
  });

  return null;
}

export default MouseFollowLook;
