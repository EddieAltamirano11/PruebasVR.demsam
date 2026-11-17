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
    id: 'lib-wix-01',
    titulo: "El Fuego Sagrado y los Cantos del Mara'akame",
    autor: "Ramón Medina Silva & Rocío Echevarría",
    cultura_id: 'cultura-wixarika',
    cultura: 'Wixárika',
    isbn: '978-607-00-1122-1',
    codigo: '299.72 ECH-2022',
    stock: 5,
    disponible: true,
    recomendado: true,
    anio: 2022,
    editorial: 'Fondo Editorial Indígena de Nayarit',
    seccion: 'Sala de Culturas Vivas & VR (SEC-VR-01)',
    sinopsis: 'Estudio antropológico testimonial y cantos ceremoniales dedicados a Tatewari (El Abuelo Fuego) y la ruta sagrada hacia Wirikuta.'
  },
  {
    id: 'lib-cora-01',
    titulo: "La Judea y el Mitote: Tradiciones Sagradas Náayeri (Cora)",
    autor: "Dr. Benjamín Maldonado",
    cultura_id: 'cultura-cora',
    cultura: 'Náayeri',
    isbn: '978-607-16-4455-2',
    codigo: '394.2 MAL-2021',
    stock: 4,
    disponible: true,
    recomendado: true,
    anio: 2021,
    editorial: 'Ediciones INAH / Universidad Autónoma de Nayarit',
    seccion: 'Acervo de Patrimonio (SEC-PAT-02)',
    sinopsis: 'Registro etnográfico de la Semana Santa en la Mesa del Nayar, la cosmología de los guerreros borrados y el ciclo del mitote.'
  },
  {
    id: 'lib-wix-02',
    titulo: "Sabores del Nayar: Etnobotánica y Cocina Tradicional",
    autor: "Mtra. Candelaria Valdés & Dra. Luisa Gómez Tagle",
    cultura_id: 'cultura-wixarika',
    cultura: 'Wixárika',
    isbn: '978-607-99-8877-0',
    codigo: '641.59 VAL-2021',
    stock: 3,
    disponible: true,
    recomendado: true,
    anio: 2021,
    editorial: 'Ediciones Culturales de Nayarit',
    seccion: 'Sala de Culturas Vivas & VR (SEC-VR-01)',
    sinopsis: 'Recetario patrimonial que documenta los tamales de maíz morado, atoles ceremoniales y el tradicional perruri de maíz tostado.'
  },
  {
    id: 'lib-tep-01',
    titulo: "Cantos del Xuravet: Tradición Oral y Ritos O'dam (Tepehuano del Sur)",
    autor: "Gabriel de la Cruz & Consejo de Ancianos de Huajicori",
    cultura_id: 'cultura-tepehuano',
    cultura: "O'dam",
    isbn: '978-607-45-5621-8',
    codigo: '497.45 CRU-2020',
    stock: 3,
    disponible: true,
    recomendado: true,
    anio: 2020,
    editorial: 'Secretaría de Cultura de Nayarit',
    seccion: 'Colección Lingüística Indígena (SEC-LIN-03)',
    sinopsis: 'Recopilación bilingüe de cantos al lucero del alba (Xuravet) y plegarias durante el mitote del pino en la sierra.'
  },
  {
    id: 'lib-wix-03',
    titulo: "El Venado Azul y la Geografía Mística de Wirikuta",
    autor: "Kauyumari Hernández & Cronistas de Nayarit",
    cultura_id: 'cultura-wixarika',
    cultura: 'Wixárika',
    isbn: '978-968-16-0331-5',
    codigo: '972.33 HER-2024',
    stock: 6,
    disponible: true,
    recomendado: true,
    anio: 2024,
    editorial: 'Fondo de Cultura Indígena',
    seccion: 'Sala de Historia Regional (SEC-HIS-04)',
    sinopsis: 'Cartografía ritual y mitológica de los puntos sagrados desde Haramara en San Blas hasta el desierto de Wirikuta.'
  },
  {
    id: 'lib-mex-01',
    titulo: "Voces de la Cuenca del San Pedro: Memoria y Relatos Mexicaneros",
    autor: "Mtro. Fernando Nava López",
    cultura_id: 'cultura-mexicanero',
    cultura: 'Meshikan / Mexicanero',
    isbn: '978-607-02-8812-4',
    codigo: '972.33 NAV-2023',
    stock: 2,
    disponible: true,
    recomendado: true,
    anio: 2023,
    editorial: 'Instituto de Investigaciones Antropológicas UNAM / CECAN',
    seccion: 'Acervo Etnológico (SEC-ETN-05)',
    sinopsis: 'Estudio de la lengua y cosmovisión náhuatl en las estribaciones serranas del río San Pedro en Nayarit.'
  },
  {
    id: 'lib-wix-04',
    titulo: "Chaquira y Estambre: El Lenguaje Simbólico del Arte Wixárika",
    autor: "Artesanos Unidos de Santa Catarina Cuexcomatitlán",
    cultura_id: 'cultura-wixarika',
    cultura: 'Wixárika',
    isbn: '978-607-74-5511-2',
    codigo: '745.5 ART-2023',
    stock: 4,
    disponible: true,
    recomendado: true,
    anio: 2023,
    editorial: 'Museo de los Cuatro Pueblos / CECAN',
    seccion: 'Sala de Arte y Oficios (SEC-ART-06)',
    sinopsis: 'Interpretación de la simbología sagrada plasmada en tablas de estambre (nierika) y jícaras ceremoniales (rukuri).'
  },
  {
    id: 'lib-cora-02',
    titulo: "Vocabulario Práctico Náayeri-Español de la Mesa del Nayar",
    autor: "Margarita Carrillo & Lingüistas Nativos del Nayar",
    cultura_id: 'cultura-cora',
    cultura: 'Náayeri',
    isbn: '978-607-16-7890-3',
    codigo: '497.4 COR-2022',
    stock: 5,
    disponible: true,
    recomendado: false,
    anio: 2022,
    editorial: 'Instituto Nacional de Lenguas Indígenas (INALI)',
    seccion: 'Lingüística y Gramática (SEC-LIN-03)',
    sinopsis: 'Glosario descriptivo y guía fonética para la preservación de la lengua cora en comunidades de Nayarit.'
  },
  {
    id: 'lib-tep-02',
    titulo: "Etnobotánica Medicinal de la Sierra O'dam de Huajicori",
    autor: "Biól. Samuel Orozco & Médicos Tradicionales Tepehuanos",
    cultura_id: 'cultura-tepehuano',
    cultura: "O'dam",
    isbn: '978-607-45-7801-2',
    codigo: '581.63 ORO-2021',
    stock: 2,
    disponible: true,
    recomendado: false,
    anio: 2021,
    editorial: 'Universidad Autónoma de Nayarit',
    seccion: 'Herbolaria y Ciencias Tradicionales (SEC-HER-07)',
    sinopsis: 'Catálogo de plantas medicinales, cortezas sagradas y métodos de curación de los médicos tradicionales de la sierra.'
  }
];

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

