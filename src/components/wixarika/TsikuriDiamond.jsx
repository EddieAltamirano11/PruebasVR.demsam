import React, { useMemo } from 'react';
import * as THREE from 'three';

/**
 * TsikuriDiamond - Motivo sagrado del "Ojo de Dios" Wixárika en 3D
 * Representa los 4 puntos cardinales, el centro espiritual de Wirikuta y la visión cósmica.
 * Construido con anillos romboidales concéntricos de alto contraste.
 */
export function TsikuriDiamond({
  size = 0.08,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  colors = ['#f59e0b', '#ef4444', '#38bdf8', '#ffffff'],
  centerColor = '#070a14'
}) {
  const diamondRot = Math.PI / 4; // Rotado 45 grados para formar el rombo sagrado

  return (
    <group position={position} rotation={rotation}>
      {/* Capa 1 exterior: Rombo dorado / ámbar */}
      <mesh rotation={[0, 0, diamondRot]} position={[0, 0, 0]}>
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial color={colors[0] || '#f59e0b'} side={THREE.DoubleSide} />
      </mesh>

      {/* Capa 2: Rombo coral ceremonial */}
      <mesh rotation={[0, 0, diamondRot]} position={[0, 0, 0.001]}>
        <planeGeometry args={[size * 0.76, size * 0.76]} />
        <meshBasicMaterial color={colors[1] || '#ef4444'} side={THREE.DoubleSide} />
      </mesh>

      {/* Capa 3: Rombo turquesa cielo */}
      <mesh rotation={[0, 0, diamondRot]} position={[0, 0, 0.002]}>
        <planeGeometry args={[size * 0.52, size * 0.52]} />
        <meshBasicMaterial color={colors[2] || '#38bdf8'} side={THREE.DoubleSide} />
      </mesh>

      {/* Capa 4: Ojo central blanco y pupila obsidiana */}
      <mesh rotation={[0, 0, diamondRot]} position={[0, 0, 0.003]}>
        <planeGeometry args={[size * 0.3, size * 0.3]} />
        <meshBasicMaterial color={colors[3] || '#ffffff'} side={THREE.DoubleSide} />
      </mesh>

      <mesh rotation={[0, 0, diamondRot]} position={[0, 0, 0.004]}>
        <planeGeometry args={[size * 0.14, size * 0.14]} />
        <meshBasicMaterial color={centerColor} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/**
 * ChaquiraBorder - Borde perimetral con cuentas geométricas estilo chaquira Wixárika
 */
export function ChaquiraBorder({
  width = 1.0,
  height = 0.3,
  beadSize = 0.016,
  colors = ['#f59e0b', '#38bdf8', '#ef4444', '#ffffff'],
  density = 16
}) {
  // Generar posiciones de cuentas a lo largo del perímetro
  const beads = useMemo(() => {
    const list = [];
    const halfW = width / 2;
    const halfH = height / 2;
    const stepX = width / Math.max(4, Math.floor(density * (width / 0.5)));
    const stepY = height / Math.max(3, Math.floor(density * (height / 0.3)));

    let colorIdx = 0;
    // Borde superior
    for (let x = -halfW + beadSize; x < halfW; x += stepX) {
      list.push({ pos: [x, halfH, 0.002], color: colors[colorIdx % colors.length] });
      colorIdx++;
    }
    // Borde inferior
    for (let x = -halfW + beadSize; x < halfW; x += stepX) {
      list.push({ pos: [x, -halfH, 0.002], color: colors[colorIdx % colors.length] });
      colorIdx++;
    }
    // Borde izquierdo
    for (let y = -halfH + beadSize; y < halfH; y += stepY) {
      list.push({ pos: [-halfW, y, 0.002], color: colors[colorIdx % colors.length] });
      colorIdx++;
    }
    // Borde derecho
    for (let y = -halfH + beadSize; y < halfH; y += stepY) {
      list.push({ pos: [halfW, y, 0.002], color: colors[colorIdx % colors.length] });
      colorIdx++;
    }
    return list;
  }, [width, height, beadSize, colors, density]);

  return (
    <group>
      {beads.map((bead, i) => (
        <mesh key={i} position={bead.pos} rotation={[0, 0, Math.PI / 4]}>
          <planeGeometry args={[beadSize, beadSize]} />
          <meshBasicMaterial color={bead.color} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

export default TsikuriDiamond;
