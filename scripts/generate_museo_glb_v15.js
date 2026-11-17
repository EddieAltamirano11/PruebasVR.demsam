#!/usr/bin/env node
/**
 * Generador de Sala de Museo Wixárika v15 (.GLB)
 * Genera public/museo_wixarika_v15.glb a partir de public/museo_wixarika_v14.glb
 *
 * 1. Arquitectura Monumental Restaurada (DELTA_Y = +1.60m):
 *   • Muro cilíndrico (mat_muro_adobe.024, color café bajito): pasa de 3.80m a 5.40m.
 *   • Cornisa superior de madera: elevada a Y=5.30m (sellando en 5.40m).
 *   • Cenefa sagrada Wixárika 360: elevada a Y=5.10m (span Y=4.925m a 5.260m).
 *   • Techo cónico completo (grupo_techo_domo, color café oscuro): elevado +1.60m,
 *     asentando su borde perimetral en Y=5.40m y su óculo cenital en Y=7.00m.
 *   • 8 pilastras perimetrales: fustes ampliados a 5.40m y capiteles a 5.25m.
 *   • Nichos posteriores (Deidades, Fiestas, Gastronomía): cubren de Y=0.10m a 5.40m.
 *   • Letreros flotantes de sección: posicionados a Y=4.25m.
 *
 * 2. Rediseño de Galería y Mesa en Gastronomía:
 *   • Se reemplazan las dos mesas rectangulares anteriores por una sola mesa de
 *     media luna (demi-lune) vacía, en madera oscura idéntica a la de los pilares
 *     (mat_madera_oscura.036), con la parte curva apuntando hacia el centro del museo
 *     (vista del espectador) y el respaldo recto paralelo al muro.
 *   • Repisas antiguas del muro retiradas para dar espacio limpio a la galería.
 *   • 6 recuadros museográficos (+15% en tamaño respecto a la base, manteniendo los
 *     mismos gaps horizontal y vertical) en 2 filas × 3 columnas sobre el muro curvo:
 *       Fila 1 (Superior): TORTILLAS DE MAÍZ | TAMALES | ATOLE DE MAÍZ
 *       Fila 2 (Inferior): CALDO DE TORO     | MAÍZ TOSTADO | PERRURI
 *   • Lienzos limpios en tono cantera sin imagen (con UVs 0..1 listos para futuras texturas).
 *   • Debajo de cada recuadro: placa ceremonial (+15% proporcional) con texto 3D extruido
 *     en oro ceremonial (mat_texto_oro_3d.021, helvetiker_bold).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const inputPath = path.resolve(rootDir, 'public', 'museo_wixarika_v14.glb');
const outputPath = path.resolve(rootDir, 'public', 'museo_wixarika_v15.glb');

if (!fs.existsSync(inputPath)) {
  console.error(`Error: No se encontró el archivo base en ${inputPath}`);
  process.exit(1);
}

console.log('=== Generando Museo Wixárika v15 (Techo 7.0m + Galería 2x3 de Gastronomía) ===');
console.log(`Cargando base: ${inputPath}`);

const data = fs.readFileSync(inputPath);
const magic = data.toString('utf8', 0, 4);
const version = data.readUInt32LE(4);
const c0Len = data.readUInt32LE(12);

if (magic !== 'glTF' || version !== 2) {
  console.error('Error: El archivo no es un glTF binario v2 válido.');
  process.exit(1);
}

const jsonStr = data.toString('utf8', 20, 20 + c0Len);
const gltf = JSON.parse(jsonStr);

const c1Offset = 20 + c0Len;
const c1Len = data.readUInt32LE(c1Offset);
let binBuffer = Buffer.from(data.subarray(c1Offset + 8, c1Offset + 8 + c1Len));

const nodes = gltf.nodes;

// --------------------------------------------------------------------------
// Utilidades para inyectar BufferGeometry de Three.js al GLB binario
// --------------------------------------------------------------------------
const appendBufferData = (typedArray) => {
  const alignPad = (4 - (binBuffer.length % 4)) % 4;
  if (alignPad > 0) {
    binBuffer = Buffer.concat([binBuffer, Buffer.alloc(alignPad)]);
  }
  const offset = binBuffer.length;
  const newBuf = Buffer.from(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength);
  binBuffer = Buffer.concat([binBuffer, newBuf]);
  return { offset, length: newBuf.length };
};

const addGeometryMeshToGltf = (rawGeom, materialIdx, meshName) => {
  const geom = rawGeom.index ? rawGeom.toNonIndexed() : rawGeom;
  if (!geom.attributes.normal) {
    geom.computeVertexNormals();
  }
  geom.computeBoundingBox();
  const bb = geom.boundingBox;

  const posAttr = geom.attributes.position;
  const normAttr = geom.attributes.normal;
  const uvAttr = geom.attributes.uv;
  const vertCount = posAttr.count;

  // POSITION
  const posSlice = appendBufferData(posAttr.array);
  const posBvIdx = gltf.bufferViews.length;
  gltf.bufferViews.push({
    buffer: 0,
    byteOffset: posSlice.offset,
    byteLength: posSlice.length,
    target: 34962
  });
  const posAccIdx = gltf.accessors.length;
  gltf.accessors.push({
    bufferView: posBvIdx,
    byteOffset: 0,
    componentType: 5126,
    count: vertCount,
    type: 'VEC3',
    min: [bb.min.x, bb.min.y, bb.min.z],
    max: [bb.max.x, bb.max.y, bb.max.z]
  });

  // NORMAL
  const normSlice = appendBufferData(normAttr.array);
  const normBvIdx = gltf.bufferViews.length;
  gltf.bufferViews.push({
    buffer: 0,
    byteOffset: normSlice.offset,
    byteLength: normSlice.length,
    target: 34962
  });
  const normAccIdx = gltf.accessors.length;
  gltf.accessors.push({
    bufferView: normBvIdx,
    byteOffset: 0,
    componentType: 5126,
    count: vertCount,
    type: 'VEC3'
  });

  const attributes = {
    POSITION: posAccIdx,
    NORMAL: normAccIdx
  };

  // TEXCOORD_0 (si existe)
  if (uvAttr) {
    const uvSlice = appendBufferData(uvAttr.array);
    const uvBvIdx = gltf.bufferViews.length;
    gltf.bufferViews.push({
      buffer: 0,
      byteOffset: uvSlice.offset,
      byteLength: uvSlice.length,
      target: 34962
    });
    const uvAccIdx = gltf.accessors.length;
    gltf.accessors.push({
      bufferView: uvBvIdx,
      byteOffset: 0,
      componentType: 5126,
      count: uvAttr.count,
      type: 'VEC2'
    });
    attributes.TEXCOORD_0 = uvAccIdx;
  }

  const meshIdx = gltf.meshes.length;
  gltf.meshes.push({
    name: meshName,
    primitives: [
      {
        attributes,
        material: materialIdx
      }
    ]
  });

  return { meshIdx, bb };
};

// ==========================================================================
// PARTE 1: ELEVACIÓN MONUMENTAL DE PAREDES (5.40m) Y TECHO (7.00m)
// ==========================================================================
const DELTA_Y = 1.60;
const H_ORIG = 3.80;
const H_NEW = H_ORIG + DELTA_Y; // 5.40m
const SCALE_WALL_Y = H_NEW / H_ORIG; // 1.4210526

console.log(`\n[1] Aplicando elevación monumental: +${DELTA_Y}m (Muro a ${H_NEW}m, Óculo a ${(5.40 + DELTA_Y).toFixed(2)}m)`);

// 1.1 Muro cilíndrico de adobe (café bajito)
nodes[812].scale = [1.0, SCALE_WALL_Y, 1.0];
nodes[812].translation = [0.0, H_NEW / 2.0, 0.0];

// 1.2 Cornisa de madera superior y cenefa sagrada 360
nodes[730].translation = [0.0, 3.70 + DELTA_Y, 0.0];
nodes[729].translation = [0.0, DELTA_Y, 0.0];

// 1.3 Estructura completa del techo cónico (café oscuro)
if (!nodes[979].translation) {
  nodes[979].translation = [0.0, DELTA_Y, 0.0];
} else {
  nodes[979].translation[1] += DELTA_Y;
}

// 1.4 Las 8 pilastras arquitectónicas perimetrales
const pilastrasRootIds = [740, 750, 760, 770, 780, 790, 800, 810];
pilastrasRootIds.forEach((pId) => {
  const pNode = nodes[pId];
  if (!pNode.children || pNode.children.length < 2) return;
  const shaftId = pNode.children[0];
  const capitalId = pNode.children[1];

  nodes[shaftId].scale = [1.0, SCALE_WALL_Y, 1.0];
  nodes[shaftId].translation = [0.0, H_NEW / 2.0, 0.0];
  nodes[capitalId].translation = [0.0, 3.65 + DELTA_Y, 0.0];
});

// 1.5 Muros curvos de fondo de nichos (0.10m a 5.40m)
const NICHO_CENTER_Y = (H_NEW + 0.10) / 2.0; // 2.75m
const NICHO_HEIGHT = H_NEW - 0.10; // 5.30m

nodes[247].translation = [0.0, NICHO_CENTER_Y, 0.0];
nodes[247].scale = [1.0, NICHO_HEIGHT / 2.80, 1.0];

nodes[477].translation = [0.0, NICHO_CENTER_Y, 0.0];
nodes[477].scale = [1.0, NICHO_HEIGHT / 2.50, 1.0];

nodes[559].translation = [0.0, NICHO_CENTER_Y, 0.0];
nodes[559].scale = [1.0, NICHO_HEIGHT / 2.50, 1.0];

// 1.6 Letreros flotantes de sección
for (const signId of [1001, 1027, 1051, 1077]) {
  nodes[signId].translation[1] = 4.25;
}
console.log('✓ Arquitectura: Paredes a 5.40m, cenefa a 5.10m, techo a 7.00m.');

// ==========================================================================
// PARTE 2: REEMPLAZO DE MESAS POR MESA DE MEDIA LUNA EN MADERA OSCURA
// ==========================================================================
console.log('\n[2] Retirando mesas antiguas y repisas, y construyendo mesa de media luna en madera oscura...');

// Retirar completamente ambas mesas rectangulares anteriores (520 norte y 558 sur) y repisas (582, 597)
const gastronomiaRetirar = [520, 558, 582, 597];
nodes[598].children = nodes[598].children.filter((c) => !gastronomiaRetirar.includes(c));
for (const idx of gastronomiaRetirar) {
  nodes[idx].scale = [0.0, 0.0, 0.0];
}

// Ocultar medallones salientes de la pilastra central de gastronomía (estela_pilastra_3, nodo 760)
// para evitar cualquier recorte detrás de la columna central de recuadros
const pilastra3Medallones = [754, 755, 756, 757, 758, 759];
nodes[760].children = nodes[760].children.filter((c) => !pilastra3Medallones.includes(c));
for (const idx of pilastra3Medallones) {
  nodes[idx].scale = [0.0, 0.0, 0.0];
}

// Materiales existentes en el GLB (idénticos a los pilares, Deidades y Fiestas)
const MAT_MADERA_OSCURA = 3;    // mat_madera_oscura.036 (mismo material de los pilares)
const MAT_MARCO_ORO = 1;        // mat_kauyumari_oro.044
const MAT_CANTERA = 9;          // mat_letrero_cantera.021
const MAT_TEXTO_ORO_3D = 10;    // mat_texto_oro_3d.021

// Helper para construir una geometría extruida en media luna (demi-lune) en XZ:
// - Borde recto en X local = 0 (respaldo paralelo al muro +X)
// - Borde curvo semi-elíptico apuntando hacia -X (centro del museo / vista del espectador)
const createHalfMoonExtrude = (rx, rz, height, bevelSize = 0, segments = 48) => {
  const shape = new THREE.Shape();
  // Recorrido antihorario en 2D (u, v): de (0, +rz) pasando por (-rx, 0) hasta (0, -rz),
  // cerrando con el borde recto de regreso a (0, +rz).
  for (let i = 0; i <= segments; i++) {
    const t = Math.PI / 2 - (i / segments) * Math.PI; // +PI/2 .. -PI/2
    const u = -rx * Math.cos(t); // 0 .. -rx .. 0 (curva apuntando al centro -X)
    const v = rz * Math.sin(t);  // +rz .. 0 .. -rz
    if (i === 0) shape.moveTo(u, v);
    else shape.lineTo(u, v);
  }
  shape.closePath();

  const extrudeDepth = Math.max(0.01, height - bevelSize * 2);
  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: extrudeDepth,
    bevelEnabled: bevelSize > 0,
    bevelThickness: bevelSize,
    bevelSize: bevelSize,
    bevelSegments: bevelSize > 0 ? 2 : 0,
    curveSegments: 1
  });
  // Rotar -90° en X: local (u, v, z) -> (u, +z, -v), asentando base en Y=0
  geom.rotateX(-Math.PI / 2);
  if (bevelSize > 0) {
    geom.translate(0, bevelSize, 0);
  }
  geom.computeVertexNormals();
  return geom;
};

// Helper para construir un travesaño curvo hueco en forma de arco (D-ring)
const createHalfMoonArcBand = (rxOuter, rzOuter, bandWidth, height, segments = 48) => {
  const rxInner = rxOuter - bandWidth;
  const rzInner = rzOuter - bandWidth;
  const shape = new THREE.Shape();

  // Arco exterior (de +PI/2 a -PI/2)
  for (let i = 0; i <= segments; i++) {
    const t = Math.PI / 2 - (i / segments) * Math.PI;
    const u = -rxOuter * Math.cos(t);
    const v = rzOuter * Math.sin(t);
    if (i === 0) shape.moveTo(u, v);
    else shape.lineTo(u, v);
  }
  // Arco interior de regreso (de -PI/2 a +PI/2)
  for (let i = segments; i >= 0; i--) {
    const t = Math.PI / 2 - (i / segments) * Math.PI;
    const u = -rxInner * Math.cos(t);
    const v = rzInner * Math.sin(t);
    shape.lineTo(u, v);
  }
  shape.closePath();

  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: false,
    curveSegments: 1
  });
  geom.rotateX(-Math.PI / 2);
  geom.computeVertexNormals();
  return geom;
};

// Dimensiones y posición de la mesa de media luna (vacía, madera oscura de pilares)
const MESA_X_BACK = 6.05; // Respaldo recto a 1.65m del centro de recuadros y libre del metate
const MESA_RX = 1.85;     // Profundidad hacia el centro: ápice curvo en X = 4.20m
const MESA_RZ = 2.15;     // Ancho total en Z = 4.30m (Z = -2.15m..+2.15m)
const MESA_TOP_Y = 0.86;  // Superficie superior limpia a 0.86m (bajo línea de vista de Fila 2)
const TABLERO_H = 0.075;  // Espesor del tablero (Y = 0.785m..0.860m)
const FALDON_H = 0.115;   // Faldón estructural curvo bajo el tablero (Y = 0.675m..0.790m)
const PATA_H = 0.79;      // Altura de las patas (Y = 0.00m..0.79m)
const PATA_SIZE = 0.115;  // Sección cuadrada robusta de madera oscura

const { meshIdx: tableroMediaLunaMeshIdx } = addGeometryMeshToGltf(
  createHalfMoonExtrude(MESA_RX, MESA_RZ, TABLERO_H, 0.012, 48),
  MAT_MADERA_OSCURA,
  'mesh_tablero_mesa_media_luna'
);

const { meshIdx: faldonMediaLunaMeshIdx } = addGeometryMeshToGltf(
  createHalfMoonExtrude(MESA_RX - 0.09, MESA_RZ - 0.09, FALDON_H, 0, 48),
  MAT_MADERA_OSCURA,
  'mesh_faldon_mesa_media_luna'
);

const { meshIdx: pataMediaLunaMeshIdx } = addGeometryMeshToGltf(
  new THREE.BoxGeometry(PATA_SIZE, PATA_H, PATA_SIZE),
  MAT_MADERA_OSCURA,
  'mesh_pata_mesa_media_luna'
);

// 5 patas sólidas + travesaño curvo/trasero alineados exactamente sobre la misma semi-elipse
const LEG_BACK_X = -0.14;
const LEG_ARC_RX = MESA_RX - 0.19 + LEG_BACK_X; // 1.52m desde el eje trasero -> ápice en -1.66m
const LEG_ARC_RZ = MESA_RZ - 0.19;              // 1.96m -> esquinas traseras en Z = ±1.96m
const TRAV_BAND = 0.065;

const { meshIdx: travesanoCurvoMeshIdx } = addGeometryMeshToGltf(
  createHalfMoonArcBand(LEG_ARC_RX + TRAV_BAND / 2, LEG_ARC_RZ + TRAV_BAND / 2, TRAV_BAND, 0.055, 48),
  MAT_MADERA_OSCURA,
  'mesh_travesano_curvo_mesa_media_luna'
);

const { meshIdx: travesanoTraseroMeshIdx } = addGeometryMeshToGltf(
  new THREE.BoxGeometry(TRAV_BAND, 0.055, LEG_ARC_RZ * 2),
  MAT_MADERA_OSCURA,
  'mesh_travesano_trasero_mesa_media_luna'
);

const mesaMediaLunaChildren = [];

// Tablero principal en media luna
const tableroNodeIdx = nodes.length;
nodes.push({
  name: 'tablero_mesa_media_luna',
  mesh: tableroMediaLunaMeshIdx,
  translation: [0.0, MESA_TOP_Y - TABLERO_H, 0.0]
});
mesaMediaLunaChildren.push(tableroNodeIdx);

// Faldón curvo estructural bajo el tablero
const faldonNodeIdx = nodes.length;
nodes.push({
  name: 'faldon_mesa_media_luna',
  mesh: faldonMediaLunaMeshIdx,
  translation: [-0.04, MESA_TOP_Y - TABLERO_H - FALDON_H + 0.005, 0.0]
});
mesaMediaLunaChildren.push(faldonNodeIdx);

// Travesaño inferior curvo + barra trasera a Y=0.20m pasando por el centro exacto de las 5 patas
const travesanoCurvoNodeIdx = nodes.length;
nodes.push({
  name: 'travesano_curvo_mesa_media_luna',
  mesh: travesanoCurvoMeshIdx,
  translation: [LEG_BACK_X, 0.20, 0.0]
});
mesaMediaLunaChildren.push(travesanoCurvoNodeIdx);

const travesanoTraseroNodeIdx = nodes.length;
nodes.push({
  name: 'travesano_trasero_mesa_media_luna',
  mesh: travesanoTraseroMeshIdx,
  translation: [LEG_BACK_X, 0.2275, 0.0]
});
mesaMediaLunaChildren.push(travesanoTraseroNodeIdx);

// 5 patas sólidas siguiendo exactamente el perímetro del travesaño (2 traseras + 3 en el arco frontal)
const legCoords = [
  { name: 'pata_trasera_norte', x: LEG_BACK_X, z: -LEG_ARC_RZ },
  { name: 'pata_trasera_sur',   x: LEG_BACK_X, z: +LEG_ARC_RZ },
  { name: 'pata_curva_norte',   x: LEG_BACK_X - LEG_ARC_RX * Math.cos(-45 * Math.PI / 180), z: LEG_ARC_RZ * Math.sin(-45 * Math.PI / 180) },
  { name: 'pata_curva_centro',  x: LEG_BACK_X - LEG_ARC_RX, z: 0.0 },
  { name: 'pata_curva_sur',     x: LEG_BACK_X - LEG_ARC_RX * Math.cos(45 * Math.PI / 180),  z: LEG_ARC_RZ * Math.sin(45 * Math.PI / 180) }
];

for (const leg of legCoords) {
  const legNodeIdx = nodes.length;
  nodes.push({
    name: `mesa_media_luna_${leg.name}`,
    mesh: pataMediaLunaMeshIdx,
    translation: [leg.x, PATA_H / 2, leg.z]
  });
  mesaMediaLunaChildren.push(legNodeIdx);
}

const mesaMediaLunaRootIdx = nodes.length;
nodes.push({
  name: 'mesa_gastronomia_media_luna',
  translation: [MESA_X_BACK, 0.0, 0.0],
  children: mesaMediaLunaChildren
});
nodes[598].children.push(mesaMediaLunaRootIdx);

console.log(
  `✓ Mesa de media luna creada en mat_madera_oscura (respaldo X=${MESA_X_BACK}m, ápice curvo X=${(MESA_X_BACK - MESA_RX).toFixed(2)}m apuntando al centro, Z=±${MESA_RZ}m, Y=${MESA_TOP_Y}m).`
);

// ==========================================================================
// PARTE 3: 6 RECUADROS (+15%) EN 2 FILAS × 3 COLUMNAS CON PLACAS EN ORO 3D
// ==========================================================================
console.log('\n[3] Construyendo 6 recuadros (+15% incluyendo letreros, mismos gaps) en Gastronomía...');

// Cargar tipografía oficial helvetiker_bold e inyectar glifo 'Í' para ortografía impecable
const fontPath = path.resolve(rootDir, 'node_modules/three/examples/fonts/helvetiker_bold.typeface.json');
const fontData = JSON.parse(fs.readFileSync(fontPath, 'utf8'));
if (!fontData.glyphs['Í'] && fontData.glyphs['I']) {
  const baseI = fontData.glyphs['I'];
  fontData.glyphs['Í'] = {
    x_min: baseI.x_min,
    x_max: Math.max(baseI.x_max, 310),
    ha: baseI.ha,
    o: `${baseI.o}m 175 1110 l 85 1110 l 195 1310 l 310 1310 l 175 1110 `
  };
}
const fontLoader = new FontLoader();
const font = fontLoader.parse(fontData);

// Factor de ampliación uniforme del +15% para cuadros y letreros manteniendo el mismo gap entre cuadros
const SCALE_15 = 1.15;

// Geometrías compartidas del marco del recuadro (+15%: 1.656m ancho × 1.127m alto)
const RECUADRO_W = 1.44 * SCALE_15; // 1.656m
const RECUADRO_H = 0.98 * SCALE_15; // 1.127m
const ORO_W = 1.36 * SCALE_15;      // 1.564m
const ORO_H = 0.90 * SCALE_15;      // 1.035m
const LIENZO_W = 1.32 * SCALE_15;   // 1.518m
const LIENZO_H = 0.86 * SCALE_15;   // 0.989m

const { meshIdx: marcoMaderaMeshIdx } = addGeometryMeshToGltf(
  new THREE.BoxGeometry(RECUADRO_W, RECUADRO_H, 0.045),
  MAT_MADERA_OSCURA,
  'mesh_marco_madera_gastronomia'
);

const { meshIdx: marcoOroMeshIdx } = addGeometryMeshToGltf(
  new THREE.BoxGeometry(ORO_W, ORO_H, 0.048),
  MAT_MARCO_ORO,
  'mesh_marco_oro_gastronomia'
);

// Reutilizamos las mallas exactas de las placas de Deidades/Fiestas (meshes 40, 41, 42)
// Escala +15% proporcional: 1.587m × 0.3128m, con texto 3D a escala uniforme [1, 1, 1]
const PLACA_MESH_MADERA = 40;
const PLACA_MESH_ORO = 41;
const PLACA_MESH_CANTERA = 42;
const PLACA_BG_SCALE = [1.15 * SCALE_15, 0.80 * SCALE_15, 1.0]; // [1.3225, 0.92, 1.0]
const PLACA_H = 0.34 * PLACA_BG_SCALE[1]; // 0.3128m
const PLACA_GAP_LOCAL = 0.065; // Separación limpia entre borde inferior del cuadro y placa
const PLACA_OFFSET_Y = -(RECUADRO_H / 2 + PLACA_GAP_LOCAL + PLACA_H / 2); // -0.7849m

// Distribución 2 filas × 3 columnas sobre el muro curvo de Gastronomía (+X)
// Manteniendo los mismos gaps previos: ~0.435m horizontal y ~0.275m vertical entre filas
const R_GALERIA = 7.70; // 10cm delante del fuste de pilastra y 24cm dentro del nicho (7.94m)
const COL_ANGLES_DEG = [-15.6, 0.0, 15.6]; // Cuerda centro-centro 2.090m -> gap 0.434m (idéntico al 0.437m previo)
const ROW_Y_TOP = 3.77;    // Recuadro: 3.207m..4.334m | Placa: 2.829m..3.141m (59cm bajo cenefa)
const ROW_Y_BOTTOM = 1.99; // Recuadro: 1.427m..2.554m | Placa: 1.049m..1.361m (gap vertical 0.275m; 19cm sobre mesa 0.86m)

const gastronomiaItems = [
  // Fila 1 (Superior)
  { id: 'tortillas',    label: 'TORTILLAS DE MAÍZ', row: 0, col: 0, y: ROW_Y_TOP,    deg: COL_ANGLES_DEG[0] },
  { id: 'tamales',      label: 'TAMALES',           row: 0, col: 1, y: ROW_Y_TOP,    deg: COL_ANGLES_DEG[1] },
  { id: 'atole',        label: 'ATOLE DE MAÍZ',     row: 0, col: 2, y: ROW_Y_TOP,    deg: COL_ANGLES_DEG[2] },
  // Fila 2 (Inferior)
  { id: 'caldo_toro',   label: 'CALDO DE TORO',     row: 1, col: 0, y: ROW_Y_BOTTOM, deg: COL_ANGLES_DEG[0] },
  { id: 'maiz_tostado', label: 'MAÍZ TOSTADO',      row: 1, col: 1, y: ROW_Y_BOTTOM, deg: COL_ANGLES_DEG[1] },
  { id: 'perruri',      label: 'PERRURI',           row: 1, col: 2, y: ROW_Y_BOTTOM, deg: COL_ANGLES_DEG[2] }
];

const TEXT_SIZE = 0.082 * SCALE_15; // 0.0943m (+15% exacto)

for (const item of gastronomiaItems) {
  const rad = (item.deg * Math.PI) / 180;
  const x = R_GALERIA * Math.cos(rad);
  const z = R_GALERIA * Math.sin(rad);

  // Orientación exacta mirando hacia el centro del museo (0, item.y, 0)
  const dummy = new THREE.Object3D();
  dummy.position.set(x, item.y, z);
  dummy.lookAt(0, item.y, 0);
  const quat = [dummy.quaternion.x, dummy.quaternion.y, dummy.quaternion.z, dummy.quaternion.w];

  // Malla individual del lienzo vacío (con UVs 0..1 listos para aplicar imagen luego)
  const { meshIdx: lienzoMeshIdx } = addGeometryMeshToGltf(
    new THREE.PlaneGeometry(LIENZO_W, LIENZO_H),
    MAT_CANTERA,
    `mesh_lienzo_gastronomia_${item.id}`
  );

  // Geometría 3D del nombre en oro ceremonial
  const textGeom = new TextGeometry(item.label, {
    font,
    size: TEXT_SIZE,
    depth: 0.012,
    curveSegments: 3,
    bevelEnabled: false
  });
  textGeom.computeVertexNormals();
  textGeom.center();

  const { meshIdx: textMeshIdx, bb: textBb } = addGeometryMeshToGltf(
    textGeom,
    MAT_TEXTO_ORO_3D,
    `mesh_texto_3d_gastronomia_${item.id}`
  );

  // Nodos del recuadro
  const marcoMaderaNodeIdx = nodes.length;
  nodes.push({
    name: `marco_madera_gastronomia_${item.id}`,
    mesh: marcoMaderaMeshIdx,
    translation: [0.0, 0.0, 0.0]
  });

  const marcoOroNodeIdx = nodes.length;
  nodes.push({
    name: `marco_oro_gastronomia_${item.id}`,
    mesh: marcoOroMeshIdx,
    translation: [0.0, 0.0, 0.0]
  });

  const lienzoNodeIdx = nodes.length;
  nodes.push({
    name: `lienzo_gastronomia_${item.id}`,
    mesh: lienzoMeshIdx,
    translation: [0.0, 0.0, 0.026]
  });

  // Nodos de la placa inferior
  const placaMaderaNodeIdx = nodes.length;
  nodes.push({
    name: `placa_base_madera_gastronomia_${item.id}`,
    mesh: PLACA_MESH_MADERA,
    translation: [0.0, 0.0, 0.0],
    scale: PLACA_BG_SCALE
  });

  const placaOroNodeIdx = nodes.length;
  nodes.push({
    name: `placa_marco_oro_gastronomia_${item.id}`,
    mesh: PLACA_MESH_ORO,
    translation: [0.0, 0.0, 0.0],
    scale: PLACA_BG_SCALE
  });

  const placaCanteraNodeIdx = nodes.length;
  nodes.push({
    name: `placa_cantera_gastronomia_${item.id}`,
    mesh: PLACA_MESH_CANTERA,
    translation: [0.0, 0.0, 0.012],
    scale: PLACA_BG_SCALE
  });

  const placaTextoNodeIdx = nodes.length;
  nodes.push({
    name: `placa_texto_oro_3d_gastronomia_${item.id}`,
    mesh: textMeshIdx,
    translation: [0.0, 0.0, 0.022]
  });

  const placaGroupNodeIdx = nodes.length;
  nodes.push({
    name: `placa_gastronomia_${item.id}`,
    translation: [0.0, PLACA_OFFSET_Y, 0.0],
    children: [placaMaderaNodeIdx, placaOroNodeIdx, placaCanteraNodeIdx, placaTextoNodeIdx]
  });

  // Nodo contenedor de la estación del platillo (recuadro + placa inferior)
  const recuadroStationNodeIdx = nodes.length;
  nodes.push({
    name: `recuadro_gastronomia_${item.id}`,
    translation: [x, item.y, z],
    rotation: quat,
    children: [marcoMaderaNodeIdx, marcoOroNodeIdx, lienzoNodeIdx, placaGroupNodeIdx]
  });

  // Vincular a cuadrante_gastronomia (nodo 598)
  nodes[598].children.push(recuadroStationNodeIdx);

  const textW = (textBb.max.x - textBb.min.x).toFixed(3);
  const textH = (textBb.max.y - textBb.min.y).toFixed(3);
  console.log(
    `  ✓ [Fila ${item.row + 1}, Col ${item.col + 1}] ${item.label.padEnd(18)} ` +
    `pos=(${x.toFixed(2)}, ${item.y.toFixed(2)}, ${z.toFixed(2)}) | texto=${textW}m × ${textH}m`
  );
}

// ==========================================================================
// PARTE 4: EMPAQUETADO FINAL DEL GLB v15
// ==========================================================================
gltf.buffers[0].byteLength = binBuffer.length;

let newJsonBytes = Buffer.from(JSON.stringify(gltf), 'utf8');
const jsonPad = (4 - (newJsonBytes.length % 4)) % 4;
if (jsonPad > 0) {
  newJsonBytes = Buffer.concat([newJsonBytes, Buffer.from(' '.repeat(jsonPad), 'utf8')]);
}

const binPad = (4 - (binBuffer.length % 4)) % 4;
if (binPad > 0) {
  binBuffer = Buffer.concat([binBuffer, Buffer.alloc(binPad)]);
}

const newC0Len = newJsonBytes.length;
const newC1Len = binBuffer.length;
const newTotalLen = 12 + 8 + newC0Len + 8 + newC1Len;

const header = Buffer.alloc(12);
header.write('glTF', 0, 4, 'ascii');
header.writeUInt32LE(2, 4);
header.writeUInt32LE(newTotalLen, 8);

const chunk0Header = Buffer.alloc(8);
chunk0Header.writeUInt32LE(newC0Len, 0);
chunk0Header.write('JSON', 4, 4, 'ascii');

const chunk1Header = Buffer.alloc(8);
chunk1Header.writeUInt32LE(newC1Len, 0);
chunk1Header.write('BIN\x00', 4, 4, 'ascii');

const finalGlb = Buffer.concat([
  header,
  chunk0Header,
  newJsonBytes,
  chunk1Header,
  binBuffer
]);

fs.writeFileSync(outputPath, finalGlb);
const sizeMb = (finalGlb.length / (1024 * 1024)).toFixed(2);
console.log(`\n¡Listo! Archivo generado: ${outputPath} (${sizeMb} MB)`);
