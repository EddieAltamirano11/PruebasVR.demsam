import React, { useState, useEffect } from 'react';
import {
  getCultures,
  addCulture,
  updateCulture,
  deleteCulture,
  subscribeCultures
} from '../services/culturalService';
import { getInventoryBooks } from '../services/inventoryService';
import {
  Landmark,
  Plus,
  Search,
  Edit2,
  Trash2,
  Sparkles,
  MapPin,
  Languages,
  BookOpen,
  X,
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldCheck,
  Compass
} from 'lucide-react';

export function CulturesManagementView() {
  const [cultures, setCultures] = useState([]);
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [filterVR, setFilterVR] = useState('all'); // 'all' | 'vr' | 'archive'
  const [loading, setLoading] = useState(true);

  // Estados de Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCulture, setEditingCulture] = useState(null);
  const [deletingCulture, setDeletingCulture] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    nombre: '',
    variante: '',
    region: '',
    lengua: '',
    descripcion: '',
    tradiciones: '',
    activaVR: true,
    color: '#E5A00D'
  });

  // Cargar culturas y libros para cálculo de relaciones
  const loadData = async () => {
    try {
      setLoading(true);
      const [cults, bks] = await Promise.all([
        getCultures(),
        getInventoryBooks()
      ]);
      setCultures(cults);
      setBooks(bks);
    } catch (err) {
      console.error('Error cargando culturas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeCultures((updatedCults) => {
      setCultures(updatedCults);
    });
    return () => unsub();
  }, []);

  // Notificación efímera
  const showFeedback = (text, type = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Abrir modal para crear
  const handleOpenCreate = () => {
    setEditingCulture(null);
    setFormData({
      nombre: '',
      variante: '',
      region: '',
      lengua: '',
      descripcion: '',
      tradiciones: '',
      activaVR: true,
      color: '#E5A00D'
    });
    setIsModalOpen(true);
  };

  // Abrir modal para editar
  const handleOpenEdit = (culture) => {
    setEditingCulture(culture);
    setFormData({
      nombre: culture.nombre || '',
      variante: culture.variante || '',
      region: culture.region || '',
      lengua: culture.lengua || '',
      descripcion: culture.descripcion || '',
      tradiciones: culture.tradiciones || '',
      activaVR: Boolean(culture.activaVR),
      color: culture.color || '#E5A00D'
    });
    setIsModalOpen(true);
  };

  // Guardar (Crear o Editar)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) return;

    try {
      if (editingCulture) {
        await updateCulture(editingCulture.id, formData);
        showFeedback(`Cultura "${formData.nombre}" actualizada con éxito.`);
      } else {
        await addCulture(formData);
        showFeedback(`Cultura "${formData.nombre}" incorporada exitosamente al catálogo.`);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      showFeedback('Error al procesar la cultura: ' + err.message, 'error');
    }
  };

  // Confirmar y eliminar
  const handleConfirmDelete = async () => {
    if (!deletingCulture) return;
    try {
      await deleteCulture(deletingCulture.id);
      showFeedback(`Cultura "${deletingCulture.nombre}" eliminada del sistema.`, 'info');
      setDeletingCulture(null);
      loadData();
    } catch (err) {
      showFeedback('Error al eliminar la cultura: ' + err.message, 'error');
    }
  };

  // Conteo de libros por cultura
  const getBookCount = (culture) => {
    return books.filter(
      (b) =>
        b.cultura_id === culture.id ||
        b.cultura?.toLowerCase() === culture.nombre?.toLowerCase() ||
        (culture.variante && b.cultura?.toLowerCase().includes(culture.variante.toLowerCase()))
    ).length;
  };

  // Filtrado reactivo
  const filteredCultures = cultures.filter((c) => {
    const matchesSearch =
      c.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      c.variante?.toLowerCase().includes(search.toLowerCase()) ||
      c.region?.toLowerCase().includes(search.toLowerCase()) ||
      c.lengua?.toLowerCase().includes(search.toLowerCase()) ||
      c.descripcion?.toLowerCase().includes(search.toLowerCase()) ||
      c.tradiciones?.toLowerCase().includes(search.toLowerCase());

    const matchesVR =
      filterVR === 'all'
        ? true
        : filterVR === 'vr'
        ? c.activaVR
        : !c.activaVR;

    return matchesSearch && matchesVR;
  });

  const vrCount = cultures.filter((c) => c.activaVR).length;

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Notificación flotante de feedback */}
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
            <AlertTriangle size={20} className="text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          )}
          <span className="text-sm font-semibold">{feedbackMsg.text}</span>
        </div>
      )}

      {/* Cabecera descriptiva y botón principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-bold bg-[#E5A00D]/15 text-[#b45309] rounded-md uppercase tracking-wider">
              Patrimonio Cultural
            </span>
            <span className="text-xs text-slate-400 font-medium">Nayarit, México</span>
          </div>
          <h2 className="text-xl font-black text-[#0B1A30]">
            Culturas Vivas de Nayarit
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Administra la información antropológica, variantes lingüísticas, tradiciones ceremoniales y vinculación
            con la experiencia inmersiva WebXR del Museo Virtual Wixárika y la Biblioteca Solón Argüello.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-[#E5A00D] text-[#0B1A30] hover:bg-amber-400 shadow-md shadow-amber-500/20 transition-all cursor-pointer shrink-0"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Nueva Cultura Viva</span>
        </button>
      </div>

      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs border-l-4 border-l-[#E5A00D]">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Culturas Registradas</span>
          <span className="text-2xl font-black text-[#0B1A30]">{cultures.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs border-l-4 border-l-emerald-500">
          <span className="text-xs font-semibold text-slate-500 block mb-1">En Recorrido VR</span>
          <span className="text-2xl font-black text-emerald-700">{vrCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs border-l-4 border-l-[#4A0E0E]">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Solo en Acervo 2D</span>
          <span className="text-2xl font-black text-[#4A0E0E]">{cultures.length - vrCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs border-l-4 border-l-[#0B1A30]">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Libros Vinculados</span>
          <span className="text-2xl font-black text-[#0B1A30]">{books.length}</span>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cultura, lengua, región o tradición..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#E5A00D] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500">Estado VR:</span>
          <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setFilterVR('all')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                filterVR === 'all'
                  ? 'bg-white text-[#0B1A30] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Todas ({cultures.length})
            </button>
            <button
              onClick={() => setFilterVR('vr')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                filterVR === 'vr'
                  ? 'bg-[#E5A00D] text-[#0B1A30] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              En VR ({vrCount})
            </button>
            <button
              onClick={() => setFilterVR('archive')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                filterVR === 'archive'
                  ? 'bg-[#0B1A30] text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Acervo
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Tarjetas de Culturas Vivas */}
      {loading ? (
        <div className="p-12 text-center text-sm font-semibold text-slate-400 bg-white rounded-2xl border border-slate-200">
          Cargando acervo de Culturas Vivas...
        </div>
      ) : filteredCultures.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Info size={32} className="mx-auto text-slate-300 mb-2" />
          <h4 className="text-base font-bold text-slate-700">No se encontraron culturas vivas</h4>
          <p className="text-xs text-slate-400 mt-1">
            Intenta con otro término de búsqueda o agrega una nueva cultura con el botón superior.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredCultures.map((cult) => {
            const count = getBookCount(cult);
            return (
              <div
                key={cult.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Cabecera de la Tarjeta */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-[#0B1A30] tracking-tight">
                          {cult.nombre}
                        </h3>
                        {cult.variante && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                            {cult.variante}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <MapPin size={13} className="text-[#b45309] shrink-0" />
                        <span>{cult.region || 'Región no especificada'}</span>
                      </div>
                    </div>

                    {cult.activaVR ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-[#E5A00D]/20 text-[#92400e] border border-[#E5A00D]/40">
                        <Sparkles size={12} className="text-[#d97706]" />
                        <span>En Sala VR</span>
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                        Solo Acervo
                      </span>
                    )}
                  </div>

                  {/* Lengua Indígena */}
                  {cult.lengua && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-3 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                      <Languages size={13} className="text-indigo-600 shrink-0" />
                      <span><strong>Lengua:</strong> {cult.lengua}</span>
                    </div>
                  )}

                  {/* Descripción / Cosmovisión */}
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-3">
                    {cult.descripcion || 'Sin descripción registrada.'}
                  </p>

                  {/* Elementos Sagrados / Tradiciones */}
                  {cult.tradiciones && (
                    <div className="text-xs text-slate-500 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100/80 mb-3">
                      <strong className="text-[#b45309] block mb-0.5">Tradiciones & Elementos Sagrados:</strong>
                      <span className="line-clamp-2">{cult.tradiciones}</span>
                    </div>
                  )}
                </div>

                {/* Footer de la Tarjeta con Libros vinculados y Acciones */}
                <div className="px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <BookOpen size={14} className="text-[#0B1A30]" />
                    <span><strong>{count}</strong> {count === 1 ? 'libro en inventario' : 'libros en inventario'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(cult)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-[#0B1A30] bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
                      title="Editar información de la cultura"
                    >
                      <Edit2 size={13} />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => setDeletingCulture(cult)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                      title="Quitar cultura del sistema"
                    >
                      <Trash2 size={13} />
                      <span>Quitar</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: AGREGAR O EDITAR CULTURA VIVA                     */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scaleIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Landmark size={20} className="text-[#E5A00D]" />
                <h3 className="text-base font-extrabold text-[#0B1A30]">
                  {editingCulture ? 'Cambiar Información de la Cultura' : 'Agregar Nueva Cultura Viva'}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nombre Autodefinido *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Wixárika, Náayeri"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#E5A00D]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nombre Común / Variante
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Huichol, Cora"
                    value={formData.variante}
                    onChange={(e) => setFormData({ ...formData, variante: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#E5A00D]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Región / Municipios de Nayarit *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Sierra de El Nayar, La Yesca, Huajicori"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#E5A00D]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Lengua Indígena y Familia
                </label>
                <input
                  type="text"
                  placeholder="Ej. Wixárika (Familia Yuto-nahua)"
                  value={formData.lengua}
                  onChange={(e) => setFormData({ ...formData, lengua: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#E5A00D]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Cosmovisión e Historia *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe la cosmovisión sagrada, origen y relación con el patrimonio cultural..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#E5A00D] leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tradiciones y Elementos Sagrados
                </label>
                <input
                  type="text"
                  placeholder="Ej. Tatewari, Hikuri, Mitote, Judea Cora..."
                  value={formData.tradiciones}
                  onChange={(e) => setFormData({ ...formData, tradiciones: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#E5A00D]"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.activaVR}
                    onChange={(e) => setFormData({ ...formData, activaVR: e.target.checked })}
                    className="w-4 h-4 rounded text-[#E5A00D] focus:ring-[#E5A00D]"
                  />
                  <span>Recomendar en la Experiencia Inmersiva VR</span>
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
                  {editingCulture ? 'Guardar Cambios' : 'Registrar Cultura'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CONFIRMAR ELIMINACIÓN DE CULTURA                  */}
      {/* ======================================================== */}
      {deletingCulture && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-scaleIn text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 text-rose-600 mb-3">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1">
              ¿Quitar cultura "{deletingCulture.nombre}"?
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Esta acción eliminará el registro cultural del sistema.
              {getBookCount(deletingCulture) > 0 && (
                <span className="block mt-2 p-2 rounded-lg bg-amber-50 text-amber-800 font-bold border border-amber-200">
                  ⚠️ Atención: Existen {getBookCount(deletingCulture)} libros en el inventario vinculados a esta cultura.
                </span>
              )}
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingCulture(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-all cursor-pointer"
              >
                Sí, Quitar Cultura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CulturesManagementView;
