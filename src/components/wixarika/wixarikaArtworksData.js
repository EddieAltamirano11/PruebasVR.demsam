import * as THREE from 'three';

/**
 * Acervo Cultural de los 9 Cuadros Sagrados del Museo Wixárika
 * 6 Deidades Primordiales y 3 Fiestas Tradicionales del Kalihuey
 * Fuentes: Instituto Nacional de Antropología e Historia (INAH) e INPI
 */

export const WIXARIKA_ARTWORKS = [
  // =========================================================================
  // 1. LAS 6 DEIDADES PRIMORDIALES DEL PANTEÓN WIXÁRIKA
  // =========================================================================
  {
    id: 'deidad_tatewari',
    order: 1,
    stationName: 'estacion_deidad_1_tatewari',
    canvasNodeName: 'lienzo_tatewari_nierika',
    stationPosition: [5.273, 2.95, -5.048],
    category: 'Deidad Sagrada',
    alias: 'Nuestro Abuelo Fuego',
    title: 'TATEWARI',
    nativeName: '«Tatewari» · Nuestro Abuelo Fuego',
    subtitle: 'TESTIGO ANCESTRAL Y GUÍA DEL MARA\'AKAME',
    image: '/texturas/tatewari_nierika.png',
    matcher: (name) => name.includes('tatewari') && !name.includes('oculo'),
    keywords: [
      '• Fuego Sagrado y Memoria Ancestral de la Creación',
      '• Corazón del Kalihuey y Testigo de todos los Rezos',
      '• Primer Maestro y Guía Espiritual del Mara\'akame'
    ],
    description: 'Tatewari es el fuego sagrado y ancestro supremo del cosmos wixárika. Permanece vivo en el fogón del Kalihuey para consagrar la palabra, bendecir a los peregrinos y guiar con su luz la visión del Mara\'akame.'
  },
  {
    id: 'deidad_tayau',
    order: 2,
    stationName: 'estacion_deidad_2_tayau',
    canvasNodeName: 'lienzo_tayau_nierika',
    stationPosition: [3.399, 2.95, -6.460],
    category: 'Deidad Sagrada',
    alias: 'Nuestro Padre Sol',
    title: 'TAYAU',
    nativeName: '«Tayau» · Nuestro Padre Sol',
    subtitle: 'FUERZA CREADORA CELESTIAL Y LUZ DEL ORIENTE',
    image: '/texturas/tayau_sol_nierika.png',
    matcher: (name) => name.includes('tayau'),
    keywords: [
      '• Padre Creador y Luz Radiante del Cosmos',
      '• Nacimiento Victorioso en el Cerro de Wirikuta',
      '• Energía Vital que Fecunda las Milpas Serranas'
    ],
    description: 'Tayau personifica el principio solar masculino creador. Tras ascender en el cerro sagrado de Wirikuta y vencer la oscuridad cósmica, derrama su energía vital para fecundar el maíz y guiar los ciclos de la vida.'
  },
  {
    id: 'deidad_kauyumari',
    order: 3,
    stationName: 'estacion_deidad_3_kauyumari',
    canvasNodeName: 'lienzo_kauyumari_nierika',
    stationPosition: [1.173, 2.95, -7.205],
    category: 'Deidad Sagrada',
    alias: 'Hermano Mayor Venado Azul',
    title: 'KAUYUMARI',
    nativeName: '«Tamats Kauyumari» · Hermano Mayor Venado Azul',
    subtitle: 'MENSAJERO DIVINO Y ESPÍRITU DEL HIKURI',
    image: '/texturas/kauyumari_venado_nierika.jpg',
    matcher: (name) => name.includes('kauyumari'),
    keywords: [
      '• Héroe Cultural y Mensajero de los Dioses',
      '• De sus Huellas Sagradas Brota la Medicina del Hikuri',
      '• Protector del Peregrino en el Desierto Sagrado'
    ],
    description: 'Kauyumari es el mensajero divino y guía espiritual entre los dioses y la humanidad. Transformado en venado azul, de sus huellas brotó el peyote sagrado, inspirando la sabiduría y los cantos del Mara\'akame.'
  },
  {
    id: 'deidad_takutsi',
    order: 4,
    stationName: 'estacion_deidad_4_takutsi_nakawe',
    canvasNodeName: 'lienzo_takutsi_nierika',
    stationPosition: [-1.173, 2.95, -7.205],
    category: 'Deidad Sagrada',
    alias: 'Nuestra Abuela Crecimiento',
    title: 'TAKUTSI NAKAWE',
    nativeName: '«Takutsi Nakawe» · Nuestra Abuela Crecimiento',
    subtitle: 'MADRE PRIMORDIAL DE LA TIERRA Y LA FERTILIDAD',
    image: '/texturas/takutsi_nakawe_nierika.jpg',
    matcher: (name) => name.includes('takutsi'),
    keywords: [
      '• Gran Madre Cósmica de las Raíces y la Vegetación',
      '• Dueña de la Lluvia Fecunda y las Aguas Terrestres',
      '• Sabiduría Ancestral y Renovación del Mundo'
    ],
    description: 'Takutsi Nakawe es la madre primordial de la tierra, la vegetación y la fertilidad. Con su báculo ceremonial modeló los cañones y valles sagrados, protegiendo las aguas y las simientes de la comunidad.'
  },
  {
    id: 'deidad_niwetsika',
    order: 5,
    stationName: 'estacion_deidad_5_tatei_niwetsika',
    canvasNodeName: 'lienzo_niwetsika_nierika',
    stationPosition: [-3.399, 2.95, -6.460],
    category: 'Deidad Sagrada',
    alias: 'Nuestra Madre del Maíz',
    title: 'TATEI NIWETSIKA',
    nativeName: '«Tatei Niwetsika» · Nuestra Madre del Maíz',
    subtitle: 'SUSTENTO SAGRADO Y MADRE DE LAS MAZORCAS',
    image: '/texturas/tatei_niwetsika_nierika.jpg',
    matcher: (name) => name.includes('niwetsika'),
    keywords: [
      '• Guardiana de las Cinco Variedades de Maíz Sagrado',
      '• Bendición Nutricia de los Coamiles y Trojes',
      '• Alimento Espiritual y Físico del Pueblo Wixárika'
    ],
    description: 'Tatei Niwetsika es el alma nutricia del maíz criollo en sus cinco colores sagrados. Cada ciclo agrícola recibe ofrendas en los coamiles para asegurar cosechas prósperas que alimentan la vida serrana.'
  },
  {
    id: 'deidad_haramara',
    order: 6,
    stationName: 'estacion_deidad_6_tatei_haramara',
    canvasNodeName: 'lienzo_haramara_nierika',
    stationPosition: [-5.273, 2.95, -5.048],
    category: 'Deidad Sagrada',
    alias: 'Nuestra Madre el Océano',
    title: 'TATEI HARAMARA',
    nativeName: '«Tatei Haramara» · Nuestra Madre el Océano',
    subtitle: 'ORIGEN DE TODAS LAS LLUVIAS Y PUERTA DEL PONIENTE',
    image: '/texturas/tatei_haramara_mar_nierika.jpg',
    matcher: (name) => name.includes('haramara'),
    keywords: [
      '• Soberana del Mar Pacífico y Cuna de las Nubes',
      '• Santuario Sagrado de la Roca Blanca en San Blas',
      '• Umbral Sagrado del Descanso de los Espíritus'
    ],
    description: 'Tatei Haramara es la madre primordial del océano y las aguas del poniente. Desde su santuario marino en San Blas engendra las nubes fértiles de lluvia y recibe en paz las almas de los ancestros.'
  },

  // =========================================================================
  // 2. LAS 3 GRANDES FIESTAS Y CEREMONIAS TRADICIONALES
  // =========================================================================
  {
    id: 'fiesta_namawita',
    order: 7,
    stationName: 'estacion_fiesta_1_namawita_neixa',
    canvasNodeName: 'lienzo_fiesta_namawita_neixa',
    stationPosition: [-6.923, 2.95, -2.316],
    category: 'Fiesta Ceremonial',
    alias: 'Consagración de la Niñez',
    title: 'FIESTA DEL TAMBOR',
    nativeName: '«Namawita Neixa» / «Yuimakwaxa»',
    subtitle: 'NAMAWITA NEIXA · FIESTA DEL TEPU SAGRADO',
    image: '/texturas/cuadro_fiesta_tambor.jpg',
    matcher: (name) => name.includes('namawita') || name.includes('fiesta_1'),
    keywords: [
      '• Rito de Iniciación para Niños hasta los Cinco Años',
      '• Vuelo Espiritual a Wirikuta guiados por el Mara\'akame',
      '• Sonidos Místicos del Tepu y Bendición de Calabazas'
    ],
    description: 'Namawita Neixa consagra la salud y pureza de los niños serranos. Al compás del tambor sagrado Tepu, los pequeños viajan espiritualmente en vuelo místico hacia Wirikuta para sellar su alianza divina.'
  },
  {
    id: 'fiesta_tatei',
    order: 8,
    stationName: 'estacion_fiesta_2_tatei_neixa',
    canvasNodeName: 'lienzo_fiesta_tatei_neixa',
    stationPosition: [-7.300, 2.95, 0.000],
    category: 'Fiesta Ceremonial',
    alias: 'Danza de los Primeros Frutos',
    title: 'TATEI NEIXA',
    nativeName: '«Tatei Neixa» · Danza de los Primeros Frutos',
    subtitle: 'GRATITUD POR LA PRIMERA COSECHA DEL COAMIL',
    image: '/texturas/cuadro_fiesta_tatei_neixa.jpg',
    matcher: (name) => name.includes('tatei_neixa') || name.includes('fiesta_2'),
    keywords: [
      '• Danza Circular Comunitaria en el Kalihuey',
      '• Ofrenda y Gratitud por los Elotes Tiernos',
      '• Consagración Comunitaria con Tejuino Ceremonial'
    ],
    description: 'Tatei Neixa es la solemne acción de gracias donde se bendicen los primeros elotes y frutos del coamil. Alrededor del fuego sagrado, la comunidad danza y comparte el tejuino sagrado en hermandad.'
  },
  {
    id: 'fiesta_hikuri',
    order: 9,
    stationName: 'estacion_fiesta_3_hikuri_neixa',
    canvasNodeName: 'lienzo_fiesta_hikuri_neixa',
    stationPosition: [-6.923, 2.95, 2.316],
    category: 'Fiesta Ceremonial',
    alias: 'Danza Sagrada del Peyote',
    title: 'HIKURI NEIXA',
    nativeName: '«Hikuri Neixa» · Danza Sagrada del Peyote',
    subtitle: 'RETORNO DE WIRIKUTA Y RENOVACIÓN CÓSMICA',
    image: '/texturas/cuadro_fiesta_hikuri_neixa.jpg',
    matcher: (name) => name.includes('hikuri_neixa') || name.includes('fiesta_3'),
    keywords: [
      '• Fiesta Cumbre del Retorno de la Peregrinación',
      '• Comunión Colectiva con el Hikuri Sagrado',
      '• Cantos Epopeyicos de Creación del Universo'
    ],
    description: 'Hikuri Neixa conmemora el retorno triunfal de los peregrinos con la medicina sagrada desde Wirikuta. Durante noches de danza incesante y cantos ancestrales, renuevan la armonía del mundo y llaman las lluvias.'
  }
];

