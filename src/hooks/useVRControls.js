import { useState, useCallback, useRef } from 'react';
import { WebXRService } from '../services/webxrService.js';

/**
 * Custom hook to manage VR viewer state, simulation parameters, and camera view modes
 */
export function useVRControls() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1.0);
  const [followActive, setFollowActive] = useState(false);
  const [followType, setFollowType] = useState('chase'); // 'chase' | 'side' | 'roof'
  const [fixedView, setFixedView] = useState('origin'); // 'origin' | 'center' | 'aerial'
  const [lightMode, setLightMode] = useState('day'); // 'day' | 'sunset' | 'night'
  const [vrMode, setVrMode] = useState(false);
  const [carObj, setCarObj] = useState(null);
  const [restartKey, setRestartKey] = useState(0);

  const onRecenterRef = useRef(null);
  const onWebXRTriggerRef = useRef(null);

  const handleRestart = useCallback(() => {
    setRestartKey((k) => k + 1);
    setFollowActive(false);
    setFixedView('origin');
  }, []);

  const toggleVRMode = useCallback(async () => {
    // 1. Si el gestor oficial WebXR esta listo, lanzar la sesion nativa
    if (onWebXRTriggerRef.current) {
      onWebXRTriggerRef.current();
      return;
    }

    // 2. Solicitar permisos de giroscopio en iOS si aplica
    await WebXRService.requestOrientationPermission();

    // 3. Modo visor manual de respaldo (Cardboard / Split Screen)
    setVrMode((prev) => {
      const next = !prev;
      WebXRService.toggleFullscreen(next);
      return next;
    });
  }, []);

  return {
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
  };
}

export default useVRControls;
