import React from 'react';
import { Glasses, Monitor, Ban } from 'lucide-react';
import { useVRSupport } from '../utils/vrSupport.js';

/**
 * Opciones de experiencia del Museo Virtual Wixárika.
 * - 'vr': recorrido inmersivo con visor (Homido Grab / Cardboard) o lentes WebXR.
 * - '2d': recorrido en pantalla (computadora, tableta o celular) sin visor.
 */
export const EXPERIENCE_OPTIONS = [
  {
    id: 'vr',
    tag: 'VR',
    title: 'Experiencia VR',
    description: 'Con visor o lentes de realidad virtual. Navegas con la mirada o el botón del visor.',
    icon: Glasses
  },
  {
    id: '2d',
    tag: '2D',
    title: 'Experiencia 2D',
    description: 'En la pantalla de tu computadora o celular, sin visor. Navegas con el mouse o el dedo.',
    icon: Monitor
  }
];

/**
 * Selector de experiencia (VR / 2D).
 * variant="cards": dos tarjetas grandes para la pantalla de inicio.
 * variant="compact": control segmentado (tone="dark" en el menú lateral, "light" en tarjetas blancas).
 */
export const VR_UNSUPPORTED_MESSAGE = 'No compatible con este dispositivo';

export function ExperienceSelector({ onSelect, variant = 'cards', tone = 'dark', vrSupport }) {
  // vrSupport se puede inyectar (pruebas); si no, se detecta en el navegador
  const detected = useVRSupport();
  const support = vrSupport ?? detected;
  const isDisabled = (id) => id === 'vr' && support === 'unsupported';

  if (variant === 'compact') {
    const isDark = tone === 'dark';
    return (
      <div
        role="group"
        aria-label="Abrir el museo"
        className={`grid grid-cols-2 gap-1 p-1 rounded-xl border ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'
        }`}
      >
        {EXPERIENCE_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={isDisabled(opt.id)}
              onClick={() => onSelect?.(opt.id)}
              title={isDisabled(opt.id) ? VR_UNSUPPORTED_MESSAGE : opt.description}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 rounded-lg text-xs font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A00D] transition-colors ${
                isDark ? 'text-white' : 'text-[#0B1A30]'
              } ${
                isDisabled(opt.id)
                  ? 'opacity-40 cursor-not-allowed'
                  : 'hover:bg-[#E5A00D] hover:text-[#0B1A30] cursor-pointer'
              }`}
            >
              <Icon size={18} />
              <span>{opt.tag}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full">
      {EXPERIENCE_OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const disabled = isDisabled(opt.id);
        return (
          <div key={opt.id} className="relative">
            <button
              type="button"
              disabled={disabled}
              aria-describedby={disabled ? `exp-${opt.id}-unsupported` : undefined}
              onClick={() => onSelect?.(opt.id)}
              className={`group w-full h-full text-left p-6 sm:p-8 rounded-2xl bg-[#fbf7ee] border-2 border-[#c69214]/50 shadow-xl transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#E5A00D]/60 ${
                disabled
                  ? 'opacity-40 cursor-not-allowed grayscale'
                  : 'hover:border-[#E5A00D] hover:-translate-y-1 hover:shadow-2xl cursor-pointer'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center justify-center w-14 h-14 rounded-xl bg-[#0B1A30] text-[#E5A00D] group-hover:scale-105 transition-transform">
                  <Icon size={30} />
                </span>
                <span className="px-3 py-1 rounded-full bg-[#E5A00D]/15 text-[#78350f] text-sm font-extrabold tracking-wider">
                  {opt.tag}
                </span>
              </div>
              <h2 className="mt-5 text-2xl font-extrabold text-[#1c1917]">{opt.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#44403c]">{opt.description}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-[#b45309] group-hover:gap-2 transition-all">
                Entrar al museo →
              </span>
            </button>

            {/* Aviso encima de la tarjeta opaca cuando el dispositivo no soporta VR */}
            {disabled && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
                <p
                  id={`exp-${opt.id}-unsupported`}
                  role="status"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0B1A30] text-white text-sm sm:text-base font-bold shadow-xl border border-[#E5A00D]/70 text-center"
                >
                  <Ban size={18} className="text-[#E5A00D] shrink-0" />
                  {VR_UNSUPPORTED_MESSAGE}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ExperienceSelector;
