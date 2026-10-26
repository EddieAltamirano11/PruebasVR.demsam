// ==============================================================================
// Generador / Exportador Oficial: Museo Virtual Wixárika - Versión 10 (v10)
// Basado directamente en la versión v9 (óculo Tatewari + tapete sagrado + letreros centrados)
// Modificaciones v10:
// 1. Intercambio de cuadros Tatei Neixa y Namawita Neixa:
//    - Cuadro central (Z = 0.0m): Obra con el nombre original "Tatei Neixa" + Cédula TATEI NEIXA
//    - Cuadro lateral norte (Z = -1.85m): Cuadro ceremonial tradicional de estambre + Cédula NAMAWITA NEIXA
// 2. Centrado exacto de los 4 letreros superiores respecto al pilar:
//    - Bienvenida, Fiestas, Deidades, Gastronomía corregidos con offset de 13 cm hacia el centro del pilar
// 3. Elevación vertical de cuadros (Y = 2.50m) y cédulas (Y = 1.38m)
// 4. Fotos más grandes con encuadre de museo y solo el nombre en grande
// 5. Orientación radial convergente al 100% hacia el espectador central (0, 0, 0)
// 6. Acabado PBR radiante (emissiveFactor: [0.40, 0.40, 0.40], sin opacidad)
// Cumple con la especificación formal: specs/museo_wixarika_spec_v10.yaml
// ==============================================================================

import fs from 'fs';
import path from 'path';

console.log('================================================================');
console.log('  GENERANDO MODELO 3D: SALA DE MUSEO WIXÁRIKA V10 (.GLB)');
console.log('  Base: Museo Wixárika v9 (v8 + óculo cenital de Tatewari)');
console.log('  Mejoras: Cuadros más grandes + Nombres en grande sin texto secundario');
console.log('  Open Spec: specs/museo_wixarika_spec_v10.yaml');
console.log('================================================================\n');

const inputV9Path = path.resolve('public', 'museo_wixarika_v9.glb');
if (!fs.existsSync(inputV9Path)) {
  console.error(`Error: No se encontró el archivo base v9 en: ${inputV9Path}`);
  process.exit(1);
}

const rawGlb = fs.readFileSync(inputV9Path);

// 1. Leer encabezados GLB
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

console.log(`✓ Archivo base v9 cargado correctamente (${(rawGlb.length / 1024).toFixed(2)} KB)`);

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

  // 4 vértices
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

  // Serializar en BIN
  const posOffset = appendToBin(Buffer.from(posArr.buffer));
  const posBv = addBufferView(posOffset, posArr.byteLength, 34962);

  const normOffset = appendToBin(Buffer.from(normArr.buffer));
  const normBv = addBufferView(normOffset, normArr.byteLength, 34962);

  const uvOffset = appendToBin(Buffer.from(uvArr.buffer));
  const uvBv = addBufferView(uvOffset, uvArr.byteLength, 34962);

  const idxOffset = appendToBin(Buffer.from(idxArr.buffer));
  const idxBv = addBufferView(idxOffset, idxArr.byteLength, 34963);

  // Accessors
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

// ------------------------------------------------------------------------------
// 2. INYECTAR TEXTURAS GRANDES DE FIESTAS Y CÉDULAS DE NOMBRE GIGANTE
// ------------------------------------------------------------------------------
console.log('\n--- 1. Cargando texturas 1024x1024 ampliadas y cédulas de nombre gigante ---');

const texTateiNeixaIdx = addTexture(
  path.resolve('public', 'texturas', 'cuadro_fiesta_tatei_neixa.jpg'),
  'image/jpeg',
  'tex_cuadro_fiesta_tatei_neixa'
);
const texTamborIdx = addTexture(
  path.resolve('public', 'texturas', 'cuadro_fiesta_tambor.jpg'),
  'image/jpeg',
  'tex_cuadro_fiesta_tambor'
);
const texHikuriNeixaIdx = addTexture(
  path.resolve('public', 'texturas', 'cuadro_fiesta_hikuri_neixa.jpg'),
  'image/jpeg',
  'tex_cuadro_fiesta_hikuri_neixa'
);

