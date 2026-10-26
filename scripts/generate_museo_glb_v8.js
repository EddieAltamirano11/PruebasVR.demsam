// ==============================================================================
// Generador / Exportador Oficial: Museo Virtual Wixárika - Versión 8 (v8)
// Basado directamente en la versión v7 (curada en Blender + subtítulos negros)
// Modificaciones v8:
// 1. Reemplazo del círculo central del suelo por el Tapete Sagrado Wixárika (Mándala de Chaquira)
// 2. Centrado exacto de los letreros colgantes de Gastronomía (Este) y Fiestas (Oeste)
// Cumple con la especificación formal: specs/museo_wixarika_spec_v8.yaml
// ==============================================================================

import fs from 'fs';
import path from 'path';

console.log('================================================================');
console.log('  GENERANDO MODELO 3D: SALA DE MUSEO WIXÁRIKA V8 (.GLB)');
console.log('  Base: Museo Wixárika v7 (Blender v6 curado + subtítulos)');
console.log('  Open Spec: specs/museo_wixarika_spec_v8.yaml');
console.log('================================================================\n');

const inputV7Path = path.resolve('public', 'museo_wixarika_v7.glb');
if (!fs.existsSync(inputV7Path)) {
  console.error(`Error: No se encontró el archivo base v7 en: ${inputV7Path}`);
  process.exit(1);
}

const rawGlb = fs.readFileSync(inputV7Path);

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

console.log(`✓ Archivo base v7 cargado correctamente (${(rawGlb.length / 1024).toFixed(2)} KB)`);

// ------------------------------------------------------------------------------
// MODIFICACIÓN 1: CENTRADO DE LOS LETREROS DE GASTRONOMÍA Y FIESTAS
// ------------------------------------------------------------------------------
console.log('\n--- 1. Centrado de Letreros Museográficos Colgantes de Techo ---');

// A. Letrero de Gastronomía: centrar en el eje Este (X = +4.8, Z = 0.0, yaw = -90° / -PI/2)
const gastroSignIdx = gltf.nodes.findIndex(n => n.name === 'letrero_seccion_gastronomia');
if (gastroSignIdx !== -1) {
  const gSign = gltf.nodes[gastroSignIdx];
  console.log(`  Letrero Gastronomía (nodo ${gastroSignIdx}):`);
  console.log(`    Posición previa: ${JSON.stringify(gSign.translation)}`);
  console.log(`    Rotación previa: ${JSON.stringify(gSign.rotation)}`);

  gSign.translation = [4.8, 3.15, 0.0];
  // Yaw = -PI/2 -> quaternion [0, -sin(PI/4), 0, cos(PI/4)] = [0, -0.7071068, 0, 0.7071068]
  gSign.rotation = [0.0, -0.7071067811865475, 0.0, 0.7071067811865476];

  console.log(`    ✓ Nueva posición: ${JSON.stringify(gSign.translation)} (Centrado con mesa y repisas a Z = 0)`);
  console.log(`    ✓ Nueva rotación: ${JSON.stringify(gSign.rotation)} (Frente orientado al centro)`);
} else {
  console.warn('Aviso: letrero_seccion_gastronomia no encontrado');
}

// B. Letrero de Fiestas: centrar en el eje Oeste (X = -4.8, Z = 0.0, yaw = +90° / +PI/2)
const fiestasSignIdx = gltf.nodes.findIndex(n => n.name === 'letrero_seccion_fiestas');
if (fiestasSignIdx !== -1) {
  const fSign = gltf.nodes[fiestasSignIdx];
  console.log(`  Letrero Fiestas (nodo ${fiestasSignIdx}):`);
  console.log(`    Posición previa: ${JSON.stringify(fSign.translation)}`);
  console.log(`    Rotación previa: ${JSON.stringify(fSign.rotation)}`);

  fSign.translation = [-4.8, 3.15, 0.0];
  // Yaw = +PI/2 -> quaternion [0, sin(PI/4), 0, cos(PI/4)] = [0, 0.7071068, 0, 0.7071068]
  fSign.rotation = [0.0, 0.7071067811865475, 0.0, 0.7071067811865476];

  console.log(`    ✓ Nueva posición: ${JSON.stringify(fSign.translation)} (Centrado con tambor tepu y nierikas a Z = 0)`);
  console.log(`    ✓ Nueva rotación: ${JSON.stringify(fSign.rotation)} (Frente orientado al centro)`);
} else {
  console.warn('Aviso: letrero_seccion_fiestas no encontrado');
}

// ------------------------------------------------------------------------------
// MODIFICACIÓN 2: REEMPLAZO DEL CONTENIDO DEL CÍRCULO DEL SUELO POR EL TAPETE SAGRADO
// ------------------------------------------------------------------------------
console.log('\n--- 2. Instalación del Tapete Sagrado Wixárika en el Círculo del Suelo ---');

const tapeteImgPath = path.resolve('public', 'texturas', 'tapete_sagrado_wixarika.jpg');
if (!fs.existsSync(tapeteImgPath)) {
  console.error(`Error: No se encontró la textura del tapete en: ${tapeteImgPath}`);
  process.exit(1);
}
const tapeteImgBuf = fs.readFileSync(tapeteImgPath);
console.log(`  • Imagen de tapete cargada: ${(tapeteImgBuf.length / 1024).toFixed(2)} KB (1024x1024 JPEG)`);