function loadLocalBooks() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
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
        .select('*, culturas(id, nombre, variante), secciones(nombre, codigo)')
        .order('id', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        rawBooks = data.map((b) => ({
          id: b.id,
          titulo: b.titulo || 'Sin título',
          autor: b.autor || 'Autor no especificado',
          cultura_id: b.culturas?.id || b.cultura_id || null,
          cultura: b.culturas?.nombre || b.cultura || 'Cultura Viva',
          isbn: b.isbn || b.codigo || '',
          codigo: b.codigo || b.isbn || '',
          stock: typeof b.stock === 'number' ? b.stock : 1,
          disponible: b.disponible !== false && (b.stock === null || b.stock > 0),
          recomendado: Boolean(b.recomendado),
          anio: b.anio_publicacion || b.anio || 2024,
          editorial: b.editorial || 'Fondo Cultural de Nayarit',
          seccion: b.secciones?.nombre || b.seccion || 'Sala de Culturas Vivas & VR',
          sinopsis: b.sinopsis || b.descripcion || ''
        }));
      }
    } catch (err) {
      console.info('[inventoryService] Usando catálogo local de Culturas Vivas:', err?.message);
    }
  }

  if (rawBooks.length === 0) {
    rawBooks = loadLocalBooks();
  }

  // Filtrar estrictamente: SOLO libros de culturas vivas que existen en el catálogo
  const filtered = rawBooks.filter((book) => {
    if (book.cultura_id && validCultureIds.has(book.cultura_id)) return true;
    if (book.cultura && validCultureNames.has(book.cultura.toLowerCase())) return true;
    // Si no tiene cultura explícita o era de literatura genérica previa, se descarta
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
      await supabase.from('libros').insert({
        id: newBook.id,
        titulo: newBook.titulo,
        autor: newBook.autor,
        cultura_id: newBook.cultura_id,
        isbn: newBook.isbn,
        stock: newBook.stock,
        disponible: newBook.disponible,
        recomendado: newBook.recomendado,
        anio_publicacion: newBook.anio,
        editorial: newBook.editorial,
        sinopsis: newBook.sinopsis
      });
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
      await supabase
        .from('libros')
        .update({
          titulo: updatedBook.titulo,
          autor: updatedBook.autor,
          cultura_id: updatedBook.cultura_id,
          isbn: updatedBook.isbn,
          stock: updatedBook.stock,
          disponible: updatedBook.disponible,
          recomendado: updatedBook.recomendado,
          anio_publicacion: updatedBook.anio,
          editorial: updatedBook.editorial,
          sinopsis: updatedBook.sinopsis
        })
        .eq('id', id);
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
