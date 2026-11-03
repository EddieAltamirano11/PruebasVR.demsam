import React, { useState } from 'react';
import { Text } from '@react-three/drei';
import { WixarikaVRFloatingPanel } from './WixarikaVRFloatingPanel.jsx';
import { WixarikaVRCard } from './WixarikaVRCard.jsx';
import { WixarikaVRButton } from './WixarikaVRButton.jsx';
import { SoundFX } from '../../services/audioService.js';

/**
 * Catálogo de documentales y videos culturales de la cultura Wixárika
 * de la Biblioteca Pública Profesor Solón Argüello (Tepic, Nayarit).
 */
export const DEFAULT_WIXARIKA_VIDEOS = [
  {
    id: 'video-1',
    title: 'El Fuego Sagrado y la Ruta a Wirikuta',
    director: 'Archivo Audiovisual Solón Argüello & INPI',
    category: 'Documental Ceremonial',
    badge: 'DISPONIBLE EN SALA',
    duration: '18 min · 4K',
    year: '2023',
    synopsis: 'Peregrinación testimonial del pueblo Wixárika hacia el desierto sagrado de Wirikuta. Registra las oraciones nocturnas dirigidas a Tatewari y la comunión espiritual con la naturaleza.'
  },
  {
    id: 'video-2',
    title: 'Tatei Neixa: La Fiesta del Maíz Tierno',
    director: 'Etnógrafos de la Sierra del Nayar',
    category: 'Ciclo Ritual',
    badge: 'ACERVO HISTÓRICO',
    duration: '14 min · HD',
    year: '2022',
    synopsis: 'Bendición de infantes y primeros elotes en el Kalihuey comunitario. Los niños danzan guiados por el Mara\'akame al ritmo del tepu ancestral y las sonajas ceremoniales.'
  },
  {
    id: 'video-3',
    title: 'Sabores del Nayar: Cocina y Maíz Ancestral',
    director: 'Colectivo Etnobotánico de Nayarit',
    category: 'Patrimonio Culinario',
    badge: 'SERIE PATRIMONIAL',
    duration: '12 min · 4K',
    year: '2024',
    synopsis: 'Elaboración tradicional del perruri, el caldo ceremonial de toro y los atoles curativos con granos de maíz criollo de cuatro colores cultivados en la sierra nayarita.'
  },
  {
    id: 'video-4',
    title: 'El Vuelo del Águila y la Chaquira Sagrada',
    director: 'Artesanos Unidos de Santa Catarina',
    category: 'Arte y Simbolismo',
    badge: 'COLECCIÓN TALLER',
    duration: '15 min · HD',
    year: '2023',
    synopsis: 'Maestros artesanos descifran la iconografía de las jícaras rukuri y tablas de estambre: el venado Kauyumari, el peyote florecido y la protección cósmica del tsikuri.'
  }
];

/**
 * WixarikaVRVideoPanel - Panel 3D de Videos Documentales en VR
 * Diseñado en cantera clara sin emojis para fomento audiovisual cultural.
 */
export function WixarikaVRVideoPanel({
  videos = DEFAULT_WIXARIKA_VIDEOS,
  initialVideoId,
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

  const [playbackActive, setPlaybackActive] = useState(false);

  const currentVideo = videos[currentIndex] || videos[0];
  const totalVideos = videos.length;

  const handlePrev = () => {
    const nextIdx = (currentIndex - 1 + totalVideos) % totalVideos;
    setCurrentIndex(nextIdx);
    setPlaybackActive(false);
    SoundFX.playClick();
    onSelectVideo?.(videos[nextIdx]);
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % totalVideos;
    setCurrentIndex(nextIdx);
    setPlaybackActive(false);
    SoundFX.playClick();
    onSelectVideo?.(videos[nextIdx]);
  };

  const handlePlayToggle = () => {
    setPlaybackActive(!playbackActive);
    SoundFX.playClick();
  };

  return (
    <WixarikaVRFloatingPanel
      title="SALA AUDIOVISUAL · BIBLIOTECA SOLÓN ARGÜELLO"
      subtitle="Acervo Documental de la Cultura Wixárika y del Estado de Nayarit"
      width={2.65}
      height={2.10}
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
      {/* 1. Barra de Navegación de Videos */}
      <group position={[0, 0.70, 0.01]}>
        <WixarikaVRButton
          id="btn-video-prev"
          label="Anterior"
          iconName="chevron-left"
          variant="cantera"
          width={0.62}
          height={0.14}
          position={[-0.92, 0, 0]}
          onClick={handlePrev}
          onRegister={onRegister}
          onUnregister={onUnregister}
          registerMesh={registerMesh}
          unregisterMesh={unregisterMesh}
          hoveredId={hoveredId}
          fuseProgress={fuseProgress}
          showDiamonds={false}
        />

        {/* Indicador de Video Actual */}
        <group position={[0, 0, 0]}>
          <mesh position={[0, 0, -0.001]}>
            <planeGeometry args={[0.92, 0.13]} />
            <meshBasicMaterial color="#f4ebd8" transparent opacity={0.95} />
          </mesh>
          <Text
            position={[0, 0.022, 0.002]}
            fontSize={0.046}
            color="#1c1917"
            anchorX="center"
            anchorY="middle"
          >
            {`Documental ${currentIndex + 1} de ${totalVideos}`}
          </Text>
          <Text
            position={[0, -0.028, 0.002]}
            fontSize={0.030}
            color="#78350f"
            anchorX="center"
            anchorY="middle"
          >
            {`Duración: ${currentVideo?.duration || '15 min'}`}
          </Text>
        </group>

        <WixarikaVRButton
          id="btn-video-next"
          label="Siguiente"
          iconName="chevron-right"
          variant="cantera"
          width={0.62}
          height={0.14}
          position={[0.92, 0, 0]}
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

      {/* 2. Tarjeta 3D del Documental Seleccionado */}
      {currentVideo && (
        <group position={[0, -0.15, 0.01]}>
          <WixarikaVRCard
            title={currentVideo.title}
            subtitle={`Producción: ${currentVideo.director} (${currentVideo.year})`}
            category={currentVideo.category}
            badge={currentVideo.badge}
            description={currentVideo.synopsis}
            metadata={[
              { label: 'Formato y Calidad', value: currentVideo.duration },
              {
                label: 'Estado de Reproducción',
                value: playbackActive
                  ? 'Reproduciendo en pantalla inmersiva de sala...'
                  : 'Listo para proyectar en visor'
              }
            ]}
            actions={[
              {
                id: 'btn-video-play-toggle',
                label: playbackActive ? 'Detener Video' : 'Reproducir Video',
                iconName: playbackActive ? 'x' : 'play',
                variant: 'cantera',
                onClick: handlePlayToggle
              }
            ]}
            width={2.40}
            height={1.22}
            variant="cantera"
            onRegister={onRegister}
            onUnregister={onUnregister}
            registerMesh={registerMesh}
            unregisterMesh={unregisterMesh}
            hoveredId={hoveredId}
            fuseProgress={fuseProgress}
          />
        </group>
      )}
    </WixarikaVRFloatingPanel>
  );
}

export default WixarikaVRVideoPanel;
