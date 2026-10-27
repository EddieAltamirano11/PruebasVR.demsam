// ==============================================================================
// Generador / Exportador Oficial: Museo Virtual Wixárika - Versión 12 (v12)
// Basado directamente en v11 (Curaduría manual en Blender preservada al 100%)
//
// Correcciones y Mejoras del Usuario:
// 1. Letreros:
//    - Se eliminó la penetración/clipping con la mesa (base colocada sobre el tablero a Y=0.885m).
//    - Inclinación corregida a -26° (hacia arriba y atrás, normal con componente +Y apuntando
//      directamente a los ojos del visitante en VR).
//    - Dimensiones monumentales (66cm x 22cm) con tipografía gigante Georgia Bold negra de alto contraste.
//    - Separados del alimento (Z = +0.22m frente a Z = -0.12m de la comida).
// 2. Comida con Alto Detalle y Texturas Tradicionales:
//    - Cada platillo cuenta con su vajilla tradicional 3D apoyada sobre la mesa (sin traspasarla)
//      y superficies con texturas realistas de alta definición (tortillas de comal con manchas tostadas,
//      tamales en totomoxtle con amarres, caldo de toro humeante con carne y chiles,
//      maíz tostado de 5 colores, perruri dorado nupcial con tacos, atole espumoso en olla vidriada).
// 3. Dos Grandes Mesas de Exhibición (3.45m x 1.17m cada una):
//    - R = 5.25m (más de 1.15m más cerca del visitante para máxima apreciación).
//    - Mesa Norte: 3 comidas tradicionales de maíz (Tortillas, Tamales, Atole).
//    - Mesa Sur: 3 comidas ceremoniales y festivas (Caldo de Toro, Maíz Tostado, Perruri).
//    - Estante Central: Elotes Cocidos de la Milpa con su letrero a nivel de ojos.
// ==============================================================================

import fs from 'fs';
import path from 'path';

console.log('================================================================');
console.log('  GENERANDO MODELO 3D: SALA DE MUSEO WIXÁRIKA V12 (.GLB)');
console.log('  Base: Museo Wixárika v11 (Curaduría manual en Blender)');
console.log('  Comidas con Texturas de Alto Detalle + Letreros Elevados e Inclinados');
console.log('================================================================\n');

const inputV11Path = path.resolve('public', 'museo_wixarika_v11.glb');
if (!fs.existsSync(inputV11Path)) {
  console.error(`Error: No se encontró el archivo base v11 en: ${inputV11Path}`);
  process.exit(1);
}

const rawGlb = fs.readFileSync(inputV11Path);

// Leer encabezados GLB
const magic = rawGlb.readUInt32LE(0);
const version = rawGlb.readUInt32LE(4);
const totalLen = rawGlb.readUInt32LE(8);
const chunk0Len = rawGlb.readUInt32LE(12);
const chunk0Type = rawGlb.readUInt32LE(16);

if (magic !== 0x46546C67) {
  console.error('Error: El archivo no es un GLB válido');
  process.exit(1);
}

const jsonBuf = rawGlb.subarray(20, 20 + chunk0Len);
const gltf = JSON.parse(jsonBuf.toString('utf8'));

const chunk1Offset = 20 + chunk0Len;
const chunk1Len = rawGlb.readUInt32LE(chunk1Offset);
let currentBinBytes = Buffer.from(rawGlb.subarray(chunk1Offset + 8, chunk1Offset + 8 + chunk1Len));

console.log(`✓ Archivo base v11 cargado correctamente (${(rawGlb.length / 1024).toFixed(2)} KB)`);

// Helper para alinear y agregar buffers al binario
function appendToBin(dataBuffer) {
  const pad = (4 - (currentBinBytes.length % 4)) % 4;
  if (pad > 0) {
    currentBinBytes = Buffer.concat([currentBinBytes, Buffer.alloc(pad, 0)]);
  }
  const offset = currentBinBytes.length;
  currentBinBytes = Buffer.concat([currentBinBytes, dataBuffer]);
  return offset;
}

// Helper para crear un bufferView
function addBufferView(byteOffset, byteLength, target = undefined) {
  gltf.bufferViews = gltf.bufferViews || [];
  const bvIdx = gltf.bufferViews.length;
  const bv = {
    buffer: 0,
    byteOffset,
    byteLength
  };
  if (target !== undefined) bv.target = target;
  gltf.bufferViews.push(bv);
  return bvIdx;
}

