import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Text } from '@react-three/drei';
import { SoundFX } from '../../services/audioService.js';
import { TsikuriDiamond } from './TsikuriDiamond.jsx';
import { LucideVRIcon } from './LucideVRIcon.jsx';
import { WixarikaVRButton } from './WixarikaVRButton.jsx';
import { BadgeCloseButton } from './BadgeCloseButton.jsx';
import { WixarikaVRVideoPlayer } from './WixarikaVRVideoPlayer.jsx';
import { DEFAULT_WIXARIKA_VIDEOS } from './WixarikaVRVideoPanel.jsx';
import * as THREE from 'three';
import { DEFAULT_WIXARIKA_BOOKS } from './WixarikaVRBookPanel.jsx';
import { fetchRecommendedBooks } from '../../services/bookService.js';

/**
 * Subcomponente para renderizar la portada del libro con textura segura.
 * Similar a ArtworkPhoto de WixarikaArtworkModal.
 */
function DashboardBookCover({ url, width = 1.88, height = 2.60 }) {
  const [loadedTexture, setLoadedTexture] = useState(null);

  useEffect(() => {
    if (!url) {
      setLoadedTexture(null);
      return;
    }

    const cleanUrl = url.startsWith('.') ? url.replace(/^\./, '') : url;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    let isMounted = true;

    loader.load(
      cleanUrl,
      (tex) => {
        if (!isMounted) return;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = true;
        tex.anisotropy = 8;
        setLoadedTexture(tex);
      },
      undefined,
      (err) => console.warn('Error cargando portada de libro en dashboard:', err)
    );

    return () => {
      isMounted = false;
      if (loadedTexture) loadedTexture.dispose();
    };
  }, [url]);

  return (
    <mesh position={[0, 0, 0.004]}>
      <planeGeometry args={[width, height]} />
      {loadedTexture ? (
        <meshBasicMaterial
          map={loadedTexture}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      ) : (
        <meshBasicMaterial color="#e7dec8" side={THREE.DoubleSide} />
      )}
    </mesh>
  );
}

/**
 * Subcomponente para renderizar la fotografía de referencia en la tarjeta de dos columnas.
 */
function ReferenceCardImage({ url, width = 2.40, height = 1.28 }) {
  const [loadedTexture, setLoadedTexture] = useState(null);

  useEffect(() => {
    if (!url) {
      setLoadedTexture(null);
      return;
    }

    const cleanUrl = url.startsWith('.') ? url.replace(/^\./, '') : url;
    const loader = new THREE.TextureLoader();
    let isMounted = true;

    loader.load(
      cleanUrl,
      (tex) => {
        if (!isMounted) return;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = true;
        setLoadedTexture(tex);
      },
      undefined,
      (err) => console.warn('Error cargando imagen de referencia:', err)
    );

    return () => {
      isMounted = false;
      if (loadedTexture) loadedTexture.dispose();
    };
  }, [url]);

  return (
    <mesh position={[0, 0, 0.003]}>
      <planeGeometry args={[width, height]} />
      {loadedTexture ? (
        <meshBasicMaterial map={loadedTexture} toneMapped={false} side={THREE.DoubleSide} />
      ) : (
        <meshBasicMaterial color="#e7dec8" side={THREE.DoubleSide} />
      )}
    </mesh>
  );
}

/**
 * Catálogo oficial de Referencias Etnográficas y Bibliográficas
 * Mismas imágenes que los cuadros para Deidades y Fiestas;
 * links genéricos e iconos para Gastronomía según especificación.
 */
export const WIXARIKA_REFERENCES = {
  deidades: [
    {
      id: 'ref-deidad-tatewari',
      title: 'TATEWARI · NUESTRO ABUELO FUEGO',
      image: '/texturas/tatewari_nierika.png',
      reference: 'Colección Etnográfica del Museo Nacional de Antropología (INAH). Nierika ceremonial de estambre sobre madera.',
      link: 'https://www.mna.inah.gob.mx'
    },
    {
      id: 'ref-deidad-tayau',
      title: 'TAYAU · NUESTRO PADRE SOL',
      image: '/texturas/tayau_sol_nierika.png',
      reference: 'Acervo Etnográfico del Centro Cultural de las Huastecas e INAH Nayarit. Cuadro sagrado de Wirikuta.',
      link: 'https://lugares.inah.gob.mx'
    },
    {
      id: 'ref-deidad-kauyumari',
      title: 'KAUYUMARI · VENADO AZUL',
      image: '/texturas/kauyumari_venado_nierika.jpg',
      reference: 'Archivo Etnográfico INPI. Tabla sagrada de estambre elaborada por Mara\'akames de Santa Catarina Cuexcomatitlán.',
      link: 'https://www.gob.mx/inpi'
    },
    {
      id: 'ref-deidad-takutsi',
      title: 'TAKUTSI NAKAWE · ABUELA CRECIMIENTO',
      image: '/texturas/takutsi_nakawe_nierika.jpg',
      reference: 'Acervo Etnológico del Museo Regional de Nayarit (INAH). Nierika tradicional de la Madre de la Tierra y la Fertilidad.',
      link: 'https://inah.gob.mx'
    },
    {
      id: 'ref-deidad-niwetsika',
      title: 'TATEI NIWETSIKA · MADRE DEL MAÍZ',
      image: '/texturas/tatei_niwetsika_nierika.jpg',
      reference: 'Consejo Estatal para la Cultura y las Artes de Nayarit (CECAN) & INAH. Ofrenda ritual del maíz cósmico.',
      link: 'https://cecan.nayarit.gob.mx'
    },
    {
      id: 'ref-deidad-haramara',
      title: 'TATEI HARAMARA · NUESTRA MADRE EL OCÉANO',
      image: '/texturas/tatei_haramara_mar_nierika.jpg',
      reference: 'Archivo Fotográfico Comunitario del Gran Nayar & Santuario Marino de Waxiewe (San Blas, Nayarit).',
      link: 'https://lugares.inah.gob.mx'
    }
  ],
  fiestas: [
    {
      id: 'ref-fiesta-tambor',
      title: 'FIESTA DEL TAMBOR · NAMAWITA NEIXA',
      image: '/texturas/cuadro_fiesta_tambor.jpg',
      reference: 'Registro Etnográfico de Fiestas y Rituales del Kalihuey (INAH Nayarit). Fototeca Nacional INAH, Fondo Culturas Indígenas.',
      link: 'https://fototeca.inah.gob.mx'
    },
    {
      id: 'ref-fiesta-tatei',
      title: 'TATEI NEIXA · PRIMEROS FRUTOS',
      image: '/texturas/cuadro_fiesta_tatei_neixa.jpg',
      reference: 'Acervo de Tradiciones Vivas del Gran Nayar (INPI). Documentación ceremonial del Kalihuey en la Sierra Madre Occidental.',
      link: 'https://www.gob.mx/inpi'
    },
    {
      id: 'ref-fiesta-hikuri',
      title: 'HIKURI NEIXA · DANZA SAGRADA DEL PEYOTE',
      image: '/texturas/cuadro_fiesta_hikuri_neixa.jpg',
      reference: 'Registro Audiovisual y Etnográfico de la Ruta Huicot (CECAN / INAH). Ceremonia comunitaria del retorno de Wirikuta.',
      link: 'https://cecan.nayarit.gob.mx'
    }
  ],
  gastronomia: [
    {
      id: 'ref-gastro-tortillas',
      title: 'TORTILLAS DE MAÍZ CRIOLLO',
      image: '/gastronomia/gastro_tortillas.png',
      reference: 'El Souvenir. Tradición culinaria y maíz criollo azul en los coamiles de Nayarit.',
      link: 'https://elsouvenir.com/la-cultura-huichol-de-la-sierra-wirrarika-de-nayarit/'
    },
    {
      id: 'ref-gastro-tamales',
      title: 'TAMALES DE TOTOMOXLE',
      image: '/gastronomia/gastro_tamales.jpg',
      reference: 'Fundación Causa Azul. Tamales ceremoniales envueltos en hojas de totomoxtle.',
      link: 'https://www.fundacioncausaazul.org/es-es/blog/detras-de-una-artesania/honrando-la-memoria-cosmovision-wixarika'
    },
    {
      id: 'ref-gastro-atole',
      title: 'ATOLE SECO DE MAÍZ (NAWÁ)',
      image: '/gastronomia/gastro_atole.jpg',
      reference: 'Registro Comunitario. Preparación tradicional de atole seco de maíz en jícaras.',
      link: 'https://www.youtube.com/watch?v=meHGpPLrDaU'
    },
    {
      id: 'ref-gastro-maiz',
      title: 'MAÍZ TOSTADO Y MAÍCES CRIOLLOS',
      image: '/gastronomia/gastro_maiz_tostado.jpg',
      reference: 'Fundación Causa Azul & El Souvenir. Maíz criollo sagrado y bastimento para Wirikuta.',
      link: 'https://www.fundacioncausaazul.org/es-es/blog/detras-de-una-artesania/honrando-la-memoria-cosmovision-wixarika'
    }
  ],
  libros: [
    {
      id: 'ref-libro-relatos-huicholes',
      title: 'RELATOS HUICHOLES',
      image: '/portadas/portada_relatos_huicholes.jpg',
      reference: 'Mondragón, L., Tello, J. y Valdez, A. (Compiladoras). (1996). Relatos Huicholes. México: CONACULTA. ISBN: 968-29-8518-8. Colección de la Biblioteca Pública Profesor Solón Argüello (Tepic, Nayarit).',
      link: 'https://bibliotecanacional.cultura.gob.mx'
    },
    {
      id: 'ref-libro-cultura-desafios',
      title: 'LA CULTURA WIXÁRIKA ANTE LOS DESAFÍOS DEL MUNDO ACTUAL',
      image: '/portadas/portada_cultura_wixarika_desafios.jpg',
      reference: 'Corona Berkin, S. y Le Mûr, R. (Coordinadoras). (2015). La cultura wixárika ante los desafíos del mundo actual. México: CONACULTA. ISBN: 978-607-8423-62-0. Acervo de la Biblioteca Pública Profesor Solón Argüello (Tepic, Nayarit).',
      link: 'https://bibliotecanacional.cultura.gob.mx'
    }
  ]
};

