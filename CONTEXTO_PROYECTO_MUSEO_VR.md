# Manual de Contexto, Arquitectura y Filosofía de Diseño: Museo Virtual Wixárika (WebXR)

> **Documento de Traspaso y Referencia Técnica para Entorno Linux**  
> **Rama Activa de Trabajo:** `develop`  
> **Repositorio:** `https://github.com/EddieAltamirano11/PruebasVR.demsam.git`  
> **Fecha de Actualización:** Noviembre 2026  
> **Proyecto:** Museo Virtual Wixárika 3D / WebXR — Biblioteca Pública Profesor Solón Argüello (Tepic, Nayarit)

---

## 1. Contexto General del Proyecto

El proyecto **Museo Virtual Wixárika** es una experiencia museográfica inmersiva en 3D y Realidad Virtual diseñada para correr directamente en el navegador mediante **WebXR** y WebGL.

### Propósito Cultural y Técnico
* **Objetivo:** Difundir el patrimonio cultural, cosmovisión, panteón sagrado, gastronomía tradicional y ceremonias del pueblo Wixárika (Huichol), preservado en el acervo de la Biblioteca Pública Profesor Solón Argüello.
* **Compatibilidad de Hardware:**
  * **Modo VR Nativo (WebXR):** Meta Quest, HTC Vive, Pico u otros visores con navegador WebXR.
  * **Modo VR Móvil / Cardboard (Fallback):** Teléfonos Android / iOS insertados en visores tipo *Homido Grab* o *Google Cardboard*, utilizando giroscopio del dispositivo (`DeviceOrientation`) y renderizado dual estereoscópico (`StereoVRManager`).
  * **Modo Pantalla 3D:** Computadoras de escritorio o laptops mediante navegación libre 360° con ratón/trackpad (`OrbitControls`).

### Estructura de Ramas en Git
* **`develop` (RAMA ACTIVA PRINCIPAL):** Es la rama donde reside todo el desarrollo actual, las pruebas de usuario, la simplificación ceremonial y las optimizaciones de UI/UX. **Todo nuevo commit y push se realiza sobre `develop`**.
* **`main`:** Rama de producción original (Bocho VR en Cloudflare Pages).
* **`demoBocho`:** Respaldo histórico del prototipo del automóvil interactivo.

---

## 2. Filosofía de Diseño Ceremonial y Accesibilidad en VR

En entornos de Realidad Virtual, las reglas tradicionales de diseño web 2D no funcionan. La sobrecarga de estímulos, textos diminutos, colores chillones o menús saturados producen **fatiga cervical, desorientación, mareo cinético (*motion sickness*) e ilegibilidad**.

A lo largo del proyecto se definió y consolidó una **filosofía de diseño estricta**:

```
                                  FILOSOFÍA DE DISEÑO VR
   ┌───────────────────────┬─────────────────────────┬──────────────────────────┐
   │    Paleta Cantera     │    Minimalismo Visual   │  Tipografía Monumental   │
   │  Cálida y Ceremonial  │  Cero botones basura    │  Legibilidad sin fatiga  │
   │  (#fbf7ee / #1c1917)  │   Cero emojis / 3 btn   │  Escala > 0.12m en 3D    │
   └───────────────────────┴─────────────────────────┴──────────────────────────┘
```

### A. Paleta de Colores Sagrada y Austera (Cero Colores Estridentes)
* **Prohibido:** Colores sintéticos, fosforescentes, azules neón o estilos "cyberpunk".
* **Inspiración:** La cantera rosa y dorada de los edificios históricos de Tepic, la madera del Kalihuey y los pigmentos tradicionales Wixárika:
  * **Fondos de Cédulas y Paneles:** Cantera clara ceremonial (`#fbf7ee`, `#faf6eb`, `#f3ebd6`, `#f4ebd8`).
  * **Texto Principal de Lectura:** Carbón oscuro / piedra de río (`#1c1917`, `#292524`). Garantiza un contraste nítido contra la cantera clara sin el destello agresivo del blanco sobre negro.
  * **Acentos Culturales:** Ocre sagrado y ámbar ceremonial (`#b45309`, `#78350f`).
  * **Molduras y Marcos:** Oro ceremonial bruñido (`#d4af37`, `#c69214`).
  * **Fondo del Lienzo 3D:** Azul noche profundo ceremonial (`#0a0f1d`), que resalta la iluminación cálida del quiosco y los cuadros.

