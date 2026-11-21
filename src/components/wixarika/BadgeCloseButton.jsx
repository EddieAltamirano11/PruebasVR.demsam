import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { SoundFX } from '../../services/audioService.js';
import { TsikuriDiamond } from './TsikuriDiamond.jsx';
import { LucideVRIcon } from './LucideVRIcon.jsx';

const UNIFIED_ICON_COLOR = '#b45309';

/**
 * BadgeCloseButton - Botón badge ceremonial con cruz (x) para cerrar ventanas modales o menús.
 * Incluye bisel de cantera clara, marco dorado, rombos protectores Tsikuri,
 * soporte de Gaze Fuse y eventos de audio unificados.
 */
export function BadgeCloseButton({
  id = 'btn-close-modal',
  size = 0.38,
  position = [0, 0, 0],
  onClick,
  registerMesh,
  unregisterMesh,
  hoveredId,
  fuseProgress = 0
}) {
  const meshRef = useRef();
  const isHovered = hoveredId === id;

  useEffect(() => {
    const mesh = meshRef.current;
    if (mesh) {
      mesh.userData = { id, onClick, onSelect: onClick };
      if (registerMesh) registerMesh(mesh);
    }
    return () => {
      if (mesh && unregisterMesh) unregisterMesh(mesh);
    };
  }, [id, onClick, registerMesh, unregisterMesh]);

  const handleClick = (e) => {
    e.stopPropagation?.();
    SoundFX.playClick();
    if (onClick) onClick();
  };

  const handlePointerOver = (e) => {
    e.stopPropagation?.();
    SoundFX.playHover();
  };

  return (
    <group position={position}>
      {/* Marco exterior dorado */}
      <mesh position={[0, 0, -0.001]}>
        <planeGeometry args={[size + 0.024, size + 0.024]} />
        <meshBasicMaterial
          color={isHovered ? '#b45309' : '#c69214'}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Bisel cantera interactivo */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        position={[0, 0, 0]}
      >
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial
          color={isHovered ? '#f4ebd8' : '#fbf7ee'}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Rombos protectores Tsikuri diminutos en esquinas */}
      <group position={[0, 0, 0.002]}>
        <TsikuriDiamond
          size={0.028}
          position={[-size / 2 + 0.025, size / 2 - 0.025, 0]}
          colors={['#c69214', UNIFIED_ICON_COLOR, '#ffffff']}
        />
        <TsikuriDiamond
          size={0.028}
          position={[size / 2 - 0.025, -size / 2 + 0.025, 0]}
          colors={['#c69214', UNIFIED_ICON_COLOR, '#ffffff']}
        />
      </group>

      {/* Anillo de progreso Gaze Fuse */}
      {isHovered && fuseProgress > 0 && (
        <group position={[0, 0, 0.003]}>
          <mesh position={[0, -size / 2 + 0.014, 0]}>
            <planeGeometry args={[size * 0.85, 0.014]} />
            <meshBasicMaterial color="#e7dec8" side={THREE.DoubleSide} />
          </mesh>
          <mesh
            position={[-((size * 0.85) * (1 - fuseProgress)) / 2, -size / 2 + 0.014, 0.001]}
            scale={[fuseProgress, 1, 1]}
          >
            <planeGeometry args={[size * 0.85, 0.012]} />
            <meshBasicMaterial color={UNIFIED_ICON_COLOR} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      {/* Icono Lucide 'x' ceremonial nítido */}
      <LucideVRIcon
        name="x"
        size={size * 0.58}
        color={UNIFIED_ICON_COLOR}
        position={[0, 0, 0.004]}
        strokeWidth={2.8}
      />
    </group>
  );
}

export default BadgeCloseButton;
