// ==============================================================================
// Generador / Exportador Oficial: Museo Virtual Wixárika - Versión 9 (v9)
// Basado directamente en la versión v8 (tapete sagrado + letreros centrados)
// Modificaciones v9:
// 1. Integración de la obra sagrada circular de Tatewari en el óculo central del techo
// 2. Fondo removido con máscara alfa antialiased perfecta (quedando solo el disco sagrado)
// Cumple con la especificación formal: specs/museo_wixarika_spec_v9.yaml
// ==============================================================================

import fs from 'fs';
import path from 'path';

console.log('================================================================');
console.log('  GENERANDO MODELO 3D: SALA DE MUSEO WIXÁRIKA V9 (.GLB)');
console.log('  Base: Museo Wixárika v8 (Blender v6 + subtítulos + tapete)');
console.log('  Open Spec: specs/museo_wixarika_spec_v9.yaml');
console.log('================================================================\n');

const inputV8Path = path.resolve('public', 'museo_wixarika_v8.glb');
if (!fs.existsSync(inputV8Path)) {
  console.error(`Error: No se encontró el archivo base v8 en: ${inputV8Path}`);
  process.exit(1);
}

const rawGlb = fs.readFileSync(inputV8Path);

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

console.log(`✓ Archivo base v8 cargado correctamente (${(rawGlb.length / 1024).toFixed(2)} KB)`);

// ------------------------------------------------------------------------------
// MODIFICACIÓN v9: OBRA CIRCULAR DE TATEWARI EN EL ÓCULO CENITAL DEL TECHO
// ------------------------------------------------------------------------------
console.log('\n--- Integración de Tatewari en la superficie circular del techo ---');

const tatewariOculoImgPath = path.resolve('public', 'texturas', 'tatewari_oculo_techo.png');
if (!fs.existsSync(tatewariOculoImgPath)) {
  console.error(`Error: No se encontró la textura de Tatewari para el óculo en: ${tatewariOculoImgPath}`);
  process.exit(1);
}
const tatewariOculoBuf = fs.readFileSync(tatewariOculoImgPath);
console.log(`  • Imagen de Tatewari cargada: ${(tatewariOculoBuf.length / 1024).toFixed(2)} KB (1024x1024 RGBA PNG sin fondo)`);

// Inyectar la textura en el búfer binario con alineación a 4 bytes
const padBefore = (4 - (currentBinBytes.length % 4)) % 4;
if (padBefore > 0) {
  currentBinBytes = Buffer.concat([currentBinBytes, Buffer.alloc(padBefore, 0)]);
}

const tatewariByteOffset = currentBinBytes.length;
const tatewariByteLength = tatewariOculoBuf.length;
const binPadding = (4 - (tatewariByteLength % 4)) % 4;
currentBinBytes = Buffer.concat([currentBinBytes, tatewariOculoBuf, Buffer.alloc(binPadding, 0)]);

gltf.bufferViews = gltf.bufferViews || [];
const tatewariBvIdx = gltf.bufferViews.length;
gltf.bufferViews.push({
  buffer: 0,
  byteOffset: tatewariByteOffset,
  byteLength: tatewariByteLength
});

gltf.images = gltf.images || [];
const tatewariImgIdx = gltf.images.length;
gltf.images.push({
  bufferView: tatewariBvIdx,
  mimeType: 'image/png',
  name: 'tex_tatewari_oculo_techo'
});

gltf.textures = gltf.textures || [];
const tatewariTexIdx = gltf.textures.length;
gltf.textures.push({
  source: tatewariImgIdx
});

// Crear el material PBR para la Nierika circular de Tatewari en el óculo
gltf.materials = gltf.materials || [];
const tatewariMatIdx = gltf.materials.length;
gltf.materials.push({
  name: 'mat_tatewari_oculo_techo',
  pbrMetallicRoughness: {
    baseColorFactor: [1.0, 1.0, 1.0, 1.0],
    baseColorTexture: {
      index: tatewariTexIdx,
      texCoord: 0
    },
    metallicFactor: 0.05,
    roughnessFactor: 0.65
  },
  alphaMode: 'MASK',
  alphaCutoff: 0.5,
  doubleSided: true
});
console.log(`  ✓ Material "${gltf.materials[tatewariMatIdx].name}" creado (índice ${tatewariMatIdx})`);

// Modificar el nodo del óculo central (nodo 941 en v8, tragaluz_oculo_cenital)
const oculoNodeIdx = gltf.nodes.findIndex(n => n.name === 'tragaluz_oculo_cenital');
if (oculoNodeIdx === -1) {
  console.error('Error: No se encontró el nodo tragaluz_oculo_cenital');
  process.exit(1);
}

const oculoNode = gltf.nodes[oculoNodeIdx];
oculoNode.name = 'tatewari_oculo_cenital';
// Ajuste de escala a 1.02 para que encaje a ras del anillo de madera del óculo (radio 0.97m)
oculoNode.scale = [1.02, 1.02, 1.0];
// Posición en Y = 5.42m (ligeramente por debajo del domo para máxima nitidez visual)
oculoNode.translation = [0.0, 5.42, 0.0];

const oculoMesh = gltf.meshes[oculoNode.mesh];
oculoMesh.name = 'mesh_tatewari_oculo_cenital';
oculoMesh.primitives[0].material = tatewariMatIdx;
console.log(`  ✓ Nodo "${oculoNode.name}" (índice ${oculoNodeIdx}) actualizado con la obra circular de Tatewari`);
console.log(`    Posición en el techo: ${JSON.stringify(oculoNode.translation)}`);
console.log(`    Rotación de visión: ${JSON.stringify(oculoNode.rotation)} (Normal apuntando hacia abajo)`);

// ------------------------------------------------------------------------------
// SERIALIZAR Y ENSAMBLAR NUEVO GLB BINARIO (v9)
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

// Guardar salidas oficiales v9
const publicV9Path = path.resolve('public', 'museo_wixarika_v9.glb');
fs.writeFileSync(publicV9Path, outGlb);
console.log(`\n✓ Archivo GLB v9 guardado en: ${publicV9Path} (${(outGlb.length / 1024).toFixed(2)} KB)`);

const refV9Path = path.resolve('imagenesRef', 'museo_wixarika_v9.glb');
fs.writeFileSync(refV9Path, outGlb);
console.log(`✓ Copia de respaldo v9 guardada en: ${refV9Path}`);

const publicBasePath = path.resolve('public', 'museo_wixarika_base.glb');
fs.writeFileSync(publicBasePath, outGlb);
console.log(`✓ Archivo GLB principal (base) actualizado a v9: ${publicBasePath}`);

const refBasePath = path.resolve('imagenesRef', 'museo_wixarika_base.glb');
fs.writeFileSync(refBasePath, outGlb);
console.log(`✓ Respaldo base actualizado a v9 en: ${refBasePath}`);

console.log('\n================================================================');
console.log('  PROCESO DE GENERACIÓN V9 FINALIZADO CON ÉXITO');
console.log('================================================================');
