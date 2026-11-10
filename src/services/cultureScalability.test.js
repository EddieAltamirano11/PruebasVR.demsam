import { describe, it, expect, beforeEach } from 'vitest';
import {
  cultureRegistry,
  DEFAULT_CULTURES,
  calculateRelativeLuminance,
  calculateContrastRatio,
  isWcagCompliant,
  buildErgonomicStationLayout,
  filterContentByCulture,
  mapSupabaseCultureToVR
} from './cultureService.js';
import { filterBooksByCulture } from './recommendationsService.js';

describe('Pruebas Unitarias de Escalabilidad Multi-Cultural (Wixárika, Cora, Tepehuano, etc.)', () => {
  beforeEach(() => {
    cultureRegistry.reset();
  });

  // ==========================================================================
  // 1. REGISTRO DINÁMICO Y EXTENSIBILIDAD DE CULTURAS FUTURAS
  // ==========================================================================
  describe('1. Registro Dinámico y Extensibilidad', () => {
    it('debe contener precargadas las 4 culturas vivas originarias de Nayarit', () => {
      const cultures = cultureRegistry.getAllCultures();
      expect(cultures).toHaveLength(4);

      const ids = cultures.map((c) => c.id);
      expect(ids).toContain('wixarika');
      expect(ids).toContain('cora');
      expect(ids).toContain('tepehuano');
      expect(ids).toContain('mexicanero');
    });

    it('debe permitir consultar la cultura Cora mediante su nombre castellano o su autónimo originario (Náayeri)', () => {
      const byId = cultureRegistry.getCulture('cora');
      const byName = cultureRegistry.getCulture('Cora');
      const byAutonym = cultureRegistry.getCulture('Náayeri');

      expect(byId).toBeDefined();
      expect(byId.name).toBe('Cora');
      expect(byId.autonym).toBe('Náayeri');
      expect(byName).toEqual(byId);
      expect(byAutonym).toEqual(byId);
    });

    it('debe permitir consultar la cultura Tepehuano del Sur mediante su autónimo originario (O\'dam)', () => {
      const byId = cultureRegistry.getCulture('tepehuano');
      const byAutonym = cultureRegistry.getCulture('O\'dam');

      expect(byId).toBeDefined();
      expect(byId.name).toBe('Tepehuano del Sur');
      expect(byId.autonym).toBe('O\'dam');
      expect(byAutonym).toEqual(byId);
    });

    it('debe escalar permitiendo registrar dinámicamente nuevas culturas futuras (ej. Rarámuri, Purépecha)', () => {
      const initialCount = cultureRegistry.count;

      const raramuriCulture = {
        id: 'raramuri',
        name: 'Rarámuri',
        autonym: 'Ralámuli',
        linguisticFamily: 'Yuto-nahua (taracahita)',
        region: 'Sierra Tarahumara / Occidente',
        description: 'Pueblo de los pies ligeros y corredores de fondo ceremoniales.',
        modelGlb: './museo_raramuri_v1.glb',
        theme: {
          primaryColor: '#c2410c',
          secondaryColor: '#f97316',
          accentColor: '#15803d',
          textPrimary: '#ffffff',
          background: '#080c14',
          canteraBase: '#f4ede2'
        },
        stations: [
          {
            id: 'rar-carrera',
            stationId: 'rarajipari',
            name: 'Pabellón de la Carrera de Bola (Rarajípari)',
            subtitle: 'Resistencia cósmica y espiritual',
            iconName: 'sparkles'
          },
          {
            id: 'rar-yuma',
            stationId: 'danza-yuma',
            name: 'Pabellón de la Danza Yumari',
            subtitle: 'Agradecimiento a Onorúame',
            iconName: 'sun'
          }
        ]
      };

      const registered = cultureRegistry.registerCulture(raramuriCulture);
      expect(registered).toBeDefined();
      expect(registered.id).toBe('raramuri');
      expect(cultureRegistry.count).toBe(initialCount + 1);

      const retrieved = cultureRegistry.getCulture('raramuri');
      expect(retrieved.name).toBe('Rarámuri');
      expect(retrieved.autonym).toBe('Ralámuli');
      expect(retrieved.stations).toHaveLength(2);
    });

    it('debe permitir desregistrar o actualizar culturas en tiempo de ejecución sin reiniciar el entorno', () => {
      expect(cultureRegistry.getCulture('mexicanero')).toBeDefined();
      const removed = cultureRegistry.unregisterCulture('mexicanero');
      expect(removed).toBe(true);
      expect(cultureRegistry.getCulture('mexicanero')).toBeNull();
      expect(cultureRegistry.count).toBe(3);
    });
  });

  // ==========================================================================
  // 2. CONTRATOS DE ESQUEMA Y ROBUSTEZ ANTE DATOS MALFORMADOS
  // ==========================================================================
  describe('2. Contratos de Esquema y Validación Formal', () => {
    it('debe rechazar culturas con identificador ausente o vacío arrojando error descriptivo', () => {
      expect(() => {
        cultureRegistry.registerCulture({
          name: 'Cultura Sin Id',
          autonym: 'Test',
          theme: { primaryColor: '#fff', background: '#000' },
          stations: [{ id: 's1' }]
        });
      }).toThrow(/identificador único/i);
    });

    it('debe rechazar culturas que no definan al menos un pabellón o estación tridimensional', () => {
      expect(() => {
        cultureRegistry.registerCulture({
          id: 'incompleta',
          name: 'Incompleta',
          autonym: 'Inc',
          theme: { primaryColor: '#fff', background: '#000' },
          stations: []
        });
      }).toThrow(/al menos una estación/i);
    });

    it('debe rechazar culturas sin tema cromático básico de contraste', () => {
      expect(() => {
        cultureRegistry.registerCulture({
          id: 'sin-tema',
          name: 'Sin Tema',
          autonym: 'Sin',
          stations: [{ id: 's1' }]
        });
      }).toThrow(/tema cromático/i);
    });

    it('debe validar un esquema completo correctamente mediante validateCulture()', () => {
      const validMock = {
        id: 'otomi',
        name: 'Otomí',
        autonym: 'Hñähñu',
        theme: { primaryColor: '#2563eb', background: '#020617' },
        stations: [{ id: 's1', stationId: 'textil', name: 'Pabellón Tenango' }]
      };
      const result = cultureRegistry.validateCulture(validMock);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  // ==========================================================================
  // 3. ACCESIBILIDAD Y THEME TOKENS WCAG 2.1 AAA / AA
  // ==========================================================================
  describe('3. Theming Cromático y Accesibilidad Visual (WCAG 2.1)', () => {
    it('debe verificar que la luminancia relativa esté estrictamente normalizada entre 0.0 y 1.0', () => {
      expect(calculateRelativeLuminance('#000000')).toBe(0);
      expect(calculateRelativeLuminance('#ffffff')).toBe(1);

      const amberLum = calculateRelativeLuminance('#d97706');
      expect(amberLum).toBeGreaterThan(0);
      expect(amberLum).toBeLessThan(1);
    });

    it('debe garantizar que el texto principal sobre fondo obsidiana cumpla WCAG AAA (>= 7:1) para todas las culturas', () => {
      const cultures = cultureRegistry.getAllCultures();
      for (const culture of cultures) {
        const textHex = culture.theme.textPrimary;
        const bgHex = culture.theme.background;
        const ratio = calculateContrastRatio(textHex, bgHex);

        expect(ratio).toBeGreaterThanOrEqual(7.0);
        expect(isWcagCompliant(textHex, bgHex, 'AAA')).toBe(true);
      }
    });

    it('debe calcular el ratio de contraste adecuado para la paleta de la cultura Cora (#eab308 vs #0a0d18)', () => {
      const coraCulture = cultureRegistry.getCulture('cora');
      const ratio = calculateContrastRatio(
        coraCulture.theme.secondaryColor,
        coraCulture.theme.background
      );
      // Amarillo solar Cora sobre fondo oscuro debe superar sobradamente el estándar AA (>= 4.5:1)
      expect(ratio).toBeGreaterThanOrEqual(9.0);
    });

    it('debe calcular el ratio de contraste adecuado para la paleta de la cultura Tepehuano O\'dam', () => {
      const tepeCulture = cultureRegistry.getCulture('tepehuano');
      const textVsBg = calculateContrastRatio(
        tepeCulture.theme.textPrimary,
        tepeCulture.theme.background
      );
      expect(textVsBg).toBeGreaterThanOrEqual(15.0);
    });
  });

  // ==========================================================================
  // 4. DISPOSICIÓN ESPACIAL ERGONÓMICA EN 3D (ISO 9241-210)
  // ==========================================================================
  describe('4. Ergonomía Tridimensional de Estaciones para Futuras Culturas', () => {
    it('debe calcular posiciones 3D en arco radial a la altura de mirada del usuario (Y = 1.40 m)', () => {
      const testStations = [
        { id: 'st-1', name: 'Estación 1' },
        { id: 'st-2', name: 'Estación 2' },
        { id: 'st-3', name: 'Estación 3' }
      ];

      const positioned = buildErgonomicStationLayout(testStations, {
        radius: 2.6,
        eyeHeight: 1.40
      });

      expect(positioned).toHaveLength(3);
      for (const station of positioned) {
        expect(station.position).toBeDefined();
        expect(station.position[1]).toBe(1.40); // Y uniforme a altura ergonómica
        expect(station.rotation).toBeDefined();
      }
    });

    it('debe mantener separación física suficiente entre estaciones adyacentes para evitar solapamiento de colisionadores', () => {
      const fourStations = [
        { id: 'p1' }, { id: 'p2' }, { id: 'p3' }, { id: 'p4' }
      ];
      const positioned = buildErgonomicStationLayout(fourStations, { radius: 2.6 });

      // Calcular la distancia euclidiana 2D en el plano X-Z entre estaciones consecutivas
      for (let i = 0; i < positioned.length; i++) {
        const current = positioned[i].position;
        const next = positioned[(i + 1) % positioned.length].position;
        const dist = Math.hypot(current[0] - next[0], current[2] - next[2]);

        // Con R=2.6 y 4 estaciones, la distancia entre adyacentes es ~3.67m, muy superior a 1.5m
        expect(dist).toBeGreaterThan(1.5);
      }
    });

    it('debe limitar el radio dentro de las dimensiones del museo (<= 7.5 m) aunque se solicite un radio mayor', () => {
      const stations = [{ id: 'st-far' }];
      const positioned = buildErgonomicStationLayout(stations, { radius: 15.0, maxRadius: 7.5 });

      const [x, , z] = positioned[0].position;
      const distanceFromCenter = Math.hypot(x, z);
      expect(distanceFromCenter).toBeLessThanOrEqual(7.5);
    });

    it('debe escalar correctamente la distribución espacial para culturas con 8 estaciones simultáneas', () => {
      const eightStations = Array.from({ length: 8 }, (_, idx) => ({ id: `pabellon-${idx + 1}` }));
      const positioned = buildErgonomicStationLayout(eightStations, { radius: 3.2 });

      expect(positioned).toHaveLength(8);
      // Cada posición debe tener coordenadas finitas y únicas
      const coords = positioned.map((s) => s.position.join(','));
      const uniqueCoords = new Set(coords);
      expect(uniqueCoords.size).toBe(8);
    });
  });

  // ==========================================================================
  // 5. FILTRADO POLIMÓRFICO Y AISLAMIENTO ENTRE CULTURAS
  // ==========================================================================
  describe('5. Filtrado Polimórfico y Aislamiento de Contenido', () => {
    const multiCulturalCatalog = [
      {
        id: 'book-wix-1',
        title: "Cantos del Mara'akame",
        cultura_id: 'wixarika',
        cultura: 'Wixárika'
      },
      {
        id: 'book-wix-2',
        title: 'Wirikuta Sagrada',
        cultureId: 'wixarika',
        cultura: 'Wixárika'
      },
      {
        id: 'book-cora-1',
        title: 'Los Borrados de la Semana Santa Cora',
        cultura_id: 'cora',
        cultura: 'Cora'
      },
      {
        id: 'book-cora-2',
        title: 'Mesa del Nayar: Etnografía Náayeri',
        culture: 'cora',
        tags: ['cora', 'náayeri']
      },
      {
        id: 'book-tepe-1',
        title: 'El Xiotalh y la Medicina del Bosque',
        cultura_id: 'tepehuano',
        cultura: 'Tepehuano'
      },
      {
        id: 'book-mex-1',
        title: 'Cantos en Náhuatl de la Costa Norte',
        cultura_id: 'mexicanero',
        cultura: 'Mexicanero'
      }
    ];

    it('debe aislar estrictamente los libros de la cultura Cora sin contaminación cruzada con Wixárika o Tepehuano', () => {
      const coraBooks = filterContentByCulture(multiCulturalCatalog, 'cora');
      expect(coraBooks).toHaveLength(2);

      const titles = coraBooks.map((b) => b.title);
      expect(titles).toContain('Los Borrados de la Semana Santa Cora');
      expect(titles).toContain('Mesa del Nayar: Etnografía Náayeri');

      // Comprobar que no hay libros Wixárikas ni Tepehuanos
      expect(titles).not.toContain("Cantos del Mara'akame");
      expect(titles).not.toContain('El Xiotalh y la Medicina del Bosque');
    });

    it('debe filtrar correctamente los libros de la cultura Tepehuano del Sur', () => {
      const tepeBooks = filterContentByCulture(multiCulturalCatalog, 'tepehuano');
      expect(tepeBooks).toHaveLength(1);
      expect(tepeBooks[0].id).toBe('book-tepe-1');
    });

    it('debe retornar todo el catálogo si se solicita el comodín "all" o parámetro nulo', () => {
      expect(filterContentByCulture(multiCulturalCatalog, 'all')).toHaveLength(6);
      expect(filterContentByCulture(multiCulturalCatalog, null)).toHaveLength(6);
      expect(filterContentByCulture([], 'cora')).toHaveLength(0);
    });

    it('debe integrar perfectamente filterBooksByCulture() en el servicio de recomendaciones', () => {
      const wixBooks = filterBooksByCulture(multiCulturalCatalog, 'wixarika');
      expect(wixBooks).toHaveLength(2);

      const coraBooks = filterBooksByCulture(multiCulturalCatalog, 'cora');
      expect(coraBooks).toHaveLength(2);

      const tepeBooks = filterBooksByCulture(multiCulturalCatalog, 'tepehuano');
      expect(tepeBooks).toHaveLength(1);
    });
  });

  // ==========================================================================
  // 6. INGESTA Y MAPEO RESILIENTE DESDE BASE DE DATOS (SUPABASE)
  // ==========================================================================
  describe('6. Ingesta y Transformación desde Base de Datos Supabase', () => {
    it('debe transformar una fila de Supabase culturas al formato VR con valores normalizados', () => {
      const supabaseRow = {
        id: 12,
        nombre: 'Cora',
        slug: 'cora',
        autonimo: 'Náayeri',
        familia_linguistica: 'Yuto-nahua',
        region: 'Mesa del Nayar',
        descripcion: 'Comunidad originaria de la sierra.',
        color_primario: '#b45309',
        color_secundario: '#eab308',
        pabellones: [
          { codigo: 'mitote', nombre: 'Pabellón del Mitote', icono: 'flame' },
          { codigo: 'judea', nombre: 'Pabellón de la Judea', icono: 'shield' }
        ]
      };

      const mapped = mapSupabaseCultureToVR(supabaseRow);
      expect(mapped).toBeDefined();
      expect(mapped.id).toBe('cora');
      expect(mapped.name).toBe('Cora');
      expect(mapped.autonym).toBe('Náayeri');
      expect(mapped.theme.primaryColor).toBe('#b45309');
      expect(mapped.stations).toHaveLength(2);
      expect(mapped.stations[0].stationId).toBe('mitote');
    });

    it('debe manejar filas nulas o con campos incompletos generando fallbacks seguros', () => {
      expect(mapSupabaseCultureToVR(null)).toBeNull();

      const minimalRow = { nombre: 'Tepehuano' };
      const mapped = mapSupabaseCultureToVR(minimalRow);

      expect(mapped).toBeDefined();
      expect(mapped.id).toBe('tepehuano');
      expect(mapped.name).toBe('Tepehuano');
      expect(mapped.theme.primaryColor).toBeDefined();
      expect(mapped.stations.length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // 7. PRUEBA DE VOLUMEN Y RENDIMIENTO DE ESCALABILIDAD (STRESS / BENCHMARK)
  // ==========================================================================
  describe('7. Escalabilidad de Rendimiento con Alto Volumen de Datos', () => {
    it('debe procesar e indexar 1,000 obras distribuidas en múltiples culturas en tiempo ultra-rápido (< 50 ms)', () => {
      const cultures = ['wixarika', 'cora', 'tepehuano', 'mexicanero'];
      const largeCatalog = [];

      for (let i = 0; i < 1000; i++) {
        const cultId = cultures[i % cultures.length];
        largeCatalog.push({
          id: `book-${i}`,
          title: `Obra Cultural Num ${i}`,
          cultura_id: cultId,
          cultura: cultId.toUpperCase(),
          stock: (i % 5) + 1
        });
      }

      const getNow = () => (typeof globalThis.performance !== 'undefined' ? globalThis.performance.now() : Date.now());
      const t0 = getNow();
      const coraFiltered = filterContentByCulture(largeCatalog, 'cora');
      const tepeFiltered = filterContentByCulture(largeCatalog, 'tepehuano');
      const wixFiltered = filterContentByCulture(largeCatalog, 'wixarika');
      const t1 = getNow();

      const elapsedMs = t1 - t0;
      expect(elapsedMs).toBeLessThan(50); // Presupuesto holgado para evitar falsos positivos por fluctuaciones de CPU en CI
      expect(coraFiltered).toHaveLength(250);
      expect(tepeFiltered).toHaveLength(250);
      expect(wixFiltered).toHaveLength(250);
    });

    it('debe soportar el registro simultáneo de 50 culturas sin degradación ni pérdida de integridad', () => {
      for (let i = 1; i <= 50; i++) {
        cultureRegistry.registerCulture({
          id: `cultura-futura-${i}`,
          name: `Cultura Futura ${i}`,
          autonym: `Originaria ${i}`,
          theme: { primaryColor: '#f59e0b', background: '#0a0a0a' },
          stations: [
            { id: `s-${i}-1`, name: `Pabellón A ${i}` },
            { id: `s-${i}-2`, name: `Pabellón B ${i}` }
          ]
        });
      }

      expect(cultureRegistry.count).toBe(54); // 4 iniciales + 50 dinámicas
      const cult25 = cultureRegistry.getCulture('cultura-futura-25');
      expect(cult25).toBeDefined();
      expect(cult25.name).toBe('Cultura Futura 25');
      expect(cult25.stations).toHaveLength(2);
    });
  });
});
