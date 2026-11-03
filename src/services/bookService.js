/**
 * Servicio para consultar el catálogo de libros desde Supabase
 * con fallback offline transparente al catálogo local.
 */

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || 'https://gtmvzklnghfibyuiginq.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_1qeZBIZO5O5gYR4nD6Cnxw_06kae08F';

/**
 * Transforma un registro de Supabase (public.libros + joins opcionales)
 * al modelo de datos que renderiza WixarikaVRBookPanel.
 */
export function mapSupabaseBookToVR(row, index = 0) {
  const variants = ['solar', 'hikuri', 'water', 'kauyumari', 'obsidian'];
  const variant = variants[index % variants.length];

  return {
    id: row.id || `book-${index + 1}`,
    title: row.titulo || 'Sin título',
    author: row.autor || 'Autor desconocido',
    category: row.secciones?.nombre || (row.culturas?.nombre ? `Cultura ${row.culturas.nombre}` : 'Cosmovisión y Sabiduría'),
    badge: row.secciones?.codigo || (row.disponible ? 'DISPONIBLE EN SALA' : 'EN PRÉSTAMO'),
    callNumber: row.isbn || `CUA-${row.anio_publicacion || '2024'}`,
    available: row.disponible !== false && (row.stock === null || row.stock > 0),
    year: row.anio_publicacion ? String(row.anio_publicacion) : '2024',
    variant: variant,
    portadaUrl: row.portada_url || null,
    archivoDigitalUrl: row.archivo_digital_url || null,
    synopsis: row.editorial 
      ? `${row.titulo}. Publicado por ${row.editorial}${row.anio_publicacion ? ` (${row.anio_publicacion})` : ''}. Acervo cultural en resguardo.`
      : `${row.titulo}. Ejemplar catalogado en el fondo patrimonial de la biblioteca.`
  };
}

/**
 * Consulta la lista de libros desde Supabase mediante REST API (compatible sin librerías pesadas).
 * Si la red o la BD falla, retorna null para que el panel use el catálogo local por defecto.
 */
export async function fetchRecommendedBooks(signal) {
  try {
    const endpoint = `${SUPABASE_URL}/rest/v1/libros?select=*,culturas(nombre),secciones(nombre,codigo)&order=anio_publicacion.desc.nullslast`;
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      signal
    });

    if (!response.ok) {
      console.warn(`[Supabase Books] Status HTTP ${response.status}`);
      return null;
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    return data.map((row, idx) => mapSupabaseBookToVR(row, idx));
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.warn('[Supabase Books] Error consultando libros:', error.message);
    }
    return null;
  }
}
