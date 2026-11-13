# Spec Delta

## Purpose

Define un sistema tipográfico unificado para VR con una paleta estricta de dos colores, escalas angulares legibles ampliadas y redacción concisa centrada en palabras clave.

## ADDED Requirements

### Requirement: Paleta tipográfica estricta de dos colores
Todos los textos de tarjetas culturales, paneles de lectura y controles VR MUST emplear exclusivamente dos colores tipográficos: `#ffffff` (Blanco Puro de Alto Contraste) para títulos, encabezados y términos principales, y `#fde047` (Oro Sagrado Cálido) para subtítulos, etiquetas y metadatos complementarios.

#### Scenario: Visualización de textos en tarjeta o panel 3D
- **WHEN** un componente de tarjeta cultural, panel de video o panel de lectura renderiza textos en el espacio 3D
- **THEN** los elementos de texto utilizan únicamente `#ffffff` o `#fde047`, eliminando colores terciarios dispersos para garantizar consistencia visual y contraste superior a 12:1 WCAG AAA.

### Requirement: Escala tipográfica ampliada para ergonomía visual VR
Los tamaños de fuente en tarjetas y paneles MUST satisfacer una escala mínima ampliada donde los títulos principales no sean inferiores a 0.08 metros y los textos de apoyo no sean inferiores a 0.048 metros a una distancia de visualización de 2.0 a 2.4 metros.

#### Scenario: Renderizado de títulos y cuerpo en VR
- **WHEN** se presenta información cultural en la tarjeta activa de una sala
- **THEN** el título se dibuja con tamaño no inferior a 0.085 m y los textos de contenido no inferior a 0.050 m, superando el umbral de legibilidad angular de 1.0 grado en el visor.

### Requirement: Contenido sintetizado en palabras clave
Las descripciones y fichas informativas de las salas MUST estructurarse en formato de palabras clave o resúmenes de máximo dos líneas breves, eliminando párrafos extensos de texto diminuto.

#### Scenario: Consulta de información de estación cultural
- **WHEN** el visitante abre la tarjeta informativa de una estación (Deidades, Gastronomía, Fiestas)
- **THEN** la información se presenta mediante viñetas breves con términos clave destacados en lugar de bloques densos de texto corrido.