const texCedulaTateiIdx = addTexture(
  path.resolve('public', 'texturas', 'cedula_fiesta_tatei_neixa.png'),
  'image/png',
  'tex_cedula_fiesta_tatei_neixa'
);
const texCedulaTamborIdx = addTexture(
  path.resolve('public', 'texturas', 'cedula_fiesta_tambor.png'),
  'image/png',
  'tex_cedula_fiesta_tambor'
);
const texCedulaHikuriIdx = addTexture(
  path.resolve('public', 'texturas', 'cedula_fiesta_hikuri_neixa.png'),
  'image/png',
  'tex_cedula_fiesta_hikuri_neixa'
);

console.log('  ✓ Texturas cargadas exitosamente');

// ------------------------------------------------------------------------------
// 3. CREAR MATERIALES PBR LUMINOSOS CON EMISIVIDAD DE GALERÍA
// ------------------------------------------------------------------------------
console.log('\n--- 2. Creando materiales PBR luminosos de alta fidelidad ---');

gltf.materials = gltf.materials || [];

// Materiales para los 3 lienzos
const matTateiNeixaIdx = gltf.materials.length;
gltf.materials.push({
  name: 'mat_cuadro_fiesta_tatei_neixa',
  pbrMetallicRoughness: {
    baseColorFactor: [1.0, 1.0, 1.0, 1.0],
    baseColorTexture: { index: texTateiNeixaIdx, texCoord: 0 },
    metallicFactor: 0.05,
    roughnessFactor: 0.35
  },
  emissiveTexture: { index: texTateiNeixaIdx, texCoord: 0 },
  emissiveFactor: [0.40, 0.40, 0.40],
  doubleSided: true
});

const matTamborIdx = gltf.materials.length;
gltf.materials.push({
  name: 'mat_cuadro_fiesta_tambor',
  pbrMetallicRoughness: {
    baseColorFactor: [1.0, 1.0, 1.0, 1.0],
    baseColorTexture: { index: texTamborIdx, texCoord: 0 },
    metallicFactor: 0.05,
    roughnessFactor: 0.35
  },
  emissiveTexture: { index: texTamborIdx, texCoord: 0 },
  emissiveFactor: [0.40, 0.40, 0.40],
  doubleSided: true
});

const matHikuriNeixaIdx = gltf.materials.length;
gltf.materials.push({
  name: 'mat_cuadro_fiesta_hikuri_neixa',
  pbrMetallicRoughness: {
    baseColorFactor: [1.0, 1.0, 1.0, 1.0],
    baseColorTexture: { index: texHikuriNeixaIdx, texCoord: 0 },
    metallicFactor: 0.05,
    roughnessFactor: 0.35
  },
  emissiveTexture: { index: texHikuriNeixaIdx, texCoord: 0 },
  emissiveFactor: [0.40, 0.40, 0.40],
  doubleSided: true
});

// Materiales para las 3 cédulas de nombre gigante
const matCedulaTateiIdx = gltf.materials.length;
gltf.materials.push({
  name: 'mat_cedula_fiesta_tatei_neixa',
  pbrMetallicRoughness: {
    baseColorFactor: [1.0, 1.0, 1.0, 1.0],
    baseColorTexture: { index: texCedulaTateiIdx, texCoord: 0 },
    metallicFactor: 0.05,
    roughnessFactor: 0.45
  },
  emissiveTexture: { index: texCedulaTateiIdx, texCoord: 0 },
  emissiveFactor: [0.35, 0.35, 0.35],
  doubleSided: true
});

const matCedulaTamborIdx = gltf.materials.length;
gltf.materials.push({
  name: 'mat_cedula_fiesta_tambor',
  pbrMetallicRoughness: {
    baseColorFactor: [1.0, 1.0, 1.0, 1.0],
    baseColorTexture: { index: texCedulaTamborIdx, texCoord: 0 },
    metallicFactor: 0.05,
    roughnessFactor: 0.45
  },
  emissiveTexture: { index: texCedulaTamborIdx, texCoord: 0 },
  emissiveFactor: [0.35, 0.35, 0.35],
  doubleSided: true
});

const matCedulaHikuriIdx = gltf.materials.length;
gltf.materials.push({
  name: 'mat_cedula_fiesta_hikuri_neixa',
  pbrMetallicRoughness: {
    baseColorFactor: [1.0, 1.0, 1.0, 1.0],
    baseColorTexture: { index: texCedulaHikuriIdx, texCoord: 0 },
    metallicFactor: 0.05,
    roughnessFactor: 0.45
  },
  emissiveTexture: { index: texCedulaHikuriIdx, texCoord: 0 },
  emissiveFactor: [0.35, 0.35, 0.35],
  doubleSided: true
});

