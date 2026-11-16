#!/usr/bin/env node
/**
 * Generador de Sala de Museo Wixárika v15 (.GLB)
 * Genera public/museo_wixarika_v15.glb a partir de public/museo_wixarika_v14.glb
 *
 * Implementación de la Propuesta 1 (Etnografía Museográfica Wixárika):
 * 1. Mostrador Curvo Continuo Escalonado de Madera de Nogal:
 *    - Curvatura continua que abraza el cuadrante gastronómico (R = 4.80m a 5.50m).
 *    - Zócalo macizo cerrado hasta el suelo (elimina las bancas de patas abiertas).
 *    - Grada Superior (Y = 0.92m, R = 5.32m): exhibe los 6 platillos y bebidas ceremoniales.
 *    - Grada Frontal (Y = 0.74m, R = 5.00m): exhibe las 6 cédulas inclinadas (-24°) frente a cada platillo.
 * 2. Muro Curvo con Rieles de Madera y Mazorcas Sagradas (R = 7.86m):
 *    - Rieles horizontales de nogal en doble nivel (Y = 2.45m e Y = 1.80m).
 *    - Mazorcas de maíz sagrado colgadas de sus totomoxtles en los 5 colores:
 *      • Yuawime (azul índigo)
 *      • Tairawime (rojo / rosa terracota)
 *      • Taxawime (amarillo sol)
 *      • Tuxame (blanco puro)
 *      • Tsinawime (pinto / multicolor)
 *    - Guajes y jícaras ceremoniales tradicionales (xikuri) en la sección sur.
 * 3. Pérgola Superior y Guirnaldas de Cempasúchil:
 *    - Vigas radiales y travesaño curvo de nogal en la parte alta (Y = 3.65m).
 *    - Guirnaldas colgantes de flores doradas y anaranjadas de cempasúchil.
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

console.log('=== Generando Museo Wixárika v15 (Mostrador Curvo Escalonado + Mazorcas en Muro + Cempasúchil) ===');
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

// --------------------------------------------------------------------------
// 1. Texturas y Materiales Nuevos
// --------------------------------------------------------------------------
console.log('\n--- 1. Preparando Materiales Etnográficos ---');

// Materiales de los 5 Colores Sagrados del Maíz
const matMaizYuawimeAzul = gltf.materials.length;
gltf.materials.push({
  name: 'mat_maiz_yuawime_azul',
  pbrMetallicRoughness: {
    baseColorFactor: [0.18, 0.22, 0.42, 1.0],
    metallicFactor: 0.02,
    roughnessFactor: 0.55
  }
});

const matMaizTairawimeRosa = gltf.materials.length;
gltf.materials.push({
  name: 'mat_maiz_tairawime_rosa',
  pbrMetallicRoughness: {
    baseColorFactor: [0.72, 0.25, 0.22, 1.0],
    metallicFactor: 0.02,
    roughnessFactor: 0.55
  }
});

const matMaizTaxawimeAmarillo = gltf.materials.length;
gltf.materials.push({
  name: 'mat_maiz_taxawime_amarillo',
  pbrMetallicRoughness: {
    baseColorFactor: [0.92, 0.70, 0.12, 1.0],
    metallicFactor: 0.02,
    roughnessFactor: 0.50
  }
});

const matMaizTuxameBlanco = gltf.materials.length;
gltf.materials.push({
  name: 'mat_maiz_tuxame_blanco',
  pbrMetallicRoughness: {
    baseColorFactor: [0.96, 0.94, 0.86, 1.0],
    metallicFactor: 0.02,
    roughnessFactor: 0.55
  }
});

const matMaizTsinawimePinto = gltf.materials.length;
gltf.materials.push({
  name: 'mat_maiz_tsinawime_pinto',
  pbrMetallicRoughness: {
    baseColorFactor: [0.48, 0.22, 0.18, 1.0],
    metallicFactor: 0.02,
    roughnessFactor: 0.55
  }
});

// Totomoxtle seco (hojas de maíz para amarrar)
const matTotomoxtle = gltf.materials.length;
gltf.materials.push({
  name: 'mat_totomoxtle_seco',
  pbrMetallicRoughness: {
    baseColorFactor: [0.86, 0.80, 0.65, 1.0],
    metallicFactor: 0.01,
    roughnessFactor: 0.85
  }
});

// Guajes ceremoniales (calabazas tradicionales grabadas)
const matGuajeCeremonial = gltf.materials.length;
gltf.materials.push({
  name: 'mat_guaje_ceremonial',
  pbrMetallicRoughness: {
    baseColorFactor: [0.78, 0.52, 0.28, 1.0],
    metallicFactor: 0.04,
    roughnessFactor: 0.38
  }
});

// Cempasúchil dorado y anaranjado
const matCempasuchilOro = gltf.materials.length;
gltf.materials.push({
  name: 'mat_cempasuchil_oro',
  pbrMetallicRoughness: {
    baseColorFactor: [0.96, 0.62, 0.04, 1.0],
    metallicFactor: 0.01,
    roughnessFactor: 0.70
  }
});

const matCempasuchilNaranja = gltf.materials.length;
gltf.materials.push({
  name: 'mat_cempasuchil_naranja',
  pbrMetallicRoughness: {
    baseColorFactor: [0.92, 0.40, 0.04, 1.0],
    metallicFactor: 0.01,
    roughnessFactor: 0.70
  }
});

// Materiales base reutilizados
const MAT_MADERA_OSCURA = 3;  // mat_madera_oscura.036
const MAT_ORO = 1;            // mat_kauyumari_oro.044

console.log('✓ Materiales etnográficos listos.');

// --------------------------------------------------------------------------
// 2. Geometría 3D: Mostrador Curvo Continuo Escalonado
// --------------------------------------------------------------------------
console.log('\n--- 2. Creando Geometría del Mostrador Curvo Escalonado ---');

function createCurvedCounterMesh(materialIdx) {
  const theta1 = -27 * Math.PI / 180;
  const theta2 = 27 * Math.PI / 180;
  const numSegs = 24;

  // Perfil transversal en (Radio, Y):
  // 0: frente en el piso
  // 1: borde frontal de grada baja
  // 2: base del escalón vertical intermedio
  // 3: borde frontal de grada alta
  // 4: borde trasero de grada alta
  // 5: parte trasera en el piso
  const profile = [
    { r: 4.82, y: 0.00 }, // 0
    { r: 4.82, y: 0.74 }, // 1 (frente inferior)
    { r: 5.16, y: 0.74 }, // 2 (huella grada baja)
    { r: 5.16, y: 0.92 }, // 3 (contrahuella escalón)
    { r: 5.52, y: 0.92 }, // 4 (huella grada alta)
    { r: 5.52, y: 0.00 }  // 5 (espalda al suelo)
  ];

  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  // Vértices del barrido radial
  for (let s = 0; s <= numSegs; s++) {
    const frac = s / numSegs;
    const angle = theta1 + frac * (theta2 - theta1);
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    for (let p = 0; p < profile.length; p++) {
      const pt = profile[p];
      const x = pt.r * cosA;
      const y = pt.y;
      const z = pt.r * sinA;
      positions.push(x, y, z);

      let nx = 0, ny = 0, nz = 0;
      if (p === 0 || p === 1) { nx = -cosA; ny = 0; nz = -sinA; }
      else if (p === 2) { nx = 0; ny = 1; nz = 0; }
      else if (p === 3) { nx = -cosA; ny = 0; nz = -sinA; }
      else if (p === 4) { nx = 0; ny = 1; nz = 0; }
      else { nx = cosA; ny = 0; nz = sinA; }

      normals.push(nx, ny, nz);
      uvs.push(frac * 6, pt.y * 1.5);
    }
  }

  // Quads longitudinales
  for (let s = 0; s < numSegs; s++) {
    for (let p = 0; p < profile.length - 1; p++) {
      const i0 = s * profile.length + p;
      const i1 = (s + 1) * profile.length + p;
      const i2 = s * profile.length + (p + 1);
      const i3 = (s + 1) * profile.length + (p + 1);
      indices.push(i0, i1, i2);
      indices.push(i1, i3, i2);
    }
  }

  // Tapas laterales (end caps)
  // Tapa Norte (s = 0)
  const capNorteBase = positions.length / 3;
  const cos1 = Math.cos(theta1), sin1 = Math.sin(theta1);
  const tanX1 = -sin1, tanZ1 = cos1; // Normal lateral
  for (let p = 0; p < profile.length; p++) {
    const pt = profile[p];
    positions.push(pt.r * cos1, pt.y, pt.r * sin1);
    normals.push(tanX1, 0, tanZ1);
    uvs.push(pt.r - 4.82, pt.y);
  }
  indices.push(capNorteBase, capNorteBase + 2, capNorteBase + 1);
  indices.push(capNorteBase, capNorteBase + 5, capNorteBase + 2);
  indices.push(capNorteBase + 2, capNorteBase + 5, capNorteBase + 3);
  indices.push(capNorteBase + 3, capNorteBase + 5, capNorteBase + 4);

  // Tapa Sur (s = numSegs)
  const capSurBase = positions.length / 3;
  const cos2 = Math.cos(theta2), sin2 = Math.sin(theta2);
  const tanX2 = sin2, tanZ2 = -cos2;
  for (let p = 0; p < profile.length; p++) {
    const pt = profile[p];
    positions.push(pt.r * cos2, pt.y, pt.r * sin2);
    normals.push(tanX2, 0, tanZ2);
    uvs.push(pt.r - 4.82, pt.y);
  }
  indices.push(capSurBase, capSurBase + 1, capSurBase + 2);
  indices.push(capSurBase, capSurBase + 2, capSurBase + 5);
  indices.push(capSurBase + 2, capSurBase + 3, capSurBase + 5);
  indices.push(capSurBase + 3, capSurBase + 4, capSurBase + 5);

  return registerMesh(positions, normals, uvs, indices, materialIdx, 'mesh_mostrador_curvo_escalonado');
}

const meshMostradorCurvo = createCurvedCounterMesh(MAT_MADERA_OSCURA);
console.log('✓ Mostrador curvo escalonado generado.');

// --------------------------------------------------------------------------
// 3. Geometría 3D: Rieles de Madera en Muro Curvo
// --------------------------------------------------------------------------
console.log('\n--- 3. Creando Rieles de Madera en Muro ---');

function createCurvedRailMesh(thetaStartDeg, thetaEndDeg, r, y, height, depth, materialIdx, name) {
  const theta1 = thetaStartDeg * Math.PI / 180;
  const theta2 = thetaEndDeg * Math.PI / 180;
  const segs = 10;
  const rFront = r - depth;
  const rBack = r;
  const yBottom = y - height / 2;
  const yTop = y + height / 2;

  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  for (let s = 0; s <= segs; s++) {
    const frac = s / segs;
    const a = theta1 + frac * (theta2 - theta1);
    const cosA = Math.cos(a), sinA = Math.sin(a);

    // 4 vértices por anillo transversal:
    // 0: front bottom
    // 1: front top
    // 2: back top
    // 3: back bottom
    positions.push(rFront * cosA, yBottom, rFront * sinA);
    normals.push(-cosA, 0, -sinA);
    uvs.push(frac * 2, 0);

    positions.push(rFront * cosA, yTop, rFront * sinA);
    normals.push(-cosA, 0, -sinA);
    uvs.push(frac * 2, 1);

    positions.push(rBack * cosA, yTop, rBack * sinA);
    normals.push(0, 1, 0);
    uvs.push(frac * 2, 1);

    positions.push(rBack * cosA, yBottom, rBack * sinA);
    normals.push(0, -1, 0);
    uvs.push(frac * 2, 0);
  }

  for (let s = 0; s < segs; s++) {
    for (let p = 0; p < 3; p++) {
      const i0 = s * 4 + p;
      const i1 = (s + 1) * 4 + p;
      const i2 = s * 4 + (p + 1);
      const i3 = (s + 1) * 4 + (p + 1);
      indices.push(i0, i1, i2);
      indices.push(i1, i3, i2);
    }
  }

  return registerMesh(positions, normals, uvs, indices, materialIdx, name);
}

// Rieles para secciones Norte, Centro y Sur
const meshRielNorte = createCurvedRailMesh(-26, -11, 7.88, 0, 0.08, 0.05, MAT_MADERA_OSCURA, 'mesh_riel_muro_norte');
const meshRielCentro = createCurvedRailMesh(-7, 7, 7.88, 0, 0.08, 0.05, MAT_MADERA_OSCURA, 'mesh_riel_muro_centro');
const meshRielSur = createCurvedRailMesh(11, 26, 7.88, 0, 0.08, 0.05, MAT_MADERA_OSCURA, 'mesh_riel_muro_sur');
console.log('✓ Rieles curvos de nogal generados.');

// --------------------------------------------------------------------------
// 4. Geometría 3D: Mazorcas Sagradas en Parejas Colgantes
// --------------------------------------------------------------------------
console.log('\n--- 4. Creando Mazorcas Sagradas y Guajes Colgantes ---');

function createHangingCornPairMesh(cornMaterialIdx, name) {
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  // Dos mazorcas lado a lado (x = -0.045m y +0.045m)
  [-0.045, 0.045].forEach((xOff, earIdx) => {
    const rings = 7;
    const segments = 10;
    const length = 0.28;
    const radius = 0.038;
    const baseVert = positions.length / 3;

    for (let r = 0; r <= rings; r++) {
      const v = r / rings;
      const y = -0.05 - v * length; // Cuelga de y = -0.05 a -0.33m
      const taper = Math.sin(v * Math.PI * 0.85 + 0.15) * 0.45 + 0.55;
      const curR = (r === rings) ? 0.006 : radius * taper;

      for (let s = 0; s <= segments; s++) {
        const u = s / segments;
        const angle = u * Math.PI * 2;
        const x = xOff + Math.cos(angle) * curR;
        const z = Math.sin(angle) * curR;
        positions.push(x, y, z);
        normals.push(Math.cos(angle), -0.15, Math.sin(angle));
        uvs.push(u * 2, v * 3);
      }
    }

    for (let r = 0; r < rings; r++) {
      for (let s = 0; s < segments; s++) {
        const i0 = baseVert + r * (segments + 1) + s;
        const i1 = i0 + 1;
        const i2 = baseVert + (r + 1) * (segments + 1) + s;
        const i3 = i2 + 1;
        indices.push(i0, i2, i1, i1, i2, i3);
      }
    }
  });

  // Nudo superior de totomoxtle
  const baseKnot = positions.length / 3;
  const hw = 0.045, hh = 0.025, hd = 0.025;
  const knotPos = [
    -hw, 0.0,  hd,   hw, 0.0,  hd,   hw, -0.05,  hd,  -hw, -0.05,  hd,
     hw, 0.0, -hd,  -hw, 0.0, -hd,  -hw, -0.05, -hd,   hw, -0.05, -hd
  ];
  for (let i = 0; i < knotPos.length; i += 3) {
    positions.push(knotPos[i], knotPos[i+1], knotPos[i+2]);
    normals.push(0, 0, 1);
    uvs.push(0, 0);
  }
  indices.push(
    baseKnot, baseKnot + 1, baseKnot + 2, baseKnot, baseKnot + 2, baseKnot + 3,
    baseKnot + 4, baseKnot + 5, baseKnot + 6, baseKnot + 4, baseKnot + 6, baseKnot + 7
  );

  return registerMesh(positions, normals, uvs, indices, cornMaterialIdx, name);
}

// 5 Mallas de mazorcas para los 5 colores sagrados
const meshParYuawimeAzul = createHangingCornPairMesh(matMaizYuawimeAzul, 'mesh_par_maiz_yuawime_azul');
const meshParTairawimeRosa = createHangingCornPairMesh(matMaizTairawimeRosa, 'mesh_par_maiz_tairawime_rosa');
const meshParTaxawimeAmarillo = createHangingCornPairMesh(matMaizTaxawimeAmarillo, 'mesh_par_maiz_taxawime_amarillo');
const meshParTuxameBlanco = createHangingCornPairMesh(matMaizTuxameBlanco, 'mesh_par_maiz_tuxame_blanco');
const meshParTsinawimePinto = createHangingCornPairMesh(matMaizTsinawimePinto, 'mesh_par_maiz_tsinawime_pinto');

// Geometría del Guaje Ceremonial (Calabaza seca tradicional)
function createGourdMesh(materialIdx, name) {
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  const rings = 12;
  const segments = 12;

  for (let r = 0; r <= rings; r++) {
    const v = r / rings;
    const y = -v * 0.32; // Longitud 0.32m
    let curR = 0;
    if (v < 0.30) {
      const t = v / 0.30;
      curR = 0.045 * Math.sin(t * Math.PI) + 0.015;
    } else if (v < 0.45) {
      curR = 0.026;
    } else {
      const t = (v - 0.45) / 0.55;
      curR = 0.076 * Math.sin(t * Math.PI) + 0.026;
    }

    for (let s = 0; s <= segments; s++) {
      const u = s / segments;
      const angle = u * Math.PI * 2;
      const x = Math.cos(angle) * curR;
      const z = Math.sin(angle) * curR;
      positions.push(x, y, z);
      normals.push(Math.cos(angle), (0.5 - v) * 0.5, Math.sin(angle));
      uvs.push(u, v);
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

const meshGuaje = createGourdMesh(matGuajeCeremonial, 'mesh_guaje_ceremonial_colgante');
console.log('✓ Mazorcas y guajes colgantes listos.');

// --------------------------------------------------------------------------
// 5. Geometría 3D: Pérgola Superior y Guirnaldas de Cempasúchil
// --------------------------------------------------------------------------
console.log('\n--- 5. Creando Pérgola y Guirnaldas de Cempasúchil ---');

function createCempasuchilGarlandMesh(materialIdx, name) {
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  const numFlowers = 6;
  for (let f = 0; f < numFlowers; f++) {
    const yCenter = -f * 0.09 - 0.04;
    const baseR = 0.054 * (1.0 - (f % 2) * 0.15);
    const rings = 4;
    const segs = 8;
    const baseVert = positions.length / 3;

    for (let r = 0; r <= rings; r++) {
      const theta = (r / rings) * Math.PI;
      const y = yCenter + Math.cos(theta) * (baseR * 0.7);
      const ringR = Math.sin(theta) * baseR;

      for (let s = 0; s <= segs; s++) {
        const phi = (s / segs) * Math.PI * 2;
        const x = Math.cos(phi) * ringR;
        const z = Math.sin(phi) * ringR;
        positions.push(x, y, z);
        normals.push(Math.sin(theta) * Math.cos(phi), Math.cos(theta), Math.sin(theta) * Math.sin(phi));
        uvs.push(s / segs, r / rings);
      }
    }

    for (let r = 0; r < rings; r++) {
      for (let s = 0; s < segs; s++) {
        const i0 = baseVert + r * (segs + 1) + s;
        const i1 = i0 + 1;
        const i2 = baseVert + (r + 1) * (segs + 1) + s;
        const i3 = i2 + 1;
        indices.push(i0, i2, i1, i1, i2, i3);
      }
    }
  }

  return registerMesh(positions, normals, uvs, indices, materialIdx, name);
}

const meshGuirnaldaOro = createCempasuchilGarlandMesh(matCempasuchilOro, 'mesh_guirnalda_cempasuchil_oro');
const meshGuirnaldaNaranja = createCempasuchilGarlandMesh(matCempasuchilNaranja, 'mesh_guirnalda_cempasuchil_naranja');

// Viga curva de coronamiento de la pérgola (R = 7.15m, Y = 3.65m)
const meshVigaCoronamiento = createCurvedRailMesh(-26, 26, 7.18, 0, 0.08, 0.06, MAT_MADERA_OSCURA, 'mesh_viga_coronamiento_pergola');

// Tirante radial de madera (desde el muro hacia la viga de coronamiento)
const meshTiranteRadial = createBoxMesh(0.70, 0.06, 0.08, MAT_MADERA_OSCURA, 'mesh_tirante_radial_pergola');

console.log('✓ Pérgola y festones de cempasúchil listos.');

// --------------------------------------------------------------------------
// 6. Ensamblaje en la Escena (cuadrante_gastronomia)
// --------------------------------------------------------------------------
console.log('\n--- 6. Ensamblando la Escena en el GLB ---');

const nodes = gltf.nodes;
const gastroQuadrant = nodes[598]; // cuadrante_gastronomia

// 6.1 Desactivar mesas viejas tipo banco de picnic
nodes[520].scale = [0.0, 0.0, 0.0]; // mesa_gastronomia_1_norte
nodes[558].scale = [0.0, 0.0, 0.0]; // mesa_gastronomia_2_sur

// Desactivar repisas del pilar central
nodes[582].scale = [0.0, 0.0, 0.0]; // repisa_gastronomia_1
nodes[597].scale = [0.0, 0.0, 0.0]; // repisa_gastronomia_2

// 6.2 Montar Mostrador Curvo Continuo Escalonado
const nodeMostradorCurvo = nodes.length;
nodes.push({
  name: 'mostrador_curvo_continuo_gastronomia',
  translation: [0, 0, 0],
  mesh: meshMostradorCurvo
});
gastroQuadrant.children.push(nodeMostradorCurvo);
console.log('  ✓ Mostrador curvo escalonado montado en cuadrante.');

// 6.3 Montar Rieles en Muro Curvo (Norte, Centro y Sur)
// Doble nivel: Y = 2.45m (superior) e Y = 1.80m (inferior)
const railLevels = [
  { y: 2.45, name: 'superior' },
  { y: 1.80, name: 'inferior' }
];

railLevels.forEach(lvl => {
  const nodeRielN = nodes.length;
  nodes.push({
    name: `riel_muro_norte_${lvl.name}`,
    translation: [0, lvl.y, 0],
    mesh: meshRielNorte
  });
  gastroQuadrant.children.push(nodeRielN);

  const nodeRielC = nodes.length;
  nodes.push({
    name: `riel_muro_centro_${lvl.name}`,
    translation: [0, lvl.y, 0],
    mesh: meshRielCentro
  });
  gastroQuadrant.children.push(nodeRielC);

  const nodeRielS = nodes.length;
  nodes.push({
    name: `riel_muro_sur_${lvl.name}`,
    translation: [0, lvl.y, 0],
    mesh: meshRielSur
  });
  gastroQuadrant.children.push(nodeRielS);
});
console.log('  ✓ Rieles horizontales de nogal montados en muro a Y=2.45m e Y=1.80m.');

// 6.4 Colgar Mazorcas en los 5 Colores Sagrados
// Helper para colocar un elemento colgante en el muro en (radio, ángulo, Y)
function addHangingItem(meshIdx, angleDeg, y, name) {
  const rad = angleDeg * Math.PI / 180;
  const r = 7.82; // Justo delante del riel
  const x = r * Math.cos(rad);
  const z = r * Math.sin(rad);

  // Rotación orientada hacia el centro del museo
  const rotYAngle = -Math.PI / 2 - rad;
  const qy = Math.sin(rotYAngle / 2);
  const qw = Math.cos(rotYAngle / 2);

  const nodeIdx = nodes.length;
  nodes.push({
    name,
    translation: [x, y, z],
    rotation: [0, qy, 0, qw],
    mesh: meshIdx
  });
  gastroQuadrant.children.push(nodeIdx);
}

// 6.4.1 Sección Norte (Izquierda): 5 Colores Sagrados en ambos niveles
const cornColorMeshes = [
  meshParYuawimeAzul,
  meshParTairawimeRosa,
  meshParTaxawimeAmarillo,
  meshParTuxameBlanco,
  meshParTsinawimePinto
];

railLevels.forEach((lvl, lIdx) => {
  const anglesNorte = [-24.5, -21.5, -18.5, -15.5, -12.5];
  anglesNorte.forEach((ang, i) => {
    addHangingItem(
      cornColorMeshes[i % cornColorMeshes.length],
      ang,
      lvl.y,
      `maiz_sagrado_norte_${lvl.name}_${i + 1}`
    );
  });
});

// 6.4.2 Sección Centro (Flanqueando el pilar): 4 pares de mazorcas
railLevels.forEach((lvl) => {
  const anglesCentro = [-5.5, -2.5, 2.5, 5.5];
  anglesCentro.forEach((ang, i) => {
    addHangingItem(
      cornColorMeshes[i % cornColorMeshes.length],
      ang,
      lvl.y,
      `maiz_sagrado_centro_${lvl.name}_${i + 1}`
    );
  });
});

// 6.4.3 Sección Sur (Derecha): Guajes tradicionales y mazorcas
// Riel superior: 5 Guajes tradicionales colgados
const anglesSurGuajes = [13.0, 16.0, 19.0, 22.0, 25.0];
anglesSurGuajes.forEach((ang, i) => {
  addHangingItem(meshGuaje, ang, 2.45, `guaje_ceremonial_sur_sup_${i + 1}`);
});

// Riel inferior: 3 Guajes y 2 pares de mazorcas alternadas
const itemsSurInf = [
  { mesh: meshGuaje, ang: 13.0, name: 'guaje_inf_1' },
  { mesh: meshParTaxawimeAmarillo, ang: 16.0, name: 'maiz_inf_1' },
  { mesh: meshGuaje, ang: 19.0, name: 'guaje_inf_2' },
  { mesh: meshParYuawimeAzul, ang: 22.0, name: 'maiz_inf_2' },
  { mesh: meshGuaje, ang: 25.0, name: 'guaje_inf_3' }
];
itemsSurInf.forEach(it => {
  addHangingItem(it.mesh, it.ang, 1.80, `sur_inf_${it.name}`);
});

console.log('  ✓ 28 racimos de mazorcas en los 5 colores sagrados y guajes colgados en el muro.');

// 6.5 Pérgola Superior y Festones de Cempasúchil
const nodeVigaCoronamiento = nodes.length;
nodes.push({
  name: 'viga_coronamiento_pérgola',
  translation: [0, 3.65, 0],
  mesh: meshVigaCoronamiento
});
gastroQuadrant.children.push(nodeVigaCoronamiento);

// 9 Tirantes radiales
for (let ti = 0; ti < 9; ti++) {
  const angDeg = -24 + ti * 6.0;
  const angRad = angDeg * Math.PI / 180;
  const rMid = 7.50;
  const x = rMid * Math.cos(angRad);
  const z = rMid * Math.sin(angRad);

  const rotYAngle = -Math.PI / 2 - angRad;
  const qy = Math.sin(rotYAngle / 2);
  const qw = Math.cos(rotYAngle / 2);

  const nodeTirante = nodes.length;
  nodes.push({
    name: `tirante_pergola_${ti + 1}`,
    translation: [x, 3.70, z],
    rotation: [0, qy, 0, qw],
    mesh: meshTiranteRadial
  });
  gastroQuadrant.children.push(nodeTirante);
}

// 14 Guirnaldas de Cempasúchil colgando rítmicamente
for (let gi = 0; gi < 14; gi++) {
  const angDeg = -23.5 + gi * 3.6;
  const angRad = angDeg * Math.PI / 180;
  const r = 7.15;
  const x = r * Math.cos(angRad);
  const z = r * Math.sin(angRad);

  const garlandMesh = (gi % 2 === 0) ? meshGuirnaldaOro : meshGuirnaldaNaranja;

  const nodeGarland = nodes.length;
  nodes.push({
    name: `guirnalda_cempasuchil_${gi + 1}`,
    translation: [x, 3.65, z],
    mesh: garlandMesh
  });
  gastroQuadrant.children.push(nodeGarland);
}
console.log('  ✓ Pérgola y 14 festones de cempasúchil instalados en la coronación.');

// 6.6 Ubicar Alimentos en la Grada Superior (Y = 0.92m, R = 5.32m)
// y Cédulas en la Grada Inferior (Y = 0.75m, R = 5.00m)
const exhibitConfigs = [
  {
    angDeg: -20,
    foodNode: 501, // comida_tortillas_maiz_sagrado
    signNode: 513, // letrero_tortillas
    name: 'tortillas'
  },
  {
    angDeg: -12,
    foodNode: 497, // comida_tamales_ceremoniales
    signNode: 509, // letrero_tamales
    name: 'tamales'
  },
  {
    angDeg: -4,
    foodNode: 529, // comida_caldo_toro_cazuela
    signNode: 543, // letrero_caldo_toro
    name: 'caldo_toro'
  },
  {
    angDeg: 4,
    foodNode: 533, // comida_maiz_tostado_xarikixa
    signNode: 547, // letrero_maiz_tostado
    name: 'maiz_tostado'
  },
  {
    angDeg: 12,
    foodNode: 490, // comida_atole_olla_bebidas
    signNode: 505, // letrero_atole
    name: 'atole'
  },
  {
    angDeg: 20,
    foodNode: 539, // comida_perruri_boda_wixarika
    signNode: 551, // letrero_perruri
    name: 'perruri'
  }
];

// Mover los nodos de alimentos y letreros para que sean hijos directos de cuadrante_gastronomia
// y así colocarlos exactamente en coordenadas de mundo sobre las gradas
const QUAT_TILTS = {
  '-20': [-0.1703, -0.5610, -0.1193, 0.8013],
  '-12': [-0.1616, -0.6156, -0.1308, 0.7602],
  '-4':  [-0.1521, -0.6671, -0.1418, 0.7154],
  '4':   [-0.1418, -0.7154, -0.1521, 0.6671],
  '12':  [-0.1308, -0.7602, -0.1616, 0.6156],
  '20':  [-0.1193, -0.8013, -0.1703, 0.5610]
};

const QUAT_FOOD_YAWS = {
  '-20': [0.0, -0.5736, 0.0, 0.8192],
  '-12': [0.0, -0.6293, 0.0, 0.7771],
  '-4':  [0.0, -0.6820, 0.0, 0.7314],
  '4':   [0.0, -0.7314, 0.0, 0.6820],
  '12':  [0.0, -0.7771, 0.0, 0.6293],
  '20':  [0.0, -0.8192, 0.0, 0.5736]
};

exhibitConfigs.forEach(ex => {
  const rad = ex.angDeg * Math.PI / 180;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);

  // 1. Alimento en Grada Superior (R = 5.32m, Y = 0.92m)
  const rFood = 5.32;
  const foodNode = nodes[ex.foodNode];
  foodNode.translation = [rFood * cosA, 0.925, rFood * sinA];
  foodNode.rotation = QUAT_FOOD_YAWS[String(ex.angDeg)];
  foodNode.scale = [1.32, 1.32, 1.32];

  // Desvincular de la mesa vieja y vincular a cuadrante_gastronomia
  gastroQuadrant.children.push(ex.foodNode);

  // 2. Cédula en Grada Inferior (R = 5.00m, Y = 0.75m, tilt -24°)
  const rSign = 5.00;
  const signNode = nodes[ex.signNode];
  signNode.translation = [rSign * cosA, 0.755, rSign * sinA];
  signNode.rotation = QUAT_TILTS[String(ex.angDeg)];
  signNode.scale = [1.22, 1.22, 1.22];

  gastroQuadrant.children.push(ex.signNode);
});

// Limpiar children de las mesas viejas para no duplicar referencias
nodes[520].children = [];
nodes[558].children = [];

// 6.7 Metate de Molienda Tradicional al Costado
nodes[486].translation = [6.25, 0.0, 2.75]; // Sobre el piso de cantera clara
nodes[486].rotation = [0, -0.92388, 0, 0.38268];
nodes[486].scale = [1.20, 1.20, 1.20];

console.log('  ✓ 6 Platillos tradicionales y 6 cédulas distribuidas en gradas escalonadas.');
console.log('  ✓ Metate ceremonial preservado sobre piso de cantera.');

// --------------------------------------------------------------------------
// 7. Empaquetado y Exportación de public/museo_wixarika_v15.glb
// --------------------------------------------------------------------------
console.log('\n--- 7. Empaquetando nuevo modelo binario: museo_wixarika_v15.glb ---');

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
