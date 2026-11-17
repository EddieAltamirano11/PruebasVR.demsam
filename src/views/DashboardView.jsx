import React, { useState, useEffect } from 'react';
import { ArrowUpRight, BookOpen, Landmark, Ruler, Glasses, Sparkles } from 'lucide-react';
import { getInventoryBooks } from '../services/inventoryService';
import { getCultures } from '../services/culturalService';

export function DashboardView({ onNavigate }) {
  const [stats, setStats] = useState({
    booksCount: 9,
    culturesCount: 4,
    recommendationsCount: 7,
    totalStock: 34
  });

  useEffect(() => {
    let isMounted = true;
    Promise.all([getInventoryBooks(), getCultures()]).then(([books, cults]) => {
      if (isMounted) {
        const totalStock = books.reduce((acc, b) => acc + (b.stock || 0), 0);
        const vrCount = books.filter((b) => b.recomendado).length;
        setStats({
          booksCount: books.length,
          culturesCount: cults.length,
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
      label: 'Libros de Culturas Vivas',
      value: stats.booksCount.toString()
    },
    {
      label: 'Culturas Vivas Registradas',
      value: stats.culturesCount.toString()
    },
    {
      label: 'Recomendaciones activas en VR',
      value: stats.recommendationsCount.toString()
    },
    {
      label: 'Ejemplares físicos en sala',
      value: stats.totalStock.toString()
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Cuadrícula de 4 Tarjetas Métricas con Borde Izquierdo Dorado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          className="group cursor-pointer bg-[#0B1A30] text-white p-6 rounded-2xl shadow-md border border-[#0B1A30] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg relative overflow-hidden"
        >
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
            Alta, baja y control de existencias exclusivas de literatura sobre las culturas vivas de Nayarit.
          </p>
        </div>

        {/* Tarjeta Vino Tinto / Borgoña - Gestión de Culturas */}
        <div
          onClick={() => onNavigate?.('cultures')}
          className="group cursor-pointer bg-[#4A0E0E] text-white p-6 rounded-2xl shadow-md border border-[#4A0E0E] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Landmark size={20} className="text-[#E5A00D]" />
              <h3 className="text-lg font-bold text-[#E5A00D] group-hover:text-amber-400 transition-colors">
                Gestión de Culturas Vivas
              </h3>
            </div>
            <ArrowUpRight
              size={18}
              className="text-[#E5A00D] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
            />
          </div>
          <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
            Actualiza, agrega o quita información antropológica, regiones y cosmovisiones de Wixárika, Náayeri, O'dam y Mexicanero.
          </p>
        </div>

        {/* Tarjeta Wireframes VR */}
        <div
          onClick={() => onNavigate?.('wireframes')}
          className="group cursor-pointer bg-white text-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200/90 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Ruler size={20} className="text-[#0B1A30]" />
              <h3 className="text-base font-bold text-[#0B1A30] group-hover:text-amber-600 transition-colors">
                Wireframes del Espacio VR
              </h3>
            </div>
            <ArrowUpRight
              size={18}
              className="text-slate-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
            />
          </div>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Diagramas cenitales con FOV 100°, distancias focales de 2.0 m y ergonomía para Homido Grab.
          </p>
        </div>

        {/* Tarjeta Prototipo VR */}
        <div
          onClick={() => onNavigate?.('vr')}
          className="group cursor-pointer bg-white text-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200/90 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Glasses size={20} className="text-[#0B1A30]" />
              <h3 className="text-base font-bold text-[#0B1A30] group-hover:text-amber-600 transition-colors">
                Prototipo VR del Museo
              </h3>
            </div>
            <ArrowUpRight
              size={18}
              className="text-slate-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
            />
          </div>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Simulación interactiva 3D con retículo central Gaze Fuse (1500 ms) y pabellones culturales.
          </p>
        </div>
      </div>
    </div>
  );
}

export default DashboardView;
