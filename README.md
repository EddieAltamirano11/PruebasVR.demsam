# Módulo Inmersivo WebXR — Difusión de Culturas Vivas de Nayarit

> **Taller Full Stack | Semestre VII | Equipo 10**  
> **Sede:** Biblioteca Pública Profesor Solón Argüello (Tepic, Nayarit)  
> **Stack Base:** React 18, Three.js, React Three Fiber, WebXR (`@react-three/xr`), Tailwind CSS, Vite y Cloudflare Pages.

---

## 👥 Equipo de Desarrollo y Roles

| Integrante | Rol | Responsabilidad Principal |
| :--- | :--- | :--- |
| **Eddie David Altamirano Plantillas** | Fullstack Lead & WebXR Architect | Arquitectura WebXR, setup base, rendimiento del bundle y CI/CD en Cloudflare. |
| **Luis Carlos Durán Ocampo** | Backend & Database Engineer | Diseño de base de datos PostgreSQL, esquemas Prisma ORM y APIs REST seguras. |
| **Samir Adrián Cárdenas Gámez** | Frontend Admin & UI Designer | Panel administrativo 2D, formularios CRUD de libros, layout y experiencia de usuario. |
| **Ulises Alejandro Bautista Meza** | 3D Asset & Optimization Specialist | Modelado low-poly de la sierra Wixárika, compresión Draco y retopología móvil. |

---

## 📋 Requisitos Previos del Sistema

Antes de comenzar, asegúrate de contar con lo siguiente instalado en tu equipo de desarrollo:

1. **Node.js:** Versión `20.x` o `22.x` LTS ([Descargar Node.js](https://nodejs.org/)).
2. **npm:** Versión `10.x` o superior (incluido automáticamente con Node.js).
3. **Git:** Para control de versiones ([Descargar Git](https://git-scm.com/)).
4. **Navegador web moderno:** Google Chrome, Edge o Firefox con soporte para WebXR.
5. *(Opcional para pruebas móviles)*: Smartphone conectado a la misma red WiFi para pruebas con visor tipo Homido Grab / Cardboard.

---

## 🚀 Guía de Instalación y Ejecución (Para los 4 Integrantes)

Sigue estos pasos en tu terminal para clonar, instalar y poner en marcha el proyecto localmente:

### 1. Clonar el repositorio y acceder a la carpeta
```bash
git clone https://github.com/EddieAltamirano11/PruebasVR.demsam.git
cd PruebasVR.demsam
```

### 2. Cambiar a la rama de desarrollo
```bash
git checkout develop
```
*(Si es tu primera vez y la rama local no existe, ejecuta `git checkout -b develop origin/develop`)*.

### 3. Instalar las dependencias
```bash
npm install
```

### 4. Iniciar el servidor de desarrollo local
```bash
npm run dev
```

El servidor Vite se iniciará con salida similar a:
```text
  VITE v6.0.0  ready in 250 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.1.XX:3000/
```
* **En tu computadora:** Abre `http://localhost:3000` en tu navegador.
* **En tu teléfono / visor VR:** Abre la dirección de red (`http://192.168.X.X:3000`) desde el navegador de tu celular (ambos dispositivos deben estar conectados a la misma red WiFi).

---

## 🛠️ Scripts del Proyecto

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el entorno local de desarrollo con Hot Module Replacement (HMR). |
| `npm run build` | Compila y optimiza el proyecto para producción en la carpeta `./dist`. |
| `npm run preview` | Previsualiza localmente el build de producción antes de desplegar. |
| `npm run lint` | Ejecuta ESLint en `/src` para detectar errores de sintaxis y código muerto. |
| `npm test` | Ejecuta la suite de pruebas unitarias y validaciones de bundle con Vitest. |
| `npm run qa` | **Pipeline integral de QA local:** ejecuta linter + build + suite de tests. |
| `npm run deploy` | Despliega manualmente los archivos de `./dist` hacia Cloudflare Pages con Wrangler. |

---

## 🌿 Flujo de Ramas (Git Branching Strategy)

Trabajamos bajo una estrategia basada en **Git Flow adaptado a Sprints**:

```mermaid
gitGraph
   commit id: "Initial"
   branch develop
   checkout develop
   commit id: "Setup Base"
   branch feature/tarjeta1-setup
   checkout feature/tarjeta1-setup
   commit id: "feat: setup react18"
   commit id: "feat: add tailwind & xr"
   checkout develop
   merge feature/tarjeta1-setup id: "PR #1 Merged"
   branch QA
   checkout QA
   commit id: "QA Testing"
   checkout develop
   branch main
   checkout main
   merge QA id: "Release Sprint"
```

### Descripción de Ramas Principales:
* **`main`**: Rama de producción final. Es 100% estable. Todo lo que esté aquí se refleja en el entorno de producción de Cloudflare Pages.
* **`develop`**: Rama principal de desarrollo e integración activa. Todas las tareas de cada integrante convergen aquí vía Pull Request.
* **`QA`**: Rama de pruebas de calidad, validación de hardware (visor físico) y contraste WCAG antes de pasar a producción.

### Ramas por Tarea (Feature Branches):
Cada integrante **NUNCA** debe subir commits directamente a `main` ni a `develop`. Se debe crear una rama por tarea/tarjeta asignada.

#### 🏷️ Nomenclatura oficial:
* Nuevas funciones: `feature/tarjeta<N>-<descripcion-corta>`
* Corrección de errores: `fix/<descripcion-del-bug>`
* Tareas de soporte/configuración: `chore/<descripcion>`
* Documentación: `docs/<descripcion>`

**Ejemplos de ramas por integrante:**
* `feature/tarjeta1-setup-webxr` *(Eddie Altamirano)*
* `feature/tarjeta2-schema-prisma` *(Luis Carlos Durán)*
* `feature/tarjeta3-admin-layout` *(Samir Cárdenas)*
* `feature/tarjeta4-modelo-wixarika-3d` *(Ulises Bautista)*

#### 🔄 Paso a paso para trabajar en una tarea:
1. Asegurarse de tener la última versión de `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   ```
2. Crear tu rama de trabajo:
   ```bash
   git checkout -b feature/tarjetaX-mi-tarea
   ```
3. Trabajar en el código y realizar commits siguiendo las convenciones.
4. **Verificar que pase QA antes de subir:**
   ```bash
   npm run qa
   ```
5. Subir tu rama a GitHub:
   ```bash
   git push origin feature/tarjetaX-mi-tarea
   ```
6. Abrir un **Pull Request (PR)** hacia la rama `develop` en GitHub para revisión de código por pares.

---

## ✍️ Formato Estándar de Commits (Conventional Commits)

Los mensajes de commit deben seguir la especificación de [Conventional Commits](https://www.conventionalcommits.org/):

```text
<tipo>(<alcance opcional>): <descripción breve en minúsculas y presente>
```

### Tipos de Commit Permitidos:
* **`feat`**: Nueva funcionalidad para el usuario o sistema (ej: `feat(xr): implementar anclaje de menú 3D en rig`).
* **`fix`**: Corrección de un bug o error (ej: `fix(camera): solucionar bloqueo de orientación en iOS`).
* **`docs`**: Cambios en documentación o README (ej: `docs: actualizar guía de comandos para equipo`).
* **`style`**: Cambios de formato visual o CSS sin alterar lógica (ej: `style(ui): elevar contraste a ratio 7:1`).
* **`refactor`**: Reorganización de código que no arregla un bug ni añade una función (ej: `refactor(services): desacoplar lógica de WebXR`).
* **`perf`**: Cambio de código orientado a mejorar rendimiento o peso (ej: `perf(assets): reducir resolución de texturas a WebP`).
* **`test`**: Añadir o corregir pruebas (ej: `test(qa): añadir verificación de límite de 500 KB gzip`).
* **`chore`**: Actualización de dependencias, configuración de build o linters (ej: `chore(deps): actualizar wrangler y tailwind`).

### Ejemplos Correctos:
```bash
git commit -m "feat(models): cargar modelo wixarika ceremonial con compresion draco"
git commit -m "fix(audio): prevenir bloqueo de AudioContext al arrancar simulacion"
git commit -m "docs(readme): agregar convenciones de ramas para el equipo"
```

---

## 🏛️ Arquitectura Modular del Código (`/src`)

El proyecto está diseñado bajo una arquitectura limpia y modular para facilitar el trabajo concurrente entre los cuatro integrantes:

```text
src/
├── components/          # Componentes 3D y de UI independientes
│   ├── BochoModel.jsx   # Carga y gestión de animaciones GLTF con Draco
│   ├── FollowCamera.jsx # Sistema de seguimiento dinámico de cámara
│   ├── Scene.jsx        # Lienzo Canvas R3F y luces
│   ├── StereoVRManager.jsx # División estereoscópica para visor Cardboard
│   ├── UIOverlay.jsx    # Interfaz 2D para navegador móvil
│   ├── VRMenu3D.jsx     # Menú inmersivo espacial dentro de la escena
│   └── WebXRManager.jsx # Integración nativa con WebXR Session
├── views/               # Pantallas y vistas completas (facilitará añadir el panel admin)
│   ├── VRView.jsx       # Vista del entorno inmersivo WebXR
│   └── index.js
├── hooks/               # Custom hooks reutilizables
│   ├── useWebXR.js      # Hook para detectar compatibilidad con visores VR
│   ├── useVRControls.js # Hook para gestionar estados de simulación
│   └── index.js
├── services/            # Servicios desacoplados de la lógica de presentación
│   ├── webxrService.js  # Control de sesiones WebXR, sensores y fullscreen
│   ├── audioService.js  # Síntesis Web Audio API (SoundFX)
│   └── index.js
├── utils/
│   └── sound.js         # Módulo utilitario de soporte
├── App.jsx              # Punto de entrada de la aplicación
├── index.css            # Directivas Tailwind CSS y utilidades de cristal
└── main.jsx
```

---

## 🎯 Definición de Hecho (DoD - Definition of Done)

Para que una tarjeta se marque como **Hecho (Done)** en el tablero de Notion:
1.  **Código revisado:** Aprobado mediante Pull Request en GitHub.
2.  **Calidad QA:** Pasa exitosamente `npm run lint` y `npm test`.
3. ⚡ **Build Ultraligero:** El tamaño individual de cada chunk en producción no debe exceder **500 KB gzip** (verificado automáticamente por el CI de GitHub Actions).
4. 📱 **Pruebas de Hardware:** Verificado y navegable en smartphone económico colocado en visor físico **Homido Grab**.
5. ♿ **Accesibilidad:** Contraste visual validado bajo el estándar **WCAG 2.1**.
6. ☁️ **Despliegue:** Desplegado de forma automática y continua en **Cloudflare Pages**.
