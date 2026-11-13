import React, { useState, useMemo, useEffect } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { WixarikaVRFloatingPanel } from './WixarikaVRFloatingPanel.jsx';
import { WixarikaVRButton } from './WixarikaVRButton.jsx';
import { TsikuriDiamond } from './TsikuriDiamond.jsx';
import { SoundFX } from '../../services/audioService.js';
import { fetchRecommendedBooks } from '../../services/bookService.js';

/**
 * Componente 3D para renderizar la portada del libro con textura segura.
 * Se muestra únicamente si existe una URL de portada válida.
 */
function BookCoverMesh({ url, width = 0.58, height = 0.82, position = [0, 0, 0] }) {
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    if (!url) {
      setTexture(null);
      return;
    }

    let isMounted = true;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(
      url,
      (loadedTex) => {
        if (isMounted) {
          loadedTex.colorSpace = THREE.SRGBColorSpace;
          setTexture(loadedTex);
        }
      },
      undefined,
      (err) => {
        console.warn('[BookCoverMesh] Error cargando portada:', url, err);
        if (isMounted) setTexture(null);
      }
    );

    return () => {
      isMounted = false;
      if (texture) texture.dispose();
    };
  }, [url]);

  return (
    <group position={position}>
      {/* 1. Marco exterior de madera / cantera */}
      <mesh position={[0, 0, -0.003]}>
        <planeGeometry args={[width + 0.04, height + 0.04]} />
        <meshBasicMaterial color="#5c381e" />
      </mesh>

      {/* 2. Filete de oro ceremonial */}
      <mesh position={[0, 0, -0.002]}>
        <planeGeometry args={[width + 0.016, height + 0.016]} />
        <meshBasicMaterial color="#d4af37" />
      </mesh>

      {/* 3. Superficie de la portada con textura o fondo de respaldo */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[width, height]} />
        {texture ? (
          <meshBasicMaterial map={texture} />
        ) : (
          <meshBasicMaterial color="#1e293b" />
        )}
      </mesh>

      {/* 4. Rombos Tsikuri decorativos en las 4 esquinas */}
      <group position={[0, 0, 0.003]}>
        <TsikuriDiamond
          size={0.024}
          position={[-width / 2 + 0.018, height / 2 - 0.018, 0]}
          colors={['#d4af37', '#b45309', '#ffffff']}
        />
        <TsikuriDiamond
          size={0.024}
          position={[width / 2 - 0.018, height / 2 - 0.018, 0]}
          colors={['#d4af37', '#b45309', '#ffffff']}
        />
        <TsikuriDiamond
          size={0.024}
          position={[-width / 2 + 0.018, -height / 2 + 0.018, 0]}
          colors={['#d4af37', '#b45309', '#ffffff']}
        />
        <TsikuriDiamond
          size={0.024}
          position={[width / 2 - 0.018, -height / 2 + 0.018, 0]}
          colors={['#d4af37', '#b45309', '#ffffff']}
        />
      </group>

      {/* 5. Etiqueta inferior de Portada */}
      <group position={[0, -height / 2 - 0.05, 0.002]}>
        <mesh position={[0, 0, -0.001]}>
          <planeGeometry args={[width, 0.08]} />
          <meshBasicMaterial color="#f3ebd6" />
        </mesh>
        <Text
          fontSize={0.054}
          color="#78350f"
          anchorX="center"
          anchorY="middle"
        >
          PORTADA ORIGINAL
        </Text>
      </group>
    </group>
  );
}

/**
 * Catálogo base de libros de la cultura Wixárika disponibles
 * en la Biblioteca Pública Profesor Solón Argüello (Tepic, Nayarit).
 * Clasificados por tema/pabellón cultural para su consulta en VR.
 */
