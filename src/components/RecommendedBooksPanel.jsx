import React, { useState, useMemo, useEffect } from 'react';
import {
  getInventoryBooks,
  subscribeInventory
} from '../services/inventoryService';
import {
  addRequestedBook,
  removeRequestedBook,
  isBookRequested,
  getRequestedBooks,
  subscribeRequestedBooks
} from '../services/counterCheckoutService';
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
  Bell,
  Utensils
} from 'lucide-react';

/**
 * Libros del fondo oficial de la Biblioteca Solón Argüello
 */
const MOCK_RECOMMENDED_BOOKS = [
  {
    id: 'relatos-huicholes',
    stationId: 'deidades',
    titulo: 'Relatos Huicholes',
    autor: 'Lucila Mondragón, Jacqueline Tello y Argelia Valdez (Compiladoras)',
    editorial: 'Consejo Nacional para la Cultura y las Artes (CONACULTA)',
    anio: 1996,
    isbn: '968-29-8518-8',
    codigo: '968-29-8518-8',
    stock: 4,
    disponible: true,
    cultura: 'Wixárika',
    seccion: 'Sala de Culturas Vivas & VR (SEC-VR-01)',
    portadaUrl: '/portadas/portada_relatos_huicholes.jpg',
    descripcionCorta: 'Recopilación bilingüe de la tradición oral, mitos del origen del sol y la luna, el fuego de Tatewari y el maíz sagrado.'
  },
  {
    id: 'cultura-wixarika-desafios',
    stationId: 'fiestas',
    titulo: 'La cultura wixárika ante los desafíos del mundo actual',
    autor: 'Sarah Corona Berkin & Rozenn Le Mûr (Coordinadoras)',
    editorial: 'Consejo Nacional para la Cultura y las Artes (CONACULTA)',
    anio: 2015,
    isbn: '978-607-8423-62-0',
    codigo: '978-607-8423-62-0',
    stock: 3,
    disponible: true,
    cultura: 'Wixárika',
    seccion: 'Sala de Culturas Vivas & VR (SEC-VR-01)',
    portadaUrl: '/portadas/portada_cultura_wixarika_desafios.jpg',
    descripcionCorta: 'Análisis antropológico sobre la identidad, comunicación intercultural y negociación del pueblo wixárika frente a la sociedad contemporánea.'
  }
];

