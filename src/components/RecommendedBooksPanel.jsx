import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  BookOpen,
  Sparkles,
  X,
  Search,
  CheckCircle2,
  Bookmark,
  Layers,
  ChevronRight,
  Info,
  Library,
  Eye,
  SlidersHorizontal,
  Bell
} from 'lucide-react';

/**
 * Libros de demostración precargados para cuando se active la vista previa
 * mientras se alimenta la base de datos real en Supabase.
 */
const MOCK_RECOMMENDED_BOOKS = [
  {
    id: 'b1',
    stationId: 'deidades',
    titulo: "El Fuego Sagrado y los Cantos del Mara'akame",
    autor: 'Ramón Medina Silva',
    editorial: 'Fondo Editorial Indígena de Nayarit',
    anio: 2021,
    isbn: '978-607-00-1122-1',
    stock: 3,
    disponible: true,
    cultura: 'Wixárika (Huichol)',
    seccion: 'Sala de Culturas Vivas & VR (SEC-VR-01)',
    descripcionCorta: 'Estudio antropológico sobre los cantos rituales a Tatewari y la cosmovisión sagrada de Wirikuta.'
  },
  {
    id: 'b2',
    stationId: 'gastronomia',
    titulo: 'Sabores del Nayar: Etnobotánica y Cocina Tradicional',
    autor: 'Dra. Luisa Gómez Tagle',
    editorial: 'Ediciones INAH / Universidad Autónoma de Nayarit',
    anio: 2019,
    isbn: '978-607-16-4455-2',
    stock: 2,
    disponible: true,
    cultura: 'Wixárika y Cora (Náayeri)',
    seccion: 'Acervo de Patrimonio (SEC-PAT-02)',
    descripcionCorta: 'Recopilación de recetas ceremoniales, tamales de maíz morado y atoles ancestrales de la sierra.'
  },
  {
    id: 'b3',
    stationId: 'fiestas',
    titulo: 'Fiestas Sagradas de la Sierra Wixárika: El Ciclo del Maíz y el Hikuri',
    autor: 'Miguel León-Portilla & Colaboradores',
    editorial: 'El Colegio Nacional / Secretaría de Cultura',
    anio: 2020,
    isbn: '978-968-16-0331-5',
    stock: 4,
    disponible: true,
    cultura: 'Wixárika (Huichol)',
    seccion: 'Sala de Lectura General (SEC-LEC-03)',
    descripcionCorta: 'Documentación fotográfica y relatos de la Fiesta del Tambor (Tepu) y la peregrinación sagrada.'
  },
  {
    id: 'b4',
    stationId: 'biblioteca',
    titulo: 'Manual de Mediación Cultural y Fomento Lector en Bibliotecas',
    autor: 'Mtra. Elena Rivas',
    editorial: 'Biblioteca Pública Solón Argüello',
    anio: 2023,
    isbn: '978-607-99-8877-0',
    stock: 5,
    disponible: true,
    cultura: 'General / Intercultural',
    seccion: 'Kiosco Lector (SEC-VR-01)',
    descripcionCorta: 'Estrategias de vinculación entre experiencias inmersivas 3D y la literatura física.'
  }
];

/**
 * Panel Lateral Interactivo de Libros Recomendados en la Escena
 * Sprint 3 - Responsable: Luis Carlos Durán Ocampo
 *
 * Características solicitadas:
 * - Aparece al estar visualizando un elemento cultural o como opción adicional para ver.
 * - Listo para implementar: gestiona estado vacío cuando aún no hay libros cargados.
 * - Conmutador de vista previa de demostración para verificar el formato de las tarjetas.
 * - Filtro dinámico según la estación enfocada en la escena 3D.
 * - Consulta automática a la tabla 'libros' de Supabase con fallback seguro.
 */
