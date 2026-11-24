import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
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

/** Las 12 aristas de una caja como pares de puntos (para <Line segments>). */
export function boxEdgeSegments(box) {
  const { min: a, max: b } = box;
  const c = [
    [a.x, a.y, a.z], [b.x, a.y, a.z], [b.x, b.y, a.z], [a.x, b.y, a.z],
    [a.x, a.y, b.z], [b.x, a.y, b.z], [b.x, b.y, b.z], [a.x, b.y, b.z]
  ];
  const edges = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
  return edges.flatMap(([i, j]) => [c[i], c[j]]);
}

/**
 * Contorno naranja alrededor del objeto interactivo del GLB que está bajo el punto central,
 * para que se note qué se puede seleccionar (pensado para personas con poca experiencia digital).
 */
export function HoverOutline({ target }) {
  const lineRef = useRef();
  const points = useMemo(() => {
    if (!target) return null;
    target.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(target);
    if (box.isEmpty()) return null;
    box.expandByScalar(PADDING);
    return boxEdgeSegments(box);
  }, [target]);

  // Pulso suave del contorno para llamar la atención sin distraer
  useFrame(({ clock }) => {
    const mat = lineRef.current?.material;
    if (mat) mat.opacity = 0.75 + 0.25 * Math.sin(clock.elapsedTime * 5);
  });

  if (!points) return null;
  return (
    <Line
      ref={lineRef}
      points={points}
      segments
      color={OUTLINE_COLOR}
      lineWidth={4}
      transparent
      depthTest={false}
      renderOrder={9000}
    />
  );
}

export default HoverOutline;
