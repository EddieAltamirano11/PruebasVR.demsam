/**
 * Servicio de Recomendaciones Bibliográficas para la Escena 3D
 * Sprint 3 - Responsable: Luis Carlos Durán Ocampo
 *
 * Administra la obtención, filtrado y validación de libros recomendados
 * vinculados a los pabellones y elementos culturales del recorrido virtual.
 */

/**
 * Filtra un conjunto de libros según el identificador de estación/pabellón cultural
 * @param {Array} books Lista de libros
 * @param {string|null} stationId ID de la estación cultural
 * @returns {Array} Libros filtrados
 */
export function filterBooksByStation(books = [], stationId = null) {
  if (!Array.isArray(books)) return [];
  if (!stationId || stationId === 'all') return books;

  return books.filter(
    (b) =>
      b.stationId === stationId ||
      b.themeId === stationId ||
      b.seccion_id === stationId ||
      b.cultura_id === stationId
  );
}

/**
 * Normaliza una cadena para comparaciones insensibles a mayúsculas, espacios y acentos diacríticos.
 * @param {string} str
 * @returns {string}
 */
function normalizeDiacritics(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Filtra libros por cultura específica (ej. 'wixarika', 'cora', 'tepehuano', 'mexicanero')
 * @param {Array} books Lista de libros
 * @param {string|null} cultureId Identificador o nombre de la cultura
 * @returns {Array} Libros de dicha cultura
 */
export function filterBooksByCulture(books = [], cultureId = null) {
  if (!Array.isArray(books)) return [];
  if (!cultureId || cultureId === 'all') return books;

  const target = normalizeDiacritics(cultureId);
  return books.filter((b) => {
    if (!b || typeof b !== 'object') return false;

    const candidateValues = [
      b.cultura_id,
      b.cultureId,
      b.cultura,
      b.culture,
      b.culturas?.nombre,
      b.seccion_id,
      b.themeId
    ];

    return candidateValues.some((val) => {
      if (!val) return false;
      const normalizedVal = normalizeDiacritics(val.toString());
      return normalizedVal === target || normalizedVal.includes(target) || target.includes(normalizedVal);
    });
  });
}

/**
 * Busca libros por término en título, autor o cultura
 * @param {Array} books
 * @param {string} query
 * @returns {Array}
 */
export function searchRecommendedBooks(books = [], query = '') {
  if (!Array.isArray(books)) return [];
  if (!query || typeof query !== 'string') return books;

  const normalized = query.trim().toLowerCase();
  if (!normalized) return books;

  return books.filter(
    (b) =>
      (b.titulo && b.titulo.toLowerCase().includes(normalized)) ||
      (b.autor && b.autor.toLowerCase().includes(normalized)) ||
      (b.cultura && b.cultura.toLowerCase().includes(normalized)) ||
      (b.editorial && b.editorial.toLowerCase().includes(normalized))
  );
}

/**
 * Valida que un objeto libro cumpla la estructura mínima para el panel lateral
 * @param {Object} book
 * @returns {boolean}
 */
export function isValidBookRecommendation(book) {
  if (!book || typeof book !== 'object') return false;
  return Boolean(book.id && (book.titulo || book.title));
}

/**
 * Genera el texto de disponibilidad para la sala de lectura
 * @param {Object} book
 * @returns {string}
 */
export function getAvailabilityLabel(book) {
  if (!book) return 'No disponible';
  const stock = typeof book.stock === 'number' ? book.stock : 0;
  if (stock <= 0) return 'Agotado en sala';
  if (stock === 1) return '1 ejemplar disponible';
  return `${stock} ejemplares disponibles`;
}

/**
 * Formatea un libro para la vista minimalista de VR (solo título, autor y código de libro)
 * @param {Object} book
 * @returns {{ id: string, title: string, author: string, code: string }}
 */
export function formatBookMinimal(book) {
  if (!book || typeof book !== 'object') {
    return { id: 'unknown', title: 'Sin título', author: 'Autor no especificado', code: 'S/C' };
  }
  return {
    id: book.id || 'book-unknown',
    title: book.title || book.titulo || 'Sin título',
    author: book.author || book.autor || 'Autor no especificado',
    code: book.code || book.callNumber || book.codigo || book.isbn || 'SEC-VR-01'
  };
}

