/**
 * Servicio de Gestión de Culturas Vivas de Nayarit
 * Permite al administrador consultar, agregar, actualizar y quitar
 * información sobre las culturas vivas que enriquecen el acervo de la biblioteca y el Museo VR.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export const DEFAULT_CULTURAS = [
  {
    id: 'cultura-wixarika',
    nombre: 'Wixárika',
    variante: 'Huichol',
    region: 'Sierra Madre Occidental (El Nayar, La Yesca, Mezquitic)',
    lengua: 'Wixárika (Familia Yuto-nahua)',
    descripcion: 'Pueblo originario con una profunda cosmovisión sagrada centrada en el equilibrio cósmico, la ruta sagrada hacia Wirikuta y la comunicación con los ancestros a través de las deidades sagradas (Tatewari, Tayau, Kauyumari).',
    tradiciones: 'Tatewari (Abuelo Fuego), Hikuri (Peyote Sagrado), Tatei Neixa (Fiesta del Elote), Fiesta del Tambor (Tepu), Arte con Chaquira y Tsikuri',
    activaVR: true,
    color: '#E5A00D'
  },
  {
    id: 'cultura-cora',
    nombre: 'Náayeri',
    variante: 'Cora',
    region: 'Sierra del Nayar (Mesa del Nayar, Jesús María, Santa Teresa)',
    lengua: 'Náayeri (Familia Yuto-nahua)',
    descripcion: 'Comunidad originaria con una fuerte organización comunitaria y ceremonial. Guardianes ancestrales de la sierra, con una cosmovisión ligada a los ciclos agrícolas del maíz, las estrellas y los cerros sagrados.',
    tradiciones: 'La Judea de Semana Santa Cora (Pintados y Borrados), Danza del Mitote, Ceremonia del Maíz Tostado, Santos Guerreros',
    activaVR: true,
    color: '#4A0E0E'
  },
  {
    id: 'cultura-tepehuano',
    nombre: "O'dam",
    variante: 'Tepehuano del Sur',
    region: 'Huajicori y límites montañosos de Nayarit con Durango',
    lengua: "O'dam / Tepehuano del Sur (Familia Yuto-nahua)",
    descripcion: 'Pueblo serrano portador del ciclo ceremonial del Xuravet (el lucero del alba) y los mitotes agrarios dedicados a la lluvia, la siembra y la salud comunitaria.',
    tradiciones: 'El Mitote Sagrado (Xígam), El Lucero del Alba (Xuravet), Arcos florales de pino, Canto del Chanteador',
    activaVR: true,
    color: '#0B1A30'
  },
  {
    id: 'cultura-mexicanero',
    nombre: 'Meshikan / Mexicanero',
    variante: 'Náhuatl de la Sierra',
    region: 'Cuenca del Río San Pedro y estribaciones serranas del norte de Nayarit',
    lengua: 'Náhuatl Mexicanero (Familia Yuto-nahua)',
    descripcion: 'Hablantes de la variante occidental del náhuatl en Nayarit. Conservan ricos relatos sobre el origen del sol, las campanas sagradas de la sierra y la danza tradicional del xuravet.',
    tradiciones: 'Danza del Mitote Nahua, Peregrinaciones a ojos de agua sagrados, Narrativa oral del Sol y la Luna, Tejido tradicional de fajas',
    activaVR: true,
    color: '#059669'
  }
];

const STORAGE_KEY = 'bibliovr_culturas_vivas';
const listeners = new Set();

function notifyListeners(culturas) {
  listeners.forEach((listener) => {
    try {
      listener(culturas);
    } catch (err) {
      console.warn('[culturalService] Error en listener:', err);
    }
  });
}

/**
 * Carga las culturas desde localStorage con fallback a DEFAULT_CULTURAS
 */
function loadLocalCultures() {
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
    console.warn('[culturalService] Error leyendo localStorage:', err);
  }
  return [...DEFAULT_CULTURAS];
}

