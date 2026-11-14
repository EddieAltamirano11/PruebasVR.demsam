# Spec Delta: artwork-modal-interaction

## Purpose

Define los contratos de interacción y presentación visual para los 9 cuadros sagrados del museo, su modal monumental de 6.40m × 3.50m con reparto 1/3 fotografía y 2/3 descripción, el control de visibilidad exclusivo mediante el botón inferior y la temporización universal de Gaze Fuse a 3 segundos.

## ADDED Requirements

### Requirement: Detección e Interactividad de los 9 Cuadros
El sistema SHALL permitir la selección de los 9 cuadros presentes en el museo (6 deidades y 3 fiestas) tanto por clic de ratón/gatillo como por fijación de mirada (Gaze Fuse).

#### Scenario: Selección de cuadro por clic o mirada
- **WHEN** el usuario hace clic o fija la mirada en cualquiera de los 9 lienzos o cuadros en la pared del museo
- **THEN** se despacha la acción de apertura del cuadro con sus metadatos (título, subtítulo, imagen y descripción).

### Requirement: Modal Monumental en Dirección de la Mirada (Opción C)
Al abrir un cuadro, el sistema SHALL renderizar un modal de dimensiones `6.40m × 3.50m` situado a ~3.5m frente a la cámara en el vector de visión del usuario y orientado hacia él (`lookAt`), ocultando inmediatamente el Menú Principal para asegurar que solo exista un menú visible a la vez.

#### Scenario: Apertura del modal
- **WHEN** un cuadro es seleccionado
- **THEN** el Menú Principal se oculta, y el modal del cuadro se posiciona frente al usuario a 3.5m de distancia, orientado perpendicularmente a su línea de vista.

### Requirement: Distribución 1/3 Imagen y 2/3 Descripción con Botón de Cierre en Badge
El modal del cuadro SHALL distribuir su superficie interior en:
1. Lado izquierdo (1/3 del ancho, ~2.13m): Imagen de la obra con marco ceremonial.
2. Lado derecho (2/3 del ancho, ~4.27m): Título monumental, subtítulo, palabras clave y texto descriptivo en fuente grande (`#1c1917` y `#78350f`).
3. Botón de cierre: Icono de cruz (`x`) en un badge ceremonial estilizado (fondo claro y bisel de oro).

#### Scenario: Visualización del contenido del cuadro
- **WHEN** el modal se encuentra visible
- **THEN** muestra la imagen en el tercio izquierdo y el texto enriquecido en los dos tercios derechos, junto al botón de badge con cruz para cerrarlo.

### Requirement: Comportamiento Exclusivo del Botón Inferior
El botón flotante inferior SHALL alternar entre ocultar la ventana activa y reabrir el Menú Principal:
1. Si el modal del cuadro está visible, al presionar el botón inferior se oculta el modal del cuadro.
2. Al presionar nuevamente el botón inferior, se muestra el Menú Principal (nunca el modal del cuadro).
3. Para reabrir el modal de un cuadro, el usuario debe interactuar directamente con el cuadro en la pared.

#### Scenario: Ocultar y reabrir mediante botón inferior
- **WHEN** el usuario presiona el botón inferior con un cuadro abierto
- **THEN** el cuadro se oculta; y un segundo clic sobre el botón inferior abre el Menú Principal.

### Requirement: Calibración Global de Gaze Fuse a 3.0 Segundos
El temporizador universal de mirada de la retícula central SHALL requerir 3.0 segundos continuos de fijación para activar cualquier objetivo interactivo.

#### Scenario: Disparo por mirada fija
- **WHEN** la retícula apunta a un objeto interactivo
- **THEN** el progreso avanza proporcionalmente a `tiempo / 3.0` y se activa al alcanzar 3.0 segundos.
