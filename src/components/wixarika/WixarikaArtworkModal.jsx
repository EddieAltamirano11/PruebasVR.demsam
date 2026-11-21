import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { SoundFX } from '../../services/audioService.js';
import { TsikuriDiamond } from './TsikuriDiamond.jsx';
import { LucideVRIcon } from './LucideVRIcon.jsx';
import { BadgeCloseButton } from './BadgeCloseButton.jsx';

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
 * WixarikaArtworkModal - Ventana Monumental para Cuadros de Deidades y Fiestas
 * Dimensiones exactas al menú principal: 6.40m × 3.50m.
 *
 * Estricta distribución en dos columnas:
 * - 1/3 Izquierda (~2.13m): Fotografía de la obra a gran escala con marco ceremonial
 *   y placa inferior con el alias sagrado de la deidad o fiesta.
 * - 2/3 Derecha (~4.27m):
 *   1. Encabezado con título monumental (nombre una sola vez) y subtítulo ceremonial.
 *   2. Recuadro de descripción amplio (arriba de las viñetas) con tipografía maximizada 1.6x para VR.
 *   3. Viñetas de atributos alineadas a la izquierda (debajo del recuadro) en letra grande.
 *   4. Cero texto de bibliografía/fuente para aprovechar todo el espacio vertical.
 * - Fondo sólido de cantera clara con marco de nogal y bisel de oro (side: DoubleSide).
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
  // Dimensiones ajustadas: espacio vertical reducido 15% (2.975m) y horizontal aumentado 10% (7.04m)
  const panelWidth = 7.04;
  const panelHeight = 2.975;
  const bgMeshRef = useRef();

  // Registro del fondo del modal como bloqueador visual y de raycast
  useEffect(() => {
    const mesh = bgMeshRef.current;
    if (mesh) {
      mesh.userData = {
        id: 'artwork-modal-backdrop-blocker',
        isBlocker: true,
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

  // Distribución horizontal: 8% adicional para la imagen (izq) y 2% adicional para el texto (der)
  // Ancho original izq: 6.40/3 = 2.133m + 8% (0.512m) = 2.645m
  // Ancho original der: 6.40*2/3 = 4.267m + 2% (0.128m) = 4.395m
  const leftColWidth = (6.40 / 3) + (6.40 * 0.08); // 2.645m
  const rightColWidth = (6.40 * 2 / 3) + (6.40 * 0.02); // 4.395m

  const leftColX = -panelWidth / 2 + leftColWidth / 2; // -3.52 + 1.3225 = -2.1975m
  const dividerX = -panelWidth / 2 + leftColWidth; // -3.52 + 2.645 = -0.875m
  const rightColX = dividerX + rightColWidth / 2; // -0.875 + 2.1975 = +1.3225m

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
      <mesh position={[dividerX, 0, 0.002]}>
        <planeGeometry args={[0.008, panelHeight * 0.90]} />
        <meshBasicMaterial color="#d4af37" side={THREE.DoubleSide} />
      </mesh>

      {/* ===================================================================== */}
      {/* COLUMNA IZQUIERDA: FOTOGRAFÍA DE LA OBRA MAXIMIZADA                   */}
      {/* ===================================================================== */}
      <group position={[leftColX, 0, 0.005]}>
        {/* Marco de nogal para la foto */}
        <mesh position={[0, 0, 0.001]}>
          <planeGeometry args={[2.46, 2.46]} />
          <meshBasicMaterial color="#5c381e" side={THREE.DoubleSide} />
        </mesh>
        {/* Marco dorado para la foto */}
        <mesh position={[0, 0, 0.002]}>
          <planeGeometry args={[2.42, 2.42]} />
          <meshBasicMaterial color="#c69214" side={THREE.DoubleSide} />
        </mesh>

        {/* Fotografía de la obra con textura oficial del cuadro (orientada al derecho) */}
        <group position={[0, 0, 0]}>
          <ArtworkPhoto
            texture={artwork.texture}
            url={artwork.image}
            width={2.38}
            height={2.38}
          />
        </group>
      </group>

      {/* ===================================================================== */}
      {/* COLUMNA DERECHA: INFORMACIÓN, SUBTÍTULO ALIAS Y DESCRIPCIÓN CONCISA   */}
      {/* ===================================================================== */}
      <group position={[rightColX, 0, 0.005]}>
        {/* Botón Badge de Cierre con cruz 'x' en la esquina superior derecha */}
        <BadgeCloseButton
          id="btn-close-artwork-modal"
          size={0.36}
          position={[rightColWidth / 2 - 0.22, panelHeight / 2 - 0.22, 0.01]}
          onClick={onClose}
          registerMesh={registerMesh}
          unregisterMesh={unregisterMesh}
          hoveredId={hoveredId}
          fuseProgress={fuseProgress}
        />

        {/* 1. Encabezado Superior: Título y Subtítulo con el Alias (ej. "HERMANO MAYOR VENADO AZUL") */}
        <group position={[0, 0, 0]}>
          <Text
            position={[0, 1.05, 0]}
            fontSize={0.270}
            color="#1c1917"
            anchorX="center"
            anchorY="top"
            maxWidth={rightColWidth * 0.86}
            textAlign="center"
          >
            {artwork.title}
          </Text>

          {/* Subtítulo: Texto del alias que antes iba debajo de la foto */}
          <Text
            position={[0, 0.68, 0]}
            fontSize={0.145}
            color="#78350f"
            anchorX="center"
            anchorY="top"
            maxWidth={rightColWidth * 0.90}
            textAlign="center"
            letterSpacing={0.03}
            lineHeight={1.25}
          >
            {(artwork.alias || artwork.category || 'PATRIMONIO CULTURAL').toUpperCase()}
          </Text>

          {/* Línea divisoria dorada ceremonial debajo del subtítulo */}
          <mesh position={[0, 0.46, 0]}>
            <planeGeometry args={[rightColWidth * 0.94, 0.008]} />
            <meshBasicMaterial color="#d4af37" side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* 2. Recuadro de Descripción (mantiene tamaño del contenedor con letra maximizada de máx 4 líneas) */}
        <group position={[0, -0.32, 0]}>
          <mesh position={[0, 0, -0.001]}>
            <planeGeometry args={[rightColWidth * 0.94, 1.24]} />
            <meshBasicMaterial color="#f4ebd8" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0, -0.002]}>
            <planeGeometry args={[rightColWidth * 0.94 + 0.03, 1.27]} />
            <meshBasicMaterial color="#c69214" side={THREE.DoubleSide} />
          </mesh>

          <Text
            position={[-rightColWidth * 0.43, 0, 0.002]}
            fontSize={0.175}
            color="#1c1917"
            anchorX="left"
            anchorY="middle"
            maxWidth={rightColWidth * 0.86}
            textAlign="left"
            lineHeight={1.40}
          >
            {artwork.description}
          </Text>
        </group>
      </group>
    </group>
  );
}

export default WixarikaArtworkModal;