// Color unificado ceremonial para TODOS los iconos del menú principal
const UNIFIED_ICON_COLOR = '#b45309';

// Estaciones culturales oficiales para navegación integrada dentro del menú principal
export const DEFAULT_CULTURAL_STATIONS = [
  {
    id: 'deidades',
    name: 'Pabellón de Deidades',
    subtitle: 'Cosmovisión y Panteón Sagrado',
    iconName: 'sun',
    bullets: [
      '• Tatewari: Abuelo Fuego Sagrado y Testigo Ancestral',
      '• Tayau: Padre Sol y Fuerza Creadora del Universo',
      '• Kauyumari: Venado Azul y Guía Espiritual del Mara\'akame'
    ],
    description: '• Tatewari: Abuelo Fuego Sagrado\n• Tayau: Padre Sol y Fuerza Creadora\n• Kauyumari: Venado Azul y Guía Espiritual'
  },
  {
    id: 'gastronomia',
    name: 'Pabellón Gastronómico',
    subtitle: 'Alimentos Tradicionales de Nayarit',
    iconName: 'utensils',
    bullets: [
      '• Maíz Criollo Sagrado y Tortillas Ceremoniales de Comal',
      '• Caldo de Toro Sagrado y Tamales Totomoxtle de la Sierra',
      '• Tejuino Ritual Fermentado y Perruri de Semillas Tostadas'
    ],
    description: '• Maíz Criollo Sagrado y Tortillas de Comal\n• Caldo de Toro Ceremonial y Tamales Totomoxtle\n• Tejuino Ritual y Perruri de Semillas'
  },
  {
    id: 'fiestas',
    name: 'Pabellón de Fiestas y Ritos',
    subtitle: 'Ceremonias de la Sierra',
    iconName: 'sparkles',
    bullets: [
      '• Fiesta del Tambor: Protección y Consagración de la Niñez',
      '• Tatei Neixa: Danza de Bendición de los Primeros Frutos',
      '• Hikuri Neixa: Danza Sagrada del Peyote en el Kalihuey'
    ],
    description: '• Fiesta del Tambor: Protección de la Niñez\n• Tatei Neixa: Bendición de Primeros Frutos\n• Hikuri Neixa: Danza Sagrada del Peyote'
  }
];

/**
 * Botón interactivo para el Dashboard con fondo claro de cantera,
 * icono vectorial Lucide unificado y soporte completo para Gaze Fuse (1.2s) y clics.
 * Dimensiones ampliadas horizontal y verticalmente con tipografía maximizada para VR.
 */
