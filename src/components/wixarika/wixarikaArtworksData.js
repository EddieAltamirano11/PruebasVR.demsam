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
    description: 'Tatewari es la deidad primordial más antigua del cosmos wixárika. Como fuego sagrado y ancestro supremo, ilumina el camino ritual de la comunidad. Permanece vivo en el fogón ceremonial del Kalihuey para consagrar las palabras, bendecir a los peregrinos y transmitir los designios divinos.'
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
    description: 'Tayau personifica el principio solar masculino creador. En los cantos sagrados se relata su ascenso por vez primera en el cerro sagrado de Reunari en Wirikuta, venciendo la oscuridad para regalar la vista y el calor. Da energía a la siembra del maíz y conduce el ciclo del día.'
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
    description: 'Kauyumari es el espíritu guía por excelencia, mediador entre las divinidades celestiales y los seres humanos. Transformado en venado azul, sus huellas se convirtieron en peyote sagrado (Hikuri). Es el aliado inseparable del Mara\'akame, inspirando sus cantos de sanación y visión.'
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
    description: 'Takutsi Nakawe es la gran abuela creadora, asociada al origen de los árboles, los animales y la fertilidad de la tierra. Porta el báculo ceremonial de bambú con el que modeló los valles y cañones de la sierra tras el diluvio primordial, protegiendo las simientes de la comunidad.'
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
    description: 'Tatei Niwetsika personifica el alma misma del maíz criollo en sus cinco colores sagrados: blanco, azul, amarillo, rojo y pinto. Cada ciclo agrícola se le rinde culto fervoroso con ofrendas en el coamil para que las mazorcas maduren abundantes y alimenten a las familias serranas.'
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
    description: 'Tatei Haramara es la madre de las aguas oceánicas, cuyo adoratorio sagrado reside en Waxiewe (la Isla del Rey frente a San Blas, Nayarit). De su manto pacífico emergen las nubes que remontan la cordillera para fertilizar los campos, siendo además santuario del descanso del alma.'
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
    description: 'Esta entrañable ceremonia otoñal consagra la vida y salud de los niños de la comunidad. Guiados por los toques ininterrumpidos del tambor sagrado (Tepu) y las sonajas del Mara\'akame, los pequeños viajan espiritualmente convertidos en colibríes hacia el oriente de Wirikuta, sellando su pacto con los dioses.'
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
    description: 'Tatei Neixa es la fiesta de acción de gracias en la que se bendicen los primeros frutos del coamil: elotes tiernos, calabazas y frijoles recién cosechados. La comunidad entera participa en danzas circulares alrededor del fuego, compartiendo el tejuino sagrado (nawá) y renovando la hermandad comunal.'
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
    description: 'Celebración solemne que marca el regreso triunfal de los peregrinos (jicareros) desde el desierto de Wirikuta cargando la medicina sagrada. Durante días y noches se entonan cantos cosmogónicos milenarios y se danza sin cesar, consumando la purificación colectiva y asegurando las lluvias venideras.'
  }
];

