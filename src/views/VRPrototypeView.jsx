import React, { useState, useRef, useCallback } from 'react';
import { MuseumScene } from '../components/MuseumScene.jsx';
import { Glasses, ArrowLeft, Crosshair, Sparkles } from 'lucide-react';

export function VRPrototypeView({ onBackToDashboard }) {
  const [vrMode, setVrMode] = useState(false);
  const onRecenterRef = useRef(null);
  const onWebXRTriggerRef = useRef(null);

  // Entrar a Modo VR (WebXR nativo o fallback estereoscópico)
  const enterVR = useCallback(async () => {
    // 1. WebXR nativo
    if (navigator.xr && onWebXRTriggerRef.current) {
      try {
        const supported = await navigator.xr.isSessionSupported('immersive-vr');
        if (supported) {
          onWebXRTriggerRef.current();
          return;
        }
      } catch (e) {
        console.warn('WebXR check:', e);
      }
    }

    // 2. Sensores iOS si aplica
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      try {
        await DeviceOrientationEvent.requestPermission();
      } catch (err) {
        console.warn('Permisos sensor iOS:', err);
      }
    }

    // 3. Pantalla completa y modo estereoscópico dual
    setVrMode(true);
    const el = document.documentElement;
    const rfs =
      el.requestFullscreen ||
      el.webkitRequestFullscreen ||
      el.mozRequestFullScreen ||
      el.msRequestFullscreen;
    if (rfs) {
      Promise.resolve(rfs.call(el))
        .then(() => {
          if (window.screen?.orientation?.lock) {
            window.screen.orientation.lock('landscape').catch(() => {});
          }
        })
        .catch(() => {});
    }
  }, []);

  const exitVR = useCallback(() => {
    setVrMode(false);
    const efs =
      document.exitFullscreen ||
      document.webkitExitFullscreen ||
      document.mozCancelFullScreen ||
      document.msExitFullscreen;
    if (efs && (document.fullscreenElement || document.webkitFullscreenElement)) {
      efs.call(document);
    }
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-120px)] min-h-[500px] rounded-2xl overflow-hidden bg-slate-950 shadow-lg border border-slate-800">
      {/* Escena 3D del Museo Wixárika con Gaze Reticle */}
      <MuseumScene
        vrMode={vrMode}
        setVrMode={setVrMode}
        onWebXRTriggerRef={onWebXRTriggerRef}
        onRecenterRef={onRecenterRef}
      />

      {/* Barra Flotante Superior (Visible en modo normal) */}
      {!vrMode && (
        <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
          <button
            onClick={onBackToDashboard}
            className="pointer-events-auto flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-[#0B1A30]/85 hover:bg-[#0B1A30] border border-slate-700/80 backdrop-blur-md shadow-md transition-all cursor-pointer"
          >
            <ArrowLeft size={14} className="text-[#E5A00D]" />
            <span>Volver al Panel</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onRecenterRef.current?.()}
              className="pointer-events-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 backdrop-blur-md transition-all cursor-pointer"
              title="Recentrar orientación"
            >
              <Crosshair size={14} className="text-[#E5A00D]" />
              <span className="hidden sm:inline">Recentrar</span>
            </button>

            <button
              onClick={enterVR}
              className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-[#E5A00D] hover:bg-amber-400 shadow-md shadow-amber-500/20 transition-all cursor-pointer uppercase tracking-wider"
            >
              <Glasses size={16} />
              <span>Modo Visor VR</span>
            </button>
          </div>
        </div>
      )}

      {/* Botón flotante para salir de VR en pantalla completa */}
      {vrMode && (
        <button
          onClick={exitVR}
          className="fixed top-4 right-4 z-[99999] px-4 py-2 rounded-full text-xs font-bold text-white bg-rose-600/90 hover:bg-rose-500 shadow-lg cursor-pointer backdrop-blur-md"
        >
          ✕ Salir de VR
        </button>
      )}

      {/* Indicador de ayuda para el usuario en la parte inferior */}
      {!vrMode && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 px-4 py-1.5 rounded-full bg-[#0B1A30]/85 border border-slate-700/80 backdrop-blur-md text-[11px] text-slate-300 pointer-events-none shadow-md flex items-center gap-2">
          <Sparkles size={12} className="text-[#E5A00D]" />
          <span>Mira fijamente los paneles culturales durante 1.5 s para interactuar con Gaze Fuse</span>
        </div>
      )}
    </div>
  );
}

export default VRPrototypeView;
