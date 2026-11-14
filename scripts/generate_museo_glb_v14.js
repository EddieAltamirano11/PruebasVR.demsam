#!/usr/bin/env node
/**
 * Generador de Sala de Museo Wixárika v14 (.GLB)
 * Genera public/museo_wixarika_v14.glb a partir de public/museo_wixarika_v13.glb
 *
 * Ajustes de placas:
 * 1. Placas de Deidades:
 *    - Eliminada la línea divisoria azul (Mesh 44).
 *    - Eliminado el adorno/separador dorado (Mesh 45).
 *    - Eliminada la pequeña descripción en texto negro (Mesh 46).
 *    - Texto 3D del nombre centrado verticalmente en Y=0.0 y escalado para
 *      aprovechar al máximo la placa de cantera (1.12m x 0.26m).
 *
 * 2. Placas de Fiestas y Ceremonias:
 *    - Eliminadas las imágenes planas de las cédulas (Meshes 219, 221, 223).
 *    - Reemplazadas por texto 3D extruido en oro ceremonial (mat_texto_oro_3d.021, mat 10),
 *      idéntico al de las deidades, maximizando el espacio para máxima legibilidad VR:
 *      • Placa 1: "NAMAWITA NEIXA"
 *      • Placa 2: "TATEI NEIXA"
 *      • Placa 3: "HIKURI NEIXA"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const inputPath = path.resolve(rootDir, 'public', 'museo_wixarika_v13.glb');
const outputPath = path.resolve(rootDir, 'public', 'museo_wixarika_v14.glb');

if (!fs.existsSync(inputPath)) {
  console.error(`Error: No se encontró el archivo base en ${inputPath}`);
  process.exit(1);
}

console.log('=== Generando Museo Wixárika v14 (Placas con Texto 3D Gigante y Sin División) ===');
console.log(`Cargando base: ${inputPath}`);

const data = fs.readFileSync(inputPath);
const magic = data.toString('utf8', 0, 4);
const version = data.readUInt32LE(4);
const totalLen = data.readUInt32LE(8);
const c0Len = data.readUInt32LE(12);
const c0Type = data.toString('utf8', 16, 20);

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
// 1. Arquitectura de Muros y Techo
// --------------------------------------------------------------------------
for (const nIdx of [247, 477, 559]) {
  nodes[nIdx].translation = [0.0, 2.90, 0.0];
  nodes[nIdx].scale = [1.0, 1.45, 1.0];
}
console.log('✓ Arquitectura de muros y techo: Nichos a 2.90m');

// --------------------------------------------------------------------------
// 2. Cuadros y Placas de Deidades
// --------------------------------------------------------------------------
const DEIDADES_Y = 2.95;
const DEIDADES_SCALE = 1.30;
const DEIDADES_PLACA_Y = 1.40;

const deidadesCuadros = [46, 83, 129, 168, 204, 237];
for (const cIdx of deidadesCuadros) {
  nodes[cIdx].translation = [0.0, DEIDADES_Y, 0.0];
  nodes[cIdx].scale = [DEIDADES_SCALE, DEIDADES_SCALE, DEIDADES_SCALE];
}

const deidadesPlacas = [55, 92, 138, 177, 213, 245];
for (const pIdx of deidadesPlacas) {
  nodes[pIdx].translation = [0.0, DEIDADES_PLACA_Y, 0.0];
  nodes[pIdx].scale = [1.35, 1.35, 1.35];
}

// Configuración de texto 3D de cada deidad:
// - Ocultar línea azul divisoria, adorno dorado y texto negro descripción
// - Centrar texto 3D del nombre a Y=0.0 y escalarlo para maximizar espacio
const deidadesTextosConfig = [
  // (placaNode, textoNode, scale, [ocultarHijos])
  { placa: 55, texto: 51, scale: [1.60, 1.60, 1.60], ocultar: [52, 53, 54] },    // Tatewari
  { placa: 92, texto: 88, scale: [1.80, 1.80, 1.80], ocultar: [89, 90, 91] },    // Tayau
  { placa: 138, texto: 134, scale: [1.55, 1.55, 1.55], ocultar: [135, 136, 137] }, // Kauyumari
  { placa: 177, texto: 173, scale: [1.08, 1.08, 1.08], ocultar: [174, 175, 176] }, // Takutsi Nakawe
  { placa: 213, texto: 209, scale: [1.12, 1.12, 1.12], ocultar: [210, 211, 212] }, // Tatei Niwetsika
  { placa: 245, texto: 241, scale: [1.08, 1.08, 1.08], ocultar: [242, 243, 244] }  // Tatei Haramara
];

for (const cfg of deidadesTextosConfig) {
  // Centrar nombre 3D a Y=0.0 (en lugar de Y=0.052)
  nodes[cfg.texto].translation = [0.0, 0.0, 0.022];
  nodes[cfg.texto].scale = cfg.scale;

  // Ocultar línea azul, medallón divisor y descripción negra
  for (const hIdx of cfg.ocultar) {
    nodes[hIdx].scale = [0.0, 0.0, 0.0];
  }
}
console.log('✓ Placas de Deidades: Línea azul y descripción eliminadas. Nombres 3D centrados y maximizados.');

// --------------------------------------------------------------------------
// 3. Cuadros y Placas de Fiestas y Ceremonias
// --------------------------------------------------------------------------
const fiestasCuadros = [282, 308, 334];
for (const fcIdx of fiestasCuadros) {
  nodes[fcIdx].translation = [0.0, DEIDADES_Y, 0.0];
  nodes[fcIdx].scale = [1.16 * 1.12, 1.16 * 1.12, 1.16 * 1.12];
}

const fiestasPlacasConfig = [
  { padre: 287, hijos: [283, 284, 286], ocultar: [285], sHijo: 1.152711272239685 },
  { padre: 313, hijos: [309, 310, 312], ocultar: [311], sHijo: 1.147471308708191 },
  { padre: 340, hijos: [335, 336, 338], ocultar: [337, 339], sHijo: 1.144365906715393 }
];

for (const cfg of fiestasPlacasConfig) {
  nodes[cfg.padre].translation = [0.0, DEIDADES_PLACA_Y, 0.0];
  nodes[cfg.padre].scale = [1.08 * 1.35, 1.08 * 1.35, 1.08 * 1.35];
  for (const hIdx of cfg.hijos) {
    nodes[hIdx].scale = [cfg.sHijo, cfg.sHijo, cfg.sHijo];
  }
  for (const hIdx of cfg.ocultar) {
    nodes[hIdx].scale = [0.0, 0.0, 0.0];
  }
}
console.log('✓ Placas de Fiestas: Imágenes planas eliminadas.');

// --------------------------------------------------------------------------
// 4. Creación de Texto 3D Dorado para Fiestas (Extruido en Geometría GLB)
// --------------------------------------------------------------------------
const fontPath = path.resolve(rootDir, 'node_modules/three/examples/fonts/helvetiker_bold.typeface.json');
const fontData = JSON.parse(fs.readFileSync(fontPath, 'utf8'));
const fontLoader = new FontLoader();
const font = fontLoader.parse(fontData);

const fiestasTextosData = [
  { parentNode: 287, name: 'NAMAWITA NEIXA', size: 0.076, suffix: 'fiesta_1_namawita_neixa' },
  { parentNode: 313, name: 'TATEI NEIXA', size: 0.115, suffix: 'fiesta_2_tatei_neixa' },
  { parentNode: 340, name: 'HIKURI NEIXA', size: 0.108, suffix: 'fiesta_3_hikuri_neixa' }
];

gltf.bufferViews = gltf.bufferViews || [];
gltf.accessors = gltf.accessors || [];
gltf.meshes = gltf.meshes || [];

const appendBufferData = (floatArray) => {
  // Asegurar alineación a 4 bytes
  const alignPad = (4 - (binBuffer.length % 4)) % 4;
  if (alignPad > 0) {
    binBuffer = Buffer.concat([binBuffer, Buffer.alloc(alignPad)]);
  }
  const offset = binBuffer.length;
  const newBuf = Buffer.from(floatArray.buffer, floatArray.byteOffset, floatArray.byteLength);
  binBuffer = Buffer.concat([binBuffer, newBuf]);
  return { offset, length: newBuf.length };
};

for (const fItem of fiestasTextosData) {
  const geom = new TextGeometry(fItem.name, {
    font: font,
    size: fItem.size,
    depth: 0.012,
    curveSegments: 3,
    bevelEnabled: false
  });
  geom.computeVertexNormals();
  geom.center(); // Centra el texto en (0,0,0) en su espacio local

  const posAttr = geom.attributes.position;
  const normAttr = geom.attributes.normal;
  const vertCount = posAttr.count;

  // Calcular min y max del bounding box
  geom.computeBoundingBox();
  const bb = geom.boundingBox;
  const minPos = [bb.min.x, bb.min.y, bb.min.z];
  const maxPos = [bb.max.x, bb.max.y, bb.max.z];

  // 1. Agregar buffer de posiciones
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
    componentType: 5126, // FLOAT
    count: vertCount,
    type: 'VEC3',
    min: minPos,
    max: maxPos
  });

  // 2. Agregar buffer de normales
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
    componentType: 5126, // FLOAT
    count: vertCount,
    type: 'VEC3'
  });

  // 3. Crear Mesh con Material 10 (mat_texto_oro_3d.021)
  const meshIdx = gltf.meshes.length;
  gltf.meshes.push({
    name: `mesh_texto_3d_${fItem.suffix}`,
    primitives: [
      {
        attributes: {
          POSITION: posAccIdx,
          NORMAL: normAccIdx
        },
        material: 10
      }
    ]
  });

  // 4. Crear Nodo 3D y agregarlo como hijo de la placa correspondiente
  const nodeIdx = nodes.length;
  nodes.push({
    name: `placa_texto_oro_3d_${fItem.suffix}`,
    mesh: meshIdx,
    translation: [0.0, 0.0, 0.022]
  });

  nodes[fItem.parentNode].children = nodes[fItem.parentNode].children || [];
  nodes[fItem.parentNode].children.push(nodeIdx);

  const w = bb.max.x - bb.min.x;
  const h = bb.max.y - bb.min.y;
  console.log(`✓ Creado texto 3D para ${fItem.name}: Ancho=${w.toFixed(3)}m, Alto=${h.toFixed(3)}m (Nodo ${nodeIdx} -> Padre ${fItem.parentNode})`);
}

// --------------------------------------------------------------------------
// 5. Letreros de Sección Colgantes
// --------------------------------------------------------------------------
const seccionIndices = [
  { idx: 1001, trans: [0.0688, 4.10, 4.806] },
  { idx: 1027, trans: [0.0709, 4.10, -4.796] },
  { idx: 1051, trans: [-4.800, 4.10, -0.130] },
  { idx: 1077, trans: [4.800, 4.10, 0.130] }
];
for (const s of seccionIndices) {
  nodes[s.idx].translation = s.trans;
  nodes[s.idx].scale = [1.50, 1.50, 1.50];
}
console.log('✓ Letreros de sección: Elevados a Y=4.10m a 1.50x');

// --------------------------------------------------------------------------
// 6. Letreros y Comidas de Gastronomía
// --------------------------------------------------------------------------
nodes[501].translation = [-1.02, 0.885, -0.12];
nodes[497].translation = [0.00, 0.885, -0.12];
nodes[490].translation = [1.02, 0.885, -0.08];

nodes[513].translation = [-1.02, 1.050, 0.26];
nodes[513].scale = [1.35, 1.35, 1.35];

nodes[509].translation = [0.00, 1.050, 0.26];
nodes[509].scale = [1.35, 1.35, 1.35];

nodes[505].translation = [1.02, 1.050, 0.26];
nodes[505].scale = [1.35, 1.35, 1.35];

nodes[529].translation = [-1.02, 0.885, -0.12];
nodes[533].translation = [0.00, 0.885, -0.12];
nodes[539].translation = [1.02, 0.885, -0.12];

nodes[543].translation = [-1.02, 1.050, 0.26];
nodes[543].scale = [1.35, 1.35, 1.35];

nodes[547].translation = [0.00, 1.050, 0.26];
nodes[547].scale = [1.35, 1.35, 1.35];

nodes[551].translation = [1.02, 1.050, 0.26];
nodes[551].scale = [1.35, 1.35, 1.35];

nodes[568].translation = [0.45, 0.16, 0.10];
nodes[568].scale = [1.35, 1.35, 1.35];
console.log('✓ Letreros de gastronomía: Escalados a 1.35x con marcos acoplados');

// --------------------------------------------------------------------------
// 7. Re-empaquetado del GLB v14
// --------------------------------------------------------------------------
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