// =========================================================================
// 3. GASTRONOMÍA TRADICIONAL Y ALIMENTOS SAGRADOS DE NAYARIT
// =========================================================================
export const WIXARIKA_GASTRONOMY_DISHES = [
  {
    id: 'gastro_tortillas',
    order: 1,
    stationName: 'estacion_gastro_1_tortillas',
    canvasNodeName: 'lienzo_gastro_tortillas',
    stationPosition: [6.80, 2.30, -1.80],
    category: 'Gastronomía Tradicional',
    alias: 'Sustento Sagrado de Maíz',
    title: 'TORTILLAS DE MAÍZ CRIOLLO',
    nativeName: '«Mewi» · Tortillas Ceremoniales de Comal',
    subtitle: 'NIXTAMALIZACIÓN ANCESTRAL Y BASE DEL KALITÜEY',
    image: '/texturas/cuadro_gastro_tortillas.jpg',
    cedulaImage: '/texturas/cedula_gastro_tortillas.png',
    letreroImage: '/texturas/letrero_gastro_tortillas.png',
    discoImage: '/texturas/disco_food_tortillas.png',
    matcher: (name) => name.includes('tortilla'),
    keywords: [
      '• Maíz Criollo de Cinco Colores Nixtamalizado en Comal',
      '• Base Nutricia y Espiritual de la Comunidad Serrana',
      '• Elaboración Femenina con Metate y Fuego Sagrado'
    ],
    description: 'Las tortillas de maíz criollo son la base alimenticia y ritual de las comunidades originarias de Nayarit. Hechas a mano sobre comales de barro y cocidas con leña de roble, representan la comunión diaria entre el esfuerzo humano, el agua y el don fecundo de Tatei Niwetsika.'
  },
  {
    id: 'gastro_caldo_toro',
    order: 2,
    stationName: 'estacion_gastro_2_caldo_toro',
    canvasNodeName: 'lienzo_gastro_caldo_toro',
    stationPosition: [7.20, 2.30, -0.60],
    category: 'Gastronomía Tradicional',
    alias: 'Platillo Ritual Comunitario',
    title: 'CALDO DE TORO CEREMONIAL',
    nativeName: '«Caldo de Toro» · Comida de Grandes Fiestas',
    subtitle: 'PREPARACIÓN COLECTIVA EN FOGONES COMUNALES',
    image: '/texturas/cuadro_gastro_caldo_toro.jpg',
    cedulaImage: '/texturas/cedula_gastro_caldo_toro.png',
    letreroImage: '/texturas/letrero_gastro_caldo_toro.png',
    discoImage: '/texturas/disco_food_caldo.png',
    matcher: (name) => name.includes('caldo') || name.includes('toro'),
    keywords: [
      '• Alimento Comunitario para Peregrinos y Jicareros',
      '• Cocción Lenta en Grandes Ollas de Barro con Hierbas Serranas',
      '• Consagración Ritual durante el Tatei Neixa'
    ],
    description: 'El caldo de toro ceremonial es un guiso colectivo reservado para las solemnidades más trascendentes. Preparado en ollas monumentales al calor de leña viva con chiles secos y quelites serranos, nutre a toda la comunidad tras extenuantes jornadas de rezo y danza sagrada.'
  },
  {
    id: 'gastro_tamales',
    order: 3,
    stationName: 'estacion_gastro_3_tamales',
    canvasNodeName: 'lienzo_gastro_tamales',
    stationPosition: [7.20, 2.30, 0.60],
    category: 'Gastronomía Tradicional',
    alias: 'Envueltos de Mazorca',
    title: 'TAMALES DE TOTOMOXLE',
    nativeName: '«Tamales Tradicionales» de Maíz Serrano',
    subtitle: 'COCCIÓN AL VAPOR EN HOJA DE MAZORCA SECA',
    image: '/texturas/cuadro_gastro_tamales.jpg',
    cedulaImage: '/texturas/cedula_gastro_tamales.png',
    letreroImage: '/texturas/letrero_gastro_tamales.png',
    discoImage: '/texturas/disco_food_tamales.png',
    matcher: (name) => name.includes('tamal'),
    keywords: [
      '• Envoltura Sagrada en Hoja de Totomoxtle',
      '• Masa de Maíz Morado, Ceniza y Manteca Tradicional',
      '• Ofrenda Imprescindible para Deidades y Ancestros'
    ],
    description: 'Elaborados con masa sazonada envuelta cuidadosamente en hojas secas de totomoxtle. En la cosmovisión serrana, los tamales representan la protección del germen de la vida; son ofrendados en jícaras ceremoniales a los bultos sagrados antes de ser degustados en comunidad.'
  },
  {
    id: 'gastro_atole_tejuino',
    order: 4,
    stationName: 'estacion_gastro_4_atole_tejuino',
    canvasNodeName: 'lienzo_gastro_atole_tejuino',
    stationPosition: [6.80, 2.30, 1.80],
    category: 'Gastronomía Tradicional',
    alias: 'Bebida Sagrada de Nawá',
    title: 'TEJUINO Y ATOLE DE MAÍZ',
    nativeName: '«Nawá» · Tejuino Ceremonial Fermentado',
    subtitle: 'ENERGÍA ESPIRITUAL Y BEBIDA DE HERMANDAD',
    image: '/texturas/cuadro_gastro_atole_tejuino.jpg',
    cedulaImage: '/texturas/cedula_gastro_atole_tejuino.png',
    letreroImage: '/texturas/letrero_gastro_atole.png',
    discoImage: '/texturas/disco_food_atole.png',
    matcher: (name) => name.includes('tejuino') || name.includes('atole') || name.includes('nawa'),
    keywords: [
      '• Maíz Germinado y Fermentado en Ollas de Barro',
      '• Vigor Espiritual que Acompaña los Cantos del Mara\'akame',
      '• Símbolo de Unión Colectiva e Identidad Indígena'
    ],
    description: 'El tejuino tradicional (nawá) y los atoles calientes son bebidas de profunda raíz ceremonial. Su fermentación natural a base de maíz nacido proporciona la vitalidad necesaria para soportar los ayunos y vigilias nocturnas del ciclo ceremonial en la sierra de Nayarit.'
  },
  {
    id: 'gastro_perruri',
    order: 5,
    stationName: 'estacion_gastro_5_perruri',
    canvasNodeName: 'lienzo_gastro_perruri',
    stationPosition: [6.00, 2.30, 2.60],
    category: 'Gastronomía Tradicional',
    alias: 'Golosina y Ofrenda Ancestral',
    title: 'PERRURI DE SEMILLAS',
    nativeName: '«Perruri» · Maíz Tostado y Pepita Dulce',
    subtitle: 'CONFITERÍA TRADICIONAL Y ENERGÍA NATURAL',
    image: '/texturas/cuadro_gastro_perruri.jpg',
    cedulaImage: '/texturas/cedula_gastro_perruri.png',
    letreroImage: '/texturas/letrero_gastro_perruri.png',
    discoImage: '/texturas/disco_food_perruri.png',
    matcher: (name) => name.includes('perruri'),
    keywords: [
      '• Harina de Maíz Tostado Mezclada con Pepitas de Calabaza',
      '• Endulzado Natural con Piloncillo de Molienda Serrana',
      '• Alimento Energético de Alta Durabilidad'
    ],
    description: 'El perruri es una de las preparaciones más representativas del ingenio culinario indígena. Combina el grano de maíz tostado con pepitas molidas y miel o piloncillo en una pasta compacta y energética que deleita tanto a niños como a ancianos en días festivos.'
  },
  {
    id: 'gastro_maiz_tostado',
    order: 6,
    stationName: 'estacion_gastro_6_maiz_tostado',
    canvasNodeName: 'lienzo_gastro_maiz_tostado',
    stationPosition: [6.00, 2.30, -2.60],
    category: 'Gastronomía Tradicional',
    alias: 'Provisión del Peregrino',
    title: 'MAÍZ TOSTADO Y PINOLE',
    nativeName: '«Haute» · Maíz Tostado al Comal',
    subtitle: 'ALIMENTO DE TRAVESÍA HACIA WIRIKUTA',
    image: '/texturas/cuadro_gastro_maiz_tostado.jpg',
    cedulaImage: '/texturas/cedula_gastro_maiz_tostado.png',
    letreroImage: '/texturas/letrero_gastro_maiz_tostado.png',
    discoImage: '/texturas/disco_food_maiz_tostado.png',
    matcher: (name) => name.includes('tostado') || name.includes('pinole'),
    keywords: [
      '• Grano Sagrado Expandido al Fuego Vivo del Comal',
      '• Provisión Ligera y Nutricia para la Larga Marcha',
      '• Testigo de la Ruta Hacia los Santuarios del Desierto'
    ],
    description: 'Los granos de maíz tostados en comal constituyen el bastimento fundamental del caminante. Ligeros y resistentes al tiempo, son llevados en morrales de estambre por los jicareros durante su cruce por los cañones de Nayarit rumbo a Wirikuta.'
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
        art.stationName.toLowerCase() === lower ||
        art.canvasNodeName.toLowerCase() === lower ||
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
 * Lo ubica a 2.85m del centro del museo (acercado aún más al usuario en el centro, máxima inmersión en VR)
 * a una altura ergonómica de Y = 2.25m, mirando hacia el centro del museo.
 */
export function calculateArtworkModalTransform(artwork) {
  if (!artwork) {
    return { position: [0, 2.25, 3.75], rotation: [0, Math.PI, 0] };
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

  // Posicionar a 2.85m del centro del museo (acercado al usuario para máxima legibilidad y escala en visor VR)
  // a una altura ergonómica en Y = 2.25m
  const targetX = dir.x * 2.85;
  const targetY = 2.25;
  const targetZ = dir.z * 2.85;

  // Orientar hacia el centro del museo: la normal frontal (+Z) debe mirar hacia [0, 0, 0]
  // angleY = Math.atan2(-dir.x, -dir.z)
  const angleY = Math.atan2(-dir.x, -dir.z);

  return {
    position: [targetX, targetY, targetZ],
    rotation: [0, angleY, 0]
  };
}
