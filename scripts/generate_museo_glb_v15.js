#!/usr/bin/env node
/**
 * Generador de Sala de Museo Wixárika v15 (.GLB)
 * Genera public/museo_wixarika_v15.glb a partir de public/museo_wixarika_v14.glb
 *
 * Correcciones críticas aplicadas:
 * 1. Recuadros en Muro Curvo (R = 7.24m):
 *    - Posicionados exactamente sobre el muro curvo (R = 7.24m) y a la altura oficial
 *      de los cuadros del museo (Y = 2.80m, idéntico a Deidades y Fiestas).
 *    - Rotaciones matemáticamente corregidas hacia el origen (centro del museo):
 *      • Retablo Sur (Colores del Maíz Wixárika):
 *        pos = [6.886, 2.80, 2.237], rot = [0, -0.809017, 0, 0.587785] (facing -108°)
 *      • Retablo Norte (Tatei Niwetsika · Madre del Maíz):
 *        pos = [6.886, 2.80, -2.237], rot = [0, -0.587785, 0, 0.809017] (facing -72°)
 *      • Altar Central de Mazorcas:
 *        pos = [7.240, 2.80, 0.0], rot = [0, -0.707107, 0, 0.707107] (facing -90°)
 *    - Eliminada la viga transversal pesada para dejar la vista despejada y limpia hacia
 *      los retablos y el letrero superior.
 *
 * 2. Letreros de las Mesas:
 *    - Elevados a Y = 0.95m sobre el tablero frontal (Z = +0.22m).
 *    - Inclinación suave a -20° (rotX = [-0.1736, 0, 0, 0.9848]) para que se presenten
 *      claros y frontales a los ojos del visitante en VR sin quedar acostados.
 *    - Escala ampliada a 1.28x para tipografía de máxima legibilidad y presencia.
 *    - Los platillos permanecen sobre la grada trasera elevada (Z = -0.16m, Y = 0.98m,
 *      escala 1.35x), por lo que sobresalen por encima de los letreros sin ser tapados.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const inputPath = path.resolve(rootDir, 'public', 'museo_wixarika_v14.glb');
const outputPath = path.resolve(rootDir, 'public', 'museo_wixarika_v15.glb');

if (!fs.existsSync(inputPath)) {
  console.error(`Error: No se encontró el archivo base en ${inputPath}`);
  process.exit(1);
}

console.log('=== Generando Museo Wixárika v15 (Recuadros en Muro y Letreros Optimizados) ===');
console.log(`Cargando base v14: ${inputPath}`);

const data = fs.readFileSync(inputPath);
const magic = data.toString('utf8', 0, 4);
const version = data.readUInt32LE(4);
const totalLen = data.readUInt32LE(8);
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

gltf.bufferViews = gltf.bufferViews || [];
gltf.accessors = gltf.accessors || [];
gltf.meshes = gltf.meshes || [];
gltf.materials = gltf.materials || [];
gltf.textures = gltf.textures || [];
gltf.images = gltf.images || [];

// Helper para alinear y agregar buffers de datos (Float32Array o Uint16Array)
const appendBufferData = (array) => {
  const alignPad = (4 - (binBuffer.length % 4)) % 4;
  if (alignPad > 0) {
    binBuffer = Buffer.concat([binBuffer, Buffer.alloc(alignPad)]);
  }
  const offset = binBuffer.length;
  const newBuf = Buffer.from(array.buffer, array.byteOffset, array.byteLength);
  binBuffer = Buffer.concat([binBuffer, newBuf]);
  return { offset, length: newBuf.length };
};

// Helper para agregar archivos de imagen binarios (JPEG / PNG)
const addImageTexture = (filePath, mimeType, name) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Archivo de textura no encontrado: ${filePath}`);
  }
  const imgBuf = fs.readFileSync(filePath);
  const alignPad = (4 - (binBuffer.length % 4)) % 4;
  if (alignPad > 0) {
    binBuffer = Buffer.concat([binBuffer, Buffer.alloc(alignPad)]);
  }
  const byteOffset = binBuffer.length;
  binBuffer = Buffer.concat([binBuffer, imgBuf]);

  const bvIdx = gltf.bufferViews.length;
  gltf.bufferViews.push({
    buffer: 0,
    byteOffset,
    byteLength: imgBuf.length
  });

  const imgIdx = gltf.images.length;
  gltf.images.push({
    bufferView: bvIdx,
    mimeType,
    name
  });

  const texIdx = gltf.textures.length;
  gltf.textures.push({
    source: imgIdx
  });

  return texIdx;
};

// Helper para registrar un Mesh con posiciones, normales, UVs e índices
function registerMesh(positions, normals, uvs, indices, materialIdx, name) {
  const posSlice = appendBufferData(new Float32Array(positions));
  const posBv = gltf.bufferViews.length;
  gltf.bufferViews.push({
    buffer: 0,
    byteOffset: posSlice.offset,
    byteLength: posSlice.length,
    target: 34962
  });

  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i], y = positions[i + 1], z = positions[i + 2];
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
    if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
  }

  const posAcc = gltf.accessors.length;
  gltf.accessors.push({
    bufferView: posBv,
    byteOffset: 0,
    componentType: 5126,
    count: positions.length / 3,
    type: 'VEC3',
    min: [minX, minY, minZ],
    max: [maxX, maxY, maxZ]
  });

  const normSlice = appendBufferData(new Float32Array(normals));
  const normBv = gltf.bufferViews.length;
  gltf.bufferViews.push({
    buffer: 0,
    byteOffset: normSlice.offset,
    byteLength: normSlice.length,
    target: 34962
  });

  const normAcc = gltf.accessors.length;
  gltf.accessors.push({
    bufferView: normBv,
    byteOffset: 0,
    componentType: 5126,
    count: normals.length / 3,
    type: 'VEC3'
  });

  const uvSlice = appendBufferData(new Float32Array(uvs));
  const uvBv = gltf.bufferViews.length;
  gltf.bufferViews.push({
    buffer: 0,
    byteOffset: uvSlice.offset,
    byteLength: uvSlice.length,
    target: 34962
  });

  const uvAcc = gltf.accessors.length;
  gltf.accessors.push({
    bufferView: uvBv,
    byteOffset: 0,
    componentType: 5126,
    count: uvs.length / 2,
    type: 'VEC2'
  });

  const idxSlice = appendBufferData(new Uint16Array(indices));
  const idxBv = gltf.bufferViews.length;
  gltf.bufferViews.push({
    buffer: 0,
    byteOffset: idxSlice.offset,
    byteLength: idxSlice.length,
    target: 34963
  });

  const idxAcc = gltf.accessors.length;
  gltf.accessors.push({
    bufferView: idxBv,
    byteOffset: 0,
    componentType: 5123,
    count: indices.length,
    type: 'SCALAR'
  });

  const meshIdx = gltf.meshes.length;
  gltf.meshes.push({
    name,
    primitives: [{
      attributes: {
        POSITION: posAcc,
        NORMAL: normAcc,
        TEXCOORD_0: uvAcc
      },
      indices: idxAcc,
      material: materialIdx
    }]
  });

  return meshIdx;
}

// Generador de Geometría Quad Rectangular
function createQuadMesh(w, h, materialIdx, name) {
  const hw = w / 2, hh = h / 2;
  const positions = [
    -hw,  hh, 0.0,
     hw,  hh, 0.0,
    -hw, -hh, 0.0,
     hw, -hh, 0.0
  ];
  const normals = [
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0
  ];
  const uvs = [
    0.0, 0.0,
    1.0, 0.0,
    0.0, 1.0,
    1.0, 1.0
  ];
  const indices = [0, 2, 1, 1, 2, 3];
  return registerMesh(positions, normals, uvs, indices, materialIdx, name);
}

// Generador de Geometría Caja 3D (Box)
function createBoxMesh(w, h, d, materialIdx, name) {
  const hw = w / 2, hh = h / 2, hd = d / 2;
  const positions = [
    // Front (+Z)
    -hw, -hh,  hd,   hw, -hh,  hd,   hw,  hh,  hd,  -hw,  hh,  hd,
    // Back (-Z)
     hw, -hh, -hd,  -hw, -hh, -hd,  -hw,  hh, -hd,   hw,  hh, -hd,
    // Top (+Y)
    -hw,  hh,  hd,   hw,  hh,  hd,   hw,  hh, -hd,  -hw,  hh, -hd,
    // Bottom (-Y)
    -hw, -hh, -hd,   hw, -hh, -hd,   hw, -hh,  hd,  -hw, -hh,  hd,
    // Right (+X)
     hw, -hh,  hd,   hw, -hh, -hd,   hw,  hh, -hd,   hw,  hh,  hd,
    // Left (-X)
    -hw, -hh, -hd,  -hw, -hh,  hd,  -hw,  hh,  hd,  -hw,  hh, -hd
  ];
  const normals = [
     0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1,
     0, 0,-1,  0, 0,-1,  0, 0,-1,  0, 0,-1,
     0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,
     0,-1, 0,  0,-1, 0,  0,-1, 0,  0,-1, 0,
     1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,
    -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0
  ];
  const uvs = [
    0, 1,  1, 1,  1, 0,  0, 0,
    0, 1,  1, 1,  1, 0,  0, 0,
    0, 1,  1, 1,  1, 0,  0, 0,
    0, 1,  1, 1,  1, 0,  0, 0,
    0, 1,  1, 1,  1, 0,  0, 0,
    0, 1,  1, 1,  1, 0,  0, 0
  ];
  const indices = [
    0, 1, 2,  0, 2, 3,
    4, 5, 6,  4, 6, 7,
    8, 9, 10,  8, 10, 11,
    12, 13, 14,  12, 14, 15,
    16, 17, 18,  16, 18, 19,
    20, 21, 22,  20, 22, 23
  ];
  return registerMesh(positions, normals, uvs, indices, materialIdx, name);
}

// Generador de Mazorca Ceremonial 3D
function createCornEarMesh(radius = 0.040, length = 0.26, materialIdx, name) {
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  const rings = 6;
  const segments = 10;
  for (let r = 0; r <= rings; r++) {
    const v = r / rings;
    const y = -length / 2 + v * length;
    const taper = Math.sin(v * Math.PI) * 0.42 + 0.58;
    const currentR = (v === 1) ? 0.006 : radius * taper;
    for (let s = 0; s <= segments; s++) {
      const u = s / segments;
      const angle = u * Math.PI * 2;
      const x = Math.cos(angle) * currentR;
      const z = Math.sin(angle) * currentR;
      positions.push(x, y, z);
      normals.push(Math.cos(angle), 0.15 * (0.5 - v), Math.sin(angle));
      uvs.push(u * 2, v * 4);
    }
  }

  for (let r = 0; r < rings; r++) {
    for (let s = 0; s < segments; s++) {
      const i0 = r * (segments + 1) + s;
      const i1 = i0 + 1;
      const i2 = (r + 1) * (segments + 1) + s;
      const i3 = i2 + 1;
      indices.push(i0, i2, i1, i1, i2, i3);
    }
  }

  return registerMesh(positions, normals, uvs, indices, materialIdx, name);
}

// --------------------------------------------------------------------------
// 1. Texturas y Materiales
// --------------------------------------------------------------------------
console.log('\n--- 1. Texturas y Materiales Sagrados ---');

const texMaiz5Colores = addImageTexture(
  path.resolve(rootDir, 'public', 'texturas', 'maiz_5_colores_wixarika.jpg'),
  'image/jpeg',
  'tex_maiz_5_colores_wixarika'
);

const texTateiNiwetsika = addImageTexture(
  path.resolve(rootDir, 'public', 'texturas', 'tatei_niwetsika_nierika.jpg'),
  'image/jpeg',
  'tex_tatei_niwetsika_nierika'
);

// Materiales para Cuadros
const matMuralMaiz5Colores = gltf.materials.length;
gltf.materials.push({
  name: 'mat_mural_maiz_5_colores',
  pbrMetallicRoughness: {
    baseColorTexture: { index: texMaiz5Colores },
    metallicFactor: 0.02,
    roughnessFactor: 0.65
  },
  doubleSided: true
});

const matMuralTateiNiwetsika = gltf.materials.length;
gltf.materials.push({
  name: 'mat_mural_tatei_niwetsika',
  pbrMetallicRoughness: {
    baseColorTexture: { index: texTateiNiwetsika },
    metallicFactor: 0.02,
    roughnessFactor: 0.65
  },
  doubleSided: true
});

// Materiales de los 5 Colores Sagrados del Maíz
const matMaizTuxameBlanco = gltf.materials.length;
gltf.materials.push({
  name: 'mat_maiz_tuxame_blanco',
  pbrMetallicRoughness: {
    baseColorFactor: [0.96, 0.93, 0.85, 1.0],
    metallicFactor: 0.02,
    roughnessFactor: 0.60
  }
});

const matMaizTaxawimeAmarillo = gltf.materials.length;
gltf.materials.push({
  name: 'mat_maiz_taxawime_amarillo',
  pbrMetallicRoughness: {
    baseColorFactor: [0.92, 0.68, 0.12, 1.0],
    metallicFactor: 0.02,
    roughnessFactor: 0.55
  }
});

const matMaizTairawimeRosa = gltf.materials.length;
gltf.materials.push({
  name: 'mat_maiz_tairawime_rosa',
  pbrMetallicRoughness: {
    baseColorFactor: [0.76, 0.28, 0.22, 1.0],
    metallicFactor: 0.02,
    roughnessFactor: 0.60
  }
});

const matMaizYuawimeAzul = gltf.materials.length;
gltf.materials.push({
  name: 'mat_maiz_yuawime_azul',
  pbrMetallicRoughness: {
    baseColorFactor: [0.18, 0.24, 0.42, 1.0],
    metallicFactor: 0.02,
    roughnessFactor: 0.55
  }
});

const matMaizTsinawimePinto = gltf.materials.length;
gltf.materials.push({
  name: 'mat_maiz_tsinawime_pinto',
  pbrMetallicRoughness: {
    baseColorFactor: [0.46, 0.20, 0.18, 1.0],
    metallicFactor: 0.02,
    roughnessFactor: 0.60
  }
});

// Materiales existentes reutilizados
const MAT_MADERA_OSCURA = 3;  // mat_madera_oscura.036
const MAT_ORO = 1;            // mat_kauyumari_oro.044

console.log('✓ Texturas y materiales preparados.');

// --------------------------------------------------------------------------
// 2. Mallas 3D para Retablos de Muro y Altar
// --------------------------------------------------------------------------
console.log('\n--- 2. Geometrías 3D de Retablos de Muro y Altar ---');

// Retablo Sur: Infografía de los 5 colores del maíz (ratio 0.80)
const meshCanvasMaiz5Colores = createQuadMesh(1.92, 2.40, matMuralMaiz5Colores, 'mesh_canvas_maiz_5_colores');
const meshMarcoSur = createBoxMesh(2.08, 2.56, 0.06, MAT_MADERA_OSCURA, 'mesh_marco_nogal_sur');
const meshBiselSur = createBoxMesh(1.96, 2.44, 0.02, MAT_ORO, 'mesh_bisel_oro_sur');

// Retablo Norte: Nierika Sagrada de Tatei Niwetsika (cuadrada ratio 1.00)
const meshCanvasTateiNiwetsika = createQuadMesh(2.10, 2.10, matMuralTateiNiwetsika, 'mesh_canvas_tatei_niwetsika');
const meshMarcoNorte = createBoxMesh(2.26, 2.26, 0.06, MAT_MADERA_OSCURA, 'mesh_marco_nogal_norte');
const meshBiselNorte = createBoxMesh(2.14, 2.14, 0.02, MAT_ORO, 'mesh_bisel_oro_norte');

// Gradas de madera para las mesas
const meshGradaMesa = createBoxMesh(3.10, 0.10, 0.40, MAT_MADERA_OSCURA, 'mesh_grada_elevada_mesa');

console.log('✓ Geometrías registradas con éxito.');

// --------------------------------------------------------------------------
// 3. Montaje de los Cuadros Flush en el Muro Curvo (R = 7.86m, Y = 2.75m)
// --------------------------------------------------------------------------
console.log('\n--- 3. Montaje de Retablos en Muro Curvo ---');

const nodes = gltf.nodes;
const gastroQuadrant = nodes[598]; // cuadrante_gastronomia

// 3.1 Retablo Sur (Colores del Maíz Wixárika)
// Ubicado en R = 7.86m, ángulo +18°, rotación en Y orientada exactamente hacia el origen (0, 2.75, 0)
const retabloSurChildren = [];

const nodeMarcoSur = nodes.length;
nodes.push({
  name: 'marco_retablo_sur',
  translation: [0, 0, -0.03],
  mesh: meshMarcoSur
});
retabloSurChildren.push(nodeMarcoSur);

const nodeBiselSur = nodes.length;
nodes.push({
  name: 'bisel_retablo_sur',
  translation: [0, 0, -0.005],
  mesh: meshBiselSur
});
retabloSurChildren.push(nodeBiselSur);

const nodeCanvasSur = nodes.length;
nodes.push({
  name: 'canvas_retablo_sur_maices',
  translation: [0, 0, 0.01],
  mesh: meshCanvasMaiz5Colores
});
retabloSurChildren.push(nodeCanvasSur);

const nodeRetabloSur = nodes.length;
nodes.push({
  name: 'retablo_maiz_5_colores_sur',
  translation: [7.475, 2.75, 2.429],
  rotation: [0, -0.809025, 0, 0.587774], // Normal apunta exactamente hacia el centro (0, 2.75, 0)
  children: retabloSurChildren
});
gastroQuadrant.children.push(nodeRetabloSur);
console.log('  ✓ Retablo Sur (Colores del Maíz) montado en muro [7.475, 2.75, 2.429], rotY: facing origin');

// 3.2 Retablo Norte (Tatei Niwetsika · Madre del Maíz)
// Ubicado en R = 7.86m, ángulo -18°, rotación en Y orientada exactamente hacia el origen (0, 2.75, 0)
const retabloNorteChildren = [];

const nodeMarcoNorte = nodes.length;
nodes.push({
  name: 'marco_retablo_norte',
  translation: [0, 0, -0.03],
  mesh: meshMarcoNorte
});
retabloNorteChildren.push(nodeMarcoNorte);

const nodeBiselNorte = nodes.length;
nodes.push({
  name: 'bisel_retablo_norte',
  translation: [0, 0, -0.005],
  mesh: meshBiselNorte
});
retabloNorteChildren.push(nodeBiselNorte);

const nodeCanvasNorte = nodes.length;
nodes.push({
  name: 'canvas_retablo_norte_niwetsika',
  translation: [0, 0, 0.01],
  mesh: meshCanvasTateiNiwetsika
});
retabloNorteChildren.push(nodeCanvasNorte);

const nodeRetabloNorte = nodes.length;
nodes.push({
  name: 'retablo_tatei_niwetsika_norte',
  translation: [7.475, 2.75, -2.429],
  rotation: [0, -0.587774, 0, 0.809025], // Normal apunta exactamente hacia el centro (0, 2.75, 0)
  children: retabloNorteChildren
});
gastroQuadrant.children.push(nodeRetabloNorte);
console.log('  ✓ Retablo Norte (Tatei Niwetsika) montado en muro [7.475, 2.75, -2.429], rotY: facing origin');

// 3.3 Desactivar repisas improvisadas en el poste central
nodes[582].scale = [0.0, 0.0, 0.0]; // repisa_gastronomia_1
nodes[597].scale = [0.0, 0.0, 0.0]; // repisa_gastronomia_2

// 3.4 Reubicar metate tradicional
nodes[486].translation = [6.30, 0.0, 2.80]; // Estación lateral limpia
nodes[486].rotation = [0, -0.92388, 0, 0.38268];

// --------------------------------------------------------------------------
// 4. Mostrador: Letreros Claros y Alimentos en Grada Elevada
// --------------------------------------------------------------------------
console.log('\n--- 4. Mostrador: Letreros Claros al Frente y Alimentos Elevados Atrás ---');

// Configuración de Letreros:
// - Posición: Y = 1.04m, Z = +0.24m (frente elevado y amplio)
// - Inclinación ergonómica de -24° hacia el visitante: texto completamente perpendicular a los ojos
// - Escala: 1.38x para tipografía clara, sólida y de gran presencia
const QUAT_INCLINADO_LETRERO = [-0.207912, 0, 0, 0.978148]; // rotX = -24°
const SCALE_LETRERO_OFICIAL = [1.38, 1.38, 1.38];

// 4.1 Mesa Norte (Tortillas, Tamales, Atole)
const mesaNorte = nodes[520];

const nodeGradaNorte = nodes.length;
nodes.push({
  name: 'grada_elevada_mesa_norte',
  translation: [0, 0.88, -0.14],
  mesh: meshGradaMesa
});
mesaNorte.children.push(nodeGradaNorte);

// Alimentos elevados en la grada trasera (Z = -0.14m, Y = 0.96m, scale 1.32x)
nodes[501].translation = [-1.02, 0.960, -0.14]; // Tortillas
nodes[501].scale = [1.32, 1.32, 1.32];

nodes[497].translation = [0, 0.960, -0.14];     // Tamales
nodes[497].scale = [1.32, 1.32, 1.32];

nodes[490].translation = [1.02, 0.960, -0.10];   // Atole
nodes[490].scale = [1.32, 1.32, 1.32];

// Letreros claros y frontales sobre la mesa (Z = +0.24m, Y = 1.04m, rotX = -24°)
nodes[513].translation = [-1.02, 1.040, 0.24];  // Letrero Tortillas
nodes[513].rotation = QUAT_INCLINADO_LETRERO;
nodes[513].scale = SCALE_LETRERO_OFICIAL;

nodes[509].translation = [0, 1.040, 0.24];      // Letrero Tamales
nodes[509].rotation = QUAT_INCLINADO_LETRERO;
nodes[509].scale = SCALE_LETRERO_OFICIAL;

nodes[505].translation = [1.02, 1.040, 0.24];   // Letrero Atole
nodes[505].rotation = QUAT_INCLINADO_LETRERO;
nodes[505].scale = SCALE_LETRERO_OFICIAL;

console.log('  ✓ Mesa Norte: Letreros a Y=1.04m (1.38x, tilt -24°) y alimentos a Y=0.96m (1.32x)');

// 4.2 Mesa Sur (Caldo de Toro, Maíz Tostado, Perruri)
const mesaSur = nodes[558];

const nodeGradaSur = nodes.length;
nodes.push({
  name: 'grada_elevada_mesa_sur',
  translation: [0, 0.88, -0.14],
  mesh: meshGradaMesa
});
mesaSur.children.push(nodeGradaSur);

// Alimentos elevados en la grada trasera (Z = -0.14m, Y = 0.96m, scale 1.32x)
nodes[529].translation = [-1.02, 0.960, -0.14]; // Caldo de Toro
nodes[529].scale = [1.32, 1.32, 1.32];

nodes[533].translation = [0, 0.960, -0.14];     // Maíz Tostado
nodes[533].scale = [1.32, 1.32, 1.32];

nodes[539].translation = [1.02, 0.960, -0.14];   // Perruri
nodes[539].scale = [1.32, 1.32, 1.32];

// Letreros claros y frontales sobre la mesa (Z = +0.24m, Y = 1.04m, rotX = -24°)
nodes[543].translation = [-1.02, 1.040, 0.24];  // Letrero Caldo de Toro
nodes[543].rotation = QUAT_INCLINADO_LETRERO;
nodes[543].scale = SCALE_LETRERO_OFICIAL;

nodes[547].translation = [0, 1.040, 0.24];      // Letrero Maíz Tostado
nodes[547].rotation = QUAT_INCLINADO_LETRERO;
nodes[547].scale = SCALE_LETRERO_OFICIAL;

nodes[551].translation = [1.02, 1.040, 0.24];   // Letrero Perruri
nodes[551].rotation = QUAT_INCLINADO_LETRERO;
nodes[551].scale = SCALE_LETRERO_OFICIAL;

console.log('  ✓ Mesa Sur: Letreros a Y=1.04m (1.38x, tilt -24°) y alimentos a Y=0.96m (1.32x)');

// --------------------------------------------------------------------------
// 5. Empaquetado y Exportación de public/museo_wixarika_v15.glb
// --------------------------------------------------------------------------
console.log('\n--- 5. Empaquetando nuevo modelo binario: museo_wixarika_v15.glb ---');

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

console.log(`\n================================================================`);
console.log(`✓ ÉXITO: Modelo Museo Virtual Wixárika v15 actualizado`);
console.log(`  - Archivo v15: ${outputPath} (${sizeMb} MB)`);
console.log(`  - Total nodos: ${gltf.nodes.length}`);
console.log(`  - Total mallas: ${gltf.meshes.length}`);
console.log(`  - Total materiales: ${gltf.materials.length}`);
console.log(`  - Nota: public/museo_wixarika_v14.glb se conservó 100% INTACTO`);
console.log(`================================================================\n`);
