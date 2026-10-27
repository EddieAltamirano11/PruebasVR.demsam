import React, { useRef, useState, useCallback, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import { MuseumModel } from './MuseumModel.jsx';
import { WebXRManager } from './WebXRManager.jsx';
import { VRDeviceOrientation } from './VRDeviceOrientation.jsx';
import { StereoVRManager } from './StereoVRManager.jsx';
import { GazeReticle } from './GazeReticle.jsx';

// Estaciones Culturales del Museo Wixarika (HU-03, HU-06 ISO 9241-210)
const CULTURAL_STATIONS = [
  {
    id: 'deidades',
    name: 'Pabellón de Deidades',
    subtitle: 'Cosmovisión y Panteón Sagrado',
    position: [0, 1.7, -3.5],
    rotation: [0, 0, 0],
    description: 'Panteón sagrado Wixárika: Tatewari (El Abuelo Fuego), Tayau (Padre Sol) y Kauyumari (El Venado Azul). Representan el equilibrio y la fuerza espiritual en Wirikuta.',
    book: 'Libro disponible: "El Fuego Sagrado y los Cantos del Mara\'akame" (Biblioteca Solón Argüello)'
  },
  {
    id: 'gastronomia',
    name: 'Pabellón Gastronómico',
    subtitle: 'Alimentos Tradicionales de Nayarit',
    position: [3.5, 1.7, 0],
    rotation: [0, -Math.PI / 2, 0],
    description: 'Gastronomía ceremonial: Tortillas de maíz criollo, tamales en totomoxtle, caldo de toro nayarita, atole espumoso y perruri tradicional.',
    book: 'Libro disponible: "Sabores del Nayar: Etnobotánica y Cocina Tradicional" (Biblioteca Solón Argüello)'
  },
  {
    id: 'fiestas',
    name: 'Pabellón de Fiestas y Ritos',
    subtitle: 'Ceremonias de la Sierra',
    position: [-3.5, 1.7, 0],
    rotation: [0, Math.PI / 2, 0],
    description: 'Ciclo ceremonial: Fiesta del Tambor (Tepu) para la bendición de los niños, Tatei Neixa (Primeros Frutos) y la danza sagrada del Hikuri Neixa.',
    book: 'Libro disponible: "Fiestas Sagradas de la Sierra Wixárika" (Biblioteca Solón Argüello)'
  },
  {
    id: 'biblioteca',
    name: 'Kiosco y Fomento Lector',
    subtitle: 'Biblioteca Solón Argüello',
    position: [0, 1.7, 3.5],
    rotation: [0, Math.PI, 0],
    description: 'Módulo de enlace cultural. Al terminar tu recorrido inmersivo, solicita los libros recomendados en el mostrador físico de la biblioteca.',
    book: 'Servicio: Préstamo a sala y a domicilio con credencial de lector activa.'
  }
];

// Botón / Hotspot interactivo compatible con Gaze Fuse (1.2s) y gatillo dual
function InteractiveTriggerMesh({ onSelect, registerMesh, unregisterMesh, children }) {
  const meshRef = useRef();

  useEffect(() => {
    const mesh = meshRef.current;
    if (mesh && registerMesh) {
      mesh.userData = { onSelect };
      registerMesh(mesh);
    }
    return () => {
      if (mesh && unregisterMesh) {
        unregisterMesh(mesh);
      }
    };
  }, [onSelect, registerMesh, unregisterMesh]);

  return children(meshRef);
}

export function MuseumScene({
  vrMode,
  setVrMode,
  onWebXRTriggerRef,
  onRecenterRef
}) {
  const orbitRef = useRef();
  const cameraRigRef = useRef();
  const [activeStation, setActiveStation] = useState(null);

  // Registro de objetos interactivos para el raycaster de Gaze Fuse
  const interactiveRegistry = useRef(new Set());

  const registerMesh = useCallback((mesh) => {
    if (mesh) interactiveRegistry.current.add(mesh);
  }, []);

  const unregisterMesh = useCallback((mesh) => {
    if (mesh) interactiveRegistry.current.delete(mesh);
  }, []);

  const getInteractiveObjects = useCallback(() => {
    return Array.from(interactiveRegistry.current);
  }, []);

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

      {/* Estaciones Culturales e Interactivas con Gaze Fuse */}
      {CULTURAL_STATIONS.map((station) => {
        const isCurrentActive = activeStation?.id === station.id;

        return (
          <group key={station.id} position={station.position} rotation={station.rotation}>
            {/* Si NO esta activa la tarjeta, mostrar el punto de enfoque interactivo */}
            {!activeStation && (
              <InteractiveTriggerMesh
                onSelect={() => setActiveStation(station)}
                registerMesh={registerMesh}
                unregisterMesh={unregisterMesh}
              >
                {(meshRef) => (
                  <group>
                    {/* Borde exterior brillante */}
                    <mesh position={[0, 0, -0.002]}>
                      <planeGeometry args={[1.5, 0.44]} />
                      <meshBasicMaterial color="#38bdf8" transparent opacity={0.7} />
                    </mesh>

                    {/* Boton sensible al raycast */}
                    <mesh ref={meshRef}>
                      <planeGeometry args={[1.46, 0.4]} />
                      <meshBasicMaterial color="#0f172a" transparent opacity={0.92} />
                    </mesh>

                    {/* Titulo del pabellon */}
                    <Text
                      position={[0, 0.08, 0.01]}
                      fontSize={0.09}
                      color="#fde047"
                      anchorX="center"
                      anchorY="middle"
                      maxWidth={1.4}
                    >
                      {station.name}
                    </Text>

                    {/* Indicador de Gaze Fuse */}
                    <Text
                      position={[0, -0.09, 0.01]}
                      fontSize={0.055}
                      color="#38bdf8"
                      anchorX="center"
                      anchorY="middle"
                      maxWidth={1.4}
                    >
                      ⊙ Fijar mirada (1.2 s)
                    </Text>
                  </group>
                )}
              </InteractiveTriggerMesh>
            )}

            {/* Si esta estacion esta activa, mostrar panel informativo flotante */}
            {isCurrentActive && (
              <group position={[0, 0, 0]}>
                {/* Borde exterior del panel */}
                <mesh position={[0, 0, -0.002]}>
                  <planeGeometry args={[2.54, 1.54]} />
                  <meshBasicMaterial color="#38bdf8" transparent opacity={0.8} />
                </mesh>

                {/* Fondo translúcido de alto contraste (WCAG AAA) */}
                <mesh position={[0, 0, 0]}>
                  <planeGeometry args={[2.5, 1.5]} />
                  <meshBasicMaterial color="#0f172a" transparent opacity={0.95} />
                </mesh>

                {/* Titulo */}
                <Text
                  position={[0, 0.52, 0.02]}
                  fontSize={0.11}
                  color="#fde047"
                  anchorX="center"
                  anchorY="middle"
                  maxWidth={2.3}
                >
                  {station.name}
                </Text>

                {/* Subtitulo */}
                <Text
                  position={[0, 0.38, 0.02]}
                  fontSize={0.065}
                  color="#38bdf8"
                  anchorX="center"
                  anchorY="middle"
                  maxWidth={2.3}
                >
                  {station.subtitle}
                </Text>

                {/* Descripcion cultural */}
                <Text
                  position={[0, 0.12, 0.02]}
                  fontSize={0.055}
                  color="#f8fafc"
                  anchorX="center"
                  anchorY="middle"
                  maxWidth={2.3}
                  lineHeight={1.3}
                >
                  {station.description}
                </Text>

                {/* Fomento a la lectura */}
                <Text
                  position={[0, -0.22, 0.02]}
                  fontSize={0.052}
                  color="#93c5fd"
                  anchorX="center"
                  anchorY="middle"
                  maxWidth={2.3}
                >
                  {station.book}
                </Text>

                {/* Botón de Cerrar interactivo con Gaze Fuse */}
                <InteractiveTriggerMesh
                  onSelect={() => setActiveStation(null)}
                  registerMesh={registerMesh}
                  unregisterMesh={unregisterMesh}
                >
                  {(closeMeshRef) => (
                    <group position={[0, -0.52, 0.02]}>
                      <mesh position={[0, 0, -0.001]}>
                        <planeGeometry args={[0.92, 0.22]} />
                        <meshBasicMaterial color="#ef4444" transparent opacity={0.7} />
                      </mesh>
                      <mesh ref={closeMeshRef}>
                        <planeGeometry args={[0.9, 0.2]} />
                        <meshBasicMaterial color="#1e293b" transparent opacity={0.92} />
                      </mesh>
                      <Text
                        position={[0, 0, 0.01]}
                        fontSize={0.065}
                        color="#ffffff"
                        anchorX="center"
                        anchorY="middle"
                      >
                        Cerrar [✕] (1.2 s)
                      </Text>
                    </group>
                  )}
                </InteractiveTriggerMesh>
              </group>
            )}
          </group>
        );
      })}

      {/* Reticula Central con Gaze Fuse interactivo a 1.2 segundos */}
      <GazeReticle
        interactiveObjects={getInteractiveObjects}
        distance={1.2}
        enabled={true}
      />

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
export default MuseumScene;
