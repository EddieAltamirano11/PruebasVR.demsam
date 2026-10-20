# Módulo Inmersivo WebXR — Difusión de Culturas Vivas de Nayarit

> **Taller Full Stack | Equipo 10**  
> **Sede:** Biblioteca Pública Profesor Solón Argüello (Tepic, Nayarit)  
> **Stack Base:** React 18, Three.js, React Three Fiber, WebXR (`@react-three/xr`), Tailwind CSS, Vite y Cloudflare Pages.

---

## 👥 Equipo de Desarrollo y Roles

| Integrante | Rol | Responsabilidad Principal |
| :--- | :--- | :--- |
| **Eddie David Altamirano Plantillas** | Fullstack Lead & WebXR Architect | Arquitectura WebXR, rendimiento del bundle y CI/CD en Cloudflare. |
| **Luis Carlos Durán Ocampo** | Backend & Database Engineer | Diseño de base de datos PostgreSQL, esquemas Prisma ORM y APIs REST seguras. |
| **Samir Adrián Cárdenas Gámez** | Frontend Admin & UI Designer | Panel administrativo 2D, formularios CRUD de libros, layout y experiencia de usuario. |
| **Ulises Alejandro Bautista Meza** | setup base | Modelado low-poly de la sierra Wixárika, compresión Draco y retopología móvil. |

---

## 📋 Requisitos Previos del Sistema

Antes de comenzar, los cuatro integrantes deben asegurarse de tener instalado lo siguiente en su computadora:

1. **Node.js:** Versión `20.x` o `22.x` LTS ([Descargar Node.js](https://nodejs.org/)).
2. **npm:** Versión `10.x` o superior (incluido automáticamente con Node.js).
3. **Git:** Para control de versiones ([Descargar Git](https://git-scm.com/)).
4. **Navegador web moderno:** Google Chrome, Edge o Firefox con soporte para WebXR.
5. *(Opcional para pruebas móviles)*: Smartphone conectado a la misma red WiFi para pruebas con visor tipo Homido Grab / Cardboard.

---

## 🚀 Guía de Instalación y Ejecución (Para los 4 Integrantes)

Sigue estos pasos en tu terminal para clonar, instalar y poner en marcha el proyecto:

### 1. Clonar el repositorio y acceder a la carpeta
```bash
git clone https://github.com/EddieAltamirano11/PruebasVR.demsam.git
cd PruebasVR.demsam
```

### 2. Cambiar a la rama de desarrollo (`develop`)
```bash
git checkout develop
```
*(Si es tu primera vez y la rama local no existe, ejecuta `git checkout -b develop origin/develop`)*.

### 3. Instalar las dependencias del proyecto
```bash
npm install
```

### 4. Iniciar el servidor de desarrollo local
```bash
npm run dev
```

El servidor Vite iniciará en puerto 3000 con soporte de red local (`host: true`):
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
| `npm run lint` | Ejecuta ESLint en `/src` para detectar errores de sintaxis y buenas prácticas. |
| `npm test` | Ejecuta la suite de pruebas unitarias y validaciones de bundle con Vitest. |
| `npm run qa` | **Pipeline integral de QA local:** ejecuta linter + build + suite de tests. |
| `npm run deploy` | Despliega manualmente los archivos de `./dist` hacia Cloudflare Pages con Wrangler. |

---

## 🌿 Convenciones de Git y Flujo de Ramas

Trabajamos bajo una estrategia basada en **Git Flow adaptado a Sprints**, estructurada en **`main`**, **`develop`**, **`QA`** y **ramas por tarea**:

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

### 1. Ramas Principales

* **`main` (Producción):**
  * Representa el software estable y entregable en producción.
  * Solo recibe código aprobado desde `QA` mediante Pull Requests evaluados.
  * Cada `push` a `main` despliega automáticamente a producción en **Cloudflare Pages**.
* **`develop` (Integración y Desarrollo Activo):**
  * Rama base de trabajo donde convergen las contribuciones diarias de los cuatro integrantes.
  * Todo desarrollo parte de `develop` y se reintegra a `develop` vía Pull Request.
  * Cuenta con validación automática de QA en cada commit/PR.
* **`QA` (Aseguramiento de Calidad y Pruebas E2E):**
  * Rama dedicada a la validación de software en hardware real (visor Homido Grab, celulares económicos) y pruebas de accesibilidad WCAG 2.1.
  * Permite generar despliegues de pre-producción antes de promover el código a `main`.

### 2. Ramas por Tarea (Feature Branches)

> ⚠️ **Regla de oro:** Ningún integrante debe comitear directamente sobre `main` ni `develop`. Cada tarea o tarjeta del Sprint debe realizarse en su propia rama.

#### 🏷️ Nomenclatura oficial de ramas por tarea:
* **Nuevas características:** `feature/tarjeta<N>-<descripcion-corta>`
* **Corrección de errores:** `fix/<descripcion-del-bug>`
* **Tareas de mantenimiento/configuración:** `chore/<descripcion>`
* **Documentación:** `docs/<descripcion>`

**Ejemplos de ramas asignadas a cada integrante:**
* `feature/tarjeta1-setup-webxr` *(Eddie Altamirano)*
* `feature/tarjeta2-schema-prisma` *(Luis Carlos Durán)*
* `feature/tarjeta3-admin-layout` *(Samir Cárdenas)*
* `feature/tarjeta4-modelo-wixarika-3d` *(Ulises Bautista)*

#### 🔄 Ciclo de vida de una tarea:
1. **Actualizar la rama base:**
   ```bash
   git checkout develop
   git pull origin develop
   ```
2. **Crear la rama de la tarea asignada:**
   ```bash
   git checkout -b feature/tarjetaX-mi-tarea
   ```
3. **Desarrollar y realizar commits** siguiendo la guía de Conventional Commits.
4. **Ejecutar y validar la suite de QA localmente:**
   ```bash
   npm run qa
   ```
5. **Subir la rama a GitHub:**
   ```bash
   git push origin feature/tarjetaX-mi-tarea
   ```
6. **Abrir Pull Request (PR):** Crear el PR con destino a la rama `develop` para revisión de código por pares.

---

## ✍️ Formato Estándar de Commits (Conventional Commits)

Todos los mensajes de confirmación en el repositorio deben seguir la convención de [Conventional Commits](https://www.conventionalcommits.org/):

```text
<tipo>(<alcance opcional>): <descripción concisa en minúsculas>
```

### Tipos de Commits Permitidos:

| Tipo | Propósito | Ejemplo |
| :--- | :--- | :--- |
| **`feat`** | Nueva funcionalidad o módulo para el sistema | `feat(xr): implementar anclaje de menú 3D en rig` |
| **`fix`** | Corrección de un error o bug reportado | `fix(camera): solucionar centrado de retícula en iOS` |
| **`docs`** | Creación o actualización de documentación | `docs(readme): agregar convenciones de git y ramas` |
| **`style`** | Ajustes visuales, CSS o formato sin alterar lógica | `style(ui): elevar contraste a ratio 7:1 para WCAG` |
| **`refactor`** | Reestructuración de código sin alterar su funcionamiento | `refactor(services): desacoplar lógica de WebXR a servicio` |
| **`perf`** | Optimizaciones de rendimiento o reducción de tamaño | `perf(assets): comprimir texturas con Draco para build ligero` |
| **`test`** | Inclusión o mejora de pruebas unitarias o de integración | `test(bundle): validar límite de 500 KB gzip por chunk` |
| **`chore`** | Actualización de dependencias, configs de Vite o CI/CD | `chore(ci): configurar deploy automático en Cloudflare` |

### Ejemplos Prácticos de Commits:
```bash
git commit -m "feat(models): integrar modelo ceremonial wixarika comprimido con draco"
git commit -m "fix(audio): evitar suspension no deseada de AudioContext en primer toque"
git commit -m "docs(readme): documentar guia de instalacion para los 4 integrantes"
git commit -m "test(webxr): agregar prueba de deteccion de soporte immersive-vr"
```

---

## 🏛️ Arquitectura Modular del Código (`/src`)

El código se encuentra modularizado en 4 capas para permitir el trabajo en paralelo de los integrantes sin conflictos:

```text
src/
├── components/          # Componentes 3D y de UI independientes
│   ├── BochoModel.jsx   # Carga y animación de modelos GLTF/Draco
│   ├── FollowCamera.jsx # Sistema dinámico de seguimiento de cámara
│   ├── Scene.jsx        # Canvas principal R3F, iluminación y entorno
│   ├── StereoVRManager.jsx # División estereoscópica para visores Cardboard
│   ├── UIOverlay.jsx    # Interfaz de usuario 2D móvil
│   ├── VRMenu3D.jsx     # Menú tridimensional espacial interactivo
│   └── WebXRManager.jsx # Integración nativa con WebXR Session
├── views/               # Pantallas y vistas completas desacopladas
│   ├── VRView.jsx       # Vista del entorno inmersivo WebXR
│   └── index.js
├── hooks/               # Custom hooks reutilizables
│   ├── useWebXR.js      # Detección de compatibilidad con visores VR
│   ├── useVRControls.js # Gestión de estados de simulación y vistas
│   └── index.js
├── services/            # Lógica desacoplada de presentación y APIs
│   ├── webxrService.js  # Control de sesiones WebXR, sensores y fullscreen
│   ├── audioService.js  # Síntesis Web Audio API (SoundFX)
│   └── index.js
├── utils/
│   └── sound.js         # Módulo utilitario de soporte retrocompatible
├── App.jsx              # Montaje limpio de vistas de la aplicación
├── index.css            # Directivas Tailwind CSS y utilidades de cristal
└── main.jsx
```

---

## 🎯 Definición de Hecho (DoD - Definition of Done)

Para considerar una tarjeta o tarea como **Hecho (Done)**:
1.  **Código revisado:** Aprobado mediante Pull Request en GitHub.
2.  **Calidad QA:** Pasa exitosamente `npm run lint` y `npm test`.
3. ⚡ **Build Ultraligero:** El tamaño individual de cada chunk en producción no debe exceder **500 KB gzip** (verificado automáticamente por el CI de GitHub Actions).
4. 📱 **Pruebas de Hardware:** Verificado y navegable en smartphone económico colocado en visor físico **Homido Grab**.
5. ♿ **Accesibilidad:** Contraste visual validado bajo el estándar **WCAG 2.1**.
6. ☁️ **Despliegue:** Desplegado de forma automática y continua en **Cloudflare Pages**.
