import React, { useState, useCallback } from 'react';
import { Text } from '@react-three/drei';
import { WixarikaVRFloatingPanel } from './WixarikaVRFloatingPanel.jsx';
import { WixarikaVRButton } from './WixarikaVRButton.jsx';
import { WixarikaVRVideoPlayer } from './WixarikaVRVideoPlayer.jsx';
import { SoundFX } from '../../services/audioService.js';
import {
  DEFAULT_VIDEO_SOURCES,
  DEFAULT_VIDEO_POSTER,
  getDefaultVideoQuality
} from '../../services/videoService.js';

/**
 * Catálogo de documentales y videos culturales de la cultura Wixárika
 * de la Biblioteca Pública Profesor Solón Argüello (Tepic, Nayarit).
 */
export const DEFAULT_WIXARIKA_VIDEOS = [
  {
    id: 'video-1',
    title: 'Ceremonia y Fuego Sagrado en el Kalihuey',
    director: 'Archivo Audiovisual Solón Argüello & INPI',
    category: 'Documental Ceremonial',
    badge: 'ACERVO CULTURAL',
    duration: '03:22',
    year: '2024',
    poster: DEFAULT_VIDEO_POSTER,
    sources: { ...DEFAULT_VIDEO_SOURCES },
    synopsis:
      'Peregrinación y cantos ceremoniales alrededor del fuego sagrado Tatewari dentro del Kalihuey comunitario Wixárika.'
  },
  {
    id: 'video-2',
    title: 'Tatei Neixa: La Fiesta del Maíz Tierno',
    director: 'Etnógrafos de la Sierra del Nayar',
    category: 'Ciclo Ritual',
    badge: 'ACERVO HISTÓRICO',
    duration: '03:22',
    year: '2022',
    poster: DEFAULT_VIDEO_POSTER,
    sources: { ...DEFAULT_VIDEO_SOURCES },
    synopsis:
      'Bendición de infantes y primeros elotes en el Kalihuey comunitario. Los niños danzan guiados por el Mara\'akame al ritmo del tepu ancestral y las sonajas ceremoniales.'
  },
  {
    id: 'video-3',
    title: 'Sabores del Nayar: Cocina y Maíz Ancestral',
    director: 'Colectivo Etnobotánico de Nayarit',
    category: 'Patrimonio Culinario',
    badge: 'SERIE PATRIMONIAL',
    duration: '03:22',
    year: '2024',
    poster: DEFAULT_VIDEO_POSTER,
    sources: { ...DEFAULT_VIDEO_SOURCES },
    synopsis:
      'Elaboración tradicional del perruri, el caldo ceremonial de toro y los atoles curativos con granos de maíz criollo de cuatro colores cultivados en la sierra nayarita.'
  },
  {
    id: 'video-4',
    title: 'El Vuelo del Águila y la Chaquira Sagrada',
    director: 'Artesanos Unidos de Santa Catarina',
    category: 'Arte y Simbolismo',
    badge: 'COLECCIÓN TALLER',
    duration: '03:22',
    year: '2023',
    poster: DEFAULT_VIDEO_POSTER,
    sources: { ...DEFAULT_VIDEO_SOURCES },
    synopsis:
      'Maestros artesanos descifran la iconografía de las jícaras rukuri y tablas de estambre: el venado Kauyumari, el peyote florecido y la protección cósmica del tsikuri.'
  }
];

/**
 * WixarikaVRVideoPanel - Panel 3D amplio de Videos Documentales en VR.
 * Diseñado en cantera clara con tipografía amplia y legible.
 */
