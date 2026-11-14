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
  WixarikaWelcomeDashboard,
  WixarikaArtworkModal,
  calculateArtworkModalTransform
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

// Botón 3D inferior flotante para ocultar/mostrar el menú principal o el cuadro activo
function LowerToggleButton({
  showButtons,
  setShowButtons,
  activeArtwork,
  setActiveArtwork,
  registerMesh,
  unregisterMesh
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

  const isAnyMenuOpen = !!activeArtwork || showButtons;

  const handleToggle = () => {
    if (activeArtwork) {
      // Ocultar la ventana del cuadro seleccionado
      setActiveArtwork(null);
      setShowButtons(false);
    } else {
      // Alternar menú principal
      setShowButtons(!showButtons);
    }
  };

  return (
    <group ref={groupRef}>
      <WixarikaVRButton
        id="btn-toggle-station-buttons"
        label={isAnyMenuOpen ? 'Ocultar Menú' : 'Mostrar Menú'}
        iconName={isAnyMenuOpen ? 'eye-off' : 'eye'}
        variant="cantera"
        width={1.60}
        height={0.28}
        registerMesh={registerMesh}
        unregisterMesh={unregisterMesh}
        onClick={handleToggle}
        showDiamonds={true}
      />
    </group>
  );
}

// Quiosco ceremonial del museo con rotación suave amortiguada (Opción 1: Smooth Carousel)
function RotatingKiosk({
  targetRotationY = 0,
  onSelectArtwork,
  registerMesh,
  unregisterMesh
}) {
  const kioskRef = useRef();

  useFrame((_, delta) => {
    if (kioskRef.current) {
      // Interpolar suavemente hacia targetRotationY con amortiguación ceremonial ágil (~0.7s)
      kioskRef.current.rotation.y = THREE.MathUtils.damp(
        kioskRef.current.rotation.y,
        targetRotationY,
        4.5,
        delta
      );
    }
  });

  return (
    <group ref={kioskRef}>
      {/* Luces de relleno para los 4 cuadrantes cardinales (rotan solidarias con el quiosco) */}
      <directionalLight position={[0, 3.5, -4.5]} intensity={0.6} color="#ffffff" /> {/* Deidades (-Z) */}
      <directionalLight position={[4.5, 3.5, 0]} intensity={0.6} color="#ffffff" />  {/* Gastronomía (+X) */}
      <directionalLight position={[0, 3.5, 4.5]} intensity={0.6} color="#ffffff" />  {/* Bienvenida (+Z) */}
      <directionalLight position={[-4.5, 3.5, 0]} intensity={0.6} color="#ffffff" /> {/* Fiestas (-X) */}

      {/* Modelo 3D del Museo Wixarika v14 con detección e interactividad en los 9 cuadros */}
      <Suspense fallback={null}>
        <MuseumModel
          onSelectArtwork={onSelectArtwork}
          registerMesh={registerMesh}
          unregisterMesh={unregisterMesh}
        />
      </Suspense>
    </group>
  );
}

// Modal dinámico monumental posicionado frente al cuadro seleccionado (Opción C mejorada)
function DynamicArtworkModal({
  artwork,
  onClose,
  registerMesh,
  unregisterMesh
}) {
  const [transform, setTransform] = useState(() => calculateArtworkModalTransform(artwork));

  useEffect(() => {
    if (!artwork) return;
    setTransform(calculateArtworkModalTransform(artwork));
  }, [artwork]);

  if (!artwork) return null;

  return (
    <WixarikaArtworkModal
      artwork={artwork}
      position={transform.position}
      rotation={transform.rotation}
      onClose={onClose}
      registerMesh={registerMesh}
      unregisterMesh={unregisterMesh}
    />
  );
}

export function MuseumScene({
  vrMode,
  setVrMode,
  onWebXRTriggerRef,
  onRecenterRef,
  showButtons: externalShowButtons,
  setShowButtons: externalSetShowButtons,
  activeStation: _externalActiveStation,
  onActiveStationChange: _onActiveStationChange,
  onOpenBooksPanel: _onOpenBooksPanel,
  isBooksOpen: _externalIsBooksOpen,
  onToggleBooksOpen: _onToggleBooksOpen
}) {
  const orbitRef = useRef();
  const cameraRigRef = useRef();
  const [internalShowButtons, setInternalShowButtons] = useState(true);
  const [activeArtwork, setActiveArtwork] = useState(null);
  const [kioskRotationTarget, setKioskRotationTarget] = useState(0);

  // Manejador al seleccionar una sala cultural (Deidades, Gastronomía o Fiestas)
  const handleSelectStation = useCallback((stationId) => {
    if (stationId === 'deidades') {
      setKioskRotationTarget(Math.PI); // Gira 180°: Muro de Deidades viene al frente (+Z)
    } else if (stationId === 'gastronomia') {
      setKioskRotationTarget(-Math.PI / 2); // Gira -90°: Muro de Gastronomía viene al frente (+Z)
    } else if (stationId === 'fiestas') {
      setKioskRotationTarget(Math.PI / 2); // Gira +90°: Muro de Fiestas viene al frente (+Z)
    } else {
      setKioskRotationTarget(0); // Menú / Entrada (+Z)
    }

    // Al seleccionar una sala, ocultar el menú para que el quiosco gire al centro de su vista
    // y el usuario pueda contemplar directamente el muro y sus cuadros sagrados
    setShowButtons(false);
  }, [setShowButtons]);

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
    const all = Array.from(interactiveRegistry.current);
    if (activeArtwork) {
      // Cuando hay un cuadro/deidad abierto, desactivar el gaze fuse de las cosas detrás del menú.
      // Solo permitir interactuar con el botón badge de cerrar y el botón inferior para no traspasar el menú.
      return all.filter((mesh) => {
        const id = mesh.userData?.id || '';
        return (
          id.includes('btn-close') ||
          id.includes('close-artwork') ||
          id.includes('toggle-station-buttons')
        );
      });
    }
    return all;
  }, [activeArtwork]);

  // Alternar audio cultural tradicional
  const handleToggleAudio = useCallback(() => {
    SoundFX.toggleAmbient();
  }, []);

  // Recentrar visor en VR o controles de órbita en computadora
  const handleRecenter = useCallback(() => {
    setKioskRotationTarget(0);
    if (onRecenterRef?.current) {
      onRecenterRef.current();
    } else if (orbitRef.current) {
      orbitRef.current.reset?.();
    }
  }, [onRecenterRef]);

  // Manejador al seleccionar una deidad o fiesta
  const handleSelectArtwork = useCallback((artwork) => {
    setActiveArtwork(artwork);
    setShowButtons(false);
  }, [setShowButtons]);

  // Manejador al cerrar el modal de la obra
  const handleCloseArtwork = useCallback(() => {
    setActiveArtwork(null);
    setShowButtons(true);
  }, [setShowButtons]);

  return (
    <Canvas
      style={{ width: '100%', height: '100%', background: '#0a0f1d' }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      dpr={[1, typeof window !== 'undefined' ? Math.min(2.5, window.devicePixelRatio || 2) : 2]}
    >
      {/* Rig de camara para modo normal y modo VR:
          En modo VR se orienta Math.PI para que el visor mire de frente al Menú Principal (+Z).
          En computadora (escritorio) se conserva la orientación libre original de la escena sin fijación. */}
      <group ref={cameraRigRef} position={[0, 0, 0]} rotation={vrMode ? [0, Math.PI, 0] : [0, 0, 0]}>
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
      <pointLight position={[0, 4.5, 0]} intensity={1.0} distance={16} color="#ffe8cc" />
      <hemisphereLight skyColor="#ffffff" groundColor="#332a26" intensity={0.7} />

      {/* Quiosco Ceremonial Giratorio (Opción 1: Rotación Suave Amortiguada en eje Y) */}
      <RotatingKiosk
        targetRotationY={kioskRotationTarget}
        onSelectArtwork={handleSelectArtwork}
        registerMesh={registerMesh}
        unregisterMesh={unregisterMesh}
      />

      {/* Menú Principal Flotante ÚNICO del Museo (solo si no hay un cuadro abierto) */}
      {showButtons && !activeArtwork && (
        <WixarikaWelcomeDashboard
          position={[0, 2.30, 3.75]}
          rotation={[0, Math.PI, 0]}
          stations={CULTURAL_STATIONS}
          onToggleAudio={handleToggleAudio}
          onRecenter={handleRecenter}
          onSelectStation={handleSelectStation}
          registerMesh={registerMesh}
          unregisterMesh={unregisterMesh}
        />
      )}

      {/* Ventana Modal Monumental del Cuadro Seleccionado (Opción C: frente a la mirada del usuario) */}
      {activeArtwork && (
        <DynamicArtworkModal
          artwork={activeArtwork}
          onClose={handleCloseArtwork}
          registerMesh={registerMesh}
          unregisterMesh={unregisterMesh}
        />
      )}

      {/* Botón flotante inferior para Ocultar/Mostrar el Menú Principal o el Cuadro activo */}
      <LowerToggleButton
        showButtons={showButtons}
        setShowButtons={setShowButtons}
        activeArtwork={activeArtwork}
        setActiveArtwork={setActiveArtwork}
        registerMesh={registerMesh}
        unregisterMesh={unregisterMesh}
      />

      {/* Reticula Central con Gaze Fuse calibrado a 3.0 segundos */}
      <GazeReticle
        interactiveObjects={getInteractiveObjects}
        distance={1.2}
        enabled={true}
      />

      {/* Controles de orbita activos en modo pantalla normal (giro 360° libre alrededor del centro del museo como estaba antes) */}
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
