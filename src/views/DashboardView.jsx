import React, { useState, useEffect } from 'react';
import { ArrowUpRight, BookOpen, Glasses } from 'lucide-react';
import { ExperienceSelector } from '../components/ExperienceSelector.jsx';
import { getInventoryBooks } from '../services/inventoryService';

export function DashboardView({ onNavigate, onLaunchExperience }) {
  const [stats, setStats] = useState({
    booksCount: 2,
    recommendationsCount: 2,
    totalStock: 6
  });

  useEffect(() => {
    let isMounted = true;
    getInventoryBooks().then((books) => {
      if (isMounted) {
        const totalStock = books.reduce((acc, b) => acc + (b.stock || 0), 0);
        const vrCount = books.filter((b) => b.recomendado).length;
        setStats({
          booksCount: books.length,
          recommendationsCount: vrCount,
          totalStock: totalStock
        });
      }
    }).catch(console.warn);

    return () => {
      isMounted = false;
    };
  }, []);

  const metricCards = [
    {
      label: 'Títulos de Culturas Vivas',
      value: stats.booksCount.toString()
    },
    {
      label: 'Recomendaciones Activas en VR',
      value: stats.recommendationsCount.toString()
    },
    {
      label: 'Ejemplares Físicos en Sala',
      value: stats.totalStock.toString()
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Cuadrícula de 3 Tarjetas Métricas con Borde Izquierdo Dorado */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metricCards.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm border-l-4 border-l-[#E5A00D] transition-all hover:shadow-md"
          >
            <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
              {stat.label}
            </p>
            <p className="text-3xl font-extrabold text-[#0B1A30] tracking-tight">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Tarjetas de Acceso Rápido / Banners de Navegación del Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
        {/* Tarjeta Azul Marino - Inventario de Libros */}
        <div
          onClick={() => onNavigate?.('books')}
          className="group cursor-pointer bg-[#0B1A30] text-white p-6 rounded-2xl shadow-md border border-[#0B1A30] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg relative overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <BookOpen size={20} className="text-[#E5A00D]" />
                <h3 className="text-lg font-bold text-[#E5A00D] group-hover:text-amber-400 transition-colors">
                  Inventario de Libros
                </h3>
              </div>
              <ArrowUpRight
                size={18}
                className="text-[#E5A00D] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
              />
            </div>
            <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
              Alta, baja y control de existencias exclusivas de literatura sobre las culturas vivas de Nayarit con portadas y signaturas.
            </p>
          </div>
          <span className="text-[11px] text-[#E5A00D] font-semibold mt-4 block">Gestionar Acervo →</span>
        </div>

        {/* Tarjeta: Abrir el museo en Experiencia VR o 2D */}
        <div className="bg-white text-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200/90 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Glasses size={20} className="text-[#0B1A30]" />
              <h3 className="text-base font-bold text-[#0B1A30]">Abrir el Museo Virtual</h3>
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Recorre el Museo Wixárika con visor de realidad virtual o directamente en la pantalla.
            </p>
          </div>
          <div className="mt-4">
            <ExperienceSelector variant="compact" tone="light" onSelect={(mode) => onLaunchExperience?.(mode)} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardView;