function DashboardTile({
  id,
  title,
  iconName,
  accentColor = UNIFIED_ICON_COLOR,
  width = 1.80,
  height = 0.88,
  iconSize = 0.26,
  titleSize = 0.125,
  position = [0, 0, 0],
  onClick,
  registerMesh,
  unregisterMesh,
  hoveredId,
  fuseProgress = 0
}) {
  const meshRef = useRef();
  const isHovered = hoveredId === id;

  useEffect(() => {
    const mesh = meshRef.current;
    if (mesh) {
      mesh.userData = { id, onClick, onSelect: onClick };
      if (registerMesh) registerMesh(mesh);
    }
    return () => {
      if (mesh && unregisterMesh) unregisterMesh(mesh);
    };
  }, [id, onClick, registerMesh, unregisterMesh]);

  const handleClick = (e) => {
    e.stopPropagation?.();
    try {
      SoundFX.playClick();
    } catch (_err) {
      // Audio playback best-effort
    }
    if (onClick) onClick();
  };

  const handlePointerOver = (e) => {
    e.stopPropagation?.();
    try {
      SoundFX.playHover();
    } catch (_err) {
      // Audio playback best-effort
    }
  };

  // Colores claros inspirados en cantera de Tepic y oro ceremonial (cero negros)
  const bgIdle = '#fbf7ee';
  const bgHover = '#f3ebd6';
  const currentBg = isHovered ? bgHover : bgIdle;
  const borderColor = isHovered ? accentColor : '#d4af37';

  // Centrado vertical dinámico y proporcionado de icono y título
  const iconY = height * 0.16;
  const titleY = -height * 0.22;

  return (
    <group position={position}>
      {/* Marco de oro bruñido exterior */}
      <mesh position={[0, 0, -0.001]}>
        <planeGeometry args={[width + 0.030, height + 0.030]} />
        <meshBasicMaterial color={borderColor} />
      </mesh>

      {/* Superficie de cantera clara (colisionador raycaster) */}
      <mesh
        ref={meshRef}
        onPointerDown={(e) => e.stopPropagation?.()}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        position={[0, 0, 0]}
      >
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color={currentBg} />
      </mesh>

      {/* Rombos protectores Tsikuri en esquinas */}
      <group position={[0, 0, 0.003]}>
        <TsikuriDiamond
          size={0.055}
          position={[-width / 2 + 0.055, height / 2 - 0.055, 0]}
          colors={['#d4af37', accentColor, '#ffffff']}
        />
        <TsikuriDiamond
          size={0.055}
          position={[width / 2 - 0.055, height / 2 - 0.055, 0]}
          colors={['#d4af37', accentColor, '#ffffff']}
        />
        <TsikuriDiamond
          size={0.055}
          position={[-width / 2 + 0.055, -height / 2 + 0.055, 0]}
          colors={['#d4af37', accentColor, '#ffffff']}
        />
        <TsikuriDiamond
          size={0.055}
          position={[width / 2 - 0.055, -height / 2 + 0.055, 0]}
          colors={['#d4af37', accentColor, '#ffffff']}
        />
      </group>

      {/* Barra de progreso de Gaze Fuse */}
      {isHovered && fuseProgress > 0 && (
        <group position={[0, -height / 2 + 0.026, 0.005]}>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[width * 0.90, 0.024]} />
            <meshBasicMaterial color="#e7dec8" />
          </mesh>
          <mesh
            position={[-((width * 0.90) * (1 - fuseProgress)) / 2, 0, 0.001]}
            scale={[fuseProgress, 1, 1]}
          >
            <planeGeometry args={[width * 0.90, 0.022]} />
            <meshBasicMaterial color={accentColor} />
          </mesh>
        </group>
      )}

      {/* Icono Lucide vectorial nítido en alta resolución */}
      <LucideVRIcon
        name={iconName}
        size={iconSize}
        color={accentColor}
        position={[0, iconY, 0.004]}
        strokeWidth={2.6}
      />

      {/* Título de la opción en carbón oscuro con tamaño amplio para legibilidad VR */}
      <Text
        position={[0, titleY, 0.005]}
        fontSize={titleSize}
        color="#1c1917"
        anchorX="center"
        anchorY="middle"
        maxWidth={width * 0.92}
        textAlign="center"
        lineHeight={1.12}
      >
        {title}
      </Text>
    </group>
  );
}

/**
 * WixarikaWelcomeDashboard - Menú Principal Flotante Único del Museo
 * Ubicado en el cuadrante Sur (+Z) del Kalihuey Sagrado.
 * Ahora actúa como el ÚNICO menú flotante del museo: todas las salas, videos y libros
 * se exploran dentro de su superficie con sub-vistas modulares y botón de retorno.
 * Elevado ergonómicamente a Y = 2.30m y situado más atrás a Z = 3.75m con escala monumental 6.40m × 3.50m.
 */
