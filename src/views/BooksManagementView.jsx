import React, { useState, useEffect } from 'react';
import {
  getInventoryBooks,
  addBookToInventory,
  updateBookInInventory,
  removeBookFromInventory,
  adjustStock,
  toggleRecommendation,
  subscribeInventory
} from '../services/inventoryService';
import { getCultures, subscribeCultures } from '../services/culturalService';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Package,
  PlusCircle,
  MinusCircle,
  Layers,
  ChevronDown
} from 'lucide-react';

export function BooksManagementView() {
  const [books, setBooks] = useState([]);
  const [cultures, setCultures] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [search, setSearch] = useState('');
  const [selectedCulture, setSelectedCulture] = useState('all');
  const [selectedVR, setSelectedVR] = useState('all'); // 'all' | 'vr' | 'novr'
  const [selectedStock, setSelectedStock] = useState('all'); // 'all' | 'in_stock' | 'out_of_stock'

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [deletingBook, setDeletingBook] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    titulo: '',
    autor: '',
    cultura_id: '',
    isbn: '',
    codigo: '',
    stock: 3,
    disponible: true,
    recomendado: true,
    anio: 2024,
    editorial: '',
    seccion: 'Sala de Culturas Vivas & VR (SEC-VR-01)',
    sinopsis: ''
  });

  const loadAll = async () => {
    try {
      setLoading(true);
      const [cults, bks] = await Promise.all([
        getCultures(),
        getInventoryBooks()
      ]);
      setCultures(cults);
      setBooks(bks);
    } catch (err) {
      console.error('Error cargando inventario:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();

    const unsubBooks = subscribeInventory((updatedBooks) => {
      setBooks(updatedBooks);
    });

    const unsubCultures = subscribeCultures((updatedCults) => {
      setCultures(updatedCults);
    });

    return () => {
      unsubBooks();
      unsubCultures();
    };
  }, []);

  const showFeedback = (text, type = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Abrir modal de nuevo libro
  const handleOpenCreate = () => {
    setEditingBook(null);
    const defaultCultureId = cultures[0]?.id || '';
    setFormData({
      titulo: '',
      autor: '',
      cultura_id: defaultCultureId,
      isbn: '',
      codigo: '',
      stock: 3,
      disponible: true,
      recomendado: true,
      anio: new Date().getFullYear(),
      editorial: 'Fondo Editorial Indígena de Nayarit',
      seccion: 'Sala de Culturas Vivas & VR (SEC-VR-01)',
      sinopsis: ''
    });
    setIsModalOpen(true);
  };

  // Abrir modal de editar libro
  const handleOpenEdit = (book) => {
    setEditingBook(book);
    setFormData({
      titulo: book.titulo || '',
      autor: book.autor || '',
      cultura_id: book.cultura_id || cultures.find((c) => c.nombre === book.cultura)?.id || cultures[0]?.id || '',
      isbn: book.isbn || '',
      codigo: book.codigo || book.isbn || '',
      stock: typeof book.stock === 'number' ? book.stock : 1,
      disponible: book.disponible ?? true,
      recomendado: Boolean(book.recomendado),
      anio: book.anio || 2024,
      editorial: book.editorial || '',
      seccion: book.seccion || 'Sala de Culturas Vivas & VR (SEC-VR-01)',
      sinopsis: book.sinopsis || ''
    });
    setIsModalOpen(true);
  };

  // Guardar (Crear o Editar)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.titulo.trim() || !formData.autor.trim()) return;

    try {
      const selectedCultObj = cultures.find((c) => c.id === formData.cultura_id);
      const payload = {
        ...formData,
        cultura: selectedCultObj ? selectedCultObj.nombre : 'Cultura Viva'
      };

      if (editingBook) {
        await updateBookInInventory(editingBook.id, payload);
        showFeedback(`Libro "${formData.titulo}" actualizado exitosamente.`);
      } else {
        await addBookToInventory(payload);
        showFeedback(`Libro "${formData.titulo}" agregado al inventario de Culturas Vivas.`);
      }
      setIsModalOpen(false);
      loadAll();
    } catch (err) {
      showFeedback('Error al guardar el libro: ' + err.message, 'error');
    }
  };

  // Confirmar y eliminar
  const handleConfirmDelete = async () => {
    if (!deletingBook) return;
    try {
      await removeBookFromInventory(deletingBook.id);
      showFeedback(`Libro "${deletingBook.titulo}" quitado del inventario.`, 'info');
      setDeletingBook(null);
      loadAll();
    } catch (err) {
      showFeedback('Error al eliminar libro: ' + err.message, 'error');
    }
  };

  // Ajuste rápido de stock
  const handleStockDelta = async (bookId, delta) => {
    try {
      await adjustStock(bookId, delta);
    } catch (err) {
      console.error('Error ajustando stock:', err);
    }
  };

  // Conmutar recomendación VR
  const handleToggleVR = async (bookId) => {
    try {
      await toggleRecommendation(bookId);
    } catch (err) {
      console.error('Error conmutando recomendación:', err);
    }
  };

  // Filtrado reactivo de libros
  const filteredBooks = books.filter((b) => {
    // 1. Búsqueda de texto
    const term = search.toLowerCase();
    const matchesSearch =
      b.titulo?.toLowerCase().includes(term) ||
      b.autor?.toLowerCase().includes(term) ||
      b.isbn?.toLowerCase().includes(term) ||
      b.cultura?.toLowerCase().includes(term) ||
      b.editorial?.toLowerCase().includes(term);

    // 2. Filtro por Cultura Viva
    const matchesCulture =
      selectedCulture === 'all'
        ? true
        : b.cultura_id === selectedCulture ||
          b.cultura?.toLowerCase() === selectedCulture.toLowerCase();

    // 3. Filtro por Recomendación VR
    const matchesVR =
      selectedVR === 'all'
        ? true
        : selectedVR === 'vr'
        ? b.recomendado
        : !b.recomendado;

    // 4. Filtro por Stock
    const matchesStock =
      selectedStock === 'all'
        ? true
        : selectedStock === 'in_stock'
        ? (b.stock || 0) > 0
        : (b.stock || 0) <= 0;

    return matchesSearch && matchesCulture && matchesVR && matchesStock;
  });

  // Métricas agregadas
  const totalStock = books.reduce((acc, b) => acc + (b.stock || 0), 0);
  const totalVR = books.filter((b) => b.recomendado).length;
  const outOfStock = books.filter((b) => (b.stock || 0) <= 0).length;

  return (
    <div className="space-y-5 animate-fadeIn pb-8">
      {/* Notificación flotante */}
      {feedbackMsg && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl shadow-lg border transition-all ${
            feedbackMsg.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : feedbackMsg.type === 'info'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}
        >
          {feedbackMsg.type === 'error' ? (
            <AlertCircle size={20} className="text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          )}
          <span className="text-sm font-semibold">{feedbackMsg.text}</span>
        </div>
      )}

      {/* Cabecera del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-bold bg-[#0B1A30] text-amber-400 rounded-md uppercase tracking-wider">
              Control de Inventario
            </span>
            <span className="text-xs text-slate-400 font-medium">Acervo de Culturas Vivas</span>
          </div>
          <h2 className="text-xl font-black text-[#0B1A30]">
            Inventario de Libros — Culturas Vivas de Nayarit
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Gestiona exclusivamente las obras pertenecientes a las culturas vivas que se recomiendan o existen en la base de datos
            (Wixárika, Náayeri, O'dam, Mexicanero). Controla existencias físicas, altas y bajas en el acervo.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-[#E5A00D] text-[#0B1A30] hover:bg-amber-400 shadow-md shadow-amber-500/20 transition-all cursor-pointer shrink-0"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Agregar Libro al Inventario</span>
        </button>
      </div>

      {/* Tarjetas Métricas de Inventario */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs border-l-4 border-l-[#0B1A30]">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Títulos de Culturas Vivas</span>
          <span className="text-2xl font-black text-[#0B1A30]">{books.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs border-l-4 border-l-[#E5A00D]">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Ejemplares en Inventario</span>
          <span className="text-2xl font-black text-[#b45309]">{totalStock}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs border-l-4 border-l-emerald-600">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Recomendados en Sala VR</span>
          <span className="text-2xl font-black text-emerald-700">{totalVR}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs border-l-4 border-l-rose-500">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Títulos sin Ejemplares</span>
          <span className="text-2xl font-black text-rose-600">{outOfStock}</span>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por título, autor o ISBN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#E5A00D] transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Filtro por Cultura Viva */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500">Cultura:</span>
              <select
                value={selectedCulture}
                onChange={(e) => setSelectedCulture(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-[#E5A00D]"
              >
                <option value="all">Todas las Culturas Vivas</option>
                {cultures.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} {c.variante ? `(${c.variante})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Recomendación VR */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500">VR:</span>
              <select
                value={selectedVR}
                onChange={(e) => setSelectedVR(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-[#E5A00D]"
              >
                <option value="all">Todos</option>
                <option value="vr">Recomendados (Sí)</option>
                <option value="novr">No recomendados</option>
              </select>
            </div>

            {/* Filtro por Disponibilidad de Stock */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500">Stock:</span>
              <select
                value={selectedStock}
                onChange={(e) => setSelectedStock(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-[#E5A00D]"
              >
                <option value="all">Todos los estados</option>
                <option value="in_stock">Con ejemplares (&gt; 0)</option>
                <option value="out_of_stock">Agotados (0)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium flex items-center justify-between border-t border-slate-100 pt-2">
          <span>
            Mostrando <strong className="text-[#0B1A30] font-bold">{filteredBooks.length}</strong> de{' '}
            <strong className="text-slate-700">{books.length}</strong> libros en inventario
          </span>
          {selectedCulture !== 'all' && (
            <button
              onClick={() => setSelectedCulture('all')}
              className="text-[#b45309] hover:underline font-bold"
            >
              Limpiar filtro de cultura
            </button>
          )}
        </div>
      </div>

      {/* Tabla Principal de Libros e Inventario */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/90 bg-slate-50/70 text-xs font-black text-[#0B1A30] uppercase tracking-wider">
                <th className="py-4 px-6">Título y Autor</th>
                <th className="py-4 px-5">Cultura Viva</th>
                <th className="py-4 px-4 text-center">Inventario / Stock</th>
                <th className="py-4 px-4 text-center">Disponibilidad</th>
                <th className="py-4 px-4 text-center">Recomendado VR</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400">
                    Cargando inventario de libros de Culturas Vivas...
                  </td>
                </tr>
              ) : filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-14 text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2.5 max-w-md mx-auto">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#E5A00D]">
                        <BookOpen size={24} />
                      </div>
                      <p className="font-bold text-slate-700 text-sm">
                        Inventario vacío en espera del catálogo oficial
                      </p>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Se han retirado los registros de prueba. Utiliza el botón <strong>«+ Agregar Libro»</strong> para ingresar los libros definitivos de las Culturas Vivas de Nayarit.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => {
                  const hasStock = (book.stock || 0) > 0;
                  return (
                    <tr
                      key={book.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Título, Portada, Autor e ISBN */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {(book.portada_url ||
                            book.portadaUrl ||
                            (book.isbn === '968-29-8518-8'
                              ? '/portadas/portada_relatos_huicholes.jpg'
                              : book.isbn === '978-607-8423-62-0'
                              ? '/portadas/portada_cultura_wixarika_desafios.jpg'
                              : null)) && (
                            <img
                              src={
                                book.portada_url ||
                                book.portadaUrl ||
                                (book.isbn === '968-29-8518-8'
                                  ? '/portadas/portada_relatos_huicholes.jpg'
                                  : '/portadas/portada_cultura_wixarika_desafios.jpg')
                              }
                              alt={book.titulo}
                              className="w-10 h-14 object-cover rounded-md border border-slate-200 shadow-xs shrink-0 bg-slate-100"
                              loading="lazy"
                            />
                          )}
                          <div>
                            <div className="font-bold text-sm text-[#0B1A30]">
                              {book.titulo}
                            </div>
                            <div className="text-slate-600 font-medium mt-0.5">
                              {book.autor} {book.anio ? `(${book.anio})` : ''}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                              {book.isbn || book.codigo || 'S/N'} · {book.editorial || 'Fondo Nayarit'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Cultura Viva */}
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-[#0B1A30]/5 text-[#0B1A30] border border-[#0B1A30]/15">
                          <Layers size={11} className="text-[#E5A00D]" />
                          <span>{book.cultura || 'Cultura Viva'}</span>
                        </span>
                      </td>

                      {/* Stock / Control Rápido */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                          <button
                            onClick={() => handleStockDelta(book.id, -1)}
                            disabled={(book.stock || 0) <= 0}
                            className="text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                            title="Restar 1 ejemplar"
                          >
                            <MinusCircle size={15} />
                          </button>

                          <span className={`w-8 text-center font-black text-sm ${hasStock ? 'text-slate-800' : 'text-rose-600'}`}>
                            {book.stock || 0}
                          </span>

                          <button
                            onClick={() => handleStockDelta(book.id, 1)}
                            className="text-slate-400 hover:text-slate-700 cursor-pointer"
                            title="Agregar 1 ejemplar"
                          >
                            <PlusCircle size={15} />
                          </button>
                        </div>
                        <span className="block text-[10px] text-slate-400 mt-0.5">ejemplares</span>
                      </td>

                      {/* Disponibilidad en sala */}
                      <td className="py-4 px-4 text-center">
                        {hasStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            <span>En Sala</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                            <span>Agotado</span>
                          </span>
                        )}
                      </td>

                      {/* Recomendado en VR (Clicable para conmutar) */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleToggleVR(book.id)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                            book.recomendado
                              ? 'bg-[#0B1A30] text-amber-400 hover:bg-slate-800'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-700'
                          }`}
                          title="Hacer clic para cambiar recomendación en VR"
                        >
                          <Sparkles size={11} className={book.recomendado ? 'text-[#E5A00D]' : 'text-slate-400'} />
                          <span>{book.recomendado ? 'Sí' : 'No'}</span>
                        </button>
                      </td>

                      {/* Acciones */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(book)}
                            className="p-1.5 text-slate-600 hover:text-[#0B1A30] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Editar información del libro"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => setDeletingBook(book)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Quitar libro del inventario"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL: AGREGAR O EDITAR LIBRO EN INVENTARIO              */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scaleIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <BookOpen size={20} className="text-[#E5A00D]" />
                <h3 className="text-base font-extrabold text-[#0B1A30]">
                  {editingBook ? 'Editar Libro en Inventario' : 'Agregar Libro de Cultura Viva'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Título de la Obra *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. El Fuego Sagrado y los Cantos del Mara'akame"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#E5A00D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Autor(es) / Compilador *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Ramón Medina Silva"
                    value={formData.autor}
                    onChange={(e) => setFormData({ ...formData, autor: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#E5A00D]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Cultura Viva Asociada *
                  </label>
                  <select
                    required
                    value={formData.cultura_id}
                    onChange={(e) => setFormData({ ...formData, cultura_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#E5A00D] font-medium"
                  >
                    {cultures.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} {c.variante ? `(${c.variante})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ejemplares (Stock) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#E5A00D]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Año Publicación
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max="2030"
                    value={formData.anio}
                    onChange={(e) => setFormData({ ...formData, anio: parseInt(e.target.value, 10) || 2024 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#E5A00D]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ISBN / Código
                  </label>
                  <input
                    type="text"
                    placeholder="978-607-..."
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#E5A00D]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Editorial / Institución
                </label>
                <input
                  type="text"
                  placeholder="Ej. Fondo Editorial Indígena / UAN"
                  value={formData.editorial}
                  onChange={(e) => setFormData({ ...formData, editorial: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#E5A00D]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Sección en Biblioteca
                </label>
                <input
                  type="text"
                  placeholder="Ej. Sala de Culturas Vivas & VR (SEC-VR-01)"
                  value={formData.seccion}
                  onChange={(e) => setFormData({ ...formData, seccion: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#E5A00D]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Sinopsis / Reseña Cultural
                </label>
                <textarea
                  rows={2}
                  placeholder="Breve resumen del contenido y relevancia cultural para la difusión..."
                  value={formData.sinopsis}
                  onChange={(e) => setFormData({ ...formData, sinopsis: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#E5A00D] leading-relaxed"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.recomendado}
                    onChange={(e) => setFormData({ ...formData, recomendado: e.target.checked })}
                    className="w-4 h-4 rounded text-[#E5A00D] focus:ring-[#E5A00D]"
                  />
                  <span>Recomendar en la Sala VR</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.disponible}
                    onChange={(e) => setFormData({ ...formData, disponible: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Disponible para Consulta en Sala</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-[#0B1A30] bg-[#E5A00D] hover:bg-amber-400 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {editingBook ? 'Guardar Cambios' : 'Agregar al Inventario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CONFIRMAR QUITAR LIBRO DEL INVENTARIO             */}
      {/* ======================================================== */}
      {deletingBook && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-scaleIn text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 text-rose-600 mb-3">
              <Trash2 size={24} />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1">
              ¿Quitar libro del inventario?
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              ¿Estás seguro de que deseas retirar <strong>"{deletingBook.titulo}"</strong> ({deletingBook.cultura}) del catálogo de la biblioteca?
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingBook(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-all cursor-pointer"
              >
                Sí, Quitar del Inventario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BooksManagementView;
