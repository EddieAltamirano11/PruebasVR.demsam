/**
 * Servicio de Inventario Bibliográfico de Culturas Vivas de Nayarit
 *
 * Administra exclusivamente los libros correspondientes a las culturas vivas
 * (Wixárika, Náayeri / Cora, O'dam / Tepehuano, Mexicanero) que se recomiendan
 * o existen en la base de datos de la Biblioteca Pública Solón Argüello.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { getCultures, DEFAULT_CULTURAS } from './culturalService';

export const DEFAULT_INVENTORY_BOOKS = [
  {
    id: 'lib-wix-relatos-huicholes',
    titulo: 'Relatos Huicholes',
    autor: 'Lucila Mondragón, Jacqueline Tello y Argelia Valdez (Compiladoras)',
    cultura_id: 'e841c27e-1cd8-47ad-8794-eb5ca0f7d943',
    cultura: 'Wixárika',
    isbn: '968-29-8518-8',
    codigo: '968-29-8518-8',
    stock: 4,
    disponible: true,
    recomendado: true,
    anio: 1996,
    editorial: 'Consejo Nacional para la Cultura y las Artes (CONACULTA)',
    seccion: 'Sala de Culturas Vivas & VR (SEC-VR-01)',
    sinopsis: 'Recopilación bilingüe (wixárika - español) de la tradición oral y riqueza mítica del pueblo wixárika: el origen del sol y la luna, el fuego sagrado de Tatewari, el diluvio y la creación cósmica.',
    portada_url: '/portadas/portada_relatos_huicholes.jpg'
  },
  {
    id: 'lib-wix-cultura-desafios',
    titulo: 'La cultura wixárika ante los desafíos del mundo actual',
    autor: 'Sarah Corona Berkin & Rozenn Le Mûr (Coordinadoras)',
    cultura_id: 'e841c27e-1cd8-47ad-8794-eb5ca0f7d943',
    cultura: 'Wixárika',
    isbn: '978-607-8423-62-0',
    codigo: '978-607-8423-62-0',
    stock: 3,
    disponible: true,
    recomendado: true,
    anio: 2015,
    editorial: 'Consejo Nacional para la Cultura y las Artes (CONACULTA)',
    seccion: 'Sala de Culturas Vivas & VR (SEC-VR-01)',
    sinopsis: 'Análisis antropológico sobre la identidad, comunicación intercultural y negociación de la comunidad wixárika ante la modernidad, la educación y los retos contemporáneos.',
    portada_url: '/portadas/portada_cultura_wixarika_desafios.jpg'
  }
];

const LEGACY_SEED_IDS = new Set([
  'lib-wix-01',
  'lib-cora-01',
  'lib-wix-02',
  'lib-tep-01',
  'lib-wix-03',
  'lib-mex-01',
  'lib-wix-04',
  'lib-cora-02',
  'lib-tep-02',
  '31941e66-2db5-451c-9cea-fa7abd84106c',
  '386514d5-051c-43a9-835c-447b1b81c96c',
  'd4f07e59-af42-4ed2-adb1-231188211b5f',
  'e3b6991f-a5aa-4dbb-81c0-1327f044e5d8',
  '026642bd-81a1-4fed-910f-ea9d925d8cec',
  '67938f42-d141-42f2-ac22-5cdc7f2b50c5',
  '7c2ce220-cf79-4c4f-9bbf-0177a45cf904',
  '86827ab4-a775-412c-8ca3-38b2598ce74a',
  'd8f3ab75-b6d5-46a3-b6c4-f87b2c91f07d',
  'c3364e0d-7245-4201-959d-740d9b0ef52d'
]);

export function isLegacySeed(b) {
  if (!b) return true;
  if (b.id && LEGACY_SEED_IDS.has(b.id)) return true;
  return false;
}

const STORAGE_KEY = 'bibliovr_libros_inventario';
const listeners = new Set();

function notifyListeners(books) {
  listeners.forEach((listener) => {
    try {
      listener(books);
    } catch (err) {
      console.warn('[inventoryService] Error en listener:', err);
    }
  });
}

export function clearInventoryBooks() {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  notifyListeners([]);
}

function loadLocalBooks() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filtered = parsed.filter((b) => !isLegacySeed(b));
          if (filtered.length > 0) return filtered;
        }
      }
    }
  } catch (err) {
    console.warn('[inventoryService] Error leyendo localStorage:', err);
  }
  return [...DEFAULT_INVENTORY_BOOKS];
}

function saveLocalBooks(books) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    }
  } catch (err) {
    console.warn('[inventoryService] Error guardando localStorage:', err);
  }
  notifyListeners(books);
}

/**
 * Consulta los libros del inventario filtrando EXCLUSIVAMENTE
 * aquellos pertenecientes a las culturas vivas recomendadas o existentes en la BD.
 */