// Helper para agregar una textura (imagen + texture)
function addTexture(filePath, mimeType, name) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Textura no encontrada: ${filePath}`);
  }
  const imgBuf = fs.readFileSync(filePath);
  const byteOffset = appendToBin(imgBuf);
  const bvIdx = addBufferView(byteOffset, imgBuf.length);

  gltf.images = gltf.images || [];
  const imgIdx = gltf.images.length;
  gltf.images.push({
    bufferView: bvIdx,
    mimeType,
    name
  });

  gltf.textures = gltf.textures || [];
  const texIdx = gltf.textures.length;
  gltf.textures.push({
    source: imgIdx
  });

  return texIdx;
}

// Helper para crear la geometría de un quad rectangular con normales hacia +Z y UVs upright
function createQuadMesh(width, height, materialIdx, meshName) {
  const hw = width / 2.0;
  const hh = height / 2.0;

  const posArr = new Float32Array([
    -hw,  hh, 0.0,
     hw,  hh, 0.0,
    -hw, -hh, 0.0,
     hw, -hh, 0.0
  ]);

  const normArr = new Float32Array([
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0
  ]);

  const uvArr = new Float32Array([
    0.0, 0.0,
    1.0, 0.0,
    0.0, 1.0,
    1.0, 1.0
  ]);

  const idxArr = new Uint16Array([0, 2, 1, 1, 2, 3]);

  const posOffset = appendToBin(Buffer.from(posArr.buffer));
  const posBv = addBufferView(posOffset, posArr.byteLength, 34962);

  const normOffset = appendToBin(Buffer.from(normArr.buffer));
  const normBv = addBufferView(normOffset, normArr.byteLength, 34962);

  const uvOffset = appendToBin(Buffer.from(uvArr.buffer));
  const uvBv = addBufferView(uvOffset, uvArr.byteLength, 34962);

  const idxOffset = appendToBin(Buffer.from(idxArr.buffer));
  const idxBv = addBufferView(idxOffset, idxArr.byteLength, 34963);

  gltf.accessors = gltf.accessors || [];

  const posAcc = gltf.accessors.length;
  gltf.accessors.push({
    bufferView: posBv,
    componentType: 5126,
    count: 4,
    type: 'VEC3',
    max: [hw, hh, 0.0],
    min: [-hw, -hh, 0.0]
  });

  const normAcc = gltf.accessors.length;
  gltf.accessors.push({
    bufferView: normBv,
    componentType: 5126,
    count: 4,
    type: 'VEC3',
    max: [0.0, 0.0, 1.0],
    min: [0.0, 0.0, 1.0]
  });

  const uvAcc = gltf.accessors.length;
  gltf.accessors.push({
    bufferView: uvBv,
    componentType: 5126,
    count: 4,
    type: 'VEC2',
    max: [1.0, 1.0],
    min: [0.0, 0.0]
  });

  const idxAcc = gltf.accessors.length;
  gltf.accessors.push({
    bufferView: idxBv,
    componentType: 5123,
    count: 6,
    type: 'SCALAR',
    max: [3],
    min: [0]
  });

  gltf.meshes = gltf.meshes || [];
  const meshIdx = gltf.meshes.length;
  gltf.meshes.push({
    name: meshName,
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

// Helper para crear un disco circular horizontal (XZ plane, normal apuntando hacia arriba +Y)
function createDiskMesh(radius, materialIdx, meshName, segments = 24) {
  const pos = [0, 0, 0];
  const norms = [0, 1, 0];
  const uvs = [0.5, 0.5];
  const indices = [];

  for (let i = 0; i <= segments; i++) {
    const angle = (i % segments) * (2 * Math.PI / segments);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    pos.push(radius * cos, 0, radius * sin);
    norms.push(0, 1, 0);
    uvs.push(0.5 + 0.5 * cos, 0.5 - 0.5 * sin);
  }

  for (let i = 1; i <= segments; i++) {
    const next = (i === segments) ? 1 : (i + 1);
    indices.push(0, i, next);
  }

  const posArr = new Float32Array(pos);
  const normArr = new Float32Array(norms);
  const uvArr = new Float32Array(uvs);
  const idxArr = new Uint16Array(indices);

  const posOffset = appendToBin(Buffer.from(posArr.buffer));
  const posBv = addBufferView(posOffset, posArr.byteLength, 34962);

  const normOffset = appendToBin(Buffer.from(normArr.buffer));
  const normBv = addBufferView(normOffset, normArr.byteLength, 34962);

  const uvOffset = appendToBin(Buffer.from(uvArr.buffer));
  const uvBv = addBufferView(uvOffset, uvArr.byteLength, 34962);

  const idxOffset = appendToBin(Buffer.from(idxArr.buffer));
  const idxBv = addBufferView(idxOffset, idxArr.byteLength, 34963);

  gltf.accessors = gltf.accessors || [];

  const posAcc = gltf.accessors.length;
  gltf.accessors.push({
    bufferView: posBv,
    componentType: 5126,
    count: posArr.length / 3,
    type: 'VEC3',
    max: [radius, 0.0, radius],
    min: [-radius, 0.0, -radius]
  });

  const normAcc = gltf.accessors.length;
  gltf.accessors.push({
    bufferView: normBv,
    componentType: 5126,
    count: normArr.length / 3,
    type: 'VEC3',
    max: [0.0, 1.0, 0.0],
    min: [0.0, 1.0, 0.0]
  });

  const uvAcc = gltf.accessors.length;
  gltf.accessors.push({
    bufferView: uvBv,
    componentType: 5126,
    count: uvArr.length / 2,
    type: 'VEC2',
    max: [1.0, 1.0],
    min: [0.0, 0.0]
  });

  const idxAcc = gltf.accessors.length;
  gltf.accessors.push({
    bufferView: idxBv,
    componentType: 5123,
    count: idxArr.length,
    type: 'SCALAR',
    max: [segments],
    min: [0]
  });

  gltf.meshes = gltf.meshes || [];
  const meshIdx = gltf.meshes.length;
  gltf.meshes.push({
    name: meshName,
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

// Helper para crear una caja 3D (para la peana y soporte del letrero)
function createBoxMesh(width, height, depth, materialIdx, meshName) {
  const hw = width / 2.0;
  const hh = height / 2.0;
  const hd = depth / 2.0;

  const pos = [
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

  const norms = [
     0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1,
     0, 0,-1,  0, 0,-1,  0, 0,-1,  0, 0,-1,
     0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,
     0,-1, 0,  0,-1, 0,  0,-1, 0,  0,-1, 0,
     1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,
    -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0
  ];

  const uvs = [
    0,0, 1,0, 1,1, 0,1,
    0,0, 1,0, 1,1, 0,1,
    0,0, 1,0, 1,1, 0,1,
    0,0, 1,0, 1,1, 0,1,
    0,0, 1,0, 1,1, 0,1,
    0,0, 1,0, 1,1, 0,1
  ];

  const indices = [];
  for (let i = 0; i < 6; i++) {
    const b = i * 4;
    indices.push(b, b+1, b+2, b, b+2, b+3);
  }

  const posArr = new Float32Array(pos);
  const normArr = new Float32Array(norms);
  const uvArr = new Float32Array(uvs);
  const idxArr = new Uint16Array(indices);

  const posOffset = appendToBin(Buffer.from(posArr.buffer));
  const posBv = addBufferView(posOffset, posArr.byteLength, 34962);

  const normOffset = appendToBin(Buffer.from(normArr.buffer));
  const normBv = addBufferView(normOffset, normArr.byteLength, 34962);

  const uvOffset = appendToBin(Buffer.from(uvArr.buffer));
  const uvBv = addBufferView(uvOffset, uvArr.byteLength, 34962);

  const idxOffset = appendToBin(Buffer.from(idxArr.buffer));
  const idxBv = addBufferView(idxOffset, idxArr.byteLength, 34963);

  gltf.accessors = gltf.accessors || [];

  const posAcc = gltf.accessors.length;
  gltf.accessors.push({
    bufferView: posBv,
    componentType: 5126,
    count: 24,
    type: 'VEC3',
    max: [hw, hh, hd],
    min: [-hw, -hh, -hd]
  });

  const normAcc = gltf.accessors.length;
  gltf.accessors.push({
    bufferView: normBv,
    componentType: 5126,
    count: 24,
    type: 'VEC3',
    max: [1.0, 1.0, 1.0],
    min: [-1.0, -1.0, -1.0]
  });

  const uvAcc = gltf.accessors.length;
  gltf.accessors.push({
    bufferView: uvBv,
    componentType: 5126,
    count: 24,
    type: 'VEC2',
    max: [1.0, 1.0],
    min: [0.0, 0.0]
  });

  const idxAcc = gltf.accessors.length;
  gltf.accessors.push({
    bufferView: idxBv,
    componentType: 5123,
    count: 36,
    type: 'SCALAR',
    max: [23],
    min: [0]
  });

  gltf.meshes = gltf.meshes || [];
  const meshIdx = gltf.meshes.length;
  gltf.meshes.push({
    name: meshName,
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

// ------------------------------------------------------------------------------
// 1. CARGAR TEXTURAS DE LETREROS Y TEXTURAS DE COMIDAS
// ------------------------------------------------------------------------------
console.log('\n--- 1. Cargando texturas de Letreros y Comidas ---');

const foodLabels = [
  { id: 'tortillas', file: 'letrero_gastro_tortillas.png', name: 'tex_letrero_tortillas' },
  { id: 'tamales', file: 'letrero_gastro_tamales.png', name: 'tex_letrero_tamales' },
  { id: 'atole', file: 'letrero_gastro_atole.png', name: 'tex_letrero_atole' },
  { id: 'caldo_toro', file: 'letrero_gastro_caldo_toro.png', name: 'tex_letrero_caldo_toro' },
  { id: 'maiz_tostado', file: 'letrero_gastro_maiz_tostado.png', name: 'tex_letrero_maiz_tostado' },
  { id: 'perruri', file: 'letrero_gastro_perruri.png', name: 'tex_letrero_perruri' },
  { id: 'elotes', file: 'letrero_gastro_elotes.png', name: 'tex_letrero_elotes' },
];

const texLabelIndices = {};
foodLabels.forEach(fl => {
  texLabelIndices[fl.id] = addTexture(
    path.resolve('public', 'texturas', fl.file),
    'image/png',
    fl.name
  );
  console.log(`  ✓ Letrero: ${fl.file}`);
});

const foodDisks = [
  { id: 'tortillas', file: 'disco_food_tortillas.png', name: 'tex_food_tortillas' },
  { id: 'tamales', file: 'disco_food_tamales.png', name: 'tex_food_tamales' },
  { id: 'atole', file: 'disco_food_atole.png', name: 'tex_food_atole' },
  { id: 'caldo', file: 'disco_food_caldo.png', name: 'tex_food_caldo' },
  { id: 'maiz_tostado', file: 'disco_food_maiz_tostado.png', name: 'tex_food_maiz_tostado' },
  { id: 'perruri', file: 'disco_food_perruri.png', name: 'tex_food_perruri' },
];

const texFoodIndices = {};
foodDisks.forEach(fd => {
  texFoodIndices[fd.id] = addTexture(
    path.resolve('public', 'texturas', fd.file),
    'image/png',
    fd.name
  );
  console.log(`  ✓ Textura Comida: ${fd.file}`);
});

// ------------------------------------------------------------------------------
// 2. CREAR MATERIALES PBR LUMINOSOS
// ------------------------------------------------------------------------------
console.log('\n--- 2. Creando materiales PBR ---');
gltf.materials = gltf.materials || [];

// Materiales para letreros (alto factor emisivo para máxima nitidez en VR)
const matLabelIndices = {};
foodLabels.forEach(fl => {
  const mIdx = gltf.materials.length;
  gltf.materials.push({
    name: `mat_letrero_${fl.id}`,
    pbrMetallicRoughness: {
      baseColorFactor: [1.0, 1.0, 1.0, 1.0],
      baseColorTexture: { index: texLabelIndices[fl.id], texCoord: 0 },
      metallicFactor: 0.05,
      roughnessFactor: 0.25
    },
    emissiveFactor: [0.65, 0.65, 0.65],
    emissiveTexture: { index: texLabelIndices[fl.id], texCoord: 0 },
    doubleSided: false
  });
  matLabelIndices[fl.id] = mIdx;
});

// Materiales para las superficies de comida tradicional
const matFoodIndices = {};
foodDisks.forEach(fd => {
  const mIdx = gltf.materials.length;
  gltf.materials.push({
    name: `mat_food_${fd.id}`,
    pbrMetallicRoughness: {
      baseColorFactor: [1.0, 1.0, 1.0, 1.0],
      baseColorTexture: { index: texFoodIndices[fd.id], texCoord: 0 },
      metallicFactor: 0.05,
      roughnessFactor: 0.40
    },
    emissiveFactor: [0.25, 0.25, 0.25],
    emissiveTexture: { index: texFoodIndices[fd.id], texCoord: 0 },
    doubleSided: false
  });
  matFoodIndices[fd.id] = mIdx;
});

const matMaderaOscuraIdx = 3; // mat_madera_oscura.020
const matOroIdx = 1;          // mat_kauyumari_oro.019

// ------------------------------------------------------------------------------
// 3. CONSTRUCCIÓN DE GEOMETRÍAS 3D (PEANAS Y PLATILLOS)
// ------------------------------------------------------------------------------
console.log('\n--- 3. Creando geometrías 3D de peanas monumentales y platillos ---');

// Peana de madera oscura: ancho 66cm, alto 22cm, fondo 6cm
const meshPeanaBase = createBoxMesh(0.66, 0.22, 0.06, matMaderaOscuraIdx, 'mesh_peana_madera_monumental');

// Marco dorado perimetral: ancho 68cm, alto 23.5cm, fondo 1.5cm
const meshPeanaMarcoOro = createBoxMesh(0.68, 0.235, 0.015, matOroIdx, 'mesh_peana_marco_oro_monumental');

// Quads con el texto del nombre: 64cm x 20cm
const meshLabelQuadIndices = {};
foodLabels.forEach(fl => {
  meshLabelQuadIndices[fl.id] = createQuadMesh(
    0.64, 0.20,
    matLabelIndices[fl.id],
    `mesh_placa_texto_${fl.id}`
  );
});

// Discos de comida texturizada para cada platillo
const meshFoodDisks = {
  tortillas: createDiskMesh(0.28, matFoodIndices.tortillas, 'mesh_disk_food_tortillas'),
  tamales: createDiskMesh(0.32, matFoodIndices.tamales, 'mesh_disk_food_tamales'),
  atole: createDiskMesh(0.20, matFoodIndices.atole, 'mesh_disk_food_atole'),
  caldo: createDiskMesh(0.30, matFoodIndices.caldo, 'mesh_disk_food_caldo'),
  maiz_tostado: createDiskMesh(0.32, matFoodIndices.maiz_tostado, 'mesh_disk_food_maiz_tostado'),
  perruri: createDiskMesh(0.24, matFoodIndices.perruri, 'mesh_disk_food_perruri')
};

// ------------------------------------------------------------------------------
// 4. CONSTRUCTOR DE LETREROS DE MESA (CON TILT HACIA ARRIBA / OJOS DEL VISOR)
// ------------------------------------------------------------------------------
gltf.nodes = gltf.nodes || [];

// IMPORTANTE: tiltAngleDeg debe ser NEGATIVO (-26°) para que la normal
// tenga componente +Y y apunte hacia arriba a los ojos del visitante (Y=1.60m)
function buildMonumentalSign(labelId, pos, tiltAngleDeg = -26.0) {
  const tiltRad = tiltAngleDeg * Math.PI / 180.0;
  const qx = Math.sin(tiltRad / 2.0);
  const qw = Math.cos(tiltRad / 2.0);

  const signChildren = [];

  // 1. Base sólida de madera oscura
  const baseNodeIdx = gltf.nodes.length;
  gltf.nodes.push({
    name: `peana_madera_${labelId}`,
    mesh: meshPeanaBase
  });
  signChildren.push(baseNodeIdx);

  // 2. Marco dorado en la cara frontal
  const oroNodeIdx = gltf.nodes.length;
  gltf.nodes.push({
    name: `peana_oro_${labelId}`,
    translation: [0, 0, 0.032],
    mesh: meshPeanaMarcoOro
  });
  signChildren.push(oroNodeIdx);

  // 3. Placa con el nombre de la comida en grande
  const textoNodeIdx = gltf.nodes.length;
  gltf.nodes.push({
    name: `peana_texto_${labelId}`,
    translation: [0, 0, 0.042],
    mesh: meshLabelQuadIndices[labelId]
  });
  signChildren.push(textoNodeIdx);

  const signNodeIdx = gltf.nodes.length;
  gltf.nodes.push({
    name: `letrero_${labelId}`,
    translation: pos,
    rotation: [qx, 0, 0, qw],
    children: signChildren
  });

  return signNodeIdx;
}

// Helper para construir la Gran Mesa de Exhibición (3.45m x 1.17m x 0.88m)
function buildLargeExhibitionTable(tableId, tableChildren = []) {
  // Patas de la mesa
  const leg1Idx = gltf.nodes.length;
  gltf.nodes.push({
    name: `pata_1_${tableId}`,
    mesh: 434,
    translation: [-1.40, 0.42, -0.42]
  });

  const leg2Idx = gltf.nodes.length;
  gltf.nodes.push({
    name: `pata_2_${tableId}`,
    mesh: 435,
    translation: [1.40, 0.42, -0.42]
  });

  const leg3Idx = gltf.nodes.length;
  gltf.nodes.push({
    name: `pata_3_${tableId}`,
    mesh: 436,
    translation: [-1.40, 0.42, 0.42]
  });

  const leg4Idx = gltf.nodes.length;
  gltf.nodes.push({
    name: `pata_4_${tableId}`,
    mesh: 437,
    translation: [1.40, 0.42, 0.42]
  });

  // Travesaño
  const crossbarIdx = gltf.nodes.length;
  gltf.nodes.push({
    name: `travesano_${tableId}`,
    mesh: 438,
    translation: [0, 0.20, 0],
    scale: [1.15, 1.0, 1.0]
  });

  // Tablero superior (superficie superior en Y = 0.885m)
  const topIdx = gltf.nodes.length;
  gltf.nodes.push({
    name: `tablero_${tableId}`,
    mesh: 433,
    translation: [0, 0.84, 0],
    scale: [1.15, 1.08, 1.30]
  });

  return [topIdx, leg1Idx, leg2Idx, leg3Idx, leg4Idx, crossbarIdx, ...tableChildren];
}

// ------------------------------------------------------------------------------
// 5. MESA 1 (MESA NORTE): 3 COMIDAS DE MAÍZ CON ALTO DETALLE + LETREROS ELEVADOS
// ------------------------------------------------------------------------------
console.log('\n--- 4. Ensamblando Mesa Norte con Comida Detallada ---');

const mesaNorteChildren = [];

// Altura de superficie de mesa: Y = 0.885m
// Posición Z comida: -0.12m (zona media-posterior)
// Posición Z letrero: +0.22m (zona frontal, despejada)
// Altura Y centro de letrero: 1.005m (base en Y = 0.895m, 100% SOBRE la mesa sin clipping)

// 1. TORTILLAS DE MAÍZ:
const tortillasFoodChildren = [];
// Canasta tortillero de mimbre apoyada en Y=0.885m
const canastaTortillasIdx = gltf.nodes.length;
gltf.nodes.push({
  name: 'canasta_tortillas',
  mesh: 404,
  translation: [0, 0.072, 0],
  scale: [1.8, 1.8, 1.8]
});
tortillasFoodChildren.push(canastaTortillasIdx);

// Paño servilleta bordada tradicional
const panoTortillasIdx = gltf.nodes.length;
gltf.nodes.push({
  name: 'pano_servilleta_tortillas',
  translation: [0, 0.09, 0],
  mesh: 405,
  scale: [1.5, 1.5, 1.5]
});
tortillasFoodChildren.push(panoTortillasIdx);

// Superficie de tortillas de comal recién hechas con textura nixtamal auténtica
const discoTortillasIdx = gltf.nodes.length;
gltf.nodes.push({
  name: 'disco_tortillas_comal_textura',
  translation: [0, 0.125, 0],
  mesh: meshFoodDisks.tortillas
});
tortillasFoodChildren.push(discoTortillasIdx);

const comidaTortillasNodeIdx = gltf.nodes.length;
gltf.nodes.push({
  name: 'comida_tortillas_maiz_sagrado',
  translation: [-0.90, 0.885, -0.12],
  children: tortillasFoodChildren
});
mesaNorteChildren.push(comidaTortillasNodeIdx);

const letreroTortillasIdx = buildMonumentalSign('tortillas', [-0.90, 1.005, 0.22], -26.0);
mesaNorteChildren.push(letreroTortillasIdx);

// 2. TAMALES CEREMONIALES:
const tamalesFoodChildren = [];
// Bandeja rústica de madera noble
const bandejaTamalesIdx = gltf.nodes.length;
gltf.nodes.push({
  name: 'bandeja_madera_tamales',
  mesh: 416,
  translation: [0, 0.035, 0],
  scale: [1.8, 1.8, 1.8]
});
tamalesFoodChildren.push(bandejaTamalesIdx);

// Base texturizada de tamales
const discoTamalesIdx = gltf.nodes.length;
gltf.nodes.push({
  name: 'disco_tamales_totomoxtle_textura',
  translation: [0, 0.055, 0],
  mesh: meshFoodDisks.tamales
});
tamalesFoodChildren.push(discoTamalesIdx);

// 4 Tamales ceremoniales 3D en totomoxtle con amarre
const tamalOffsets = [
  [-0.18, 0.08, -0.09],
  [0.18, 0.08, -0.09],
  [-0.18, 0.08, 0.09],
  [0.18, 0.08, 0.09]
];
tamalOffsets.forEach((pos, ti) => {
  const tamalIdx = gltf.nodes.length;
  gltf.nodes.push({
    name: `tamal_3d_${ti}`,
    translation: pos,
    rotation: [0, ti * 0.2, 0, 1],
    mesh: 417,
    scale: [1.8, 1.8, 1.8]
  });
  tamalesFoodChildren.push(tamalIdx);
});

const comidaTamalesNodeIdx = gltf.nodes.length;
gltf.nodes.push({
  name: 'comida_tamales_ceremoniales',
  translation: [0.00, 0.885, -0.12],
  children: tamalesFoodChildren
});
mesaNorteChildren.push(comidaTamalesNodeIdx);

const letreroTamalesIdx = buildMonumentalSign('tamales', [0.00, 1.005, 0.22], -26.0);
mesaNorteChildren.push(letreroTamalesIdx);

// 3. ATOLE DE MAÍZ:
const atoleFoodChildren = [];
// Gran olla tradicional nayarita apoyada exactamente sobre la mesa
const ollaAtoleIdx = gltf.nodes.length;
gltf.nodes.push({
  name: 'olla_barro_atole',
  mesh: 394,
  translation: [0, 0.285, 0],
  scale: [1.5, 1.5, 1.5]
});
atoleFoodChildren.push(ollaAtoleIdx);

// Superficie de atole espumoso dentro de la olla
const discoAtoleIdx = gltf.nodes.length;
gltf.nodes.push({
  name: 'disco_atole_espumoso_textura',
  translation: [0, 0.42, 0],
  mesh: meshFoodDisks.atole
});
atoleFoodChildren.push(discoAtoleIdx);

// Cucharón de madera tallada en el borde
const cucharonIdx = gltf.nodes.length;
gltf.nodes.push({
  name: 'cucharon_madera_atole',
  translation: [0.08, 0.44, 0],
  rotation: [0, 0, 0.38, 0.92],
  mesh: 402,
  scale: [1.5, 1.5, 1.5]
});
atoleFoodChildren.push(cucharonIdx);

// Dos jícaras servidas con atole caliente a un lado
const jicara1Idx = gltf.nodes.length;
gltf.nodes.push({
  name: 'jicara_atole_1',
  translation: [-0.28, 0.05, 0.16],
  mesh: 390,
  scale: [1.6, 1.6, 1.6]
});
atoleFoodChildren.push(jicara1Idx);

const jicara2Idx = gltf.nodes.length;
gltf.nodes.push({
  name: 'jicara_atole_2',
  translation: [0.28, 0.05, 0.16],
  mesh: 392,
  scale: [1.6, 1.6, 1.6]
});
atoleFoodChildren.push(jicara2Idx);

const comidaAtoleNodeIdx = gltf.nodes.length;
gltf.nodes.push({
  name: 'comida_atole_olla_bebidas',
  translation: [0.90, 0.885, -0.08],
  children: atoleFoodChildren
});
mesaNorteChildren.push(comidaAtoleNodeIdx);

const letreroAtoleIdx = buildMonumentalSign('atole', [0.90, 1.005, 0.22], -26.0);
mesaNorteChildren.push(letreroAtoleIdx);

// Armar Mesa Norte completa
const mesa1AllChildren = buildLargeExhibitionTable('norte', mesaNorteChildren);
const mesa1NodeIdx = gltf.nodes.length;
gltf.nodes.push({
  name: 'mesa_gastronomia_1_norte',
  translation: [4.993, 0, -1.622],
  rotation: [0, -0.587785, 0, 0.809017],
  children: mesa1AllChildren
});

console.log('  ✓ Mesa Norte armada con éxito');

// ------------------------------------------------------------------------------
// 6. MESA 2 (MESA SUR): 3 COMIDAS CEREMONIALES CON ALTO DETALLE + LETREROS ELEVADOS
// ------------------------------------------------------------------------------
console.log('\n--- 5. Ensamblando Mesa Sur con Comida Detallada ---');

const mesaSurChildren = [];

// 4. CALDO DE TORO:
const caldoFoodChildren = [];
// Cazuela profunda de barro cocido nayarita apoyada en Y=0.885m
const cazuelaBarroIdx = gltf.nodes.length;
gltf.nodes.push({
  name: 'cazuela_barro_caldo_toro',
  mesh: 350,
  translation: [0, 0.10, 0],
  scale: [1.8, 1.8, 1.8]
});
caldoFoodChildren.push(cazuelaBarroIdx);

// Asas de la cazuela
const asa1Idx = gltf.nodes.length;
gltf.nodes.push({
  name: 'asa_cazuela_1',
  mesh: 352,
  translation: [-0.42, 0.14, 0],
  scale: [1.8, 1.8, 1.8]
});
caldoFoodChildren.push(asa1Idx);

const asa2Idx = gltf.nodes.length;
gltf.nodes.push({
  name: 'asa_cazuela_2',
  mesh: 353,
  translation: [0.42, 0.14, 0],
  scale: [1.8, 1.8, 1.8]
});
caldoFoodChildren.push(asa2Idx);

// Superficie de caldo de res con carne, chiles y cilantro (disco horizontal XZ)
const discoCaldoIdx = gltf.nodes.length;
gltf.nodes.push({
  name: 'disco_caldo_toro_textura',
  translation: [0, 0.165, 0],
  mesh: meshFoodDisks.caldo
});
caldoFoodChildren.push(discoCaldoIdx);

// Trozos 3D de carne y chiles flotando en el caldo
for (let ci = 0; ci < 4; ci++) {
  const trozoIdx = gltf.nodes.length;
  gltf.nodes.push({
    name: `trozo_carne_chile_${ci}`,
    translation: [Math.cos(ci * 1.5) * 0.12, 0.175, Math.sin(ci * 1.5) * 0.12],
    mesh: 355 + ci,
    scale: [1.5, 1.5, 1.5]
  });
  caldoFoodChildren.push(trozoIdx);
}

const comidaCaldoNodeIdx = gltf.nodes.length;
gltf.nodes.push({
  name: 'comida_caldo_toro_cazuela',
  translation: [-0.90, 0.885, -0.12],
  children: caldoFoodChildren
});
mesaSurChildren.push(comidaCaldoNodeIdx);

const letreroCaldoIdx = buildMonumentalSign('caldo_toro', [-0.90, 1.005, 0.22], -26.0);
mesaSurChildren.push(letreroCaldoIdx);

// 5. MAÍZ TOSTADO (XARIKÍXA):
const maizTostadoFoodChildren = [];
// Comal tradicional de barro cocido
const comalTostadoIdx = gltf.nodes.length;
gltf.nodes.push({
  name: 'comal_barro_maiz_tostado',
  mesh: 361,
  translation: [0, 0.055, 0],
  scale: [2.4, 1.6, 2.4]
});
maizTostadoFoodChildren.push(comalTostadoIdx);

// Superficie texturizada de granos tostados de 5 colores con textura fotográfica
const discoMaizTostadoIdx = gltf.nodes.length;
gltf.nodes.push({
  name: 'disco_maiz_tostado_textura',
  translation: [0, 0.085, 0],
  mesh: meshFoodDisks.maiz_tostado
});
maizTostadoFoodChildren.push(discoMaizTostadoIdx);

// Granos 3D dispersos en relieve
const granos3DIdx = gltf.nodes.length;
gltf.nodes.push({
  name: 'granos_3d_relieve',
  translation: [0, 0.09, 0],
  mesh: 362,
  scale: [2.0, 0.8, 2.0]
});
maizTostadoFoodChildren.push(granos3DIdx);

const comidaMaizTostadoNodeIdx = gltf.nodes.length;
gltf.nodes.push({
  name: 'comida_maiz_tostado_xarikixa',
  translation: [0.00, 0.885, -0.12],
  children: maizTostadoFoodChildren
});
mesaSurChildren.push(comidaMaizTostadoNodeIdx);

const letreroMaizTostadoIdx = buildMonumentalSign('maiz_tostado', [0.00, 1.005, 0.22], -26.0);
mesaSurChildren.push(letreroMaizTostadoIdx);

// 6. PERRURI:
const perruriFoodChildren = [];
// Cuenco artesanal hondo
const cuencoPerruriIdx = gltf.nodes.length;
gltf.nodes.push({
  name: 'cuenco_barro_perruri',
  mesh: 361,
  translation: [0, 0.046, 0],
  scale: [2.0, 1.5, 2.0]
});
perruriFoodChildren.push(cuencoPerruriIdx);

// Molienda fina dorada de maíz y pepitas de calabaza texturizada
const discoPerruriIdx = gltf.nodes.length;
gltf.nodes.push({
  name: 'disco_perruri_dorado_textura',
  translation: [0, 0.08, 0],
  mesh: meshFoodDisks.perruri
});
perruriFoodChildren.push(discoPerruriIdx);

// Tacos servidos de perruri en tortillas dobladas
for (let ti = 0; ti < 3; ti++) {
  const tacoIdx = gltf.nodes.length;
  gltf.nodes.push({
    name: `taco_perruri_${ti}`,
    translation: [0.28, 0.03 + ti * 0.02, -0.06 + ti * 0.08],
    rotation: [0.35, 0.15 * ti, 0, 0.93],
    mesh: 405,
    scale: [0.75, 0.75, 0.75]
  });
  perruriFoodChildren.push(tacoIdx);
}

const comidaPerruriNodeIdx = gltf.nodes.length;
gltf.nodes.push({
  name: 'comida_perruri_boda_wixarika',
  translation: [0.90, 0.885, -0.12],
  children: perruriFoodChildren
});
mesaSurChildren.push(comidaPerruriNodeIdx);

const letreroPerruriIdx = buildMonumentalSign('perruri', [0.90, 1.005, 0.22], -26.0);
mesaSurChildren.push(letreroPerruriIdx);

// Armar Mesa Sur completa
const mesa2AllChildren = buildLargeExhibitionTable('sur', mesaSurChildren);
const mesa2NodeIdx = gltf.nodes.length;
gltf.nodes.push({
  name: 'mesa_gastronomia_2_sur',
  translation: [4.993, 0, 1.622],
  rotation: [0, -0.809017, 0, 0.587785],
  children: mesa2AllChildren
});

console.log('  ✓ Mesa Sur armada con éxito');

// ------------------------------------------------------------------------------
// 7. ESTANTE CENTRAL: ELOTES COCIDOS (A NIVEL DE OJOS, Y = 1.63M)
// ------------------------------------------------------------------------------
console.log('\n--- 7. Configurando Elotes Cocidos en el Estante Central ---');

const repisaNode = gltf.nodes.find(n => n.name === 'repisa_gastronomia_1');
if (!repisaNode) {
  console.error('Error: No se encontró el nodo repisa_gastronomia_1');
  process.exit(1);
}

const elotesFoodChildren = [];
const canastaElotesIdx = gltf.nodes.length;
gltf.nodes.push({
  name: 'canasta_elotes_cocidos',
  mesh: 387,
  translation: [0, 0.048, 0],
  scale: [0.8, 0.8, 0.8]
});
elotesFoodChildren.push(canastaElotesIdx);

const eloteOffsets = [
  { pos: [-0.08, 0.09, 0], rot: [0, 0, 0.7071, 0.7071] },
  { pos: [0.08, 0.09, 0.04], rot: [0, 0.25, 0.70, 0.66] },
  { pos: [0, 0.14, -0.04], rot: [0, -0.25, 0.70, 0.66] }
];

eloteOffsets.forEach((eo, ei) => {
  const eloteIdx = gltf.nodes.length;
  gltf.nodes.push({
    name: `elote_tierno_cocido_${ei}`,
    translation: eo.pos,
    rotation: eo.rot,
    mesh: 367,
    scale: [1.5, 1.5, 1.5]
  });
  elotesFoodChildren.push(eloteIdx);
});

const comidaElotesNodeIdx = gltf.nodes.length;
gltf.nodes.push({
  name: 'comida_elotes_cocidos_milpa',
  translation: [0.00, 0.025, -0.02],
  children: elotesFoodChildren
});

// Letrero a nivel de ojos en la repisa (Y = 1.63m), inclinado -12° hacia el observador
const letreroElotesIdx = buildMonumentalSign('elotes', [0.45, 0.14, 0.06], -12.0);

repisaNode.children = repisaNode.children || [];
repisaNode.children.push(comidaElotesNodeIdx, letreroElotesIdx);
console.log('  ✓ Estante central: Elotes Cocidos configurado');

// ------------------------------------------------------------------------------
// 8. ASOCIAR LAS DOS MESAS A cuadrante_gastronomia Y REUBICAR METATE
// ------------------------------------------------------------------------------
console.log('\n--- 8. Vinculando elementos a cuadrante_gastronomia ---');

const gastroQuadrantNode = gltf.nodes.find(n => n.name === 'cuadrante_gastronomia');
if (!gastroQuadrantNode) {
  console.error('Error: No se encontró el nodo cuadrante_gastronomia');
  process.exit(1);
}

// Retirar la mesa vieja única si existe
const oldMesaIdx = gltf.nodes.findIndex(n => n.name === 'mesa_exhibicion_gastronomia');
gastroQuadrantNode.children = gastroQuadrantNode.children.filter(c => c !== oldMesaIdx);

// Retirar cualquier mesa duplicada previa de v12 y agregar las nuevas
gastroQuadrantNode.children = gastroQuadrantNode.children.filter(c => {
  const n = gltf.nodes[c];
  return n && !n.name.startsWith('mesa_gastronomia_');
});
gastroQuadrantNode.children.push(mesa1NodeIdx, mesa2NodeIdx);

// Reubicar metate tradicional
const metateNode = gltf.nodes.find(n => n.name === 'estacion_metate_molienda');
if (metateNode) {
  metateNode.translation = [6.30, 0, 2.80];
  metateNode.rotation = [0, -0.92388, 0, 0.38268];
  console.log('  ✓ Metate tradicional en estación lateral [6.30, 0, 2.80]');
}

// ------------------------------------------------------------------------------
// 9. EXPORTAR EL GLB V12 Y SINCRONIZAR
// ------------------------------------------------------------------------------
console.log('\n--- 9. Empaquetando y exportando museo_wixarika_v12.glb ---');

const updatedJsonStr = JSON.stringify(gltf);
let updatedJsonBuf = Buffer.from(updatedJsonStr, 'utf8');
const pad = (4 - (updatedJsonBuf.length % 4)) % 4;
if (pad > 0) {
  updatedJsonBuf = Buffer.concat([updatedJsonBuf, Buffer.alloc(pad, 0x20)]);
}

const finalBinPad = (4 - (currentBinBytes.length % 4)) % 4;
if (finalBinPad > 0) {
  currentBinBytes = Buffer.concat([currentBinBytes, Buffer.alloc(finalBinPad, 0)]);
}

const outHeader = Buffer.alloc(12);
outHeader.writeUInt32LE(0x46546C67, 0); // 'glTF'
outHeader.writeUInt32LE(2, 4);

const outChunk0Header = Buffer.alloc(8);
outChunk0Header.writeUInt32LE(updatedJsonBuf.length, 0);
outChunk0Header.writeUInt32LE(0x4E4F534A, 4); // 'JSON'

const outChunk1Header = Buffer.alloc(8);
outChunk1Header.writeUInt32LE(currentBinBytes.length, 0);
outChunk1Header.writeUInt32LE(0x004E4942, 4); // 'BIN\0'

const totalFileSize = 12 + 8 + updatedJsonBuf.length + 8 + currentBinBytes.length;
outHeader.writeUInt32LE(totalFileSize, 8);

const finalGlb = Buffer.concat([
  outHeader,
  outChunk0Header,
  updatedJsonBuf,
  outChunk1Header,
  currentBinBytes
]);

const outV12Public = path.resolve('public', 'museo_wixarika_v12.glb');
const outV12Imagenes = path.resolve('imagenesRef', 'museo_wixarika_v12.glb');
const outBasePublic = path.resolve('public', 'museo_wixarika_base.glb');
const outBaseImagenes = path.resolve('imagenesRef', 'museo_wixarika_base.glb');

fs.writeFileSync(outV12Public, finalGlb);
fs.writeFileSync(outV12Imagenes, finalGlb);
fs.writeFileSync(outBasePublic, finalGlb);
fs.writeFileSync(outBaseImagenes, finalGlb);

console.log(`\n================================================================`);
console.log(`✓ ÉXITO: Museo Virtual Wixárika v12 generado`);
console.log(`  - Tamaño total: ${(finalGlb.length / 1024).toFixed(2)} KB (${finalGlb.length} bytes)`);
console.log(`  - Total nodos: ${gltf.nodes.length}`);
console.log(`  - Total mallas: ${gltf.meshes.length}`);
console.log(`  - Total materiales: ${gltf.materials.length}`);
console.log(`  - Archivo v12: ${outV12Public}`);
console.log(`  - Base activa: ${outBasePublic}`);
console.log(`  - Nota: public/museo_wixarika_v11.glb se conservó 100% INTACTO`);
console.log(`================================================================\n`);