// Inyectar la textura del tapete en el búfer binario
const padBefore = (4 - (currentBinBytes.length % 4)) % 4;
if (padBefore > 0) {
  currentBinBytes = Buffer.concat([currentBinBytes, Buffer.alloc(padBefore, 0)]);
}

const tapeteByteOffset = currentBinBytes.length;
const tapeteByteLength = tapeteImgBuf.length;
const binPadding = (4 - (tapeteByteLength % 4)) % 4;
currentBinBytes = Buffer.concat([currentBinBytes, tapeteImgBuf, Buffer.alloc(binPadding, 0)]);

gltf.bufferViews = gltf.bufferViews || [];
const tapeteBvIdx = gltf.bufferViews.length;
gltf.bufferViews.push({
  buffer: 0,
  byteOffset: tapeteByteOffset,
  byteLength: tapeteByteLength
});

gltf.images = gltf.images || [];
const tapeteImgIdx = gltf.images.length;
gltf.images.push({
  bufferView: tapeteBvIdx,
  mimeType: 'image/jpeg',
  name: 'tex_tapete_sagrado_wixarika'
});

gltf.textures = gltf.textures || [];
const tapeteTexIdx = gltf.textures.length;
gltf.textures.push({
  source: tapeteImgIdx
});

// Crear el material PBR para el tapete textil sagrado
gltf.materials = gltf.materials || [];
const tapeteMatIdx = gltf.materials.length;
gltf.materials.push({
  name: 'mat_tapete_sagrado_wixarika',
  pbrMetallicRoughness: {
    baseColorFactor: [1.0, 1.0, 1.0, 1.0],
    baseColorTexture: {
      index: tapeteTexIdx,
      texCoord: 0
    },
    metallicFactor: 0.05,
    roughnessFactor: 0.85
  }
});
console.log(`  ✓ Material "${gltf.materials[tapeteMatIdx].name}" creado (índice ${tapeteMatIdx})`);

// Modificar el disco circular central (nodo 838 en v7, Mesh_63.011)
// Mesh 703 tiene UVs concéntricas perfectas [0, 1] x [0, 1] centradas en (0.5, 0.5)
const tapeteNodeIdx = 838;
const tapeteNode = gltf.nodes[tapeteNodeIdx];
tapeteNode.name = 'tapete_central_wixarika';
// Escalar de R = 2.2m a R = 2.50m para llenar con precisión el círculo interior hasta la cenefa de madera y chaquira
const scaleFactor = 2.50 / 2.20;
tapeteNode.scale = [scaleFactor, scaleFactor, 1.0];
tapeteNode.translation = [0.0, 0.0075, 0.0];

const tapeteMesh = gltf.meshes[tapeteNode.mesh];
tapeteMesh.name = 'mesh_tapete_central_wixarika';
tapeteMesh.primitives[0].material = tapeteMatIdx;
console.log(`  ✓ Nodo "${tapeteNode.name}" configurado a R = 2.50m (diámetro 5.0m)`);

// Limpiar los elementos geométricos anteriores del interior del círculo (estrellas y rombos sobrepuestos)
// Nodos a remover de grupo_suelo:
// - 837 (Mesh_62.011, anillo turquesa interior que tapaba el borde)
// - 839 a 848 (Mesh_64.011 a Mesh_73.011, pétalos de estrella, rombos y centro)
const nodesToRemove = new Set([837, 839, 840, 841, 842, 843, 844, 845, 846, 847, 848]);
const sueloNode = gltf.nodes.find(n => n.name === 'grupo_suelo');
if (sueloNode && sueloNode.children) {
  const prevCount = sueloNode.children.length;
  sueloNode.children = sueloNode.children.filter(cIdx => !nodesToRemove.has(cIdx));
  console.log(`  ✓ Contenido geométrico anterior del círculo removido (${prevCount - sueloNode.children.length} elementos eliminados de grupo_suelo)`);
  console.log(`  ✓ El tapete queda limpio y completamente visible en el suelo concéntrico.`);
}

// 3. Serializar y ensamblar nuevo GLB binario
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

// 4. Guardar archivos de salida v8
const publicV8Path = path.resolve('public', 'museo_wixarika_v8.glb');
fs.writeFileSync(publicV8Path, outGlb);
console.log(`\n✓ Archivo GLB v8 guardado en: ${publicV8Path} (${(outGlb.length / 1024).toFixed(2)} KB)`);

const refV8Path = path.resolve('imagenesRef', 'museo_wixarika_v8.glb');
fs.writeFileSync(refV8Path, outGlb);
console.log(`✓ Copia de respaldo v8 guardada en: ${refV8Path}`);

const publicBasePath = path.resolve('public', 'museo_wixarika_base.glb');
fs.writeFileSync(publicBasePath, outGlb);
console.log(`✓ Archivo GLB principal (base) actualizado a v8: ${publicBasePath}`);

const refBasePath = path.resolve('imagenesRef', 'museo_wixarika_base.glb');
fs.writeFileSync(refBasePath, outGlb);
console.log(`✓ Respaldo base actualizado a v8 en: ${refBasePath}`);

console.log('\n================================================================');
console.log('  PROCESO DE GENERACIÓN V8 FINALIZADO CON ÉXITO');
console.log('================================================================');