// =========================================================================
// 3. GASTRONOMÍA TRADICIONAL Y ALIMENTOS SAGRADOS DE NAYARIT (4 PLATILLOS)
// =========================================================================
export const WIXARIKA_GASTRONOMY_DISHES = [
  {
    id: 'gastro_tortillas',
    order: 1,
    recuadroNodeName: 'recuadro_gastronomia_tortillas',
    canvasNodeName: 'lienzo_gastronomia_tortillas',
    tableStationName: 'comida_tortillas_maiz_sagrado',
    tableDishNodeName: 'disco_tortillas_comal_textura',
    stationPosition: [7.416, 3.77, -2.071],
    category: 'Gastronomía Tradicional',
    alias: 'Sustento Sagrado de Maíz',
    title: 'TORTILLAS DE MAÍZ CRIOLLO',
    nativeName: '«Mewi» · Tortillas Ceremoniales de Comal',
    subtitle: 'NIXTAMALIZACIÓN ANCESTRAL EN COMAL DE BARRO',
    image: '/gastronomia/gastro_tortillas.png',
    matcher: (name) => name.includes('tortilla'),
    keywords: [
      '• Maíz Criollo Azul y Morado Nixtamalizado en Comal',
      '• Base Nutricia y Espiritual de la Comunidad Serrana',
      '• Elaboración Femenina con Metate y Fuego Sagrado'
    ],
    sourceUrl: 'https://elsouvenir.com/la-cultura-huichol-de-la-sierra-wirrarika-de-nayarit/',
    reference: 'El Souvenir: "La cultura Huichol de Nayarit, la Sierra Wixarika"',
    description: 'Base alimenticia y ritual wixárika. Elaboradas a mano en comal de barro con maíz criollo nixtamalizado, son bendecidas por Tatei Niwetsika.'
  },
  {
    id: 'gastro_tamales',
    order: 2,
    recuadroNodeName: 'recuadro_gastronomia_tamales',
    canvasNodeName: 'lienzo_gastronomia_tamales',
    tableStationName: 'comida_tamales_ceremoniales',
    tableDishNodeName: 'disco_tamales_totomoxtle_textura',
    stationPosition: [7.700, 3.77, 0.000],
    category: 'Gastronomía Tradicional',
    alias: 'Envueltos de Mazorca Sagrada',
    title: 'TAMALES DE TOTOMOXLE',
    nativeName: '«Tamales Tradicionales» de Maíz Serrano',
    subtitle: 'COCCIÓN AL VAPOR EN HOJA DE MAZORCA SECA',
    image: '/gastronomia/gastro_tamales.jpg',
    matcher: (name) => name.includes('tamal'),
    keywords: [
      '• Envoltura Sagrada en Hoja de Totomoxtle',
      '• Masa de Maíz Criollo y Manteca Tradicional',
      '• Ofrenda Imprescindible para Deidades y Ancestros'
    ],
    sourceUrl: 'https://www.fundacioncausaazul.org/es-es/blog/detras-de-una-artesania/honrando-la-memoria-cosmovision-wixarika',
    reference: 'Fundación Causa Azul: "Honrando la Memoria: Cosmovisión Wixárika"',
    description: 'Alimento ceremonial envuelto en hojas secas de totomoxtle. Simboliza la protección de la vida y se ofrenda a las deidades en el Kalihuey.'
  },
  {
    id: 'gastro_atole',
    order: 3,
    recuadroNodeName: 'recuadro_gastronomia_atole',
    canvasNodeName: 'lienzo_gastronomia_atole',
    tableStationName: 'comida_atole_olla_bebidas',
    tableDishNodeName: 'disco_atole_espumoso_textura',
    stationPosition: [7.416, 3.77, 2.071],
    category: 'Gastronomía Tradicional',
    alias: 'Bebida Ceremonial de Nawá',
    title: 'ATOLE DE MAÍZ Y TEJUINO',
    nativeName: '«Nawá» · Bebida Ceremonial Sagrada',
    subtitle: 'ENERGÍA ESPIRITUAL EN JÍCARAS ARTESANALES',
    image: '/gastronomia/gastro_atole.jpg',
    matcher: (name) => name.includes('atole') || name.includes('tejuino') || name.includes('nawa'),
    keywords: [
      '• Maíz de Temporal Cocido y Molido en Jícaras de Barro',
      '• Vigor Espiritual que Acompaña los Cantos del Mara\'akame',
      '• Símbolo de Hermandad y Ceremonialidad Comunitaria'
    ],
    sourceUrl: 'https://www.youtube.com/watch?v=meHGpPLrDaU',
    reference: '"Atole seco de maiz" Gastronomía indígena wixarika',
    description: 'Bebida sagrada tradicional preparada en jícaras de barro. Brinda vigor espiritual durante las ceremonias y velaciones del Mara\'akame.'
  },
  {
    id: 'gastro_maiz_tostado',
    order: 4,
    recuadroNodeName: 'recuadro_gastronomia_maiz_tostado',
    canvasNodeName: 'lienzo_gastronomia_maiz_tostado',
    tableStationName: 'comida_maiz_tostado_xarikixa',
    tableDishNodeName: 'disco_maiz_tostado_textura',
    stationPosition: [7.700, 1.99, 0.000],
    category: 'Gastronomía Tradicional',
    alias: 'Provisión del Peregrino',
    title: 'MAÍZ TOSTADO Y PINOLE',
    nativeName: '«Haute» · Maíces de Colores al Comal',
    subtitle: 'PROVISIÓN SAGRADA PARA LA TRAVESÍA A WIRIKUTA',
    image: '/gastronomia/gastro_maiz_tostado.jpg',
    matcher: (name) => name.includes('tostado') || name.includes('pinole') || name.includes('haute'),
    keywords: [
      '• Mazorcas Criollas de Diversos Colores Tostadas al Fuego',
      '• Provisión Ligera y Nutricia para la Larga Marcha',
      '• Testigo de la Ruta Ritual Hacia los Santuarios Sagrados'
    ],
    sourceUrl: 'https://www.fundacioncausaazul.org/es-es/blog/detras-de-una-artesania/honrando-la-memoria-cosmovision-wixarika',
    reference: 'Fundación Causa Azul (Cosmovisión Wixárika) & El Souvenir',
    description: 'Granos de maíz criollo multicolor tostados al fuego. Bastimento sagrado y provisión esencial de los peregrinos rumbo a Wirikuta.'
  }
];