export function WixarikaVRVideoPanel({
  videos = DEFAULT_WIXARIKA_VIDEOS,
  initialVideoId,
  initialQuality,
  onSelectVideo,
  onClose,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  onRegister,
  onUnregister,
  registerMesh,
  unregisterMesh,
  hoveredId,
  fuseProgress = 0
}) {
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (initialVideoId) {
      const idx = videos.findIndex((v) => v.id === initialVideoId);
      if (idx !== -1) return idx;
    }
    return 0;
  });

  const [quality, setQuality] = useState(() => initialQuality || getDefaultVideoQuality());
  const [cinemaMode, setCinemaMode] = useState(false);

  const currentVideo = videos[currentIndex] || videos[0];
  const totalVideos = videos.length;

  const handlePrev = useCallback(() => {
    const nextIdx = (currentIndex - 1 + totalVideos) % totalVideos;
    setCurrentIndex(nextIdx);
    SoundFX.playClick();
    onSelectVideo?.(videos[nextIdx]);
  }, [currentIndex, totalVideos, videos, onSelectVideo]);

  const handleNext = useCallback(() => {
    const nextIdx = (currentIndex + 1) % totalVideos;
    setCurrentIndex(nextIdx);
    SoundFX.playClick();
    onSelectVideo?.(videos[nextIdx]);
  }, [currentIndex, totalVideos, videos, onSelectVideo]);

  const handleToggleCinemaMode = useCallback(() => {
    SoundFX.playClick();
    setCinemaMode((prev) => !prev);
  }, []);

  return (
    <WixarikaVRFloatingPanel
      title="SALA AUDIOVISUAL · BIBLIOTECA SOLÓN ARGÜELLO"
      width={3.45}
      height={2.15}
      position={position}
      rotation={rotation}
      variant="cantera"
      onClose={onClose}
      onRegister={onRegister}
      onUnregister={onUnregister}
      registerMesh={registerMesh}
      unregisterMesh={unregisterMesh}
      hoveredId={hoveredId}
      fuseProgress={fuseProgress}
    >
      {/* 1. Barra de Navegación de Documentales */}
      <group position={[0, 0.71, 0.01]}>
        <WixarikaVRButton
          id="btn-video-prev"
          label="Anterior"
          iconName="chevron-left"
          variant="cantera"
          width={0.78}
          height={0.155}
          position={[-1.19, 0, 0]}
          onClick={handlePrev}
          onRegister={onRegister}
          onUnregister={onUnregister}
          registerMesh={registerMesh}
          unregisterMesh={unregisterMesh}
          hoveredId={hoveredId}
          fuseProgress={fuseProgress}
          showDiamonds={false}
        />

        {/* Indicador de Documental Actual */}
        <group position={[0, 0, 0]}>
          <mesh position={[0, 0, -0.001]}>
            <planeGeometry args={[1.48, 0.15]} />
            <meshBasicMaterial color="#f4ebd8" transparent opacity={0.95} />
          </mesh>
          <Text
            position={[0, 0.028, 0.002]}
            fontSize={0.060}
            color="#1c1917"
            anchorX="center"
            anchorY="middle"
          >
            {`Documental ${currentIndex + 1} de ${totalVideos}`}
          </Text>
          <Text
            position={[0, -0.032, 0.002]}
            fontSize={0.042}
            color="#78350f"
            anchorX="center"
            anchorY="middle"
            maxWidth={1.40}
          >
            {`${currentVideo?.category || 'Acervo Cultural'} · ${currentVideo?.duration || '03:22'}`}
          </Text>
        </group>

        <WixarikaVRButton
          id="btn-video-next"
          label="Siguiente"
          iconName="chevron-right"
          variant="cantera"
          width={0.78}
          height={0.155}
          position={[1.19, 0, 0]}
          onClick={handleNext}
          onRegister={onRegister}
          onUnregister={onUnregister}
          registerMesh={registerMesh}
          unregisterMesh={unregisterMesh}
          hoveredId={hoveredId}
          fuseProgress={fuseProgress}
          showDiamonds={false}
        />
      </group>

      {/* 2. Reproductor 3D y Ficha Cultural */}
      {currentVideo && (
        <WixarikaVRVideoPlayer
          video={currentVideo}
          quality={quality}
          onQualityChange={setQuality}
          cinemaMode={cinemaMode}
          onToggleCinemaMode={handleToggleCinemaMode}
          onRegister={onRegister}
          onUnregister={onUnregister}
          registerMesh={registerMesh}
          unregisterMesh={unregisterMesh}
          hoveredId={hoveredId}
          fuseProgress={fuseProgress}
        />
      )}
    </WixarikaVRFloatingPanel>
  );
}

export default WixarikaVRVideoPanel;
