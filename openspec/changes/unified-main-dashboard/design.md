# Design

## Context

En versiones anteriores, las estaciones culturales del Museo Wixárika estaban dispersas en las paredes Norte, Este y Oeste del Kalihuey Sagrado, con botones y tarjetas flotantes independientes en cada muro. Al pulsar una opción en el menú de bienvenida, la cámara se reorientaba bruscamente hacia ese muro y el menú principal se ocultaba, generando desorientación. Además, la cámara iniciaba mirando hacia el muro Norte (-Z) de espaldas al menú principal, y el menú estaba ubicado a solo `Z = 1.95m` y `Y = 1.48m`, casi tocando el suelo con su borde inferior.

## Goals / Non-Goals

**Goals:**
- Consolidar el Menú Principal como el **único menú flotante** del entorno 3D.
- Permitir que las salas culturales (`deidades`, `gastronomia`, `fiestas`), el reproductor de videos y el catálogo de libros se exploren dentro del mismo contenedor del Menú Principal mediante sub-vistas fluidas con botón de retorno.
- Garantizar que al iniciar la aplicación (en escritorio, WebXR y visor móvil con giroscopio) el usuario esté mirando frontalmente hacia el Menú Principal.
- Elevar el menú (`Y = 2.15m`), alejarlo del centro (`Z = 2.85m`) y agrandarlo (`5.00m × 2.85m`) para que su base quede despejada del suelo a ~`0.72m` (altura ergonómica de mesa/cintura) y cubra el campo visual con grandiosidad y legibilidad.

**Non-Goals:**
- No se elimina el modelo 3D del museo ni la ambientación ceremonial.
- No se cambia la lógica de audio ni los servicios de datos de libros y videos de la Biblioteca Solón Argüello.

## Decisions

### 1. Máquina de estados interna en `WixarikaWelcomeDashboard.jsx`
- **Decisión**: Implementar un estado interno `currentView` en el Menú Principal con los valores `'home' | 'deidades' | 'gastronomia' | 'fiestas' | 'videos' | 'books'`.
  - En `'home'`: Se muestran los 6 mosaicos ampliados originales.
  - En `'deidades'`, `'gastronomia'`, `'fiestas'`: Se despliega la cédula de la sala dentro de la superficie de cantera del menú, con viñetas de palabras clave, metadatos y botones de "Ver Libros" y "Volver al Menú".
  - En `'videos'`: Se incrusta el reproductor de videos documentales y ficha cultural con controles ergonómicos y botón de regreso.
  - En `'books'`: Se incrusta el catálogo de libros de la biblioteca con navegación anterior/siguiente y botón de regreso.
- **Razón**: El usuario mantiene un ancla espacial fija (el Menú Principal) sin saltos de cámara ni confusión visual.

### 2. Retiro de tarjetas y botones flotantes en las paredes
- **Decisión**: Eliminar en `MuseumScene.jsx` el renderizado de botones y tarjetas flotantes en las posiciones `[0, 1.4, -2.6]`, `[2.6, 1.4, 0]` y `[-2.6, 1.4, 0]`.
- **Razón**: Cumple estrictamente la solicitud del usuario de que el único menú flotante sea el principal.

### 3. Reorientación de cámara inicial hacia el Menú Principal
- **Decisión**:
  - En `PerspectiveCamera`: posición inicial `[0, 1.6, 0.4]` y target de `OrbitControls` en `[0, 2.10, 2.85]`.
  - En `MuseumScene.jsx`: `useEffect` inicial que asigna `orbitRef.current.target.set(0, 2.10, 2.85)` y ejecuta `update()`.
  - En `cameraRigRef`: rotación en Y de `Math.PI` para que en WebXR la dirección frontal natural del visor (0, 0, -1) apunte hacia el Sur (+Z, donde está el Menú Principal).
  - En `VRDeviceOrientation.jsx`: calibración de `targetYaw = Math.PI` para orientar al visor móvil hacia el menú al calibrar.
- **Razón**: Al cargar la experiencia, el usuario tiene el Menú Principal de bienvenida centrado en su mirada inmediatamente.

### 4. Elevación, ampliación y alejamiento del Menú Principal
- **Decisión**:
  - Posición: `[0, 2.15, 2.85]` (elevado a 2.15m y alejado a 2.85m del centro).
  - Dimensiones: `panelWidth = 5.00m`, `panelHeight = 2.85m`.
  - Distancia libre al suelo: `2.15 - (2.85 / 2) = 0.725m` (~72.5 cm), totalmente despegado del piso.
- **Razón**: Brinda una experiencia monumental, cómoda a la vista a nivel de ojos (1.60m mirando a 2.15m con leve inclinación ascendente natural de ~10°), eliminando la sensación de que el menú está tirado en el suelo.

## Risks / Trade-offs

- **Riesgo**: Que la incrustación de videos y libros requiera ajustar el ancho/alto del menú.
- **Mitigación**: Con dimensiones de `5.00m × 2.85m`, el área disponible es más que suficiente para albergar holgadamente el reproductor de video de 16:9 junto a la ficha cultural, o la portada del libro con sus metadatos y botones de navegación.
