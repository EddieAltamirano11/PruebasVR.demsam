import React, { useState, useMemo, useEffect } from 'react';
import { Text } from '@react-three/drei';
import { WixarikaVRFloatingPanel } from './WixarikaVRFloatingPanel.jsx';
import { WixarikaVRButton } from './WixarikaVRButton.jsx';
import { SoundFX } from '../../services/audioService.js';

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
    synopsis: "Guía de lectura iconográfica sobre tablas de estambre y jícaras sagradas (rukuri)."
  }
];

/**
 * WixarikaVRBookPanel - Panel 3D de Libros y Fomento Lector en VR
 * Diseñado exclusivamente con la información requerida:
 * Título, Autor y Código de libro, filtrado por el tema que se esté viendo.
 * 
 * @param {Object} props
 * @param {Array} [props.books] - Catálogo de libros (usa DEFAULT_WIXARIKA_BOOKS por defecto)
 * @param {string} [props.stationId] - ID de la estación cultural (deidades, gastronomia, fiestas)
 * @param {string} [props.stationName] - Nombre amigable del tema visualizado
 * @param {string} [props.initialBookId] - ID del libro inicialmente seleccionado
 * @param {Function} [props.onSelectBook] - Callback al cambiar de libro
 * @param {Function} [props.onClose] - Callback para cerrar el panel y volver a la sala
 * @param {Array<number>} [props.position] - Posición en espacio 3D
 * @param {Array<number>} [props.rotation] - Rotación 3D
 * @param {Function} [props.onRegister] - Registro en raycaster Gaze Fuse
 * @param {Function} [props.onUnregister] - Desregistro
 * @param {Function} [props.registerMesh] - Registro de malla interactiva
 * @param {Function} [props.unregisterMesh] - Desregistro de malla
 * @param {string} [props.hoveredId] - ID del elemento enfocado con la mirada
 * @param {number} [props.fuseProgress=0] - Progreso del temporizador Gaze Fuse
 */
export function WixarikaVRBookPanel({
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
  // 1. Filtrar estrictamente según el tema que el usuario esté viendo
  const filteredBooks = useMemo(() => {
    if (!stationId || stationId === 'all') return books;
    const matched = books.filter(
      (b) =>
        b.stationId === stationId ||
        b.themeId === stationId ||
        b.seccion_id === stationId ||
        (stationId === 'deidades' && (b.category === 'Cosmovisión' || b.category === 'Historia Viva' || b.category === 'Arte Tradicional')) ||
        (stationId === 'gastronomia' && b.category === 'Gastronomía') ||
        (stationId === 'fiestas' && (b.category === 'Ceremonias' || b.category === 'Fiestas'))
    );
    return matched.length > 0 ? matched : books;
  }, [books, stationId]);

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
  const currentBook = filteredBooks[currentIndex] || filteredBooks[0];

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

  return (
    <WixarikaVRFloatingPanel
      title="LIBROS DE LA BIBLIOTECA"
      subtitle={themeSubtitle}
      width={2.45}
      height={1.48}
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
        <group position={[0, 0.32, 0.01]}>
          <WixarikaVRButton
            id="btn-book-prev"
            label="Anterior"
            iconName="chevron-left"
            variant="cantera"
            width={0.54}
            height={0.13}
            position={[-0.78, 0, 0]}
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
              <planeGeometry args={[0.78, 0.11]} />
              <meshBasicMaterial color="#f3ebd6" transparent opacity={0.95} />
            </mesh>
            <Text
              position={[0, 0, 0.002]}
              fontSize={0.038}
              color="#1c1917"
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
            width={0.54}
            height={0.13}
            position={[0.78, 0, 0]}
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

      {/* 2. Información Esencial del Libro (ÚNICAMENTE Título, Autor y Código de libro) */}
      {currentBook && (
        <group position={[0, hasMultipleBooks ? -0.06 : 0.02, 0.01]}>
          {/* TÍTULO DEL LIBRO (Grande, claro, alto contraste) */}
          <Text
            position={[0, 0.18, 0.005]}
            fontSize={0.054}
            color="#1c1917"
            anchorX="center"
            anchorY="top"
            maxWidth={2.15}
            textAlign="center"
            lineHeight={1.18}
          >
            {bookTitle}
          </Text>

          {/* AUTOR DEL LIBRO */}
          <Text
            position={[0, 0.02, 0.005]}
            fontSize={0.038}
            color="#78350f"
            anchorX="center"
            anchorY="top"
            maxWidth={2.15}
            textAlign="center"
          >
            {`Autor: ${bookAuthor}`}
          </Text>

          {/* CÓDIGO DE LIBRO (Cota de biblioteca / Estantería física) */}
          <group position={[0, -0.15, 0.005]}>
            {/* Placa destacada para el código */}
            <mesh position={[0, 0, -0.001]}>
              <planeGeometry args={[1.25, 0.13]} />
              <meshBasicMaterial color="#f3ebd6" transparent opacity={0.95} />
            </mesh>
            <mesh position={[0, 0, -0.002]}>
              <planeGeometry args={[1.28, 0.16]} />
              <meshBasicMaterial color="#d97706" transparent opacity={0.8} />
            </mesh>
            <Text
              position={[0, 0, 0.002]}
              fontSize={0.040}
              color="#1c1917"
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
      <group position={[0, -0.52, 0.01]}>
        <WixarikaVRButton
          id="btn-book-close-bottom"
          label="Volver a la Sala"
          iconName="arrow-left"
          variant="cantera"
          width={1.05}
          height={0.16}
          position={[0, 0, 0]}
          onClick={handleClose}
          onRegister={onRegister}
          onUnregister={onUnregister}
          registerMesh={registerMesh}
          unregisterMesh={unregisterMesh}
          hoveredId={hoveredId}
          fuseProgress={fuseProgress}
          showDiamonds={false}
        />
      </group>
    </WixarikaVRFloatingPanel>
  );
}

export default WixarikaVRBookPanel;