export async function getInventoryBooks() {
  const cultures = await getCultures();
  const validCultureIds = new Set(cultures.map((c) => c.id));
  const validCultureNames = new Set(
    cultures.flatMap((c) => [
      c.nombre?.toLowerCase(),
      c.variante?.toLowerCase()
    ]).filter(Boolean)
  );

  let rawBooks = [];

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('libros')
        .select('*, culturas(id, nombre), secciones(id, nombre, codigo)')
        .order('id', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        rawBooks = data
          .filter((b) => !isLegacySeed(b))
          .map((b) => ({
            id: b.id,
            titulo: b.titulo || 'Sin título',
            autor: b.autor || 'Autor no especificado',
            cultura_id: b.culturas?.id || b.cultura_id || null,
            cultura: b.culturas?.nombre || b.cultura || 'Wixárika (Huichol)',
            isbn: b.isbn || b.codigo || '',
            codigo: b.secciones?.codigo || b.codigo || b.isbn || 'SEC-VR-01',
            stock: typeof b.stock === 'number' ? b.stock : 1,
            disponible: b.disponible !== false && (b.stock === null || b.stock > 0),
            recomendado: b.recomendado !== undefined ? Boolean(b.recomendado) : true,
            anio: b.anio_publicacion || b.anio || 2024,
            editorial: b.editorial || 'Fondo Cultural de Nayarit',
            seccion: b.secciones?.nombre || b.seccion || 'Sala de Culturas Vivas & VR',
            seccion_id: b.seccion_id || null,
            sinopsis: b.sinopsis || b.descripcion || `${b.titulo || 'Libro'}. Acervo bibliográfico en resguardo.`,
            portada_url: b.portada_url || null,
            archivo_digital_url: b.archivo_digital_url || null
          }));
      }
    } catch (err) {
      console.info('[inventoryService] Usando catálogo local de Culturas Vivas:', err?.message);
    }
  }

  if (rawBooks.length === 0) {
    rawBooks = loadLocalBooks();
  }

  // Filtrar: libros de culturas vivas recomendadas o registrados en la base de datos (excluyendo semillas dummy anteriores)
  const filtered = rawBooks
    .filter((b) => !isLegacySeed(b))
    .filter((book) => {
      if (isSupabaseConfigured && book.id) return true;
      if (book.cultura_id && validCultureIds.has(book.cultura_id)) return true;
      if (book.cultura) {
        const lower = book.cultura.toLowerCase();
        for (const validName of validCultureNames) {
          if (lower.includes(validName) || validName.includes(lower)) return true;
        }
      }
      return false;
    });

  saveLocalBooks(filtered);
  return filtered;
}

/**
 * Agrega un nuevo libro al inventario, validando que pertenezca a una Cultura Viva
 */
