import React from 'react';
import { Glasses, Monitor } from 'lucide-react';

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
export function ExperienceSelector({ onSelect, variant = 'cards', tone = 'dark' }) {
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
              onClick={() => onSelect?.(opt.id)}
              title={opt.description}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 rounded-lg text-xs font-bold hover:bg-[#E5A00D] hover:text-[#0B1A30] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A00D] transition-colors cursor-pointer ${
                isDark ? 'text-white' : 'text-[#0B1A30]'
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
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect?.(opt.id)}
            className="group text-left p-6 sm:p-8 rounded-2xl bg-[#fbf7ee] border-2 border-[#c69214]/50 shadow-xl hover:border-[#E5A00D] hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-[#E5A00D]/60 transition-all duration-200 cursor-pointer"
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
        );
      })}
    </div>
  );
}

export default ExperienceSelector;
