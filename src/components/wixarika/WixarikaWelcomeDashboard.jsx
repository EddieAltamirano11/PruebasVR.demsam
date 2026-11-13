import React, { useRef, useEffect, useCallback } from 'react';
import { Text } from '@react-three/drei';
import { SoundFX } from '../../services/audioService.js';
import { TsikuriDiamond } from './TsikuriDiamond.jsx';
import { LucideVRIcon } from './LucideVRIcon.jsx';

// Color unificado ceremonial para TODOS los iconos del menú principal
const UNIFIED_ICON_COLOR = '#b45309';

/**
 * Botón interactivo para el Dashboard con fondo claro de cantera,
 * icono vectorial Lucide unificado y soporte completo para Gaze Fuse (1.2s) y clics.
 * Dimensiones ampliadas horizontal y verticalmente con tipografía maximizada para VR.
 */
function DashboardTile({
  id,
  title,
  iconName,
  accentColor = UNIFIED_ICON_COLOR,
  width = 1.30,
  height = 0.72,
  iconSize = 0.20,
  titleSize = 0.102,
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
    try {
      SoundFX.playClick();
    } catch (_err) {
      // Audio playback best-effort
    }
    if (onClick) onClick();
  };

  const handlePointerOver = (e) => {
    e.stopPropagation?.();
    try {
      SoundFX.playHover();
    } catch (_err) {
      // Audio playback best-effort
    }
  };

  // Colores claros inspirados en cantera de Tepic y oro ceremonial
  const bgIdle = '#fbf7ee';
  const bgHover = '#f3ebd6';
  const currentBg = isHovered ? bgHover : bgIdle;
  const borderColor = isHovered ? accentColor : '#d4af37';

  // Centrado vertical amplio de icono y título
  const iconY = 0.115;
  const titleY = -0.145;

  return (
    <group position={position}>
      {/* Marco de oro bruñido exterior */}
      <mesh position={[0, 0, -0.001]}>
        <planeGeometry args={[width + 0.024, height + 0.024]} />
        <meshBasicMaterial color={borderColor} />
      </mesh>

      {/* Superficie de cantera clara (colisionador raycaster) */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        position={[0, 0, 0]}
      >
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color={currentBg} />
      </mesh>

      {/* Rombos protectores Tsikuri en esquinas */}
      <group position={[0, 0, 0.003]}>
        <TsikuriDiamond
          size={0.045}
          position={[-width / 2 + 0.045, height / 2 - 0.045, 0]}
          colors={['#d4af37', accentColor, '#ffffff']}
        />
        <TsikuriDiamond
          size={0.045}
          position={[width / 2 - 0.045, height / 2 - 0.045, 0]}
          colors={['#d4af37', accentColor, '#ffffff']}
        />
        <TsikuriDiamond
          size={0.045}
          position={[-width / 2 + 0.045, -height / 2 + 0.045, 0]}
          colors={['#d4af37', accentColor, '#ffffff']}
        />
        <TsikuriDiamond
          size={0.045}
          position={[width / 2 - 0.045, -height / 2 + 0.045, 0]}
          colors={['#d4af37', accentColor, '#ffffff']}
        />
      </group>

      {/* Barra de progreso de Gaze Fuse */}
      {isHovered && fuseProgress > 0 && (
        <group position={[0, -height / 2 + 0.022, 0.005]}>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[width * 0.90, 0.022]} />
            <meshBasicMaterial color="#e7dec8" />
          </mesh>
          <mesh
            position={[-((width * 0.90) * (1 - fuseProgress)) / 2, 0, 0.001]}
            scale={[fuseProgress, 1, 1]}
          >
            <planeGeometry args={[width * 0.90, 0.020]} />
            <meshBasicMaterial color={accentColor} />
          </mesh>
        </group>
      )}

      {/* Icono Lucide vectorial nítido (color unificado) */}
      <LucideVRIcon
        name={iconName}
        size={iconSize}
        color={accentColor}
        position={[0, iconY, 0.004]}
        strokeWidth={2.4}
      />

      {/* Título de la opción en carbón oscuro con tamaño amplio para legibilidad VR */}
      <Text
        position={[0, titleY, 0.005]}
        fontSize={titleSize}
        color="#1c1917"
        anchorX="center"
        anchorY="middle"
        maxWidth={width * 0.92}
        textAlign="center"
        lineHeight={1.12}
      >
        {title}
      </Text>
    </group>
  );
}

/**
 * WixarikaWelcomeDashboard - Dashboard Central de Bienvenida
 * Ubicado en el cuadrante Sur (+Z) del Kalihuey Sagrado.
 * Espacio horizontal y vertical maximizado para total claridad en visores VR.
 * Todos los iconos emplean un único color unificado y cero emojis.
 */
