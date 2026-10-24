import React, { useState, useCallback, useRef } from 'react';
import { MuseumScene } from './components/MuseumScene.jsx';

export default function App() {
  const [vrMode, setVrMode] = useState(false);
  const onRecenterRef = useRef(null);
  const onWebXRTriggerRef = useRef(null);

  // Funcion para entrar y salir del modo VR
  const enterVR = useCallback(async () => {
    // 1. Si WebXR nativo está disponible y soportado en el navegador:
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

    // 2. Fallback móvil (Homido Grab / Cardboard): Permisos de sensores en iOS si aplica
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

    // 3. Activar modo pantalla completa + bloqueo horizontal + estereoscopía dual
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
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Escena 3D del Museo Wixarika */}
      <MuseumScene
        vrMode={vrMode}
        setVrMode={setVrMode}
        onWebXRTriggerRef={onWebXRTriggerRef}
        onRecenterRef={onRecenterRef}
      />

      {/* Boton flotante para entrar al modo VR (visible en modo normal) */}
      {!vrMode && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            pointerEvents: 'auto'
          }}
        >
          <button
            onClick={enterVR}
            style={{
              padding: '14px 28px',
              fontSize: '15px',
              fontWeight: '700',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: '#ffffff',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              border: '2px solid #38bdf8',
              borderRadius: '50px',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(56, 189, 248, 0.45)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s ease',
              outline: 'none'
            }}
          >
            {/* Icono de Gafas VR */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4.5l-2-2.5-2 2.5H5a2 2 0 0 1-2-2V7z" />
              <circle cx="8" cy="12" r="2" />
              <circle cx="16" cy="12" r="2" />
            </svg>
            Entrar a Modo VR
          </button>
        </div>
      )}

      {/* Boton para salir del modo VR manual (solo cuando se activa el fallback estereoscópico) */}
      {vrMode && !navigator.xr && (
        <button
          onClick={exitVR}
          style={{
            position: 'fixed',
            top: '16px',
            right: '16px',
            zIndex: 10000,
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: '600',
            color: '#e2e8f0',
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '20px',
            cursor: 'pointer',
            backdropFilter: 'blur(4px)'
          }}
        >
          ✕ Salir de VR
        </button>
      )}
    </div>
  );
}