/**
 * Guarda las culturas en localStorage y notifica a los suscriptores
 */
function saveLocalCultures(culturas) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(culturas));
    }
  } catch (err) {
    console.warn('[culturalService] Error guardando localStorage:', err);
  }
  notifyListeners(culturas);
}

/**
 * Obtiene el listado completo de culturas vivas
 * Intenta sincronizar con Supabase si está disponible; de lo contrario usa almacenamiento local.
 */
export async function getCultures() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('culturas')
        .select('*')
        .order('nombre', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped = data.map((row) => ({
          id: row.id,
          nombre: row.nombre,
          variante: row.variante || row.nombre_comun || '',
          region: row.region || '',
          lengua: row.lengua || '',
          descripcion: row.descripcion || '',
          tradiciones: row.tradiciones || row.elementos_sagrados || '',
          activaVR: row.activa_vr ?? row.recomendada_vr ?? true,
          color: row.color || '#E5A00D'
        }));
        saveLocalCultures(mapped);
        return mapped;
      }
    } catch (err) {
      console.info('[culturalService] Usando almacenamiento local/semilla para culturas:', err?.message);
    }
  }

  const local = loadLocalCultures();
  return local;
}

/**
 * Agrega una nueva cultura viva al catálogo
 */
export async function addCulture(cultureData) {
  const newCulture = {
    id: cultureData.id || `cultura-${Date.now()}`,
    nombre: cultureData.nombre?.trim() || 'Nueva Cultura',
    variante: cultureData.variante?.trim() || '',
    region: cultureData.region?.trim() || 'Nayarit',
    lengua: cultureData.lengua?.trim() || '',
    descripcion: cultureData.descripcion?.trim() || '',
    tradiciones: cultureData.tradiciones?.trim() || '',
    activaVR: Boolean(cultureData.activaVR),
    color: cultureData.color || '#E5A00D'
  };

  if (isSupabaseConfigured) {
    try {
      await supabase.from('culturas').insert({
        id: newCulture.id,
        nombre: newCulture.nombre,
        variante: newCulture.variante,
        region: newCulture.region,
        lengua: newCulture.lengua,
        descripcion: newCulture.descripcion,
        tradiciones: newCulture.tradiciones,
        activa_vr: newCulture.activaVR
      });
    } catch (err) {
      console.info('[culturalService] Registro en Supabase diferido a local:', err?.message);
    }
  }

  const current = loadLocalCultures();
  const updated = [newCulture, ...current];
  saveLocalCultures(updated);
  return newCulture;
}

/**
 * Actualiza la información de una cultura existente
 */
export async function updateCulture(id, updatedFields) {
  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('culturas')
        .update({
          nombre: updatedFields.nombre,
          variante: updatedFields.variante,
          region: updatedFields.region,
          lengua: updatedFields.lengua,
          descripcion: updatedFields.descripcion,
          tradiciones: updatedFields.tradiciones,
          activa_vr: updatedFields.activaVR
        })
        .eq('id', id);
    } catch (err) {
      console.info('[culturalService] Actualización en Supabase diferida a local:', err?.message);
    }
  }

  const current = loadLocalCultures();
  const updated = current.map((item) =>
    item.id === id ? { ...item, ...updatedFields } : item
  );
  saveLocalCultures(updated);
  return updated.find((c) => c.id === id);
}

/**
 * Quita / Elimina una cultura del catálogo
 */
export async function deleteCulture(id) {
  if (isSupabaseConfigured) {
    try {
      await supabase.from('culturas').delete().eq('id', id);
    } catch (err) {
      console.info('[culturalService] Eliminación en Supabase diferida a local:', err?.message);
    }
  }

  const current = loadLocalCultures();
  const updated = current.filter((item) => item.id !== id);
  saveLocalCultures(updated);
  return true;
}

/**
 * Suscripción reactiva a cambios en las culturas vivas
 */
export function subscribeCultures(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
