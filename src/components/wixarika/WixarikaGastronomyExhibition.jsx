import React, { useState, useEffect, useRef } from 'react';
import { Text } from './VRText.jsx';
import * as THREE from 'three';
import { SoundFX } from '../../services/audioService.js';
import { WIXARIKA_GASTRONOMY_DISHES } from './wixarikaArtworksData.js';
import { TsikuriDiamond } from './TsikuriDiamond.jsx';

/**
 * Cuadro monumental 3D de platillo tradicional Wixárika
 * Diseñado con la misma escala, altura, materialidad y elegancia museográfica
 * que los cuadros de Deidades y Fiestas del Kalihuey
 */
function GastronomyFrame({
  dish,
  position,
  rotation,
  width = 1.45,
  height = 1.15,
  onSelect,
  registerMesh,
  unregisterMesh
}) {
  const meshRef = useRef();
  const [texture, setTexture] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

    if (dish?.image) {
      loader.load(
        dish.image,
        (tex) => {
          if (!isMounted) return;
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.generateMipmaps = true;
          setTexture(tex);
        },
        undefined,
        (err) => console.warn(`[GastronomyFrame] Error cargando imagen ${dish.image}:`, err)
      );
    }

    return () => {
      isMounted = false;
      if (texture) texture.dispose();
    };
  }, [dish?.image]);

  useEffect(() => {
    if (!meshRef.current) return;
    const obj = meshRef.current;
    const handleClick = () => {
      SoundFX.playClick();
      onSelect?.(dish);
    };

    obj.userData = {
      id: `frame-gastro-${dish.id}`,
      artworkId: dish.id,
      artwork: dish,
      onClick: handleClick,
      onSelect: handleClick,
      onPointerEnter: () => setIsHovered(true),
      onPointerLeave: () => setIsHovered(false)
    };

    registerMesh?.(obj);
    return () => {
      unregisterMesh?.(obj);
    };
  }, [dish, onSelect, registerMesh, unregisterMesh]);

  const handleClick = () => {
    SoundFX.playClick();
    onSelect?.(dish);
  };

  return (
    <group position={position} rotation={rotation}>
      {/* 1. Marco exterior monumental de madera oscura tallada (idéntico a deidades) */}
      <mesh position={[0, 0, -0.025]}>
        <boxGeometry args={[width + 0.18, height + 0.18, 0.05]} />
        <meshStandardMaterial
          color={isHovered ? '#b45309' : '#2d1a0e'}
          roughness={0.70}
          metalness={0.12}
        />
      </mesh>

      {/* 2. Filete ceremonial biselado en oro Kauyumari */}
      <mesh position={[0, 0, -0.005]}>
        <boxGeometry args={[width + 0.06, height + 0.06, 0.025]} />
        <meshStandardMaterial
          color={isHovered ? '#ffd700' : '#d4af37'}
          roughness={0.35}
          metalness={0.75}
        />
      </mesh>

      {/* 3. Lienzo con fotografía real del alimento tradicional */}
      <mesh
        ref={meshRef}
        position={[0, 0, 0.010]}
        onClick={handleClick}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
      >
        <planeGeometry args={[width, height]} />
        {texture ? (
          <meshBasicMaterial map={texture} toneMapped={false} />
        ) : (
          <meshBasicMaterial color="#2d1d12" />
        )}
      </mesh>

      {/* 4. Medallones ceremoniales en las 4 esquinas (Turquesa y Oro como en Deidades) */}
      <group position={[0, 0, 0.022]}>
        <TsikuriDiamond
          size={0.062}
          position={[-width / 2 + 0.050, height / 2 - 0.050, 0]}
          colors={['#0284c7', '#d4af37', '#ffffff']}
        />
        <TsikuriDiamond
          size={0.062}
          position={[width / 2 - 0.050, height / 2 - 0.050, 0]}
          colors={['#0284c7', '#d4af37', '#ffffff']}
        />
        <TsikuriDiamond
          size={0.062}
          position={[-width / 2 + 0.050, -height / 2 + 0.050, 0]}
          colors={['#0284c7', '#d4af37', '#ffffff']}
        />
        <TsikuriDiamond
          size={0.062}
          position={[width / 2 - 0.050, -height / 2 + 0.050, 0]}
          colors={['#0284c7', '#d4af37', '#ffffff']}
        />
      </group>

      {/* 5. Luminaria de galería superior (idéntica a luminaria_galeria en Deidades) */}
      <group position={[0, height / 2 + 0.12, 0.15]}>
        {/* Brazo de montaje en oro */}
        <mesh position={[0, -0.04, -0.07]} rotation={[0.45, 0, 0]}>
          <cylinderGeometry args={[0.010, 0.010, 0.16, 12]} />
          <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Cabezal de foco de galería */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.024, 0.024, width * 0.42, 16]} />
          <meshStandardMaterial color="#b45309" roughness={0.35} metalness={0.7} />
        </mesh>
        {/* Difusor luminoso cálido */}
        <mesh position={[0, -0.018, 0]}>
          <planeGeometry args={[width * 0.38, 0.022]} />
          <meshBasicMaterial color="#fffbeb" />
        </mesh>
      </group>

      {/* 6. Placa / Cédula Museográfica institucional debajo del cuadro (como placa_deidad) */}
      <group position={[0, -height / 2 - 0.20, 0.015]}>
        {/* Soporte de madera oscura */}
        <mesh position={[0, 0, -0.004]}>
          <boxGeometry args={[width * 0.88, 0.22, 0.02]} />
          <meshStandardMaterial color="#2d1a0e" roughness={0.7} metalness={0.1} />
        </mesh>
        {/* Filete de oro */}
        <mesh position={[0, 0, 0.007]}>
          <planeGeometry args={[width * 0.84, 0.19]} />
          <meshBasicMaterial color={isHovered ? '#ffd700' : '#d4af37'} />
        </mesh>
        {/* Fondo de cantera beige */}
        <mesh position={[0, 0, 0.009]}>
          <planeGeometry args={[width * 0.81, 0.16]} />
          <meshBasicMaterial color="#f7f3e8" />
        </mesh>

        {/* Título en español */}
        <Text
          position={[0, 0.034, 0.012]}
          fontSize={0.056}
          color="#1c1917"
          anchorX="center"
          anchorY="middle"
          maxWidth={width * 0.78}
          textAlign="center"
        >
          {dish.title}
        </Text>

        {/* Nombre ceremonial sagrado en Wixárika */}
        <Text
          position={[0, -0.034, 0.012]}
          fontSize={0.040}
          color="#b45309"
          anchorX="center"
          anchorY="middle"
          maxWidth={width * 0.78}
          textAlign="center"
        >
          {dish.nativeName}
        </Text>
      </group>
    </group>
  );
}