export function WixarikaWelcomeDashboard({
  position = [0, 2.30, 3.75],
  rotation = [0, Math.PI, 0],
  initialView = 'home',
  stations: _stations = DEFAULT_CULTURAL_STATIONS,
  videos = DEFAULT_WIXARIKA_VIDEOS,
  books: _books = DEFAULT_WIXARIKA_BOOKS,
  onToggleAudio,
  onRecenter: _onRecenter,
  onSelectStation,
  onClose,
  registerMesh,
  unregisterMesh,
  hoveredId,
  fuseProgress = 0
}) {
  // Dimensiones monumentales y ergonómicas que aprovechan todo el espacio frontal
  const panelWidth = 6.40;
  const panelHeight = 3.50;
  const dashboardBgMeshRef = useRef();

  // Registrar el fondo del menú principal como bloqueador de raycast para que
  // ninguna mirada o pulsación sobre el menú atraviese hacia cuadros detrás.
  useEffect(() => {
    const mesh = dashboardBgMeshRef.current;
    if (mesh) {
      mesh.userData = {
        id: 'dashboard-backdrop-blocker',
        isBlocker: true
      };
      registerMesh?.(mesh);
    }
    return () => {
      if (mesh) unregisterMesh?.(mesh);
    };
  }, [registerMesh, unregisterMesh]);

  // Estado de navegación interna: 'home' | 'about' | 'videos' | 'books'
  const [currentView, setCurrentView] = useState(initialView);
  const [isAudioActive, setIsAudioActive] = useState(false);

  // Sincronizar vista si el componente padre cambia initialView (ej. 'home' vs 'about')
  useEffect(() => {
    if (initialView) {
      setCurrentView(initialView);
    }
  }, [initialView]);

  const handleClose = useCallback(() => {
    SoundFX.playClick();
    setCurrentView('home');
    onClose?.();
  }, [onClose]);

  // Estados para sub-vista de libros con datos de Supabase / fallback local
  const [loadedBooks, setLoadedBooks] = useState(_books || DEFAULT_WIXARIKA_BOOKS);
  const [bookIndex, setBookIndex] = useState(0);

  useEffect(() => {
    const abortCtrl = new AbortController();
    fetchRecommendedBooks(abortCtrl.signal).then((remoteBooks) => {
      if (remoteBooks && remoteBooks.length > 0) {
        setLoadedBooks(remoteBooks);
      }
    });
    return () => abortCtrl.abort();
  }, []);

  const totalBooks = loadedBooks.length;
  const currentBook = loadedBooks[bookIndex] || loadedBooks[0] || DEFAULT_WIXARIKA_BOOKS[0];

  const handlePrevBook = useCallback(() => {
    SoundFX.playClick();
    setBookIndex((prev) => (prev - 1 + totalBooks) % totalBooks);
  }, [totalBooks]);

  const handleNextBook = useCallback(() => {
    SoundFX.playClick();
    setBookIndex((prev) => (prev + 1) % totalBooks);
  }, [totalBooks]);

  // Estados para sub-vista de videos
  const [videoIndex, setVideoIndex] = useState(0);
  const [videoQuality, setVideoQuality] = useState('720p');
  const [videoCinemaMode, setVideoCinemaMode] = useState(false);

  const currentVideo = videos[videoIndex] || videos[0];
  const totalVideos = videos.length;

  const handleToggleAudio = useCallback(() => {
    SoundFX.playClick();
    setIsAudioActive((prev) => !prev);
    if (onToggleAudio) onToggleAudio();
  }, [onToggleAudio]);

  const handlePrevVideo = useCallback(() => {
    SoundFX.playClick();
    setVideoIndex((prev) => (prev - 1 + totalVideos) % totalVideos);
  }, [totalVideos]);

  const handleNextVideo = useCallback(() => {
    SoundFX.playClick();
    setVideoIndex((prev) => (prev + 1) % totalVideos);
  }, [totalVideos]);

  const handleReturnHome = useCallback(() => {
    SoundFX.playClick();
    setCurrentView('home');
    onSelectStation?.('home');
  }, [onSelectStation]);

  const handleReturnToAbout = useCallback(() => {
    SoundFX.playClick();
    setCurrentView('about');
  }, []);

  // Estados y navegación para la vista de Referencias en 2 columnas verticales con paginación
  const [activeRefCategory, setActiveRefCategory] = useState('deidades');
  const [refPageIndex, setRefPageIndex] = useState(0);

  const refItems = WIXARIKA_REFERENCES[activeRefCategory] || [];
  const totalRefPages = Math.max(1, Math.ceil(refItems.length / 2));
  const currentRefItems = refItems.slice(refPageIndex * 2, refPageIndex * 2 + 2);

  const handlePrevRefPage = useCallback(() => {
    SoundFX.playClick();
    setRefPageIndex((prev) => (prev - 1 + totalRefPages) % totalRefPages);
  }, [totalRefPages]);

  const handleNextRefPage = useCallback(() => {
    SoundFX.playClick();
    setRefPageIndex((prev) => (prev + 1) % totalRefPages);
  }, [totalRefPages]);

  const handleOpenRefCategory = useCallback((category) => {
    SoundFX.playClick();
    setActiveRefCategory(category);
    setRefPageIndex(0);
    setCurrentView('references_detail');
  }, []);

  return (
    <group position={position} rotation={rotation}>
      {/* 1. Marco exterior de madera de nogal ceremonial */}
      <mesh position={[0, 0, -0.003]}>
        <planeGeometry args={[panelWidth + 0.08, panelHeight + 0.08]} />
        <meshBasicMaterial color="#5c381e" />
      </mesh>

      {/* 2. Bisel perimetral de oro bruñido */}
      <mesh position={[0, 0, -0.002]}>
        <planeGeometry args={[panelWidth + 0.03, panelHeight + 0.03]} />
        <meshBasicMaterial color="#c69214" />
      </mesh>

      {/* 3. Superficie principal de Cantera Clara / Marfil (bloquea raycast y clics hacia cuadros detrás) */}
      <mesh
        ref={dashboardBgMeshRef}
        position={[0, 0, 0]}
        onPointerDown={(e) => e.stopPropagation?.()}
        onClick={(e) => e.stopPropagation?.()}
      >
        <planeGeometry args={[panelWidth, panelHeight]} />
        <meshBasicMaterial color="#faf6eb" transparent opacity={0.97} side={THREE.DoubleSide} />
      </mesh>

      {/* 4. Rombos protectores Tsikuri en las 4 esquinas del panel monumental */}
      <group position={[0, 0, 0.004]}>
        <TsikuriDiamond
          size={0.110}
          position={[-panelWidth / 2 + 0.110, panelHeight / 2 - 0.110, 0]}
          colors={['#c69214', UNIFIED_ICON_COLOR, '#ffffff']}
        />
        <TsikuriDiamond
          size={0.110}
          position={[panelWidth / 2 - 0.110, panelHeight / 2 - 0.110, 0]}
          colors={['#c69214', UNIFIED_ICON_COLOR, '#ffffff']}
        />
        <TsikuriDiamond
          size={0.110}
          position={[-panelWidth / 2 + 0.110, -panelHeight / 2 + 0.110, 0]}
          colors={['#c69214', UNIFIED_ICON_COLOR, '#ffffff']}
        />
        <TsikuriDiamond
          size={0.110}
          position={[panelWidth / 2 - 0.110, -panelHeight / 2 + 0.110, 0]}
          colors={['#c69214', UNIFIED_ICON_COLOR, '#ffffff']}
        />
      </group>

      {/* Botón Badge de Cierre con cruz 'x' en la esquina superior derecha */}
      <BadgeCloseButton
        id="btn-dash-close-top"
        size={0.36}
        position={[panelWidth / 2 - 0.32, panelHeight / 2 - 0.32, 0.01]}
        onClick={handleClose}
        registerMesh={registerMesh}
        unregisterMesh={unregisterMesh}
        hoveredId={hoveredId}
        fuseProgress={fuseProgress}
      />

      {/* ===================================================================== */}
      {/* VISTA A: MENÚ PRINCIPAL DE BIENVENIDA (HOME - 3 CARDS CULTURALES)      */}
      {/* ===================================================================== */}
      {currentView === 'home' && (
        <group position={[0, 0, 0.005]}>
          {/* Cabecera Monumental del Dashboard */}
          <group position={[0, 0.98, 0]}>
            <LucideVRIcon
              name="compass"
              size={0.28}
              color={UNIFIED_ICON_COLOR}
              position={[0, 0.28, 0]}
              strokeWidth={2.6}
            />

            <Text
              position={[0, 0.00, 0]}
              fontSize={0.220}
              color="#1c1917"
              anchorX="center"
              anchorY="middle"
              maxWidth={panelWidth * 0.94}
              textAlign="center"
            >
              MUSEO VIRTUAL WIXÁRIKA
            </Text>

            <Text
              position={[0, -0.26, 0]}
              fontSize={0.130}
              color="#78350f"
              anchorX="center"
              anchorY="middle"
              maxWidth={panelWidth * 0.94}
              textAlign="center"
            >
              BIBLIOTECA SOLÓN ARGÜELLO
            </Text>
          </group>

          {/* Línea divisoria dorada ceremonial */}
          <mesh position={[0, 0.52, 0]}>
            <planeGeometry args={[panelWidth * 0.88, 0.008]} />
            <meshBasicMaterial color="#d4af37" side={THREE.DoubleSide} />
          </mesh>

          {/* Fila Única: Servicios y Catálogos Culturales (3 cards centradas verticalmente) */}
          <group position={[0, -0.22, 0]}>
            <DashboardTile
              key="btn-dash-books"
              id="btn-dash-books"
              title="Libros Recomendados"
              iconName="book-open"
              accentColor={UNIFIED_ICON_COLOR}
              width={1.84}
              height={1.15}
              iconSize={0.30}
              titleSize={0.140}
              position={[-1.98, 0, 0]}
              onClick={() => setCurrentView('books')}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
            />

            <DashboardTile
              key="btn-dash-audio"
              id="btn-dash-audio"
              title={isAudioActive ? 'Audio: Activo' : 'Audio Cultural'}
              iconName={isAudioActive ? 'volume-2' : 'volume-x'}
              accentColor={UNIFIED_ICON_COLOR}
              width={1.84}
              height={1.15}
              iconSize={0.30}
              titleSize={0.140}
              position={[0, 0, 0]}
              onClick={handleToggleAudio}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
            />

            <DashboardTile
              key="btn-dash-videos"
              id="btn-dash-videos"
              title="Videos Culturales"
              iconName="video"
              accentColor={UNIFIED_ICON_COLOR}
              width={1.84}
              height={1.15}
              iconSize={0.30}
              titleSize={0.140}
              position={[1.98, 0, 0]}
              onClick={() => setCurrentView('videos')}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
            />
          </group>

          {/* Pie de página con guía de interacción por mirada */}
          <group position={[0, -1.35, 0]}>
            <group position={[-2.20, 0, 0]}>
              <LucideVRIcon
                name="eye"
                size={0.135}
                color={UNIFIED_ICON_COLOR}
                position={[0, 0, 0.002]}
                strokeWidth={2.4}
              />
            </group>
            <Text
              position={[0.12, 0, 0]}
              fontSize={0.122}
              color="#78350f"
              anchorX="center"
              anchorY="middle"
              maxWidth={panelWidth * 0.78}
              textAlign="center"
            >
              Fija tu mirada durante 3 segundos o pulsa el botón para interactuar
            </Text>
          </group>
        </group>
      )}

      {/* ===================================================================== */}
      {/* VISTA B: REFERENCIAS CULTURALES (DEIDADES, GASTRONOMÍA, FIESTAS)       */}
      {/* ===================================================================== */}
      {currentView === 'about' && (
        <group position={[0, 0, 0.005]}>
          {/* Barra Superior con botón Volver al Menú (solo flecha <-) y Título REFERENCIAS */}
          <group position={[0, 1.48, 0]}>
            <WixarikaVRButton
              id="btn-ref-back-top"
              iconName="arrow-left"
              variant="cantera"
              width={0.42}
              height={0.26}
              position={[-2.75, 0, 0]}
              onClick={handleReturnHome}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />

            <Text
              position={[0, 0.02, 0]}
              fontSize={0.210}
              color="#1c1917"
              anchorX="center"
              anchorY="middle"
              maxWidth={panelWidth * 0.70}
              textAlign="center"
            >
              REFERENCIAS
            </Text>
          </group>

          {/* Cuatro Tarjetas Culturales de Referencias (Deidades, Gastronomía, Fiestas, Libros) */}
          <group position={[0, -0.18, 0]}>
            <DashboardTile
              key="btn-ref-deidades"
              id="btn-ref-deidades"
              title="Deidades"
              iconName="sun"
              accentColor={UNIFIED_ICON_COLOR}
              width={1.28}
              height={1.15}
              iconSize={0.28}
              titleSize={0.120}
              position={[-2.07, 0, 0]}
              onClick={() => handleOpenRefCategory('deidades')}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
            />

            <DashboardTile
              key="btn-ref-gastronomia"
              id="btn-ref-gastronomia"
              title="Gastronomía"
              iconName="utensils"
              accentColor={UNIFIED_ICON_COLOR}
              width={1.28}
              height={1.15}
              iconSize={0.28}
              titleSize={0.120}
              position={[-0.69, 0, 0]}
              onClick={() => handleOpenRefCategory('gastronomia')}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
            />

            <DashboardTile
              key="btn-ref-fiestas"
              id="btn-ref-fiestas"
              title="Fiestas"
              iconName="sparkles"
              accentColor={UNIFIED_ICON_COLOR}
              width={1.28}
              height={1.15}
              iconSize={0.28}
              titleSize={0.120}
              position={[0.69, 0, 0]}
              onClick={() => handleOpenRefCategory('fiestas')}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
            />

            <DashboardTile
              key="btn-ref-libros"
              id="btn-ref-libros"
              title="Acervo Libros"
              iconName="book-open"
              accentColor={UNIFIED_ICON_COLOR}
              width={1.28}
              height={1.15}
              iconSize={0.28}
              titleSize={0.120}
              position={[2.07, 0, 0]}
              onClick={() => handleOpenRefCategory('libros')}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
            />
          </group>

          {/* Pie de página con guía de interacción por mirada */}
          <group position={[0, -1.35, 0]}>
            <group position={[-2.20, 0, 0]}>
              <LucideVRIcon
                name="eye"
                size={0.135}
                color={UNIFIED_ICON_COLOR}
                position={[0, 0, 0.002]}
                strokeWidth={2.4}
              />
            </group>
            <Text
              position={[0.12, 0, 0]}
              fontSize={0.122}
              color="#78350f"
              anchorX="center"
              anchorY="middle"
              maxWidth={panelWidth * 0.78}
              textAlign="center"
            >
              Fija tu mirada durante 3 segundos o pulsa el botón para interactuar
            </Text>
          </group>
        </group>
      )}

      {/* ===================================================================== */}
      {/* VISTA E: DETALLE DE REFERENCIAS (2 CARDS VERTICALES CON PAGINACIÓN)   */}
      {/* ===================================================================== */}
      {currentView === 'references_detail' && (
        <group position={[0, 0, 0.005]}>
          {/* Barra Superior con botón Volver a Referencias (solo flecha <-) y Título de Sección */}
          <group position={[0, 1.48, 0]}>
            <WixarikaVRButton
              id="btn-ref-detail-back-top"
              iconName="arrow-left"
              variant="cantera"
              width={0.42}
              height={0.26}
              position={[-2.75, 0, 0]}
              onClick={handleReturnToAbout}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />

            <Text
              position={[0, 0.02, 0]}
              fontSize={0.200}
              color="#1c1917"
              anchorX="center"
              anchorY="middle"
              maxWidth={panelWidth * 0.70}
              textAlign="center"
            >
              {activeRefCategory === 'deidades'
                ? 'REFERENCIAS · DEIDADES SAGRADAS'
                : activeRefCategory === 'gastronomia'
                ? 'REFERENCIAS · GASTRONOMÍA TRADICIONAL'
                : activeRefCategory === 'fiestas'
                ? 'REFERENCIAS · FIESTAS Y CEREMONIAS'
                : 'REFERENCIAS · ACERVO BIBLIOGRÁFICO'}
            </Text>
          </group>

          {/* Dos Tarjetas Verticales por Pantalla */}
          <group position={[0, -0.04, 0]}>
            {currentRefItems.map((item, idx) => {
              const cardX = idx === 0 ? (currentRefItems.length === 1 ? 0 : -1.52) : 1.52;
              const cardWidth = 2.64;
              const cardHeight = 2.36;

              return (
                <group key={item.id} position={[cardX, 0, 0]}>
                  {/* Marco exterior de madera de nogal ceremonial */}
                  <mesh position={[0, 0, -0.002]}>
                    <planeGeometry args={[cardWidth + 0.04, cardHeight + 0.04]} />
                    <meshBasicMaterial color="#5c381e" side={THREE.DoubleSide} />
                  </mesh>

                  {/* Bisel perimetral de oro bruñido */}
                  <mesh position={[0, 0, -0.001]}>
                    <planeGeometry args={[cardWidth, cardHeight]} />
                    <meshBasicMaterial color="#c69214" side={THREE.DoubleSide} />
                  </mesh>

                  {/* Superficie de cantera clara */}
                  <mesh position={[0, 0, 0]}>
                    <planeGeometry args={[cardWidth - 0.04, cardHeight - 0.04]} />
                    <meshBasicMaterial color="#fbf7ee" side={THREE.DoubleSide} />
                  </mesh>

                  {/* Rombos protectores Tsikuri en las 4 esquinas */}
                  <group position={[0, 0, 0.004]}>
                    <TsikuriDiamond
                      size={0.055}
                      position={[-cardWidth / 2 + 0.065, cardHeight / 2 - 0.065, 0]}
                      colors={['#c69214', UNIFIED_ICON_COLOR, '#ffffff']}
                    />
                    <TsikuriDiamond
                      size={0.055}
                      position={[cardWidth / 2 - 0.065, cardHeight / 2 - 0.065, 0]}
                      colors={['#c69214', UNIFIED_ICON_COLOR, '#ffffff']}
                    />
                    <TsikuriDiamond
                      size={0.055}
                      position={[-cardWidth / 2 + 0.065, -cardHeight / 2 + 0.065, 0]}
                      colors={['#c69214', UNIFIED_ICON_COLOR, '#ffffff']}
                    />
                    <TsikuriDiamond
                      size={0.055}
                      position={[cardWidth / 2 - 0.065, -cardHeight / 2 + 0.065, 0]}
                      colors={['#c69214', UNIFIED_ICON_COLOR, '#ffffff']}
                    />
                  </group>

                  {/* Área de Imagen Superior (Misma imagen de los cuadros o portada de libros) */}
                  <group position={[0, 0.42, 0.002]}>
                    {item.image ? (
                      <ReferenceCardImage
                        url={item.image}
                        width={activeRefCategory === 'libros' ? 0.96 : 2.40}
                        height={1.26}
                      />
                    ) : (
                      <group position={[0, 0, 0]}>
                        <mesh position={[0, 0, 0]}>
                          <planeGeometry args={[2.40, 1.26]} />
                          <meshBasicMaterial color="#f0e6d2" side={THREE.DoubleSide} />
                        </mesh>
                        <LucideVRIcon
                          name="utensils"
                          size={0.34}
                          color={UNIFIED_ICON_COLOR}
                          position={[0, 0.12, 0.002]}
                          strokeWidth={2.4}
                        />
                        <Text
                          position={[0, -0.25, 0.002]}
                          fontSize={0.095}
                          color="#78350f"
                          anchorX="center"
                          anchorY="middle"
                          letterSpacing={0.02}
                        >
                          [Fotografía en proceso de catalogación]
                        </Text>
                      </group>
                    )}

                    {/* Marco dorado delgado para la imagen */}
                    <mesh position={[0, 0, 0.001]}>
                      <planeGeometry args={[activeRefCategory === 'libros' ? 1.00 : 2.42, 1.28]} />
                      <meshBasicMaterial color="#c69214" side={THREE.DoubleSide} />
                    </mesh>
                  </group>

                  {/* Línea divisoria dorada bajo la imagen */}
                  <mesh position={[0, -0.24, 0.003]}>
                    <planeGeometry args={[2.42, 0.004]} />
                    <meshBasicMaterial color="#d4af37" side={THREE.DoubleSide} />
                  </mesh>

                  {/* Título de la obra o platillo */}
                  <Text
                    position={[0, -0.34, 0.004]}
                    fontSize={0.120}
                    color="#1c1917"
                    anchorX="center"
                    anchorY="top"
                    maxWidth={2.42}
                    textAlign="center"
                  >
                    {item.title}
                  </Text>

                  {/* Referencia de dónde fue sacado */}
                  <Text
                    position={[0, -0.56, 0.004]}
                    fontSize={0.098}
                    color="#44403c"
                    anchorX="center"
                    anchorY="top"
                    maxWidth={2.42}
                    lineHeight={1.28}
                    textAlign="center"
                  >
                    {item.reference}
                  </Text>

                  {/* Enlace o fuente digital */}
                  <Text
                    position={[0, -0.92, 0.004]}
                    fontSize={0.090}
                    color="#b45309"
                    anchorX="center"
                    anchorY="top"
                    maxWidth={2.42}
                    textAlign="center"
                  >
                    {item.link}
                  </Text>
                </group>
              );
            })}
          </group>

          {/* Barra Inferior de Navegación y Paginador */}
          <group position={[0, -1.40, 0]}>
            {totalRefPages > 1 && (
              <>
                <WixarikaVRButton
                  id="btn-ref-nav-prev"
                  label="Anterior"
                  iconName="chevron-left"
                  variant="cantera"
                  width={1.40}
                  height={0.28}
                  position={[-1.50, 0, 0]}
                  onClick={handlePrevRefPage}
                  registerMesh={registerMesh}
                  unregisterMesh={unregisterMesh}
                  hoveredId={hoveredId}
                  fuseProgress={fuseProgress}
                />

                <group position={[0, 0, 0]}>
                  <mesh position={[0, 0, -0.001]}>
                    <planeGeometry args={[1.50, 0.26]} />
                    <meshBasicMaterial color="#f4ebd8" />
                  </mesh>
                  <Text
                    position={[0, 0, 0.001]}
                    fontSize={0.115}
                    color="#1c1917"
                    anchorX="center"
                    anchorY="middle"
                  >
                    {`Página ${refPageIndex + 1} de ${totalRefPages}`}
                  </Text>
                </group>

                <WixarikaVRButton
                  id="btn-ref-nav-next"
                  label="Siguiente"
                  iconName="chevron-right"
                  variant="cantera"
                  width={1.40}
                  height={0.28}
                  position={[1.50, 0, 0]}
                  onClick={handleNextRefPage}
                  registerMesh={registerMesh}
                  unregisterMesh={unregisterMesh}
                  hoveredId={hoveredId}
                  fuseProgress={fuseProgress}
                />
              </>
            )}

            {totalRefPages <= 1 && (
              <group position={[0, 0, 0]}>
                <mesh position={[0, 0, -0.001]}>
                  <planeGeometry args={[1.50, 0.26]} />
                  <meshBasicMaterial color="#f4ebd8" />
                </mesh>
                <Text
                  position={[0, 0, 0.001]}
                  fontSize={0.115}
                  color="#1c1917"
                  anchorX="center"
                  anchorY="middle"
                >
                  Página 1 de 1
                </Text>
              </group>
            )}
          </group>
        </group>
      )}

      {/* ===================================================================== */}
      {/* VISTA C: LIBROS RECOMENDADOS (ESTÁNDAR TIPOGRÁFICO DEIDADES/FIESTAS)  */}
      {/* ===================================================================== */}
      {currentView === 'books' && (() => {
        const bookTitleText = currentBook?.title || currentBook?.titulo || 'Libro sin título';
        const bookTitleFontSize =
          bookTitleText.length <= 28 ? 0.240 : bookTitleText.length <= 58 ? 0.205 : 0.180;
        const authorY = bookTitleText.length <= 28 ? 0.88 : 0.72;
        const rightColX = -panelWidth / 2 + panelWidth / 3 + (panelWidth * 2) / 3 / 2;
        const rightColWidth = (panelWidth * 2 / 3) * 0.92; // ~3.92m

        return (
        <group position={[0, 0, 0.005]}>
          {/* Barra Superior con botón Volver al Menú (solo icono de flecha), título y paginador */}
          <group position={[0, 1.48, 0]}>
            <WixarikaVRButton
              id="btn-books-back-top"
              iconName="arrow-left"
              variant="cantera"
              width={0.42}
              height={0.26}
              position={[-2.75, 0, 0]}
              onClick={handleReturnHome}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />

            <Text
              position={[-0.38, 0.02, 0]}
              fontSize={0.145}
              color="#1c1917"
              anchorX="center"
              anchorY="middle"
              maxWidth={4.10}
            >
              LIBROS RECOMENDADOS · BIBLIOTECA SOLÓN ARGÜELLO
            </Text>

            {/* Contador de libros: X de N */}
            <group position={[2.40, 0, 0]}>
              <mesh position={[0, 0, -0.001]}>
                <planeGeometry args={[1.00, 0.24]} />
                <meshBasicMaterial color="#f4ebd8" />
              </mesh>
              <Text
                position={[0, 0, 0.001]}
                fontSize={0.115}
                color="#1c1917"
                anchorX="center"
                anchorY="middle"
              >
                {`${bookIndex + 1} de ${totalBooks}`}
              </Text>
            </group>

            {/* Línea divisoria superior dorada acotada al centro para no encimarse a botones ni cruz */}
            <mesh position={[0, -0.16, 0]}>
              <planeGeometry args={[3.60, 0.006]} />
              <meshBasicMaterial color="#d4af37" />
            </mesh>
          </group>

          {/* Línea divisoria vertical ceremonial de oro entre las dos columnas (1/3 y 2/3) */}
          <mesh position={[-panelWidth / 2 + panelWidth / 3, -0.15, 0.002]}>
            <planeGeometry args={[0.008, 2.86]} />
            <meshBasicMaterial color="#d4af37" side={THREE.DoubleSide} />
          </mesh>

          {/* ================================================================= */}
          {/* COLUMNA IZQUIERDA (1/3 DEL PANEL, ~2.13m): PORTADA DEL LIBRO      */}
          {/* ================================================================= */}
          <group position={[-panelWidth / 2 + (panelWidth / 3) / 2, 0, 0.005]}>
            {/* Marco de nogal exterior de la portada */}
            <mesh position={[0, 0.18, 0.001]}>
              <planeGeometry args={[1.96, 2.12]} />
              <meshBasicMaterial color="#5c381e" side={THREE.DoubleSide} />
            </mesh>
            {/* Marco dorado de la portada */}
            <mesh position={[0, 0.18, 0.002]}>
              <planeGeometry args={[1.92, 2.08]} />
              <meshBasicMaterial color="#c69214" side={THREE.DoubleSide} />
            </mesh>

            {/* Portada del libro con textura segura o fondo cantera */}
            <group position={[0, 0.18, 0]}>
              <DashboardBookCover
                url={currentBook?.portadaUrl}
                width={1.88}
                height={2.04}
              />
            </group>

            {/* Rombos Tsikuri en las esquinas de la portada */}
            <group position={[0, 0.18, 0.006]}>
              <TsikuriDiamond
                size={0.060}
                position={[-1.88 / 2 + 0.045, 2.04 / 2 - 0.045, 0]}
                colors={['#c69214', UNIFIED_ICON_COLOR, '#ffffff']}
              />
              <TsikuriDiamond
                size={0.060}
                position={[1.88 / 2 - 0.045, 2.04 / 2 - 0.045, 0]}
                colors={['#c69214', UNIFIED_ICON_COLOR, '#ffffff']}
              />
              <TsikuriDiamond
                size={0.060}
                position={[-1.88 / 2 + 0.045, -2.04 / 2 + 0.045, 0]}
                colors={['#c69214', UNIFIED_ICON_COLOR, '#ffffff']}
              />
              <TsikuriDiamond
                size={0.060}
                position={[1.88 / 2 - 0.045, -2.04 / 2 + 0.045, 0]}
                colors={['#c69214', UNIFIED_ICON_COLOR, '#ffffff']}
              />
            </group>

            {/* Placa inferior con categoría y disponibilidad (estándar 0.115 de Deidades/Fiestas) */}
            <group position={[0, -1.24, 0]}>
              <mesh position={[0, 0, 0.001]}>
                <planeGeometry args={[1.88, 0.44]} />
                <meshBasicMaterial color="#f4ebd8" side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[0, 0, 0]}>
                <planeGeometry args={[1.92, 0.48]} />
                <meshBasicMaterial color="#c69214" side={THREE.DoubleSide} />
              </mesh>
              <Text
                position={[0, 0, 0.003]}
                fontSize={0.115}
                color="#78350f"
                anchorX="center"
                anchorY="middle"
                letterSpacing={0.02}
                lineHeight={1.18}
                maxWidth={1.80}
                textAlign="center"
              >
                {((currentBook?.category || currentBook?.badge || 'ACERVO CULTURAL') + (currentBook?.available ? ' · DISPONIBLE' : '')).toUpperCase()}
              </Text>
            </group>
          </group>

          {/* ================================================================= */}
          {/* COLUMNA DERECHA (2/3 DEL PANEL, ~4.27m): DATOS, RESEÑA Y METADATOS */}
          {/* ================================================================= */}
          <group position={[rightColX, 0, 0.005]}>
            {/* 1. Encabezado: Título Monumental y Autor (estándar Deidades/Fiestas) */}
            <group position={[0, 0, 0]}>
              <Text
                position={[0, 1.25, 0]}
                fontSize={bookTitleFontSize}
                color="#1c1917"
                anchorX="center"
                anchorY="top"
                maxWidth={rightColWidth}
                textAlign="center"
                lineHeight={1.14}
              >
                {bookTitleText}
              </Text>

              <Text
                position={[0, authorY, 0]}
                fontSize={0.120}
                color="#78350f"
                anchorX="center"
                anchorY="top"
                maxWidth={rightColWidth}
                textAlign="center"
                lineHeight={1.22}
              >
                {`Autor: ${currentBook?.author || currentBook?.autor || 'Desconocido'}${currentBook?.year ? ` (${currentBook.year})` : ''}`}
              </Text>

              {/* Línea divisoria dorada debajo del autor */}
              <mesh position={[0, 0.39, 0]}>
                <planeGeometry args={[rightColWidth * 0.98, 0.008]} />
                <meshBasicMaterial color="#d4af37" side={THREE.DoubleSide} />
              </mesh>
            </group>

            {/* 2. Recuadro de Descripción / Sinopsis (fontSize 0.142 idéntico a Deidades/Fiestas) */}
            <group position={[0, -0.08, 0]}>
              <mesh position={[0, 0, -0.001]}>
                <planeGeometry args={[rightColWidth * 0.98, 0.86]} />
                <meshBasicMaterial color="#f4ebd8" side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[0, 0, -0.002]}>
                <planeGeometry args={[rightColWidth * 0.98 + 0.03, 0.89]} />
                <meshBasicMaterial color="#c69214" side={THREE.DoubleSide} />
              </mesh>

              <Text
                position={[-rightColWidth * 0.46, 0, 0.002]}
                fontSize={0.142}
                color="#1c1917"
                anchorX="left"
                anchorY="middle"
                maxWidth={rightColWidth * 0.92}
                textAlign="left"
                lineHeight={1.32}
              >
                {currentBook?.synopsis || 'Obra especializada en el acervo patrimonial de la cultura Wixárika, disponible para consulta presencial en la biblioteca.'}
              </Text>
            </group>

            {/* 3. Viñetas de Atributos (fontSize 0.130 idéntico a Deidades/Fiestas) */}
            <group position={[0, -0.66, 0]}>
              <Text
                position={[-rightColWidth * 0.46, 0, 0]}
                fontSize={0.130}
                color="#1c1917"
                anchorX="left"
                anchorY="middle"
                maxWidth={rightColWidth * 0.96}
                lineHeight={1.25}
              >
                {`• Código / ISBN: ${currentBook?.callNumber || currentBook?.code || currentBook?.isbn || '299.72 ECH-2022'}`}
              </Text>

              <Text
                position={[-rightColWidth * 0.46, -0.21, 0]}
                fontSize={0.130}
                color="#1c1917"
                anchorX="left"
                anchorY="middle"
                maxWidth={rightColWidth * 0.96}
                lineHeight={1.25}
              >
                {`• Clasificación: ${currentBook?.category || 'Cosmovisión Wixárika'} · ${currentBook?.badge || 'SALA DE LECTURA'}`}
              </Text>

              <Text
                position={[-rightColWidth * 0.46, -0.42, 0]}
                fontSize={0.130}
                color="#1c1917"
                anchorX="left"
                anchorY="middle"
                maxWidth={rightColWidth * 0.96}
                lineHeight={1.25}
              >
                {`• Estatus: ${currentBook?.available !== false ? 'Disponible en Sala y Préstamo a Domicilio' : 'En Préstamo (Solicitar reserva en mostrador)'}`}
              </Text>
            </group>

            {/* 4. Barra Inferior de Navegación de Libros (Anterior / Siguiente) */}
            <group position={[0, -1.42, 0]}>
              <WixarikaVRButton
                id="btn-books-nav-prev"
                label="Libro Anterior"
                iconName="chevron-left"
                variant="cantera"
                width={1.74}
                height={0.30}
                position={[-1.00, 0, 0]}
                onClick={handlePrevBook}
                registerMesh={registerMesh}
                unregisterMesh={unregisterMesh}
                hoveredId={hoveredId}
                fuseProgress={fuseProgress}
              />

              <WixarikaVRButton
                id="btn-books-nav-next"
                label="Libro Siguiente"
                iconName="chevron-right"
                variant="cantera"
                width={1.74}
                height={0.30}
                position={[1.00, 0, 0]}
                onClick={handleNextBook}
                registerMesh={registerMesh}
                unregisterMesh={unregisterMesh}
                hoveredId={hoveredId}
                fuseProgress={fuseProgress}
              />
            </group>
          </group>
        </group>
        );
      })()}

      {/* ===================================================================== */}
      {/* VISTA D: SALA AUDIOVISUAL Y VIDEOS DOCUMENTALES                      */}
      {/* ===================================================================== */}
      {currentView === 'videos' && (
        <group position={[0, 0, 0.005]}>
          {/* Barra Superior con botón Volver al Menú (solo flecha <-) */}
          <group position={[0, 1.50, 0]}>
            <WixarikaVRButton
              id="btn-videos-back-top"
              iconName="arrow-left"
              variant="cantera"
              width={0.42}
              height={0.26}
              position={[-2.75, 0, 0]}
              onClick={handleReturnHome}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />

            <Text
              position={[0, 0.02, 0]}
              fontSize={0.145}
              color="#1c1917"
              anchorX="center"
              anchorY="middle"
            >
              SALA AUDIOVISUAL · BIBLIOTECA SOLÓN ARGÜELLO
            </Text>

            {/* Línea divisoria superior dorada acotada al centro para no encimarse a botones ni cruz */}
            <mesh position={[0, -0.15, 0]}>
              <planeGeometry args={[3.60, 0.006]} />
              <meshBasicMaterial color="#d4af37" />
            </mesh>
          </group>

          {/* Selector de Videos: Anterior, Video X de Y, Siguiente con amplia separación */}
          <group position={[0, 1.20, 0]}>
            <WixarikaVRButton
              id="btn-dash-video-prev"
              label="Anterior"
              iconName="chevron-left"
              variant="cantera"
              width={1.05}
              height={0.22}
              position={[-1.95, 0, 0]}
              onClick={handlePrevVideo}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />

            <group position={[0, 0, 0]}>
              <mesh position={[0, 0, -0.001]}>
                <planeGeometry args={[2.30, 0.22]} />
                <meshBasicMaterial color="#f4ebd8" />
              </mesh>
              <Text
                position={[0, 0, 0.001]}
                fontSize={0.115}
                color="#1c1917"
                anchorX="center"
                anchorY="middle"
              >
                {`Video ${videoIndex + 1} de ${totalVideos}`}
              </Text>
            </group>

            <WixarikaVRButton
              id="btn-dash-video-next"
              label="Siguiente"
              iconName="chevron-right"
              variant="cantera"
              width={1.05}
              height={0.22}
              position={[1.95, 0, 0]}
              onClick={handleNextVideo}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />
          </group>

          {/* Reproductor de Video 3D Integrado (descendido a Y=-0.22 para evitar cualquier solapamiento) */}
          {currentVideo && (
            <group position={[0, -0.22, 0]}>
              <WixarikaVRVideoPlayer
                video={currentVideo}
                quality={videoQuality}
                onQualityChange={setVideoQuality}
                cinemaMode={videoCinemaMode}
                onToggleCinemaMode={() => setVideoCinemaMode((p) => !p)}
                registerMesh={registerMesh}
                unregisterMesh={unregisterMesh}
                hoveredId={hoveredId}
                fuseProgress={fuseProgress}
              />
            </group>
          )}
        </group>
      )}
    </group>
  );
}

export default WixarikaWelcomeDashboard;