console.log('  ✓ 6 materiales PBR configurados con luminosidad cálida');

// ------------------------------------------------------------------------------
// 4. CREAR MALLAS DE LIENZOS (1.40m x 1.40m) Y CÉDULAS (1.08m x 0.24m)
// ------------------------------------------------------------------------------
console.log('\n--- 3. Creando mallas geométricas para lienzos y cédulas ---');

// Lienzos base de 1.40m x 1.40m (que con el scale 1.16 del cuadro alcanzan 1.62m x 1.62m)
const meshLienzoTateiNeixa = createQuadMesh(1.40, 1.40, matTateiNeixaIdx, 'mesh_lienzo_fiesta_tatei_neixa');
const meshLienzoTambor = createQuadMesh(1.40, 1.40, matTamborIdx, 'mesh_lienzo_fiesta_tambor');
const meshLienzoHikuriNeixa = createQuadMesh(1.40, 1.40, matHikuriNeixaIdx, 'mesh_lienzo_fiesta_hikuri_neixa');

// Cédulas de nombre gigante (1.08m x 0.24m)
const meshCedulaTatei = createQuadMesh(1.08, 0.24, matCedulaTateiIdx, 'mesh_cedula_fiesta_tatei_neixa');
const meshCedulaTambor = createQuadMesh(1.08, 0.24, matCedulaTamborIdx, 'mesh_cedula_fiesta_tambor');
const meshCedulaHikuri = createQuadMesh(1.08, 0.24, matCedulaHikuriIdx, 'mesh_cedula_fiesta_hikuri_neixa');

// ------------------------------------------------------------------------------
// 5. CONSTRUCCIÓN DE CUADROS AMPLIADOS Y PLACAS DE NOMBRE GIGANTE
// ------------------------------------------------------------------------------
gltf.nodes = gltf.nodes || [];

// Crea la luminaria de galería dorada idéntica a las deidades
function buildGalleryLamp(suffix) {
  const lampChildren = [];

  const subMeshes = [
    { mesh: 1, rot: [0.70710688829422, 0, 0, 0.7071066498756409] },
    { mesh: 2, pos: [-0.1399996280670166, 0.015000104904174805, 0.1100001335144043], rot: [0.70710688829422, 0, 0, 0.7071066498756409] },
    { mesh: 3, pos: [-0.1399998664855957, -0.015000104904174805, 0.2199997901916504] },
    { mesh: 4, pos: [0.1400001049041748, 0.015000104904174805, 0.1100001335144043], rot: [0.70710688829422, 0, 0, 0.7071066498756409] },
    { mesh: 5, pos: [0.1399998664855957, -0.015000104904174805, 0.2200000286102295] },
    { mesh: 6, pos: [0, -0.04500007629394531, 0.2200002670288086], rot: [0.1830126792192459, -0.1830126792192459, 0.6830126643180847, 0.6830127239227295] },
    { mesh: 7, pos: [0, -0.05800008773803711, 0.21500015258789062] }
  ];

  subMeshes.forEach((sm, i) => {
    const subIdx = gltf.nodes.length;
    const subNode = {
      name: `luminaria_parte_${i}_${suffix}`,
      mesh: sm.mesh
    };
    if (sm.pos) subNode.translation = sm.pos;
    if (sm.rot) subNode.rotation = sm.rot;
    gltf.nodes.push(subNode);
    lampChildren.push(subIdx);
  });

  const lampIdx = gltf.nodes.length;
  gltf.nodes.push({
    name: `luminaria_galeria_${suffix}`,
    translation: [0, 0.82, 0.02],
    children: lampChildren
  });

  return lampIdx;
}

