import React, { useEffect, useRef } from 'react';

const hasFinePointer = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(pointer: fine)').matches;

/**
 * Tutorial 2D mínimo: frases cortas, sin descripciones extra ni íconos que parezcan botones,
 * para que el visitante entre a la experiencia sin tener que leer mucho.
 */
export const TUTORIAL_2D_MOUSE_STEPS = [
  'Haz clic en la escena para empezar.',
  'Mueve el mouse para mirar.',
  'Haz clic en una imagen para ver su información.',
  'Pulsa cualquier tecla para soltar el mouse.'
];

/** Versión para pantallas táctiles (tableta o celular sin visor). */
export const TUTORIAL_2D_TOUCH_STEPS = [
  'Desliza el dedo para mirar.',
  'Toca una imagen para ver su información.'
];

/**
 * Tutorial inicial de la Experiencia 2D. "Comenzar" solo lo cierra; el control con el mouse
 * se activa cuando el visitante hace clic en la escena.
 */
export function Tutorial2D({ onClose }) {
  const isMouse = hasFinePointer();
  const steps = isMouse ? TUTORIAL_2D_MOUSE_STEPS : TUTORIAL_2D_TOUCH_STEPS;
  const startRef = useRef(null);

  useEffect(() => {
    startRef.current?.focus();
  }, []);

  // Solo cierra el tutorial: la vista empieza a seguir al mouse hasta que el visitante
  // hace clic en la escena (no se captura el cursor desde este botón).
  const handleStart = () => {
    onClose?.();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-2d-title"
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-[#0B1A30]/70 p-4 font-sans backdrop-blur-sm"
    >
      <div className="max-h-full w-full max-w-md overflow-y-auto rounded-2xl border border-[#E5A00D]/70 bg-[#0B1A30] p-6 text-white shadow-2xl sm:p-8">
        <h2 id="tutorial-2d-title" className="text-2xl font-extrabold tracking-wide sm:text-3xl">
          Cómo explorar
        </h2>

        <ul className="mt-5 space-y-3 text-lg leading-snug sm:text-xl">
          {steps.map((step) => (
            <li key={step} className="flex items-baseline gap-3">
              <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#E5A00D]" />
              <span>{step}</span>
            </li>
          ))}
        </ul>

        <button
          ref={startRef}
          type="button"
          onClick={handleStart}
          className="mt-7 w-full rounded-full border border-[#fcd34d] bg-gradient-to-br from-[#f5b82e] to-[#E5A00D] px-6 py-3 text-lg font-extrabold uppercase tracking-wide text-[#0B1A30] shadow-lg transition hover:brightness-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#E5A00D]/50"
        >
          Comenzar
        </button>
      </div>
    </div>
  );
}

export default Tutorial2D;
