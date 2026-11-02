# Contexto del Proyecto: Museo Virtual Wixárika (WebXR)

> **ID de Conversación de Referencia (Antigravity Windows):** `bd3979ee-f3b6-4342-a17d-1d128e3945aa`  
> **Ruta original en Windows:** `C:\Users\ealta\.gemini\antigravity\brain\bd3979ee-f3b6-4342-a17d-1d128e3945aa`  
> **Fecha de migración a Linux:** Noviembre 2026

---

## 1. Estructura de Ramas en Git

* **`main`**: Rama de producción que mantiene la experiencia del **Bocho VR** (activa en `https://pruebasvr-demsam.pages.dev/`).
* **`demoBocho`**: Rama de respaldo creada para preservar intacta la versión del Bocho y su histórico.
* **`dev` / `develop`**: **RAMA DE TRABAJO ACTIVA.** Contiene la implementación del **Museo Virtual Wixárika 3D en WebXR**.
  * Despliegue en Cloudflare Pages: `https://dev.pruebasvr-demsam.pages.dev/`

---

## 2. Estado Actual de la Implementación

### Componentes Principales (`src/`):
1. **`src/App.jsx`**:
   * Orquesta la vista del museo.
   * Maneja el estado `vrMode` y el botón flotante *"Entrar a Modo VR"*.
   * Soporte dual: **WebXR nativo** (para visores/headsets compatibles) y **fallback estereoscópico móvil con giroscopio** (`StereoVRManager` + `VRDeviceOrientation` para visores como *Homido Grab* o *Google Cardboard*).
   * **Regla actual:** Por diseño del sprint, se omitieron menús 2D y retículas *gaze fuse* para centrarse en fluidez visual y escala espacial 1:1.

2. **`src/components/MuseumScene.jsx`**:
   * Lienzo R3F (`<Canvas>`) optimizado para alto rendimiento (`powerPreference: 'high-performance'`).
   * **Cámara a escala humana:** `PerspectiveCamera` situada en $Y = 1.60\text{ m}$ (altura de ojos de un visitante real). En modo pantalla se ubica en `[0, 1.6, 2.5]`, y en modo VR se centra en `[0, 1.6, 0]`.
   * **Navegación:** `OrbitControls` con amortiguación inercial (`dampingFactor: 0.05`), target en `[0, 1.4, 0]` y límites de distancia (`0.2 m` a `7.5 m`) para no atravesar los muros. Se desactiva automáticamente en VR (`enabled={!vrMode}`).
   * **Iluminación museográfica por cuadrantes:**
     * `ambientLight` general (intensidad 1.3).
     * `directionalLight` cenital en `[0, 7, 0]` (intensidad 1.2, simula la luz del domo).
     * 4 luces direccionales dedicadas (intensidad 0.6 c/u):
       * Norte ($-Z$): Panteón de Deidades Sagradas (`[0, 3.5, -4.5]`).
       * Este ($+X$): Pabellón de Gastronomía Tradicional (`[4.5, 3.5, 0]`).
       * Sur ($+Z$): Pabellón de Bienvenida / Kalihuey (`[0, 3.5, 4.5]`).
       * Oeste ($-X$): Pabellón de Fiestas y Ceremonias (`[-4.5, 3.5, 0]`).
     * `pointLight` cálida en `[0, 4, 0]` y `hemisphereLight` de rebote suelo-cielo.

3. **`src/components/MuseumModel.jsx`**:
   * Carga declarativa mediante `@react-three/drei` del modelo `public/museo_wixarika_v13.glb`.
   * Incluye `useGLTF.preload('./museo_wixarika_v13.glb')` para descarga anticipada en red.
   * Inserción limpia con `<primitive object={scene} dispose={null} />`.

---

## 3. Modelo 3D y Recursos (`public/`)

* **`public/museo_wixarika_v13.glb`** (y versiones previas v12, base):
  * Modelo GLB binario 100% autónomo (12.25 MB, sin dependencias externas de texturas).
  * Contiene los 4 cuadrantes cardinales completos, el óculo sagrado de *Tatewari* en el techo cónico y el tapete ceremonial circular en el suelo.
  * **Gastronomía:** Doble mesa curva ($R = 5.25\text{ m}$) con los 6 platillos sagrados (*Tortillas, Tamales, Atole, Caldo de Toro, Maíz Tostado, Perruri*) y repisa de elotes cocidos. Vajilla tradicional modelada en 3D (ollas vidriadas, cazuelas, comales, jícaras).
  * **Letreros gastronómicos:** Dimensiones $66\text{ cm} \times 22\text{ cm}$ inclinados $-26^\circ$ hacia la vista del espectador ($Y = 1.60\text{ m}$). Tipografía monumental de 148 a 230 pt (*Trebuchet Bold*) ocupando el 87–90% de la placa. Eliminado todo subtexto (únicamente el nombre del alimento, e.g. `MAÍZ TOSTADO`).

---

## 4. Scripts y Utilidades Clave (`scripts/`)

* `scripts/generate_museo_glb_v12.js`: Script Node.js que construye y empaqueta el binario GLB v12 unificando geometrías, materiales PBR y texturas.
* `scripts/generate_food_labels_v12.py`: Generador en Python (Pillow) de las texturas de alta resolución para los letreros de gastronomía.
* `scripts/generate_vistas_docx.py`: Generador del catálogo documental de 14 vistas en formato `.docx`.
* `scripts/generate_especificacion_tecnica_docx.py`: Generador de la especificación técnica en texto negro sobre la integración 3D, cámara e iluminación.