export const ALL_WIXARIKA_EXHIBITION_ITEMS = [
  ...WIXARIKA_ARTWORKS,
  ...WIXARIKA_GASTRONOMY_DISHES
];

/**
 * Busca y retorna la obra correspondiente al nombre de una estación, lienzo o identificador
 */
export function findArtworkByNodeName(nodeName) {
  if (!nodeName) return null;
  const lower = nodeName.toLowerCase();
  return (
    ALL_WIXARIKA_EXHIBITION_ITEMS.find(
      (art) =>
        art.stationName?.toLowerCase() === lower ||
        art.canvasNodeName?.toLowerCase() === lower ||
        art.recuadroNodeName?.toLowerCase() === lower ||
        art.tableStationName?.toLowerCase() === lower ||
        art.tableDishNodeName?.toLowerCase() === lower ||
        (art.matcher && art.matcher(lower))
    ) || null
  );
}

/**
 * Obtiene una obra por su ID único
 */
export function getArtworkById(id) {
  return ALL_WIXARIKA_EXHIBITION_ITEMS.find((art) => art.id === id) || null;
}

/**
 * Calcula la posición y orientación del modal monumental frente al cuadro seleccionado.
 * Lo ubica a 3.28m del centro del museo (15% más alejado del centro para óptimo campo de visión en VR)
 * a una altura ergonómica de Y = 2.25m, mirando hacia el centro del museo.
 */