export const DEFAULT_WIXARIKA_BOOKS = [
  {
    id: 'book-1',
    stationId: 'deidades',
    themeId: 'deidades',
    title: "El Fuego Sagrado y los Cantos del Mara'akame",
    author: "Rocío Echevarría & Consejo de Ancianos Wixárika",
    callNumber: "299.72 ECH-2022",
    code: "299.72 ECH-2022",
    category: "Cosmovisión",
    badge: "SALA DE LECTURA",
    available: true,
    year: "2022",
    variant: "solar",
    portadaUrl: null,
    synopsis: "Estudio testimonial y cantos ceremoniales dedicados a Tatewari (El Abuelo Fuego) y la ruta sagrada a Wirikuta."
  },
  {
    id: 'book-2',
    stationId: 'gastronomia',
    themeId: 'gastronomia',
    title: "Sabores del Nayar: Etnobotánica y Cocina Tradicional",
    author: "Mtra. Candelaria Valdés & Etnobotánicos del Estado",
    callNumber: "641.59 VAL-2021",
    code: "641.59 VAL-2021",
    category: "Gastronomía",
    badge: "ESTANTERÍA G-04",
    available: true,
    year: "2021",
    variant: "hikuri",
    portadaUrl: null,
    synopsis: "Recetario patrimonial que documenta el perruri de maíz tostado y atoles ancestrales de la sierra nayarita."
  },
  {
    id: 'book-3',
    stationId: 'fiestas',
    themeId: 'fiestas',
    title: "Fiestas Sagradas y Ritos de la Sierra Wixárika",
    author: "Dr. Benjamín Maldonado & Centro de Estudios Nayaritas",
    callNumber: "394.2 MAL-2023",
    code: "394.2 MAL-2023",
    category: "Ceremonias",
    badge: "SALA GENERAL",
    available: true,
    year: "2023",
    variant: "water",
    portadaUrl: null,
    synopsis: "Crónica etnográfica del ciclo ritual de las 5 estaciones sagradas: Tatei Neixa y la Fiesta del Tambor."
  },
  {
    id: 'book-4',
    stationId: 'deidades',
    themeId: 'deidades',
    title: "El Venado Azul y la Geografía Mística de Wirikuta",
    author: "Kauyumari Hernández & Cronistas de Nayarit",
    callNumber: "972.33 HER-2024",
    code: "972.33 HER-2024",
    category: "Historia Viva",
    badge: "COLECCIÓN LOCAL",
    available: true,
    year: "2024",
    variant: "kauyumari",
    portadaUrl: null,
    synopsis: "Cartografía de los puntos cardinales del pueblo Wixárika desde Haramara hasta Wirikuta."
  },
  {
    id: 'book-5',
    stationId: 'deidades',
    themeId: 'deidades',
    title: "Chaquira y Estambre: El Lenguaje Simbólico del Arte Wixárika",
    author: "Artesanos Unidos de Santa Catarina Cuexcomatitlán",
    callNumber: "745.5 ART-2023",
    code: "745.5 ART-2023",
    category: "Arte Tradicional",
    badge: "SALA DE ARTE",
    available: true,
    year: "2023",
    variant: "obsidian",
    portadaUrl: null,
    synopsis: "Guía de lectura iconográfica sobre tablas de estambre y jícaras sagradas (rukuri)."
  }
];

/**
 * WixarikaVRBookPanel - Panel 3D de Libros y Fomento Lector en VR
 * Diseñado exclusivamente con la información requerida:
 * Título, Autor y Código de libro, filtrado por el tema que se esté viendo.
 * Aplica paleta estricta de 2 colores y tipografías ampliadas para VR.
 */
