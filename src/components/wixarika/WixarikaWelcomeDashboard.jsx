import React, { useRef, useState, useEffect } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { SoundFX } from '../../services/audioService.js';
import { TsikuriDiamond } from './TsikuriDiamond.jsx';
import { LucideVRIcon } from './LucideVRIcon.jsx';

/**
 * Botón interactivo para el Dashboard con fondo claro de cantera,
 * icono vectorial de Lucide y soporte completo para Gaze Fuse (1.2s) y clics.
 */
function DashboardTile({
  id,
  title,
  subtitle,
  iconName,
  accentColor = '#b45309',
  width = 0.94,
  height = 0.46,
  iconSize = 0.115,
  titleSize = 0.068,
  subtitleSize = 0.046,
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
    } catch (_) {}
    if (onClick) onClick();
  };

  const handlePointerOver = (e) => {
    e.stopPropagation?.();
    try {
      SoundFX.playHover();
    } catch (_) {}
  };

  // Colores claros inspirados en cantera de Tepic y oro ceremonial
  const bgIdle = '#fbf7ee';
  const bgHover = '#f3ebd6';
  const currentBg = isHovered ? bgHover : bgIdle;
  const borderColor = isHovered ? '#b45309' : '#d4af37';

  const halfH = height / 2;
  const iconY = halfH * 0.44;
  const titleY = -halfH * 0.12;
  const subtitleY = -halfH * 0.54;

  return (
    <group position={position}>
      {/* Marco de oro bruñido exterior */}
      <mesh position={[0, 0, -0.001]}>
        <planeGeometry args={[width + 0.016, height + 0.016]} />
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
          size={0.032}
          position={[-width / 2 + 0.032, height / 2 - 0.032, 0]}
          colors={['#d4af37', accentColor, '#ffffff']}
        />
        <TsikuriDiamond
          size={0.032}
          position={[width / 2 - 0.032, height / 2 - 0.032, 0]}
          colors={['#d4af37', accentColor, '#ffffff']}
        />
        <TsikuriDiamond
          size={0.032}
          position={[-width / 2 + 0.032, -height / 2 + 0.032, 0]}
          colors={['#d4af37', accentColor, '#ffffff']}
        />
        <TsikuriDiamond
          size={0.032}
          position={[width / 2 - 0.032, -height / 2 + 0.032, 0]}
          colors={['#d4af37', accentColor, '#ffffff']}
        />
      </group>

      {/* Barra de progreso de Gaze Fuse */}
      {isHovered && fuseProgress > 0 && (
        <group position={[0, -height / 2 + 0.015, 0.005]}>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[width * 0.88, 0.016]} />
            <meshBasicMaterial color="#e7dec8" />
          </mesh>
          <mesh
            position={[-((width * 0.88) * (1 - fuseProgress)) / 2, 0, 0.001]}
            scale={[fuseProgress, 1, 1]}
          >
            <planeGeometry args={[width * 0.88, 0.014]} />
            <meshBasicMaterial color={accentColor} />
          </mesh>
        </group>
      )}

      {/* Icono Lucide vectorial nítido */}
      <LucideVRIcon
        name={iconName}
        size={iconSize}
        color={accentColor}
        position={[0, iconY, 0.004]}
        strokeWidth={2.4}
      />

      {/* Título de la opción en carbón oscuro de gran tamaño */}
      <Text
        position={[0, titleY, 0.005]}
        fontSize={titleSize}
        color="#1c1917"
        anchorX="center"
        anchorY="middle"
        maxWidth={width * 0.90}
        textAlign="center"
      >
        {title}
      </Text>

      {/* Subtítulo descriptivo en tono madera cálida */}
      <Text
        position={[0, subtitleY, 0.005]}
        fontSize={subtitleSize}
        color="#78350f"
        anchorX="center"
        anchorY="middle"
        maxWidth={width * 0.90}
        textAlign="center"
      >
        {subtitle}
      </Text>
    </group>
  );
}

/**
 * WixarikaWelcomeDashboard - Dashboard Central de Bienvenida
 * Ubicado en el cuadrante Sur (+Z) del Kalihuey Sagrado.
 * Estética clara de cantera y madera noble con iconos Lucide y navegación por salas.
 */
