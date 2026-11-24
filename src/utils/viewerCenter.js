import * as THREE from 'three';
import { STATION_WORLD_DIRECTIONS } from './vrNavigation.js';

/**
 * Posición fija del espectador: exactamente en el centro del museo, a la altura de los ojos.
 * Es la misma en la Experiencia 2D y en el modo visor VR; la vista solo gira, nunca se desplaza.
 */
export const VIEWER_CENTER = Object.freeze([0, 1.6, 0]);

/** Distancia del objetivo de OrbitControls frente a la cámara (solo define hacia dónde se mira). */
export const LOOK_RADIUS = 0.1;

// Inclinación al mirar cada sala desde el centro (positivo = hacia arriba)
const STATION_PITCH = {
  // Menú principal: centro del panel (Y = 2.30 m) a 3.75 m del centro
  home: Math.atan2(2.3 - VIEWER_CENTER[1], 3.75),
  bienvenida: Math.atan2(2.3 - VIEWER_CENTER[1], 3.75)
};
const DEFAULT_PITCH = THREE.MathUtils.degToRad(3);

/** Vista inicial de la Experiencia 2D: hacia Bienvenida (+Z), apenas por encima del horizonte. */
export function initialLookTarget() {
  return lookTargetFromAngles(0, DEFAULT_PITCH);
}

/** Punto al que mirar (objetivo de OrbitControls) para una dirección yaw/pitch desde el centro. */
export function lookTargetFromAngles(yaw, pitch) {
  const cp = Math.cos(pitch);
  return [
    VIEWER_CENTER[0] + Math.sin(yaw) * cp * LOOK_RADIUS,
    VIEWER_CENTER[1] + Math.sin(pitch) * LOOK_RADIUS,
    VIEWER_CENTER[2] + Math.cos(yaw) * cp * LOOK_RADIUS
  ];
}

/** Ángulos (yaw, pitch) con los que se ve cada sala desde el centro, o null si no existe. */
export function stationLookAngles(stationId) {
  const d = STATION_WORLD_DIRECTIONS[stationId];
  if (!d) return null;
  return { yaw: Math.atan2(d[0], d[2]), pitch: STATION_PITCH[stationId] ?? DEFAULT_PITCH };
}

/** Ángulos de una dirección de mirada (vector cualquiera). */
export function anglesFromDirection(dir) {
  const len = Math.hypot(dir.x, dir.y, dir.z) || 1;
  return { yaw: Math.atan2(dir.x, dir.z), pitch: Math.asin(THREE.MathUtils.clamp(dir.y / len, -1, 1)) };
}

/** Diferencia angular más corta entre dos yaw (rango [-π, π]). */
export function shortestAngle(from, to) {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}
