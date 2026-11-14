import React, { useRef, useEffect } from 'react';
import { Text } from '@react-three/drei';
import { SoundFX } from '../../services/audioService.js';
import { WIXARIKA_VARIANTS, calculateAngularSize } from './wixarikaTheme.js';
import { TsikuriDiamond } from './TsikuriDiamond.jsx';
import { LucideVRIcon } from './LucideVRIcon.jsx';

/**
 * WixarikaVRButton - Botón 3D Reutilizable para Realidad Virtual
 * Diseñado con estética ceremonial Wixárika (Huichol), compatibilidad con Gaze Fuse
 * y tipografía maximizada para total legibilidad en VR.
 */
export function WixarikaVRButton({
  id,
  label,
  sublabel,
  icon,
  iconName,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  width = 1.3,
  height = 0.22,
  depth: _depth = 0.012,
  active = false,
  variant = 'cantera',
  onClick,
  onRegister,
  onUnregister,
  registerMesh,
  unregisterMesh,
  hoveredId,
  fuseProgress = 0,
  showDiamonds = true,
  disabled = false,
  distance = 2.0
}) {
  const meshRef = useRef();
  const isCantera = variant === 'cantera';
  const theme = WIXARIKA_VARIANTS[variant] || WIXARIKA_VARIANTS.cantera;
  const isHovered = hoveredId === id && !disabled;

  // Registrar botón interactivo en el raycaster de Gaze Fuse
  useEffect(() => {
    const mesh = meshRef.current;
    if (mesh) {
      mesh.userData = { id, onClick, onSelect: onClick, disabled };
      if (registerMesh) {
        registerMesh(mesh);
      }
      if (onRegister && id) {
        onRegister(id, mesh, onClick);
      }
    }
    return () => {
      if (mesh && unregisterMesh) {
        unregisterMesh(mesh);
      }
      if (onUnregister && id) {
        onUnregister(id);
      }
    };
  }, [id, onClick, disabled, onRegister, onUnregister, registerMesh, unregisterMesh]);

  // Manejador para interacciones de puntero/ratón (testing en escritorio)
  const handleClick = (e) => {
    e.stopPropagation?.();
    if (disabled) return;
    SoundFX.playClick();
    onClick?.();
  };

  const handlePointerOver = (e) => {
    e.stopPropagation?.();
    if (disabled) return;
    SoundFX.playHover();
  };

  // Dinámica de color según estado (libre de tonos negros)
  const currentBg = disabled
    ? (isCantera ? '#e2d8c3' : '#1e293b')
    : active
    ? theme.bgActive
    : isHovered
    ? theme.bgHover
    : theme.bgIdle;

  const currentBorder = disabled
    ? '#475569'
    : active
    ? theme.borderGlow
    : isHovered
    ? theme.borderGlow
    : theme.borderColor;

  const currentTextColor = disabled
    ? '#64748b'
    : isCantera
    ? (isHovered ? '#78350f' : '#1c1917')
    : active
    ? '#ffffff'
    : isHovered
    ? '#ffffff'
    : theme.textColor;

  // Dimensiones de rombos Tsikuri de las esquinas
  const diamondSize = Math.min(height * 0.38, 0.07);
  const cornerX = width / 2 - diamondSize * 0.45;
  const cornerY = height / 2 - diamondSize * 0.45;

  // Tamaño de texto maximizado para garantizar legibilidad inmediata en visores VR
  const mainFontSize = Math.max(0.080, height * (sublabel ? 0.38 : 0.48));
  const subFontSize = Math.max(0.056, height * 0.28);
  const _angularHeight = calculateAngularSize(height, distance);

  return (
    <group position={position} rotation={rotation}>
      {/* 1. Marco exterior con relieve 3D y brillo de chaquira */}
      <mesh position={[0, 0, -0.003]}>
        <planeGeometry args={[width + 0.035, height + 0.035]} />
        <meshBasicMaterial
          color={currentBorder}
          transparent
          opacity={isHovered || active ? 0.95 : 0.65}
        />
      </mesh>

      {/* 2. Bisel interior de contraste armónico (libre de negro) */}
      <mesh position={[0, 0, -0.001]}>
        <planeGeometry args={[width + 0.012, height + 0.012]} />
        <meshBasicMaterial color={isCantera ? '#e7dec8' : theme.borderColor} />
      </mesh>

      {/* 3. Superficie táctil / colisionador principal del raycaster */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        position={[0, 0, 0]}
      >
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          color={currentBg}
          transparent
          opacity={0.94}
        />
      </mesh>

      {/* 4. Rombos protectores Tsikuri en las 4 esquinas */}
      {showDiamonds && (
        <group position={[0, 0, 0.005]}>
          <TsikuriDiamond
            size={diamondSize}
            position={[-cornerX, cornerY, 0]}
            colors={theme.chaquiraBeads}
          />
          <TsikuriDiamond
            size={diamondSize}
            position={[cornerX, cornerY, 0]}
            colors={theme.chaquiraBeads}
          />
          <TsikuriDiamond
            size={diamondSize}
            position={[-cornerX, -cornerY, 0]}
            colors={theme.chaquiraBeads}
          />
          <TsikuriDiamond
            size={diamondSize}
            position={[cornerX, -cornerY, 0]}
            colors={theme.chaquiraBeads}
          />
        </group>
      )}

      {/* 5. Barra de progreso Gaze Fuse Wixárika en el borde inferior */}
      {isHovered && fuseProgress > 0 && (
        <group position={[0, -height / 2 + 0.012, 0.006]}>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[width * 0.92, 0.012]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          <mesh
            position={[-((width * 0.92) * (1 - fuseProgress)) / 2, 0, 0.001]}
            scale={[fuseProgress, 1, 1]}
          >
            <planeGeometry args={[width * 0.92, 0.010]} />
            <meshBasicMaterial color={theme.fuseColor} />
          </mesh>
        </group>
      )}

      {/* 6. Icono Lucide o glifo decorativo */}
      {iconName ? (
        <LucideVRIcon
          name={iconName}
          size={label ? Math.min(height * 0.54, 0.14) : Math.min(height * 0.65, width * 0.65)}
          color={currentTextColor}
          position={[label ? -width / 2 + Math.max(0.12, width * 0.12) : 0, sublabel ? 0.015 : 0, 0.004]}
          strokeWidth={2.4}
        />
      ) : icon ? (
        <Text
          position={[label ? -width / 2 + Math.max(0.12, width * 0.12) : 0, sublabel ? 0.015 : 0, 0.004]}
          fontSize={label ? Math.min(height * 0.54, 0.11) : Math.min(height * 0.65, width * 0.65)}
          color={currentTextColor}
          anchorX="center"
          anchorY="middle"
        >
          {icon}
        </Text>
      ) : null}

      {/* 7. Texto Principal del Botón (Grande, claro, alto contraste) */}
      {label && (
        <Text
          position={[
            iconName || icon ? width * 0.05 : 0,
            sublabel ? height * 0.14 : 0,
            0.004
          ]}
          fontSize={mainFontSize}
          color={currentTextColor}
          anchorX="center"
          anchorY="middle"
          maxWidth={width * 0.82}
          textAlign="center"
          outlineWidth={isCantera ? 0 : 0.002}
          outlineColor="#040711"
          letterSpacing={0.02}
        >
          {label}
        </Text>
      )}

      {/* 8. Subtexto descriptivo */}
      {sublabel && (
        <Text
          position={[
            iconName || icon ? width * 0.05 : 0,
            -height * 0.20,
            0.004
          ]}
          fontSize={subFontSize}
          color={isCantera ? '#78350f' : theme.borderGlow}
          anchorX="center"
          anchorY="middle"
          maxWidth={width * 0.82}
          textAlign="center"
        >
          {sublabel}
        </Text>
      )}
    </group>
  );
}

export default WixarikaVRButton;
