/**
 * Wixárika Design System & VR Ergonomics Tokens
 * 
 * Basado en la cosmovisión y arte sagrado del pueblo Wixárika (Huichol) de Nayarit:
 * - Tatewari (Abuelo Fuego): Ámbar solar, oro brillante y fuego ceremonial
 * - Tayau (Padre Sol): Luz dorada y amarillo intenso
 * - Hikuri (Peyote sagrado): Verde esmeralda y menta ceremonial
 * - Tatei Haramara (Madre Océano / Lluvia): Turquesa pacífico y azul sagrado
 * - Kauyumari (Venado Azul mensajero): Violeta e índigo místico
 * - Wirikuta (Tierra sagrada y noche de desierto): Obsidiana profunda de alto contraste
 * 
 * Normativas de Accesibilidad y Ergonomía VR:
 * - WCAG 2.1 Nivel AAA: Ratio de contraste >= 7:1 para textos y elementos críticos.
 * - ISO 9241-210 & WebXR: Tamaño angular de objetivos de mirada >= 1.5° (óptimo 2.5° - 4.5°).
 * - Legibilidad de texto: Altura angular >= 0.5° (30 arcmin) para cuerpo y >= 1.0° para encabezados.
 */

// ============================================================================
// 1. PALETA CROMÁTICA SAGRADA WIXÁRIKA
// ============================================================================
export const WIXARIKA_COLORS = {
  // Tatewari - Abuelo Fuego / Fuego Sagrado
  tatewari: {
    base: '#d97706',      // Ámbar intenso
    bright: '#f59e0b',    // Fuego ceremonial
    light: '#fbbf24',     // Resplandor cálido
    glow: '#f97316',      // Llama viva
    dark: '#78350f'
  },
  // Tayau - Padre Sol
  tayau: {
    base: '#eab308',
    bright: '#fde047',    // Amarillo solar puro (14:1 vs obsidiana)
    light: '#fef08a',
    accent: '#ca8a04'
  },
  // Hikuri - Peyote Sagrado / Medicina
  hikuri: {
    base: '#059669',      // Verde profundo
    bright: '#10b981',    // Esmeralda sagrada
    light: '#34d399',     // Menta luminosa (10:1 vs obsidiana)
    glow: '#6ee7b7',
    dark: '#064e3b'
  },
  // Haramara - Océano, Lluvia y Manantiales
  haramara: {
    base: '#0284c7',      // Azul océano
    bright: '#38bdf8',    // Turquesa cielo (9:1 vs obsidiana)
    light: '#7dd3fc',
    glow: '#06b6d4',      // Resplandor agua
    dark: '#0c4a6e'
  },
  // Kauyumari - Venado Azul / Guía Espiritual
  kauyumari: {
    base: '#6366f1',      // Índigo ceremonial
    bright: '#818cf8',    // Violeta venado
    light: '#a5b4fc',
    dark: '#312e81'
  },
  // Coral Sagrado / Sangre Ritual
  coral: {
    base: '#dc2626',
    bright: '#ef4444',
    light: '#f87171',
    glow: '#fb7185'
  },
  // Wirikuta - Noche Sagrada del Desierto (Fondo de Alto Contraste)
  obsidian: {
    deep: '#040711',      // Negro abisal
    surface: '#070a14',   // Superficie principal de paneles (95% opaco)
    elevated: '#0f172a',  // Capa elevada de tarjetas
    border: '#1e293b',    // Borde sutil
    glass: 'rgba(7, 10, 20, 0.94)'
  },
  // Neutrales de Alto Contraste (WCAG AAA)
  text: {
    primary: '#ffffff',   // Blanco absoluto (18:1 vs superficie obsidiana)
    solar: '#fde047',     // Amarillo solar (14:1 vs superficie obsidiana)
    turquoise: '#38bdf8', // Turquesa cielo (9:1 vs superficie obsidiana)
    hikuri: '#34d399',    // Menta medicinal (10:1 vs superficie obsidiana)
    secondary: '#cbd5e1', // Gris perla claro (10:1 vs superficie obsidiana)
    muted: '#94a3b8'      // Gris plata (6:1 vs superficie obsidiana)
  }
};

