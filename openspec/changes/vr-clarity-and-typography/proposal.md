# Proposal

## Why

En el modo de visualización en PC los textos se aprecian nítidos, pero en modo VR (tanto en WebXR inmersivo como en el modo estereoscópico móvil para visores Cardboard/Homido) los textos y cédulas se perciben borrosos y de difícil lectura debido a submuestreo de buffer, foveación agresiva y falta de filtrado anisótropo. Además, la interfaz presenta una sobrecarga visual con múltiples colores tipográficos inconsistentes y fuentes excesivamente pequeñas con textos largos que saturan al usuario en un entorno espacial. Es necesario elevar drásticamente la nitidez del pipeline de renderizado VR y unificar la tipografía en una paleta estricta de solo 2 colores con fuentes grandes y textos sintetizados a palabras clave.

## What Changes

- **Corrección de búfer estereoscópico móvil**: Modificación de `StereoVRManager.jsx` para utilizar `gl.getDrawingBufferSize()` en lugar de `gl.getSize()`, renderizando cada ojo a la resolución física real de la pantalla y calibrando la convergencia focal a 2.2 m.
- **Configuración de calidad WebXR**: Ajuste en `WebXRManager.jsx` para elevar el factor de escala del framebuffer (`framebufferScaleFactor = 1.5` a `2.0`) y desactivar la foveación periférica fija (`setFoveation(0)`).
- **Filtrado anisótropo en texturas 3D**: Actualización en `MuseumModel.jsx` para recorrer materiales al cargar el modelo GLTF y aplicar `map.anisotropy = gl.capabilities.getMaxAnisotropy()` junto con `THREE.LinearMipmapLinearFilter`.
- **Paleta tipográfica estricta de 2 colores**: Definición y aplicación de una paleta exclusiva de 2 colores para texto en todo el sistema VR (`#ffffff` / Blanco Puro de Alto Contraste para títulos y palabras clave, y `#fde047` / Oro Sagrado Cálido para subtítulos, etiquetas secundarias y datos de apoyo). Se eliminan colores secundarios dispersos (turquesas, verdes, grises oscuros, etc.) en los textos de tarjetas y paneles.
- **Ampliación de tamaños tipográficos y síntesis de contenido**: Aumento del tamaño de fuente en títulos, subtítulos y cédulas culturales, reduciendo los párrafos extensos a resúmenes breves y palabras clave de alto impacto cultural.

## Capabilities

### New Capabilities
- `vr-rendering-clarity`: Pipeline de renderizado inmersivo en Three.js/WebXR con escalado de framebuffer, foveación cero, buffer drawing nativo para estereoscopía y filtrado anisótropo de texturas.
- `vr-typography-palette`: Sistema de diseño tipográfico VR con paleta estricta de 2 colores, escala angular mínima de legibilidad y contenido conciso por palabras clave.

### Modified Capabilities
<!-- No existing OpenSpec capabilities existed prior to this initialization. -->

## Impact

- Componentes afectados: `StereoVRManager.jsx`, `WebXRManager.jsx`, `MuseumModel.jsx`, `MuseumScene.jsx`, `WixarikaVRCard.jsx`, `WixarikaVRFloatingPanel.jsx`, `WixarikaVRBookPanel.jsx`, `wixarikaTheme.js`.
- Pruebas y validación: Actualización de `wixarikaTheme.js` y `wixarika.test.jsx` para verificar la paleta de 2 colores, legibilidad angular y nuevos componentes/servicios.
- Sin cambios en dependencias externas o APIs backend.
