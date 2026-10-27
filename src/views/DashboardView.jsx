import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export function DashboardView({ onNavigate }) {
  const stats = [
    {
      label: 'Libros en catálogo',
      value: '1,284'
    },
    {
      label: 'Sesiones VR (semana)',
      value: '342'
    },
    {
      label: 'Recomendaciones activas',
      value: '48'
    },
    {
      label: 'Tiempo medio de mirada',
      value: '1.5 s'
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Cuadrícula de 4 Tarjetas Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm border-l-4 border-l-[#E5A00D] transition-all hover:shadow-md"
          >
            <p className="text-sm font-medium text-slate-500 mb-1">
              {stat.label}
            </p>
            <p className="text-3xl font-extrabold text-[#0B1A30] tracking-tight">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Tarjetas de Acceso Rápido / Banners de Navegación */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
        {/* Tarjeta Azul Marino - Wireframes VR */}
        <div
          onClick={() => onNavigate?.('wireframes')}
          className="group cursor-pointer bg-[#0B1A30] text-white p-6 rounded-xl shadow-md border border-[#0B1A30] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-bold text-[#E5A00D] group-hover:text-amber-400 transition-colors">
              Wireframes VR
            </h3>
            <ArrowUpRight
              size={18}
              className="text-[#E5A00D] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
            />
          </div>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Diagramas con FOV, distancias y separación angular para Homido Grab.
          </p>
        </div>

        {/* Tarjeta Vino Tinto / Borgoña - Prototipo VR */}
        <div
          onClick={() => onNavigate?.('vr')}
          className="group cursor-pointer bg-[#4A0E0E] text-white p-6 rounded-xl shadow-md border border-[#4A0E0E] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-bold text-[#E5A00D] group-hover:text-amber-400 transition-colors">
              Prototipo VR funcional
            </h3>
            <ArrowUpRight
              size={18}
              className="text-[#E5A00D] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
            />
          </div>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Recorre la escena 3D con retículo Gaze Fuse (1500 ms).
          </p>
        </div>
      </div>
    </div>
  );
}

export default DashboardView;