export function WixarikaVRBookPanel({
  books: initialBooksProp,
  books = DEFAULT_WIXARIKA_BOOKS,
  stationId = null,
  stationName = null,
  initialBookId,
  onSelectBook,
  onClose,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  onRegister,
  onUnregister,
  registerMesh,
  unregisterMesh,
  hoveredId,
  fuseProgress = 0
}) {
  const [loadedBooks, setLoadedBooks] = useState(initialBooksProp || books || DEFAULT_WIXARIKA_BOOKS);

  // Carga complementaria desde Supabase si está disponible
  useEffect(() => {
    if (initialBooksProp && initialBooksProp.length > 0) {
      setLoadedBooks(initialBooksProp);
      return;
    }

    const abortCtrl = new AbortController();
    fetchRecommendedBooks(abortCtrl.signal).then((remoteBooks) => {
      if (remoteBooks && remoteBooks.length > 0) {
        setLoadedBooks(remoteBooks);
      }
    });

    return () => abortCtrl.abort();
  }, [initialBooksProp]);

  // 1. Filtrar estrictamente según el tema que el usuario esté viendo
  const sourceList = loadedBooks && loadedBooks.length > 0 ? loadedBooks : (books || DEFAULT_WIXARIKA_BOOKS);

  const filteredBooks = useMemo(() => {
    if (!stationId || stationId === 'all') return sourceList;
    const matched = sourceList.filter(
      (b) =>
        b.stationId === stationId ||
        b.themeId === stationId ||
        b.seccion_id === stationId ||
        (stationId === 'deidades' && (b.category === 'Cosmovisión' || b.category === 'Historia Viva' || b.category === 'Arte Tradicional')) ||
        (stationId === 'gastronomia' && b.category === 'Gastronomía') ||
        (stationId === 'fiestas' && (b.category === 'Ceremonias' || b.category === 'Fiestas'))
    );
    return matched.length > 0 ? matched : sourceList;
  }, [sourceList, stationId]);

  const [currentIndex, setCurrentIndex] = useState(() => {
    if (initialBookId) {
      const idx = filteredBooks.findIndex((b) => b.id === initialBookId);
      if (idx !== -1) return idx;
    }
    return 0;
  });

  // Si cambia el tema / estación, reiniciar el índice
  useEffect(() => {
    setCurrentIndex(0);
  }, [stationId]);

  const totalBooks = filteredBooks.length;
  const currentBook = filteredBooks[currentIndex] || filteredBooks[0] || DEFAULT_WIXARIKA_BOOKS[0];

  const handlePrev = () => {
    const nextIdx = (currentIndex - 1 + totalBooks) % totalBooks;
    setCurrentIndex(nextIdx);
    SoundFX.playClick();
    onSelectBook?.(filteredBooks[nextIdx]);
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % totalBooks;
    setCurrentIndex(nextIdx);
    SoundFX.playClick();
    onSelectBook?.(filteredBooks[nextIdx]);
  };

  const handleClose = () => {
    SoundFX.playClick();
    onClose?.();
  };

  // Título y código normalizados
  const bookTitle = currentBook?.title || currentBook?.titulo || 'Libro sin título';
  const bookAuthor = currentBook?.author || currentBook?.autor || 'Autor no especificado';
  const bookCode = currentBook?.code || currentBook?.callNumber || currentBook?.codigo || currentBook?.isbn || 'SEC-VR-01';

  // Nombre del tema a mostrar en el subtítulo
  const themeSubtitle = stationName
    ? `Tema: ${stationName}`
    : currentBook?.category
    ? `Tema: ${currentBook.category}`
    : 'Biblioteca Pública Solón Argüello';

  const hasMultipleBooks = totalBooks > 1;

  // Verificación condicional: ¿Tiene portada asignada?
  const hasCover = Boolean(currentBook?.portadaUrl && currentBook.portadaUrl.trim() !== '');

  // Paleta estricta de 2 colores (Cantera: primario carbón #1c1917, secundario ámbar #78350f)
  const color1 = '#1c1917';
  const color2 = '#78350f';

  return (
    <WixarikaVRFloatingPanel
      title="LIBROS DE LA BIBLIOTECA"
      subtitle={themeSubtitle}
      width={hasCover ? 3.30 : 2.85}
      height={1.90}
      position={position}
      rotation={rotation}
      variant="cantera"
      onClose={handleClose}
      onRegister={onRegister}
      onUnregister={onUnregister}
      registerMesh={registerMesh}
      unregisterMesh={unregisterMesh}
      hoveredId={hoveredId}
      fuseProgress={fuseProgress}
    >
      {/* 1. Barra de Navegación (Solo si hay más de 1 libro para el tema activo) */}
      {hasMultipleBooks && (
        <group position={[0, 0.44, 0.01]}>
          <WixarikaVRButton
            id="btn-book-prev"
            label="Anterior"
            iconName="chevron-left"
            variant="cantera"
            width={0.68}
            height={0.17}
            position={[-0.95, 0, 0]}
            onClick={handlePrev}
            onRegister={onRegister}
            onUnregister={onUnregister}
            registerMesh={registerMesh}
            unregisterMesh={unregisterMesh}
            hoveredId={hoveredId}
            fuseProgress={fuseProgress}
            showDiamonds={false}
          />

          {/* Indicador de posición del libro */}
          <group position={[0, 0, 0]}>
            <mesh position={[0, 0, -0.001]}>
              <planeGeometry args={[1.05, 0.15]} />
              <meshBasicMaterial color="#f3ebd6" transparent opacity={0.95} />
            </mesh>
            <Text
              position={[0, 0, 0.002]}
              fontSize={0.076}
              color={color1}
              anchorX="center"
              anchorY="middle"
            >
              {`Libro ${currentIndex + 1} de ${totalBooks}`}
            </Text>
          </group>

          <WixarikaVRButton
            id="btn-book-next"
            label="Siguiente"
            iconName="chevron-right"
            variant="cantera"
            width={0.68}
            height={0.17}
            position={[0.95, 0, 0]}
            onClick={handleNext}
            onRegister={onRegister}
            onUnregister={onUnregister}
            registerMesh={registerMesh}
            unregisterMesh={unregisterMesh}
            hoveredId={hoveredId}
            fuseProgress={fuseProgress}
            showDiamonds={false}
          />
        </group>
      )}

      {/* 2. Área del Libro: Portada opcional + Título, Autor y Código en tipografías ampliadas */}
      {currentBook && (
        <group position={[hasCover ? 0.38 : 0, hasMultipleBooks ? -0.05 : 0.05, 0.01]}>
          {hasCover && (
            <BookCoverMesh
              url={currentBook.portadaUrl}
              width={0.62}
              height={0.88}
              position={[-1.10, 0, 0]}
            />
          )}

          {/* TÍTULO DEL LIBRO (Grande, nítido, alto contraste - Color 1) */}
          <Text
            position={[0, 0.22, 0.005]}
            fontSize={0.096}
            color={color1}
            anchorX="center"
            anchorY="top"
            maxWidth={hasCover ? 1.75 : 2.45}
            textAlign="center"
            lineHeight={1.20}
          >
            {bookTitle}
          </Text>

          {/* AUTOR DEL LIBRO (Color 2) */}
          <Text
            position={[0, 0.02, 0.005]}
            fontSize={0.082}
            color={color2}
            anchorX="center"
            anchorY="top"
            maxWidth={hasCover ? 1.75 : 2.45}
            textAlign="center"
          >
            {`Autor: ${bookAuthor}`}
          </Text>

          {/* CÓDIGO DE LIBRO (Cota de biblioteca física - Color 1) */}
          <group position={[0, -0.19, 0.005]}>
            <mesh position={[0, 0, -0.001]}>
              <planeGeometry args={[1.65, 0.17]} />
              <meshBasicMaterial color="#f3ebd6" transparent opacity={0.95} />
            </mesh>
            <mesh position={[0, 0, -0.002]}>
              <planeGeometry args={[1.70, 0.20]} />
              <meshBasicMaterial color="#d97706" transparent opacity={0.8} />
            </mesh>
            <Text
              position={[0, 0, 0.002]}
              fontSize={0.080}
              color={color1}
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.04}
            >
              {`Código: ${bookCode}`}
            </Text>
          </group>
        </group>
      )}

      {/* 3. Botón para Cerrar y Volver a la Sala */}
      <group position={[0, -0.68, 0.01]}>
        <WixarikaVRButton
          id="btn-book-close-bottom"
          label="Volver a la Sala"
          iconName="arrow-left"
          variant="cantera"
          width={1.65}
          height={0.22}
          position={[0, 0, 0]}
          onClick={handleClose}
          onRegister={onRegister}
          onUnregister={onUnregister}
          registerMesh={registerMesh}
          unregisterMesh={unregisterMesh}
          hoveredId={hoveredId}
          fuseProgress={fuseProgress}
        />
      </group>
    </WixarikaVRFloatingPanel>
  );
}

export default WixarikaVRBookPanel;
