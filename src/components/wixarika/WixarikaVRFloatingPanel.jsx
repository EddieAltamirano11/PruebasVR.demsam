import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { WIXARIKA_VARIANTS, VR_TYPOGRAPHY_PALETTE } from './wixarikaTheme.js';
import { TsikuriDiamond } from './TsikuriDiamond.jsx';
import { WixarikaVRButton } from './WixarikaVRButton.jsx';

/**
 * WixarikaVRFloatingPanel - Panel Flotante Espacial Reutilizable
 * Base para menús, paneles de lectura, diálogos y módulos interactivos.
 * Aplica paleta estricta de 2 colores y tipografía de alto impacto en VR.
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
  const isCantera = variant === 'cantera';
  const theme = WIXARIKA_VARIANTS[variant] || WIXARIKA_VARIANTS.solar;

  const halfW = width / 2;
  const halfH = height / 2;

  const baseBg = isCantera ? '#faf6eb' : '#070a14';
  // Paleta estricta de 2 colores para textos
  const titleColor = isCantera ? '#1c1917' : VR_TYPOGRAPHY_PALETTE.primary;     // Blanco o carbón profundo
  const subtitleColor = isCantera ? '#78350f' : VR_TYPOGRAPHY_PALETTE.secondary; // Oro sagrado cálido o ámbar

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

      {/* 2. Placa base (Cantera o Obsidiana Sagrada) */}
      <mesh position={[0, 0, -0.005]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color={baseBg} transparent opacity={0.96} />
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
      <group position={[onClose ? -0.25 : 0, halfH - 0.18, 0.005]}>
        <Text
          position={[0, subtitle ? 0.015 : -0.025, 0]}
          fontSize={Math.max(0.095, Math.min(0.125, width * 0.035))}
          color={titleColor}
          anchorX="center"
          anchorY="middle"
          maxWidth={onClose ? width * 0.58 : width * 0.85}
          textAlign="center"
          outlineWidth={isCantera ? 0 : 0.002}
          outlineColor="#040711"
        >
          {title}
        </Text>

        {subtitle && (
          <Text
            position={[0, -0.095, 0]}
            fontSize={Math.max(0.078, Math.min(0.092, width * 0.026))}
            color={subtitleColor}
            anchorX="center"
            anchorY="middle"
            maxWidth={onClose ? width * 0.60 : width * 0.88}
            textAlign="center"
          >
            {subtitle}
          </Text>
        )}

        {/* Separador */}
        <mesh position={[onClose ? 0.25 : 0, -0.165, 0]}>
          <planeGeometry args={[width * 0.88, 0.004]} />
          <meshBasicMaterial color={theme.borderGlow} transparent opacity={0.5} />
        </mesh>
      </group>

      {/* 7. Botón de Cerrar (Posicionado en esquina superior derecha sin colisión) */}
      {onClose && (
        <group position={[halfW - 0.40, halfH - 0.18, 0.008]}>
          <WixarikaVRButton
            id="panel-btn-close"
            label="Cerrar"
            iconName="x"
            variant={isCantera ? 'cantera' : 'danger'}
            width={0.52}
            height={0.18}
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
