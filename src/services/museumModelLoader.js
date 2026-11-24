import { useSyncExternalStore } from 'react';

/**
 * Descarga del modelo 3D del museo con avance real (bytes).
 * El GLB pesa ~16 MB: con conexión lenta tarda varios segundos y, sin aviso, la escena se veía
 * en negro. Aquí se descarga una sola vez con fetch (midiendo el avance), se convierte en un
 * blob local y three.js lo lee de ahí. Si algo falla, se usa la URL directa como antes.
 */
export const MUSEUM_MODEL_URL = './museo_wixarika_v16.glb?v=16.8';

let state = { loaded: 0, total: 0, done: false, url: null, error: null };
let promise = null;
const listeners = new Set();

const setState = (patch) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

/** Inicia la descarga (idempotente) y devuelve una promesa con la URL lista para useGLTF. */
export function startMuseumModelDownload() {
  if (promise) return promise;
  promise = (async () => {
    try {
      if (typeof fetch !== 'function' || typeof URL?.createObjectURL !== 'function') {
        throw new Error('fetch/Blob no disponibles');
      }
      const res = await fetch(MUSEUM_MODEL_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const total = Number(res.headers.get('content-length')) || 0;
      setState({ total });

      let blob;
      if (res.body && typeof res.body.getReader === 'function') {
        const reader = res.body.getReader();
        const chunks = [];
        let loaded = 0;
        let lastEmit = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          loaded += value.byteLength;
          // Limitar avisos a la interfaz (~10 por segundo)
          const now = Date.now();
          if (now - lastEmit > 100) {
            lastEmit = now;
            setState({ loaded });
          }
        }
        blob = new Blob(chunks, { type: 'model/gltf-binary' });
      } else {
        blob = await res.blob();
      }
      const url = URL.createObjectURL(blob);
      setState({ loaded: blob.size, total: total || blob.size, done: true, url });
      return url;
    } catch (error) {
      // Respaldo: three.js descarga directamente la URL original (sin avance)
      setState({ done: true, url: MUSEUM_MODEL_URL, error });
      return MUSEUM_MODEL_URL;
    }
  })();
  return promise;
}

/**
 * Para usar dentro de un componente bajo <Suspense>: devuelve la URL del modelo cuando ya
 * terminó de descargarse; mientras tanto suspende.
 */
export function useMuseumModelUrl() {
  const snapshot = useMuseumModelProgress();
  if (!snapshot.done) throw startMuseumModelDownload();
  return snapshot.url;
}

const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => state;

/** Avance de la descarga: { loaded, total, done, url, error }. */
export function useMuseumModelProgress() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Solo para pruebas: reinicia el estado. */
export function __resetMuseumModelLoader() {
  state = { loaded: 0, total: 0, done: false, url: null, error: null };
  promise = null;
}
