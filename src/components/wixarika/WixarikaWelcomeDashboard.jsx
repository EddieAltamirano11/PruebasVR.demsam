import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Text } from '@react-three/drei';
import { SoundFX } from '../../services/audioService.js';
import { TsikuriDiamond } from './TsikuriDiamond.jsx';
import { LucideVRIcon } from './LucideVRIcon.jsx';
import { WixarikaVRButton } from './WixarikaVRButton.jsx';
import { WixarikaVRVideoPlayer } from './WixarikaVRVideoPlayer.jsx';
import { DEFAULT_WIXARIKA_VIDEOS } from './WixarikaVRVideoPanel.jsx';
import { DEFAULT_WIXARIKA_BOOKS } from './WixarikaVRBookPanel.jsx';

// Color unificado ceremonial para TODOS los iconos del menú principal
const UNIFIED_ICON_COLOR = '#b45309';

// Estaciones culturales oficiales para navegación integrada dentro del menú principal
export const DEFAULT_CULTURAL_STATIONS = [
  {
    id: 'deidades',
    name: 'Pabellón de Deidades',
    subtitle: 'Cosmovisión y Panteón Sagrado',
    iconName: 'sun',
    bullets: [
      '• Tatewari: Abuelo Fuego Sagrado y Testigo Ancestral',
      '• Tayau: Padre Sol y Fuerza Creadora del Universo',
      '• Kauyumari: Venado Azul y Guía Espiritual del Mara\'akame'
    ],
    description: '• Tatewari: Abuelo Fuego Sagrado\n• Tayau: Padre Sol y Fuerza Creadora\n• Kauyumari: Venado Azul y Guía Espiritual'
  },
  {
    id: 'gastronomia',
    name: 'Pabellón Gastronómico',
    subtitle: 'Alimentos Tradicionales de Nayarit',
    iconName: 'utensils',
    bullets: [
      '• Maíz Criollo Sagrado y Tortillas Ceremoniales de Comal',
      '• Caldo de Toro Sagrado y Tamales Totomoxtle de la Sierra',
      '• Tejuino Ritual Fermentado y Perruri de Semillas Tostadas'
    ],
    description: '• Maíz Criollo Sagrado y Tortillas de Comal\n• Caldo de Toro Ceremonial y Tamales Totomoxtle\n• Tejuino Ritual y Perruri de Semillas'
  },
  {
    id: 'fiestas',
    name: 'Pabellón de Fiestas y Ritos',
    subtitle: 'Ceremonias de la Sierra',
    iconName: 'sparkles',
    bullets: [
      '• Fiesta del Tambor: Protección y Consagración de la Niñez',
      '• Tatei Neixa: Danza de Bendición de los Primeros Frutos',
      '• Hikuri Neixa: Danza Sagrada del Peyote en el Kalihuey'
    ],
    description: '• Fiesta del Tambor: Protección de la Niñez\n• Tatei Neixa: Bendición de Primeros Frutos\n• Hikuri Neixa: Danza Sagrada del Peyote'
  }
];

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
  width = 1.80,
  height = 0.88,
  iconSize = 0.26,
  titleSize = 0.125,
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

  // Colores claros inspirados en cantera de Tepic y oro ceremonial (cero negros)
  const bgIdle = '#fbf7ee';
  const bgHover = '#f3ebd6';
  const currentBg = isHovered ? bgHover : bgIdle;
  const borderColor = isHovered ? accentColor : '#d4af37';

  // Centrado vertical amplio de icono y título
  const iconY = 0.140;
  const titleY = -0.175;

  return (
    <group position={position}>
      {/* Marco de oro bruñido exterior */}
      <mesh position={[0, 0, -0.001]}>
        <planeGeometry args={[width + 0.030, height + 0.030]} />
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
          size={0.055}
          position={[-width / 2 + 0.055, height / 2 - 0.055, 0]}
          colors={['#d4af37', accentColor, '#ffffff']}
        />
        <TsikuriDiamond
          size={0.055}
          position={[width / 2 - 0.055, height / 2 - 0.055, 0]}
          colors={['#d4af37', accentColor, '#ffffff']}
        />
        <TsikuriDiamond
          size={0.055}
          position={[-width / 2 + 0.055, -height / 2 + 0.055, 0]}
          colors={['#d4af37', accentColor, '#ffffff']}
        />
        <TsikuriDiamond
          size={0.055}
          position={[width / 2 - 0.055, -height / 2 + 0.055, 0]}
          colors={['#d4af37', accentColor, '#ffffff']}
        />
      </group>

      {/* Barra de progreso de Gaze Fuse */}
      {isHovered && fuseProgress > 0 && (
        <group position={[0, -height / 2 + 0.026, 0.005]}>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[width * 0.90, 0.024]} />
            <meshBasicMaterial color="#e7dec8" />
          </mesh>
          <mesh
            position={[-((width * 0.90) * (1 - fuseProgress)) / 2, 0, 0.001]}
            scale={[fuseProgress, 1, 1]}
          >
            <planeGeometry args={[width * 0.90, 0.022]} />
            <meshBasicMaterial color={accentColor} />
          </mesh>
        </group>
      )}

      {/* Icono Lucide vectorial nítido en alta resolución */}
      <LucideVRIcon
        name={iconName}
        size={iconSize}
        color={accentColor}
        position={[0, iconY, 0.004]}
        strokeWidth={2.6}
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
 * WixarikaWelcomeDashboard - Menú Principal Flotante Único del Museo
 * Ubicado en el cuadrante Sur (+Z) del Kalihuey Sagrado.
 * Ahora actúa como el ÚNICO menú flotante del museo: todas las salas, videos y libros
 * se exploran dentro de su superficie con sub-vistas modulares y botón de retorno.
 * Elevado ergonómicamente a Y = 2.30m y situado más atrás a Z = 3.75m con escala monumental 6.40m × 3.50m.
 */
