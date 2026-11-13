# Design

## Context

El proyecto utiliza Three.js r170 y React Three Fiber para una experiencia WebXR inmersiva y un modo visor móvil con pantalla dividida estereoscópica.
Actualmente el renderizado estereoscópico utiliza coordenadas CSS lógicas en lugar del búfer de dibujo real, WebXR no escala el framebuffer, las texturas de la escena no tienen filtrado anisótropo, y las tarjetas culturales presentan fuentes pequeñas con párrafos densos y una mezcla de más de 6 colores en los textos.

## Goals / Non-Goals

**Goals:**
- Garantizar texto 100% nítido en WebXR y visor móvil estereoscópico.
- Establecer una paleta fija y estricta de exactamente 2 colores para tipografía en toda la interfaz VR: `#ffffff` (Primario / Títulos) y `#fde047` (Secundario / Metadatos y Palabras Clave).
- Incrementar el tamaño tipográfico en tarjetas culturales (títulos >= 0.085m, cuerpo >= 0.050m) y simplificar el contenido a palabras clave concisas.

**Non-Goals:**
- No se alterará la lógica de navegación ni el enrutamiento de Supabase / BiblioVR.
- No se modificará el reproductor de video ya probado ni sus controles de transporte.

## Decisions

### 1. Drawing buffer físico en `StereoVRManager.jsx`
- **Decisión**: Cambiar `gl.getSize(...)` por `gl.getDrawingBufferSize(sizeVec.current)` y fijar `camera.focus = 2.2`.
- **Razón**: En smartphones con pantallas de alta densidad (DPR 2.5 - 3.0), `getSize` reduce la resolución a 1/3, haciendo ilegible cualquier texto. `getDrawingBufferSize` aprovecha todos los píxeles reales del panel OLED/LCD.
- **Alternativa descartada**: Escalar manualmente multiplicando por `window.devicePixelRatio`, descartada porque WebGL ya gestiona la resolución exacta en el drawing buffer.

### 2. Escalado y foveación cero en `WebXRManager.jsx`
- **Decisión**: Inyectar `gl.xr.setFramebufferScaleFactor(1.5)` y `gl.xr.setFoveation(0)` al evento `sessionstart`.
- **Razón**: La foveación de visores Standalone (Meta Quest / Pico) difumina la periferia para ahorrar GPU; para interfaces de lectura en museos, la claridad homogénea es prioritaria.
- **Alternativa descartada**: Forzar escala 2.0 en todos los dispositivos; se descarta por riesgo de caída de framerate en visores móviles gama media, manteniendo 1.5 como punto óptimo.

### 3. Traversal anisótropo en `MuseumModel.jsx`
- **Decisión**: Al recibir el objeto `scene` del GLTF, recorrer cada malla y material para asignar `texture.anisotropy = gl.capabilities.getMaxAnisotropy()` (usualmente 16×) y `LinearMipmapLinearFilter`.
- **Razón**: Permite leer cédulas pegadas en paredes circulares cuando el usuario las mira desde ángulos oblicuos sin que el mipmapping las vuelva borrosas.

### 4. Paleta tipográfica de 2 colores en `wixarikaTheme.js` y componentes
- **Decisión**: Definir formalmente:
  ```javascript
  export const VR_TYPOGRAPHY_PALETTE = {
    primary: '#ffffff',   // Títulos principales, conceptos clave y acciones primarias
    secondary: '#fde047'  // Subtítulos, cotas, viñetas secundarias y metadatos
  };
  ```
  Actualizar `WixarikaVRCard.jsx`, `WixarikaVRFloatingPanel.jsx`, `WixarikaVRBookPanel.jsx` y `MuseumScene.jsx` para ceñirse a estos 2 colores.
- **Razón**: Reduce la fatiga cognitiva, unifica el estilo visual sagrado solar/obsidiana y garantiza contraste WCAG AAA superior a 14:1.

### 5. Reestructuración de contenidos a palabras clave
- **Decisión**: Reemplazar los textos largos de `CULTURAL_STATIONS` en `MuseumScene.jsx` por una estructura basada en palabras clave culturales directas (ej. `• Tatewari: Abuelo Fuego`, `• Kauyumari: Guía espiritual`).

## Risks / Trade-offs

- **[Riesgo] Mayor carga de GPU por anisotropic filtering 16× y buffer completo** → *Mitigación*: La escena es estática (sala interior de bajo poligonaje), Three.js mantiene más de 60 fps en dispositivos móviles.
- **[Riesgo] Textos grandes desbordando tarjetas existentes** → *Mitigación*: Se sintetizó el contenido para tener menos palabras con mayor tamaño, ocupando la misma superficie de panel sin colisiones.
