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

/** iPhone / iPod / iPad (incluye iPadOS, que se anuncia como "Macintosh" con pantalla táctil). */
export const isIOSDevice = (win = globalThis.window) => {
  const nav = win?.navigator;
  if (!nav) return false;
  const ua = nav.userAgent || '';
  return /iPad|iPhone|iPod/.test(ua) || (nav.platform === 'MacIntel' && (nav.maxTouchPoints || 0) > 1);
};

/** true si la app se abrió desde el ícono de la pantalla de inicio (sin barras de Safari). */
export const isStandaloneDisplay = (win = globalThis.window) =>
  Boolean(
    win?.navigator?.standalone ||
      (typeof win?.matchMedia === 'function' && win.matchMedia('(display-mode: standalone)').matches)
  );

/**
 * iOS 13+ exige pedir el permiso de movimiento/orientación dentro de un gesto del usuario
 * (y antes de cualquier await). Devuelve 'granted' | 'denied' | 'not-required'.
 */
export async function requestMotionPermission(win = globalThis.window) {
  const DOE = win?.DeviceOrientationEvent;
  if (!DOE || typeof DOE.requestPermission !== 'function') return 'not-required';
  try {
    const result = await DOE.requestPermission();
    return result === 'granted' ? 'granted' : 'denied';
  } catch {
    return 'denied';
  }
}

export const MOTION_PERMISSION_DENIED_MESSAGE =
  'Para la Experiencia VR necesitamos acceso al movimiento del teléfono. ' +
  'Si tocaste «No permitir», cierra Safari por completo, vuelve a abrir la página y elige «Permitir».';
