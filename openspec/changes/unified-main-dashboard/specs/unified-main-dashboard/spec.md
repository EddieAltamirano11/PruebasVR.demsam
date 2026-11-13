# Spec Delta

## Purpose

Establece el Menú Principal de Bienvenida como el único contenedor flotante interactivo de la experiencia espacial en el Museo Wixárika, integrando dentro de sí todas las salas culturales, videos documentales y libros, garantizando la orientación inicial del usuario hacia el menú al iniciar la aplicación, y posicionándolo con elevación y dimensiones ergonómicas.

## ADDED Requirements

### Requirement: Menú Flotante Único con Navegación Interna por Sub-vistas
El Menú Principal MUST actuar como el único menú flotante interactivo en la escena del museo, desplegando el contenido de las salas culturales (`deidades`, `gastronomia`, `fiestas`), el reproductor de videos documentales y el catálogo de libros dentro de su propia superficie sin redirigir al usuario ni abrir paneles flotantes dispersos en otras paredes.

#### Scenario: Selección de sala o catálogo desde el menú principal
- **WHEN** el usuario selecciona una opción en el menú principal (ej. "Panteón de Deidades", "Videos Culturales" o "Libros")
- **THEN** el menú principal cambia su estado interno para mostrar la información o reproductor correspondiente dentro del mismo contenedor, y presenta un botón de acción "Volver al Menú" para regresar a la vista inicial de 6 opciones.

### Requirement: Orientación Inicial de Cámara hacia el Menú Principal
Al iniciar la aplicación o al ejecutar la acción de recentrado, el punto de vista del usuario (tanto en modo escritorio como en modo WebXR inmersivo y giroscopio móvil) MUST orientarse frontalmente hacia el Menú Principal en el cuadrante Sur (+Z).

#### Scenario: Carga inicial de la aplicación
- **WHEN** se monta la escena 3D y se inicializa la cámara u OrbitControls
- **THEN** la cámara se orienta de inmediato hacia el azimut del Menú Principal (+Z), mostrando el encabezado y las opciones del menú frente al campo visual del observador sin necesidad de giros manuales de 180°.

### Requirement: Posicionamiento Elevado, Ampliado y Alejado del Centro
El Menú Principal MUST estar ubicado a una distancia cómoda del centro de la sala, con una altura libre del suelo superior a 0.50 metros y dimensiones monumentales para maximizar la legibilidad en VR.

#### Scenario: Renderizado del Menú Principal en el espacio 3D
- **WHEN** el Menú Principal se monta en la escena
- **THEN** su centro se posiciona en `Z >= 2.80m`, su elevación central es `Y >= 2.05m` (dejando su base a más de 0.65m del suelo) y sus dimensiones son de al menos 4.80m de ancho × 2.80m de alto.
