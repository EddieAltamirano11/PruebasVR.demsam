/**
 * Servicio de Gestión y Escalabilidad Multi-Cultural para BiblioVR
 * Diseñado para soportar la expansión modular a las culturas vivas de Nayarit:
 * - Wixárika (Huicholes)
 * - Náayeri (Coras)
 * - O'dam (Tepehuanos del Sur)
 * - Mexicaneros (Nahuas)
 * y futuras culturas indígenas regionales.
 */

// ============================================================================
// 1. CÁLCULO DE CONTRASTE Y ACCESIBILIDAD WCAG 2.1 (AAA / AA)
// ============================================================================

/**
 * Convierte un código hexadecimal a componentes RGB normalizados (0-1).
 * @param {string} hex Código hexadecimal (#RGB o #RRGGBB).
 * @returns {{ r: number, g: number, b: number } | null}
 */
export function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return null;
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  if (clean.length !== 6) return null;
  const num = parseInt(clean, 16);
  if (Number.isNaN(num)) return null;

  return {
    r: ((num >> 16) & 255) / 255,
    g: ((num >> 8) & 255) / 255,
    b: (num & 255) / 255
  };
}

/**
 * Calcula la luminancia relativa según la fórmula estándar W3C / WCAG 2.1.
 * @param {string} hex Código hexadecimal del color.
 * @returns {number} Luminancia relativa (0.0 a 1.0).
 */
export function calculateRelativeLuminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const transform = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const rLin = transform(rgb.r);
  const gLin = transform(rgb.g);
  const bLin = transform(rgb.b);

  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

/**
 * Calcula el ratio de contraste entre dos colores hexadecimales (1.0:1 a 21.0:1).
 * @param {string} hex1 Primer color (ej. texto)
 * @param {string} hex2 Segundo color (ej. fondo)
 * @returns {number} Ratio de contraste redondeado a 2 decimales.
 */
export function calculateContrastRatio(hex1, hex2) {
  const l1 = calculateRelativeLuminance(hex1);
  const l2 = calculateRelativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  return Math.round(ratio * 100) / 100;
}

/**
 * Valida si un par de colores cumple la norma WCAG 2.1 (AA: >=4.5, AAA: >=7.0).
 * @param {string} textHex
 * @param {string} bgHex
 * @param {'AAA'|'AA'} level
 * @returns {boolean}
 */
export function isWcagCompliant(textHex, bgHex, level = 'AAA') {
  const ratio = calculateContrastRatio(textHex, bgHex);
  const threshold = level === 'AAA' ? 7.0 : 4.5;
  return ratio >= threshold;
}

// ============================================================================
// 2. DISPOSICIÓN ESPACIAL ERGONÓMICA DE PABELLONES (ISO 9241-210)
// ============================================================================

/**
 * Genera coordenadas tridimensionales ergonómicas para cualquier número de estaciones
 * de una cultura futura, distribuyéndolas en arco radial al nivel de ojos del visitante.
 *
 * @param {Array<Object>} stations Lista de estaciones culturales.
 * @param {Object} [options]
 * @param {number} [options.radius=2.6] Radio ergonómico en metros desde el observador.
 * @param {number} [options.eyeHeight=1.40] Altura a nivel de ojos en metros.
 * @param {number} [options.maxRadius=7.5] Límite exterior para no colisionar con muros.
 * @param {Array<number>} [options.center=[0, 0, 0]] Centro del entorno virtual.
 * @returns {Array<Object>} Estaciones con posiciones [x, y, z] y rotaciones [rx, ry, rz] asignadas.
 */
export function buildErgonomicStationLayout(stations = [], options = {}) {
  if (!Array.isArray(stations) || stations.length === 0) return [];
  const {
    radius = 2.6,
    eyeHeight = 1.40,
    maxRadius = 7.5,
    center = [0, 0, 0]
  } = options;

  const safeRadius = Math.min(Math.max(radius, 1.2), maxRadius);
  const count = stations.length;
  const angleStep = (2 * Math.PI) / count;

  return stations.map((station, index) => {
    // Distribuir en círculo iniciando en -Z (frente al usuario)
    const angle = index * angleStep - Math.PI / 2;
    const x = Math.round((center[0] + safeRadius * Math.cos(angle)) * 1000) / 1000;
    const y = eyeHeight;
    const z = Math.round((center[2] + safeRadius * Math.sin(angle)) * 1000) / 1000;

    // Rotación orientada hacia el observador central
    const rotY = Math.round((-angle - Math.PI / 2) * 1000) / 1000;

    return {
      ...station,
      position: [x, y, z],
      rotation: [0, rotY, 0]
    };
  });
}

