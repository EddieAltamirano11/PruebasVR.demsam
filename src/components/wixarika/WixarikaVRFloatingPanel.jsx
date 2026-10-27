import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { WIXARIKA_VARIANTS } from './wixarikaTheme.js';
import { TsikuriDiamond } from './TsikuriDiamond.jsx';
import { WixarikaVRButton } from './WixarikaVRButton.jsx';

/**
 * WixarikaVRFloatingPanel - Panel Flotante Espacial Reutilizable
 * Base para menús, paneles de lectura, diálogos y módulos interactivos.
 * 
 * @param {Object} props
 * @param {string} props.title - Título del panel
 * @param {string} [props.subtitle] - Subtítulo descriptivo
 * @param {number} [props.width=2.4] - Ancho del panel en metros
 * @param {number} [props.height=1.8] - Alto del panel en metros
 * @param {Array<number>} [props.position] - Posición en espacio 3D
 * @param {Array<number>} [props.rotation] - Rotación 3D
 * @param {boolean} [props.billboard=false] - Si debe orientarse automáticamente al observador
 * @param {'solar'|'water'|'hikuri'|'kauyumari'|'obsidian'} [props.variant='solar']
 * @param {Function} [props.onClose] - Callback para cerrar el panel
 * @param {Function} [props.onRegister] - Callback de registro para raycaster
 * @param {Function} [props.onUnregister] - Callback de desregistro
 * @param {string} [props.hoveredId] - ID de botón enfocado
 * @param {number} [props.fuseProgress=0] - Progreso del Gaze Fuse
 * @param {React.ReactNode} [props.children] - Contenido hijo dentro del panel
 */
export function WixarikaVRFloatingPanel({
  title,
  subtitle,
  width = 2.4,
  height = 1.8,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  billboard = false,
  variant = 'solar',
  onClose,
  onRegister,
  onUnregister,
  registerMesh,
  unregisterMesh,
  hoveredId,
  fuseProgress = 0,
  children
}) {
  const panelRef = useRef();
  const { camera } = useThree();
  const theme = WIXARIKA_VARIANTS[variant] || WIXARIKA_VARIANTS.solar;

  const halfW = width / 2;
  const halfH = height / 2;

  // Si billboard está activo, orientar suavemente hacia la cámara
  useFrame(() => {
    if (billboard && panelRef.current && camera) {
      panelRef.current.lookAt(camera.position.x, panelRef.current.position.y, camera.position.z);
    }
  });

  return (
    <group ref={panelRef} position={position} rotation={rotation}>
      {/* 1. Borde perimetral resplandeciente */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[width + 0.05, height + 0.05]} />
        <meshBasicMaterial color={theme.borderColor} transparent opacity={0.7} />
      </mesh>

      {/* 2. Placa de Obsidiana Sagrada translúcida (WCAG AAA) */}
      <mesh position={[0, 0, -0.005]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color="#070a14" transparent opacity={0.96} />
      </mesh>

      {/* 3. Cenefa superior decorativa */}
      <mesh position={[0, halfH - 0.04, 0.001]}>
        <planeGeometry args={[width * 0.95, 0.03]} />
        <meshBasicMaterial color={theme.accentColor} transparent opacity={0.8} />
      </mesh>

      {/* 4. Cresta Sagrada Tsikuri en la parte superior central */}
      <TsikuriDiamond
        size={0.14}
        position={[0, halfH + 0.04, 0.006]}
        colors={theme.chaquiraBeads}
      />

      {/* 5. Rombos Tsikuri en las esquinas superiores */}
      <TsikuriDiamond
        size={0.09}
        position={[-halfW + 0.06, halfH - 0.06, 0.005]}
        colors={theme.chaquiraBeads}
      />
      <TsikuriDiamond
        size={0.09}
        position={[halfW - 0.06, halfH - 0.06, 0.005]}
        colors={theme.chaquiraBeads}
      />

      {/* 6. Encabezado del Panel (Con ancho protegido para evitar colisión con el botón cerrar) */}
      <group position={[onClose ? -0.15 : 0, halfH - 0.16, 0.005]}>
        <Text
          position={[0, 0, 0]}
          fontSize={Math.max(0.060, Math.min(0.075, width * 0.030))}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          maxWidth={onClose ? width * 0.58 : width * 0.85}
          textAlign="center"
          outlineWidth={0.002}
          outlineColor="#040711"
        >
          {title}
        </Text>

        {subtitle && (
          <Text
            position={[0, -0.085, 0]}
            fontSize={Math.max(0.036, Math.min(0.044, width * 0.017))}
            color={theme.borderGlow}
            anchorX="center"
            anchorY="middle"
            maxWidth={onClose ? width * 0.62 : width * 0.88}
            textAlign="center"
          >
            {subtitle}
          </Text>
        )}

        {/* Separador */}
        <mesh position={[onClose ? 0.15 : 0, -0.15, 0]}>
          <planeGeometry args={[width * 0.88, 0.004]} />
          <meshBasicMaterial color={theme.borderGlow} transparent opacity={0.5} />
        </mesh>
      </group>

      {/* 7. Botón de Cerrar (Posicionado en esquina superior derecha sin colisión) */}
      {onClose && (
        <group position={[halfW - 0.28, halfH - 0.14, 0.008]}>
          <WixarikaVRButton
            id="panel-btn-close"
            label="Cerrar [✕]"
            variant="danger"
            width={0.42}
            height={0.13}
            onClick={onClose}
            onRegister={onRegister}
            onUnregister={onUnregister}
            registerMesh={registerMesh}
            unregisterMesh={unregisterMesh}
            hoveredId={hoveredId}
            fuseProgress={fuseProgress}
            showDiamonds={false}
          />
        </group>
      )}

      {/* 8. Área de Contenido Hijo */}
      <group position={[0, -0.06, 0.005]}>
        {children}
      </group>
    </group>
  );
}

export default WixarikaVRFloatingPanel;