### B. Cero Sobrecarga de Botones (Minimalismo Radical)
* En VR, **cada botón adicional es un obstáculo visual** y una fuente de errores para el puntero de la mirada (*Gaze Fuse*).
* **Regla de 3 Controles Máximo:**
  * En la sala de video se eliminaron todos los botones secundarios (`-10s`, `+10s`, selectores técnicos `720p/480p`, botones duplicados de regreso).
  * Se mantuvieron únicamente **3 botones esenciales**:
    1. `Iniciar / Pausar` (`btn-video-play`)
    2. `Silencio / Audio` (`btn-video-mute`)
    3. `Ampliar Pantalla / Ver Ficha` (`btn-video-cinema`)
* **Botones de Retorno Compactos:**
  * En lugar de letreros largos y aparatosos como *"Volver al Menú Principal"*, se utiliza un botón badge discreto con solo el icono de flecha hacia la izquierda (`arrow-left`), ubicado en la esquina superior izquierda del panel.
* **Cero Emojis:** Todos los iconos son vectoriales de alta definición mediante Lucide Icons (`LucideVRIcon.jsx`), con trazos sólidos (`strokeWidth={2.2 - 2.6}`) y color unificado `#b45309`.

### C. Tipografías Monumentales y Espaciado de Lectura
* Las pantallas de los visores VR amplifican los píxeles mediante lentes biconvexas. Cualquier texto con tamaño menor a `0.10m` en el espacio 3D se vuelve borroso e ilegible.
* **Títulos de Obras y Secciones:** Tamaño `0.15m` a `0.16m`, con interlineado holgado (`1.20 - 1.25`) y centrado geométrico.
* **Cédulas y Sinopsis:** Tamaño `0.125m` a `0.130m` con `lineHeight={1.40 - 1.45}`.
* **Eliminación de Relleno Innecesario:**
  * Se retiraron etiquetas redundantes como *"Documental Ceremonial"*, fuentes bibliográficas largas que ocupaban espacio útil en cédulas y subtítulos técnicos.
  * Todo el espacio ahorrado se aprovechó para agrandar el recuadro de lectura y el tamaño de la tipografía.
* **Jerarquía de Cédulas:**
  1. Nombre sagrado de la deidad (ej. `TAKUTSI NAKAWE`).
  2. Subtítulo en caja cantera (`«Takutsi Nakawe» · Nuestra Abuela Crecimiento / MADRE PRIMORDIAL DE LA TIERRA`).
  3. Viñetas con separación superior para no invadir el recuadro.
  4. Recuadro destacado con la narrativa mitológica en letra grande.

---

## 3. Innovaciones de Interacción Espacial

### A. Rotación Suave del Quiosco (Opción 1: Smooth Carousel)
* **El Problema en VR:** Obligar al usuario a rotar $180^\circ$ sobre su propio eje físico en visores sin cables o en sillas fijas produce fatiga cervical, pérdida de orientación y riesgo de enredo o tropiezo.
* **La Solución Implementada:** **El museo gira hacia la mirada del usuario.**
* Al seleccionar una sección en el menú principal:
  * **Deidades Sagradas:** El quiosco rota $180^\circ$ ($\pi\text{ rad}$) en el eje Y $\rightarrow$ El muro de las 6 Deidades queda exactamente frente al usuario ($+Z$).
  * **Gastronomía Tradicional:** El quiosco rota $-90^\circ$ ($-\pi/2\text{ rad}$) $\rightarrow$ El muro de Gastronomía se alinea al frente.
  * **Fiestas y Ceremonias:** El quiosco rota $+90^\circ$ ($\pi/2\text{ rad}$) $\rightarrow$ El muro de Fiestas se alinea al frente.
  * **Menú / Inicio:** El quiosco rota de regreso a $0^\circ$.
* **Cinemática:** Se utiliza `THREE.MathUtils.damp(current, target, 4.5, delta)` en `useFrame`, logrando una transición ceremonial suave de aproximadamente 0.7 segundos sin saltos bruscos.
* **Ocultamiento del Menú:** Al elegir una sala, el menú flotante se oculta automáticamente para que el visitante contemple directamente las obras en 3D en la pared sin barreras visuales. El menú puede volver a desplegarse en cualquier instante con el botón insignia inferior (*Mostrar Menú*).

### B. Fijación Visual Calibrada a 2.0 Segundos (Gaze Fuse)
* Se utiliza un sistema de puntero central (*Gaze Reticle*) con indicador circular de progreso.
* **Duración Calibrada:** Se ajustó a **2.0 segundos continuos** (`GAZE_FUSE_DEFAULT_DURATION = 2.0`). Sigue evitando activaciones accidentales mientras el visitante lee, pero reduce un tercio la espera por acción (antes 3.0 s). El gatillo físico del visor (Homido Grab) activa al instante sin esperar.
* **Aislamiento de Clics Fantasma:** Cuando se abre una ventana modal o ficha de cuadro, el raycaster desactiva temporalmente todos los objetos interactivos que están detrás del modal. De esta forma, el usuario no "traspasa" el menú ni activa cuadros de fondo por accidente.

