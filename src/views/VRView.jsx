import React from 'react';
import { Scene } from '../components/Scene.jsx';
import { UIOverlay } from '../components/UIOverlay.jsx';
import { useVRControls } from '../hooks/useVRControls.js';

/**
 * VRView - Vista principal de visualización 3D y entorno WebXR
 */
export function VRView() {
  const {
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
    vrMode,
    setVrMode,
    carObj,
    setCarObj,
    restartKey,
    handleRestart,
    toggleVRMode,
    onRecenterRef,
    onWebXRTriggerRef
  } = useVRControls();

  return (
    <main className="relative w-full h-full overflow-hidden bg-black select-none">
      {/* Lienzo 3D con React Three Fiber */}
      <Scene
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        speed={speed}
        setSpeed={setSpeed}
        followActive={followActive}
        setFollowActive={setFollowActive}
        followType={followType}
        setFollowType={setFollowType}
        fixedView={fixedView}
        setFixedView={setFixedView}
        lightMode={lightMode}
        setLightMode={setLightMode}
        vrMode={vrMode}
        setVrMode={setVrMode}
        carObj={carObj}
        setCarObj={setCarObj}
        onRecenterRef={onRecenterRef}
        onWebXRTriggerRef={onWebXRTriggerRef}
        onRestart={handleRestart}
        restartKey={restartKey}
      />

      {/* Interfaz de Usuario 2D (Modo Pantalla Normal) */}
      <UIOverlay
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        speed={speed}
        setSpeed={setSpeed}
        followActive={followActive}
        setFollowActive={setFollowActive}
        followType={followType}
        setFollowType={setFollowType}
        fixedView={fixedView}
        setFixedView={setFixedView}
        lightMode={lightMode}
        setLightMode={setLightMode}
        vrMode={vrMode}
        toggleVRMode={toggleVRMode}
        onRestart={handleRestart}
        onRecenter={() => onRecenterRef.current?.()}
      />
    </main>
  );
}

export default VRView;
