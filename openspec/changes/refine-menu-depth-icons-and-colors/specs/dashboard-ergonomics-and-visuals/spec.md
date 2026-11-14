# Spec Delta: dashboard-ergonomics-and-visuals

## Purpose

Establece las especificaciones ergonómicas espaciales y de fidelidad visual para el menú monumental en WebXR, garantizando distancia adecuada, escala legible, eliminación total de botones negros y renderizado vectorial nítido sin pixelación.

## ADDED Requirements

### Requirement: Panel Monumental Retranqueado y Ampliado
El menú principal flotante SHALL ubicarse a una profundidad mayor en el eje Z (`Z >= 3.50m`, nominalmente `3.75m`) y contar con dimensiones monumentales (`ancho >= 6.00m`, nominalmente `6.40m`, `alto >= 3.20m`, nominalmente `3.50m`) para una lectura panorámica espaciosa y descansada en modo VR.

#### Scenario: Colocación espacial y campo de visión
- **WHEN** se carga la escena en modo VR o se inspecciona el dashboard principal
- **THEN** el panel se posiciona en `Z = 3.75m` y `Y = 2.30m` con un ancho de `6.40m` y alto de `3.50m`, ofreciendo una altura libre respecto al piso mayor a 0.50m.

### Requirement: Botones Claros y Ausencia de Elementos Negros
Todos los botones interactivos dentro del menú principal y sus sub-vistas SHALL utilizar la variante de cantera ceremonial (`cantera`) o fondos claros de contraste, erradicando fondos oscuros (`#0b101d`) y marcos interiores negros (`#040711`).

#### Scenario: Visualización de botones de navegación cultural
- **WHEN** el usuario navega a cualquiera de las salas culturales (Deidades, Gastronomía, Fiestas)
- **THEN** los botones de "Libros de esta Sala", "Ver Libros de la Sala" y "Volver al Menú" lucen fondo claro de cantera con bisel dorado y tipografía oscura legible, sin planos negros residuales.

### Requirement: Iconografía Vectorial Nítida sin Pixelación
Los iconos vectoriales del menú principal SHALL rasterizarse a una resolución mínima de 512×512 píxeles con filtrado anisótropo (`anisotropy = 8`), espacio de color sRGB y renderizado con `transparent={true}`, `depthWrite={false}` y sin cortes duros de `alphaTest`.

#### Scenario: Inspección cercana de iconos en visor VR
- **WHEN** el usuario observa de cerca o con giro de cabeza cualquier icono (sol, compás, flechas, cubiertos, destellos, audio)
- **THEN** los bordes de los trazos vectoriales se aprecian suaves, continuos y perfectamente antialiasados, sin pixelado visible.
