import React, { useRef, useState, useCallback, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
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
  WixarikaVRVideoPanel,
  WixarikaWelcomeDashboard,
  TsikuriDiamond
} from './wixarika/index.js';
import { SoundFX } from '../services/audioService.js';

// Estaciones Culturales del Museo Wixarika (HU-03, HU-06 ISO 9241-210)
// Posicionadas a distancias y alturas ergonómicas (Y=1.35-1.40m a la vista del usuario)
export const CULTURAL_STATIONS = [
  {
    id: 'deidades',
    name: 'Pabellón de Deidades',
    subtitle: 'Cosmovisión y Panteón Sagrado',
    position: [0, 1.40, -2.6],
    rotation: [0, 0, 0],
    variant: 'cantera',
    iconName: 'sun',
    description: '• Tatewari: Abuelo Fuego Sagrado\n• Tayau: Padre Sol y Fuerza Creadora\n• Kauyumari: Venado Azul y Guía Espiritual',
    book: 'Libro disponible: "El Fuego Sagrado y los Cantos del Mara\'akame" (Biblioteca Solón Argüello)',
    bookId: 'book-1'
  },
  {
    id: 'gastronomia',
    name: 'Pabellón Gastronómico',
    subtitle: 'Alimentos Tradicionales de Nayarit',
    position: [2.6, 1.40, 0],
    rotation: [0, -Math.PI / 2, 0],
    variant: 'cantera',
    iconName: 'utensils',
    description: '• Maíz Criollo Sagrado y Tortillas de Comal\n• Caldo de Toro Ceremonial y Tamales Totomoxtle\n• Tejuino Ritual y Perruri de Semillas',
    book: 'Libro disponible: "Sabores del Nayar: Etnobotánica y Cocina Tradicional" (Biblioteca Solón Argüello)',
    bookId: 'book-2'
  },
  {
    id: 'fiestas',
    name: 'Pabellón de Fiestas y Ritos',
    subtitle: 'Ceremonias de la Sierra',
    position: [-2.6, 1.40, 0],
    rotation: [0, Math.PI / 2, 0],
    variant: 'cantera',
    iconName: 'sparkles',
    description: '• Fiesta del Tambor: Protección de la Niñez\n• Tatei Neixa: Bendición de Primeros Frutos\n• Hikuri Neixa: Danza Sagrada del Peyote',
    book: 'Libro disponible: "Fiestas Sagradas de la Sierra Wixárika" (Biblioteca Solón Argüello)',
    bookId: 'book-3'
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
        label={showButtons ? 'Ocultar Menús' : 'Mostrar Menús'}
        iconName={showButtons ? 'eye-off' : 'eye'}
        variant="cantera"
        width={1.45}
        height={0.24}
        registerMesh={registerMesh}
        unregisterMesh={unregisterMesh}
        onClick={() => setShowButtons(!showButtons)}
        showDiamonds={true}
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
  setShowButtons: externalSetShowButtons,
  activeStation: externalActiveStation,
  onActiveStationChange,
  onOpenBooksPanel,
  isBooksOpen: externalIsBooksOpen,
  onToggleBooksOpen
}) {
  const orbitRef = useRef();
  const cameraRigRef = useRef();
  const [internalActiveStation, setInternalActiveStation] = useState(null);
  const [internalStationBooksOpen, setInternalStationBooksOpen] = useState(false);
  const [showBookCatalog, setShowBookCatalog] = useState(false);
  const [showVideoCatalog, setShowVideoCatalog] = useState(false);
  const [internalShowButtons, setInternalShowButtons] = useState(true);

  // Soporta tanto estado controlado por props como estado interno
  const activeStation =
    externalActiveStation !== undefined ? externalActiveStation : internalActiveStation;

  const stationBooksOpen =
    externalIsBooksOpen !== undefined ? externalIsBooksOpen : internalStationBooksOpen;
  const setStationBooksOpen = onToggleBooksOpen || setInternalStationBooksOpen;

  const showButtons =
    externalShowButtons !== undefined ? externalShowButtons : internalShowButtons;
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

  // Navegación guiada hacia salas desde el Dashboard de Bienvenida o botones 3D
  const handleSelectStation = useCallback(
    (stationOrId) => {
      const station =
        !stationOrId
          ? null
          : typeof stationOrId === 'string'
          ? CULTURAL_STATIONS.find((s) => s.id === stationOrId) || null
          : stationOrId;

      if (externalActiveStation === undefined) {
        setInternalActiveStation(station);
      }
      setStationBooksOpen(false);
      if (onActiveStationChange) {
        onActiveStationChange(station);
      }

      if (station) {
        setShowBookCatalog(false);
        setShowVideoCatalog(false);

        if (orbitRef.current) {
          if (station.id === 'deidades') {
            // Pabellón de Deidades ubicado en el cuadrante Norte (-Z)
            orbitRef.current.setAzimuthalAngle?.(0);
          } else if (station.id === 'gastronomia') {
            // Pabellón Gastronómico ubicado en el cuadrante Este (+X)
            orbitRef.current.setAzimuthalAngle?.(-Math.PI / 2);
          } else if (station.id === 'fiestas') {
            // Pabellón de Fiestas ubicado en el cuadrante Oeste (-X)
            orbitRef.current.setAzimuthalAngle?.(Math.PI / 2);
          }
          orbitRef.current.update?.();
        }
      }
    },
    [externalActiveStation, onActiveStationChange]
  );

  // Abrir catálogo de libros de la Biblioteca Solón Argüello en el cuadrante Sur (+Z)
  const handleOpenBooks = useCallback(() => {
    handleSelectStation(null);
    setShowVideoCatalog(false);
    setShowBookCatalog(true);
    if (orbitRef.current) {
      // Panel de libros orientado en el cuadrante Sur (+Z)
      orbitRef.current.setAzimuthalAngle?.(Math.PI);
      orbitRef.current.update?.();
    }
  }, [handleSelectStation]);

  // Abrir catálogo de videos culturales en el cuadrante Sur (+Z)
  const handleOpenVideos = useCallback(() => {
    handleSelectStation(null);
    setShowBookCatalog(false);
    setShowVideoCatalog(true);
    if (orbitRef.current) {
      // Panel de videos orientado en el cuadrante Sur (+Z)
      orbitRef.current.setAzimuthalAngle?.(Math.PI);
      orbitRef.current.update?.();
    }
  }, [handleSelectStation]);

  // Alternar audio cultural tradicional
  const handleToggleAudio = useCallback(() => {
    SoundFX.toggleAmbient();
  }, []);

  // Recentrar visor o controles
  const handleRecenter = useCallback(() => {
    if (onRecenterRef?.current) {
      onRecenterRef.current();
    } else if (orbitRef.current) {
      orbitRef.current.reset?.();
    }
  }, [onRecenterRef]);

  return (
    <Canvas
      style={{ width: '100%', height: '100%', background: '#0a0f1d' }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      dpr={[1, typeof window !== 'undefined' ? Math.min(2.5, window.devicePixelRatio || 2) : 2]}
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
      <directionalLight position={[0, 8.5, 0]} intensity={1.2} color="#fffcf5" castShadow={false} />
      {/* Luces de relleno para los 4 cuadrantes cardinales */}
      <directionalLight position={[0, 3.5, -4.5]} intensity={0.6} color="#ffffff" /> {/* Deidades (-Z) */}
      <directionalLight position={[4.5, 3.5, 0]} intensity={0.6} color="#ffffff" />  {/* Gastronomía (+X) */}
      <directionalLight position={[0, 3.5, 4.5]} intensity={0.6} color="#ffffff" />  {/* Bienvenida (+Z) */}
      <directionalLight position={[-4.5, 3.5, 0]} intensity={0.6} color="#ffffff" /> {/* Fiestas (-X) */}
      <pointLight position={[0, 4.5, 0]} intensity={1.0} distance={16} color="#ffe8cc" />
      <hemisphereLight skyColor="#ffffff" groundColor="#332a26" intensity={0.7} />

      {/* Modelo 3D del Museo Wixarika v14 */}
      <Suspense fallback={null}>
        <MuseumModel />
      </Suspense>

      {/* Dashboard Central de Bienvenida en el cuadrante Sur (+Z) */}
      {!activeStation && !showBookCatalog && !showVideoCatalog && showButtons && (
        <WixarikaWelcomeDashboard
          position={[0, 1.48, 2.10]}
          rotation={[0, Math.PI, 0]}
          onSelectStation={handleSelectStation}
          onOpenBooks={handleOpenBooks}
          onToggleAudio={handleToggleAudio}
          onOpenVideos={handleOpenVideos}
          onRecenter={handleRecenter}
          registerMesh={registerMesh}
          unregisterMesh={unregisterMesh}
        />
      )}


      {/* Catálogo de Videos Culturales (Biblioteca Solón Argüello) */}
      {showVideoCatalog && (
        <group position={[0, 1.45, 2.05]} rotation={[0, Math.PI, 0]}>
          <WixarikaVRVideoPanel
            onClose={() => setShowVideoCatalog(false)}
            registerMesh={registerMesh}
            unregisterMesh={unregisterMesh}
          />
        </group>
      )}

      {/* Estaciones Culturales (Deidades, Gastronomía, Fiestas) con Gaze Fuse */}
      {CULTURAL_STATIONS.map((station) => {
        const isCurrentActive = activeStation?.id === station.id;

        return (
          <group key={station.id} position={station.position} rotation={station.rotation}>
            {/* Si NO esta activa la estación Y los botones están visibles, mostrar botón interactivo */}
            {!activeStation && !showBookCatalog && !showVideoCatalog && showButtons && (
              <WixarikaVRButton
                id={`btn-station-${station.id}`}
                label={station.name}
                iconName={station.iconName}
                variant={station.variant || 'cantera'}
                width={1.65}
                height={0.34}
                registerMesh={registerMesh}
                unregisterMesh={unregisterMesh}
                onClick={() => handleSelectStation(station)}
              />
            )}

            {/* Tarjeta Cultural Wixárika al seleccionar la sala */}
            {isCurrentActive && !stationBooksOpen && (
              <group position={[0, 0, 0.3]}>
                <WixarikaVRCard
                  title={station.name}
                  subtitle={station.subtitle}
                  category="Pabellón Ceremonial Wixárika"
                  badge="RECORRIDO GUIADO"
                  description={station.description}
                  metadata={[
                    { label: 'Sede Cultural', value: 'Biblioteca Solón Argüello (Tepic, Nayarit)' }
                  ]}
                  actions={[
                    {
                      id: `btn-card-books-${station.id}`,
                      label: 'Libros Recomendados',
                      iconName: 'book-open',
                      variant: 'ambar',
                      onClick: () => {
                        setStationBooksOpen(true);
                        if (onOpenBooksPanel) onOpenBooksPanel(station);
                      }
                    },
                    {
                      id: `btn-card-close-${station.id}`,
                      label: 'Cerrar',
                      iconName: 'x',
                      variant: 'cantera',
                      onClick: () => handleSelectStation(null)
                    }
                  ]}
                  width={2.40}
                  height={1.48}
                  variant={station.variant || 'cantera'}
                  registerMesh={registerMesh}
                  unregisterMesh={unregisterMesh}
                />
              </group>
            )}

            {/* Panel 3D de Libros Recomendados en Realidad Virtual (filtrado por el tema visualizado) */}
            {isCurrentActive && stationBooksOpen && (
              <group position={[0, 0, 0.32]}>
                <WixarikaVRBookPanel
                  stationId={station.id}
                  stationName={station.name}
                  onClose={() => setStationBooksOpen(false)}
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
        activeStation={activeStation || stationBooksOpen}
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
