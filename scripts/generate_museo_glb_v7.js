// ==============================================================================
// Generador / Exportador Oficial: Museo Virtual Wixárika - Versión 7 (v7)
// Basado fiel y directamente en la versión v6 curada manualmente en Blender
// Cumple con la especificación formal: specs/museo_wixarika_spec_v7.yaml
// ==============================================================================

import fs from 'fs';
import path from 'path';

console.log('================================================================');
console.log('  GENERANDO MODELO 3D: SALA DE MUSEO WIXÁRIKA V7 (.GLB)');
console.log('  Base: Museo Wixárika v6 (Curaduría manual en Blender)');
console.log('  Open Spec: specs/museo_wixarika_spec_v7.yaml');
console.log('================================================================\n');

const inputV6Path = path.resolve('public', 'museo_wixarika_v6.glb');
if (!fs.existsSync(inputV6Path)) {
  console.error(`Error: No se encontró el archivo base v6 en: ${inputV6Path}`);
  process.exit(1);
}

const rawGlb = fs.readFileSync(inputV6Path);

// 1. Leer encabezados GLB
const magic = rawGlb.readUInt32LE(0);
const version = rawGlb.readUInt32LE(4);
const totalLen = rawGlb.readUInt32LE(8);
const chunk0Len = rawGlb.readUInt32LE(12);
const chunk0Type = rawGlb.readUInt32LE(16);

if (magic !== 0x46546C67) {
  console.error('Error: El archivo no es un GLB válido (magic !== 0x46546C67)');
  process.exit(1);
}

const jsonBuf = rawGlb.subarray(20, 20 + chunk0Len);
const gltf = JSON.parse(jsonBuf.toString('utf8'));

const chunk1Offset = 20 + chunk0Len;
const chunk1Len = rawGlb.readUInt32LE(chunk1Offset);
const binBytes = rawGlb.subarray(chunk1Offset + 8, chunk1Offset + 8 + chunk1Len);

console.log(`✓ Archivo base v6 cargado correctamente (${(rawGlb.length / 1024).toFixed(2)} KB)`);
console.log(`  • Nodos totales: ${gltf.nodes.length}`);
console.log(`  • Meshes totales: ${gltf.meshes.length}`);
console.log(`  • Materiales totales: ${gltf.materials.length}`);
console.log(`  • Texturas embebidas: ${gltf.textures.length}`);

// 2. Modificación solicitada: Letras subtítulo debajo del nombre de cada deidad
//    Cambiar el material de las letras de blanco/marfil a negro puro (#000000)
//    SIN alterar ningún otro elemento ni geometría del modelo.
const targetMatIdx = gltf.materials.findIndex(m => m.name === 'mat_texto_marfil');
if (targetMatIdx === -1) {
  console.warn('Aviso: No se encontró material con nombre exacto "mat_texto_marfil", buscando por índice 11...');
}
const matIdx = targetMatIdx !== -1 ? targetMatIdx : 11;
const targetMat = gltf.materials[matIdx];

console.log(`\nModificando material de subtítulos de deidades (índice ${matIdx}, nombre previo: "${targetMat.name}"):`);
const prevColor = targetMat.pbrMetallicRoughness?.baseColorFactor;
console.log(`  • Color previo: ${JSON.stringify(prevColor)} (blanco / marfil)`);

targetMat.name = 'mat_texto_negro';
targetMat.pbrMetallicRoughness = targetMat.pbrMetallicRoughness || {};
targetMat.pbrMetallicRoughness.baseColorFactor = [0.0, 0.0, 0.0, 1.0]; // Negro puro
targetMat.pbrMetallicRoughness.roughnessFactor = 0.5;
targetMat.pbrMetallicRoughness.metallicFactor = 0.0;

console.log(`  • Color nuevo:  ${JSON.stringify(targetMat.pbrMetallicRoughness.baseColorFactor)} (negro puro #000000)`);
console.log(`  • Nuevo nombre: "${targetMat.name}"`);

// 3. Serializar JSON y reensamblar GLB binario
const newJsonStr = JSON.stringify(gltf);
const newJsonBuf = Buffer.from(newJsonStr, 'utf8');
const jsonPadding = (4 - (newJsonBuf.length % 4)) % 4;
const paddedJsonBuf = Buffer.concat([newJsonBuf, Buffer.alloc(jsonPadding, 0x20)]);

const newTotalLen = 12 + 8 + paddedJsonBuf.length + 8 + binBytes.length;
const outGlb = Buffer.alloc(newTotalLen);

// Encabezado GLB (12 bytes)
outGlb.writeUInt32LE(0x46546C67, 0); // 'glTF'
outGlb.writeUInt32LE(version, 4);    // versión (2)
outGlb.writeUInt32LE(newTotalLen, 8); // longitud total

// Chunk 0: JSON
outGlb.writeUInt32LE(paddedJsonBuf.length, 12);
outGlb.writeUInt32LE(0x4E4F534A, 16); // 'JSON'
paddedJsonBuf.copy(outGlb, 20);

// Chunk 1: BIN (idéntico byte-a-byte al de v6 exportado de Blender)
const newChunk1Pos = 20 + paddedJsonBuf.length;
outGlb.writeUInt32LE(binBytes.length, newChunk1Pos);
outGlb.writeUInt32LE(0x004E4942, newChunk1Pos + 4); // 'BIN\0'
binBytes.copy(outGlb, newChunk1Pos + 8);

// 4. Guardar salidas v7
const publicV7Path = path.resolve('public', 'museo_wixarika_v7.glb');
fs.writeFileSync(publicV7Path, outGlb);
console.log(`\n✓ Archivo GLB v7 guardado en: ${publicV7Path} (${(outGlb.length / 1024).toFixed(2)} KB)`);

const refV7Path = path.resolve('imagenesRef', 'museo_wixarika_v7.glb');
fs.writeFileSync(refV7Path, outGlb);
console.log(`✓ Copia de respaldo v7 guardada en: ${refV7Path}`);

// 5. Actualizar el archivo base principal para que la app cargue v7 de inmediato
const publicBasePath = path.resolve('public', 'museo_wixarika_base.glb');
fs.writeFileSync(publicBasePath, outGlb);
console.log(`✓ Archivo GLB principal (base) actualizado a v7: ${publicBasePath}`);

const refBasePath = path.resolve('imagenesRef', 'museo_wixarika_base.glb');
fs.writeFileSync(refBasePath, outGlb);
console.log(`✓ Respaldo base actualizado a v7 en: ${refBasePath}`);

console.log('\n================================================================');
console.log('  PROCESO DE GENERACIÓN V7 FINALIZADO CON ÉXITO');
console.log('================================================================');
