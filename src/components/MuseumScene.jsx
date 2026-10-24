import React, { useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { MuseumModel } from './MuseumModel.jsx';
import { WebXRManager } from './WebXRManager.jsx';
import { VRDeviceOrientation } from './VRDeviceOrientation.jsx';
import { StereoVRManager } from './StereoVRManager.jsx';

export function MuseumScene({
  vrMode,
  setVrMode,
  onWebXRTriggerRef,
  onRecenterRef
}) {
  const orbitRef = useRef();
  const cameraRigRef = useRef();

  return (
    <Canvas
      style={{ width: '100%', height: '100%', background: '#0a0f1d' }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      dpr={[1, 2]}
    >
      {/* Rig de camara para modo normal y modo VR */}
      <group ref={cameraRigRef} position={[0, 0, 0]}>
        <PerspectiveCamera
          makeDefault
          position={vrMode ? [0, 1.6, 0] : [0, 1.6, 2.5]}
          fov={75}
          near={0.05}
          far={1000}
        />
      </group>

      {/* Iluminacion Museografica Integral */}
      <ambientLight color="#ffffff" intensity={1.3} />
      <directionalLight position={[0, 7, 0]} intensity={1.2} color="#fffcf5" castShadow={false} />
      {/* Luces de relleno para los 4 cuadrantes cardinales */}
      <directionalLight position={[0, 3.5, -4.5]} intensity={0.6} color="#ffffff" /> {/* Deidades (-Z) */}
      <directionalLight position={[4.5, 3.5, 0]} intensity={0.6} color="#ffffff" />  {/* Gastronomía (+X) */}
      <directionalLight position={[0, 3.5, 4.5]} intensity={0.6} color="#ffffff" />  {/* Bienvenida (+Z) */}
      <directionalLight position={[-4.5, 3.5, 0]} intensity={0.6} color="#ffffff" /> {/* Fiestas (-X) */}
      <pointLight position={[0, 4, 0]} intensity={1.0} distance={14} color="#ffe8cc" />
      <hemisphereLight skyColor="#ffffff" groundColor="#332a26" intensity={0.7} />

      {/* Modelo 3D del Museo Wixarika v12 */}
      <Suspense fallback={null}>
        <MuseumModel />
      </Suspense>

      {/* Controles de orbita activos en modo pantalla normal */}
      <OrbitControls
        ref={orbitRef}
        enabled={!vrMode}
        target={[0, 1.4, 0]}
        enableDamping
        dampingFactor={0.05}
        minDistance={0.2}
        maxDistance={7.5}
        maxPolarAngle={Math.PI - 0.05}
        minPolarAngle={0.05}
      />

      {/* Gestor Nativo WebXR */}
      <WebXRManager onSessionChange={setVrMode} onTriggerRef={onWebXRTriggerRef} />

      {/* Giroscopio y vista estereo dual cuando no hay WebXR nativo (Modo Visor Homido / Cardboard) */}
      {vrMode && !navigator.xr && (
        <VRDeviceOrientation onRecenterRef={onRecenterRef} />
      )}
      {vrMode && !navigator.xr && <StereoVRManager eyeSep={0.064} />}
    </Canvas>
  );
}
