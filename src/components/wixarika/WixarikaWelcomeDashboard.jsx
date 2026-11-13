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
  width = 1.34,
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
 * WixarikaWelcomeDashboard - Menú Principal Flotante Único del Museo
 * Ubicado en el cuadrante Sur (+Z) del Kalihuey Sagrado.
 * Ahora actúa como el ÚNICO menú flotante del museo: todas las salas, videos y libros
 * se exploran dentro de su superficie con sub-vistas modulares y botón de retorno.
 * Elevado ergonómicamente a Y = 2.15m y alejado del centro a Z = 2.85m con dimensiones ampliadas 5.00m × 2.85m.
 */
export function WixarikaWelcomeDashboard({
  position = [0, 2.15, 2.85],
  rotation = [0, Math.PI, 0],
  initialView = 'home',
  stations = DEFAULT_CULTURAL_STATIONS,
  videos = DEFAULT_WIXARIKA_VIDEOS,
  books = DEFAULT_WIXARIKA_BOOKS,
  onToggleAudio,
  onRecenter,
  registerMesh,
  unregisterMesh,
  hoveredId,
  fuseProgress = 0
}) {
  // Dimensiones monumentales y ergonómicas que aprovechan todo el espacio frontal
  const panelWidth = 5.00;
  const panelHeight = 2.85;

  // Estado de navegación interna: 'home' | 'deidades' | 'gastronomia' | 'fiestas' | 'videos' | 'books'
  const [currentView, setCurrentView] = useState(initialView);
  const [activeStationId, setActiveStationId] = useState(null);
  const [isAudioActive, setIsAudioActive] = useState(false);

  // Estados para sub-vista de libros
  const [bookIndex, setBookIndex] = useState(0);

  // Estados para sub-vista de videos
  const [videoIndex, setVideoIndex] = useState(0);
  const [videoQuality, setVideoQuality] = useState('720p');
  const [videoCinemaMode, setVideoCinemaMode] = useState(false);

  // Libros filtrados por sala activa o catálogo completo
  const filteredBooks = useMemo(() => {
    if (!activeStationId) return books;
    const matches = books.filter(
      (b) => b.stationId === activeStationId || b.themeId === activeStationId
    );
    return matches.length > 0 ? matches : books;
  }, [books, activeStationId]);

  const currentBook = filteredBooks[bookIndex] || filteredBooks[0] || books[0];
  const totalBooks = filteredBooks.length;

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

  const handlePrevBook = useCallback(() => {
    SoundFX.playClick();
    setBookIndex((prev) => (prev - 1 + totalBooks) % totalBooks);
  }, [totalBooks]);

  const handleNextBook = useCallback(() => {
    SoundFX.playClick();
    setBookIndex((prev) => (prev + 1) % totalBooks);
  }, [totalBooks]);

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
  }, []);

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

      {/* 4. Rombos protectores Tsikuri en las 4 esquinas del panel monumental */}
      <group position={[0, 0, 0.004]}>
        <TsikuriDiamond
          size={0.090}
          position={[-panelWidth / 2 + 0.090, panelHeight / 2 - 0.090, 0]}
          colors={['#c69214', UNIFIED_ICON_COLOR, '#ffffff']}
        />
        <TsikuriDiamond
          size={0.090}
          position={[panelWidth / 2 - 0.090, panelHeight / 2 - 0.090, 0]}
          colors={['#c69214', UNIFIED_ICON_COLOR, '#ffffff']}
        />
        <TsikuriDiamond
          size={0.090}
          position={[-panelWidth / 2 + 0.090, -panelHeight / 2 + 0.090, 0]}
          colors={['#c69214', UNIFIED_ICON_COLOR, '#ffffff']}
        />
        <TsikuriDiamond
          size={0.090}
          position={[panelWidth / 2 - 0.090, -panelHeight / 2 + 0.090, 0]}
          colors={['#c69214', UNIFIED_ICON_COLOR, '#ffffff']}
        />
      </group>

      {/* ===================================================================== */}
      {/* VISTA A: MENÚ PRINCIPAL DE BIENVENIDA (HOME)                         */}
      {/* ===================================================================== */}
      {currentView === 'home' && (
        <group position={[0, 0, 0.005]}>
          {/* Cabecera Monumental del Dashboard */}
          <group position={[0, 0.98, 0]}>
            <LucideVRIcon
              name="compass"
              size={0.20}
              color={UNIFIED_ICON_COLOR}
              position={[0, 0.170, 0]}
              strokeWidth={2.6}
            />

            <Text
              position={[0, 0.005, 0]}
              fontSize={0.160}
              color="#1c1917"
              anchorX="center"
              anchorY="middle"
              maxWidth={panelWidth * 0.94}
              textAlign="center"
            >
              MUSEO VIRTUAL WIXÁRIKA
            </Text>

            <Text
              position={[0, -0.115, 0]}
              fontSize={0.082}
              color="#78350f"
              anchorX="center"
              anchorY="middle"
              maxWidth={panelWidth * 0.94}
              textAlign="center"
            >
              PORTAL CEREMONIAL Y GUÍA DEL VISITANTE · BIBLIOTECA SOLÓN ARGÜELLO
            </Text>

            <Text
              position={[0, -0.205, 0]}
              fontSize={0.072}
              color="#a16207"
              anchorX="center"
              anchorY="middle"
              maxWidth={panelWidth * 0.94}
              textAlign="center"
            >
              «Taikiyari xanepu» · Bienvenidos al Kalihuey Sagrado
            </Text>

            <mesh position={[0, -0.265, 0]}>
              <planeGeometry args={[panelWidth * 0.94, 0.006]} />
              <meshBasicMaterial color="#d4af37" />
            </mesh>
          </group>

          {/* Fila 1: Servicios y Catálogos Culturales */}
          <group position={[0, 0.18, 0]}>
            <DashboardTile
              key="btn-dash-recenter"
              id="btn-dash-recenter"
              title="Recentrar Visor"
              iconName="rotate-ccw"
              accentColor={UNIFIED_ICON_COLOR}
              width={1.34}
              height={0.72}
              iconSize={0.20}
              titleSize={0.102}
              position={[-1.45, 0, 0]}
              onClick={onRecenter}
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
              width={1.34}
              height={0.72}
              iconSize={0.20}
              titleSize={0.102}
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
              width={1.34}
              height={0.72}
              iconSize={0.20}
              titleSize={0.102}
              position={[1.45, 0, 0]}
              onClick={() => setCurrentView('videos')}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
            />
          </group>

          {/* Fila 2: Salas Cardinales (Apertura directa dentro del menú) */}
          <group position={[0, -0.62, 0]}>
            <DashboardTile
              key="btn-dash-deidades"
              id="btn-dash-deidades"
              title="Panteón de Deidades"
              iconName="sun"
              accentColor={UNIFIED_ICON_COLOR}
              width={1.34}
              height={0.72}
              iconSize={0.20}
              titleSize={0.102}
              position={[-1.45, 0, 0]}
              onClick={() => {
                setActiveStationId('deidades');
                setCurrentView('deidades');
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
              width={1.34}
              height={0.72}
              iconSize={0.20}
              titleSize={0.102}
              position={[0, 0, 0]}
              onClick={() => {
                setActiveStationId('gastronomia');
                setCurrentView('gastronomia');
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
              width={1.34}
              height={0.72}
              iconSize={0.20}
              titleSize={0.102}
              position={[1.45, 0, 0]}
              onClick={() => {
                setActiveStationId('fiestas');
                setCurrentView('fiestas');
              }}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
            />
          </group>

          {/* Pie de página con guía de interacción por mirada */}
          <group position={[0, -1.20, 0]}>
            <group position={[-1.48, 0, 0]}>
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
              Fija tu mirada durante 1.2 segundos o pulsa para explorar cada sección
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
          <group position={[0, 1.10, 0]}>
            <WixarikaVRButton
              id="btn-station-back-top"
              label="Volver al Menú"
              iconName="arrow-left"
              variant="cantera"
              width={1.25}
              height={0.20}
              position={[-1.70, 0, 0]}
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
              variant="solar"
              width={1.45}
              height={0.20}
              position={[1.60, 0, 0]}
              onClick={() => setCurrentView('books')}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />
          </group>

          {/* Encabezado del Pabellón Cultural */}
          <group position={[0, 0.72, 0]}>
            <LucideVRIcon
              name={activeStation.iconName || 'sun'}
              size={0.19}
              color={UNIFIED_ICON_COLOR}
              position={[0, 0.15, 0]}
              strokeWidth={2.6}
            />

            <Text
              position={[0, -0.015, 0]}
              fontSize={0.145}
              color="#1c1917"
              anchorX="center"
              anchorY="middle"
              maxWidth={panelWidth * 0.90}
              textAlign="center"
            >
              {activeStation.name}
            </Text>

            <Text
              position={[0, -0.130, 0]}
              fontSize={0.082}
              color="#78350f"
              anchorX="center"
              anchorY="middle"
              maxWidth={panelWidth * 0.90}
              textAlign="center"
            >
              {activeStation.subtitle}
            </Text>

            <mesh position={[0, -0.22, 0]}>
              <planeGeometry args={[panelWidth * 0.92, 0.005]} />
              <meshBasicMaterial color="#d4af37" />
            </mesh>
          </group>

          {/* Palabras Clave y Contenido en Tipografía Maximizada */}
          <group position={[0, 0.02, 0]}>
            {(activeStation.bullets || activeStation.description?.split('\n') || []).map(
              (bullet, idx) => (
                <Text
                  key={idx}
                  position={[0, 0.16 - idx * 0.18, 0]}
                  fontSize={0.096}
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
          <group position={[0, -0.58, 0]}>
            <mesh position={[0, 0, -0.001]}>
              <planeGeometry args={[3.80, 0.18]} />
              <meshBasicMaterial color="#f4ebd8" />
            </mesh>
            <mesh position={[0, 0, -0.002]}>
              <planeGeometry args={[3.84, 0.22]} />
              <meshBasicMaterial color="#c69214" transparent opacity={0.8} />
            </mesh>
            <Text
              position={[0, 0, 0.001]}
              fontSize={0.076}
              color="#78350f"
              anchorX="center"
              anchorY="middle"
              maxWidth={3.70}
              textAlign="center"
            >
              Sede: Biblioteca Solón Argüello · Acervo y Tradición Oral Wixárika
            </Text>
          </group>

          {/* Botones de Acción al Pie de la Sala */}
          <group position={[0, -1.02, 0]}>
            <WixarikaVRButton
              id="btn-station-books-bottom"
              label="Ver Libros de la Sala"
              iconName="book-open"
              variant="solar"
              width={1.80}
              height={0.24}
              position={[-1.02, 0, 0]}
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
              width={1.80}
              height={0.24}
              position={[1.02, 0, 0]}
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
      {/* VISTA C: CATÁLOGO DE LIBROS DE LA BIBLIOTECA SOLÓN ARGÜELLO          */}
      {/* ===================================================================== */}
      {currentView === 'books' && (
        <group position={[0, 0, 0.005]}>
          {/* Barra Superior con botón Volver al Menú */}
          <group position={[0, 1.12, 0]}>
            <WixarikaVRButton
              id="btn-books-back-top"
              label="Volver al Menú"
              iconName="arrow-left"
              variant="cantera"
              width={1.25}
              height={0.20}
              position={[-1.70, 0, 0]}
              onClick={handleReturnHome}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />

            <Text
              position={[0.20, 0.02, 0]}
              fontSize={0.115}
              color="#1c1917"
              anchorX="center"
              anchorY="middle"
            >
              LIBROS DE LA BIBLIOTECA SOLÓN ARGÜELLO
            </Text>

            <mesh position={[0, -0.14, 0]}>
              <planeGeometry args={[panelWidth * 0.92, 0.005]} />
              <meshBasicMaterial color="#d4af37" />
            </mesh>
          </group>

          {/* Navegación Anterior / Siguiente entre libros */}
          <group position={[0, 0.72, 0]}>
            <WixarikaVRButton
              id="btn-dash-book-prev"
              label="Anterior"
              iconName="chevron-left"
              variant="cantera"
              width={0.80}
              height={0.18}
              position={[-1.45, 0, 0]}
              onClick={handlePrevBook}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />

            <group position={[0, 0, 0]}>
              <mesh position={[0, 0, -0.001]}>
                <planeGeometry args={[1.50, 0.17]} />
                <meshBasicMaterial color="#f4ebd8" />
              </mesh>
              <Text
                position={[0, 0, 0.001]}
                fontSize={0.078}
                color="#1c1917"
                anchorX="center"
                anchorY="middle"
              >
                {`Libro ${bookIndex + 1} de ${totalBooks}`}
              </Text>
            </group>

            <WixarikaVRButton
              id="btn-dash-book-next"
              label="Siguiente"
              iconName="chevron-right"
              variant="cantera"
              width={0.80}
              height={0.18}
              position={[1.45, 0, 0]}
              onClick={handleNextBook}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />
          </group>

          {/* Ficha Principal del Libro en Tipografía Amplia */}
          {currentBook && (
            <group position={[0, -0.05, 0]}>
              {/* Título de la obra */}
              <Text
                position={[0, 0.28, 0]}
                fontSize={0.098}
                color="#1c1917"
                anchorX="center"
                anchorY="top"
                maxWidth={panelWidth * 0.88}
                textAlign="center"
                lineHeight={1.20}
              >
                {currentBook.title}
              </Text>

              {/* Autor de la obra */}
              <Text
                position={[0, 0.06, 0]}
                fontSize={0.082}
                color="#78350f"
                anchorX="center"
                anchorY="top"
                maxWidth={panelWidth * 0.88}
                textAlign="center"
              >
                {`Autor: ${currentBook.author}`}
              </Text>

              {/* Cota y Signatura Topográfica de la Biblioteca */}
              <group position={[0, -0.22, 0]}>
                <mesh position={[0, 0, -0.001]}>
                  <planeGeometry args={[2.40, 0.20]} />
                  <meshBasicMaterial color="#f4ebd8" />
                </mesh>
                <mesh position={[0, 0, -0.002]}>
                  <planeGeometry args={[2.44, 0.24]} />
                  <meshBasicMaterial color="#d97706" transparent opacity={0.85} />
                </mesh>
                <Text
                  position={[0, 0, 0.001]}
                  fontSize={0.080}
                  color="#1c1917"
                  anchorX="center"
                  anchorY="middle"
                  letterSpacing={0.03}
                >
                  {`Cota física: ${currentBook.code || currentBook.callNumber}`}
                </Text>
              </group>

              {/* Sinopsis del Libro */}
              {currentBook.synopsis && (
                <Text
                  position={[0, -0.52, 0]}
                  fontSize={0.076}
                  color="#292524"
                  anchorX="center"
                  anchorY="top"
                  maxWidth={panelWidth * 0.85}
                  textAlign="center"
                  lineHeight={1.38}
                >
                  {currentBook.synopsis}
                </Text>
              )}
            </group>
          )}

          {/* Botón Inferior para Volver al Menú Principal */}
          <group position={[0, -1.08, 0]}>
            <WixarikaVRButton
              id="btn-books-return-home"
              label="Volver al Menú Principal"
              iconName="arrow-left"
              variant="cantera"
              width={1.90}
              height={0.24}
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
          {/* Barra Superior con botón Volver al Menú */}
          <group position={[0, 1.15, 0]}>
            <WixarikaVRButton
              id="btn-videos-back-top"
              label="Volver al Menú"
              iconName="arrow-left"
              variant="cantera"
              width={1.25}
              height={0.20}
              position={[-1.70, 0, 0]}
              onClick={handleReturnHome}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />

            <Text
              position={[0.20, 0.02, 0]}
              fontSize={0.115}
              color="#1c1917"
              anchorX="center"
              anchorY="middle"
            >
              SALA AUDIOVISUAL · BIBLIOTECA SOLÓN ARGÜELLO
            </Text>

            <mesh position={[0, -0.14, 0]}>
              <planeGeometry args={[panelWidth * 0.92, 0.005]} />
              <meshBasicMaterial color="#d4af37" />
            </mesh>
          </group>

          {/* Selector de Documentales */}
          <group position={[0, 0.82, 0]}>
            <WixarikaVRButton
              id="btn-dash-video-prev"
              label="Anterior"
              iconName="chevron-left"
              variant="cantera"
              width={0.88}
              height={0.18}
              position={[-1.45, 0, 0]}
              onClick={handlePrevVideo}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />

            <group position={[0, 0, 0]}>
              <mesh position={[0, 0, -0.001]}>
                <planeGeometry args={[1.70, 0.18]} />
                <meshBasicMaterial color="#f4ebd8" />
              </mesh>
              <Text
                position={[0, 0.035, 0.001]}
                fontSize={0.082}
                color="#1c1917"
                anchorX="center"
                anchorY="middle"
              >
                {`Documental ${videoIndex + 1} de ${totalVideos}`}
              </Text>
              <Text
                position={[0, -0.040, 0.001]}
                fontSize={0.070}
                color="#78350f"
                anchorX="center"
                anchorY="middle"
                maxWidth={1.60}
              >
                {`${currentVideo?.category || 'Acervo Cultural'} · ${currentVideo?.duration || '03:22'}`}
              </Text>
            </group>

            <WixarikaVRButton
              id="btn-dash-video-next"
              label="Siguiente"
              iconName="chevron-right"
              variant="cantera"
              width={0.88}
              height={0.18}
              position={[1.45, 0, 0]}
              onClick={handleNextVideo}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />
          </group>

          {/* Reproductor de Video 3D Integrado */}
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

          {/* Botón Inferior para Volver al Menú Principal */}
          <group position={[0, -1.18, 0]}>
            <WixarikaVRButton
              id="btn-videos-return-home"
              label="Volver al Menú Principal"
              iconName="arrow-left"
              variant="cantera"
              width={1.90}
              height={0.22}
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
    </group>
  );
}

export default WixarikaWelcomeDashboard;