// ============================================================================
// 3. DEFINICIONES BASE DE LAS CULTURAS VIVAS DE NAYARIT
// ============================================================================

export const DEFAULT_CULTURES = [
  {
    id: 'wixarika',
    name: 'Wixárika',
    autonym: 'Wixárika',
    linguisticFamily: 'Yuto-nahua (rama corachol)',
    region: 'Sierra del Nayar, La Yesca y límites con Jalisco / Zacatecas',
    description: 'Pueblo de arte sagrado, cosmología centrada en el fuego Tatewari, el sol Tayau y la peregrinación a Wirikuta.',
    modelGlb: './museo_wixarika_v14.glb',
    theme: {
      primaryColor: '#d97706',      // Ámbar Tatewari
      secondaryColor: '#f59e0b',    // Dorado ceremonial
      accentColor: '#10b981',       // Esmeralda Hikuri
      textPrimary: '#ffffff',
      background: '#070a14',        // Obsidiana Wirikuta
      canteraBase: '#f4ede2'
    },
    stations: [
      {
        id: 'wix-deidades',
        stationId: 'deidades',
        name: 'Pabellón de Deidades',
        subtitle: 'Cosmovisión y Panteón Sagrado',
        iconName: 'sun'
      },
      {
        id: 'wix-gastronomia',
        stationId: 'gastronomia',
        name: 'Pabellón Gastronómico',
        subtitle: 'Alimentos Tradicionales de Nayarit',
        iconName: 'utensils'
      },
      {
        id: 'wix-fiestas',
        stationId: 'fiestas',
        name: 'Pabellón de Fiestas y Ritos',
        subtitle: 'Ceremonias de la Sierra',
        iconName: 'sparkles'
      }
    ]
  },
  {
    id: 'cora',
    name: 'Cora',
    autonym: 'Náayeri',
    linguisticFamily: 'Yuto-nahua (rama corachol)',
    region: 'Mesa del Nayar, Jesús María, Rosamorada y Ruiz, Nayarit',
    description: 'Pueblo guerrero de la Sierra Madre con rica tradición en la Judea de Semana Santa Cora, la danza del Mitote y la devoción al Santo Entierro.',
    modelGlb: './museo_cora_v1.glb',
    theme: {
      primaryColor: '#b45309',      // Ocre y cantera de Mesa del Nayar
      secondaryColor: '#eab308',    // Amarillo solar Náayeri
      accentColor: '#0284c7',       // Azul Río Santiago
      textPrimary: '#ffffff',
      background: '#0a0d18',
      canteraBase: '#ede8dd'
    },
    stations: [
      {
        id: 'cora-mitote',
        stationId: 'mitote',
        name: 'Pabellón del Mitote Sagrado',
        subtitle: 'Danza cósmica y petición de lluvias',
        iconName: 'flame'
      },
      {
        id: 'cora-judea',
        stationId: 'judea',
        name: 'Pabellón de la Judea Cora',
        subtitle: 'Semana Santa y los Borrados de Jesús María',
        iconName: 'shield'
      },
      {
        id: 'cora-gastronomia',
        stationId: 'gastronomia-cora',
        name: 'Pabellón Culinario Náayeri',
        subtitle: 'Pitifí, pinole criollo y tamales de ceniza',
        iconName: 'utensils'
      }
    ]
  },
  {
    id: 'tepehuano',
    name: 'Tepehuano del Sur',
    autonym: 'O\'dam',
    linguisticFamily: 'Yuto-nahua (rama tepimana)',
    region: 'Comunidades de Huajicori y Acaponeta, Nayarit',
    description: 'Comunidades serranas custodias del bosque de pino-encino, célebres por la fiesta del Xiotalh, la medicina botánica y la música de arco musical.',
    modelGlb: './museo_tepehuano_v1.glb',
    theme: {
      primaryColor: '#047857',      // Verde pinar de Huajicori
      secondaryColor: '#ca8a04',    // Resina dorada
      accentColor: '#b91c1c',       // Rojo ceremonial del Xiotalh
      textPrimary: '#ffffff',
      background: '#060d12',
      canteraBase: '#e6ede8'
    },
    stations: [
      {
        id: 'tepe-xiotalh',
        stationId: 'xiotalh',
        name: 'Pabellón de la Fiesta del Xiotalh',
        subtitle: 'Ceremonia de agradecimiento a los Dueños del Monte',
        iconName: 'sparkles'
      },
      {
        id: 'tepe-medicina',
        stationId: 'medicina-ancestral',
        name: 'Pabellón de Medicina Tradicional',
        subtitle: 'Herbolaria viva de la Sierra de Huajicori',
        iconName: 'flower'
      },
      {
        id: 'tepe-artesania',
        stationId: 'artesania-odam',
        name: 'Pabellón de Telar y Morrales O\'dam',
        subtitle: 'Tejido en telar de cintura y sombreros de soyate',
        iconName: 'palette'
      }
    ]
  },
  {
    id: 'mexicanero',
    name: 'Mexicanero',
    autonym: 'Nahuas de Nayarit',
    linguisticFamily: 'Yuto-nahua (rama náhuatl meridional)',
    region: 'Comunidad de Santa Cruz de Acaponeta, Nayarit',
    description: 'Enclave nahua del occidente mexicano que preserva cantos ancestrales náhuatl y el ritual del Xuravét.',
    modelGlb: './museo_mexicanero_v1.glb',
    theme: {
      primaryColor: '#9333ea',      // Púrpura flor de la sierra
      secondaryColor: '#f59e0b',    // Maíz sagrado
      accentColor: '#0d9488',       // Jade de río
      textPrimary: '#ffffff',
      background: '#090814',
      canteraBase: '#eae6f0'
    },
    stations: [
      {
        id: 'mex-xuravet',
        stationId: 'xuravet',
        name: 'Pabellón del Xuravét',
        subtitle: 'Cantos nahuas y bendición de las semillas',
        iconName: 'sparkles'
      },
      {
        id: 'mex-narrativa',
        stationId: 'narrativa-nahua',
        name: 'Pabellón de Tradición Oral',
        subtitle: 'Cuentos y mitos en lengua náhuatl de Nayarit',
        iconName: 'book-open'
      }
    ]
  }
];

