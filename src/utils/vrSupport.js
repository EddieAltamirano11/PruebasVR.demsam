import { useEffect, useState } from 'react';

/**
 * Detección de compatibilidad con la Experiencia VR.
 *
 * El museo admite dos caminos de VR:
 *  - 'webxr':  lentes con WebXR inmersivo (Quest, Pico, Chrome con visor conectado).
 *  - 'mobile': celular con sensores de orientación dentro de un visor (Homido Grab / Cardboard).
 * Si no hay ninguno de los dos (p. ej. computadora de escritorio sin visor) => 'unsupported'.
 * Mientras se consulta navigator.xr el estado es 'checking'.
 */
export const isMobileWithMotionSensors = (win = globalThis.window) => {
  if (!win) return false;
  const hasOrientation = typeof win.DeviceOrientationEvent !== 'undefined';
  const coarsePointer = typeof win.matchMedia === 'function' && win.matchMedia('(pointer: coarse)').matches;
  const mobileUA = /Android|iPhone|iPad|iPod|Mobile/i.test(win.navigator?.userAgent || '');
  return hasOrientation && (coarsePointer || mobileUA);
};

// Algunos navegadores (p. ej. Firefox sin runtime de VR) nunca resuelven isSessionSupported;
// pasado este tiempo se asume que no hay WebXR inmersivo.
export const XR_CHECK_TIMEOUT_MS = 1200;

export async function detectVRSupport(win = globalThis.window, timeoutMs = XR_CHECK_TIMEOUT_MS) {
  try {
    const xr = win?.navigator?.xr;
    if (xr && typeof xr.isSessionSupported === 'function') {
      let timer;
      const timeout = new Promise((resolve) => {
        timer = setTimeout(() => resolve(false), timeoutMs);
      });
      const supported = await Promise.race([xr.isSessionSupported('immersive-vr'), timeout]);
      clearTimeout(timer);
      if (supported) return 'webxr';
    }
  } catch {
    // Algunos navegadores lanzan error si WebXR está bloqueado por políticas; se trata como no soportado
  }
  return isMobileWithMotionSensors(win) ? 'mobile' : 'unsupported';
}

/** Hook React: devuelve 'checking' | 'webxr' | 'mobile' | 'unsupported'. */
export function useVRSupport() {
  const [status, setStatus] = useState('checking');
  useEffect(() => {
    let alive = true;
    detectVRSupport().then((result) => {
      if (alive) setStatus(result);
    });
    return () => {
      alive = false;
    };
  }, []);
  return status;
}
