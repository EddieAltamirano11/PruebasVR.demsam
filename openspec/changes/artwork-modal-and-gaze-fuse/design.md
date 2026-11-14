# Design: Modal de Cuadros Sagrados (Deidades y Fiestas) y Calibración de Gaze Fuse a 3 Segundos

## Context

El museo 3D contiene 9 cuadros sagrados con mallas GLB nombradas en `museo_wixarika_v14.glb` (`lienzo_tatewari_nierika`, `lienzo_fiesta_namawita_neixa`, etc.) y texturas asociadas en `public/texturas/`. Para profundizar la experiencia museográfica, al hacer clic sobre estos cuadros se desplegará un modal flotante frente al usuario (Opción C) ocultando el menú principal. Ver `proposal.md` y `specs/artwork-modal-interaction/spec.md`.

## Goals / Non-Goals

**Goals:**
- Mapear las 9 obras con datos antropológicos auténticos y sus imágenes correspondientes en `src/components/wixarika/wixarikaArtworksData.js`.
- Hacer clicables los cuadros en `MuseumModel.jsx` integrándolos en `registerMesh` de Gaze Fuse.
- Crear `WixarikaArtworkModal.jsx` con dimensiones `6.40m × 3.50m`, layout 1/3 (foto) + 2/3 (texto grande, paleta de 2 colores) y botón de cierre badge con cruz (`x`).
- Al seleccionar una obra, capturar la posición de la cámara y proyectar el modal a 3.5m al frente (`cameraPos + cameraDir * 3.5m`) con rotación `lookAt`.
- Lógica de visibilidad en `MuseumScene.jsx`:
  - `activeArtwork` (null o id de la obra seleccionada).
  - Si `activeArtwork` está activo, `showButtons = false` (oculta menú principal).
  - Botón inferior (`LowerToggleButton`): si `activeArtwork` está abierto, la acción es `setActiveArtwork(null)`; si no hay `activeArtwork`, alterna `showButtons`.
- Actualizar `GAZE_FUSE_DEFAULT_DURATION` a 3.0s y actualizar tests.

**Non-Goals:**
- Crear sub-paneles externos en los muros o duplicar texturas.
- Modificar la geometría estática de la sala GLB.

## Decisions

1. **Posicionamiento dinámico frente al usuario (Opción C):**
   - *Razón:* Los cuadros están distribuidos en muros opuestos (norte y oeste). Si el usuario está mirando a un cuadro en el muro norte y hace clic, mostrar la ventana a 3.5m en esa misma dirección de mirada evita que el usuario tenga que girar 180° hacia el muro sur para leer la información.
2. **Layout 1/3 Imagen y 2/3 Texto:**
   - *Razón:* Permite que la imagen de la deidad o fiesta tenga un tamaño respetable (`~2.0m × 2.0m`), dejando suficiente espacio horizontal (`~4.0m`) para que los títulos y el texto explicativo sean de gran tamaño y legibles a 3.5m sin apelmazarse.
3. **Botón de cierre en badge con cruz:**
   - *Razón:* El usuario solicitó un botón interno no muy grande ni con la palabra cerrar, sino una cruz (`x` de Lucide) en un badge con estilo ceremonial (cantera con bisel dorado).
4. **Calibración a 3.0 segundos de Gaze Fuse:**
   - *Razón:* 1.2 segundos podía provocar activaciones accidentales al recorrer con la vista el museo; 3.0 segundos otorga una interacción intencional y descansada.

## Risks / Trade-offs

- **[Riesgo]** El modal dinámico podría atravesar un muro si el usuario está muy pegado a él.
  → *Mitigación:* Se acota la distancia a `Math.min(3.5, distanciaAlCentro)` o se coloca a 3.2m - 3.5m, manteniéndose cómodamente dentro de la sala circular de 7.5m de radio.
- **[Riesgo]** Mallas hijas del GLB no emitiendo eventos de Three.js.
  → *Mitigación:* Se registra cada malla con `userData = { id, onClick, onSelect }` en `interactiveRegistry` para que tanto el raycaster de `GazeReticle` como los eventos nativos de puntero de R3F (`onClick`) capturen el evento.
