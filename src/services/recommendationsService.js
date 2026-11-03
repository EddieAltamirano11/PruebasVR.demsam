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
      b.seccion_id === stationId ||
      b.cultura_id === stationId
  );
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
