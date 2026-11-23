import React, { useState, useEffect, useRef } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { SoundFX } from '../../services/audioService.js';
import { WIXARIKA_GASTRONOMY_DISHES } from './wixarikaArtworksData.js';
import { TsikuriDiamond } from './TsikuriDiamond.jsx';

/**
 * Cuadro individual de platillo tradicional Wixárika en 3D
 */
function GastronomyFrame({
  dish,
  position,
  rotation,
  width = 1.30,
  height = 0.95,
  onSelect,
  registerMesh,
  unregisterMesh
}) {
  const meshRef = useRef();
  const [texture, setTexture] = useState(null);
  const [letreroTex, setLetreroTex] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

    if (dish.image) {
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
        (err) => console.warn(`[GastronomyFrame] Error cargando ${dish.image}:`, err)
      );
    }

    if (dish.letreroImage) {
      loader.load(
        dish.letreroImage,
        (lTex) => {
          if (!isMounted) return;
          lTex.colorSpace = THREE.SRGBColorSpace;
          lTex.minFilter = THREE.LinearMipmapLinearFilter;
          lTex.magFilter = THREE.LinearFilter;
          lTex.generateMipmaps = true;
          setLetreroTex(lTex);
        },
        undefined,
        () => {}
      );
    }

    return () => {
      isMounted = false;
      if (texture) texture.dispose();
      if (letreroTex) letreroTex.dispose();
    };
  }, [dish.image, dish.letreroImage]);

  useEffect(() => {
    if (!meshRef.current) return;
    const obj = meshRef.current;
    obj.userData = {
      id: `btn-gastro-${dish.id}`,
      artworkId: dish.id,
      dish,
      onClick: () => {
        SoundFX.playClick();
        onSelect?.(dish);
      },
      onSelect: () => {
        SoundFX.playClick();
        onSelect?.(dish);
      },
      onPointerEnter: () => setIsHovered(true),
      onPointerLeave: () => setIsHovered(false)
    };

    registerMesh?.(obj);
    return () => {
      unregisterMesh?.(obj);
    };
  }, [dish, onSelect, registerMesh, unregisterMesh]);

  return (
    <group position={position} rotation={rotation}>
      {/* 1. Marco exterior de madera oscura / cantera */}
      <mesh position={[0, 0, -0.015]}>
        <boxGeometry args={[width + 0.12, height + 0.12, 0.03]} />
        <meshStandardMaterial
          color={isHovered ? '#b45309' : '#3d2514'}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* 2. Filete ceremonial dorado */}
      <mesh position={[0, 0, -0.005]}>
        <planeGeometry args={[width + 0.04, height + 0.04]} />
        <meshBasicMaterial color={isHovered ? '#ffd700' : '#d4af37'} />
      </mesh>

      {/* 3. Lienzo con fotografía real del alimento */}
      <mesh
        ref={meshRef}
        position={[0, 0, 0.005]}
      >
        <planeGeometry args={[width, height]} />
        {texture ? (
          <meshBasicMaterial map={texture} toneMapped={false} />
        ) : (
          <meshBasicMaterial color="#2d1d12" />
        )}
      </mesh>

      {/* 4. Rombos Tsikuri decorativos en las 4 esquinas */}
      <group position={[0, 0, 0.010]}>
        <TsikuriDiamond
          size={0.05}
          position={[-width / 2 + 0.04, height / 2 - 0.04, 0]}
          colors={['#d4af37', '#b45309', '#ffffff']}
        />
        <TsikuriDiamond
          size={0.05}
          position={[width / 2 - 0.04, height / 2 - 0.04, 0]}
          colors={['#d4af37', '#b45309', '#ffffff']}
        />
        <TsikuriDiamond
          size={0.05}
          position={[-width / 2 + 0.04, -height / 2 + 0.04, 0]}
          colors={['#d4af37', '#b45309', '#ffffff']}
        />
        <TsikuriDiamond
          size={0.05}
          position={[width / 2 - 0.04, -height / 2 + 0.04, 0]}
          colors={['#d4af37', '#b45309', '#ffffff']}
        />
      </group>

      {/* 5. Placa / Letrero inferior con el nombre tallado del platillo */}
      <group position={[0, -height / 2 - 0.12, 0.008]}>
        <mesh position={[0, 0, -0.002]}>
          <planeGeometry args={[width * 0.92, 0.16]} />
          <meshBasicMaterial color="#1a120b" />
        </mesh>
        <mesh position={[0, 0, -0.001]}>
          <planeGeometry args={[width * 0.88, 0.14]} />
          <meshBasicMaterial color="#fcfaf4" />
        </mesh>

        {letreroTex ? (
          <mesh position={[0, 0, 0.002]}>
            <planeGeometry args={[width * 0.82, 0.12]} />
            <meshBasicMaterial map={letreroTex} transparent toneMapped={false} />
          </mesh>
        ) : (
          <Text
            position={[0, 0, 0.002]}
            fontSize={0.055}
            color="#1c1917"
            anchorX="center"
            anchorY="middle"
            maxWidth={width * 0.84}
            textAlign="center"
          >
            {dish.title}
          </Text>
        )}
      </group>
    </group>
  );
}

