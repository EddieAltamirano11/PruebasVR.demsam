# Proposal: Refinamiento de Profundidad, Escala y Calidad Visual del Menú Principal VR

## Why

El usuario ha solicitado mejorar la espacialidad y acabado visual del menú principal en el Museo Wixárika:
1. El menú principal se percibe demasiado cerca del punto de origen y requiere situarse más atrás y con un tamaño monumental más grande para brindar una experiencia inmersiva y panorámica tipo exhibición sin saturar el campo visual.
2. Existen botones en el menú que todavía se muestran negros o con fondos oscuros (específicamente botones de navegación como "Libros de esta Sala", "Ver Libros de la Sala" con variante `solar` oscura y biseles negros `#040711`), rompiendo la armonía ceremonial y la paleta estricta de cantera/oro.
3. Ciertos iconos vectoriales se perciben pixelados o con bordes dentados debido a una resolución de textura reducida (256×256) combinada con `alphaTest` que recorta el suavizado antialias de los bordes transparentes.

## What Changes

- **Reposicionamiento y Escala Monumental del Menú:**
  - Desplazar el menú principal más hacia atrás en el eje Z: de `Z = 2.85m` a `Z = 3.75m`.
  - Ampliar dimensiones del panel: de `5.00m × 2.85m` a `6.40m × 3.50m`.
  - Ajustar altura del centro a `Y = 2.30m`, asegurando un despeje ergonómico respecto al suelo (`0.55m - 0.70m`).
  - Escalar proporcionalmente los tiles de inicio (`1.75m × 0.88m`), cabeceras y textos clave.
- **Eliminación Total de Botones y Marcos Negros:**
  - Sustituir todas las variantes oscuras (`solar` con `#0b101d`) en botones de sub-vistas por la variante clara de cantera ceremonial (`cantera`).
  - Eliminar el borde interior negro `#040711` en `WixarikaVRButton`, reemplazándolo por un marco de oro o cantera suave (`#e7dec8`), garantizando cero elementos negros en botones.
  - Asegurar la variante por defecto `cantera` en todos los botones VR.
- **Iconos Nítidos y Antialias de Alta Definición:**
  - Aumentar la resolución de rasterización SVG en `LucideVRIcon` a 512×512 píxeles.
  - Habilitar filtrado anisótropo (`anisotropy = 8`), espacio de color sRGB y mipmapping suave.
  - Reemplazar `alphaTest` por transparencia suave con `depthWrite={false}`, erradicando cualquier pixelado o recorte duro de bordes.

## Capabilities

### New Capabilities
- `dashboard-ergonomics-and-visuals`: Define los requerimientos de profundidad espacial, escala panorámica monumental, eliminación de artefactos oscuros y renderizado vectorial de iconos en alta definición.

### Modified Capabilities
*(Ninguna; las capacidades del proyecto se consolidan en este cambio)*

## Impact

- `src/components/MuseumScene.jsx`: Ajuste de coordenadas del `WixarikaWelcomeDashboard` a `Z = 3.75m`, `Y = 2.30m`.
- `src/components/wixarika/WixarikaWelcomeDashboard.jsx`: Dimensiones ampliadas a `6.40m × 3.50m`, escalado de tiles, unificación de botones a variante `cantera`.
- `src/components/wixarika/WixarikaVRButton.jsx`: Eliminación del marco `#040711`, variante por defecto `cantera`.
- `src/components/wixarika/LucideVRIcon.jsx`: Rasterizado en 512×512, eliminación de `alphaTest`, `depthWrite={false}`, filtrado anisótropo.
- `src/components/wixarika/wixarika.test.jsx`: Actualización y validación de pruebas unitarias.
