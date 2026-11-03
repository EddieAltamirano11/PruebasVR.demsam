import React, { useState, useEffect } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { WixarikaVRFloatingPanel } from './WixarikaVRFloatingPanel.jsx';
import { WixarikaVRCard } from './WixarikaVRCard.jsx';
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
      <group position={[0, -height / 2 - 0.04, 0.002]}>
        <mesh position={[0, 0, -0.001]}>
          <planeGeometry args={[width, 0.05]} />
          <meshBasicMaterial color="#f3ebd6" />
        </mesh>
        <Text
          fontSize={0.024}
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
 * Catálogo base de libros de respaldo (offline fallback) de la cultura Wixárika
 * disponibles en la Biblioteca Pública Profesor Solón Argüello (Tepic, Nayarit).
 */
export const DEFAULT_WIXARIKA_BOOKS = [
  {
    id: 'book-1',
    title: "El Fuego Sagrado y los Cantos del Mara'akame",
    author: "Rocío Echevarría & Consejo de Ancianos Wixárika",
    category: "Cosmovisión",
    badge: "SALA DE LECTURA",
    callNumber: "299.72 ECH-2022",
    available: true,
    year: "2022",
    variant: "solar",
    portadaUrl: null,
    synopsis: "Estudio testimonial y cantos ceremoniales dedicados a Tatewari (El Abuelo Fuego) y la ruta sagrada a Wirikuta. Incluye transcripciones bilingües wixárika-español y oraciones tradicionales."
  },
  {
    id: 'book-2',
    title: "Sabores del Nayar: Etnobotánica y Cocina Tradicional",
    author: "Mtra. Candelaria Valdés & Etnobotánicos del Estado",
    category: "Gastronomía",
    badge: "ESTANTERÍA G-04",
    callNumber: "641.59 VAL-2021",
    available: true,
    year: "2021",
    variant: "hikuri",
    portadaUrl: null,
    synopsis: "Recetario patrimonial que documenta el perruri de maíz tostado, el caldo de toro ceremonial, los tamales en totomoxtle y los atoles curativos de la sierra nayarita."
  },
  {
    id: 'book-3',
    title: "Fiestas Sagradas y Ritos de la Sierra Wixárika",
    author: "Dr. Benjamín Maldonado & Centro de Estudios Nayaritas",
    category: "Ceremonias",
    badge: "SALA GENERAL",
    callNumber: "394.2 MAL-2023",
    available: true,
    year: "2023",
    variant: "water",
    portadaUrl: null,
    synopsis: "Crónica etnográfica del ciclo ritual de las 5 estaciones sagradas: Tatei Neixa (bendición de infantes y primeros elotes), la Fiesta del Tambor y el peregrinaje sagrado."
  },
  {
    id: 'book-4',
    title: "El Venado Azul y la Geografía Mística de Wirikuta",
    author: "Kauyumari Hernández & Cronistas de Nayarit",
    category: "Historia Viva",
    badge: "COLECCIÓN LOCAL",
    callNumber: "972.33 HER-2024",
    available: true,
    year: "2024",
    variant: "kauyumari",
    portadaUrl: null,
    synopsis: "Cartografía de los puntos cardinales del pueblo Wixárika, desde San Blas (Haramara) hasta Real de Catorce (Wirikuta), detallando la cosmovisión del Venado Azul."
  },
  {
    id: 'book-5',
    title: "Chaquira y Estambre: El Lenguaje Simbólico del Arte Wixárika",
    author: "Artesanos Unidos de Santa Catarina Cuexcomatitlán",
    category: "Arte Tradicional",
    badge: "SALA DE ARTE",
    callNumber: "745.5 ART-2023",
    available: true,
    year: "2023",
    variant: "obsidian",
    portadaUrl: null,
    synopsis: "Guía de lectura iconográfica sobre tablas de estambre, jícaras sagradas (rukuri) y bordados con chaquira: cómo descifrar el águila bicéfala, el peyote y la flor de cuatro pétalos."
  }
];

/**
 * WixarikaVRBookPanel - Panel 3D de Libros y Fomento Lector en VR.
 * Conexión automática a Supabase y soporte para recuadro de portada condicional.
 */