export function WixarikaWelcomeDashboard({
  position = [0, 1.48, 1.95],
  rotation = [0, Math.PI, 0],
  onSelectStation,
  _onOpenBooks,
  onToggleAudio,
  onOpenVideos,
  onRecenter,
  registerMesh,
  unregisterMesh,
  hoveredId,
  fuseProgress = 0,
  _onMinimize
}) {
  // Dimensiones ampliadas horizontal y verticalmente para aprovechar el espacio VR
  const panelWidth = 4.40;
  const panelHeight = 2.70;

  const handleSelectDeidades = useCallback(() => {
    if (onSelectStation) onSelectStation('deidades');
  }, [onSelectStation]);

  const handleSelectGastronomia = useCallback(() => {
    if (onSelectStation) onSelectStation('gastronomia');
  }, [onSelectStation]);

  const handleSelectFiestas = useCallback(() => {
    if (onSelectStation) onSelectStation('fiestas');
  }, [onSelectStation]);

  return (
    <group position={position} rotation={rotation}>
      {/* 1. Marco exterior de madera de nogal ceremonial */}
      <mesh position={[0, 0, -0.003]}>
        <planeGeometry args={[panelWidth + 0.06, panelHeight + 0.06]} />
        <meshBasicMaterial color="#5c381e" />
      </mesh>

      {/* 2. Bisel perimetral de oro bruñido */}
      <mesh position={[0, 0, -0.002]}>
        <planeGeometry args={[panelWidth + 0.024, panelHeight + 0.024]} />
        <meshBasicMaterial color="#c69214" />
      </mesh>

      {/* 3. Superficie principal de Cantera Clara / Marfil */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[panelWidth, panelHeight]} />
        <meshBasicMaterial color="#faf6eb" transparent opacity={0.97} />
      </mesh>

      {/* 4. Rombos protectores Tsikuri en las 4 esquinas del panel mayor */}
      <group position={[0, 0, 0.004]}>
        <TsikuriDiamond
          size={0.085}
          position={[-panelWidth / 2 + 0.085, panelHeight / 2 - 0.085, 0]}
          colors={['#c69214', UNIFIED_ICON_COLOR, '#ffffff']}
        />
        <TsikuriDiamond
          size={0.085}
          position={[panelWidth / 2 - 0.085, panelHeight / 2 - 0.085, 0]}
          colors={['#c69214', UNIFIED_ICON_COLOR, '#ffffff']}
        />
        <TsikuriDiamond
          size={0.085}
          position={[-panelWidth / 2 + 0.085, -panelHeight / 2 + 0.085, 0]}
          colors={['#c69214', UNIFIED_ICON_COLOR, '#ffffff']}
        />
        <TsikuriDiamond
          size={0.085}
          position={[panelWidth / 2 - 0.085, -panelHeight / 2 + 0.085, 0]}
          colors={['#c69214', UNIFIED_ICON_COLOR, '#ffffff']}
        />
      </group>

      {/* 5. Cabecera del Dashboard con tipografía ampliada para lectura VR */}
      <group position={[0, 0.92, 0.005]}>
        {/* Icono Lucide Compass centrado (color unificado) */}
        <LucideVRIcon
          name="compass"
          size={0.20}
          color={UNIFIED_ICON_COLOR}
          position={[0, 0.180, 0]}
          strokeWidth={2.6}
        />

        {/* Título Principal de gran tamaño */}
        <Text
          position={[0, 0.015, 0]}
          fontSize={0.160}
          color="#1c1917"
          anchorX="center"
          anchorY="middle"
          maxWidth={panelWidth * 0.94}
          textAlign="center"
        >
          MUSEO VIRTUAL WIXÁRIKA
        </Text>

        {/* Subtítulo institucional en tamaño legible */}
        <Text
          position={[0, -0.110, 0]}
          fontSize={0.082}
          color="#78350f"
          anchorX="center"
          anchorY="middle"
          maxWidth={panelWidth * 0.94}
          textAlign="center"
        >
          PORTAL CEREMONIAL Y GUÍA DEL VISITANTE · BIBLIOTECA SOLÓN ARGÜELLO
        </Text>

        {/* Lema de bienvenida en Wixárika */}
        <Text
          position={[0, -0.198, 0]}
          fontSize={0.072}
          color="#a16207"
          anchorX="center"
          anchorY="middle"
          maxWidth={panelWidth * 0.94}
          textAlign="center"
        >
          «Taikiyari xanepu» · Bienvenidos al Kalihuey Sagrado
        </Text>

        {/* Línea divisoria dorada */}
        <mesh position={[0, -0.260, 0]}>
          <planeGeometry args={[panelWidth * 0.94, 0.006]} />
          <meshBasicMaterial color="#d4af37" />
        </mesh>
      </group>

      {/* 6. Primera Fila: Servicios y Herramientas Culturales (Espaciado horizontal amplio) */}
      <group position={[0, 0.18, 0.005]}>
        {/* Opción A: Recentrar Visor VR */}
        <DashboardTile
          key="btn-dash-recenter"
          id="btn-dash-recenter"
          title="Recentrar Visor"
          iconName="rotate-ccw"
          accentColor={UNIFIED_ICON_COLOR}
          width={1.30}
          height={0.72}
          iconSize={0.20}
          titleSize={0.102}
          position={[-1.38, 0, 0]}
          onClick={onRecenter}
          registerMesh={registerMesh}
          unregisterMesh={unregisterMesh}
          hoveredId={hoveredId}
          fuseProgress={fuseProgress}
        />

        {/* Opción B: Audio cultural tradicional */}
        <DashboardTile
          key="btn-dash-audio"
          id="btn-dash-audio"
          title="Audio Cultural"
          iconName="volume-2"
          accentColor={UNIFIED_ICON_COLOR}
          width={1.30}
          height={0.72}
          iconSize={0.20}
          titleSize={0.102}
          position={[0, 0, 0]}
          onClick={onToggleAudio}
          registerMesh={registerMesh}
          unregisterMesh={unregisterMesh}
          hoveredId={hoveredId}
          fuseProgress={fuseProgress}
        />

        {/* Opción C: Videos Culturales */}
        <DashboardTile
          key="btn-dash-videos"
          id="btn-dash-videos"
          title="Videos Culturales"
          iconName="video"
          accentColor={UNIFIED_ICON_COLOR}
          width={1.30}
          height={0.72}
          iconSize={0.20}
          titleSize={0.102}
          position={[1.38, 0, 0]}
          onClick={onOpenVideos}
          registerMesh={registerMesh}
          unregisterMesh={unregisterMesh}
          hoveredId={hoveredId}
          fuseProgress={fuseProgress}
        />
      </group>

      {/* 7. Segunda Fila: Salas y Pabellones Cardinales (Deidades, Gastronomía, Fiestas) */}
      <group position={[0, -0.62, 0.005]}>
        {/* Pabellón 1: Deidades (Norte) */}
        <DashboardTile
          key="btn-dash-deidades"
          id="btn-dash-deidades"
          title="Panteón de Deidades"
          iconName="sun"
          accentColor={UNIFIED_ICON_COLOR}
          width={1.30}
          height={0.72}
          iconSize={0.20}
          titleSize={0.102}
          position={[-1.38, 0, 0]}
          onClick={handleSelectDeidades}
          registerMesh={registerMesh}
          unregisterMesh={unregisterMesh}
          hoveredId={hoveredId}
          fuseProgress={fuseProgress}
        />

        {/* Pabellón 2: Gastronomía (Este) */}
        <DashboardTile
          key="btn-dash-gastronomia"
          id="btn-dash-gastronomia"
          title="Gastronomía Tradicional"
          iconName="utensils"
          accentColor={UNIFIED_ICON_COLOR}
          width={1.30}
          height={0.72}
          iconSize={0.20}
          titleSize={0.102}
          position={[0, 0, 0]}
          onClick={handleSelectGastronomia}
          registerMesh={registerMesh}
          unregisterMesh={unregisterMesh}
          hoveredId={hoveredId}
          fuseProgress={fuseProgress}
        />

        {/* Pabellón 3: Fiestas (Oeste) */}
        <DashboardTile
          key="btn-dash-fiestas"
          id="btn-dash-fiestas"
          title="Fiestas y Ceremonias"
          iconName="sparkles"
          accentColor={UNIFIED_ICON_COLOR}
          width={1.30}
          height={0.72}
          iconSize={0.20}
          titleSize={0.102}
          position={[1.38, 0, 0]}
          onClick={handleSelectFiestas}
          registerMesh={registerMesh}
          unregisterMesh={unregisterMesh}
          hoveredId={hoveredId}
          fuseProgress={fuseProgress}
        />
      </group>

      {/* 8. Pie de página y guía rápida (usando icono Lucide eye en vez de emojis o glifos raros) */}
      <group position={[0, -1.16, 0.005]}>
        <group position={[-1.40, 0, 0]}>
          <LucideVRIcon
            name="eye"
            size={0.090}
            color={UNIFIED_ICON_COLOR}
            position={[0, 0, 0.002]}
            strokeWidth={2.4}
          />
        </group>
        <Text
          position={[0.08, 0, 0]}
          fontSize={0.074}
          color="#44403c"
          anchorX="center"
          anchorY="middle"
          maxWidth={panelWidth * 0.88}
          textAlign="center"
        >
          Fija tu mirada durante 1.2 segundos o pulsa para explorar cada sala
        </Text>
      </group>
    </group>
  );
}

export default WixarikaWelcomeDashboard;
