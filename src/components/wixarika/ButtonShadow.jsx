import React from 'react';

/** Azul de resaltado de lo seleccionado (botones de menús y objetos del museo). */
export const HOVER_BLUE = '#2563eb';

/**
 * Sombra suave detrás de un botón 3D (abajo a la derecha) para que se perciba como un botón
 * que se puede presionar y no como un panel plano. No cambia los colores del botón.
 * Dos capas: una sombra marcada y un halo más grande y tenue que imita el difuminado.
 */
export function ButtonShadow({ width, height, offset = 0.035, z = -0.008, opacity = 0.32 }) {
  return (
    <group position={[offset, -offset * 1.25, z]}>
      <mesh renderOrder={-1}>
        <planeGeometry args={[width + 0.05, height + 0.05]} />
        <meshBasicMaterial color="#2b1d12" transparent opacity={opacity * 0.45} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, 0.0005]} renderOrder={-1}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color="#2b1d12" transparent opacity={opacity} depthWrite={false} />
      </mesh>
    </group>
  );
}

export default ButtonShadow;
