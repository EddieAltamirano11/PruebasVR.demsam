# Proposal: Modal de Cuadros Sagrados (Deidades y Fiestas) y Calibración de Gaze Fuse a 3 Segundos

## Why

El museo cuenta con 9 cuadros en sus muros (6 deidades y 3 fiestas tradicionales) que actualmente son elementos estáticos. El usuario requiere que al interactuar con ellos (mediante clic o fijación de mirada) se abra un panel modal del mismo tamaño monumental que el menú principal (`6.40m × 3.50m`), situado directamente frente al observador (Opción C, ~3.5m), mostrando la obra fotográfica en 1/3 del espacio y una descripción cultural auténtica (INAH/INPI) en los 2/3 restantes con texto grande y legible. Asimismo, se requiere que solo exista una ventana abierta a la vez en pantalla, que el botón inferior gestione el ocultamiento del modal y la reapertura del menú principal, que el modal cuente con un botón discreto de cierre con cruz en badge ceremonial, y que el temporizador universal de Gaze Fuse se calibre a 3.0 segundos.

## What Changes

- **Interactividad en los 9 Cuadros de la Sala:**
  - Habilitar detección por clic y por Gaze Fuse en las mallas de los 6 cuadros de deidades (Tatewari, Tayau, Kauyumari, Takutsi Nakawe, Tatei Niwetsika, Tatei Haramara) y los 3 de fiestas (Namawita Neixa / Tambor, Tatei Neixa, Hikuri Neixa).
- **Componente Modal Monumental de Cuadro (`WixarikaArtworkModal.jsx`):**
  - Dimensiones iguales al menú principal: `6.40m × 3.50m`.
  - Posicionamiento frontal relativo a la cámara (Opción C): se despliega a 3.5m en la dirección de la mirada del observador y orientado hacia él.
  - Distribución asimétrica ergonómica:
    - 1/3 del ancho (lado izquierdo, `~2.13m`): Fotografía de la deidad o fiesta con textura nítida y marco ceremonial de oro/cantera.
    - 2/3 del ancho (lado derecho, `~4.27m`): Título en gran tamaño (`#1c1917`), subtítulo ceremonial (`#78350f`), palabras clave destacadas y síntesis cultural en tipografía maximizada.
  - Botón interno de cierre discreto con cruz (`x` de Lucide) en un badge ceremonial estilizado (fondo cantera y borde dorado).
- **Gestión de Visibilidad y Botón Flotante Inferior (`LowerToggleButton`):**
  - Al abrir un cuadro, se oculta automáticamente el Menú Principal (solo una ventana visible a la vez).
  - Si la ventana de cuadro está visible, el botón inferior la oculta.
  - Al presionar nuevamente el botón inferior, se abre el Menú Principal (no el cuadro).
  - Para reabrir un cuadro, el usuario debe hacer clic nuevamente sobre él.
  - El botón interno del modal de cuadro lo cierra y restaura el Menú Principal.
- **Calibración Global de Gaze Fuse a 3.0 Segundos:**
  - Actualizar `GAZE_FUSE_DEFAULT_DURATION` en `gazeFuseService.js` de 1.2s a 3.0s.
  - Actualizar leyendas visuales ("Fija tu mirada durante 3 segundos...").

## Capabilities

### New Capabilities
- `artwork-modal-interaction`: Define el comportamiento de interactividad para los 9 cuadros, despliegue del modal monumental 1/3-2/3 en la dirección del observador, alternancia de visibilidad con el menú principal y botón inferior, y calibración de Gaze Fuse a 3 segundos.

### Modified Capabilities
*(Ninguna; se integra como nueva capacidad cohesiva)*

## Impact

- `src/services/gazeFuseService.js`: Cambio de duración por defecto a 3.0s.
- `src/services/gazeFuseService.test.js`: Actualización de aserciones de prueba a 3.0s.
- `src/components/wixarika/WixarikaArtworkModal.jsx`: Nuevo componente para el modal monumental 1/3 foto y 2/3 descripción.
- `src/components/wixarika/WixarikaWelcomeDashboard.jsx`: Actualización de texto de ayuda de mirada a 3 segundos.
- `src/components/MuseumModel.jsx`: Registro de mallas de los 9 cuadros como objetivos interactivos.
- `src/components/MuseumScene.jsx`: Coordinación de estados entre Menú Principal, Modal de Cuadro y Botón Inferior.
