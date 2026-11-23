import React, { useEffect, useState } from 'react';

const PORTRAIT_QUERY = '(orientation: portrait) and (pointer: coarse)';

const matchesPortrait = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia(PORTRAIT_QUERY).matches;

/**
 * Aviso a pantalla completa para el modo visor en celular cuando el teléfono está vertical.
 * Android bloquea la orientación a horizontal automáticamente; iPhone no lo permite,
 * así que se le pide al visitante girar el teléfono antes de colocarlo en el visor.
 */
export function RotateDeviceHint() {
  const [isPortrait, setIsPortrait] = useState(matchesPortrait);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
    const mql = window.matchMedia(PORTRAIT_QUERY);
    const update = () => setIsPortrait(mql.matches);
    update();
    if (typeof mql.addEventListener === 'function') mql.addEventListener('change', update);
    else mql.addListener?.(update); // Safari < 14
    window.addEventListener('orientationchange', update);
    return () => {
      if (typeof mql.removeEventListener === 'function') mql.removeEventListener('change', update);
      else mql.removeListener?.(update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  if (!isPortrait) return null;

  return (
    <div
      role="alert"
      data-vr-ui="true"
      className="fixed inset-0 z-[10001] flex flex-col items-center justify-center gap-5 px-8 text-center bg-[#0B1A30]/95 text-white font-sans"
    >
      <svg
        width="72"
        height="72"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#E5A00D"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="7" y="2" width="10" height="20" rx="2" />
        <path d="M11 18h2" />
        <path d="M2.5 13a9.5 9.5 0 0 0 4 6" />
        <path d="M2 17.5 2.5 13l4 1" />
      </svg>
      <p className="text-2xl font-extrabold">Gira tu teléfono</p>
      <p className="max-w-xs text-base text-slate-200 leading-relaxed">
        Colócalo en horizontal y después ponlo dentro del visor para comenzar el recorrido.
      </p>
    </div>
  );
}

export default RotateDeviceHint;