### C. Geometría y Cero Solapamiento en la Sala de Video
* Para evitar que la pantalla de video se encimara sobre los botones de navegación:
  * **Selector Superior:** `btn-dash-video-prev`, `Video X de 4` y `btn-dash-video-next` se ubicaron en $Y = 1.20\text{ m}$.
  * **Bloque de Pantalla:** Se descendió a $Y = -0.22\text{ m}$.
  * **Márgenes Libres Garantizados:** Más de **36 cm de distancia libre** en modo normal y más de **22 cm** en modo pantalla ampliada (*Cinema Mode*).
  * **Dimensiones 16:9 Nativas:** Pantalla de $2.60\text{ m} \times 1.46\text{ m}$ (modo normal) y $3.60\text{ m} \times 2.02\text{ m}$ (modo cine).

### D. Reproducción Resiliente de Video Streaming
* `preload = 'auto'` en el elemento `<video>` para búfer inmediato de datos.
* **Manejo de Autoplay de Navegadores:** Si el navegador móvil o visor bloquea la reproducción automática con audio debido a restricciones de seguridad, el reproductor aplica un fallback instantáneo en silencio (*muted*) y le notifica amablemente al usuario: *"Audio en silencio · Pulsa Audio para activar sonido"*, permitiendo que el video continúe sin congelarse ni mostrar errores.
* **Optimización de Cambio de Pista:** Al pulsar *Anterior* o *Siguiente*, si los videos de demostración comparten el mismo archivo local (`videoPrueba_720p.mp4`), el reproductor no aborta ni descarga de nuevo el archivo; simplemente reinicia el contador de tiempo a cero (`currentTime = 0`), logrando una respuesta instantánea.
* **Actualización en WebGL:** `tex.needsUpdate = true` dentro de `useFrame` activo en cada fotograma para garantizar que la pantalla nunca se quede en negro durante la reproducción.

---

## 4. Mapa de Componentes y Archivos Clave

```
c:/GitHub/PruebasVR.demsam/
├── public/
│   ├── museo_wixarika_v14.glb       # Modelo 3D optimizado con los 9 cuadros interactivos
│   └── videos/
│       ├── videoPrueba_720p.mp4     # Video documental streaming 720p (HTTP 206)
│       ├── videoPrueba_480p.mp4     # Video documental versión ligera 480p
│       └── videoPrueba_poster.jpg   # Poster del documental ceremonial
├── src/
│   ├── App.jsx                      # Entrada principal, modos VR/2D, layout administrativo
│   ├── components/
│   │   ├── MuseumScene.jsx          # Lienzo Canvas R3F, quiosco giratorio, luces, cámara
│   │   ├── MuseumModel.jsx          # Carga de GLB v14 y vinculación de eventos de los 9 cuadros
│   │   └── wixarika/
│   │       ├── WixarikaWelcomeDashboard.jsx # Menú principal monumental (6.4m x 3.5m)
│   │       ├── WixarikaVRVideoPlayer.jsx    # Reproductor 3D de video con controles simplificados
│   │       ├── WixarikaVRVideoPanel.jsx     # Catálogo audiovisual cultural
│   │       ├── WixarikaArtworkModal.jsx     # Modal monumental de deidades y fiestas
│   │       ├── WixarikaVRButton.jsx         # Botón cantera interactivo 3D
│   │       ├── TsikuriDiamond.jsx           # Ojo de Dios decorativo ceremonial
│   │       ├── LucideVRIcon.jsx             # Iconos vectoriales limpios sin emojis
│   │       └── wixarikaArtworksData.js      # Datos curatoriales de las 9 obras
│   └── services/
│       ├── audioService.js          # Audio tradicional y efectos de clic/hover
│       ├── gazeFuseService.js       # Lógica matemática de temporización visual (2.0s)
│       └── videoService.js          # Detección HTTP Range y resolución de fuentes
```

---

## 5. Guía de Puesta en Marcha en Entorno Linux

Al clonar o transferir el proyecto a un sistema operativo basado en Linux (Ubuntu, Debian, Fedora, Arch, etc.), sigue estos pasos:

