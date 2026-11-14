import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { SoundFX } from '../../services/audioService.js';
import { TsikuriDiamond } from './TsikuriDiamond.jsx';
import { LucideVRIcon } from './LucideVRIcon.jsx';

// Color ceremonial unificado para elementos del museo
const UNIFIED_ICON_COLOR = '#b45309';

/**
 * Subcomponente para renderizar la fotografía de la obra.
 * Prioriza la textura directa ya cargada en la escena 3D (artwork.texture);
 * si no está disponible, la carga desde la URL pública oficial.
 * Escala Y=-1 para orientar la imagen al derecho (en glTF las texturas tienen flipY=false).
 */
function ArtworkPhoto({ texture: directTexture, url, width = 1.88, height = 2.60 }) {
  const [loadedTexture, setLoadedTexture] = useState(null);

  useEffect(() => {
    if (directTexture) {
      setLoadedTexture(null);
      return;
    }
    if (!url) return;

    // Normalizar ruta para evitar problemas con rutas relativas
    const cleanUrl = url.startsWith('.') ? url.replace(/^\./, '') : url;
    const loader = new THREE.TextureLoader();
    let isMounted = true;

    loader.load(
      cleanUrl,
      (tex) => {
        if (!isMounted) return;
        tex.flipY = false;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = true;
        tex.anisotropy = 8;
        setLoadedTexture(tex);
      },
      undefined,
      (err) => console.warn('Error cargando fotografía de cuadro:', err)
    );

    return () => {
      isMounted = false;
    };
  }, [directTexture, url]);

  const activeTex = directTexture || loadedTexture;

  return (
    <mesh position={[0, 0, 0.004]} scale={[1, -1, 1]}>
      <planeGeometry args={[width, height]} />
      {activeTex ? (
        <meshBasicMaterial
          map={activeTex}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      ) : (
        <meshBasicMaterial color="#e7dec8" side={THREE.DoubleSide} />
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

/**
 * WixarikaArtworkModal - Ventana Monumental para Cuadros de Deidades y Fiestas
 * Dimensiones exactas al menú principal: 6.40m × 3.50m.
 *
 * Estricta distribución en dos columnas:
 * - 1/3 Izquierda (~2.13m): Fotografía de la obra seleccionada a gran escala al derecho con marco ceremonial.
 * - 2/3 Derecha (~4.27m): Título, subtítulo ceremonial, palabras clave alineadas a la izquierda y
 *   recuadro ampliado con tipografía maximizada para VR.
 * - Fondo sólido e impermeable de cantera clara con marco de nogal y bisel de oro (side: DoubleSide).
 * - Paleta estricta de dos colores tipográficos: #1c1917 (Stone-900) y #78350f (Ámbar sagrado).
 */
export function WixarikaArtworkModal({
  artwork,
  position = [0, 2.25, 0],
  rotation = [0, 0, 0],
  onClose,
  registerMesh,
  unregisterMesh,
  hoveredId,
  fuseProgress = 0
}) {
  const panelWidth = 6.40;
  const panelHeight = 3.50;
  const bgMeshRef = useRef();

  // Registro del fondo del modal como bloqueador visual y de raycast
  useEffect(() => {
    const mesh = bgMeshRef.current;
    if (mesh) {
      mesh.userData = {
        id: 'artwork-modal-backdrop-blocker',
        onClick: () => {},
        onSelect: () => {}
      };
      if (registerMesh) registerMesh(mesh);
    }
    return () => {
      if (mesh && unregisterMesh) unregisterMesh(mesh);
    };
  }, [registerMesh, unregisterMesh]);

  if (!artwork) return null;

  // Centros de cada una de las columnas (1/3 y 2/3)
  const leftColX = -panelWidth / 2 + (panelWidth / 3) / 2; // -3.20 + 1.066 = -2.134m
  const rightColX = -panelWidth / 2 + (panelWidth / 3) + (panelWidth * 2 / 3) / 2; // +1.067m
  const rightColWidth = (panelWidth * 2 / 3) * 0.92; // ~3.92m

  return (
    <group position={position} rotation={rotation}>
      {/* 1. Marco exterior ceremonial de madera de nogal */}
      <mesh position={[0, 0, -0.004]}>
        <planeGeometry args={[panelWidth + 0.08, panelHeight + 0.08]} />
        <meshBasicMaterial color="#5c381e" side={THREE.DoubleSide} />
      </mesh>

      {/* 2. Bisel perimetral de oro bruñido */}
      <mesh position={[0, 0, -0.002]}>
        <planeGeometry args={[panelWidth + 0.03, panelHeight + 0.03]} />
        <meshBasicMaterial color="#c69214" side={THREE.DoubleSide} />
      </mesh>

      {/* 3. Superficie principal sólida e impermeable de Cantera Clara (actúa como bloqueador de raycast) */}
      <mesh ref={bgMeshRef} position={[0, 0, 0]}>
        <planeGeometry args={[panelWidth, panelHeight]} />
        <meshBasicMaterial color="#faf6eb" side={THREE.DoubleSide} />
      </mesh>

      {/* 4. Rombos protectores Tsikuri en las 4 esquinas del panel */}
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

      {/* Línea divisoria vertical ceremonial de oro entre columnas */}
      <mesh position={[-panelWidth / 2 + panelWidth / 3, 0, 0.002]}>
        <planeGeometry args={[0.008, panelHeight * 0.90]} />
        <meshBasicMaterial color="#d4af37" side={THREE.DoubleSide} />
      </mesh>

      {/* ===================================================================== */}
      {/* COLUMNA IZQUIERDA (1/3 DEL PANEL): FOTOGRAFÍA DE LA OBRA              */}
      {/* ===================================================================== */}
      <group position={[leftColX, 0, 0.005]}>
        {/* Marco de nogal para la foto */}
        <mesh position={[0, 0.12, 0.001]}>
          <planeGeometry args={[1.96, 2.68]} />
          <meshBasicMaterial color="#5c381e" side={THREE.DoubleSide} />
        </mesh>
        {/* Marco dorado para la foto */}
        <mesh position={[0, 0.12, 0.002]}>
          <planeGeometry args={[1.92, 2.64]} />
          <meshBasicMaterial color="#c69214" side={THREE.DoubleSide} />
        </mesh>

        {/* Fotografía de la obra con textura oficial del cuadro (orientada al derecho) */}
        <group position={[0, 0.12, 0]}>
          <ArtworkPhoto
            texture={artwork.texture}
            url={artwork.image}
            width={1.88}
            height={2.60}
          />
        </group>

        {/* Placa identificadora de la categoría */}
        <group position={[0, -1.35, 0]}>
          <mesh position={[0, 0, 0.001]}>
            <planeGeometry args={[1.88, 0.24]} />
            <meshBasicMaterial color="#f4ebd8" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[1.92, 0.28]} />
            <meshBasicMaterial color="#c69214" side={THREE.DoubleSide} />
          </mesh>
          <Text
            position={[0, 0, 0.003]}
            fontSize={0.100}
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
        {/* Botón Badge de Cierre con cruz 'x' en la esquina superior derecha */}
        <BadgeCloseButton
          id="btn-close-artwork-modal"
          size={0.34}
          position={[rightColWidth / 2 - 0.20, 1.42, 0]}
          onClick={onClose}
          registerMesh={registerMesh}
          unregisterMesh={unregisterMesh}
          hoveredId={hoveredId}
          fuseProgress={fuseProgress}
        />

        {/* Encabezado: Título Principal Monumental de la Obra */}
        <group position={[0, 1.18, 0]}>
          <Text
            position={[0, 0.08, 0]}
            fontSize={0.280}
            color="#1c1917"
            anchorX="center"
            anchorY="middle"
            maxWidth={rightColWidth * 0.88}
            textAlign="center"
          >
            {artwork.title}
          </Text>

          <Text
            position={[0, -0.13, 0]}
            fontSize={0.140}
            color="#78350f"
            anchorX="center"
            anchorY="middle"
            maxWidth={rightColWidth * 0.90}
            textAlign="center"
          >
            {artwork.nativeName}
          </Text>

          <Text
            position={[0, -0.26, 0]}
            fontSize={0.115}
            color="#78350f"
            anchorX="center"
            anchorY="middle"
            maxWidth={rightColWidth * 0.92}
            textAlign="center"
          >
            {artwork.subtitle}
          </Text>

          {/* Línea divisoria dorada */}
          <mesh position={[0, -0.34, 0]}>
            <planeGeometry args={[rightColWidth * 0.96, 0.008]} />
            <meshBasicMaterial color="#d4af37" side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* Viñetas alineadas estrictamente a la izquierda en tipografía ampliada */}
        <group position={[0, 0.38, 0]}>
          {(artwork.keywords || []).map((keyword, idx) => (
            <Text
              key={idx}
              position={[-rightColWidth * 0.46, 0.16 - idx * 0.22, 0]}
              fontSize={0.155}
              color="#1c1917"
              anchorX="left"
              anchorY="middle"
              maxWidth={rightColWidth * 0.92}
              textAlign="left"
              lineHeight={1.35}
            >
              {keyword}
            </Text>
          ))}
        </group>

        {/* Recuadro de Texto Ampliado con Tipografía Maximizada para VR */}
        <group position={[0, -0.85, 0]}>
          <mesh position={[0, 0, -0.001]}>
            <planeGeometry args={[rightColWidth * 0.98, 1.22]} />
            <meshBasicMaterial color="#f4ebd8" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0, -0.002]}>
            <planeGeometry args={[rightColWidth * 0.98 + 0.03, 1.25]} />
            <meshBasicMaterial color="#c69214" side={THREE.DoubleSide} />
          </mesh>

          <Text
            position={[-rightColWidth * 0.46, 0, 0.002]}
            fontSize={0.150}
            color="#1c1917"
            anchorX="left"
            anchorY="middle"
            maxWidth={rightColWidth * 0.92}
            textAlign="left"
            lineHeight={1.46}
          >
            {artwork.description}
          </Text>
        </group>
      </group>
    </group>
  );
}

export default WixarikaArtworkModal;
