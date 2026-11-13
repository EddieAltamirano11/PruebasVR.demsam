# Tasks

## 1. Nitidez de Renderizado VR (WebXR y Estereoscopía)

- [x] 1.1 Actualizar `src/components/StereoVRManager.jsx` para usar `gl.getDrawingBufferSize()` en lugar de `gl.getSize()`, calcular el viewport de cada ojo a resolución completa y fijar `camera.focus = 2.2`.
- [x] 1.2 Modificar `src/components/WebXRManager.jsx` para solicitar `gl.xr.setFramebufferScaleFactor(1.5)` y desactivar foveación periférica con `gl.xr.setFoveation(0)` al evento `sessionstart`.
- [x] 1.3 Actualizar `src/components/MuseumModel.jsx` para recorrer la escena GLTF y aplicar `anisotropy = gl.capabilities.getMaxAnisotropy()` y `LinearMipmapLinearFilter` en todas las texturas de materiales.

## 2. Paleta Tipográfica de 2 Colores y Síntesis de Contenido

- [x] 2.1 Exportar `VR_TYPOGRAPHY_PALETTE` en `src/components/wixarika/wixarikaTheme.js` con `#ffffff` (primario) y `#fde047` (secundario).
- [x] 2.2 Refactorizar `src/components/wixarika/WixarikaVRCard.jsx` aplicando la paleta de 2 colores y elevando los tamaños tipográficos (título a 0.088m, cuerpo a 0.052m, badges a 0.046m).
- [x] 2.3 Unificar los textos de `src/components/wixarika/WixarikaVRFloatingPanel.jsx` y `src/components/wixarika/WixarikaVRBookPanel.jsx` utilizando la paleta estricta de 2 colores.
- [x] 2.4 Sintetizar las descripciones en `CULTURAL_STATIONS` (`src/components/MuseumScene.jsx`) reemplazando textos largos por viñetas breves con palabras clave culturales de alto impacto.

## 3. Verificación de Calidad y Pruebas

- [x] 3.1 Actualizar pruebas unitarias en `src/components/wixarika/wixarika.test.jsx` para comprobar la paleta tipográfica y cumplimiento de contraste y tamaño angular.
- [x] 3.2 Ejecutar la suite completa `npm run qa` (`eslint`, `vite build`, `vitest`) asegurando cero errores y que ningún chunk de producción supere los 500 KB gzip.
