import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useFrame, useThree, createPortal } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { SoundFX } from '../utils/sound.js';
import { WixarikaVRButton, TsikuriDiamond, WixarikaVRBookPanel } from './wixarika/index.js';

// Componente de Boton 3D interactivo para VR con estética ceremonial Wixárika
function VRButton3D({
  position,
  width = 1.4,
  height = 0.22,
  label,
  sublabel,
  icon,
  active = false,
  variant = 'solar',
  activeColor,
  idleColor,
  hoverColor,
  textColor,
  onClick,
  onRegister,
  onUnregister,
  hoveredId,
  fuseProgress = 0,
  showDiamonds = true,
  id
}) {
  // Mapeo retrocompatible de colores a variantes Wixárika
  let resolvedVariant = variant;
  if (!variant || variant === 'solar') {
    if (activeColor === '#0284c7' || activeColor === '#2563eb') resolvedVariant = 'water';
    else if (activeColor === '#10b981') resolvedVariant = 'hikuri';
    else if (activeColor === '#eab308' || activeColor === '#f59e0b') resolvedVariant = 'solar';
    else if (activeColor === '#6366f1') resolvedVariant = 'kauyumari';
    else if (activeColor === '#ef4444' || idleColor === '#7f1d1d') resolvedVariant = 'danger';
  }

  return (
    <WixarikaVRButton
      id={id}
      position={position}
      width={width}
      height={height}
      label={label}
      sublabel={sublabel}
      icon={icon}
      active={active}
      variant={resolvedVariant}
      onClick={onClick}
      onRegister={onRegister}
      onUnregister={onUnregister}
      hoveredId={hoveredId}
      fuseProgress={fuseProgress}
      showDiamonds={showDiamonds}
    />
  );
}

