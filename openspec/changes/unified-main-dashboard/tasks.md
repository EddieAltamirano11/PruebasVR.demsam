# Tasks

## 1. Menú Principal Modular con Sub-vistas Internas
- [x] 1.1 Modificar `WixarikaWelcomeDashboard.jsx` para admitir estado de navegación interna (`currentView`: `'home' | 'deidades' | 'gastronomia' | 'fiestas' | 'videos' | 'books'`) y botón de retorno "Volver al Menú".
- [x] 1.2 Implementar dentro del Menú Principal las sub-vistas de salas culturales (`deidades`, `gastronomia`, `fiestas`) con tipografía maximizada, viñetas de palabras clave y opción para consultar libros de la sala.
- [x] 1.3 Integrar el catálogo de videos documentales y catálogo de libros dentro del mismo contenedor del Menú Principal.
- [x] 1.4 Aumentar las dimensiones base del Menú Principal a `5.00m × 2.85m`, optimizando el espaciado interior.

## 2. Retiro de Menús Flotantes en Paredes y Orientación Inicial de Cámara
- [x] 2.1 Eliminar en `MuseumScene.jsx` los botones interactivos (`btn-station-*`) y tarjetas flotantes independientes en las paredes cardinales, dejando el Menú Principal como el único menú flotante.
- [x] 2.2 Reubicar el Menú Principal en `[0, 2.15, 2.85]`, despegándolo del suelo (~0.72m de altura libre) y alejándolo del centro.
- [x] 2.3 Configurar `PerspectiveCamera`, `OrbitControls` y `cameraRigRef` para que al iniciar la aplicación la vista esté dirigida de inmediato hacia el Menú Principal (+Z).
- [x] 2.4 Actualizar la calibración en `VRDeviceOrientation.jsx` para que el visor móvil centre la orientación hacia `Math.PI` (+Z).

## 3. Verificación y Calidad
- [x] 3.1 Actualizar pruebas unitarias en `wixarika.test.jsx` si aplica para validar la navegación y geometría unificada.
- [x] 3.2 Ejecutar `npm run qa` y verificar 0 errores en ESLint, bundle < 500 KB gzip y 100% pruebas de Vitest pasando.
- [x] 3.3 Validar la propuesta con `openspec validate unified-main-dashboard`.
