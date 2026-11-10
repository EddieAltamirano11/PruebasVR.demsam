import React from 'react';
import { Eye, Info, Layers, Compass } from 'lucide-react';

export function WireframesView() {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Contenedor Principal del Diagrama */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <h3 className="text-base sm:text-lg font-bold text-[#0B1A30] mb-6">
          Vista cenital — distribución espacial
        </h3>

        {/* Diagrama Vectorial SVG en Alta Fidelidad */}
        <div className="flex justify-center items-center py-4 overflow-x-auto">
          <svg
            viewBox="0 0 650 480"
            className="w-full max-w-[650px] h-auto select-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Marcador de flecha para cotas rojas */}
              <marker
                id="arrow-red"
                viewBox="0 0 10 10"
                refX="5"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#DC2626" />
              </marker>
              <marker
                id="arrow-red-start"
                viewBox="0 0 10 10"
                refX="5"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <path d="M 10 0 L 0 5 L 10 10 z" fill="#DC2626" />
              </marker>
            </defs>

            {/* 1. Cono de Campo Visual (FOV 100°) en color arena/crema */}
            {/* Vértice en (325, 410) -> Abre 50° a cada lado hasta un radio ~340 */}
            <path
              d="M 325 410 L 165 125 A 340 340 0 0 1 485 125 Z"
              fill="#EFE7DA"
              opacity="0.85"
            />

            {/* Etiqueta FOV 100° */}
            <text
              x="325"
              y="180"
              textAnchor="middle"
              fill="#0B1A30"
              fontSize="16"
              fontWeight="600"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              FOV 100°
            </text>

            {/* 2. Menú Central a Z = -2.0m */}
            <text
              x="325"
              y="235"
              textAnchor="middle"
              fill="#0B1A30"
              fontSize="15"
              fontWeight="700"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              Menú central • Z = -2.0 m
            </text>

            {/* Barra del Menú Central (Slab azul marino) */}
            <rect
              x="250"
              y="250"
              width="150"
              height="10"
              rx="3"
              fill="#0B1A30"
            />

            {/* 3. Cota y Flecha Roja de Distancia (2.0 m) */}
            <line
              x1="325"
              y1="400"
              x2="325"
              y2="265"
              stroke="#DC2626"
              strokeWidth="1.8"
              markerEnd="url(#arrow-red)"
            />
            {/* Texto de distancia 2.0 m */}
            <text
              x="335"
              y="330"
              fill="#DC2626"
              fontSize="14"
              fontWeight="600"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              2.0 m
            </text>

            {/* 4. Arco de Libros Recomendados (-20° a la izquierda) */}
            {/* Línea radial discontinua desde el usuario hasta el arco */}
            <line
              x1="325"
              y1="410"
              x2="228"
              y2="260"
              stroke="#0B1A30"
              strokeWidth="1.2"
              strokeDasharray="4 4"
            />

            {/* Arco curvado en color Vino Tinto / Borgoña */}
            <path
              d="M 195 285 A 190 190 0 0 1 250 258"
              fill="none"
              stroke="#5C1111"
              strokeWidth="7"
              strokeLinecap="round"
            />

            {/* Etiqueta Recomendados • -20° */}
            <text
              x="235"
              y="312"
              textAnchor="end"
              fill="#0B1A30"
              fontSize="15"
              fontWeight="700"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              Recomendados • -20°
            </text>

            {/* 5. Punto de Origen del Usuario (0,0,0) */}
            <circle cx="325" cy="410" r="16" fill="#0B1A30" />
            <circle cx="325" cy="410" r="6" fill="#38BDF8" opacity="0.4" />

            {/* Texto Usuario (0,0,0) */}
            <text
              x="325"
              y="445"
              textAnchor="middle"
              fill="#0B1A30"
              fontSize="15"
              fontWeight="600"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              Usuario (0,0,0)
            </text>
          </svg>
        </div>
      </div>

      {/* Tarjetas de Especificaciones Técnicas y Ergonomía */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-[#0B1A30]/5 text-[#0B1A30]">
            <Eye size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#0B1A30] mb-1">
              Campo Visual Óptimo
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              FOV de 100° adaptado a lentes biconvexas de 35 mm (Homido Grab) para evitar fatiga ocular.
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-[#E5A00D]/10 text-[#E5A00D]">
            <Compass size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#0B1A30] mb-1">
              Distancia Focal de 2.0 m
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Los menús se proyectan a 2.0 metros de distancia para garantizar lectura nítida sin convergencia forzada.
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-[#4A0E0E]/10 text-[#4A0E0E]">
            <Layers size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#0B1A30] mb-1">
              Gaze Fuse Reticle (1.5 s)
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Selección sin manos mediante fijación de mirada (1500 ms) con temporizador circular y gatillo táctil dual.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WireframesView;