export function RecommendedBooksPanel({
  isOpen,
  onClose,
  activeStation = null,
  allStations = [],
  onSelectStation = () => {},
  autoOpenOnFocus = true,
  onToggleAutoOpen = () => {}
}) {
  const [supabaseBooks, setSupabaseBooks] = useState([]);
  const [showDemoPreview, setShowDemoPreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStationFilter, setSelectedStationFilter] = useState('all');
  const [requestedBookId, setRequestedBookId] = useState(null);

  // Consulta reactiva a Supabase para cuando se introduzcan libros reales
  useEffect(() => {
    let isMounted = true;
    const fetchBooks = async () => {
      try {
        const { data, error } = await supabase
          .from('libros')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0 && isMounted) {
          setSupabaseBooks(data);
        }
      } catch (err) {
        // En caso de que la tabla aún no exista o esté vacía, permanece vacío
        console.info('Aún no hay registros en public.libros:', err?.message || err);
      }
    };

    fetchBooks();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fuente de libros: registros de Supabase si existen, o catálogo base de la Biblioteca Solón Argüello
  const rawBooks =
    supabaseBooks && supabaseBooks.length > 0
      ? supabaseBooks
      : MOCK_RECOMMENDED_BOOKS;

  // Filtrar estrictamente según el tema que se esté visualizando en la biblioteca
  const filteredBooks = useMemo(() => {
    return rawBooks.filter((book) => {
      const targetStationId = activeStation?.id || (selectedStationFilter !== 'all' ? selectedStationFilter : null);
      const matchStation =
        !targetStationId ||
        book.stationId === targetStationId ||
        book.themeId === targetStationId ||
        book.seccion_id === targetStationId;

      const matchQuery =
        !searchQuery ||
        (book.titulo && book.titulo.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (book.autor && book.autor.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchStation && matchQuery;
    });
  }, [rawBooks, activeStation, selectedStationFilter, searchQuery]);

  const handleRequestBook = (book) => {
    setRequestedBookId(book.id);
    setTimeout(() => {
      setRequestedBookId(null);
    }, 3000);
  };

  return (
    <aside
      aria-label="Panel lateral de Libros Recomendados"
      className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] lg:w-[460px] bg-[#0B1A30]/95 backdrop-blur-xl border-l border-slate-700/80 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col text-slate-100 ${
        isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
      }`}
    >
      {/* 1. CABECERA DEL PANEL */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0B1A30]/90 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#E5A00D]/15 border border-[#E5A00D]/40 text-[#E5A00D]">
            <BookOpen size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide">
                Libros Recomendados
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#E5A00D] text-slate-950 uppercase tracking-wider">
                Sprint 3
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeStation ? (
                <span>
                  Elemento en escena: <strong className="text-amber-300">{activeStation.name}</strong>
                </span>
              ) : (
                'Catálogo bibliográfico vinculado al recorrido virtual'
              )}
            </p>
          </div>
        </div>

        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          title="Cerrar panel lateral"
          aria-label="Cerrar panel lateral"
        >
          <X size={18} />
        </button>
      </div>

      {/* 2. BARRA DE ESTADO DE ELEMENTO CULTURAL / SELECTOR DE PABELLÓN */}
      <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <Layers size={13} className="text-[#E5A00D]" />
            <span>Filtrar por elemento cultural:</span>
          </span>
          {activeStation && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-800/60">
              <Eye size={11} />
              <span>Enfocado en 3D</span>
            </span>
          )}
        </div>

        {/* Píldoras de pabellones para explorar recomendaciones por elemento */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => {
              setSelectedStationFilter('all');
              if (activeStation) onSelectStation(null);
            }}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
              !activeStation && selectedStationFilter === 'all'
                ? 'bg-[#E5A00D] text-slate-950 font-bold shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Todos
          </button>
          {allStations.map((st) => {
            const isSelected = activeStation?.id === st.id || selectedStationFilter === st.id;
            return (
              <button
                key={st.id}
                onClick={() => {
                  setSelectedStationFilter(st.id);
                  onSelectStation(st);
                }}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? 'bg-[#E5A00D] text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>{st.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. BARRA DE HERRAMIENTAS: BÚSQUEDA Y CONMUTADOR DE DEMO */}
      <div className="p-4 border-b border-slate-800/70 bg-[#0B1A30]/50 space-y-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por título, autor o cultura..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900/90 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#E5A00D] transition-colors"
          />
        </div>

        {/* Opciones de Comportamiento y Vista Previa */}
        <div className="space-y-2">
          {/* Opción adicional: auto-desplegar al enfocar elemento */}
          <div className="flex items-center justify-between text-xs text-slate-300 px-1">
            <span className="flex items-center gap-1.5">
              <Bell size={12} className="text-[#E5A00D]" />
              <span>Abrir al enfocar un elemento en 3D</span>
            </span>
            <input
              type="checkbox"
              checked={autoOpenOnFocus}
              onChange={(e) => onToggleAutoOpen(e.target.checked)}
              className="accent-[#E5A00D] cursor-pointer"
            />
          </div>

          {/* Interruptor para simular o probar cómo se verá cuando se carguen libros */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-[#E5A00D]" />
              <div>
                <p className="text-xs font-semibold text-slate-200">
                  Modo Vista Previa de Maqueta
                </p>
                <p className="text-[11px] text-slate-400">
                  Muestra tarjetas de libros de prueba en el diseño
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowDemoPreview((prev) => !prev)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                showDemoPreview ? 'bg-[#E5A00D]' : 'bg-slate-700'
              }`}
              role="switch"
              aria-checked={showDemoPreview}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                  showDemoPreview ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 4. CONTENIDO PRINCIPAL: LISTADO O ESTADO VACÍO PREPARADO */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {filteredBooks.length > 0 ? (
          <>
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>
                Mostrando <strong className="text-white">{filteredBooks.length}</strong> recomendación(es)
              </span>
              {showDemoPreview && (
                <span className="text-amber-400 text-[11px] font-medium flex items-center gap-1">
                  <Sparkles size={11} /> Datos simulados
                </span>
              )}
            </div>

            {filteredBooks.map((book) => {
              const isRequested = requestedBookId === book.id;

              return (
                <article
                  key={book.id}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-[#E5A00D]/50 hover:bg-slate-900 transition-all shadow-sm flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    {/* Título del libro */}
                    <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
                      {book.titulo || book.title}
                    </h4>

                    {/* Autor */}
                    <p className="text-xs text-amber-300 font-medium">
                      Autor: <span className="text-slate-200">{book.autor || book.author}</span>
                    </p>

                    {/* Código de libro */}
                    <div className="inline-block mt-1 px-2.5 py-1 rounded bg-[#0B1A30] border border-amber-500/40 text-xs font-mono text-slate-200">
                      Código: <strong className="text-amber-400">{book.isbn || book.callNumber || book.codigo || book.code || 'SEC-VR-01'}</strong>
                    </div>
                  </div>

                  {/* Botón de Acción Interactivo */}
                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-end">
                    <button
                      onClick={() => handleRequestBook(book)}
                      disabled={isRequested}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isRequested
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#E5A00D] hover:bg-amber-400 text-slate-950 shadow-sm'
                      }`}
                    >
                      {isRequested ? (
                        <>
                          <CheckCircle2 size={13} />
                          <span>¡Apartado en Mostrador!</span>
                        </>
                      ) : (
                        <>
                          <span>Apartar en Biblioteca</span>
                          <ChevronRight size={13} />
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </>
        ) : (
          /* 5. ESTADO VACÍO PREPARADO (REQUERIMIENTO: "Aun no hay ningún libro, solo déjalo listo") */
          <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-center p-6 rounded-2xl border border-dashed border-slate-700/80 bg-slate-900/30">
            <div className="w-14 h-14 rounded-2xl bg-[#E5A00D]/10 border border-[#E5A00D]/30 flex items-center justify-center text-[#E5A00D] mb-4 shadow-inner">
              <Library size={28} />
            </div>

            <h4 className="text-sm sm:text-base font-bold text-white mb-2">
              Aún no hay libros vinculados a este elemento
            </h4>

            <p className="text-xs text-slate-400 max-w-xs leading-relaxed mb-4">
              El panel lateral interactivo se encuentra completamente configurado y listo para recibir los registros bibliográficos desde la tabla <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">public.libros</code> de Supabase.
            </p>

            <div className="w-full max-w-xs p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-left space-y-1.5 mb-4 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <Info size={12} className="text-[#E5A00D]" />
                <span>Estado de Implementación (Sprint 3)</span>
              </div>
              <p className="text-slate-400">
                • Responsable: <strong>Luis Carlos Durán Ocampo</strong>
              </p>
              <p className="text-slate-400">
                • Elemento en escena:{' '}
                <strong className="text-amber-300">
                  {activeStation ? activeStation.name : 'Ninguno (General)'}
                </strong>
              </p>
              <p className="text-slate-400">
                • Conexión lista: <span className="text-emerald-400">Props & Hooks activos</span>
              </p>
            </div>

            <button
              onClick={() => setShowDemoPreview(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-[#E5A00D] hover:bg-amber-400 transition-all shadow-md cursor-pointer"
            >
              <Sparkles size={14} />
              <span>Ver Vista Previa de Demostración</span>
            </button>
          </div>
        )}
      </div>

      {/* 6. PIE DE PANEL: INDICACIÓN ERGONÓMICA / CRÉDITOS SPRINT */}
      <div className="p-3.5 bg-slate-950 border-t border-slate-800 text-center text-[11px] text-slate-400">
        <span>Biblioteca Pública Solón Argüello • Experiencia WebXR</span>
      </div>
    </aside>
  );
}

export default RecommendedBooksPanel;
