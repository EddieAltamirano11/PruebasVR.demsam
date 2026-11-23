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
  WixarikaWelcomeDashboard,
  WixarikaArtworkModal,
  calculateArtworkModalTransform
} from './wixarika/index.js';
import { SoundFX } from '../services/audioService.js';
import { STATION_WORLD_DIRECTIONS, computeShortestYawDelta } from '../utils/vrNavigation.js';

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

// Pabellón ceremonial del museo con arquitectura e iluminación estática (no gira el museo)
function StaticMuseum({
  onSelectArtwork,
  onOpenAbout,
  onOpenMenu,
  registerMesh,
  unregisterMesh
}) {
  return (
    <group position={[0, 0, 0]} rotation={[0, 0, 0]}>
      {/* Luces de relleno para los 4 cuadrantes cardinales */}
      <directionalLight position={[0, 3.5, -4.5]} intensity={0.6} color="#ffffff" /> {/* Deidades (-Z) */}
      <directionalLight position={[4.5, 3.5, 0]} intensity={0.6} color="#ffffff" />  {/* Gastronomía (+X) */}
      <directionalLight position={[0, 3.5, 4.5]} intensity={0.6} color="#ffffff" />  {/* Bienvenida (+Z) */}
      <directionalLight position={[-4.5, 3.5, 0]} intensity={0.6} color="#ffffff" /> {/* Fiestas (-X) */}

      {/* Modelo 3D del Museo Wixarika v16 con detección e interactividad en los 9 cuadros y botones GLB de bienvenida */}
      <Suspense fallback={null}>
        <MuseumModel
          onSelectArtwork={onSelectArtwork}
          onOpenAbout={onOpenAbout}
          onOpenMenu={onOpenMenu}
          registerMesh={registerMesh}
          unregisterMesh={unregisterMesh}
        />
      </Suspense>
    </group>
  );
}

