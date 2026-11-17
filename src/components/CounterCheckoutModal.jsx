import React, { useState, useEffect } from 'react';
import {
  getRequestedBooks,
  removeRequestedBook,
  clearRequestedBooks,
  getFolio,
  subscribeRequestedBooks
} from '../services/counterCheckoutService';
import { BiblioLogo } from './BiblioLogo';
import {
  CheckCircle2,
  Printer,
  Copy,
  BookOpen,
  X,
  Layers,
  Sparkles,
  Library,
  ArrowRight,
  LogOut,
  Calendar,
  Clock,
  Ticket,
  AlertCircle
} from 'lucide-react';

export function CounterCheckoutModal({ isOpen, onClose, onFinishVisit }) {
  const [requestedBooks, setRequestedBooks] = useState([]);
  const [folio, setFolio] = useState('');
  const [copied, setCopied] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setRequestedBooks(getRequestedBooks());
    setFolio(getFolio());

    const unsub = subscribeRequestedBooks((updated) => {
      setRequestedBooks(updated);
    });

    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const handleRemove = (bookId) => {
    removeRequestedBook(bookId);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const lines = [
      '====================================================',
      'BIBLIOTECA PÚBLICA PROFESOR SOLÓN ARGÜELLO (TEPIC, NAYARIT)',
      `FOLIO DE MOSTRADOR: ${folio}`,
      `FECHA: ${new Date().toLocaleDateString('es-MX')} ${new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`,
      '====================================================',
      'LIBROS SOLICITADOS PARA CONSULTA FÍSICA EN MOSTRADOR:',
      ...requestedBooks.map(
        (b, i) =>
          `${i + 1}. "${b.titulo}" - ${b.autor}\n   Cultura: ${b.cultura} | Código: ${b.codigo || b.isbn}\n   Ubicación: ${b.seccion}`
      ),
      '====================================================',
      'Presenta este folio al bibliotecario en el mostrador.'
    ];

    navigator.clipboard?.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleFinishAndExit = () => {
    setFinished(true);
    setTimeout(() => {
      clearRequestedBooks();
      setFinished(false);
      if (onFinishVisit) onFinishVisit();
      else onClose();
    }, 2200);
  };

  const todayStr = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const timeStr = new Date().toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#0B1A30]/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn select-none">
      <div className="relative w-full max-w-2xl bg-[#0F223D] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 my-8 max-h-[92vh] flex flex-col justify-between overflow-hidden">
        {/* Barra superior de acento dorado */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-[#E5A00D] to-amber-600 rounded-t-3xl" />

        {/* Botón Cerrar (Esquina Superior Derecha) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer z-10"
          title="Cerrar y continuar en el museo"
        >
          <X size={20} />
        </button>

        {/* PANTALLA DE DESPEDIDA / FINALIZACIÓN */}
        {finished ? (
          <div className="py-16 text-center space-y-4 animate-scaleIn">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 mb-2">
              <CheckCircle2 size={44} />
            </div>
            <h2 className="text-2xl font-black text-amber-400">
              ¡Gracias por tu Visita Cultural!
            </h2>
            <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              Tu folio <strong className="text-white bg-[#0B1A30] px-2 py-0.5 rounded border border-amber-500/40">{folio}</strong> ha sido registrado.
              Dirígete al mostrador contiguo para que el bibliotecario te entregue tus ejemplares.
            </p>
            <div className="text-xs text-slate-400 pt-2">
              Biblioteca Pública Profesor Solón Argüello · Difusión de Culturas Vivas de Nayarit
            </div>
          </div>
        ) : (
          <>
            {/* CABECERA DE LA PANTALLA DE SALIDA */}
            <div className="pb-4 border-b border-slate-700/80">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-[#0B1A30] border border-amber-500/40 shadow-xs">
                  <BiblioLogo size={32} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                      Sprint 5 · Flujo Lector
                    </span>
                    <span className="text-xs text-slate-400">Salida del Recorrido Inmersivo</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    Resumen de Libros para Pedir en Mostrador
                  </h1>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-800 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-[#E5A00D]" />
                  <span className="capitalize">{todayStr} · {timeStr}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-white bg-[#0B1A30] px-2.5 py-1 rounded-md border border-amber-500/50">
                  <Ticket size={13} className="text-amber-400" />
                  <span>FOLIO: <strong className="text-amber-400 font-bold">{folio}</strong></span>
                </div>
              </div>
            </div>

            {/* CONTENIDO PRINCIPAL: LISTA O ESTADO VACÍO */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {requestedBooks.length > 0 ? (
                <>
                  {/* Tarjeta de Instrucción para el Mostrador */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#0B1A30] to-[#122b52] border border-amber-500/30 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                      <Library size={22} />
                    </div>
                    <div className="text-xs text-slate-300 leading-relaxed">
                      <strong className="text-amber-400 block font-bold text-sm mb-0.5">
                        Pase de Entrega en Mostrador de Atención
                      </strong>
                      Has apartado <strong className="text-white font-bold">{requestedBooks.length} {requestedBooks.length === 1 ? 'libro' : 'libros'}</strong> durante tu recorrido.
                      Muestra esta pantalla, imprime tu ticket o proporciona tu número de folio al bibliotecario para recibirlos físicamente.
                    </div>
                  </div>

                  {/* Listado de Libros Apartados */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Ejemplares Solicitados ({requestedBooks.length}):
                    </span>

                    {requestedBooks.map((book, index) => (
                      <div
                        key={book.id || index}
                        className="bg-[#0B1A30]/80 p-4 rounded-2xl border border-slate-700/80 hover:border-amber-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                              {index + 1}
                            </span>
                            <h4 className="text-sm font-bold text-white">
                              {book.titulo}
                            </h4>
                          </div>

                          <p className="text-xs text-amber-300/90 pl-7">
                            Autor: <span className="text-slate-200">{book.autor}</span>
                          </p>

                          <div className="flex flex-wrap items-center gap-2 pl-7 pt-1 text-[11px]">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                              Signatura: <strong className="text-amber-400">{book.codigo || book.isbn || 'SEC-VR-01'}</strong>
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/60">
                              <Layers size={11} />
                              <span>{book.cultura || 'Cultura Viva'}</span>
                            </span>
                            <span className="text-slate-400">
                              Ubicación: <strong className="text-slate-300">{book.seccion || 'Sala de Lectura'}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Botón para quitar de la lista */}
                        <button
                          onClick={() => handleRemove(book.id)}
                          className="self-end sm:self-center p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1"
                          title="Quitar libro de la solicitud"
                        >
                          <X size={14} />
                          <span className="sm:hidden">Quitar</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                /* ESTADO VACÍO: SI EL USUARIO AÚN NO HA APARTADO NINGUNO */
                <div className="py-12 text-center space-y-3 rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-6">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-1">
                    <BookOpen size={28} />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Aún no has apartado libros en esta visita
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Durante tu recorrido puedes pulsar <strong>"Apartar en Biblioteca"</strong> en los cuadros y paneles culturales de las culturas Wixárika, Náayeri, O'dam y Mexicanera.
                  </p>
                  <button
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 px-4 py-2 mt-2 font-bold text-xs text-[#0B1A30] bg-[#E5A00D] hover:bg-amber-400 rounded-xl transition-all cursor-pointer shadow-md"
                  >
                    <span>Explorar Museo y Acervo</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* PIE DE ACCIONES DE LA PANTALLA DE SALIDA */}
            <div className="pt-4 border-t border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-all cursor-pointer text-center"
                >
                  Continuar Explorando
                </button>

                {requestedBooks.length > 0 && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl font-semibold text-slate-300 hover:text-amber-400 hover:bg-slate-800 border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    title="Copiar lista de libros con folio"
                  >
                    <Copy size={14} />
                    <span>{copied ? '¡Copiado!' : 'Copiar Ficha'}</span>
                  </button>
                )}

                {requestedBooks.length > 0 && (
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl font-semibold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    title="Imprimir ficha para mostrador"
                  >
                    <Printer size={14} />
                    <span>Imprimir</span>
                  </button>
                )}
              </div>

              {requestedBooks.length > 0 && (
                <button
                  type="button"
                  onClick={handleFinishAndExit}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-[#0B1A30] bg-[#E5A00D] hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogOut size={15} />
                  <span>Finalizar Visita y Pedir en Mostrador</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CounterCheckoutModal;
