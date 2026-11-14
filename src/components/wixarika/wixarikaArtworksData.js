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
    category: 'Deidad Sagrada',
    title: 'TATEWARI',
    nativeName: '«Tatewari» · Nuestro Abuelo Fuego',
    subtitle: 'TESTIGO ANCESTRAL Y GUÍA DEL MARA\'AKAME',
    image: './texturas/tatewari_nierika.png',
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
    category: 'Deidad Sagrada',
    title: 'TAYAU',
    nativeName: '«Tayau» · Nuestro Padre Sol',
    subtitle: 'FUERZA CREADORA CELESTIAL Y LUZ DEL ORIENTE',
    image: './texturas/tayau_sol_nierika.png',
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
    category: 'Deidad Sagrada',
    title: 'KAUYUMARI',
    nativeName: '«Tamats Kauyumari» · Hermano Mayor Venado Azul',
    subtitle: 'MENSAJERO DIVINO Y ESPÍRITU DEL HIKURI',
    image: './texturas/kauyumari_venado_nierika.jpg',
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
    category: 'Deidad Sagrada',
    title: 'TAKUTSI NAKAWE',
    nativeName: '«Takutsi Nakawe» · Nuestra Abuela Crecimiento',
    subtitle: 'MADRE PRIMORDIAL DE LA TIERRA Y LA FERTILIDAD',
    image: './texturas/takutsi_nakawe_nierika.jpg',
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
    category: 'Deidad Sagrada',
    title: 'TATEI NIWETSIKA',
    nativeName: '«Tatei Niwetsika» · Nuestra Madre del Maíz',
    subtitle: 'SUSTENTO SAGRADO Y MADRE DE LAS MAZORCAS',
    image: './texturas/tatei_niwetsika_nierika.jpg',
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
    category: 'Deidad Sagrada',
    title: 'TATEI HARAMARA',
    nativeName: '«Tatei Haramara» · Nuestra Madre el Océano',
    subtitle: 'ORIGEN DE TODAS LAS LLUVIAS Y PUERTA DEL PONIENTE',
    image: './texturas/tatei_haramara_mar_nierika.jpg',
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
    category: 'Fiesta Ceremonial',
    title: 'FIESTA DEL TAMBOR',
    nativeName: '«Namawita Neixa» / «Yuimakwaxa»',
    subtitle: 'CONSAGRACIÓN DE LA NIÑEZ Y EL TEPU SAGRADO',
    image: './texturas/cuadro_fiesta_tambor.jpg',
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
    category: 'Fiesta Ceremonial',
    title: 'TATEI NEIXA',
    nativeName: '«Tatei Neixa» · Danza de los Primeros Frutos',
    subtitle: 'GRATITUD POR LA PRIMERA COSECHA DEL COAMIL',
    image: './texturas/cuadro_fiesta_tatei_neixa.jpg',
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
    category: 'Fiesta Ceremonial',
    title: 'HIKURI NEIXA',
    nativeName: '«Hikuri Neixa» · Danza Sagrada del Peyote',
    subtitle: 'RETORNO DE WIRIKUTA Y RENOVACIÓN CÓSMICA',
    image: './texturas/cuadro_fiesta_hikuri_neixa.jpg',
    matcher: (name) => name.includes('hikuri_neixa') || name.includes('fiesta_3'),
    keywords: [
      '• Fiesta Cumbre del Retorno de la Peregrinación',
      '• Comunión Colectiva con el Hikuri Sagrado',
      '• Cantos Epopeyicos de Creación del Universo'
    ],
    description: 'Celebración solemne que marca el regreso triunfal de los peregrinos (jicareros) desde el desierto de Wirikuta cargando la medicina sagrada. Durante días y noches se entonan cantos cosmogónicos milenarios y se danza sin cesar, consumando la purificación colectiva y asegurando las lluvias venideras.'
  }
];

/**
 * Busca y retorna la obra correspondiente al nombre de una malla o id
 */
export function findArtworkByNodeName(nodeName) {
  if (!nodeName) return null;
  const lower = nodeName.toLowerCase();
  return WIXARIKA_ARTWORKS.find((art) => art.matcher(lower)) || null;
}

export function getArtworkById(id) {
  return WIXARIKA_ARTWORKS.find((art) => art.id === id) || null;
}
