import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Search, Book, Sparkles } from 'lucide-react';

const INITIAL_BOOKS = [
  { id: 1, titulo: 'Pedro Páramo', autor: 'Juan Rulfo', recomendado: true },
  { id: 2, titulo: 'El laberinto de la soledad', autor: 'Octavio Paz', recomendado: true },
  { id: 3, titulo: 'Aura', autor: 'Carlos Fuentes', recomendado: true },
  { id: 4, titulo: 'Balún Canán', autor: 'Rosario Castellanos', recomendado: true },
  { id: 5, titulo: 'Como agua para chocolate', autor: 'Laura Esquivel', recomendado: true },
  { id: 6, titulo: 'Los de abajo', autor: 'Mariano Azuela', recomendado: true },
  { id: 7, titulo: 'La región más transparente', autor: 'Carlos Fuentes', recomendado: false },
  { id: 8, titulo: 'Hasta no verte Jesús mío', autor: 'Elena Poniatowska', recomendado: false }
];

export function BooksManagementView() {
  const [books, setBooks] = useState(INITIAL_BOOKS);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Intentar sincronizar con la tabla libros de Supabase si existe
    const fetchSupabaseBooks = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('libros')
          .select('id, titulo, autor, recomendado')
          .order('id', { ascending: true });

        if (!error && data && data.length > 0) {
          setBooks(data);
        }
      } catch (err) {
        console.info('Usando catálogo inicial precargado:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSupabaseBooks();
  }, []);

  const filteredBooks = books.filter(
    (b) =>
      b.titulo?.toLowerCase().includes(search.toLowerCase()) ||
      b.autor?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Barra de búsqueda y conteo rápido */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por título o autor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#E5A00D] transition-colors"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Mostrando <strong className="text-[#0B1A30]">{filteredBooks.length}</strong> títulos
        </div>
      </div>

      {/* Contenedor Principal de la Tabla */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/90 bg-white">
                <th className="py-4 px-6 text-sm font-bold text-[#0B1A30]">
                  Título
                </th>
                <th className="py-4 px-6 text-sm font-bold text-[#0B1A30]">
                  Autor
                </th>
                <th className="py-4 px-6 text-sm font-bold text-[#0B1A30] w-36">
                  Recomendado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBooks.map((book) => (
                <tr
                  key={book.id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  <td className="py-4 px-6 text-sm font-medium text-slate-800">
                    {book.titulo}
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600">
                    {book.autor}
                  </td>
                  <td className="py-4 px-6 text-sm">
                    {book.recomendado ? (
                      <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-bold text-white bg-[#0B1A30] rounded-md shadow-xs min-w-[38px]">
                        Sí
                      </span>
                    ) : (
                      <span className="text-slate-400 font-normal pl-2">
                        No
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredBooks.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center py-8 text-slate-400 text-sm">
                    No se encontraron libros que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default BooksManagementView;
