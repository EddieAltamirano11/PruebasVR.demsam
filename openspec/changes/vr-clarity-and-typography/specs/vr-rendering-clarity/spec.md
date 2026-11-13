# Spec Delta

## Purpose

Garantiza la máxima nitidez y resolución del pipeline de renderizado en Three.js tanto para sesiones inmersivas WebXR como para el modo visor estereoscópico móvil.

## ADDED Requirements

### Requirement: Drawing buffer nativo en renderizado estereoscópico
El sistema MUST calcular el viewport y las zonas de tijera (scissor) de cada ojo utilizando el tamaño físico real del búfer WebGL (`getDrawingBufferSize`) en lugar de dimensiones CSS lógicas.

#### Scenario: Activación de modo estereoscópico móvil
- **WHEN** el usuario ingresa al modo visor móvil estereoscópico
- **THEN** el gestor calcula el ancho y alto a partir del búfer físico completo del canvas WebGL y asigna la convergencia focal a 2.2 metros sin submuestreo.

### Requirement: Optimización de resolución y foveación en WebXR
El gestor WebXR MUST solicitar una escala de framebuffer superior a la base y desactivar la foveación periférica al iniciar una sesión inmersiva.

#### Scenario: Inicio de sesión inmersiva WebXR
- **WHEN** se dispara el evento `sessionstart` en el motor WebXR
- **THEN** se establece un `framebufferScaleFactor` de al menos 1.5 y se fija la foveación en 0 para evitar desenfoque periférico de textos y cédulas.

### Requirement: Filtrado anisótropo en texturas del entorno 3D
El cargador y gestor del modelo 3D MUST configurar el nivel máximo de anisotropía del hardware y filtrado lineal con mipmaps en todas las texturas de materiales de la escena.

#### Scenario: Carga de modelo de museo con texturas tipográficas
- **WHEN** la escena 3D carga el modelo GLTF del museo
- **THEN** todas las texturas de materiales visibles son recorridas y asignadas con `anisotropy` igual al máximo soportado por la GPU y `minFilter` en `LinearMipmapLinearFilter`.
