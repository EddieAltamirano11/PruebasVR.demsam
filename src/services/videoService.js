/**
 * Servicio ligero de reproducción de video streaming (720p / 480p)
 * con soporte y verificación de HTTP 206 Partial Content (Byte-Range).
 */

export const VIDEO_QUALITIES = ['720p', '480p'];

export const VIDEO_QUALITY_META = {
  '720p': {
    id: '720p',
    label: '720p HD',
    shortLabel: '720p',
    approxSize: '16.7 MB'
  },
  '480p': {
    id: '480p',
    label: '480p Ligero',
    shortLabel: '480p',
    approxSize: '8.4 MB'
  }
};

export const DEFAULT_VIDEO_SOURCES = {
  '720p': './videos/videoPrueba_720p.mp4',
  '480p': './videos/videoPrueba_480p.mp4'
};

export const DEFAULT_VIDEO_POSTER = './videos/videoPrueba_poster.jpg';

/**
 * Formatea segundos numéricos en cadena legible MM:SS (o H:MM:SS si excede 1 hora).
 * @param {number} seconds
 * @returns {string}
 */
export function formatVideoTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const pad = (val) => String(val).padStart(2, '0');
  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(secs)}`;
  }
  return `${pad(minutes)}:${pad(secs)}`;
}

/**
 * Selecciona la calidad inicial recomendada ('720p' o '480p')
 * según Network Information API (modo ahorro de datos o red móvil lenta).
 * @param {Navigator|null} nav
 * @returns {'720p'|'480p'}
 */
export function getDefaultVideoQuality(nav = typeof navigator !== 'undefined' ? navigator : null) {
  const conn = nav?.connection || nav?.mozConnection || nav?.webkitConnection;
  if (!conn) return '720p';

  if (conn.saveData === true) return '480p';
  if (['slow-2g', '2g', '3g'].includes(conn.effectiveType)) return '480p';
  if (typeof conn.downlink === 'number' && conn.downlink > 0 && conn.downlink < 2.5) {
    return '480p';
  }
  return '720p';
}

/**
 * Resuelve la URL de stream para un video y calidad dados.
 * @param {Object} video
 * @param {'720p'|'480p'} quality
 * @returns {string}
 */
export function resolveVideoSource(video, quality = '720p') {
  const safeQuality = VIDEO_QUALITIES.includes(quality) ? quality : '720p';
  return (
    video?.sources?.[safeQuality] ||
    video?.sources?.['720p'] ||
    video?.sources?.['480p'] ||
    video?.src ||
    DEFAULT_VIDEO_SOURCES[safeQuality]
  );
}

/**
 * Extrae el tamaño total en bytes de una cabecera HTTP Content-Range (ej. "bytes 0-1023/17502331").
 * @param {string|null|undefined} contentRange
 * @returns {number|null}
 */
export function parseContentRangeTotal(contentRange) {
  if (!contentRange || typeof contentRange !== 'string') return null;
  const match = contentRange.match(/bytes\s+\d+-\d+\/(\d+)/i);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/**
 * Formatea un tamaño en bytes a megabytes legibles (ej. "16.7 MB").
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytesMB(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0.0 MB';
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Verifica mediante una petición ligera de 1 KB (Range: bytes=0-1023) si el servidor
 * soporta streaming HTTP 206 Partial Content para reproducción progresiva y seek instantáneo.
 *
 * @param {string} url
 * @param {Object} [options]
 * @param {AbortSignal} [options.signal]
 * @param {Function} [options.fetchImpl]
 * @param {number} [options.rangeEnd=1023]
 * @returns {Promise<{
 *   url: string,
 *   status: number,
 *   supported: boolean,
 *   partialContent: boolean,
 *   acceptRanges: string|null,
 *   contentRange: string|null,
 *   totalBytes: number|null,
 *   sizeLabel: string|null,
 *   aborted?: boolean,
 *   error?: string
 * }>}
 */
export async function probeHttpRangeSupport(
  url,
  { signal, fetchImpl = globalThis.fetch, rangeEnd = 1023 } = {}
) {
  if (!url || typeof fetchImpl !== 'function') {
    return {
      url: url || '',
      status: 0,
      supported: false,
      partialContent: false,
      acceptRanges: null,
      contentRange: null,
      totalBytes: null,
      sizeLabel: null,
      error: 'Fetch API unavailable'
    };
  }

  try {
    const response = await fetchImpl(url, {
      method: 'GET',
      headers: {
        Range: `bytes=0-${rangeEnd}`
      },
      signal
    });

    // Cancelar el resto del stream inmediatamente para no descargar más allá de la sonda
    try {
      await response.body?.cancel?.();
    } catch (_cancelErr) {
      // Ignorar si el cuerpo ya cerró
    }

    const acceptRanges = response.headers?.get?.('accept-ranges') || null;
    const contentRange = response.headers?.get?.('content-range') || null;
    const contentLength = response.headers?.get?.('content-length') || null;

    const partialContent = response.status === 206;
    const supported =
      partialContent || (acceptRanges ? acceptRanges.toLowerCase().includes('bytes') : false);

    const parsedLength = contentLength ? Number(contentLength) : null;
    const totalBytes =
      parseContentRangeTotal(contentRange) ||
      (response.status === 200 && Number.isFinite(parsedLength) && parsedLength > 0
        ? parsedLength
        : null);

    return {
      url,
      status: response.status,
      supported,
      partialContent,
      acceptRanges,
      contentRange,
      totalBytes,
      sizeLabel: totalBytes ? formatBytesMB(totalBytes) : null
    };
  } catch (err) {
    if (err?.name === 'AbortError') {
      return {
        url,
        status: 0,
        supported: false,
        partialContent: false,
        acceptRanges: null,
        contentRange: null,
        totalBytes: null,
        sizeLabel: null,
        aborted: true
      };
    }

    return {
      url,
      status: 0,
      supported: false,
      partialContent: false,
      acceptRanges: null,
      contentRange: null,
      totalBytes: null,
      sizeLabel: null,
      error: err?.message || 'Network error'
    };
  }
}