export const GASTRONOMY_DISHES_PREVIEW = [
  {
    id: 'gastro-tortillas',
    title: 'Tortillas de Maíz Criollo',
    nativeName: '«Mewi» · Tortillas Ceremoniales',
    image: '/texturas/cuadro_gastro_tortillas.jpg',
    desc: 'Maíz criollo nixtamalizado y cocido a mano sobre comal con leña de roble.'
  },
  {
    id: 'gastro-caldo',
    title: 'Caldo de Toro Ceremonial',
    nativeName: '«Caldo de Toro» de Grandes Fiestas',
    image: '/texturas/cuadro_gastro_caldo_toro.jpg',
    desc: 'Preparado en ollas de barro comunitarias para alimentar a los jicareros.'
  },
  {
    id: 'gastro-tamales',
    title: 'Tamales de Totomoxtle',
    nativeName: '«Tamales Tradicionales» de Maíz',
    image: '/texturas/cuadro_gastro_tamales.jpg',
    desc: 'Cocción al vapor en hoja de totomoxtle, ofrenda a deidades y ancestros.'
  },
  {
    id: 'gastro-tejuino',
    title: 'Tejuino y Atole de Maíz',
    nativeName: '«Nawá» · Tejuino Ceremonial Fermentado',
    image: '/texturas/cuadro_gastro_atole_tejuino.jpg',
    desc: 'Bebida sagrada fermentada que brinda vitalidad en los cantos del Mara\'akame.'
  },
  {
    id: 'gastro-perruri',
    title: 'Perruri de Semillas',
    nativeName: '«Perruri» · Maíz Tostado y Pepita Dulce',
    image: '/texturas/cuadro_gastro_perruri.jpg',
    desc: 'Pasta tradicional dulce de maíz tostado con pepitas molidas y miel serrana.'
  },
  {
    id: 'gastro-tostado',
    title: 'Maíz Tostado y Pinole',
    nativeName: '«Haute» · Bastimento del Caminante',
    image: '/texturas/cuadro_gastro_maiz_tostado.jpg',
    desc: 'Provisión sagrada ligera y nutritiva transportada en morrales hacia Wirikuta.'
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
  onToggleAutoOpen = () => {},
  onOpenCheckout = () => {}
}) {
  const [inventoryBooks, setInventoryBooks] = useState([]);
  const [showDemoPreview, setShowDemoPreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStationFilter, setSelectedStationFilter] = useState('all');
  const [requestedList, setRequestedList] = useState(() => getRequestedBooks());

  useEffect(() => {
    const unsub = subscribeRequestedBooks((list) => {
      setRequestedList(list);
    });
    return () => unsub();
  }, []);

  // Consulta reactiva al inventario de libros (Supabase + fallback)
  useEffect(() => {
    let isMounted = true;
    getInventoryBooks().then((books) => {
      if (isMounted && Array.isArray(books) && books.length > 0) {
        setInventoryBooks(books);
      }
    });

    const unsub = subscribeInventory((books) => {
      if (isMounted && Array.isArray(books) && books.length > 0) {
        setInventoryBooks(books);
      }
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  // Fuente de libros: inventario sincronizado con Supabase o maqueta base
  const rawBooks = useMemo(() => {
    if (showDemoPreview) return MOCK_RECOMMENDED_BOOKS;
    if (inventoryBooks && inventoryBooks.length > 0) return inventoryBooks;
    return MOCK_RECOMMENDED_BOOKS;
  }, [showDemoPreview, inventoryBooks]);

  // Filtrar según el tema enfocado o búsqueda
  const filteredBooks = useMemo(() => {
    const targetStationId = activeStation?.id || (selectedStationFilter !== 'all' ? selectedStationFilter : null);

    const matches = rawBooks.filter((book) => {
      const matchQuery =
        !searchQuery ||
        (book.titulo && book.titulo.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (book.autor && book.autor.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (book.cultura && book.cultura.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchQuery) return false;

      if (!targetStationId) return true;

      const titleLower = (book.titulo || '').toLowerCase();
      const synopsisLower = (book.sinopsis || book.descripcionCorta || '').toLowerCase();
      const text = `${titleLower} ${synopsisLower}`;

      if (targetStationId === 'deidades') {
        return (
          book.stationId === 'deidades' ||
          text.includes('fuego') ||
          text.includes('mara\'akame') ||
          text.includes('tatewari') ||
          text.includes('venado') ||
          text.includes('wirikuta') ||
          text.includes('cosmovisión') ||
          text.includes('chaquira') ||
          text.includes('sagrado')
        );
      }

      if (targetStationId === 'gastronomia') {
        return (
          book.stationId === 'gastronomia' ||
          text.includes('sabor') ||
          text.includes('cocina') ||
          text.includes('etnobotánica') ||
          text.includes('maíz') ||
          text.includes('alimento') ||
          text.includes('gastronom')
        );
      }

      if (targetStationId === 'fiestas') {
        return (
          book.stationId === 'fiestas' ||
          text.includes('fiesta') ||
          text.includes('rito') ||
          text.includes('ceremonia') ||
          text.includes('danza') ||
          text.includes('mitote') ||
          text.includes('judea') ||
          text.includes('tambor')
        );
      }

      return true;
    });

    // Si el filtro específico por estación no arroja libros pero el catálogo sí tiene, mostrar el acervo completo
    if (matches.length === 0 && !searchQuery) {
      return rawBooks;
    }

    return matches;
  }, [rawBooks, activeStation, selectedStationFilter, searchQuery]);

  const handleToggleRequestBook = (book) => {
    if (isBookRequested(book.id)) {
      removeRequestedBook(book.id);
    } else {
      addRequestedBook(book);
    }
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

      {/* BANNER DE LIBROS APARTADOS PARA MOSTRADOR (SPRINT 5) */}
      {requestedList.length > 0 && (
        <div className="mx-4 mt-3 p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-amber-300 font-bold">
            <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
            <span>{requestedList.length} {requestedList.length === 1 ? 'libro apartado' : 'libros apartados'} para mostrador</span>
          </div>
          <button
            onClick={onOpenCheckout}
            className="px-3 py-1 bg-[#E5A00D] hover:bg-amber-400 text-[#0B1A30] font-black text-xs rounded-lg transition-all shadow-xs cursor-pointer shrink-0"
          >
            Ficha de Salida →
          </button>
        </div>
      )}

      {/* 4. CONTENIDO PRINCIPAL: LISTADO O ESTADO VACÍO PREPARADO */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {/* SECCIÓN ESPECIAL: MUESTRA FOTOGRÁFICA DE GASTRONOMÍA TRADICIONAL */}
        {(activeStation?.id === 'gastronomia' || selectedStationFilter === 'gastronomia') && (
          <div className="p-3.5 rounded-xl bg-gradient-to-b from-[#1c130b] to-[#0f172a] border border-amber-500/40 shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-amber-600/30">
              <Utensils size={15} className="text-[#E5A00D]" />
              <h4 className="text-xs font-bold text-amber-200">
                Fotogalería del Acervo Gastronómico de Nayarit
              </h4>
            </div>
            <p className="text-[11px] text-amber-100/70 leading-relaxed">
              Fotografías en alta resolución y cédulas antropológicas de los 6 alimentos sagrados documentados en la sala 3D:
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {GASTRONOMY_DISHES_PREVIEW.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg bg-slate-900/90 border border-amber-900/40 p-2 flex flex-col gap-1.5 hover:border-[#E5A00D]/60 transition-colors shadow-xs"
                >
                  <div className="relative aspect-4/3 w-full rounded overflow-hidden bg-black/50 border border-amber-700/40">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-bold text-amber-100 line-clamp-1">{item.title}</p>
                    <p className="text-[10px] text-amber-400 font-medium italic line-clamp-1">{item.nativeName}</p>
                    <p className="text-[9px] text-slate-300 line-clamp-2 leading-tight">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
              const coverImg =
                book.portada_url ||
                book.portadaUrl ||
                (book.isbn === '968-29-8518-8'
                  ? '/portadas/portada_relatos_huicholes.jpg'
                  : book.isbn === '978-607-8423-62-0'
                  ? '/portadas/portada_cultura_wixarika_desafios.jpg'
                  : null);

              return (
                <article
                  key={book.id}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-[#E5A00D]/50 hover:bg-slate-900 transition-all shadow-sm flex flex-col justify-between gap-3"
                >
                  <div className="flex gap-3.5 items-start">
                    {coverImg && (
                      <div className="w-16 h-22 shrink-0 rounded-lg overflow-hidden border border-amber-600/40 bg-black/50 shadow-md">
                        <img
                          src={coverImg}
                          alt={book.titulo || book.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      {/* Título del libro */}
                      <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
                        {book.titulo || book.title}
                      </h4>

                      {/* Autor */}
                      <p className="text-xs text-amber-300 font-medium">
                        Autor: <span className="text-slate-200">{book.autor || book.author}</span>
                      </p>

                      {/* Metadatos: Cultura, Código y Existencias */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {book.cultura && (
                          <span className="px-2 py-0.5 rounded-md bg-[#0B1A30] border border-amber-500/40 text-[11px] font-semibold text-amber-300">
                            {book.cultura}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-300">
                          {book.codigo || book.isbn || book.callNumber || 'SEC-VR-01'}
                        </span>
                        {typeof book.stock === 'number' && (
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            book.stock > 0
                              ? 'bg-emerald-950/70 border border-emerald-800/80 text-emerald-400'
                              : 'bg-rose-950/70 border border-rose-800/80 text-rose-400'
                          }`}>
                            {book.stock > 0 ? `${book.stock} en sala` : 'En préstamo'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Botón de Acción Interactivo */}
                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-end">
                    {(() => {
                      const isRequested = isBookRequested(book.id);
                      return (
                        <button
                          onClick={() => handleToggleRequestBook(book)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            isRequested
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                              : 'bg-[#E5A00D] hover:bg-amber-400 text-slate-950 shadow-sm'
                          }`}
                        >
                          {isRequested ? (
                            <>
                              <CheckCircle2 size={13} />
                              <span>¡Apartado en Mostrador! (Quitar)</span>
                            </>
                          ) : (
                            <>
                              <span>Apartar para Mostrador</span>
                              <ChevronRight size={13} />
                            </>
                          )}
                        </button>
                      );
                    })()}
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
