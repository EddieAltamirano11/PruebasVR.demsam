import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';

export function MuseumModel() {
  const group = useRef();
  // Carga del modelo 3D oficial v12 con todas las salas, cédulas y gastronomía
  const { scene } = useGLTF('./museo_wixarika_v12.glb');

  return (
    <primitive
      ref={group}
      object={scene}
      position={[0, 0, 0]}
      dispose={null}
    />
  );
}

useGLTF.preload('./museo_wixarika_v12.glb');
