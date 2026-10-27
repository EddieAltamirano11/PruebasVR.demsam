import React, { useRef, useState, useCallback, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import * as THREE from 'three';
import { MuseumModel } from './MuseumModel.jsx';
import { WebXRManager } from './WebXRManager.jsx';
import { VRDeviceOrientation } from './VRDeviceOrientation.jsx';
import { StereoVRManager } from './StereoVRManager.jsx';
import { GazeReticle } from './GazeReticle.jsx';
import {
  WixarikaVRButton,
  WixarikaVRCard,
  WixarikaVRFloatingPanel,
  WixarikaVRBookPanel,
  TsikuriDiamond
} from './wixarika/index.js';

// Estaciones Culturales del Museo Wixarika (HU-03, HU-06 ISO 9241-210)
// Posicionadas a distancias y alturas ergonómicas (Y=1.35-1.40m a la vista del usuario)
const CULTURAL_STATIONS = [
  {
    id: 'deidades',
    name: 'Pabellón de Deidades',
    subtitle: 'Cosmovisión y Panteón Sagrado',
    position: [0, 1.40, -2.6],
    rotation: [0, 0, 0],
    variant: 'solar',
    icon: '☀️',
    description: 'Panteón sagrado Wixárika: Tatewari (El Abuelo Fuego), Tayau (Padre Sol) y Kauyumari (El Venado Azul). Representan el equilibrio y la fuerza espiritual en Wirikuta.',
    book: 'Libro disponible: "El Fuego Sagrado y los Cantos del Mara\'akame" (Biblioteca Solón Argüello)',
    bookId: 'book-1'
  },
  {
    id: 'gastronomia',
    name: 'Pabellón Gastronómico',
    subtitle: 'Alimentos Tradicionales de Nayarit',
    position: [2.6, 1.40, 0],
    rotation: [0, -Math.PI / 2, 0],
    variant: 'hikuri',
    icon: '🌽',
    description: 'Gastronomía ceremonial: Tortillas de maíz criollo, tamales en totomoxtle, caldo de toro nayarita, atole espumoso y perruri tradicional.',
    book: 'Libro disponible: "Sabores del Nayar: Etnobotánica y Cocina Tradicional" (Biblioteca Solón Argüello)',
    bookId: 'book-2'
  },
  {
    id: 'fiestas',
    name: 'Pabellón de Fiestas y Ritos',
    subtitle: 'Ceremonias de la Sierra',
    position: [-2.6, 1.40, 0],
    rotation: [0, Math.PI / 2, 0],
    variant: 'water',
    icon: '◈',
    description: 'Ciclo ceremonial: Fiesta del Tambor (Tepu) para la bendición de los niños, Tatei Neixa (Primeros Frutos) y la danza sagrada del Hikuri Neixa.',
    book: 'Libro disponible: "Fiestas Sagradas de la Sierra Wixárika" (Biblioteca Solón Argüello)',
    bookId: 'book-3'
  },
  {
    id: 'biblioteca',
    name: 'Kiosco y Fomento Lector',
    subtitle: 'Biblioteca Solón Argüello',
    position: [0, 1.35, 2.4],
    rotation: [0, Math.PI, 0],
    variant: 'kauyumari',
    icon: '📚',
    description: 'Módulo de enlace cultural. Al terminar tu recorrido inmersivo, solicita los libros recomendados en el mostrador físico de la biblioteca.',
    book: 'Servicio: Préstamo a sala y a domicilio con credencial de lector activa.',
    bookId: 'book-1'
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

// Botón 3D inferior flotante para ocultar/mostrar botones en VR (Abajo)
function LowerToggleButton({
  showButtons,
  setShowButtons,
  registerMesh,
  unregisterMesh,
  activeStation
}) {
  const groupRef = useRef();
  const { camera } = useThree();
  const tempPos = useRef(new THREE.Vector3());
  const tempDir = useRef(new THREE.Vector3());

  // Posicionar suavemente abajo en el campo visual del observador (Y ≈ 0.42m)
  useFrame(() => {
    if (!groupRef.current || !camera) return;
    camera.getWorldPosition(tempPos.current);
    camera.getWorldDirection(tempDir.current);
    tempDir.current.y = 0;
    if (tempDir.current.lengthSq() < 0.001) {
      tempDir.current.set(0, 0, -1);
    } else {
      tempDir.current.normalize();
    }
    // 1.50m al frente de la dirección de la mirada, a baja altura (abajo)
    const targetX = tempPos.current.x + tempDir.current.x * 1.5;
    const targetZ = tempPos.current.z + tempDir.current.z * 1.5;
    groupRef.current.position.set(targetX, 0.42, targetZ);
    // Orientado hacia los ojos del observador
    groupRef.current.lookAt(tempPos.current.x, 1.45, tempPos.current.z);
  });

  // Si hay un panel de estación o libro abierto, ocultar el botón inferior para no distraer
  if (activeStation) return null;

  return (
    <group ref={groupRef}>
      <WixarikaVRButton
        id="btn-toggle-station-buttons"
        label={showButtons ? 'Ocultar Botones' : 'Mostrar Botones'}
        icon={showButtons ? '👁️‍🗨️' : '👁️'}
        variant={showButtons ? 'obsidian' : 'solar'}
        width={1.30}
        height={0.22}
        registerMesh={registerMesh}
        unregisterMesh={unregisterMesh}
        onClick={() => setShowButtons(!showButtons)}
        showDiamonds={false}
      />
    </group>
  );
}

export function MuseumScene({
  vrMode,
  setVrMode,
  onWebXRTriggerRef,
  onRecenterRef,
  showButtons: externalShowButtons,
  setShowButtons: externalSetShowButtons
}) {
  const orbitRef = useRef();
  const cameraRigRef = useRef();
  const [activeStation, setActiveStation] = useState(null);
  const [internalShowButtons, setInternalShowButtons] = useState(true);

  const showButtons = externalShowButtons !== undefined ? externalShowButtons : internalShowButtons;
  const setShowButtons = externalSetShowButtons || setInternalShowButtons;

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
            {/* Si NO esta activa la estación Y los botones están visibles, mostrar botón interactivo */}
            {!activeStation && showButtons && (
              <WixarikaVRButton
                id={`btn-station-${station.id}`}
                label={station.name}
                icon={station.icon}
                variant={station.variant || 'solar'}
                width={1.55}
                height={0.32}
                registerMesh={registerMesh}
                unregisterMesh={unregisterMesh}
                onClick={() => setActiveStation(station)}
              />
            )}

            {/* Si esta estación es la Biblioteca, desplegar el Panel Completo de Libros a distancia óptima */}
            {isCurrentActive && station.id === 'biblioteca' && (
              <group position={[0, -0.05, 0.4]}>
                <WixarikaVRBookPanel
                  onClose={() => setActiveStation(null)}
                  registerMesh={registerMesh}
                  unregisterMesh={unregisterMesh}
                />
              </group>
            )}

            {/* Si esta estación es Deidades, Gastronomía o Fiestas, mostrar Tarjeta Cultural Wixárika */}
            {isCurrentActive && station.id !== 'biblioteca' && (
              <group position={[0, 0, 0.3]}>
                <WixarikaVRCard
                  title={station.name}
                  subtitle={station.subtitle}
                  category="Pabellón Ceremonial Wixárika"
                  badge="RECORRIDO GUIADO"
                  description={station.description}
                  metadata={[
                    { label: 'Lectura Recomendada', value: station.book },
                    { label: 'Sede Cultural', value: 'Biblioteca Solón Argüello (Tepic, Nayarit)' }
                  ]}
                  actions={[
                    {
                      id: `btn-card-read-${station.id}`,
                      label: 'Ver Libro en Kiosco [📚]',
                      icon: '📖',
                      variant: 'solar',
                      onClick: () => {
                        const biblioStation = CULTURAL_STATIONS.find((s) => s.id === 'biblioteca');
                        if (biblioStation) setActiveStation(biblioStation);
                      }
                    },
                    {
                      id: `btn-card-close-${station.id}`,
                      label: 'Cerrar [✕]',
                      icon: '✕',
                      variant: 'danger',
                      onClick: () => setActiveStation(null)
                    }
                  ]}
                  width={2.40}
                  height={1.30}
                  variant={station.variant || 'solar'}
                  registerMesh={registerMesh}
                  unregisterMesh={unregisterMesh}
                />
              </group>
            )}
          </group>
        );
      })}

      {/* Botón flotante inferior para Ocultar/Mostrar botones en el campo visual bajo (Abajo) */}
      <LowerToggleButton
        showButtons={showButtons}
        setShowButtons={setShowButtons}
        registerMesh={registerMesh}
        unregisterMesh={unregisterMesh}
        activeStation={activeStation}
      />

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
