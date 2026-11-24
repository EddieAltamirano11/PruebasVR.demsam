import React from 'react';
import { useMuseumModelProgress } from '../services/museumModelLoader.js';

const toMB = (bytes) => (bytes / (1024 * 1024)).toFixed(1);

/**
 * Pantalla de carga mientras se descarga el modelo 3D del museo (~16 MB).
 * Evita que la escena se vea en negro sin explicación cuando la conexión es lenta.
 */
export function ModelLoadingOverlay() {
  const { loaded, total, done } = useMuseumModelProgress();
  if (done) return null;
  const pct = total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : null;

  return (
    <div
      role="status"
      aria-live="polite"
      data-vr-ui="true"
      className="fixed inset-0 z-[1050] flex flex-col items-center justify-center gap-5 bg-[#0B1A30] px-6 text-center font-sans text-white"
    >
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#E5A00D]/30 border-t-[#E5A00D]" aria-hidden="true" />
      <div>
        <p className="text-xl font-extrabold tracking-wide sm:text-2xl">Cargando el museo…</p>
        <p className="mt-1 text-base text-slate-300">
          {total > 0
            ? `${toMB(loaded)} de ${toMB(total)} MB`
            : loaded > 0
              ? `${toMB(loaded)} MB descargados`
              : 'Preparando la descarga'}
        </p>
      </div>
      <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-white/15">
        <div
          className="h-full rounded-full bg-[#E5A00D] transition-[width] duration-200"
          style={{ width: pct === null ? '35%' : `${pct}%` }}
        />
      </div>
      <p className="max-w-sm text-sm text-slate-400">
        La primera vez puede tardar un poco según tu conexión; después carga al instante.
      </p>
    </div>
  );
}

export default ModelLoadingOverlay;