### 1. Requisitos Previos
* **Node.js:** Versión 18.x, 20.x o 22.x LTS instalada.
* **npm:** Versión 9+ o 10+.
* **Git:** Configurado con tus credenciales de GitHub y tu llave SSH.

```bash
# Verificar versiones
node -v
npm -v
git --version
```

### 2. Clonación y Selección de Rama
```bash
# Clonar el repositorio
git clone git@github.com:EddieAltamirano11/PruebasVR.demsam.git
cd PruebasVR.demsam

# IMPORTANTE: Trabajar sobre la rama develop
git checkout develop
git status
```

### 3. Instalación de Dependencias
```bash
npm install
```

### 4. Ejecución del Servidor de Desarrollo
```bash
npm run dev
```
* Vite iniciará la aplicación en `http://localhost:3000/`.
* Para probar en un teléfono móvil conectado a la misma red WiFi que la máquina Linux, puedes correrlo con host expuesto:
  ```bash
  npm run dev -- --host 0.0.0.0 --port 3000
  ```
  Y abrir la dirección IP local de tu máquina Linux (ej. `http://192.168.1.X:3000/`) en el navegador del teléfono móvil o del visor VR.

### 5. Suite de Verificación de Calidad (QA)
Antes de realizar cualquier commit o entrega, ejecuta siempre estos comandos en Linux:
```bash
# 1. Pruebas unitarias completas (106 tests deben pasar)
npm test

# 2. Análisis estático de código (0 errores, 0 advertencias)
npm run lint

# 3. Compilación de producción en Vite
npm run build
```

### 6. Políticas de Git y Archivos que NO deben subirse
* **Regla de Git:** Trabajar y desplegar sobre `develop`. `main` queda reservada para producción formal.
* **Archivos pesados / temporales ignorados:**
  * `public/museo_wixarika_v1.glb` hasta `v11.glb` (solo debe mantenerse `museo_wixarika_v14.glb`).
  * Carpetas `imagenesRef/`, `scratch/`, `actividades-preliminares/`.
  * Archivos temporales de texto como `promptPendiente.md`.

---

## 6. Evaluación de Usabilidad: Cumplimiento de las 10 Leyes de UX

Mapa de evidencia para la ficha de pruebas cruzadas. Cada ley indica **qué hace la app** y **dónde comprobarlo**.

| # | Ley | Cómo se cumple | Dónde verlo |
|---|-----|----------------|-------------|
| 1 | **Jakob** (familiaridad) | Retícula central con anillo de progreso, igual que las apps de Cardboard. "X" de cierre siempre arriba a la derecha y botón **"← Volver"** con texto siempre arriba a la izquierda. El admin usa el patrón estándar tabla + buscador + modal de alta/edición. | Menú VR (todas las vistas), `/admin` → Libros |
| 2 | **Fitts** (tamaño y distancia) | Botones del muro "ACERCA DE"/"MENÚ" de 2.18 × 0.62 m. Botones "Volver" ampliados de 0.42 × 0.26 m a 0.92 × 0.30 m, del mismo alto que la paginación. Gatillo físico como alternativa a la mirada. | Bienvenida (muros a ±60°), cabecera de Referencias/Libros/Videos |
| 3 | **Hick** (decisiones) | El menú principal tiene 3 cards (Libros, Audio, Videos) y Acerca de tiene 4 (Deidades, Gastronomía, Fiestas, Videos). Nunca hay más de 4 opciones principales a la vez. | Menú principal y Acerca de |
| 4 | **Miller** (memoria) | Las referencias se muestran de **2 en 2** con paginación "Página X de N". Las salas tienen 3–6 cuadros y cada card tiene un título, una referencia y una fuente. | Acerca de → cualquier categoría |
| 5 | **Tesler** (complejidad) | Alta de libros con **Autocompletar por ISBN** (Open Library: título, autor, editorial, año) y valores por defecto (cultura, stock 3, año actual, sección, editorial). El código interno toma el ISBN si se deja vacío. | `/admin` → Libros → Nuevo libro |
| 6 | **Parkinson** (eficiencia) | La activación por mirada bajó de 3.0 s a **2.0 s**. Llegar a cualquier referencia toma 3 acciones (Acerca de → categoría → página). | Cualquier botón VR |
| 7 | **Postel** (tolerancia) | El ISBN se acepta con o sin guiones, con espacios o con prefijo "ISBN:". Se valida el dígito verificador y el error se explica en español. Los errores de Supabase/red se traducen a mensajes claros (duplicado, sin permiso, sin conexión). La búsqueda por ISBN ignora guiones. | `/admin` → Libros (formulario y buscador) |
| 8 | **Proximidad** | Etiquetas pegadas a sus campos. ISBN y botón Autocompletar en el mismo bloque. En las cards VR, título → referencia → fuente se apilan midiendo su altura real (sin encimarse). | Formulario de libros, cards de referencias |
| 9 | **Región común** | Todo grupo vive en un contenedor: cards con marco de madera, bisel de oro y fondo de cantera; bloque ISBN con fondo ámbar; cuadros del museo con marco y cédula. | Todo el menú VR y el admin |
| 10 | **Posición en serie** | Lo más usado va a los extremos: **Libros** primero y **Videos** al final, con Audio (ajuste secundario) al centro. "Volver" siempre al inicio de la cabecera y "Cerrar" al final. | Menú principal |