// Crea un cuadro ampliado de deidad completo con scale 1.16 (ancho 1.79m)
function buildDeityStyleCuadro(lienzoMeshIdx, suffix) {
  const cuadroChildren = [];

  // 1. Lienzo en posición [0, 0, 0.025]
  const lienzoIdx = gltf.nodes.length;
  gltf.nodes.push({
    name: `lienzo_${suffix}`,
    translation: [0, 0, 0.025],
    mesh: lienzoMeshIdx
  });
  cuadroChildren.push(lienzoIdx);

  // 2. Luminaria de galería arriba
  const lampIdx = buildGalleryLamp(suffix);
  cuadroChildren.push(lampIdx);

  // 3. Marco de madera de cedro oscuro (Mesh 8)
  const marcoMaderaIdx = gltf.nodes.length;
  gltf.nodes.push({
    name: `marco_madera_${suffix}`,
    mesh: 8
  });
  cuadroChildren.push(marcoMaderaIdx);

  // 4. Borde interior dorado (Mesh 9)
  const marcoOroIdx = gltf.nodes.length;
  gltf.nodes.push({
    name: `marco_oro_${suffix}`,
    mesh: 9
  });
  cuadroChildren.push(marcoOroIdx);

  // 5. Los 4 medallones esquineros de turquesa y oro (Meshes 10 a 17)
  const corners = [
    { pos: [-0.735, 0.735, 0], meshes: [10, 11] }, // Top-Left
    { pos: [0.735, 0.735, 0],  meshes: [12, 13] }, // Top-Right
    { pos: [-0.735, -0.735, 0], meshes: [14, 15] }, // Bottom-Left
    { pos: [0.735, -0.735, 0],  meshes: [16, 17] }  // Bottom-Right
  ];

  corners.forEach((c, ci) => {
    c.meshes.forEach((mId, mi) => {
      const medIdx = gltf.nodes.length;
      gltf.nodes.push({
        name: `medallon_esquina_${ci}_${mi}_${suffix}`,
        translation: c.pos,
        rotation: [0, 0, 0.3826834559440613, 0.9238795638084412],
        mesh: mId
      });
      cuadroChildren.push(medIdx);
    });
  });

  const cuadroIdx = gltf.nodes.length;
  gltf.nodes.push({
    name: `cuadro_${suffix}`,
    translation: [0, 2.50, 0], // Elevado a Y = 2.50m (base a 1.60m) para despejar completamente mesas y objetos
    scale: [1.16, 1.16, 1.16], // Cuadros un 16% más grandes (ancho marco 1.79m, lienzo 1.62m)
    children: cuadroChildren
  });

  return cuadroIdx;
}

// Crea la placa de nombre gigante
function buildDeityStylePlaca(cedulaMeshIdx, suffix) {
  const placaChildren = [];

  // 1. Base de madera oscura (Mesh 40)
  const baseMaderaIdx = gltf.nodes.length;
  gltf.nodes.push({
    name: `placa_base_madera_${suffix}`,
    mesh: 40
  });
  placaChildren.push(baseMaderaIdx);

  // 2. Borde perimetral dorado (Mesh 41)
  const marcoOroIdx = gltf.nodes.length;
  gltf.nodes.push({
    name: `placa_marco_oro_${suffix}`,
    mesh: 41
  });
  placaChildren.push(marcoOroIdx);

  // 3. Tarjeta de cantera (Mesh 42)
  const canteraIdx = gltf.nodes.length;
  gltf.nodes.push({
    name: `placa_cantera_${suffix}`,
    translation: [0, 0, 0.012],
    mesh: 42
  });
  placaChildren.push(canteraIdx);

  // 4. Medallón central de turquesa y oro (Mesh 44 y 45)
  const med1Idx = gltf.nodes.length;
  gltf.nodes.push({
    name: `placa_medallon_turquesa_${suffix}`,
    translation: [0, 0.002, 0.024],
    mesh: 44
  });
  placaChildren.push(med1Idx);

  const med2Idx = gltf.nodes.length;
  gltf.nodes.push({
    name: `placa_medallon_oro_${suffix}`,
    translation: [0, 0.002, 0.024],
    rotation: [0, 0, 0.3826834559440613, 0.9238795638084412],
    mesh: 45
  });
  placaChildren.push(med2Idx);

  // 5. Cédula con el nombre de la fiesta en letras gigantes
  const cedulaNodeIdx = gltf.nodes.length;
  gltf.nodes.push({
    name: `placa_cedula_texto_${suffix}`,
    translation: [0, 0, 0.026],
    mesh: cedulaMeshIdx
  });
  placaChildren.push(cedulaNodeIdx);

  const placaIdx = gltf.nodes.length;
  gltf.nodes.push({
    name: `placa_${suffix}`,
    translation: [0, 1.38, 0], // Elevado a Y = 1.38m (despejado de mesas de 0.85m y tambor de 1.18m)
    scale: [1.08, 1.08, 1.08],
    children: placaChildren
  });

  return placaIdx;
}

