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
    id: 'video-tambor',
    title: 'Nuestras Raíces «Nayarit: Ceremonia Wixarika del tambor»',
    director: 'Nuestras Raíces (YouTube)',
    category: 'Documental',
    badge: 'REFERENCIA EN VIDEO',
    duration: '03:26',
    poster: './videos/tambor_poster.jpg',
    sources: {
      '720p': './videos/tambor_720p.mp4',
      '480p': './videos/tambor_480p.mp4'
    },
    youtube: 'https://youtu.be/inUzeIlj9P0',
    synopsis: 'Registro de la ceremonia wixárika del tambor en Nayarit, de la serie «Nuestras Raíces».'
  },
  {
    id: 'video-ojo-de-dios',
    title: 'Los Wixárika, un pueblo lleno de magia que conserva tradiciones ancestrales: ¿Qué es el ojo de Dios?',
    director: 'YouTube',
    category: 'Reportaje',
    badge: 'REFERENCIA EN VIDEO',
    duration: '03:22',
    poster: DEFAULT_VIDEO_POSTER,
    sources: { ...DEFAULT_VIDEO_SOURCES },
    youtube: 'https://youtu.be/zR0z1gkvVHA',
    synopsis: 'Reportaje sobre el pueblo wixárika, sus tradiciones ancestrales y el significado del ojo de Dios (tsikuri).'
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
      width={3.65}
      height={2.35}
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
      <group position={[0, 0.78, 0.01]}>
        <WixarikaVRButton
          id="btn-video-prev"
          label="Anterior"
          iconName="chevron-left"
          variant="cantera"
          width={0.88}
          height={0.18}
          position={[-1.32, 0, 0]}
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
            <planeGeometry args={[1.65, 0.18]} />
            <meshBasicMaterial color="#f4ebd8" transparent opacity={0.95} />
          </mesh>
          <Text
            position={[0, 0.035, 0.002]}
            fontSize={0.082}
            color="#1c1917"
            anchorX="center"
            anchorY="middle"
          >
            {`Documental ${currentIndex + 1} de ${totalVideos}`}
          </Text>
          <Text
            position={[0, -0.040, 0.002]}
            fontSize={0.070}
            color="#78350f"
            anchorX="center"
            anchorY="middle"
            maxWidth={1.55}
          >
            {`${currentVideo?.category || 'Acervo Cultural'} · ${currentVideo?.duration || '03:22'}`}
          </Text>
        </group>

        <WixarikaVRButton
          id="btn-video-next"
          label="Siguiente"
          iconName="chevron-right"
          variant="cantera"
          width={0.88}
          height={0.18}
          position={[1.32, 0, 0]}
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
