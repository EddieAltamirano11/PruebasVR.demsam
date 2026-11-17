// Direcciones horizontales cardinales de cada pabellón desde el centro del museo [0, 0, 0]
export const STATION_WORLD_DIRECTIONS = {
  deidades: [0, 0, -1],     // Muro Norte (-Z)
  gastronomia: [1, 0, 0],   // Muro Este (+X)
  fiestas: [-1, 0, 0],      // Muro Oeste (-X)
  home: [0, 0, 1],          // Bienvenida / Menú Principal (+Z)
  bienvenida: [0, 0, 1]
};

/**
 * Calcula el giro horizontal mínimo (delta yaw en radianes, rango [-π, π]) alrededor del eje +Y
 * necesario para alinear la dirección horizontal actual de la mirada `currentDir` con `desiredDir`.
 */
export function computeShortestYawDelta(currentDir, desiredDir) {
  const cx = currentDir.x;
  const cz = currentDir.z;
  const dx = desiredDir.x;
  const dz = desiredDir.z;

  const cLen = Math.hypot(cx, cz);
  const dLen = Math.hypot(dx, dz);
  if (cLen < 1e-4 || dLen < 1e-4) return 0;

  const ncx = cx / cLen;
  const ncz = cz / cLen;
  const ndx = dx / dLen;
  const ndz = dz / dLen;

  // En coordenadas derechas de Three.js, RotateY(theta) transforma (x, z) -> (x cos + z sin, -x sin + z cos)
  const sinDelta = ncz * ndx - ncx * ndz;
  const cosDelta = ncx * ndx + ncz * ndz;
  return Math.atan2(sinDelta, cosDelta);
}