// ------------------------------------------------------------------------------
// 6. ENSAMBLAR Y ORIENTAR CONVERGENTE HACIA EL ESPECTADOR CENTRAL (0, 0, 0)
// ------------------------------------------------------------------------------
console.log('\n--- 4. Ensamblando estaciones de Fiestas y orientando hacia el espectador central ---');

// Cuadro 1 (Namawita Neixa, Norte Z = -1.85m): Cuadro ceremonial tradicional de estambre
const cuadro1Idx = buildDeityStyleCuadro(meshLienzoTambor, 'fiesta_namawita_neixa');
const placa1Idx = buildDeityStylePlaca(meshCedulaTatei, 'fiesta_namawita_neixa');

// Cuadro 2 (Tatei Neixa, Centro Z = 0.0m): Obra con el nombre "Tatei Neixa" incorporado
const cuadro2Idx = buildDeityStyleCuadro(meshLienzoTateiNeixa, 'fiesta_tatei_neixa');
const placa2Idx = buildDeityStylePlaca(meshCedulaTambor, 'fiesta_tatei_neixa');

const cuadro3Idx = buildDeityStyleCuadro(meshLienzoHikuriNeixa, 'fiesta_hikuri_neixa');
const placa3Idx = buildDeityStylePlaca(meshCedulaHikuri, 'fiesta_hikuri_neixa');

// Helper para calcular el cuaternión exacto que orienta un nodo hacia (0, 0, 0)
function calculateLookAtCenterQuaternion(pos) {
  const dx = -pos[0];
  const dz = -pos[2];
  const len = Math.sqrt(dx * dx + dz * dz);
  const ndx = dx / len;
  const ndz = dz / len;
  const theta = Math.atan2(ndx, ndz);
  return [0.0, Math.sin(theta / 2.0), 0.0, Math.cos(theta / 2.0)];
}

// ==============================================================================
// 6A. CUADROS EN LA PARED (R = 7.30m, rotados hacia el centro)
// ==============================================================================

// ESTACIÓN 1: NAMAWITA NEIXA (Norte-Oeste, Z = -1.85m)
const posCuadro1 = [-7.062, 0.0, -1.85];
const quatCuadro1 = calculateLookAtCenterQuaternion(posCuadro1);
const nodeNierika1 = gltf.nodes[407];
nodeNierika1.name = 'estacion_fiesta_1_namawita_neixa';
nodeNierika1.translation = posCuadro1;
nodeNierika1.rotation = quatCuadro1;
nodeNierika1.scale = [1.0, 1.0, 1.0];
nodeNierika1.children = [cuadro1Idx, placa1Idx];
console.log(`  ✓ Cuadro 1 (Namawita Neixa): pos=${JSON.stringify(posCuadro1)}, rotación hacia el centro`);

// ESTACIÓN 2: TATEI NEIXA (Centro-Oeste, Z = 0.0m)
const posCuadro2 = [-7.30, 0.0, 0.0];
const quatCuadro2 = calculateLookAtCenterQuaternion(posCuadro2);
const nodeNierika2 = gltf.nodes[415];
nodeNierika2.name = 'estacion_fiesta_2_tatei_neixa';
nodeNierika2.translation = posCuadro2;
nodeNierika2.rotation = quatCuadro2;
nodeNierika2.scale = [1.0, 1.0, 1.0];
nodeNierika2.children = [cuadro2Idx, placa2Idx];
console.log(`  ✓ Cuadro 2 (Tatei Neixa): pos=${JSON.stringify(posCuadro2)}, rotación hacia el centro`);

// ESTACIÓN 3: HIKURI NEIXA (Sur-Oeste, Z = +1.85m)
const posCuadro3 = [-7.062, 0.0, 1.85];
const quatCuadro3 = calculateLookAtCenterQuaternion(posCuadro3);
const nodeNierika3 = gltf.nodes[423];
nodeNierika3.name = 'estacion_fiesta_3_hikuri_neixa';
nodeNierika3.translation = posCuadro3;
nodeNierika3.rotation = quatCuadro3;
nodeNierika3.scale = [1.0, 1.0, 1.0];
nodeNierika3.children = [cuadro3Idx, placa3Idx];
console.log(`  ✓ Cuadro 3 (Hikuri Neixa): pos=${JSON.stringify(posCuadro3)}, rotación hacia el centro`);

// ==============================================================================
// 6B. MESAS DE EXHIBICIÓN EN EL PISO (orientadas hacia el espectador central)
// ==============================================================================

