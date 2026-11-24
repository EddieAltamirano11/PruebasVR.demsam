import React, { useRef, useState, useCallback, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { MuseumModel } from './MuseumModel.jsx';
import { WebXRManager } from './WebXRManager.jsx';
import { VRDeviceOrientation } from './VRDeviceOrientation.jsx';
import { StereoVRManager } from './StereoVRManager.jsx';
import { PointerLockLook } from './PointerLockLook.jsx';
import { GazeReticle } from './GazeReticle.jsx';
import { HoverOutline, findOutlineRoot } from './HoverOutline.jsx';
import {
  WixarikaWelcomeDashboard,
  WixarikaArtworkModal,
  WixarikaVRTutorialPanel,
  calculateArtworkModalTransform
} from './wixarika/index.js';
import { SoundFX } from '../services/audioService.js';
import { isIOSDevice } from '../utils/vrSupport.js';
import { STATION_WORLD_DIRECTIONS, computeShortestYawDelta } from '../utils/vrNavigation.js';
import {
  VIEWER_CENTER,
  initialLookTarget,
  lookTargetFromAngles,
  stationLookAngles,
  anglesFromDirection,
  shortestAngle
} from '../utils/viewerCenter.js';

const INITIAL_LOOK_TARGET = initialLookTarget();
// Píxeles de movimiento del mouse (cursor capturado) que cancelan el giro automático
const USER_LOOK_CANCEL_PX = 12;
const _center = new THREE.Vector3(...VIEWER_CENTER);

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

/**
 * Mantiene al espectador exactamente en el centro del museo.
 * - Experiencia 2D: OrbitControls gira la cámara alrededor de un objetivo a 10 cm; después de cada
 *   actualización se trasladan cámara y objetivo juntos de regreso al centro (se conserva la dirección
 *   de la mirada), así que arrastrar o mover el mouse solo gira la vista en su lugar.
 * - Modo visor VR (giroscopio): la cámara vuelve al centro; con WebXR la posición la da el visor.
 */
export function KeepViewerCentered({ orbitRef, vrMode, isWebXRSession }) {
  const { camera } = useThree();
  const offset = useRef(new THREE.Vector3());
  useFrame(() => {
    if (isWebXRSession) return;
    offset.current.copy(_center).sub(camera.position);
    if (offset.current.lengthSq() < 1e-12) return;
    camera.position.add(offset.current);
    if (!vrMode && orbitRef.current) orbitRef.current.target.add(offset.current);
  });
  return null;
}

// Controlador de cámara para navegación suave hacia las salas tanto en PC (OrbitControls)
// como en visor VR móvil (WebXR nativo y modo estereoscópico + giroscopio rotando cameraRigRef)
function StationCameraController({ targetStation, setTargetStation, orbitRef, cameraRigRef, vrMode }) {
  const { camera } = useThree();
  const targetLook = useRef(null);
  const isNavigatingPC = useRef(false);
  const lookDir = useRef(new THREE.Vector3());

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
    if (!stationId) {
      // Navegación cancelada (el visitante movió la vista) o terminada: en 2D se deja de girar
      // de inmediato para que el giro automático no "jale" la vista de regreso.
      if (!vrMode) {
        isNavigatingPC.current = false;
        targetLook.current = null;
      }
      return;
    }

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

    // 2. MODO COMPUTADORA / 2D: el espectador se queda en el centro y solo gira la vista hacia la sala
    const angles = stationLookAngles(stationId);
    if (angles) {
      targetLook.current = angles;
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

    const controls = orbitRef.current;
    if (vrMode || !isNavigatingPC.current || !targetLook.current || !controls) return;

    // Giro suave (yaw/pitch) desde el centro hacia la sala elegida
    lookDir.current.copy(controls.target).sub(camera.position);
    const now = anglesFromDirection(lookDir.current);
    const dYaw = shortestAngle(now.yaw, targetLook.current.yaw);
    const dPitch = targetLook.current.pitch - now.pitch;
    const k = Math.min(1, delta * 5);
    const done = Math.abs(dYaw) < 0.003 && Math.abs(dPitch) < 0.003;
    const yaw = done ? targetLook.current.yaw : now.yaw + dYaw * k;
    const pitch = done ? targetLook.current.pitch : now.pitch + dPitch * k;

    camera.position.copy(_center);
    controls.target.set(...lookTargetFromAngles(yaw, pitch));
    controls.update();

    if (done) {
      isNavigatingPC.current = false;
      targetLook.current = null;
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

// iPhone tiene DPR 3: renderizar a 2× ahorra ~45% de píxeles (y memoria) en el modo estéreo
// sin pérdida visible; en el resto se conserva el tope de 2.5×.
const MAX_DPR =
  typeof window === 'undefined'
    ? 2
    : Math.min(isIOSDevice() ? 2 : 2.5, window.devicePixelRatio || 2);

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
  onToggleBooksOpen: _onToggleBooksOpen,
  showVRTutorial = false,
  onCloseVRTutorial
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
  // Si el visitante mueve la vista mientras la cámara gira sola hacia una sala o menú, se cancela
  // ese giro (antes lo "jalaba" de regreso mientras siguiera moviendo el mouse). Un umbral pequeño
  // evita cancelar por el temblor natural de la mano al hacer clic.
  const navActiveRef = useRef(false);
  const lookDuringNavRef = useRef(0);
  useEffect(() => {
    navActiveRef.current = Boolean(navTargetStation);
    lookDuringNavRef.current = 0;
  }, [navTargetStation]);
  const handleUserLook = useCallback((dx, dy) => {
    if (!navActiveRef.current) return;
    lookDuringNavRef.current += Math.abs(dx) + Math.abs(dy);
    if (lookDuringNavRef.current > USER_LOOK_CANCEL_PX) {
      navActiveRef.current = false;
      setNavTargetStation(null);
    }
  }, []);
  const [isWebXRSession, setIsWebXRSession] = useState(false);
  // Objeto del GLB bajo el punto central (se resalta con un contorno naranja)
  const [outlineTarget, setOutlineTarget] = useState(null);
  const handleReticleHover = useCallback((target, isHovering) => {
    const root = findOutlineRoot(target);
    setOutlineTarget((prev) => (isHovering ? root : prev === root ? null : prev));
  }, []);

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
          id.startsWith('btn-dev-') ||
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
      orbitRef.current.object.position.set(...VIEWER_CENTER);
      orbitRef.current.target.set(...INITIAL_LOOK_TARGET);
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
      dpr={[1, MAX_DPR]}
    >
      {/* Rig de camara para modo normal y modo VR:
          Su rotación en Y se gestiona imperativamente en StationCameraController para que
          los re-renders de React nunca reseteen el giro hacia Deidades/Gastronomía/Fiestas en VR. */}
      <group ref={cameraRigRef} position={[0, 0, 0]}>
        <PerspectiveCamera
          makeDefault
          position={VIEWER_CENTER}
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
      {/* Cada ventana tiene su propio <Suspense>: si algo dentro tarda en cargar (fuentes de texto,
          imágenes), solo se espera esa ventana. Sin esto React ocultaba TODA la escena un instante,
          la cámara principal se reasignaba y OrbitControls se recreaba mirando a Bienvenida
          (en 2D la ficha del platillo quedaba a la espalda del visitante). */}
      {showButtons && !activeArtwork && (
        <Suspense fallback={null}>
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
          vrMode={vrMode}
        />
        </Suspense>
      )}

      {/* Tutorial inicial de la Experiencia VR (letra grande, frente al visitante) */}
      {vrMode && showVRTutorial && (
        <Suspense fallback={null}>
          <WixarikaVRTutorialPanel
            onClose={onCloseVRTutorial}
            registerMesh={registerMesh}
            unregisterMesh={unregisterMesh}
          />
        </Suspense>
      )}

      {/* Contorno naranja sobre el cuadro / botón / platillo del GLB al que apunta el punto central */}
      <Suspense fallback={null}>
        <HoverOutline target={activeArtwork ? null : outlineTarget} />
      </Suspense>

      {/* Ventana Modal Monumental del Cuadro Seleccionado (Opción C: frente a la mirada del usuario) */}
      {activeArtwork && (
        <Suspense fallback={null}>
          <DynamicArtworkModal
            artwork={activeArtwork}
            onClose={handleCloseArtwork}
            registerMesh={registerMesh}
            unregisterMesh={unregisterMesh}
          />
        </Suspense>
      )}

      {/* Reticula Central con Gaze Fuse calibrado a 2.0 segundos + gatillo físico Homido Grab / WebXR */}
      <GazeReticle
        interactiveObjects={getInteractiveObjects}
        onHoverChange={handleReticleHover}
        distance={1.2}
        enabled={true}
        vrMode={vrMode}
      />

      {/* Experiencia 2D: el espectador está fijo en el centro del museo y solo gira la vista
          (arrastre o mouse). Sin zoom ni desplazamiento para no salir del centro. */}
      <OrbitControls
        ref={orbitRef}
        enabled={!vrMode}
        target={INITIAL_LOOK_TARGET}
        enableDamping
        dampingFactor={0.08}
        enableZoom={false}
        enablePan={false}
        rotateSpeed={-0.35}
        maxPolarAngle={Math.PI * 0.82}
        minPolarAngle={Math.PI * 0.18}
        onStart={() => {
          setNavTargetStation(null);
        }}
      />

      {/* Experiencia 2D con mouse "tipo juego": clic captura el cursor, el mouse gira la vista y
          los clics se disparan en el punto central (GazeReticle). Cualquier tecla libera el cursor. */}
      <PointerLockLook enabled={!vrMode} orbitRef={orbitRef} onUserLook={handleUserLook} />
      <KeepViewerCentered orbitRef={orbitRef} vrMode={vrMode} isWebXRSession={isWebXRSession} />

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