// ============================================================================
// 2. VARIANTES TEMÁTICAS PARA COMPONENTES
// ============================================================================
export const WIXARIKA_VARIANTS = {
  solar: {
    id: 'solar',
    name: 'Tatewari (Fuego Sagrado)',
    bgIdle: '#0b101d',
    bgHover: '#1c1917',
    bgActive: '#78350f',
    borderColor: '#f59e0b',
    borderGlow: '#fbbf24',
    textColor: '#fef08a',
    accentColor: '#f59e0b',
    fuseColor: '#fbbf24',
    chaquiraBeads: ['#f59e0b', '#ef4444', '#fde047', '#ffffff']
  },
  water: {
    id: 'water',
    name: 'Tatei Haramara (Océano Sagrado)',
    bgIdle: '#071322',
    bgHover: '#0c223a',
    bgActive: '#0369a1',
    borderColor: '#38bdf8',
    borderGlow: '#7dd3fc',
    textColor: '#ffffff',
    accentColor: '#38bdf8',
    fuseColor: '#06b6d4',
    chaquiraBeads: ['#0284c7', '#38bdf8', '#fde047', '#ffffff']
  },
  hikuri: {
    id: 'hikuri',
    name: 'Hikuri (Sabiduría y Medicina)',
    bgIdle: '#061614',
    bgHover: '#062c23',
    bgActive: '#047857',
    borderColor: '#10b981',
    borderGlow: '#34d399',
    textColor: '#ffffff',
    accentColor: '#34d399',
    fuseColor: '#10b981',
    chaquiraBeads: ['#059669', '#34d399', '#f59e0b', '#ffffff']
  },
  kauyumari: {
    id: 'kauyumari',
    name: 'Kauyumari (Venado Azul)',
    bgIdle: '#0b0f24',
    bgHover: '#171c3d',
    bgActive: '#4338ca',
    borderColor: '#818cf8',
    borderGlow: '#a5b4fc',
    textColor: '#ffffff',
    accentColor: '#818cf8',
    fuseColor: '#6366f1',
    chaquiraBeads: ['#6366f1', '#38bdf8', '#fde047', '#ffffff']
  },
  obsidian: {
    id: 'obsidian',
    name: 'Wirikuta (Obsidiana Sagrada)',
    bgIdle: '#070a14',
    bgHover: '#131b2e',
    bgActive: '#1e293b',
    borderColor: '#f59e0b',
    borderGlow: '#38bdf8',
    textColor: '#ffffff',
    accentColor: '#fde047',
    fuseColor: '#f59e0b',
    chaquiraBeads: ['#f59e0b', '#38bdf8', '#ffffff', '#ef4444']
  },
  danger: {
    id: 'danger',
    name: 'Alerta Ceremonial',
    bgIdle: '#1a0a0d',
    bgHover: '#331017',
    bgActive: '#991b1b',
    borderColor: '#ef4444',
    borderGlow: '#f87171',
    textColor: '#ffffff',
    accentColor: '#ef4444',
    fuseColor: '#f87171',
    chaquiraBeads: ['#ef4444', '#f59e0b', '#ffffff', '#b91c1c']
  }
};

// ============================================================================
// 3. MATEMÁTICAS DE TAMAÑO ANGULAR Y ERGONOMÍA VR (ISO 9241-210)
// ============================================================================

/**
 * Calcula el tamaño angular en grados de un objeto observado a una distancia dada
 * Fórmula: theta = 2 * arctan(size / (2 * distance)) * (180 / PI)
 * 
 * @param {number} sizeMeters - Tamaño del objeto en metros (ancho o alto)
 * @param {number} distanceMeters - Distancia del observador en metros
 * @returns {number} Ángulo subtendido en grados
 */
export function calculateAngularSize(sizeMeters, distanceMeters) {
  if (!distanceMeters || distanceMeters <= 0 || !sizeMeters || sizeMeters <= 0) return 0;
  return 2 * Math.atan(sizeMeters / (2 * distanceMeters)) * (180 / Math.PI);
}