const nodeMesa1 = gltf.nodes[297];
nodeMesa1.rotation = calculateLookAtCenterQuaternion(nodeMesa1.translation);

const nodeMesa2 = gltf.nodes[398];
nodeMesa2.rotation = calculateLookAtCenterQuaternion(nodeMesa2.translation);

const nodeMesa3 = gltf.nodes[347];
nodeMesa3.rotation = calculateLookAtCenterQuaternion(nodeMesa3.translation);

console.log('  ✓ Mesas de exhibición en piso orientadas hacia el centro');

// ==============================================================================
// 6C. CENTRADO EXACTO DE LOS 4 LETREROS SUPERIORES RESPECTO A SUS PILARES
// ==============================================================================
console.log('\n--- 5. Centrando los 4 letreros superiores respecto al pilar ---');

const deltaPilar = 0.13; // Ajuste de 13 cm para centrado exacto frente al pilar

const bannerConfigs = [
  { name: 'letrero_seccion_bienvenida', pos: [-deltaPilar, 3.15, 4.80] },
  { name: 'letrero_seccion_gastronomia', pos: [4.80, 3.15, deltaPilar] },
  { name: 'letrero_seccion_deidades',   pos: [deltaPilar, 3.15, -4.80] },
  { name: 'letrero_seccion_fiestas',     pos: [-4.80, 3.15, -deltaPilar] }
];

bannerConfigs.forEach(bc => {
  const node = gltf.nodes.find(n => n.name === bc.name);
  if (node) {
    node.translation = bc.pos;
    node.rotation = calculateLookAtCenterQuaternion(bc.pos);
    console.log(`  ✓ ${bc.name}: pos=${JSON.stringify(bc.pos)}, centrado con el pilar`);
  }
});

// ------------------------------------------------------------------------------
// 7. SERIALIZAR Y ENSAMBLAR NUEVO GLB BINARIO (v10)
// ------------------------------------------------------------------------------
gltf.buffers[0].byteLength = currentBinBytes.length;

const newJsonStr = JSON.stringify(gltf);
const newJsonBuf = Buffer.from(newJsonStr, 'utf8');
const jsonPadding = (4 - (newJsonBuf.length % 4)) % 4;
const paddedJsonBuf = Buffer.concat([newJsonBuf, Buffer.alloc(jsonPadding, 0x20)]);

const newTotalLen = 12 + 8 + paddedJsonBuf.length + 8 + currentBinBytes.length;
const outGlb = Buffer.alloc(newTotalLen);

outGlb.writeUInt32LE(0x46546C67, 0); // magic
outGlb.writeUInt32LE(version, 4);    // versión (2)
outGlb.writeUInt32LE(newTotalLen, 8); // longitud total

outGlb.writeUInt32LE(paddedJsonBuf.length, 12);
outGlb.writeUInt32LE(0x4E4F534A, 16); // 'JSON'
paddedJsonBuf.copy(outGlb, 20);

const newChunk1Pos = 20 + paddedJsonBuf.length;
outGlb.writeUInt32LE(currentBinBytes.length, newChunk1Pos);
outGlb.writeUInt32LE(0x004E4942, newChunk1Pos + 4); // 'BIN\0'
currentBinBytes.copy(outGlb, newChunk1Pos + 8);

// Guardar salidas oficiales v10
const publicV10Path = path.resolve('public', 'museo_wixarika_v10.glb');
fs.writeFileSync(publicV10Path, outGlb);
console.log(`\n✓ Archivo GLB v10 guardado en: ${publicV10Path} (${(outGlb.length / 1024).toFixed(2)} KB)`);

const refV10Path = path.resolve('imagenesRef', 'museo_wixarika_v10.glb');
fs.writeFileSync(refV10Path, outGlb);
console.log(`✓ Copia de respaldo v10 guardada en: ${refV10Path}`);

const publicBasePath = path.resolve('public', 'museo_wixarika_base.glb');
fs.writeFileSync(publicBasePath, outGlb);
console.log(`✓ Archivo GLB principal (base) actualizado a v10: ${publicBasePath}`);

const refBasePath = path.resolve('imagenesRef', 'museo_wixarika_base.glb');
fs.writeFileSync(refBasePath, outGlb);
console.log(`✓ Respaldo base actualizado a v10 en: ${refBasePath}`);

console.log('\n================================================================');
console.log('  PROCESO DE GENERACIÓN V10 FINALIZADO CON ÉXITO');
console.log('================================================================');
