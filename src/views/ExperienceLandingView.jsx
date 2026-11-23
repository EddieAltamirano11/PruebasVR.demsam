import React from 'react';
import { LogIn, LayoutGrid, AlertTriangle, Share } from 'lucide-react';
import { isIOSDevice, isStandaloneDisplay } from '../utils/vrSupport.js';
import { BiblioLogo } from '../components/BiblioLogo.jsx';
import { ExperienceSelector } from '../components/ExperienceSelector.jsx';

/**
 * Pantalla de inicio: el visitante elige cómo recorrer el museo (VR o 2D).
 * Se muestra siempre al entrar a la app, encima de la escena 3D que se precarga detrás.
 * Arriba a la derecha: acceso al login del panel administrativo.
 */
export function ExperienceLandingView({
  onSelectExperience,
  onLogin,
  isAuthenticated = false,
  vrSupport,
  notice = '',
  showIOSTip = isIOSDevice() && !isStandaloneDisplay()
}) {
  return (
    <div
      className="fixed inset-0 z-[2000] overflow-y-auto bg-[#0B1A30]/85 backdrop-blur-md font-sans"
      role="dialog"
      aria-modal="true"
      aria-labelledby="experience-landing-title"
    >
      {/* Barra superior: identidad a la izquierda, iniciar sesión a la derecha */}
      <header className="flex items-center justify-between gap-3 px-4 sm:px-8 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <BiblioLogo size={34} />
          <span className="font-extrabold text-lg text-white tracking-tight truncate">BiblioVR</span>
        </div>
        <button
          type="button"
          onClick={onLogin}
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-[#0B1A30] bg-[#E5A00D] hover:bg-amber-400 shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/60 transition-colors cursor-pointer"
        >
          {isAuthenticated ? <LayoutGrid size={17} /> : <LogIn size={17} />}
          {isAuthenticated ? 'Panel Admin' : 'Iniciar sesión'}
        </button>
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 sm:px-8 pt-6 sm:pt-12 pb-12 flex flex-col items-center text-center">
        <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#E5A00D]">
          Biblioteca Pública Central Estatal Solón Argüello
        </p>
        <h1 id="experience-landing-title" className="mt-3 text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Museo Virtual Wixárika
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-200 max-w-xl">
          ¿Cómo quieres recorrer el museo?
        </p>

        {notice && (
          <div
            role="alert"
            className="mt-6 w-full max-w-2xl flex items-start gap-3 text-left px-4 py-3 rounded-xl bg-amber-50 border border-amber-300 text-[#78350f] text-sm leading-relaxed"
          >
            <AlertTriangle size={20} className="shrink-0 mt-0.5 text-[#b45309]" />
            <span>{notice}</span>
          </div>
        )}

        <div className="mt-8 sm:mt-10 w-full">
          <ExperienceSelector variant="cards" onSelect={onSelectExperience} vrSupport={vrSupport} />
        </div>

        {showIOSTip && (
          <p className="mt-8 flex items-start gap-2 text-left text-sm text-slate-200 max-w-xl px-4 py-3 rounded-xl bg-white/5 border border-white/10">
            <Share size={18} className="shrink-0 mt-0.5 text-[#E5A00D]" />
            <span>
              <strong className="text-white">En iPhone:</strong> para ver el museo en pantalla completa dentro del visor,
              toca <strong className="text-white">Compartir</strong> → «Agregar a pantalla de inicio» y ábrelo desde ese ícono.
            </span>
          </p>
        )}

        <p className="mt-8 text-xs sm:text-sm text-slate-300 max-w-xl">
          Puedes cambiar de experiencia en cualquier momento con el botón «Cambiar experiencia».
        </p>
      </main>
    </div>
  );
}

export default ExperienceLandingView;