// Controlador de cámara para navegación suave hacia las salas tanto en PC (OrbitControls)
// como en visor VR móvil (WebXR nativo y modo estereoscópico + giroscopio rotando cameraRigRef)
function StationCameraController({ targetStation, setTargetStation, orbitRef, cameraRigRef, vrMode }) {
  const { camera } = useThree();
  const targetCamPos = useRef(null);
  const targetOrbitTarget = useRef(null);
  const isNavigatingPC = useRef(false);

  const vrTargetYaw = useRef(null);
  const isNavigatingVR = useRef(false);
  const tempDir = useRef(new THREE.Vector3());

  // Inicializar la orientación del rig SOLO al cambiar de modo PC <-> VR
  // (evitando que re-renders de React reseteen el giro elegido en VR)
  useEffect(() => {
    if (!cameraRigRef?.current) return;
    cameraRigRef.current.rotation.set(0, vrMode ? Math.PI : 0, 0);
    cameraRigRef.current.updateMatrixWorld(true);
    isNavigatingVR.current = false;
    vrTargetYaw.current = null;
  }, [vrMode, cameraRigRef]);

  useEffect(() => {
    const stationId = typeof targetStation === 'string' ? targetStation : targetStation?.id;
    if (!stationId) return;

    // 1. MODO VISOR VR (Celular WebXR o Estereoscópico con Giroscopio):
    //    Calcula el giro mínimo en Y del cameraRig para dejar la sección seleccionada justo al frente.
    if (vrMode) {
      const rig = cameraRigRef?.current;
      const desiredArr = STATION_WORLD_DIRECTIONS[stationId];
      if (!rig || !desiredArr) return;

      rig.updateMatrixWorld(true);
      camera.updateWorldMatrix(true, false);
      camera.getWorldDirection(tempDir.current);
      tempDir.current.y = 0;

      if (tempDir.current.lengthSq() < 1e-4) {
        tempDir.current.set(0, 0, 1);
      } else {
        tempDir.current.normalize();
      }

      const desiredDir = new THREE.Vector3(desiredArr[0], 0, desiredArr[2]);
      const deltaYaw = computeShortestYawDelta(tempDir.current, desiredDir);

      vrTargetYaw.current = rig.rotation.y + deltaYaw;
      isNavigatingVR.current = true;
      return;
    }

    // 2. MODO COMPUTADORA (PC con OrbitControls)
    let pos = null;
    let lookTarget = null;
    if (stationId === 'deidades') {
      // Muro Norte (-Z): la cámara se posiciona al Sur (+Z) mirando al Norte
      pos = new THREE.Vector3(0, 1.65, 2.5);
      lookTarget = new THREE.Vector3(0, 1.85, 0);
    } else if (stationId === 'gastronomia') {
      // Muro Este (+X): la cámara se posiciona al Oeste (-X) mirando al Este
      pos = new THREE.Vector3(-2.5, 1.60, 0);
      lookTarget = new THREE.Vector3(0, 1.50, 0);
    } else if (stationId === 'fiestas') {
      // Muro Oeste (-X): la cámara se posiciona al Este (+X) mirando al Oeste
      pos = new THREE.Vector3(2.5, 1.65, 0);
      lookTarget = new THREE.Vector3(0, 1.85, 0);
    } else if (stationId === 'home' || stationId === 'bienvenida') {
      // Bienvenida / Menú Principal (+Z):
      // Se posiciona en [0, 1.65, -2.5] con target [0, 1.80, 0] para que la mira
      // quede EXACTAMENTE en el espacio neutro entre las dos filas de cards (Y=2.03 en mundo, local Y=-0.275),
      // sin activar el Gaze Fuse en Gastronomía ni en ningún botón.
      pos = new THREE.Vector3(0, 1.65, -2.5);
      lookTarget = new THREE.Vector3(0, 1.80, 0);
    }

    if (pos && lookTarget) {
      targetCamPos.current = pos;
      targetOrbitTarget.current = lookTarget;
      isNavigatingPC.current = true;
    }
  }, [targetStation, vrMode, camera, cameraRigRef]);

  useFrame((_, delta) => {
    // Giro suave y ágil del rig en modo VR móvil
    if (vrMode && isNavigatingVR.current && vrTargetYaw.current !== null && cameraRigRef?.current) {
      const rig = cameraRigRef.current;
      const diff = vrTargetYaw.current - rig.rotation.y;
      if (Math.abs(diff) < 0.004) {
        rig.rotation.y = vrTargetYaw.current;
        rig.updateMatrixWorld(true);
        isNavigatingVR.current = false;
        vrTargetYaw.current = null;
        setTargetStation(null);
      } else {
        rig.rotation.y = THREE.MathUtils.lerp(rig.rotation.y, vrTargetYaw.current, Math.min(1, delta * 8.5));
        rig.updateMatrixWorld(true);
      }
      return;
    }

    if (vrMode || !isNavigatingPC.current || !targetCamPos.current || !targetOrbitTarget.current) return;

    // Interpolación suave y ágil hacia la posición y target de la estación en PC
    camera.position.lerp(targetCamPos.current, Math.min(1, delta * 4.5));
    if (orbitRef.current) {
      orbitRef.current.target.lerp(targetOrbitTarget.current, Math.min(1, delta * 4.5));
      orbitRef.current.update();
    }

    if (
      camera.position.distanceTo(targetCamPos.current) < 0.04 &&
      (!orbitRef.current || orbitRef.current.target.distanceTo(targetOrbitTarget.current) < 0.04)
    ) {
      camera.position.copy(targetCamPos.current);
      if (orbitRef.current) {
        orbitRef.current.target.copy(targetOrbitTarget.current);
        orbitRef.current.update();
      }
      isNavigatingPC.current = false;
      targetCamPos.current = null;
      targetOrbitTarget.current = null;
      setTargetStation(null);
    }
  });

  return null;
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
  const [internalShowButtons, setInternalShowButtons] = useState(false);
  const showButtons =
    externalShowButtons !== undefined ? externalShowButtons : internalShowButtons;
  const setShowButtons = externalSetShowButtons || setInternalShowButtons;

  const [activeArtwork, setActiveArtwork] = useState(null);
  const [dashboardView, setDashboardView] = useState('home');
  const [navTargetStation, setNavTargetStation] = useState(null);
  const [isWebXRSession, setIsWebXRSession] = useState(false);

  const handleWebXRSessionChange = useCallback(
    (active) => {
      setIsWebXRSession(active);
      setVrMode?.(active);
    },
    [setVrMode]
  );

  // Manejador al seleccionar una sala cultural (Deidades, Gastronomía o Fiestas)
  // En lugar de rotar el museo, orienta la cámara (PC) o el cameraRig (VR móvil) hacia el muro seleccionado.
  const handleSelectStation = useCallback((stationId) => {
    setNavTargetStation({ id: stationId, ts: Date.now() });
    if (stationId === 'home' || stationId === 'bienvenida') {
      setShowButtons(true);
    } else {
      setShowButtons(false);
    }
  }, [setShowButtons]);

  // Manejador para desplegar el Menú Principal (desde el botón MENÚ del muro)
  const handleOpenMenu = useCallback(() => {
    setActiveArtwork(null);
    setDashboardView('home');
    setShowButtons(true);
    setNavTargetStation({ id: 'home', ts: Date.now() });
  }, [setShowButtons]);

  // Manejador para desplegar Información Institucional (desde el botón ACERCA DE del muro)
  const handleOpenAbout = useCallback(() => {
    setActiveArtwork(null);
    setDashboardView('about');
    setShowButtons(true);
    setNavTargetStation({ id: 'home', ts: Date.now() });
  }, [setShowButtons]);

  // Manejador al cerrar el menú principal o acerca de
  const handleCloseDashboard = useCallback(() => {
    setShowButtons(false);
    setDashboardView('home');
  }, [setShowButtons]);

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
      // Solo permitir interactuar con el botón badge de cerrar y el bloqueador de fondo.
      return all.filter((mesh) => {
        const id = mesh.userData?.id || '';
        return (
          id.includes('btn-close') ||
          id.includes('close-artwork') ||
          id === 'artwork-modal-backdrop-blocker'
        );
      });
    }
    if (showButtons) {
      // Cuando el menú de bienvenida o acerca de está abierto,
      // solo permitir interactuar con elementos dentro del dashboard y su botón de cierre
      return all.filter((mesh) => {
        const id = mesh.userData?.id || '';
        return (
          id.startsWith('btn-dash-') ||
          id.startsWith('btn-books-') ||
          id.startsWith('btn-videos-') ||
          id.startsWith('btn-about-') ||
          id.startsWith('btn-ref-') ||
          id.startsWith('btn-empty-') ||
          id.includes('btn-close') ||
          id === 'dashboard-backdrop-blocker'
        );
      });
    }
    // Cuando no hay ningún menú abierto, interactuar con cuadros y botones de pared
    return all;
  }, [activeArtwork, showButtons]);

  // Alternar audio cultural tradicional
  const handleToggleAudio = useCallback(() => {
    SoundFX.toggleAmbient();
  }, []);

  // Recentrar visor en VR o controles de órbita en computadora
  const handleRecenter = useCallback(() => {
    setNavTargetStation({ id: 'home', ts: Date.now() });
    if (onRecenterRef?.current) {
      onRecenterRef.current();
    } else if (orbitRef.current) {
      orbitRef.current.target.set(0, 1.80, 0);
      orbitRef.current.object.position.set(0, 1.65, -2.5);
      orbitRef.current.update();
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
    setShowButtons(false);
  }, [setShowButtons]);

  return (
    <Canvas
      style={{ width: '100%', height: '100%', background: '#0a0f1d' }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      dpr={[1, typeof window !== 'undefined' ? Math.min(2.5, window.devicePixelRatio || 2) : 2]}
    >
      {/* Rig de camara para modo normal y modo VR:
          Su rotación en Y se gestiona imperativamente en StationCameraController para que
          los re-renders de React nunca reseteen el giro hacia Deidades/Gastronomía/Fiestas en VR. */}
      <group ref={cameraRigRef} position={[0, 0, 0]}>
        <PerspectiveCamera
          makeDefault
          position={vrMode ? [0, 1.6, 0] : [0, 1.65, -2.5]}
          fov={75}
          near={0.05}
          far={1000}
        />
      </group>

      {/* Navegador suave de cámara para PC y giro de rig para visor VR móvil */}
      <StationCameraController
        targetStation={navTargetStation}
        setTargetStation={setNavTargetStation}
        orbitRef={orbitRef}
        cameraRigRef={cameraRigRef}
        vrMode={vrMode}
      />

      {/* Iluminacion Museografica Integral */}
      <ambientLight color="#ffffff" intensity={1.3} />
      <directionalLight position={[0, 8.5, 0]} intensity={1.2} color="#fffcf5" castShadow={false} />
      <pointLight position={[0, 4.5, 0]} intensity={1.0} distance={16} color="#ffe8cc" />
      <hemisphereLight skyColor="#ffffff" groundColor="#332a26" intensity={0.7} />

      {/* Pabellón Ceremonial Estático (el museo nunca gira, botones de pared Acerca de y Menú integrados en el GLB) */}
      <StaticMuseum
        onSelectArtwork={handleSelectArtwork}
        onOpenAbout={handleOpenAbout}
        onOpenMenu={handleOpenMenu}
        registerMesh={registerMesh}
        unregisterMesh={unregisterMesh}
      />

      {/* Menú Principal Flotante ÚNICO del Museo (anclado en Bienvenida +Z) */}
      {showButtons && !activeArtwork && (
        <WixarikaWelcomeDashboard
          position={[0, 2.30, 3.75]}
          rotation={[0, Math.PI, 0]}
          initialView={dashboardView}
          stations={CULTURAL_STATIONS}
          onToggleAudio={handleToggleAudio}
          onRecenter={handleRecenter}
          onSelectStation={handleSelectStation}
          onClose={handleCloseDashboard}
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

      {/* Reticula Central con Gaze Fuse calibrado a 2.0 segundos + gatillo físico Homido Grab / WebXR */}
      <GazeReticle
        interactiveObjects={getInteractiveObjects}
        distance={1.2}
        enabled={true}
        vrMode={vrMode}
      />

      {/* Controles de orbita activos en modo pantalla normal (giro 360° libre alrededor del centro del museo) */}
      <OrbitControls
        ref={orbitRef}
        enabled={!vrMode}
        target={[0, 1.80, 0]}
        enableDamping
        dampingFactor={0.05}
        minDistance={0.2}
        maxDistance={7.5}
        maxPolarAngle={Math.PI - 0.05}
        minPolarAngle={0.05}
        onStart={() => {
          setNavTargetStation(null);
        }}
      />

      {/* Gestor Nativo WebXR */}
      <WebXRManager onSessionChange={handleWebXRSessionChange} onTriggerRef={onWebXRTriggerRef} />

      {/* Giroscopio y vista estereo dual cuando no hay sesion WebXR activa (Modo Visor Homido / Cardboard) */}
      {vrMode && !isWebXRSession && (
        <VRDeviceOrientation onRecenterRef={onRecenterRef} />
      )}
      {vrMode && !isWebXRSession && <StereoVRManager eyeSep={0.064} />}
    </Canvas>
  );
}

export default MuseumScene;