/**
 * Módulo de Exhibición 3D del Acervo Gastronómico
 * Montado sobre el muro curvado Este (+X) del Museo Wixárika
 * En perfecta armonía arquitectónica con las salas de Deidades y Fiestas
 */
export function WixarikaGastronomyExhibition({
  onSelectArtwork,
  registerMesh,
  unregisterMesh
}) {
  // Coordenadas a lo largo del Muro Este (+X en arco circular a R = 7.18m)
  // Altura Y = 2.95m idéntica a los cuadros de Deidades y Fiestas
  // Orientaciones con normales mirando hacia el centro del Kalihuey
  const dishLayout = [
    { dish: WIXARIKA_GASTRONOMY_DISHES[0], pos: [6.63, 2.95, -2.75], rot: [0, -1.18, 0] },
    { dish: WIXARIKA_GASTRONOMY_DISHES[1], pos: [7.12, 2.95, -0.94], rot: [0, -1.44, 0] },
    { dish: WIXARIKA_GASTRONOMY_DISHES[2], pos: [7.12, 2.95, 0.94],  rot: [0, -1.70, 0] },
    { dish: WIXARIKA_GASTRONOMY_DISHES[3], pos: [6.63, 2.95, 2.75],  rot: [0, -1.96, 0] }
  ];

  return (
    <group position={[0, 0, 0]}>
      {dishLayout.map(({ dish, pos, rot }) => {
        if (!dish) return null;
        return (
          <GastronomyFrame
            key={dish.id}
            dish={dish}
            position={pos}
            rotation={rot}
            width={1.45}
            height={1.15}
            onSelect={onSelectArtwork}
            registerMesh={registerMesh}
            unregisterMesh={unregisterMesh}
          />
        );
      })}
    </group>
  );
}

export default WixarikaGastronomyExhibition;