/**
 * Calcula el tamaño requerido en metros para alcanzar un tamaño angular deseado
 * Fórmula: size = 2 * distance * tan((theta_deg * PI) / 360)
 * 
 * @param {number} angularDegrees - Ángulo deseado en grados
 * @param {number} distanceMeters - Distancia del observador en metros
 * @returns {number} Tamaño en metros
 */
export function metersFromAngularSize(angularDegrees, distanceMeters) {
  if (!distanceMeters || distanceMeters <= 0 || !angularDegrees || angularDegrees <= 0) return 0;
  const radians = (angularDegrees * Math.PI) / 360;
  return 2 * distanceMeters * Math.tan(radians);
}

/**
 * Umbrales ergonómicos oficiales en grados para VR:
 */
export const VR_ANGULAR_THRESHOLDS = {
  // Objetivos de mirada (botones, hotspots): mínimo 1.5°, recomendado >= 2.0°
  MIN_GAZE_TARGET_DEG: 1.5,
  RECOMMENDED_GAZE_TARGET_DEG: 2.2,
  OPTIMAL_GAZE_TARGET_DEG: 3.5,

  // Textos y etiquetas:
  MIN_BODY_TEXT_DEG: 0.5,        // 30 minutos de arco (umbral mínimo de legibilidad)
  RECOMMENDED_BODY_TEXT_DEG: 0.7, // 42 minutos de arco
  HEADER_TEXT_DEG: 1.1,          // Títulos y encabezados
  MONUMENTAL_TITLE_DEG: 2.0      // Letreros monumentales
};

/**
 * Verifica si un elemento cumple con los estándares ergonómicos en VR
 * @param {number} sizeMeters - Dimensión menor del elemento (alto de botón o fuente)
 * @param {number} distanceMeters - Distancia en metros
 * @param {'button'|'body'|'header'|'monumental'} type - Tipo de elemento
 * @returns {{ passes: boolean, angularDeg: number, minRequiredDeg: number }}
 */
export function verifyAngularCompliance(sizeMeters, distanceMeters, type = 'button') {
  const angularDeg = calculateAngularSize(sizeMeters, distanceMeters);
  let minRequiredDeg = VR_ANGULAR_THRESHOLDS.MIN_GAZE_TARGET_DEG;

  if (type === 'body') minRequiredDeg = VR_ANGULAR_THRESHOLDS.MIN_BODY_TEXT_DEG;
  if (type === 'header') minRequiredDeg = VR_ANGULAR_THRESHOLDS.HEADER_TEXT_DEG;
  if (type === 'monumental') minRequiredDeg = VR_ANGULAR_THRESHOLDS.MONUMENTAL_TITLE_DEG;

  return {
    passes: angularDeg >= minRequiredDeg,
    angularDeg: Number(angularDeg.toFixed(2)),
    minRequiredDeg
  };
}

// ============================================================================
// 4. CÁLCULO DE CONTRASTE WCAG 2.1 (AA / AAA)
// ============================================================================

/**
 * Calcula la luminancia relativa de un color hexadecimal según WCAG 2.1
 * @param {string} hexColor - Color hexadecimal (ej. '#f59e0b')
 * @returns {number} Luminancia relativa (0 a 1)
 */
export function getRelativeLuminance(hexColor) {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const toLinear = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

  const R = toLinear(r);
  const G = toLinear(g);
  const B = toLinear(b);

  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Calcula el ratio de contraste entre dos colores según WCAG 2.1
 * Fórmula: (L1 + 0.05) / (L2 + 0.05) donde L1 es el más brillante
 * @param {string} color1 - Primer color hexadecimal
 * @param {string} color2 - Segundo color hexadecimal
 * @returns {number} Ratio de contraste (ej. 14.5 para 14.5:1)
 */
export function getWcagContrastRatio(color1, color2) {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
}

/**
 * Verifica si dos colores cumplen con WCAG AA (4.5:1) o AAA (7:1)
 * @param {string} foreground - Color del texto o elemento
 * @param {string} background - Color de fondo
 * @returns {{ ratio: number, passesAA: boolean, passesAAA: boolean }}
 */
export function verifyWcagCompliance(foreground, background) {
  const ratio = getWcagContrastRatio(foreground, background);
  return {
    ratio,
    passesAA: ratio >= 4.5,
    passesAAA: ratio >= 7.0
  };
}
