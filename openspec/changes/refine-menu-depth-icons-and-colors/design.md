# Design: Refinamiento de Profundidad, Escala y Calidad Visual del Menú Principal VR

## Context

El Menú Principal del Museo Wixárika actúa como contenedor flotante único donde se exploran las salas culturales, el catálogo de libros y el reproductor de documentales. Para asegurar ergonomía WebXR óptima, el panel debe alejarse de la posición del usuario en el centro y escalar sus proporciones, suprimiendo materiales negros residuales y mejorando la rasterización de iconos vectoriales. Ver `proposal.md` y `specs/dashboard-ergonomics-and-visuals/spec.md`.

## Goals / Non-Goals

**Goals:**
- Desplazar la coordenada frontal a `Z = 3.75m` y elevar a `Y = 2.30m` con dimensiones de `6.40m × 3.50m`.
- Ampliar los tiles y botones interactivos para mantener tamaño angular óptimo según ISO 9241-210.
- Reemplazar todas las variantes `solar` oscuras por `cantera` en los botones de sub-vistas del dashboard.
- Retirar el plano interior `#040711` en `WixarikaVRButton.jsx`, unificando con borde claro de cantera.
- Mejorar la fidelidad de `LucideVRIcon.jsx` subiendo a textura 512×512, anisotropía 8, y eliminando `alphaTest` mediante `depthWrite={false}` y `transparent={true}`.

**Non-Goals:**
- Alterar la navegación libre 360° en modo computadora de escritorio.
- Introducir modelos 3D externos adicionales o modificar la geometría general del museo `.glb`.

## Decisions

1. **Profundidad Z = 3.75m y Escala 6.40m × 3.50m:**
   - *Razón:* A 3.75m de distancia, el panel subtend angularmente ~81° horizontalmente, lo cual coincide con el campo visual confortable humano y evita fatiga de convergencia en visores VR.
   - *Alternativa considerada:* Dejarlo en Z = 2.85m con 5m de ancho; provocaba sensación de cercanía excesiva y claustrofobia visual.

2. **Rasterizado SVG 512×512 con `depthWrite={false}` y Anisotropía 8:**
   - *Razón:* `alphaTest={0.01}` genera un corte binario (1-bit) que destruye el suavizado antialias en bordes diagonales y curvos de los iconos vectoriales. Con `depthWrite={false}` y transparencia estándar, WebGL interpola suavemente los píxeles de borde con mipmaps.
   - *Alternativa considerada:* Cargar fuentes tipográficas de iconos o geometrías 3D extruidas; aumentaría el peso del bundle innecesariamente frente a texturas SVG en memoria ultraligeras.

3. **Estandarización de `variant="cantera"`:**
   - *Razón:* La paleta aprobada es de cantera clara (`#faf6eb`) con marcos dorados (`#c69214`) e iconos ámbar (`#b45309`). Mantener botones con fondo `#0b101d` contrastaba de forma discordante.

## Risks / Trade-offs

- **[Riesgo]** Dimensiones mayores podrían intersecar con el muro sur del museo.
  → *Mitigación:* El muro sur del museo se ubica más allá de `Z = 4.20m`; a `Z = 3.75m` existe holgura espacial libre suficiente.
- **[Riesgo]** Mipmaps en texturas de 512×512 podrían generar un ligero consumo de memoria GPU adicional.
  → *Mitigación:* Se cachean mediante `iconTextureCache` (Map) en memoria; los ~15 iconos en 512×512 consumen menos de 15 MB de VRAM combinada.
