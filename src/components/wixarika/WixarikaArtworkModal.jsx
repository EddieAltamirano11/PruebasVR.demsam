import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { SoundFX } from '../../services/audioService.js';
import { TsikuriDiamond } from './TsikuriDiamond.jsx';
import { LucideVRIcon } from './LucideVRIcon.jsx';

// Color unificado ceremonial para elementos del museo
const UNIFIED_ICON_COLOR = '#b45309';

/**
 * Subcomponente para renderizar la fotografía de la obra con filtrado anisótropo y sRGB.
 */
function ArtworkPhoto({ url, width = 1.88, height = 2.60 }) {
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    if (!url) return;
    const loader = new THREE.TextureLoader();
    let isMounted = true;

    loader.load(
      url,
      (tex) => {
        if (!isMounted) return;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = true;
        tex.anisotropy = 8;
        setTexture(tex);
      },
      undefined,
      (err) => console.warn('Error cargando fotografía de cuadro:', err)
    );

    return () => {
      isMounted = false;
    };
  }, [url]);

  return (
    <mesh position={[0, 0, 0.004]}>
      <planeGeometry args={[width, height]} />
      {texture ? (
        <meshBasicMaterial map={texture} toneMapped={false} />
      ) : (
        <meshBasicMaterial color="#e7dec8" />
      )}
    </mesh>
  );
}

/**
 * Botón badge ceremonial con cruz (x) para cerrar la ventana modal.
 */
