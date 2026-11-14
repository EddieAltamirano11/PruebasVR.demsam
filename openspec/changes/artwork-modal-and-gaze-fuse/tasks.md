# Tasks

## 1. Calibración de Gaze Fuse y Datos de las Obras

- [x] 1.1 Actualizar `GAZE_FUSE_DEFAULT_DURATION` a 3.0s en `gazeFuseService.js` y actualizar pruebas en `gazeFuseService.test.js`.
- [x] 1.2 Actualizar texto de mirada en `WixarikaWelcomeDashboard.jsx` para indicar 3 segundos.
- [x] 1.3 Crear archivo de datos `src/components/wixarika/wixarikaArtworksData.js` con las 6 deidades y 3 fiestas, sus rutas de textura en `public/texturas/`, títulos, subtítulos, palabras clave y descripciones concisas.

## 2. Componente Modal de Cuadro y Lógica de Escena

- [x] 2.1 Crear `WixarikaArtworkModal.jsx` con dimensiones `6.40m × 3.50m`, layout 1/3 (foto con textura) + 2/3 (descripción en texto grande), y botón badge ceremonial con cruz (`x` de Lucide).
- [x] 2.2 Actualizar `MuseumModel.jsx` para recorrer el GLB, identificar las mallas de los 9 cuadros y vincularlas al manejador de selección e interacción.
- [x] 2.3 Actualizar `MuseumScene.jsx` para integrar el estado de cuadro activo, proyectar el modal a 3.5m frente a la cámara (Opción C), ocultar el menú principal al abrir un cuadro y sincronizar el botón inferior (`LowerToggleButton`).

## 3. Pruebas y Validación de Calidad

- [x] 3.1 Actualizar pruebas unitarias en `wixarika.test.jsx` y `gazeFuseService.test.js` para cubrir la interactividad de obras y el nuevo temporizador de 3.0s.
- [x] 3.2 Ejecutar `npm run lint` y verificar 0 errores y 0 advertencias.
- [x] 3.3 Ejecutar `vitest run` y confirmar que todas las pruebas pasen al 100%.
- [x] 3.4 Ejecutar `npm run build` y validar el empaquetado de producción.
