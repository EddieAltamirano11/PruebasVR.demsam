import React, { useEffect, useRef } from 'react';

const hasFinePointer = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(pointer: fine)').matches;

/** Pasos del tutorial de la Experiencia 2D con mouse (control tipo videojuego). */
export const TUTORIAL_2D_MOUSE_STEPS = [
  {
    title: 'Haz clic en la escena',
    text: 'El cursor se oculta y queda un punto en el centro de la pantalla.'
  },
  { title: 'Mueve el mouse para mirar', text: 'La vista gira hacia donde muevas el mouse, como en un videojuego.' },
  {
    title: 'Haz clic sobre las imágenes',
    text: 'Apunta el punto a una imagen y haz clic: se desplegará información sobre ella. Lo que puedes seleccionar se marca con un borde naranja.'
  },
  {
    title: 'Pulsa cualquier tecla para salir',
    text: 'El cursor vuelve a aparecer para usar los botones de arriba, como "Menú principal".'
  }
];

/** Pasos para pantallas táctiles (tableta o celular sin visor). */
export const TUTORIAL_2D_TOUCH_STEPS = [
  { title: 'Desliza el dedo para mirar', text: 'Arrastra sobre la pantalla para girar la vista.' },
  {
    title: 'Toca las imágenes',
    text: 'Toca una imagen para que se despliegue información sobre ella.'
  },
  {
    title: 'Busca el borde naranja',
    text: 'Lo que queda en el centro y se puede seleccionar se marca con un borde naranja.'
  }
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
      <div className="max-h-full w-full max-w-xl overflow-y-auto rounded-2xl border border-[#E5A00D]/70 bg-[#0B1A30] p-6 text-white shadow-2xl sm:p-8">
        <h2 id="tutorial-2d-title" className="text-2xl font-extrabold tracking-wide sm:text-3xl">
          Cómo explorar el museo
        </h2>
        <p className="mt-1 text-base text-slate-300">Experiencia 2D · {isMouse ? 'con mouse' : 'en pantalla táctil'}</p>

        <ol className="mt-6 space-y-5">
          {steps.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E5A00D] text-lg font-extrabold text-[#0B1A30]">
                {i + 1}
              </span>
              <div>
                <p className="text-lg font-bold leading-snug">{step.title}</p>
                <p className="mt-0.5 text-base leading-relaxed text-slate-300">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <button
          ref={startRef}
          type="button"
          onClick={handleStart}
          className="mt-8 w-full rounded-full border border-[#fcd34d] bg-gradient-to-br from-[#f5b82e] to-[#E5A00D] px-6 py-3 text-lg font-extrabold uppercase tracking-wide text-[#0B1A30] shadow-lg transition hover:brightness-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#E5A00D]/50"
        >
          Comenzar
        </button>
      </div>
    </div>
  );
}

export default Tutorial2D;
