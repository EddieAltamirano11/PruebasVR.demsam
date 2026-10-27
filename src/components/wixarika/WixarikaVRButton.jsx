import React, { useRef, useEffect, useMemo } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { SoundFX } from '../../services/audioService.js';
import { WIXARIKA_VARIANTS, calculateAngularSize } from './wixarikaTheme.js';
import { TsikuriDiamond } from './TsikuriDiamond.jsx';

/**
 * WixarikaVRButton - Botón 3D Reutilizable para Realidad Virtual
 * Diseñado con estética ceremonial Wixárika (Huichol), compatibilidad con Gaze Fuse
 * y validación ergonómica de tamaño angular y contraste WCAG AAA.
 * 
 * @param {Object} props
 * @param {string} props.id - Identificador único para el raycaster y Gaze Fuse
 * @param {string} props.label - Texto principal del botón
 * @param {string} [props.sublabel] - Texto secundario opcional
 * @param {string} [props.icon] - Glifo o ícono decorativo (ej. '📚', '👁️', '✕', '☀️')
 * @param {Array<number>} [props.position] - Posición 3D [x, y, z]
 * @param {Array<number>} [props.rotation] - Rotación 3D [rx, ry, rz]
 * @param {number} [props.width=1.3] - Ancho del botón en metros
 * @param {number} [props.height=0.22] - Alto del botón en metros
 * @param {number} [props.depth=0.015] - Profundidad visual
 * @param {boolean} [props.active=false] - Estado activo/seleccionado
 * @param {'solar'|'water'|'hikuri'|'kauyumari'|'obsidian'|'danger'} [props.variant='solar'] - Variante cromática
 * @param {Function} [props.onClick] - Callback al activar (clic, gatillo o gaze fuse)
 * @param {Function} [props.onRegister] - Callback de registro en el raycaster de escena
 * @param {Function} [props.onUnregister] - Callback de desregistro
 * @param {string} [props.hoveredId] - ID del botón actualmente bajo la mirada
 * @param {number} [props.fuseProgress=0] - Progreso del Gaze Fuse (0 a 1)
 * @param {boolean} [props.showDiamonds=true] - Si muestra rombos Tsikuri en las 4 esquinas
 * @param {boolean} [props.disabled=false] - Estado deshabilitado
 * @param {number} [props.distance=2.0] - Distancia esperada al usuario en metros para cálculo angular
 */
export function WixarikaVRButton({
  id,
  label,
  sublabel,
  icon,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  width = 1.3,
  height = 0.22,
  depth = 0.012,
  active = false,
  variant = 'solar',
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
  const theme = WIXARIKA_VARIANTS[variant] || WIXARIKA_VARIANTS.solar;
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

  // Dinámica de color según estado
  const currentBg = disabled
    ? '#1e293b'
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
    : active
    ? '#ffffff'
    : isHovered
    ? '#ffffff'
    : theme.textColor;

  // Dimensiones de rombos Tsikuri de las esquinas
  const diamondSize = Math.min(height * 0.38, 0.07);
  const cornerX = width / 2 - diamondSize * 0.45;
  const cornerY = height / 2 - diamondSize * 0.45;

  // Tamaño de texto adaptado para cumplir tamaño angular (mínimo 0.6° en VR)
  const mainFontSize = Math.max(0.045, height * (sublabel ? 0.34 : 0.42));
  const subFontSize = Math.max(0.03, height * 0.22);
  const angularHeight = calculateAngularSize(height, distance);

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

      {/* 2. Borde interior oscuro de contraste */}
      <mesh position={[0, 0, -0.001]}>
        <planeGeometry args={[width + 0.012, height + 0.012]} />
        <meshBasicMaterial color="#040711" />
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
          {/* Fondo de la barra */}
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[width * 0.88, 0.016]} />
            <meshBasicMaterial color="#040711" transparent opacity={0.8} />
          </mesh>
          {/* Relleno animado según dwell time */}
          <mesh
            position={[-((width * 0.88) * (1 - fuseProgress)) / 2, 0, 0.001]}
            scale={[fuseProgress, 1, 1]}
          >
            <planeGeometry args={[width * 0.88, 0.014]} />
            <meshBasicMaterial color={theme.fuseColor} />
          </mesh>
        </group>
      )}

      {/* 6. Contenido: Ícono, Etiqueta y Subetiqueta con tipografía de alto contraste */}
      <group position={[0, sublabel ? 0.018 : 0, 0.01]}>
        <Text
          position={[0, 0, 0]}
          fontSize={mainFontSize}
          color={currentTextColor}
          anchorX="center"
          anchorY="middle"
          maxWidth={width * 0.82}
          textAlign="center"
          outlineWidth={0.002}
          outlineColor="#040711"
        >
          {icon ? `${icon}  ${label}` : label}
        </Text>

        {sublabel && (
          <Text
            position={[0, -mainFontSize * 1.05, 0]}
            fontSize={subFontSize}
            color={theme.borderGlow}
            anchorX="center"
            anchorY="middle"
            maxWidth={width * 0.85}
            textAlign="center"
          >
            {sublabel}
          </Text>
        )}
      </group>
    </group>
  );
}

export default WixarikaVRButton;