export function WixarikaWelcomeDashboard({
  position = [0, 1.48, 2.10],
  rotation = [0, Math.PI, 0],
  onSelectStation,
  onOpenBooks,
  onToggleAudio,
  onRecenter,
  registerMesh,
  unregisterMesh,
  hoveredId,
  fuseProgress = 0,
  onMinimize
}) {
  const panelWidth = 3.20;
  const panelHeight = 1.95;

  return (
    <group position={position} rotation={rotation}>
      {/* 1. Marco exterior de madera de nogal ceremonial */}
      <mesh position={[0, 0, -0.003]}>
        <planeGeometry args={[panelWidth + 0.05, panelHeight + 0.05]} />
        <meshBasicMaterial color="#5c381e" />
      </mesh>

      {/* 2. Bisel perimetral de oro bruñido */}
      <mesh position={[0, 0, -0.002]}>
        <planeGeometry args={[panelWidth + 0.02, panelHeight + 0.02]} />
        <meshBasicMaterial color="#c69214" />
      </mesh>

      {/* 3. Superficie principal de Cantera Clara / Marfil (combina con el museo) */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[panelWidth, panelHeight]} />
        <meshBasicMaterial color="#faf6eb" transparent opacity={0.97} />
      </mesh>

      {/* 4. Rombos protectores Tsikuri en las 4 esquinas del panel mayor */}
      <group position={[0, 0, 0.004]}>
        <TsikuriDiamond
          size={0.065}
          position={[-panelWidth / 2 + 0.065, panelHeight / 2 - 0.065, 0]}
          colors={['#c69214', '#b45309', '#0284c7', '#ffffff']}
        />
        <TsikuriDiamond
          size={0.065}
          position={[panelWidth / 2 - 0.065, panelHeight / 2 - 0.065, 0]}
          colors={['#c69214', '#b45309', '#0284c7', '#ffffff']}
        />
        <TsikuriDiamond
          size={0.065}
          position={[-panelWidth / 2 + 0.065, -panelHeight / 2 + 0.065, 0]}
          colors={['#c69214', '#b45309', '#0284c7', '#ffffff']}
        />
        <TsikuriDiamond
          size={0.065}
          position={[panelWidth / 2 - 0.065, -panelHeight / 2 + 0.065, 0]}
          colors={['#c69214', '#b45309', '#0284c7', '#ffffff']}
        />
      </group>

      {/* 5. Cabecera del Dashboard con tipografía aumentada */}
      <group position={[0, 0.67, 0.005]}>
        {/* Icono Lucide Compass centrado */}
        <LucideVRIcon
          name="compass"
          size={0.12}
          color="#b45309"
          position={[0, 0.135, 0]}
          strokeWidth={2.6}
        />

        {/* Título Principal */}
        <Text
          position={[0, 0.015, 0]}
          fontSize={0.115}
          color="#1c1917"
          anchorX="center"
          anchorY="middle"
          maxWidth={panelWidth * 0.92}
          textAlign="center"
        >
          MUSEO VIRTUAL WIXÁRIKA
        </Text>

        {/* Subtítulo institucional */}
        <Text
          position={[0, -0.085, 0]}
          fontSize={0.050}
          color="#78350f"
          anchorX="center"
          anchorY="middle"
          maxWidth={panelWidth * 0.92}
          textAlign="center"
        >
          PORTAL CEREMONIAL Y GUÍA DEL VISITANTE · BIBLIOTECA SOLÓN ARGÜELLO
        </Text>

        {/* Lema de bienvenida en Wixárika */}
        <Text
          position={[0, -0.150, 0]}
          fontSize={0.044}
          color="#a16207"
          anchorX="center"
          anchorY="middle"
          maxWidth={panelWidth * 0.92}
          textAlign="center"
        >
          «Taikiyari xanepu» · Bienvenidos al Kalihuey Sagrado
        </Text>

        {/* Línea divisoria dorada */}
        <mesh position={[0, -0.195, 0]}>
          <planeGeometry args={[panelWidth * 0.90, 0.005]} />
          <meshBasicMaterial color="#d4af37" />
        </mesh>
      </group>

      {/* 6. Fila Principal: Explorar las 3 Salas / Pabellones Cardinales */}
      <group position={[0, 0.14, 0.005]}>
        {/* Pabellón 1: Deidades (Norte) */}
        <DashboardTile
          id="btn-dash-deidades"
          title="Panteón de Deidades"
          subtitle="Norte · Tatewari, Tayau y Venado"
          iconName="sun"
          accentColor="#b45309"
          width={0.94}
          height={0.48}
          iconSize={0.115}
          titleSize={0.068}
          subtitleSize={0.044}
          position={[-1.00, 0, 0]}
          onClick={() => onSelectStation && onSelectStation('deidades')}
          registerMesh={registerMesh}
          unregisterMesh={unregisterMesh}
          hoveredId={hoveredId}
          fuseProgress={fuseProgress}
        />

        {/* Pabellón 2: Gastronomía (Este) */}
        <DashboardTile
          id="btn-dash-gastronomia"
          title="Gastronomía Tradicional"
          subtitle="Este · Maíz sagrado, tamales y caldo"
          iconName="utensils"
          accentColor="#a16207"
          width={0.94}
          height={0.48}
          iconSize={0.115}
          titleSize={0.068}
          subtitleSize={0.044}
          position={[0, 0, 0]}
          onClick={() => onSelectStation && onSelectStation('gastronomia')}
          registerMesh={registerMesh}
          unregisterMesh={unregisterMesh}
          hoveredId={hoveredId}
          fuseProgress={fuseProgress}
        />

        {/* Pabellón 3: Fiestas (Oeste) */}
        <DashboardTile
          id="btn-dash-fiestas"
          title="Fiestas y Ceremonias"
          subtitle="Oeste · Tambor Tepu, Tatei Neixa"
          iconName="sparkles"
          accentColor="#047857"
          width={0.94}
          height={0.48}
          iconSize={0.115}
          titleSize={0.068}
          subtitleSize={0.044}
          position={[1.00, 0, 0]}
          onClick={() => onSelectStation && onSelectStation('fiestas')}
          registerMesh={registerMesh}
          unregisterMesh={unregisterMesh}
          hoveredId={hoveredId}
          fuseProgress={fuseProgress}
        />
      </group>

      {/* 7. Fila Secundaria: Servicios Culturales y Controles */}
      <group position={[0, -0.42, 0.005]}>
        {/* Opción A: Libros recomendados de la Biblioteca */}
        <DashboardTile
          id="btn-dash-books"
          title="Libros Recomendados"
          subtitle="Catálogo Fomento Lector Solón Argüello"
          iconName="book-open"
          accentColor="#0284c7"
          width={0.94}
          height={0.44}
          iconSize={0.105}
          titleSize={0.064}
          subtitleSize={0.042}
          position={[-1.00, 0, 0]}
          onClick={onOpenBooks}
          registerMesh={registerMesh}
          unregisterMesh={unregisterMesh}
          hoveredId={hoveredId}
          fuseProgress={fuseProgress}
        />

        {/* Opción B: Audio cultural tradicional */}
        <DashboardTile
          id="btn-dash-audio"
          title="Audio Cultural"
          subtitle="Ambiente y Cantos Ceremoniales"
          iconName="volume-2"
          accentColor="#57534e"
          width={0.94}
          height={0.44}
          iconSize={0.105}
          titleSize={0.064}
          subtitleSize={0.042}
          position={[0, 0, 0]}
          onClick={onToggleAudio}
          registerMesh={registerMesh}
          unregisterMesh={unregisterMesh}
          hoveredId={hoveredId}
          fuseProgress={fuseProgress}
        />

        {/* Opción C: Recentrar orientación de la vista */}
        <DashboardTile
          id="btn-dash-recenter"
          title="Recentrar Visor"
          subtitle="Calibrar orientación y mirada VR"
          iconName="rotate-ccw"
          accentColor="#57534e"
          width={0.94}
          height={0.44}
          iconSize={0.105}
          titleSize={0.064}
          subtitleSize={0.042}
          position={[1.00, 0, 0]}
          onClick={onRecenter}
          registerMesh={registerMesh}
          unregisterMesh={unregisterMesh}
          hoveredId={hoveredId}
          fuseProgress={fuseProgress}
        />
      </group>

      {/* 8. Pie de página y guía rápida de interacción */}
      <group position={[0, -0.79, 0.005]}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.046}
          color="#57534e"
          anchorX="center"
          anchorY="middle"
          maxWidth={panelWidth * 0.88}
          textAlign="center"
        >
          ⊙ Fija tu mirada durante 1.2 segundos o pulsa la pantalla / gatillo para explorar cada sala
        </Text>
      </group>
    </group>
  );
}

export default WixarikaWelcomeDashboard;