function BadgeCloseButton({
  id = 'btn-close-artwork-modal',
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
        <meshBasicMaterial color={isHovered ? '#b45309' : '#c69214'} />
      </mesh>

      {/* Bisel cantera interactivo */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        position={[0, 0, 0]}
      >
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial color={isHovered ? '#f4ebd8' : '#fbf7ee'} />
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
            <meshBasicMaterial color="#e7dec8" />
          </mesh>
          <mesh
            position={[-((size * 0.85) * (1 - fuseProgress)) / 2, -size / 2 + 0.014, 0.001]}
            scale={[fuseProgress, 1, 1]}
          >
            <planeGeometry args={[size * 0.85, 0.012]} />
            <meshBasicMaterial color={UNIFIED_ICON_COLOR} />
          </mesh>
        </group>
      )}

      {/* Icono Lucide 'x' nítido */}
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

/**
 * WixarikaArtworkModal - Ventana Monumental para Cuadros de Deidades y Fiestas
 * Dimensiones idénticas al menú principal: 6.40m × 3.50m.
 * Distribución:
 * - 1/3 Izquierda (~2.13m): Fotografía de la deidad o fiesta seleccionada en gran escala.
 * - 2/3 Derecha (~4.27m): Título, subtítulo ceremonial, palabras clave y síntesis en tipografía maximizada.
 * - Badge con cruz 'x' de cierre en la esquina superior derecha.
 */
export function WixarikaArtworkModal({
  artwork,
  position = [0, 2.30, 0],
  rotation = [0, 0, 0],
  onClose,
  registerMesh,
  unregisterMesh,
  hoveredId,
  fuseProgress = 0
}) {
  const panelWidth = 6.40;
  const panelHeight = 3.50;

  if (!artwork) return null;

  // Centro horizontal de cada columna
  const leftColX = -panelWidth / 2 + (panelWidth / 3) / 2; // -3.20 + 1.066 = -2.134m
  const rightColX = -panelWidth / 2 + (panelWidth / 3) + (panelWidth * 2 / 3) / 2; // +1.066m
  const rightColWidth = (panelWidth * 2 / 3) * 0.92; // ~3.92m

  return (
    <group position={position} rotation={rotation}>
      {/* 1. Marco exterior ceremonial de madera de nogal */}
      <mesh position={[0, 0, -0.003]}>
        <planeGeometry args={[panelWidth + 0.08, panelHeight + 0.08]} />
        <meshBasicMaterial color="#5c381e" />
      </mesh>

      {/* 2. Bisel perimetral de oro bruñido */}
      <mesh position={[0, 0, -0.002]}>
        <planeGeometry args={[panelWidth + 0.03, panelHeight + 0.03]} />
        <meshBasicMaterial color="#c69214" />
      </mesh>

      {/* 3. Superficie principal de Cantera Clara */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[panelWidth, panelHeight]} />
        <meshBasicMaterial color="#faf6eb" transparent opacity={0.98} />
      </mesh>

      {/* 4. Rombos protectores Tsikuri en las 4 esquinas */}
      <group position={[0, 0, 0.004]}>
        <TsikuriDiamond
          size={0.110}
          position={[-panelWidth / 2 + 0.110, panelHeight / 2 - 0.110, 0]}
          colors={['#c69214', UNIFIED_ICON_COLOR, '#ffffff']}
        />
        <TsikuriDiamond
          size={0.110}
          position={[panelWidth / 2 - 0.110, panelHeight / 2 - 0.110, 0]}
          colors={['#c69214', UNIFIED_ICON_COLOR, '#ffffff']}
        />
        <TsikuriDiamond
          size={0.110}
          position={[-panelWidth / 2 + 0.110, -panelHeight / 2 + 0.110, 0]}
          colors={['#c69214', UNIFIED_ICON_COLOR, '#ffffff']}
        />
        <TsikuriDiamond
          size={0.110}
          position={[panelWidth / 2 - 0.110, -panelHeight / 2 + 0.110, 0]}
          colors={['#c69214', UNIFIED_ICON_COLOR, '#ffffff']}
        />
      </group>

      {/* Línea divisoria vertical sutil entre columna izquierda y derecha */}
      <mesh position={[-panelWidth / 2 + panelWidth / 3, 0, 0.002]}>
        <planeGeometry args={[0.006, panelHeight * 0.90]} />
        <meshBasicMaterial color="#d4af37" transparent opacity={0.7} />
      </mesh>

      {/* ===================================================================== */}
      {/* COLUMNA IZQUIERDA (1/3 DEL PANEL): FOTOGRAFÍA DE LA OBRA              */}
      {/* ===================================================================== */}
      <group position={[leftColX, 0, 0.005]}>
        {/* Marco de nogal para la foto */}
        <mesh position={[0, 0.12, 0.001]}>
          <planeGeometry args={[1.96, 2.68]} />
          <meshBasicMaterial color="#5c381e" />
        </mesh>
        {/* Marco dorado para la foto */}
        <mesh position={[0, 0.12, 0.002]}>
          <planeGeometry args={[1.92, 2.64]} />
          <meshBasicMaterial color="#c69214" />
        </mesh>

        {/* Fotografía de la obra con textura oficial */}
        <group position={[0, 0.12, 0]}>
          <ArtworkPhoto url={artwork.image} width={1.88} height={2.60} />
        </group>

        {/* Placa identificadora de la categoría */}
        <group position={[0, -1.35, 0]}>
          <mesh position={[0, 0, 0.001]}>
            <planeGeometry args={[1.88, 0.22]} />
            <meshBasicMaterial color="#f4ebd8" />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[1.92, 0.26]} />
            <meshBasicMaterial color="#c69214" />
          </mesh>
          <Text
            position={[0, 0, 0.003]}
            fontSize={0.088}
            color="#78350f"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.04}
          >
            {artwork.category?.toUpperCase() || 'PATRIMONIO CULTURAL'}
          </Text>
        </group>
      </group>

      {/* ===================================================================== */}
      {/* COLUMNA DERECHA (2/3 DEL PANEL): INFORMACIÓN Y DESCRIPCIÓN           */}
      {/* ===================================================================== */}
      <group position={[rightColX, 0, 0.005]}>
        {/* Botón Badge de Cierre con cruz en la esquina superior derecha */}
        <BadgeCloseButton
          id="btn-close-artwork-modal"
          size={0.34}
          position={[rightColWidth / 2 - 0.20, 1.40, 0]}
          onClick={onClose}
          registerMesh={registerMesh}
          unregisterMesh={unregisterMesh}
          hoveredId={hoveredId}
          fuseProgress={fuseProgress}
        />

        {/* Título Principal Monumental de la Obra */}
        <group position={[0, 1.15, 0]}>
          <Text
            position={[0, 0.08, 0]}
            fontSize={0.210}
            color="#1c1917"
            anchorX="center"
            anchorY="middle"
            maxWidth={rightColWidth * 0.88}
            textAlign="center"
          >
            {artwork.title}
          </Text>

          <Text
            position={[0, -0.11, 0]}
            fontSize={0.110}
            color="#78350f"
            anchorX="center"
            anchorY="middle"
            maxWidth={rightColWidth * 0.90}
            textAlign="center"
          >
            {artwork.nativeName}
          </Text>

          <Text
            position={[0, -0.22, 0]}
            fontSize={0.092}
            color="#78350f"
            anchorX="center"
            anchorY="middle"
            maxWidth={rightColWidth * 0.92}
            textAlign="center"
          >
            {artwork.subtitle}
          </Text>

          {/* Línea divisoria dorada */}
          <mesh position={[0, -0.30, 0]}>
            <planeGeometry args={[rightColWidth * 0.96, 0.006]} />
            <meshBasicMaterial color="#d4af37" />
          </mesh>
        </group>

        {/* Palabras Clave y Atributos Sagrados en Tipografía Grande */}
        <group position={[0, 0.28, 0]}>
          {(artwork.keywords || []).map((keyword, idx) => (
            <Text
              key={idx}
              position={[0, 0.12 - idx * 0.22, 0]}
              fontSize={0.125}
              color="#1c1917"
              anchorX="center"
              anchorY="middle"
              maxWidth={rightColWidth * 0.94}
              textAlign="center"
              lineHeight={1.35}
            >
              {keyword}
            </Text>
          ))}
        </group>

        {/* Síntesis Cultural en Cédula de Cantera */}
        <group position={[0, -0.78, 0]}>
          <mesh position={[0, 0, -0.001]}>
            <planeGeometry args={[rightColWidth * 0.96, 0.85]} />
            <meshBasicMaterial color="#f4ebd8" />
          </mesh>
          <mesh position={[0, 0, -0.002]}>
            <planeGeometry args={[rightColWidth * 0.96 + 0.03, 0.88]} />
            <meshBasicMaterial color="#c69214" transparent opacity={0.85} />
          </mesh>

          <Text
            position={[0, 0.02, 0.002]}
            fontSize={0.102}
            color="#1c1917"
            anchorX="center"
            anchorY="middle"
            maxWidth={rightColWidth * 0.90}
            textAlign="center"
            lineHeight={1.42}
          >
            {artwork.description}
          </Text>
        </group>

        {/* Cédula de Fuente Antropológica */}
        <group position={[0, -1.40, 0]}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.080}
            color="#78350f"
            anchorX="center"
            anchorY="middle"
            maxWidth={rightColWidth * 0.90}
            textAlign="center"
          >
            Fuente: Etnografía Sagrada Wixárika · Instituto Nacional de Antropología e Historia (INAH)
          </Text>
        </group>
      </group>
    </group>
  );
}

export default WixarikaArtworkModal;