export function WixarikaWelcomeDashboard({
  position = [0, 2.30, 3.75],
  rotation = [0, Math.PI, 0],
  initialView = 'home',
  stations = DEFAULT_CULTURAL_STATIONS,
  videos = DEFAULT_WIXARIKA_VIDEOS,
  books: _books = DEFAULT_WIXARIKA_BOOKS,
  onToggleAudio,
  onRecenter: _onRecenter,
  onSelectStation,
  registerMesh,
  unregisterMesh,
  hoveredId,
  fuseProgress = 0
}) {
  // Dimensiones monumentales y ergonómicas que aprovechan todo el espacio frontal
  const panelWidth = 6.40;
  const panelHeight = 3.50;

  // Estado de navegación interna: 'home' | 'deidades' | 'gastronomia' | 'fiestas' | 'videos' | 'books'
  const [currentView, setCurrentView] = useState(initialView);
  const [activeStationId, setActiveStationId] = useState(null);
  const [isAudioActive, setIsAudioActive] = useState(false);

  // Estados para sub-vista de videos
  const [videoIndex, setVideoIndex] = useState(0);
  const [videoQuality, setVideoQuality] = useState('720p');
  const [videoCinemaMode, setVideoCinemaMode] = useState(false);

  const currentVideo = videos[videoIndex] || videos[0];
  const totalVideos = videos.length;

  const activeStation = useMemo(() => {
    return (
      stations.find((s) => s.id === currentView || s.id === activeStationId) || stations[0]
    );
  }, [stations, currentView, activeStationId]);

  const handleToggleAudio = useCallback(() => {
    SoundFX.playClick();
    setIsAudioActive((prev) => !prev);
    if (onToggleAudio) onToggleAudio();
  }, [onToggleAudio]);

  const handlePrevVideo = useCallback(() => {
    SoundFX.playClick();
    setVideoIndex((prev) => (prev - 1 + totalVideos) % totalVideos);
  }, [totalVideos]);

  const handleNextVideo = useCallback(() => {
    SoundFX.playClick();
    setVideoIndex((prev) => (prev + 1) % totalVideos);
  }, [totalVideos]);

  const handleReturnHome = useCallback(() => {
    SoundFX.playClick();
    setCurrentView('home');
    onSelectStation?.('home');
  }, [onSelectStation]);

  return (
    <group position={position} rotation={rotation}>
      {/* 1. Marco exterior de madera de nogal ceremonial */}
      <mesh position={[0, 0, -0.003]}>
        <planeGeometry args={[panelWidth + 0.08, panelHeight + 0.08]} />
        <meshBasicMaterial color="#5c381e" />
      </mesh>

      {/* 2. Bisel perimetral de oro bruñido */}
      <mesh position={[0, 0, -0.002]}>
        <planeGeometry args={[panelWidth + 0.03, panelHeight + 0.03]} />
        <meshBasicMaterial color="#c69214" />
      </mesh>

      {/* 3. Superficie principal de Cantera Clara / Marfil */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[panelWidth, panelHeight]} />
        <meshBasicMaterial color="#faf6eb" transparent opacity={0.97} />
      </mesh>

      {/* 4. Rombos protectores Tsikuri en las 4 esquinas del panel monumental */}
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

      {/* ===================================================================== */}
      {/* VISTA A: MENÚ PRINCIPAL DE BIENVENIDA (HOME)                         */}
      {/* ===================================================================== */}
      {currentView === 'home' && (
        <group position={[0, 0, 0.005]}>
          {/* Cabecera Monumental del Dashboard */}
          <group position={[0, 1.25, 0]}>
            <LucideVRIcon
              name="compass"
              size={0.26}
              color={UNIFIED_ICON_COLOR}
              position={[0, 0.22, 0]}
              strokeWidth={2.6}
            />

            <Text
              position={[0, 0.00, 0]}
              fontSize={0.210}
              color="#1c1917"
              anchorX="center"
              anchorY="middle"
              maxWidth={panelWidth * 0.94}
              textAlign="center"
            >
              MUSEO VIRTUAL WIXÁRIKA
            </Text>

            <Text
              position={[0, -0.16, 0]}
              fontSize={0.125}
              color="#78350f"
              anchorX="center"
              anchorY="middle"
              maxWidth={panelWidth * 0.94}
              textAlign="center"
            >
              BIBLIOTECA SOLÓN ARGÜELLO
            </Text>
          </group>

          {/* Fila 1: Servicios y Catálogos Culturales */}
          <group position={[0, 0.22, 0]}>
            <DashboardTile
              key="btn-dash-books"
              id="btn-dash-books"
              title="Libros Recomendados"
              iconName="book-open"
              accentColor={UNIFIED_ICON_COLOR}
              width={1.80}
              height={0.88}
              iconSize={0.26}
              titleSize={0.125}
              position={[-1.95, 0, 0]}
              onClick={() => setCurrentView('books')}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
            />

            <DashboardTile
              key="btn-dash-audio"
              id="btn-dash-audio"
              title={isAudioActive ? 'Audio: Activo' : 'Audio Cultural'}
              iconName={isAudioActive ? 'volume-2' : 'volume-x'}
              accentColor={UNIFIED_ICON_COLOR}
              width={1.80}
              height={0.88}
              iconSize={0.26}
              titleSize={0.125}
              position={[0, 0, 0]}
              onClick={handleToggleAudio}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
            />

            <DashboardTile
              key="btn-dash-videos"
              id="btn-dash-videos"
              title="Videos Culturales"
              iconName="video"
              accentColor={UNIFIED_ICON_COLOR}
              width={1.80}
              height={0.88}
              iconSize={0.26}
              titleSize={0.125}
              position={[1.95, 0, 0]}
              onClick={() => setCurrentView('videos')}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
            />
          </group>

          {/* Fila 2: Salas Cardinales (Apertura directa dentro del menú) */}
          <group position={[0, -0.78, 0]}>
            <DashboardTile
              key="btn-dash-deidades"
              id="btn-dash-deidades"
              title="Deidades"
              iconName="sun"
              accentColor={UNIFIED_ICON_COLOR}
              width={1.80}
              height={0.88}
              iconSize={0.26}
              titleSize={0.125}
              position={[-1.95, 0, 0]}
              onClick={() => {
                setActiveStationId('deidades');
                onSelectStation?.('deidades');
              }}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
            />

            <DashboardTile
              key="btn-dash-gastronomia"
              id="btn-dash-gastronomia"
              title="Gastronomía Tradicional"
              iconName="utensils"
              accentColor={UNIFIED_ICON_COLOR}
              width={1.80}
              height={0.88}
              iconSize={0.26}
              titleSize={0.125}
              position={[0, 0, 0]}
              onClick={() => {
                setActiveStationId('gastronomia');
                onSelectStation?.('gastronomia');
              }}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
            />

            <DashboardTile
              key="btn-dash-fiestas"
              id="btn-dash-fiestas"
              title="Fiestas y Ceremonias"
              iconName="sparkles"
              accentColor={UNIFIED_ICON_COLOR}
              width={1.80}
              height={0.88}
              iconSize={0.26}
              titleSize={0.125}
              position={[1.95, 0, 0]}
              onClick={() => {
                setActiveStationId('fiestas');
                onSelectStation?.('fiestas');
              }}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
            />
          </group>

          {/* Pie de página con guía de interacción por mirada */}
          <group position={[0, -1.48, 0]}>
            <group position={[-1.95, 0, 0]}>
              <LucideVRIcon
                name="eye"
                size={0.110}
                color={UNIFIED_ICON_COLOR}
                position={[0, 0, 0.002]}
                strokeWidth={2.4}
              />
            </group>
            <Text
              position={[0.10, 0, 0]}
              fontSize={0.092}
              color="#78350f"
              anchorX="center"
              anchorY="middle"
              maxWidth={panelWidth * 0.88}
              textAlign="center"
            >
              Fija tu mirada durante 3 segundos o pulsa para explorar cada sección
            </Text>
          </group>
        </group>
      )}

      {/* ===================================================================== */}
      {/* VISTA B: SALAS CULTURALES (DEIDADES, GASTRONOMÍA, FIESTAS)            */}
      {/* ===================================================================== */}
      {(currentView === 'deidades' ||
        currentView === 'gastronomia' ||
        currentView === 'fiestas') && (
        <group position={[0, 0, 0.005]}>
          {/* Barra Superior con botón Volver al Menú y acceso a Libros */}
          <group position={[0, 1.40, 0]}>
            <WixarikaVRButton
              id="btn-station-back-top"
              label="Volver al Menú"
              iconName="arrow-left"
              variant="cantera"
              width={1.60}
              height={0.26}
              position={[-2.20, 0, 0]}
              onClick={handleReturnHome}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />

            <WixarikaVRButton
              id="btn-station-open-books-top"
              label="Libros de esta Sala"
              iconName="book-open"
              variant="cantera"
              width={1.80}
              height={0.26}
              position={[2.10, 0, 0]}
              onClick={() => setCurrentView('books')}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />
          </group>

          {/* Encabezado del Pabellón Cultural */}
          <group position={[0, 0.90, 0]}>
            <LucideVRIcon
              name={activeStation.iconName || 'sun'}
              size={0.26}
              color={UNIFIED_ICON_COLOR}
              position={[0, 0.18, 0]}
              strokeWidth={2.6}
            />

            <Text
              position={[0, -0.02, 0]}
              fontSize={0.190}
              color="#1c1917"
              anchorX="center"
              anchorY="middle"
              maxWidth={panelWidth * 0.90}
              textAlign="center"
            >
              {activeStation.name}
            </Text>

            <Text
              position={[0, -0.15, 0]}
              fontSize={0.108}
              color="#78350f"
              anchorX="center"
              anchorY="middle"
              maxWidth={panelWidth * 0.90}
              textAlign="center"
            >
              {activeStation.subtitle}
            </Text>

            <mesh position={[0, -0.25, 0]}>
              <planeGeometry args={[panelWidth * 0.92, 0.006]} />
              <meshBasicMaterial color="#d4af37" />
            </mesh>
          </group>

          {/* Palabras Clave y Contenido en Tipografía Maximizada */}
          <group position={[0, 0.05, 0]}>
            {(activeStation.bullets || activeStation.description?.split('\n') || []).map(
              (bullet, idx) => (
                <Text
                  key={idx}
                  position={[0, 0.22 - idx * 0.26, 0]}
                  fontSize={0.125}
                  color="#1c1917"
                  anchorX="center"
                  anchorY="middle"
                  maxWidth={panelWidth * 0.88}
                  textAlign="center"
                  lineHeight={1.45}
                >
                  {bullet}
                </Text>
              )
            )}
          </group>

          {/* Cédula de Identidad y Sede Cultural */}
          <group position={[0, -0.72, 0]}>
            <mesh position={[0, 0, -0.001]}>
              <planeGeometry args={[4.80, 0.22]} />
              <meshBasicMaterial color="#f4ebd8" />
            </mesh>
            <mesh position={[0, 0, -0.002]}>
              <planeGeometry args={[4.84, 0.26]} />
              <meshBasicMaterial color="#c69214" transparent opacity={0.8} />
            </mesh>
            <Text
              position={[0, 0, 0.001]}
              fontSize={0.096}
              color="#78350f"
              anchorX="center"
              anchorY="middle"
              maxWidth={4.60}
              textAlign="center"
            >
              Sede: Biblioteca Solón Argüello · Acervo y Tradición Oral Wixárika
            </Text>
          </group>

          {/* Botones de Acción al Pie de la Sala */}
          <group position={[0, -1.30, 0]}>
            <WixarikaVRButton
              id="btn-station-books-bottom"
              label="Ver Libros de la Sala"
              iconName="book-open"
              variant="cantera"
              width={2.25}
              height={0.30}
              position={[-1.30, 0, 0]}
              onClick={() => setCurrentView('books')}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
            />

            <WixarikaVRButton
              id="btn-station-return-home"
              label="Volver al Menú Principal"
              iconName="arrow-left"
              variant="cantera"
              width={2.25}
              height={0.30}
              position={[1.30, 0, 0]}
              onClick={handleReturnHome}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
            />
          </group>
        </group>
      )}

      {/* ===================================================================== */}
      {/* VISTA C: LIBROS RECOMENDADOS (ACTUALMENTE VACÍA)                     */}
      {/* ===================================================================== */}
      {currentView === 'books' && (
        <group position={[0, 0, 0.005]}>
          {/* Barra Superior con botón Volver al Menú */}
          <group position={[0, 1.40, 0]}>
            <WixarikaVRButton
              id="btn-books-back-top"
              label="Volver al Menú"
              iconName="arrow-left"
              variant="cantera"
              width={1.60}
              height={0.26}
              position={[-2.20, 0, 0]}
              onClick={handleReturnHome}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />

            <Text
              position={[0.20, 0.02, 0]}
              fontSize={0.145}
              color="#1c1917"
              anchorX="center"
              anchorY="middle"
            >
              LIBROS RECOMENDADOS · BIBLIOTECA SOLÓN ARGÜELLO
            </Text>

            <mesh position={[0, -0.16, 0]}>
              <planeGeometry args={[panelWidth * 0.92, 0.006]} />
              <meshBasicMaterial color="#d4af37" />
            </mesh>
          </group>

          {/* Sub-vista de libros recomendados (vacía según especificación) */}

          {/* Botón Inferior para Volver al Menú Principal */}
          <group position={[0, -1.35, 0]}>
            <WixarikaVRButton
              id="btn-books-return-home"
              label="Volver al Menú Principal"
              iconName="arrow-left"
              variant="cantera"
              width={2.40}
              height={0.30}
              position={[0, 0, 0]}
              onClick={handleReturnHome}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
            />
          </group>
        </group>
      )}

      {/* ===================================================================== */}
      {/* VISTA D: SALA AUDIOVISUAL Y VIDEOS DOCUMENTALES                      */}
      {/* ===================================================================== */}
      {currentView === 'videos' && (
        <group position={[0, 0, 0.005]}>
          {/* Barra Superior con botón Volver al Menú (solo flecha <-) */}
          <group position={[0, 1.50, 0]}>
            <WixarikaVRButton
              id="btn-videos-back-top"
              iconName="arrow-left"
              variant="cantera"
              width={0.42}
              height={0.26}
              position={[-2.75, 0, 0]}
              onClick={handleReturnHome}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />

            <Text
              position={[0, 0.02, 0]}
              fontSize={0.145}
              color="#1c1917"
              anchorX="center"
              anchorY="middle"
            >
              SALA AUDIOVISUAL · BIBLIOTECA SOLÓN ARGÜELLO
            </Text>

            <mesh position={[0, -0.15, 0]}>
              <planeGeometry args={[panelWidth * 0.92, 0.006]} />
              <meshBasicMaterial color="#d4af37" />
            </mesh>
          </group>

          {/* Selector de Videos: Anterior, Video X de Y, Siguiente con amplia separación */}
          <group position={[0, 1.20, 0]}>
            <WixarikaVRButton
              id="btn-dash-video-prev"
              label="Anterior"
              iconName="chevron-left"
              variant="cantera"
              width={1.05}
              height={0.22}
              position={[-1.95, 0, 0]}
              onClick={handlePrevVideo}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />

            <group position={[0, 0, 0]}>
              <mesh position={[0, 0, -0.001]}>
                <planeGeometry args={[2.30, 0.22]} />
                <meshBasicMaterial color="#f4ebd8" />
              </mesh>
              <Text
                position={[0, 0, 0.001]}
                fontSize={0.115}
                color="#1c1917"
                anchorX="center"
                anchorY="middle"
              >
                {`Video ${videoIndex + 1} de ${totalVideos}`}
              </Text>
            </group>

            <WixarikaVRButton
              id="btn-dash-video-next"
              label="Siguiente"
              iconName="chevron-right"
              variant="cantera"
              width={1.05}
              height={0.22}
              position={[1.95, 0, 0]}
              onClick={handleNextVideo}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />
          </group>

          {/* Reproductor de Video 3D Integrado (descendido a Y=-0.22 para evitar cualquier solapamiento) */}
          {currentVideo && (
            <group position={[0, -0.22, 0]}>
              <WixarikaVRVideoPlayer
                video={currentVideo}
                quality={videoQuality}
                onQualityChange={setVideoQuality}
                cinemaMode={videoCinemaMode}
                onToggleCinemaMode={() => setVideoCinemaMode((p) => !p)}
                registerMesh={registerMesh}
                unregisterMesh={unregisterMesh}
                hoveredId={hoveredId}
                fuseProgress={fuseProgress}
              />
            </group>
          )}
        </group>
      )}
    </group>
  );
}

export default WixarikaWelcomeDashboard;
