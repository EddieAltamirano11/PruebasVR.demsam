/**
 * Utilidades de ISBN tolerantes al formato (Ley de Postel) y autocompletado
 * bibliográfico (Ley de Tesler) para el formulario de inventario.
 *
 * Acepta: "978-607-8423-62-0", "978 607 8423 62 0", "ISBN: 9786078423620",
 * "968-29-8518-8", "0-306-40615-x", etc.
 */

/** Quita prefijo "ISBN", espacios, guiones y puntos; normaliza la X final a mayúscula. */
export const normalizeIsbn = (value) => {
  if (value === null || value === undefined) return '';
  return String(value)
    .trim()
    .replace(/^isbn(-1[03])?:?/i, '')
    .replace(/[\s\-.‐-―]/g, '')
    .toUpperCase();
};

const isValidIsbn10 = (isbn) => {
  if (!/^\d{9}[\dX]$/.test(isbn)) return false;
  const sum = isbn
    .split('')
    .reduce((acc, ch, i) => acc + (ch === 'X' ? 10 : Number(ch)) * (10 - i), 0);
  return sum % 11 === 0;
};

const isValidIsbn13 = (isbn) => {
  if (!/^\d{13}$/.test(isbn)) return false;
  const sum = isbn
    .split('')
    .reduce((acc, ch, i) => acc + Number(ch) * (i % 2 === 0 ? 1 : 3), 0);
  return sum % 10 === 0;
};

/**
 * Valida un ISBN en cualquier formato.
 * @returns {{ valid: boolean, normalized: string, message: string }}
 */
export const validateIsbn = (value) => {
  const normalized = normalizeIsbn(value);
  if (!normalized) {
    return { valid: true, normalized, message: '' }; // Campo opcional
  }
  if (!/^[\dX]+$/.test(normalized)) {
    return {
      valid: false,
      normalized,
      message: 'El ISBN solo puede contener números (y una X final en ISBN-10).'
    };
  }
  if (normalized.length !== 10 && normalized.length !== 13) {
    return {
      valid: false,
      normalized,
      message: `El ISBN debe tener 10 o 13 dígitos (escribiste ${normalized.length}).`
    };
  }
  const ok = normalized.length === 10 ? isValidIsbn10(normalized) : isValidIsbn13(normalized);
  return {
    valid: ok,
    normalized,
    message: ok ? '' : 'El dígito verificador no coincide: revisa que el ISBN esté bien escrito.'
  };
};

/**
 * Busca datos bibliográficos por ISBN en Open Library (API pública, sin llave).
 * Devuelve solo los campos encontrados; null si no hay resultados o falla la red.
 */
export const lookupIsbn = async (value, fetchImpl = globalThis.fetch) => {
  const { valid, normalized } = validateIsbn(value);
  if (!valid || !normalized || typeof fetchImpl !== 'function') return null;

  try {
    const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${normalized}&format=json&jscmd=data`;
    const res = await fetchImpl(url);
    if (!res.ok) return null;
    const json = await res.json();
    const book = json[`ISBN:${normalized}`];
    if (!book) return null;

    const yearMatch = String(book.publish_date || '').match(/\d{4}/);
    return {
      titulo: book.title || '',
      autor: (book.authors || []).map((a) => a.name).filter(Boolean).join(', '),
      editorial: (book.publishers || []).map((p) => p.name).filter(Boolean).join(', '),
      anio: yearMatch ? Number(yearMatch[0]) : null,
      portada: book.cover?.medium || book.cover?.large || ''
    };
  } catch {
    return null;
  }
};

/** Traduce errores técnicos (Supabase / red) a mensajes claros en español. */
export const friendlyErrorMessage = (err) => {
  const raw = `${err?.code || ''} ${err?.message || err || ''}`.toLowerCase();
  if (raw.includes('23505') || raw.includes('duplicate')) {
    return 'Ya existe un libro con ese ISBN o código.';
  }
  if (raw.includes('42501') || raw.includes('permission') || raw.includes('row-level security')) {
    return 'Tu cuenta no tiene permiso para esta acción. Inicia sesión como administrador.';
  }
  if (raw.includes('failed to fetch') || raw.includes('network') || raw.includes('timeout')) {
    return 'No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.';
  }
  if (raw.includes('23502') || raw.includes('null value')) {
    return 'Falta llenar un campo obligatorio.';
  }
  return 'No se pudo completar la operación. Inténtalo de nuevo en unos segundos.';
};
