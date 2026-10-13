import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useFrame, useThree, createPortal } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { SoundFX } from '../utils/sound.js';

// Componente de Boton 3D interactivo para VR
function VRButton3D({
  position,
  width = 1.4,
  height = 0.22,
  label,
  active = false,
  activeColor = '#0284c7',
  idleColor = '#1e293b',
  hoverColor = '#334155',
  textColor = '#ffffff',
  onClick,
  onRegister,
  onUnregister,
  hoveredId,
  id
}) {
  const meshRef = useRef();
  const isHovered = hoveredId === id;

  useEffect(() => {
    if (meshRef.current && onRegister) {
      onRegister(id, meshRef.current, onClick);
    }
    return () => {
      if (onUnregister) onUnregister(id);
    };
  }, [id, onClick, onRegister, onUnregister]);

  const currentColor = active ? activeColor : isHovered ? hoverColor : idleColor;
  const borderColor = active ? '#38bdf8' : isHovered ? '#67e8f9' : 'rgba(255, 255, 255, 0.2)';

  return (
    <group position={position}>
      {/* Borde exterior brillante */}
      <mesh position={[0, 0, -0.002]}>
        <planeGeometry args={[width + 0.03, height + 0.03]} />
        <meshBasicMaterial color={borderColor} transparent opacity={0.8} />
      </mesh>

      {/* Fondo del boton */}
      <mesh ref={meshRef}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color={currentColor} transparent opacity={0.92} />
      </mesh>

      {/* Texto de la etiqueta */}
      <Text
        position={[0, 0, 0.01]}
        fontSize={height * 0.42}
        color={textColor}
        anchorX="center"
        anchorY="middle"
        maxWidth={width * 0.95}
      >
        {label}
      </Text>
    </group>
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
      tempOffset.current.set(-1.15, -0.05, -2.1);
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
        {/* BOTON MINIMIZADO FLOTANTE CUANDO EL MENU ESTA OCULTO */}
        {minimized && (
          <group position={[0, -0.2, 0]}>
            <VRButton3D
              id="btn-reopen-menu"
              position={[0, 0, 0]}
              width={0.8}
              height={0.24}
              label="ABRIR MENU VR"
              activeColor="#0284c7"
              idleColor="#0f172a"
              textColor="#38bdf8"
              onClick={() => setMinimized(false)}
              onRegister={registerButton}
              onUnregister={unregisterButton}
              hoveredId={hoveredId}
            />
          </group>
        )}

        {/* PANEL PRINCIPAL COMPLETO */}
        {!minimized && (
          <group position={[0, 0, 0]}>
            {/* Fondo del Panel Translúcido */}
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[1.75, 1.85]} />
              <meshBasicMaterial color="#0f172a" transparent opacity={0.92} />
            </mesh>

            {/* Borde exterior del panel */}
            <mesh position={[0, 0, -0.015]}>
              <planeGeometry args={[1.78, 1.88]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} />
            </mesh>

            {/* Encabezado */}
            <Text position={[0, 0.77, 0.01]} fontSize={0.075} color="#38bdf8" anchorX="center">
              CONTROL DE ESCENARIO VR
            </Text>
            <Text position={[0, 0.68, 0.01]} fontSize={0.045} color="#94a3b8" anchorX="center">
              Bocho 3D • React Three Fiber
            </Text>

            {/* SECCION 1: MODO SEGUIMIENTO */}
            <Text position={[-0.75, 0.54, 0.01]} fontSize={0.038} color="#64748b" anchorX="left">
              MODO SEGUIMIENTO
            </Text>
            <VRButton3D
              id="btn-toggle-follow"
              position={[0, 0.43, 0]}
              width={1.55}
              height={0.16}
              label={followActive ? 'Seguimiento: ACTIVO' : 'Seguir Auto en Marcha'}
              active={followActive}
              activeColor="#0284c7"
              idleColor="#1e293b"
              onClick={() => setFollowActive(!followActive)}
              onRegister={registerButton}
              onUnregister={unregisterButton}
              hoveredId={hoveredId}
            />

            {/* Sub-botones de tipo de seguimiento */}
            <VRButton3D
              id="btn-cam-chase"
              position={[-0.53, 0.25, 0]}
              width={0.48}
              height={0.14}
              label="Atras"
              active={followActive && followType === 'chase'}
              onClick={() => {
                setFollowActive(true);
                setFollowType('chase');
              }}
              onRegister={registerButton}
              onUnregister={unregisterButton}
              hoveredId={hoveredId}
            />
            <VRButton3D
              id="btn-cam-side"
              position={[0, 0.25, 0]}
              width={0.48}
              height={0.14}
              label="Lateral"
              active={followActive && followType === 'side'}
              onClick={() => {
                setFollowActive(true);
                setFollowType('side');
              }}
              onRegister={registerButton}
              onUnregister={unregisterButton}
              hoveredId={hoveredId}
            />
            <VRButton3D
              id="btn-cam-roof"
              position={[0.53, 0.25, 0]}
              width={0.48}
              height={0.14}
              label="Techo"
              active={followActive && followType === 'roof'}
              onClick={() => {
                setFollowActive(true);
                setFollowType('roof');
              }}
              onRegister={registerButton}
              onUnregister={unregisterButton}
              hoveredId={hoveredId}
            />

            {/* SECCION 2: CONTROL DEL AUTO */}
            <Text position={[-0.75, 0.12, 0.01]} fontSize={0.038} color="#64748b" anchorX="left">
              RECORRIDO DEL AUTO
            </Text>
            <VRButton3D
              id="btn-play-pause"
              position={[-0.4, 0.01, 0]}
              width={0.75}
              height={0.15}
              label={isPlaying ? 'Pausar' : 'Reanudar'}
              active={isPlaying}
              activeColor="#2563eb"
              idleColor="#f59e0b"
              onClick={() => setIsPlaying(!isPlaying)}
              onRegister={registerButton}
              onUnregister={unregisterButton}
              hoveredId={hoveredId}
            />
            <VRButton3D
              id="btn-restart"
              position={[0.4, 0.01, 0]}
              width={0.75}
              height={0.15}
              label="Reiniciar"
              activeColor="#10b981"
              idleColor="#1e293b"
              onClick={onRestart}
              onRegister={registerButton}
              onUnregister={unregisterButton}
              hoveredId={hoveredId}
            />

            {/* Selector de velocidad */}
            <VRButton3D
              id="btn-spd-1"
              position={[-0.53, -0.16, 0]}
              width={0.48}
              height={0.13}
              label="1.0x"
              active={speed === 1.0}
              onClick={() => setSpeed(1.0)}
              onRegister={registerButton}
              onUnregister={unregisterButton}
              hoveredId={hoveredId}
            />
            <VRButton3D
              id="btn-spd-2"
              position={[0, -0.16, 0]}
              width={0.48}
              height={0.13}
              label="2.0x"
              active={speed === 2.0}
              onClick={() => setSpeed(2.0)}
              onRegister={registerButton}
              onUnregister={unregisterButton}
              hoveredId={hoveredId}
            />
            <VRButton3D
              id="btn-spd-05"
              position={[0.53, -0.16, 0]}
              width={0.48}
              height={0.13}
              label="0.5x"
              active={speed === 0.5}
              onClick={() => setSpeed(0.5)}
              onRegister={registerButton}
              onUnregister={unregisterButton}
              hoveredId={hoveredId}
            />

            {/* SECCION 3: PUNTOS DE VISTA FIJOS */}
            <Text position={[-0.75, -0.28, 0.01]} fontSize={0.038} color="#64748b" anchorX="left">
              PUNTOS DE VISTA FIJOS
            </Text>
            <VRButton3D
              id="btn-view-origin"
              position={[-0.53, -0.39, 0]}
              width={0.48}
              height={0.13}
              label="Salida"
              active={!followActive && fixedView === 'origin'}
              onClick={() => {
                setFollowActive(false);
                setFixedView('origin');
              }}
              onRegister={registerButton}
              onUnregister={unregisterButton}
              hoveredId={hoveredId}
            />
            <VRButton3D
              id="btn-view-center"
              position={[0, -0.39, 0]}
              width={0.48}
              height={0.13}
              label="Acera"
              active={!followActive && fixedView === 'center'}
              onClick={() => {
                setFollowActive(false);
                setFixedView('center');
              }}
              onRegister={registerButton}
              onUnregister={unregisterButton}
              hoveredId={hoveredId}
            />
            <VRButton3D
              id="btn-view-aerial"
              position={[0.53, -0.39, 0]}
              width={0.48}
              height={0.13}
              label="Aerea"
              active={!followActive && fixedView === 'aerial'}
              onClick={() => {
                setFollowActive(false);
                setFixedView('aerial');
              }}
              onRegister={registerButton}
              onUnregister={unregisterButton}
              hoveredId={hoveredId}
            />

            {/* SECCION 4: ILUMINACION */}
            <Text position={[-0.75, -0.51, 0.01]} fontSize={0.038} color="#64748b" anchorX="left">
              ILUMINACION
            </Text>
            <VRButton3D
              id="btn-light-day"
              position={[-0.53, -0.62, 0]}
              width={0.48}
              height={0.13}
              label="Dia"
              active={lightMode === 'day'}
              activeColor="#eab308"
              onClick={() => setLightMode('day')}
              onRegister={registerButton}
              onUnregister={unregisterButton}
              hoveredId={hoveredId}
            />
            <VRButton3D
              id="btn-light-sunset"
              position={[0, -0.62, 0]}
              width={0.48}
              height={0.13}
              label="Tarde"
              active={lightMode === 'sunset'}
              activeColor="#f97316"
              onClick={() => setLightMode('sunset')}
              onRegister={registerButton}
              onUnregister={unregisterButton}
              hoveredId={hoveredId}
            />
            <VRButton3D
              id="btn-light-night"
              position={[0.53, -0.62, 0]}
              width={0.48}
              height={0.13}
              label="Noche"
              active={lightMode === 'night'}
              activeColor="#6366f1"
              onClick={() => setLightMode('night')}
              onRegister={registerButton}
              onUnregister={unregisterButton}
              hoveredId={hoveredId}
            />

            {/* BOTON OCULTAR MENU */}
            <VRButton3D
              id="btn-hide-menu"
              position={[0, -0.79, 0]}
              width={1.55}
              height={0.14}
              label="Ocultar Menu (Modo Libre)"
              activeColor="#ef4444"
              idleColor="#7f1d1d"
              textColor="#fecaca"
              onClick={() => setMinimized(true)}
              onRegister={registerButton}
              onUnregister={unregisterButton}
              hoveredId={hoveredId}
            />
          </group>
        )}
      </group>
    </>
  );
}
