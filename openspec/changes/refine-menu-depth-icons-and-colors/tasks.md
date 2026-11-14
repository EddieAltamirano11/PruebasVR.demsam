# Tasks

## 1. Fidelidad de Iconos y Eliminación de Fondos Negros

- [x] 1.1 Optimizar `LucideVRIcon.jsx` a 512×512, anisotropía 8, `sRGBColorSpace`, `depthWrite={false}` y transparencia suave eliminando `alphaTest`.
- [x] 1.2 Actualizar `WixarikaVRButton.jsx` fijando `variant="cantera"` como predeterminado y reemplazando el marco negro `#040711` por tono cantera/dorado `#e7dec8`.
- [x] 1.3 Modificar `WixarikaWelcomeDashboard.jsx` para cambiar los botones de libros (`btn-station-open-books-top` y `btn-station-books-bottom`) de `solar` a `cantera`.

## 2. Reposicionamiento y Escala Monumental del Menú

- [x] 2.1 Ampliar dimensiones del panel a `6.40m × 3.50m` en `WixarikaWelcomeDashboard.jsx` y reescalar proporcionalmente tiles, cabecera y textos con paleta de 2 colores.
- [x] 2.2 Reubicar el menú principal en `MuseumScene.jsx` a `position={[0, 2.30, 3.75]}`.
- [x] 2.3 Actualizar pruebas en `wixarika.test.jsx` para validar las nuevas dimensiones ergonómicas y distancia espacial.

## 3. Verificación Integral de Calidad

- [x] 3.1 Ejecutar `npm run lint` y corregir cualquier discrepancia de estilo o variables no utilizadas.
- [x] 3.2 Ejecutar `vitest run` y asegurar que todas las pruebas pasen al 100%.
- [x] 3.3 Ejecutar `npm run build` y validar que el empaquetado de producción se mantenga dentro de los límites de tamaño.