export async function addBookToInventory(bookData) {
  const cultures = await getCultures();
  const matchedCulture = cultures.find(
    (c) => c.id === bookData.cultura_id || c.nombre?.toLowerCase() === bookData.cultura?.toLowerCase()
  ) || cultures[0] || DEFAULT_CULTURAS[0];

  const stockNumber = Math.max(0, parseInt(bookData.stock, 10) || 0);

  const newBook = {
    id: bookData.id || `lib-${Date.now()}`,
    titulo: bookData.titulo?.trim() || 'Sin título',
    autor: bookData.autor?.trim() || 'Autor no especificado',
    cultura_id: matchedCulture.id,
    cultura: matchedCulture.nombre,
    isbn: bookData.isbn?.trim() || `ISBN-VR-${Date.now().toString().slice(-4)}`,
    codigo: bookData.codigo?.trim() || bookData.isbn?.trim() || 'SEC-VR-01',
    stock: stockNumber,
    disponible: stockNumber > 0 && bookData.disponible !== false,
    recomendado: Boolean(bookData.recomendado),
    anio: parseInt(bookData.anio, 10) || new Date().getFullYear(),
    editorial: bookData.editorial?.trim() || 'Fondo Editorial Indígena de Nayarit',
    seccion: bookData.seccion?.trim() || 'Sala de Culturas Vivas & VR (SEC-VR-01)',
    sinopsis: bookData.sinopsis?.trim() || ''
  };

  if (isSupabaseConfigured) {
    try {
      const payload = {
        id: newBook.id,
        titulo: newBook.titulo,
        autor: newBook.autor,
        cultura_id: newBook.cultura_id,
        isbn: newBook.isbn,
        stock: newBook.stock,
        disponible: newBook.disponible,
        anio_publicacion: newBook.anio,
        editorial: newBook.editorial
      };
      if (newBook.portada_url) payload.portada_url = newBook.portada_url;
      if (newBook.archivo_digital_url) payload.archivo_digital_url = newBook.archivo_digital_url;

      await supabase.from('libros').insert(payload);
    } catch (err) {
      console.info('[inventoryService] Inserción en Supabase diferida a local:', err?.message);
    }
  }

  const current = loadLocalBooks();
  const updated = [newBook, ...current];
  saveLocalBooks(updated);
  return newBook;
}

/**
 * Actualiza la información o inventario de un libro
 */
export async function updateBookInInventory(id, updatedFields) {
  const current = loadLocalBooks();
  const existing = current.find((b) => b.id === id);
  if (!existing) return null;

  const stockNumber = updatedFields.stock !== undefined
    ? Math.max(0, parseInt(updatedFields.stock, 10) || 0)
    : existing.stock;

  const updatedBook = {
    ...existing,
    ...updatedFields,
    stock: stockNumber,
    disponible: stockNumber > 0 && (updatedFields.disponible ?? existing.disponible)
  };

  if (isSupabaseConfigured) {
    try {
      const payload = {
        titulo: updatedBook.titulo,
        autor: updatedBook.autor,
        cultura_id: updatedBook.cultura_id,
        isbn: updatedBook.isbn,
        stock: updatedBook.stock,
        disponible: updatedBook.disponible,
        anio_publicacion: updatedBook.anio,
        editorial: updatedBook.editorial
      };
      await supabase.from('libros').update(payload).eq('id', id);
    } catch (err) {
      console.info('[inventoryService] Actualización en Supabase diferida a local:', err?.message);
    }
  }

  const updatedList = current.map((b) => (b.id === id ? updatedBook : b));
  saveLocalBooks(updatedList);
  return updatedBook;
}

/**
 * Quita / Elimina un libro del inventario
 */
export async function removeBookFromInventory(id) {
  if (isSupabaseConfigured) {
    try {
      await supabase.from('libros').delete().eq('id', id);
    } catch (err) {
      console.info('[inventoryService] Eliminación en Supabase diferida a local:', err?.message);
    }
  }

  const current = loadLocalBooks();
  const updatedList = current.filter((b) => b.id !== id);
  saveLocalBooks(updatedList);
  return true;
}

/**
 * Ajusta rápidamente el stock (ejemplares en inventario) sumando o restando unidades
 */
export async function adjustStock(id, delta) {
  const current = loadLocalBooks();
  const book = current.find((b) => b.id === id);
  if (!book) return null;

  const newStock = Math.max(0, (book.stock || 0) + delta);
  return updateBookInInventory(id, {
    stock: newStock,
    disponible: newStock > 0
  });
}

/**
 * Conmuta el estado de recomendación en la sala VR
 */
export async function toggleRecommendation(id) {
  const current = loadLocalBooks();
  const book = current.find((b) => b.id === id);
  if (!book) return null;

  return updateBookInInventory(id, {
    recomendado: !book.recomendado
  });
}

/**
 * Suscripción reactiva para componentes que listen cambios en el inventario
 */
export function subscribeInventory(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
