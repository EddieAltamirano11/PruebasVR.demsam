/**
 * Servicio de Ficha de Salida y Apartado de Libros para Mostrador
 * Sprint 5 - Responsable: Luis Carlos Durán
 *
 * Administra los libros que el visitante aparta durante su recorrido inmersivo 3D / VR
 * para solicitarlos físicamente en el mostrador de atención de la
 * Biblioteca Pública Profesor Solón Argüello (Tepic, Nayarit).
 */

const STORAGE_KEY = 'bibliovr_libros_mostrador';
const FOLIO_KEY = 'bibliovr_folio_visita';

let inMemoryBooks = [];
let inMemoryFolio = null;
const listeners = new Set();

function notifyListeners(books) {
  listeners.forEach((fn) => {
    try {
      fn(books);
    } catch (err) {
      console.warn('[counterCheckoutService] Error en listener:', err);
    }
  });
}

/**
 * Genera o recupera un folio único para la sesión del visitante
 */
export function getFolio() {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      let folio = window.sessionStorage.getItem(FOLIO_KEY);
      if (!folio) {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        folio = `SOLON-VR-${randomNum}`;
        window.sessionStorage.setItem(FOLIO_KEY, folio);
      }
      inMemoryFolio = folio;
      return folio;
    }
  } catch (err) {
    console.warn('[counterCheckoutService] Error con sessionStorage folio:', err);
  }

  if (!inMemoryFolio) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    inMemoryFolio = `SOLON-VR-${randomNum}`;
  }
  return inMemoryFolio;
}

/**
 * Obtiene la lista actual de libros apartados para el mostrador
 */
export function getRequestedBooks() {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          inMemoryBooks = parsed;
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn('[counterCheckoutService] Error leyendo libros apartados:', err);
  }
  return inMemoryBooks;
}

/**
 * Guarda la lista en almacenamiento y notifica a los componentes reactivos
 */
function saveRequestedBooks(books) {
  inMemoryBooks = books;
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    }
  } catch (err) {
    console.warn('[counterCheckoutService] Error guardando libros apartados:', err);
  }
  notifyListeners(books);
}

/**
 * Aparta un libro para pedir en el mostrador (previene duplicados)
 */
export function addRequestedBook(book) {
  if (!book || !book.id) return getRequestedBooks();

  const current = getRequestedBooks();
  const exists = current.some((b) => b.id === book.id);
  if (exists) return current;

  const normalized = {
    id: book.id,
    titulo: book.titulo || book.title || 'Sin título',
    autor: book.autor || book.author || 'Autor no especificado',
    cultura: book.cultura || book.category || 'Cultura Viva de Nayarit',
    isbn: book.isbn || book.codigo || book.callNumber || book.code || 'SEC-VR-01',
    codigo: book.codigo || book.isbn || book.callNumber || book.code || 'SEC-VR-01',
    seccion: book.seccion || book.category || 'Sala de Culturas Vivas & VR (SEC-VR-01)',
    editorial: book.editorial || 'Fondo Editorial Indígena de Nayarit',
    anio: book.anio || book.year || '2024',
    stock: typeof book.stock === 'number' ? book.stock : 1,
    fechaApartado: new Date().toISOString()
  };

  const updated = [...current, normalized];
  saveRequestedBooks(updated);
  return updated;
}

/**
 * Quita un libro de la lista de apartados para mostrador
 */
export function removeRequestedBook(bookId) {
  const current = getRequestedBooks();
  const updated = current.filter((b) => b.id !== bookId);
  saveRequestedBooks(updated);
  return updated;
}

/**
 * Verifica si un libro ya está apartado
 */
export function isBookRequested(bookId) {
  const current = getRequestedBooks();
  return current.some((b) => b.id === bookId);
}

/**
 * Limpia todos los libros apartados y genera un nuevo folio (fin de visita)
 */
export function clearRequestedBooks() {
  inMemoryBooks = [];
  inMemoryFolio = null;
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      window.sessionStorage.removeItem(FOLIO_KEY);
    }
  } catch (err) {
    console.warn('[counterCheckoutService] Error limpiando sesión:', err);
  }
  notifyListeners([]);
}

/**
 * Suscripción reactiva para componentes que listen cambios en los libros del mostrador
 */
export function subscribeRequestedBooks(callback) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}