/**
 * Módulo de Exhibición 3D del Pabellón Gastronómico
 * Anclado sobre el muro Este (+X) del Museo Wixárika
 */
export function WixarikaGastronomyExhibition({
  onSelectArtwork,
  registerMesh,
  unregisterMesh
}) {
  const [centralTex, setCentralTex] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(
      '/texturas/cedula_gastro_central.png',
      (tex) => {
        if (!isMounted) return;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = true;
        setCentralTex(tex);
      },
      undefined,
      () => {}
    );

    return () => {
      isMounted = false;
      if (centralTex) centralTex.dispose();
    };
  }, []);

  // Coordenadas a lo largo del Muro Este (+X = 6.4m a 6.7m en arco semicilíndrico)
  // Orientados hacia el centro del museo mirando hacia -X
  const dishLayout = [
    { dish: WIXARIKA_GASTRONOMY_DISHES[0], pos: [6.60, 2.75, -2.20], rot: [0, -Math.PI / 2 - 0.28, 0] },
    { dish: WIXARIKA_GASTRONOMY_DISHES[1], pos: [6.95, 2.75, -0.75], rot: [0, -Math.PI / 2 - 0.10, 0] },
    { dish: WIXARIKA_GASTRONOMY_DISHES[2], pos: [6.95, 2.75, 0.75],  rot: [0, -Math.PI / 2 + 0.10, 0] },
    { dish: WIXARIKA_GASTRONOMY_DISHES[3], pos: [6.60, 2.75, 2.20],  rot: [0, -Math.PI / 2 + 0.28, 0] },
    { dish: WIXARIKA_GASTRONOMY_DISHES[4], pos: [6.75, 1.35, -1.50], rot: [0, -Math.PI / 2 - 0.18, 0] },
    { dish: WIXARIKA_GASTRONOMY_DISHES[5], pos: [6.75, 1.35, 1.50],  rot: [0, -Math.PI / 2 + 0.18, 0] }
  ];

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Cédula Monumental Central del Pabellón Gastronómico */}
      <group position={[6.98, 4.05, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[0, 0, -0.015]}>
          <boxGeometry args={[3.20, 0.85, 0.04]} />
          <meshStandardMaterial color="#3d2514" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0, -0.005]}>
          <planeGeometry args={[3.12, 0.77]} />
          <meshBasicMaterial color="#d4af37" />
        </mesh>
        <mesh position={[0, 0, 0.005]}>
          <planeGeometry args={[3.04, 0.70]} />
          {centralTex ? (
            <meshBasicMaterial map={centralTex} transparent toneMapped={false} />
          ) : (
            <meshBasicMaterial color="#fcfaf4" />
          )}
        </mesh>
      </group>

      {/* 2. Galería de 6 Cuadros de Alimentos Tradicionales con Fotografías */}
      {dishLayout.map(({ dish, pos, rot }) => {
        if (!dish) return null;
        return (
          <GastronomyFrame
            key={dish.id}
            dish={dish}
            position={pos}
            rotation={rot}
            width={1.25}
            height={0.88}
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