export function VRMenu3D({
  isPlaying,
  setIsPlaying,
  speed,
  setSpeed,
  followActive,
  setFollowActive,
  followType,
  setFollowType,
  fixedView,
  setFixedView,
  lightMode,
  setLightMode,
  onRestart,
  onRecenterRef,
  cameraRigRef
}) {
  const { camera, gl } = useThree();
  const [minimized, setMinimized] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const [fuseProgress, setFuseProgress] = useState(0);
  const [showBookPanel, setShowBookPanel] = useState(false);

  const menuGroupRef = useRef();
  const progressMeshRef = useRef();

  // Registro de botones interactivos para el raycaster
  const buttonsRegistry = useRef(new Map());
  const raycaster = useRef(new THREE.Raycaster());
  const rayOrigin = useRef(new THREE.Vector3());
  const rayDir = useRef(new THREE.Vector3());

  const fuseTimer = useRef(0);
  const lastHoveredRef = useRef(null);
  const lastTriggerTime = useRef(0);

  const tempPos = useRef(new THREE.Vector3());
  const tempForward = useRef(new THREE.Vector3());
  const tempTarget = useRef(new THREE.Vector3());
  const tempOffset = useRef(new THREE.Vector3());
  const tempMenuPos = useRef(new THREE.Vector3());

  // Registrar y desregistrar botones
  const registerButton = (id, mesh, onClick) => {
    buttonsRegistry.current.set(id, { mesh, onClick });
  };
  const unregisterButton = (id) => {
    buttonsRegistry.current.delete(id);
  };

  // Posicionar el menu relativo al Camera Rig o al frente del usuario
  const recenterMenu = useCallback(() => {
    if (!menuGroupRef.current) return;
    const rig = cameraRigRef?.current;
    if (rig) {
      tempOffset.current.set(0, 0, -2.2);
      tempOffset.current.applyQuaternion(rig.quaternion);
      tempMenuPos.current.copy(rig.position).add(tempOffset.current);
      menuGroupRef.current.position.copy(tempMenuPos.current);
      menuGroupRef.current.lookAt(rig.position.x, tempMenuPos.current.y, rig.position.z);
    } else if (camera) {
      camera.getWorldPosition(tempPos.current);
      camera.getWorldDirection(tempForward.current);
      tempForward.current.y = 0;
      if (tempForward.current.lengthSq() < 0.001) {
        tempForward.current.set(0, 0, -1);
      } else {
        tempForward.current.normalize();
      }
      tempTarget.current.copy(tempPos.current).addScaledVector(tempForward.current, 2.2);
      menuGroupRef.current.position.copy(tempTarget.current);
      menuGroupRef.current.lookAt(tempPos.current.x, tempTarget.current.y, tempPos.current.z);
    }
  }, [cameraRigRef, camera]);

  // Posicionar inicialmente al entrar en VR
  useEffect(() => {
    recenterMenu();
  }, [recenterMenu]);

  // Si se solicita recentrado desde la interfaz, recentrar tambien el menu frente al usuario
  useEffect(() => {
    if (onRecenterRef) {
      const prevRecenter = onRecenterRef.current;
      onRecenterRef.current = () => {
        if (prevRecenter) prevRecenter();
        recenterMenu();
      };
    }
  }, [onRecenterRef, recenterMenu]);

  // Disparar accion en el boton enfocado (soporte gatillo Homido Grab / toque de pantalla / WebXR select)
  const triggerCurrentButton = useCallback(() => {
    const now = Date.now();
    // Debounce de 250ms para evitar doble disparo por eventos consecutivos
    if (now - lastTriggerTime.current < 250) return;
    lastTriggerTime.current = now;

    let targetId = lastHoveredRef.current;

    // Si por timing de frame no estaba registrado en lastHovered, raycast inmediato desde la camara
    if (!targetId && camera) {
      camera.getWorldPosition(rayOrigin.current);
      camera.getWorldDirection(rayDir.current);
      raycaster.current.set(rayOrigin.current, rayDir.current);

      const meshes = Array.from(buttonsRegistry.current.values()).map((v) => v.mesh);
      const intersects = raycaster.current.intersectObjects(meshes, false);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object;
        for (const [id, val] of buttonsRegistry.current.entries()) {
          if (val.mesh === hitMesh) {
            targetId = id;
            break;
          }
        }
      }
    }

    if (targetId) {
      const item = buttonsRegistry.current.get(targetId);
      if (item && item.onClick) {
        SoundFX.playClick();
        item.onClick();
        fuseTimer.current = 0;
        setFuseProgress(0);
        if (progressMeshRef.current) {
          progressMeshRef.current.scale.set(0, 0, 1);
        }
      }
    }
  }, [camera]);

  // Escuchar eventos de WebXR (select) y DOM (touch/pointerdown) para el gatillo del visor Homido Grab
  useEffect(() => {
    // 1. WebXR Controllers (Cardboard, WebXR Polyfill, sesion nativa WebXR)
    const controller0 = gl.xr?.getController ? gl.xr.getController(0) : null;
    const controller1 = gl.xr?.getController ? gl.xr.getController(1) : null;

    if (controller0) controller0.addEventListener('select', triggerCurrentButton);
    if (controller1) controller1.addEventListener('select', triggerCurrentButton);

    const onSessionStart = () => {
      const session = gl.xr?.getSession ? gl.xr.getSession() : null;
      if (session) {
        session.addEventListener('select', triggerCurrentButton);
      }
    };

    if (gl.xr) {
      gl.xr.addEventListener('sessionstart', onSessionStart);
      const existingSession = gl.xr.getSession ? gl.xr.getSession() : null;
      if (existingSession) {
        existingSession.addEventListener('select', triggerCurrentButton);
      }
    }

    // 2. DOM Events (Para visores Homido Grab que tocan la pantalla tactil, fallback y split-screen)
    const handleDomClick = (e) => {
      if (e.target && e.target.closest && e.target.closest('button')) return;
      triggerCurrentButton();
    };

    window.addEventListener('pointerdown', handleDomClick, { passive: true });
    window.addEventListener('touchstart', handleDomClick, { passive: true });

    return () => {
      if (controller0) controller0.removeEventListener('select', triggerCurrentButton);
      if (controller1) controller1.removeEventListener('select', triggerCurrentButton);
      if (gl.xr) {
        gl.xr.removeEventListener('sessionstart', onSessionStart);
        const session = gl.xr.getSession ? gl.xr.getSession() : null;
        if (session) session.removeEventListener('select', triggerCurrentButton);
      }
      window.removeEventListener('pointerdown', handleDomClick);
      window.removeEventListener('touchstart', handleDomClick);
    };
  }, [gl, triggerCurrentButton]);

  // Frame a frame: Raycasting continuo para el apuntador y actualizacion de menu
  useFrame((state, delta) => {
    if (!camera) return;

    // 1. Raycasting continuo desde el visor hacia el frente para detectar botones bajo el apuntador
    camera.getWorldPosition(rayOrigin.current);
    camera.getWorldDirection(rayDir.current);
    raycaster.current.set(rayOrigin.current, rayDir.current);

    // 2. Anclar el menu al Camera Rig: acompana el desplazamiento del usuario en WebXR
    // Posicionado 1.15m a la izquierda para NO obstruir la vision frontal del Bocho
    const rig = cameraRigRef?.current;
    if (menuGroupRef.current) {
      if (rig) {
        tempOffset.current.set(-1.15, -0.05, -2.1);
        tempOffset.current.applyQuaternion(rig.quaternion);
        tempMenuPos.current.copy(rig.position).add(tempOffset.current);
        menuGroupRef.current.position.copy(tempMenuPos.current);
        menuGroupRef.current.lookAt(rig.position.x, tempMenuPos.current.y, rig.position.z);
      }
    }

    // 3. Evaluar colision del apuntador con los botones
    const meshes = Array.from(buttonsRegistry.current.values()).map((v) => v.mesh);
    const intersects = raycaster.current.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      let foundId = null;
      for (const [id, val] of buttonsRegistry.current.entries()) {
        if (val.mesh === hitMesh) {
          foundId = id;
          break;
        }
      }

      if (foundId) {
        if (lastHoveredRef.current !== foundId) {
          SoundFX.playHover();
          lastHoveredRef.current = foundId;
          setHoveredId(foundId);
          fuseTimer.current = 0;
        }

        // Incrementar temporizador de mirada (1.2 segundos para activar automaticamente)
        fuseTimer.current += delta;
        const progress = Math.min(1.0, fuseTimer.current / 1.2);
        setFuseProgress(progress);

        if (progressMeshRef.current) {
          progressMeshRef.current.scale.set(progress, progress, 1);
        }

        // Gaze fuse completado: disparar accion
        if (fuseTimer.current >= 1.2) {
          const item = buttonsRegistry.current.get(foundId);
          if (item && item.onClick) {
            SoundFX.playClick();
            item.onClick();
          }
          fuseTimer.current = 0;
          setFuseProgress(0);
          if (progressMeshRef.current) {
            progressMeshRef.current.scale.set(0, 0, 1);
          }
        }
        return;
      }
    }

    // Si el apuntador sale de cualquier boton
    if (lastHoveredRef.current !== null) {
      lastHoveredRef.current = null;
      setHoveredId(null);
      fuseTimer.current = 0;
      setFuseProgress(0);
      if (progressMeshRef.current) {
        progressMeshRef.current.scale.set(0, 0, 1);
      }
    }
  });

  return (
    <>
      {/* ==================================================== */}
      {/* RETICULA / APUNTADOR VR 100% FIJO EN LA CAMARA       */}
      {/* ==================================================== */}
      {camera && createPortal(
        <group position={[0, 0, -1.2]} renderOrder={9999}>
          {/* Punto central solido para maxima precision del apuntador */}
          <mesh renderOrder={9999}>
            <circleGeometry args={[0.007, 24]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.95}
              depthTest={false}
              depthWrite={false}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>

          {/* Anillo de contraste exterior oscuro para que resalte en cielos brillantes */}
          <mesh position={[0, 0, -0.001]} renderOrder={9998}>
            <ringGeometry args={[0.015, 0.026, 32]} />
            <meshBasicMaterial
              color="#000000"
              transparent
              opacity={0.5}
              depthTest={false}
              depthWrite={false}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>

          {/* Anillo interactivo brillante que resalta en cian al apuntar a un boton */}
          <mesh renderOrder={9999}>
            <ringGeometry args={[0.016, 0.024, 32]} />
            <meshBasicMaterial
              color={hoveredId ? '#38bdf8' : '#ffffff'}
              transparent
              opacity={hoveredId ? 1.0 : 0.75}
              depthTest={false}
              depthWrite={false}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>

          {/* Disco interior de progreso de mirada (se expande al mirar) */}
          <mesh ref={progressMeshRef} scale={[0, 0, 1]} renderOrder={9999}>
            <circleGeometry args={[0.016, 32]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.85}
              depthTest={false}
              depthWrite={false}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
        </group>,
        camera
      )}

      {/* ==================================================== */}
      {/* PANEL FLOTANTE EN ESPACIO 3D                         */}
      {/* ==================================================== */}
      <group ref={menuGroupRef}>
        {/* BOTON MINIMIZADO FLOTANTE ABAJO CUANDO EL MENU ESTA OCULTO */}
        {minimized && (
          <group position={[0, -0.80, 0]}>
            <VRButton3D
              id="btn-reopen-menu"
              position={[0, 0, 0]}
              width={1.20}
              height={0.22}
              label="Mostrar Botones / Menú"
              icon="☀️"
              variant="solar"
              onClick={() => setMinimized(false)}
              onRegister={registerButton}
              onUnregister={unregisterButton}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
            />
          </group>
        )}

        {/* MODULO CATÁLOGO DE LIBROS WIXÁRIKA (Para Eddie y Luis Carlos) */}
        {!minimized && showBookPanel && (
          <group position={[0, 0, 0]}>
            <WixarikaVRBookPanel
              onClose={() => setShowBookPanel(false)}
              onRegister={registerButton}
              onUnregister={unregisterButton}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
            />
          </group>
        )}

        {/* PANEL PRINCIPAL COMPLETO CON IDENTIDAD WIXÁRIKA */}
        {!minimized && !showBookPanel && (
          <group position={[0, 0, 0]}>
            {/* 1. Marco exterior resplandeciente */}
            <mesh position={[0, 0, -0.015]}>
              <planeGeometry args={[1.88, 2.15]} />
              <meshBasicMaterial color="#f59e0b" transparent opacity={0.65} />
            </mesh>

            {/* 2. Placa base de Obsidiana Sagrada translúcida (WCAG AAA) */}
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[1.84, 2.11]} />
              <meshBasicMaterial color="#070a14" transparent opacity={0.96} />
            </mesh>

            {/* 3. Cenefa superior decorativa de Chaquira */}
            <mesh position={[0, 1.01, -0.005]}>
              <planeGeometry args={[1.76, 0.03]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.9} />
            </mesh>

            {/* 4. Cresta Sagrada Tsikuri (Ojo de Dios) en el encabezado */}
            <TsikuriDiamond
              size={0.16}
              position={[0, 1.08, 0.01]}
              colors={['#f59e0b', '#ef4444', '#38bdf8', '#ffffff']}
            />
            <TsikuriDiamond
              size={0.08}
              position={[-0.82, 0.96, 0.01]}
              colors={['#f59e0b', '#38bdf8', '#ffffff', '#ef4444']}
            />
            <TsikuriDiamond
              size={0.08}
              position={[0.82, 0.96, 0.01]}
              colors={['#f59e0b', '#38bdf8', '#ffffff', '#ef4444']}
            />

            {/* 5. Encabezado Monumental */}
            <Text position={[0, 0.91, 0.01]} fontSize={0.075} color="#fde047" anchorX="center" outlineWidth={0.002} outlineColor="#040711">
              CONTROL DE ESCENARIO VR
            </Text>
            <Text position={[0, 0.83, 0.01]} fontSize={0.042} color="#38bdf8" anchorX="center">
              Museo Wixárika • Biblioteca Solón Argüello
            </Text>

            {/* SECCION LIBROS: BIBLIOTECA SOLÓN ARGÜELLO (Módulo Reutilizable) */}
            <Text position={[-0.78, 0.72, 0.01]} fontSize={0.038} color="#fde047" anchorX="left">
              ✦ FONDO BIBLIOTECA SOLÓN ARGÜELLO
            </Text>
            <VRButton3D
              id="btn-open-books"
              position={[0, 0.60, 0]}
              width={1.60}
              height={0.16}
              label="Catálogo de Libros Wixárika"
              icon="📚"
              variant="solar"
              onClick={() => setShowBookPanel(true)}
              onRegister={registerButton}
              onUnregister={unregisterButton}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
            />

            {/* SECCION 1: MODO SEGUIMIENTO */}
            <Text position={[-0.78, 0.46, 0.01]} fontSize={0.038} color="#94a3b8" anchorX="left">
              MODO SEGUIMIENTO
            </Text>
            <VRButton3D
              id="btn-toggle-follow"
              position={[0, 0.35, 0]}
              width={1.60}
              height={0.15}
              label={followActive ? 'Seguimiento: ACTIVO' : 'Seguir Auto en Marcha'}
              icon="◈"
              active={followActive}
              variant={followActive ? 'water' : 'obsidian'}
              onClick={() => setFollowActive(!followActive)}
              onRegister={registerButton}
              onUnregister={unregisterButton}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
            />

            {/* Sub-botones de tipo de seguimiento */}
            <VRButton3D
              id="btn-cam-chase"
              position={[-0.54, 0.19, 0]}
              width={0.49}
              height={0.13}
              label="Atrás"
              active={followActive && followType === 'chase'}
              variant={followActive && followType === 'chase' ? 'water' : 'obsidian'}
              onClick={() => {
                setFollowActive(true);
                setFollowType('chase');
              }}
              onRegister={registerButton}
              onUnregister={unregisterButton}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />
            <VRButton3D
              id="btn-cam-side"
              position={[0, 0.19, 0]}
              width={0.49}
              height={0.13}
              label="Lateral"
              active={followActive && followType === 'side'}
              variant={followActive && followType === 'side' ? 'water' : 'obsidian'}
              onClick={() => {
                setFollowActive(true);
                setFollowType('side');
              }}
              onRegister={registerButton}
              onUnregister={unregisterButton}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />
            <VRButton3D
              id="btn-cam-roof"
              position={[0.54, 0.19, 0]}
              width={0.49}
              height={0.13}
              label="Techo"
              active={followActive && followType === 'roof'}
              variant={followActive && followType === 'roof' ? 'water' : 'obsidian'}
              onClick={() => {
                setFollowActive(true);
                setFollowType('roof');
              }}
              onRegister={registerButton}
              onUnregister={unregisterButton}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />

            {/* SECCION 2: CONTROL DEL AUTO */}
            <Text position={[-0.78, 0.07, 0.01]} fontSize={0.038} color="#94a3b8" anchorX="left">
              RECORRIDO DEL AUTO
            </Text>
            <VRButton3D
              id="btn-play-pause"
              position={[-0.42, -0.04, 0]}
              width={0.76}
              height={0.14}
              label={isPlaying ? 'Pausar' : 'Reanudar'}
              icon={isPlaying ? '⏸' : '▶'}
              active={isPlaying}
              variant={isPlaying ? 'water' : 'solar'}
              onClick={() => setIsPlaying(!isPlaying)}
              onRegister={registerButton}
              onUnregister={unregisterButton}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />
            <VRButton3D
              id="btn-restart"
              position={[0.42, -0.04, 0]}
              width={0.76}
              height={0.14}
              label="Reiniciar"
              icon="↺"
              variant="hikuri"
              onClick={onRestart}
              onRegister={registerButton}
              onUnregister={unregisterButton}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />

            {/* Selector de velocidad */}
            <VRButton3D
              id="btn-spd-1"
              position={[-0.54, -0.19, 0]}
              width={0.49}
              height={0.12}
              label="1.0x"
              active={speed === 1.0}
              variant={speed === 1.0 ? 'solar' : 'obsidian'}
              onClick={() => setSpeed(1.0)}
              onRegister={registerButton}
              onUnregister={unregisterButton}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />
            <VRButton3D
              id="btn-spd-2"
              position={[0, -0.19, 0]}
              width={0.49}
              height={0.12}
              label="2.0x"
              active={speed === 2.0}
              variant={speed === 2.0 ? 'solar' : 'obsidian'}
              onClick={() => setSpeed(2.0)}
              onRegister={registerButton}
              onUnregister={unregisterButton}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />
            <VRButton3D
              id="btn-spd-05"
              position={[0.54, -0.19, 0]}
              width={0.49}
              height={0.12}
              label="0.5x"
              active={speed === 0.5}
              variant={speed === 0.5 ? 'solar' : 'obsidian'}
              onClick={() => setSpeed(0.5)}
              onRegister={registerButton}
              onUnregister={unregisterButton}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />

            {/* SECCION 3: PUNTOS DE VISTA FIJOS */}
            <Text position={[-0.78, -0.30, 0.01]} fontSize={0.038} color="#94a3b8" anchorX="left">
              PUNTOS DE VISTA FIJOS
            </Text>
            <VRButton3D
              id="btn-view-origin"
              position={[-0.54, -0.40, 0]}
              width={0.49}
              height={0.12}
              label="Salida"
              active={!followActive && fixedView === 'origin'}
              variant={!followActive && fixedView === 'origin' ? 'kauyumari' : 'obsidian'}
              onClick={() => {
                setFollowActive(false);
                setFixedView('origin');
              }}
              onRegister={registerButton}
              onUnregister={unregisterButton}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />
            <VRButton3D
              id="btn-view-center"
              position={[0, -0.40, 0]}
              width={0.49}
              height={0.12}
              label="Acera"
              active={!followActive && fixedView === 'center'}
              variant={!followActive && fixedView === 'center' ? 'kauyumari' : 'obsidian'}
              onClick={() => {
                setFollowActive(false);
                setFixedView('center');
              }}
              onRegister={registerButton}
              onUnregister={unregisterButton}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />
            <VRButton3D
              id="btn-view-aerial"
              position={[0.54, -0.40, 0]}
              width={0.49}
              height={0.12}
              label="Aérea"
              active={!followActive && fixedView === 'aerial'}
              variant={!followActive && fixedView === 'aerial' ? 'kauyumari' : 'obsidian'}
              onClick={() => {
                setFollowActive(false);
                setFixedView('aerial');
              }}
              onRegister={registerButton}
              onUnregister={unregisterButton}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />

            {/* SECCION 4: ILUMINACION */}
            <Text position={[-0.78, -0.51, 0.01]} fontSize={0.038} color="#94a3b8" anchorX="left">
              ILUMINACIÓN SAGRADA
            </Text>
            <VRButton3D
              id="btn-light-day"
              position={[-0.54, -0.61, 0]}
              width={0.49}
              height={0.12}
              label="Día"
              icon="☀️"
              active={lightMode === 'day'}
              variant={lightMode === 'day' ? 'solar' : 'obsidian'}
              onClick={() => setLightMode('day')}
              onRegister={registerButton}
              onUnregister={unregisterButton}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />
            <VRButton3D
              id="btn-light-sunset"
              position={[0, -0.61, 0]}
              width={0.49}
              height={0.12}
              label="Tarde"
              icon="🌅"
              active={lightMode === 'sunset'}
              variant={lightMode === 'sunset' ? 'danger' : 'obsidian'}
              onClick={() => setLightMode('sunset')}
              onRegister={registerButton}
              onUnregister={unregisterButton}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />
            <VRButton3D
              id="btn-light-night"
              position={[0.54, -0.61, 0]}
              width={0.49}
              height={0.12}
              label="Noche"
              icon="🌙"
              active={lightMode === 'night'}
              variant={lightMode === 'night' ? 'kauyumari' : 'obsidian'}
              onClick={() => setLightMode('night')}
              onRegister={registerButton}
              onUnregister={unregisterButton}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />

            {/* BOTON OCULTAR MENU / BOTONES (ABAJO) */}
            <VRButton3D
              id="btn-hide-menu"
              position={[0, -0.78, 0]}
              width={1.60}
              height={0.14}
              label="Ocultar Botones / Menú (Modo Libre)"
              icon="👁️‍🗨️"
              variant="danger"
              onClick={() => setMinimized(true)}
              onRegister={registerButton}
              onUnregister={unregisterButton}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />
          </group>
        )}
      </group>
    </>
  );
}
