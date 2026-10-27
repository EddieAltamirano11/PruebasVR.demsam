import React, { useState } from 'react';
import { Text } from '@react-three/drei';
import { WixarikaVRFloatingPanel } from './WixarikaVRFloatingPanel.jsx';
import { WixarikaVRCard } from './WixarikaVRCard.jsx';
import { WixarikaVRButton } from './WixarikaVRButton.jsx';
import { SoundFX } from '../../services/audioService.js';

/**
 * Catálogo base de libros de la cultura Wixárika disponibles
 * en la Biblioteca Pública Profesor Solón Argüello (Tepic, Nayarit).
 * Compatible con la API de Luis Carlos (PostgreSQL + Prisma) y arquitectura de Eddie.
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
    synopsis: "Guía de lectura iconográfica sobre tablas de estambre, jícaras sagradas (rukuri) y bordados con chaquira: cómo descifrar el águila bicéfala, el peyote y la flor de cuatro pétalos."
  }
];

/**
 * WixarikaVRBookPanel - Panel 3D de Libros y Fomento Lector en VR
 * Desarrollado para el quiosco cultural en la Biblioteca Profesor Solón Argüello.
 * 
 * @param {Object} props
 * @param {Array} [props.books] - Lista de libros (si no se especifica, usa el catálogo por defecto)
 * @param {string} [props.initialBookId] - ID de libro seleccionado inicialmente
 * @param {Function} [props.onSelectBook] - Callback al cambiar de libro
 * @param {Function} [props.onLoanRequest] - Callback al solicitar un libro
 * @param {Function} [props.onClose] - Callback para cerrar el panel
 * @param {Array<number>} [props.position] - Posición en espacio 3D
 * @param {Array<number>} [props.rotation] - Rotación 3D
 * @param {Function} [props.onRegister] - Registro en raycaster Gaze Fuse
 * @param {Function} [props.onUnregister] - Desregistro
 * @param {string} [props.hoveredId] - ID de botón enfocado
 * @param {number} [props.fuseProgress=0] - Progreso del Gaze Fuse
 */
export function WixarikaVRBookPanel({
  books = DEFAULT_WIXARIKA_BOOKS,
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
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (initialBookId) {
      const idx = books.findIndex((b) => b.id === initialBookId);
      if (idx !== -1) return idx;
    }
    return 0;
  });

  const [loanStatus, setLoanStatus] = useState(null); // null | 'success'

  const currentBook = books[currentIndex] || books[0];
  const totalBooks = books.length;

  const handlePrev = () => {
    const nextIdx = (currentIndex - 1 + totalBooks) % totalBooks;
    setCurrentIndex(nextIdx);
    setLoanStatus(null);
    SoundFX.playClick();
    onSelectBook?.(books[nextIdx]);
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % totalBooks;
    setCurrentIndex(nextIdx);
    setLoanStatus(null);
    SoundFX.playClick();
    onSelectBook?.(books[nextIdx]);
  };

  const handleLoan = () => {
    setLoanStatus('success');
    SoundFX.playClick();
    onLoanRequest?.(currentBook);
  };

  return (
    <WixarikaVRFloatingPanel
      title="BIBLIOTECA PÚBLICA PROFESOR SOLÓN ARGÜELLO"
      subtitle="Fondo de Culturas Vivas • Catálogo de Libros Wixárikas"
      width={2.65}
      height={2.10}
      position={position}
      rotation={rotation}
      variant={currentBook?.variant || 'solar'}
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
          label="◀ Anterior"
          variant="obsidian"
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
            <meshBasicMaterial color="#0b1324" transparent opacity={0.88} />
          </mesh>
          <Text
            position={[0, 0.022, 0.002]}
            fontSize={0.046}
            color="#fde047"
            anchorX="center"
            anchorY="middle"
          >
            {`Libro ${currentIndex + 1} de ${totalBooks}`}
          </Text>
          <Text
            position={[0, -0.028, 0.002]}
            fontSize={0.030}
            color="#38bdf8"
            anchorX="center"
            anchorY="middle"
          >
            {`Categoría: ${currentBook?.category || 'General'}`}
          </Text>
        </group>

        <WixarikaVRButton
          id="btn-book-next"
          label="Siguiente ▶"
          variant="obsidian"
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

      {/* 2. Tarjeta 3D del Libro Seleccionado */}
      {currentBook && (
        <group position={[0, -0.15, 0.01]}>
          <WixarikaVRCard
            title={currentBook.title}
            subtitle={`Autor: ${currentBook.author} (${currentBook.year})`}
            category={currentBook.category}
            badge={currentBook.badge}
            description={currentBook.synopsis}
            metadata={[
              { label: 'Cota de Biblioteca', value: currentBook.callNumber },
              {
                label: 'Disponibilidad',
                value: loanStatus === 'success'
                  ? '✓ ¡Apartado para tu visita! Pasa al mostrador con tu credencial.'
                  : '🟢 Disponible para Préstamo a Sala y Domicilio'
              }
            ]}
            actions={[
              {
                id: 'btn-loan-request',
                label: loanStatus === 'success' ? '✓ Libro Solicitado' : 'Apartar en Mostrador [📚]',
                icon: loanStatus === 'success' ? '✓' : '📖',
                variant: loanStatus === 'success' ? 'hikuri' : 'solar',
                onClick: handleLoan
              }
            ]}
            width={2.40}
            height={1.22}
            variant={currentBook.variant || 'solar'}
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