// ============================================================================
// 4. REGISTRO Y GESTOR DE ESCALABILIDAD MULTICULTURAL
// ============================================================================

class CultureRegistry {
  constructor() {
    this._cultures = new Map();
    this.reset();
  }

  /**
   * Restablece el registro con las culturas nativas de Nayarit.
   */
  reset() {
    this._cultures.clear();
    for (const cult of DEFAULT_CULTURES) {
      this.registerCulture(cult);
    }
  }

  /**
   * Valida que una cultura cumpla el contrato formal para el visor VR.
   * @param {Object} culture
   * @returns {{ valid: boolean, errors: string[] }}
   */
  validateCulture(culture) {
    const errors = [];
    if (!culture || typeof culture !== 'object') {
      return { valid: false, errors: ['El objeto cultura debe ser válido'] };
    }

    if (!culture.id || typeof culture.id !== 'string' || culture.id.trim() === '') {
      errors.push('La cultura debe tener un identificador único (id)');
    }
    if (!culture.name || typeof culture.name !== 'string') {
      errors.push('La cultura debe tener un nombre legible (name)');
    }
    if (!culture.autonym || typeof culture.autonym !== 'string') {
      errors.push('La cultura debe especificar su autónimo / nombre indígena (autonym)');
    }
    if (!culture.theme || typeof culture.theme !== 'object') {
      errors.push('La cultura debe incluir un tema cromático (theme)');
    } else {
      if (!culture.theme.primaryColor) errors.push('theme.primaryColor es requerido');
      if (!culture.theme.background) errors.push('theme.background es requerido');
    }

    if (!Array.isArray(culture.stations) || culture.stations.length === 0) {
      errors.push('La cultura debe tener al menos una estación o pabellón cultural (stations)');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Registra una nueva cultura en el sistema de manera dinámica.
   * @param {Object} cultureData
   * @returns {Object} Cultura registrada con posiciones 3D calculadas.
   */
  registerCulture(cultureData) {
    const validation = this.validateCulture(cultureData);
    if (!validation.valid) {
      throw new Error(`Validación de cultura fallida: ${validation.errors.join('; ')}`);
    }

    const key = cultureData.id.trim().toLowerCase();
    const stationsWithLayout = buildErgonomicStationLayout(cultureData.stations);

    const fullCulture = {
      ...cultureData,
      id: key,
      stations: stationsWithLayout
    };

    this._cultures.set(key, fullCulture);
    return fullCulture;
  }

  /**
   * Elimina una cultura del registro (útil en pruebas dinámicas).
   * @param {string} cultureId
   * @returns {boolean}
   */
  unregisterCulture(cultureId) {
    if (!cultureId) return false;
    return this._cultures.delete(cultureId.trim().toLowerCase());
  }

  /**
   * Obtiene una cultura registrada por su id, nombre o autónimo.
   * @param {string} identifier
   * @returns {Object|null}
   */
  getCulture(identifier) {
    if (!identifier || typeof identifier !== 'string') return null;
    const clean = identifier.trim().toLowerCase();

    // 1. Coincidencia directa por id
    if (this._cultures.has(clean)) {
      return this._cultures.get(clean);
    }

    // 2. Búsqueda por nombre o autónimo
    for (const culture of this._cultures.values()) {
      if (
        culture.name.toLowerCase() === clean ||
        culture.autonym.toLowerCase() === clean
      ) {
        return culture;
      }
    }

    return null;
  }

  /**
   * Devuelve todas las culturas registradas.
   * @returns {Array<Object>}
   */
  getAllCultures() {
    return Array.from(this._cultures.values());
  }

  /**
   * Cantidad de culturas registradas actualmente.
   * @returns {number}
   */
  get count() {
    return this._cultures.size;
  }
}

// Instancia singleton para uso en la aplicación
export const cultureRegistry = new CultureRegistry();

// ============================================================================
// 5. FILTRADO POLIMÓRFICO POR CULTURA
// ============================================================================

/**
 * Normaliza una cadena para comparaciones insensibles a mayúsculas, espacios y acentos diacríticos.
 * @param {string} str
 * @returns {string}
 */
export function normalizeDiacritics(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Filtra cualquier colección de elementos (libros, videos, estaciones, piezas 3D)
 * según el identificador de la cultura requerida, garantizando aislamiento total.
 *
 * @param {Array<Object>} items Colección de elementos.
 * @param {string|null} cultureId Identificador de cultura ('wixarika', 'cora', 'tepehuano', etc.).
 * @returns {Array<Object>}
 */
export function filterContentByCulture(items = [], cultureId = null) {
  if (!Array.isArray(items)) return [];
  if (!cultureId || cultureId === 'all') return items;

  const target = normalizeDiacritics(cultureId);

  return items.filter((item) => {
    if (!item || typeof item !== 'object') return false;

    // Verificar campos polimórficos comunes en Supabase y mocks locales
    const candidateFields = [
      item.cultura_id,
      item.cultureId,
      item.culture,
      item.cultura,
      item.culturas?.nombre,
      item.cultureName
    ];

    const matchesField = candidateFields.some((f) => {
      if (!f) return false;
      const normalized = normalizeDiacritics(f.toString());
      return normalized === target || normalized.includes(target) || target.includes(normalized);
    });

    // Si el item tiene un arreglo de tags culturales
    const matchesTags = Array.isArray(item.tags)
      ? item.tags.some((t) => normalizeDiacritics(t.toString()) === target)
      : false;

    return matchesField || matchesTags;
  });
}

/**
 * Transforma un registro de la tabla `culturas` de Supabase al contrato de cultura de VR.
 * @param {Object} row Registro retornado por Supabase.
 * @returns {Object}
 */
export function mapSupabaseCultureToVR(row) {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const slug = (row.slug || row.codigo || row.nombre || 'cultura-desconocida')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');

  const defaultTheme = {
    primaryColor: row.color_primario || '#d97706',
    secondaryColor: row.color_secundario || '#f59e0b',
    accentColor: row.color_acento || '#10b981',
    textPrimary: '#ffffff',
    background: row.color_fondo || '#070a14',
    canteraBase: '#f4ede2'
  };

  const stations = Array.isArray(row.pabellones || row.estaciones)
    ? (row.pabellones || row.estaciones).map((p, i) => ({
        id: p.id || `${slug}-station-${i + 1}`,
        stationId: p.codigo || p.stationId || `pabellon-${i + 1}`,
        name: p.nombre || p.name || `Pabellón ${i + 1}`,
        subtitle: p.subtitulo || p.subtitle || 'Patrimonio y Tradición',
        iconName: p.icono || p.iconName || 'sparkles'
      }))
    : [
        {
          id: `${slug}-deidades`,
          stationId: 'deidades',
          name: `Pabellón Sagrado ${row.nombre || ''}`.trim(),
          subtitle: 'Cosmovisión y Tradición',
          iconName: 'sun'
        },
        {
          id: `${slug}-gastronomia`,
          stationId: 'gastronomia',
          name: `Gastronomía y Sabores`,
          subtitle: 'Alimentos Tradicionales',
          iconName: 'utensils'
        }
      ];

  return {
    id: slug,
    name: row.nombre || 'Cultura Sin Nombre',
    autonym: row.autonimo || row.nombre_originario || row.nombre || slug,
    linguisticFamily: row.familia_linguistica || 'Yuto-nahua',
    region: row.region || 'Estado de Nayarit',
    description: row.descripcion || `Acervo cultural y memoria viva de la comunidad ${row.nombre || ''}.`,
    modelGlb: row.modelo_glb_url || `./museo_${slug}_v1.glb`,
    theme: defaultTheme,
    stations
  };
}