export function calculateArtworkModalTransform(artwork) {
  if (!artwork) {
    return { position: [0, 2.25, 4.31], rotation: [0, Math.PI, 0] };
  }

  // Coordenadas mundiales del cuadro en el muro
  const artPos = artwork.worldPosition
    ? new THREE.Vector3().copy(artwork.worldPosition)
    : (artwork.stationPosition
        ? new THREE.Vector3(...artwork.stationPosition)
        : new THREE.Vector3(0, 2.25, -7.0));

  // Dirección horizontal desde el centro del museo [0, 0, 0] hacia el cuadro
  const dir = new THREE.Vector3(artPos.x, 0, artPos.z);
  if (dir.lengthSq() < 0.001) {
    dir.set(0, 0, -1);
  } else {
    dir.normalize();
  }

  // Posicionar a 3.28m del centro del museo (15% más alejado del centro: 2.85 * 1.15 = 3.2775m -> 3.28m)
  // a una altura ergonómica en Y = 2.25m
  const targetX = dir.x * 3.28;
  const targetY = 2.25;
  const targetZ = dir.z * 3.28;

  // Orientar hacia el centro del museo: la normal frontal (+Z) debe mirar hacia [0, 0, 0]
  // angleY = Math.atan2(-dir.x, -dir.z)
  const angleY = Math.atan2(-dir.x, -dir.z);

  return {
    position: [targetX, targetY, targetZ],
    rotation: [0, angleY, 0]
  };
}
