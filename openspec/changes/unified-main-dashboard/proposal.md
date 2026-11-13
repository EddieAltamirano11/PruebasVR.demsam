# Proposal

## Why

Actualmente, las salas culturales (`deidades`, `gastronomia`, `fiestas`), los videos y los libros se abren como menús y tarjetas flotantes independientes dispersos por las distintas paredes del museo, provocando que al seleccionar una opción el usuario sea redirigido o deba girar hacia otro cuadrante. Además, al iniciar el programa la cámara mira por defecto hacia el muro de deidades (Norte, -Z), de espaldas al menú principal de bienvenida (Sur, +Z). Por último, el menú principal está ubicado muy cerca del centro de la sala y sumamente pegado al suelo (su base queda a solo 13 cm de la superficie), lo que genera fatiga visual, incomodidad ergonómica y sensación de encierro en visores VR.

Es necesario consolidar el Menú Principal como el **único menú flotante interactivo** de la experiencia, haciendo que todas las secciones se desplieguen dentro de él; reorientar la cámara para que siempre inicie mirando al menú principal; y elevar, agrandar y alejar el menú del centro y del suelo para lograr una visualización cómoda, monumental y despejada.

## What Changes

- **Menú Flotante Único y Modular**: El Menú Principal (`WixarikaWelcomeDashboard.jsx`) se convierte en el contenedor único de la experiencia. Se eliminan los botones y tarjetas flotantes independientes colocadas en las paredes Norte, Este y Oeste. Al pulsar "Panteón de Deidades", "Gastronomía Tradicional", "Fiestas y Ceremonias", "Videos Culturales" o "Catálogo de Libros", el contenido se abre dentro del mismo menú principal mediante sub-vistas integradas (`view: 'home' | 'deidades' | 'gastronomia' | 'fiestas' | 'videos' | 'books'`), con botón de regreso "Volver al Menú" accesible en todo momento.
- **Orientación Inicial de Cámara hacia el Menú Principal**: Se configura la cámara inicial (en escritorio con OrbitControls y en WebXR/dispositivos móviles con giroscopio) para que al cargar la aplicación apunte de inmediato hacia el Menú Principal en el cuadrante Sur (+Z), eliminando la vista inicial hacia deidades.
- **Elevación, Ampliación y Posicionamiento Ergonómico**:
  - Distancia: Se aleja del centro de la sala colocándolo en `Z = 2.85m` (frente a la pared Sur).
  - Elevación: Se eleva su posición central a `Y = 2.15m`, garantizando que la base del panel quede a ~`0.72m` del suelo (altura ergonómica de cintura/mesa), eliminando la proximidad al piso.
  - Dimensiones: Se amplía a `5.00m` de ancho × `2.85m` de alto para una cobertura inmersiva óptima sin obstruir la vista superior.

## Capabilities

### New Capabilities
- `unified-main-dashboard`: Contenedor espacial único para toda la navegación del museo VR, con sub-vistas internas para salas de deidades, gastronomía, fiestas, reproductor de videos documentales y catálogo de libros, incluyendo orientación de cámara inicial y geometría ergonómica elevada.

### Modified Capabilities
- `vr-typography-palette`: Aplicación consistente de la paleta de 2 colores y tipografía de gran escala dentro de las sub-vistas integradas del menú principal.

## Impact

- Componentes afectados:
  - `src/components/wixarika/WixarikaWelcomeDashboard.jsx`: Gestión de estado de sub-vistas internas, visualización de fichas de salas culturales, incrustación de video player y book catalog, y botón de retorno.
  - `src/components/MuseumScene.jsx`: Retiro de botones/tarjetas flotantes dispersas en paredes; posicionamiento del menú unificado en `[0, 2.15, 2.85]`; configuración de la cámara inicial y OrbitControls hacia `+Z` (azimut `Math.PI`); y recentrado hacia el menú principal.
  - `src/components/VRDeviceOrientation.jsx`: Calibración inicial de yaw hacia `+Z` (`Math.PI`).
- Compatibilidad: Cero impacto en backend o librerías externas; todas las pruebas existentes de Vitest se mantienen verdes.
