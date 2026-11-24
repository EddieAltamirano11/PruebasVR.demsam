import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

const OUTLINE_COLOR = '#E5A00D';
const PADDING = 0.03; // m alrededor del objeto

// Malla interactiva del GLB → objeto completo a resaltar. Se guarda fuera de userData para no
// crear referencias circulares (Object3D.copy serializa userData con JSON).
const outlineRoots = new WeakMap();

export function setOutlineRoot(mesh, root) {
  if (mesh && root) outlineRoots.set(mesh, root);
}

/**
 * Busca el objeto "raíz" a resaltar (cuadro completo, botón del muro, platillo) subiendo
 * por la jerarquía desde la malla que tocó la retícula. Solo los objetos del GLB lo tienen:
 * los menús flotantes ya muestran su propio estado de enfoque.
 */
export function findOutlineRoot(object) {
  let curr = object;
  while (curr) {
    const root = outlineRoots.get(curr);
    if (root) return root;
    curr = curr.parent;
  }
  return null;
}

/**
 * Rectángulo plano (como un marco) alrededor del objeto, en su cara de frente al visitante.
 * Para un cuadro en el muro coincide con su marco; para un objeto sobre la mesa es el
 * rectángulo que lo encierra visto desde el centro. Devuelve las 4 esquinas cerradas (5 puntos).
 */
export function frontRectangle(box, viewer) {
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  // Dirección horizontal del visitante hacia el objeto (los muros son verticales)
  const dir = center.clone().sub(viewer).setY(0);
  if (dir.lengthSq() < 1e-8) dir.set(0, 0, -1);
  dir.normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3().crossVectors(dir, up).normalize();

  const halfW = (Math.abs(size.x * right.x) + Math.abs(size.z * right.z)) / 2 + PADDING;
  const halfH = size.y / 2 + PADDING;
  const halfDepth = (Math.abs(size.x * dir.x) + Math.abs(size.z * dir.z)) / 2;
  // Un poco por delante de la cara frontal para que no se esconda dentro del marco
  const face = center.clone().addScaledVector(dir, -(halfDepth + 0.015));

  const corner = (sx, sy) =>
    face.clone().addScaledVector(right, sx * halfW).addScaledVector(up, sy * halfH).toArray();
  const c1 = corner(-1, -1);
  return [c1, corner(1, -1), corner(1, 1), corner(-1, 1), c1];
}

/**
 * Marco naranja plano alrededor del objeto interactivo del GLB que está bajo el punto central,
 * para que se note que se puede abrir (pensado para personas con poca experiencia digital).
 */
export function HoverOutline({ target }) {
  const lineRef = useRef();
  const camera = useThree((st) => st.camera);
  const points = useMemo(() => {
    if (!target) return null;
    target.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(target);
    if (box.isEmpty()) return null;
    return frontRectangle(box, camera.getWorldPosition(new THREE.Vector3()));
  }, [target, camera]);

  // Pulso suave del marco para llamar la atención sin distraer
  useFrame(({ clock }) => {
    const mat = lineRef.current?.material;
    if (mat) mat.opacity = 0.75 + 0.25 * Math.sin(clock.elapsedTime * 5);
  });

  if (!points) return null;
  return (
    <Line
      ref={lineRef}
      points={points}
      color={OUTLINE_COLOR}
      lineWidth={5}
      transparent
      depthTest={false}
      renderOrder={9000}
    />
  );
}

export default HoverOutline;