### Ajustes de museografía asociados
* El letrero del vano derecho de Bienvenida dice únicamente **"BIENVENIDOS"**, con filetes dorados y rombo turquesa arriba y abajo.
* La mesa de media luna de **Gastronomía** muestra los 6 platillos de los recuadros del muro en el mismo orden (tortillas en comal, caldo de toro, tamales en canasta, maíz tostado, perruri y olla de atole con jícaras), sobre servilletas bordadas, con maíces criollos de 4 colores, calabazas y chiles secos al fondo.
* Las mesas de **Fiestas** suman velas ceremoniales con listones, una jícara votiva con chaquira, una olla de tejuino y una ofrenda de cempasúchil. La sala de **Deidades** no se modificó.
* Los botones 3D del muro separan sus capas en Z (cantera a +4 mm del marco de oro) para eliminar el parpadeo por z-fighting.

---

## 7. Inicio de la App y Compatibilidad iPhone / Android

* **Pantalla de inicio:** la app abre siempre en el selector **Experiencia VR / Experiencia 2D** (`ExperienceLandingView`), con «Iniciar sesión» arriba a la derecha (login de `/admin`). Durante el recorrido, «Cambiar experiencia» (arriba a la derecha) regresa al selector.
* **Detección de VR** (`src/utils/vrSupport.js`): `webxr` (WebXR inmersivo), `mobile` (celular con sensores → visor Homido/Cardboard) o `unsupported` (la tarjeta VR se muestra opaca con «No compatible con este dispositivo»). La consulta a `navigator.xr` tiene un límite de 1.2 s porque algunos navegadores nunca responden.
* **Android (Chrome):** WebXR nativo; pantalla completa y bloqueo horizontal automáticos.
* **iPhone / iPad (Safari):** no hay WebXR, así que se usa el modo visor propio (giroscopio + estéreo). Ya **no se usa `webxr-polyfill`**: activaba una ruta WebXR que no pedía el permiso de sensores. El flujo queda así:
  1. El permiso de movimiento de iOS 13+ (`DeviceOrientationEvent.requestPermission`) se pide dentro del toque y antes de cualquier `await`. Si se rechaza, se vuelve al selector con instrucciones para permitirlo.
  2. iPhone no permite pantalla completa ni bloquear la orientación, así que `RotateDeviceHint` pide girar el teléfono y la pantalla de inicio sugiere «Agregar a pantalla de inicio» (modo standalone sin barras de Safari).
  3. El audio se desbloquea con el primer toque real (`SoundFX.unlock()`), los botones fijos respetan el notch (`env(safe-area-inset-*)`) y el render se limita a DPR 2× en iOS.
* **Requisito:** los sensores de movimiento en iOS **solo funcionan con HTTPS** (producción en Cloudflare). Para probar en un iPhone desde la red local hace falta un túnel HTTPS.

---

## 8. Resumen de Decisiones de Diseño para Futuras Modificaciones

Si necesitas agregar nuevas características en Linux, mantén presentes estas directrices:

1. **Si vas a agregar un botón:** Pregúntate si es estrictamente vital. Si la acción puede inferirse o automatizarse, no pongas un botón más.
2. **Si vas a escribir texto:** Hazlo breve y aumenta el tamaño de la letra. En VR, un párrafo de 5 líneas con letra grande se lee con agrado; un bloque de 15 líneas con letra pequeña no lo lee nadie y fatiga la vista.
3. **Si vas a agregar una sala o exposición:** No muevas al usuario bruscamente; utiliza el sistema de rotación suave del quiosco (`RotatingKiosk`) para que la sala se desplace frente a la cámara.
4. **Si vas a cambiar colores:** Mantén la cantera cálida (`#fbf7ee` / `#faf6eb`), el carbón oscuro (`#1c1917`) y los ocres dorados (`#b45309`, `#d4af37`). Respeta la identidad solemne y ceremonial del pueblo Wixárika.