export function WixarikaVRBookPanel({
  books: initialBooksProp,
  initialBookId,
  onSelectBook,
  onLoanRequest,
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
  const [loadedBooks, setLoadedBooks] = useState(initialBooksProp || DEFAULT_WIXARIKA_BOOKS);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Carga automática desde Supabase si no se pasaron libros fijos por prop
  useEffect(() => {
    if (initialBooksProp && initialBooksProp.length > 0) {
      setLoadedBooks(initialBooksProp);
      return;
    }

    const abortCtrl = new AbortController();
    fetchRecommendedBooks(abortCtrl.signal).then((remoteBooks) => {
      if (remoteBooks && remoteBooks.length > 0) {
        setLoadedBooks(remoteBooks);
        if (initialBookId) {
          const idx = remoteBooks.findIndex((b) => b.id === initialBookId);
          if (idx !== -1) setCurrentIndex(idx);
        }
      }
    });

    return () => abortCtrl.abort();
  }, [initialBooksProp, initialBookId]);

  // Si cambia initialBookId sincronizar índice
  useEffect(() => {
    if (initialBookId && loadedBooks.length > 0) {
      const idx = loadedBooks.findIndex((b) => b.id === initialBookId);
      if (idx !== -1) setCurrentIndex(idx);
    }
  }, [initialBookId, loadedBooks]);

  const totalBooks = loadedBooks.length;
  const currentBook = loadedBooks[currentIndex] || loadedBooks[0] || DEFAULT_WIXARIKA_BOOKS[0];

  const handlePrev = () => {
    const nextIdx = (currentIndex - 1 + totalBooks) % totalBooks;
    setCurrentIndex(nextIdx);
    SoundFX.playClick();
    onSelectBook?.(loadedBooks[nextIdx]);
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % totalBooks;
    setCurrentIndex(nextIdx);
    SoundFX.playClick();
    onSelectBook?.(loadedBooks[nextIdx]);
  };

  // Verificación condicional estricta: ¿Tiene portada asignada?
  const hasCover = Boolean(currentBook?.portadaUrl && currentBook.portadaUrl.trim() !== '');

  // Dimensionamiento dinámico de la tarjeta según si hay recuadro de portada o no
  const cardWidth = hasCover ? 1.70 : 2.40;
  const cardX = hasCover ? 0.36 : 0;
  const coverX = -0.88;

  return (
    <WixarikaVRFloatingPanel
      title="BIBLIOTECA PÚBLICA PROFESOR SOLÓN ARGÜELLO"
      subtitle="Fondo de Culturas Vivas · Libros Recomendados"
      width={2.65}
      height={2.10}
      position={position}
      rotation={rotation}
      variant="cantera"
      onClose={onClose}
      onRegister={onRegister}
      onUnregister={onUnregister}
      registerMesh={registerMesh}
      unregisterMesh={unregisterMesh}
      hoveredId={hoveredId}
      fuseProgress={fuseProgress}
    >
      {/* 1. Barra de Navegación de Libros (Anterior / Índice / Siguiente) */}
      <group position={[0, 0.70, 0.01]}>
        <WixarikaVRButton
          id="btn-book-prev"
          label="Anterior"
          iconName="chevron-left"
          variant="cantera"
          width={0.62}
          height={0.14}
          position={[-0.92, 0, 0]}
          onClick={handlePrev}
          onRegister={onRegister}
          onUnregister={onUnregister}
          registerMesh={registerMesh}
          unregisterMesh={unregisterMesh}
          hoveredId={hoveredId}
          fuseProgress={fuseProgress}
          showDiamonds={false}
        />

        {/* Indicador de Página / Cantidad */}
        <group position={[0, 0, 0]}>
          <mesh position={[0, 0, -0.001]}>
            <planeGeometry args={[0.92, 0.13]} />
            <meshBasicMaterial color="#f4ebd8" transparent opacity={0.95} />
          </mesh>
          <Text
            position={[0, 0.022, 0.002]}
            fontSize={0.046}
            color="#1c1917"
            anchorX="center"
            anchorY="middle"
          >
            {`Libro ${currentIndex + 1} de ${totalBooks}`}
          </Text>
          <Text
            position={[0, -0.028, 0.002]}
            fontSize={0.030}
            color="#78350f"
            anchorX="center"
            anchorY="middle"
          >
            {`Categoría: ${currentBook?.category || 'General'}`}
          </Text>
        </group>

        <WixarikaVRButton
          id="btn-book-next"
          label="Siguiente"
          iconName="chevron-right"
          variant="cantera"
          width={0.62}
          height={0.14}
          position={[0.92, 0, 0]}
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

      {/* 2. Área Central: Recuadro de Portada (solo si hay datos) + Tarjeta 3D */}
      {currentBook && (
        <group position={[0, -0.15, 0.01]}>
          {/* Recuadro de Portada: Se renderiza ÚNICAMENTE si currentBook.portadaUrl existe */}
          {hasCover && (
            <BookCoverMesh
              url={currentBook.portadaUrl}
              width={0.56}
              height={0.84}
              position={[coverX, 0.02, 0]}
            />
          )}

          {/* Tarjeta con los datos del Libro (adaptada en ancho si hay portada) */}
          <WixarikaVRCard
            title={currentBook.title}
            subtitle={`Autor: ${currentBook.author} (${currentBook.year})`}
            category={currentBook.category}
            badge={currentBook.badge}
            description={currentBook.synopsis}
            metadata={[
              { label: 'Cota de Biblioteca / ISBN', value: currentBook.callNumber },
              {
                label: 'Disponibilidad',
                value: currentBook.available
                  ? 'Disponible para Consulta en Sala y Préstamo'
                  : 'En Préstamo (Solicitar reserva)'
              }
            ]}
            actions={[]}
            width={cardWidth}
            height={1.22}
            position={[cardX, 0, 0]}
            variant="cantera"
            onRegister={onRegister}
            onUnregister={onUnregister}
            registerMesh={registerMesh}
            unregisterMesh={unregisterMesh}
            hoveredId={hoveredId}
            fuseProgress={fuseProgress}
          />
        </group>
      )}
    </WixarikaVRFloatingPanel>
  );
}

export default WixarikaVRBookPanel;
