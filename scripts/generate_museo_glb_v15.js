#!/usr/bin/env node
/**
 * Generador de Sala de Museo Wixárika v15 (.GLB)
 * Genera public/museo_wixarika_v15.glb a partir de public/museo_wixarika_v14.glb
 *
 * Arquitectura Monumental Restaurada:
 * - Altura de paredes y elevación del techo cónico:
 *   En la base original v14 se habían omitido las paredes elevadas a 5.40m y el techo a 7.00m.
 *   Con DELTA_Y = +1.60m:
 *   • Muro cilíndrico (mat_muro_adobe.024, color café bajito): pasa de 3.80m a 5.40m de altura vertical.
 *   • Cornisa superior de madera: se eleva a Y=5.30m (sellando a 5.40m).
 *   • Cenefa sagrada Wixárika 360: se eleva a Y=5.10m (span Y=4.94m a 5.26m).
 *   • Techo cónico completo (grupo_techo_domo, color café oscuro): se eleva +1.60m,
 *     asentando su borde perimetral en Y=5.40m y su óculo cenital a Y=7.00m.
 *   • Las 8 pilastras arquitectónicas estiran sus fustes a 5.40m y capiteles a 5.25m.
 *   • Los nichos posteriores (Deidades, Fiestas, Gastronomía) cubren uniformemente de Y=0.10m a 5.40m.
 *   • Los letreros flotantes de sección se posicionan a Y=4.10m (o 4.40m) despejando la visual hacia los cuadros.
 *
 * Resultado:
 *   Todos los cuadros (hasta Y=3.951m) y sus luminarias (hasta Y=4.334m) quedan
 *   centrados y contenidos 100% dentro del lienzo liso de color café bajito (adobe),
 *   con más de 1.0m de holgura visual respecto al techo café oscuro.
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

console.log('=== Generando Museo Wixárika v15 (Techo Elevado a 7.0m y Paredes a 5.4m) ===');
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

// Incremento de elevación monumental (5.40m de pared, 7.00m de techo en el óculo)
const DELTA_Y = 1.60;
const H_ORIG = 3.80;
const H_NEW = H_ORIG + DELTA_Y; // 5.40m
const SCALE_WALL_Y = H_NEW / H_ORIG; // 5.40 / 3.80 ≈ 1.4210526

console.log(`\nAplicando elevación monumental: +${DELTA_Y}m (Muro de ${H_ORIG}m a ${H_NEW}m, Techo en ápice a ${(5.40 + DELTA_Y).toFixed(2)}m)`);

// --------------------------------------------------------------------------
// 1. Muro Cilíndrico de Adobe (Color Café Bajito)
// --------------------------------------------------------------------------
// Nodo 812: muro_cilindrico (Mesh 585, mat_muro_adobe.024)
// Rango original Y: [-1.90, +1.90] centrado en Y=1.90 -> [0.00, 3.80]
// Nuevo rango: [0.00, 5.40] centrado en Y = 2.70
nodes[812].scale = [1.0, SCALE_WALL_Y, 1.0];
nodes[812].translation = [0.0, H_NEW / 2.0, 0.0];
console.log(`✓ Muro cilíndrico (812): Altura ampliada a ${H_NEW.toFixed(2)}m (Y=0.00m a ${H_NEW.toFixed(2)}m)`);

// --------------------------------------------------------------------------
// 2. Cornisa de Madera Superior y Cenefa Sagrada
// --------------------------------------------------------------------------
// Nodo 730: cornisa_madera (Mesh 511, mat_madera_oscura.036)
// Originalmente en Y=3.70m (tope superior en 3.80m) -> Ahora en Y=5.30m (tope en 5.40m)
nodes[730].translation = [0.0, 3.70 + DELTA_Y, 0.0];
console.log(`✓ Cornisa de madera (730): Elevada a Y=${(3.70 + DELTA_Y).toFixed(2)}m (tope en ${H_NEW.toFixed(2)}m)`);

// Nodo 729: cenefa_sagrada_360 (Contiene los 34 elementos decorativos de la cenefa)
// Originalmente en Y=3.50m (span 3.34m a 3.66m) -> Ahora en Y=5.10m (span 4.94m a 5.26m)
nodes[729].translation = [0.0, DELTA_Y, 0.0];
console.log(`✓ Cenefa sagrada 360 (729): Elevada a Y=${(3.50 + DELTA_Y).toFixed(2)}m (span ${(3.34 + DELTA_Y).toFixed(2)}m a ${(3.66 + DELTA_Y).toFixed(2)}m)`);

// --------------------------------------------------------------------------
// 3. Estructura Completa del Techo Cónico (Color Café Oscuro)
// --------------------------------------------------------------------------
// Nodo 979: grupo_techo_domo (Contiene las 89 piezas del techo, vigas y domo)
// El borde exterior del techo reposa exactamente sobre el nuevo tope del muro (5.40m)
// y el óculo cenital de Tatewari alcanza Y=7.00m
if (!nodes[979].translation) {
  nodes[979].translation = [0.0, DELTA_Y, 0.0];
} else {
  nodes[979].translation[1] += DELTA_Y;
}
console.log(`✓ Techo cónico (979): Elevado uniformemente +${DELTA_Y.toFixed(2)}m (borde base en ${H_NEW.toFixed(2)}m, ápice en ${(5.40 + DELTA_Y).toFixed(2)}m)`);

// --------------------------------------------------------------------------
// 4. Las 8 Pilastras Arquitectónicas Perimetrales
// --------------------------------------------------------------------------
const pilastrasRootIds = [740, 750, 760, 770, 780, 790, 800, 810];
pilastrasRootIds.forEach((pId) => {
  const pNode = nodes[pId];
  if (!pNode.children || pNode.children.length < 2) return;
  const shaftId = pNode.children[0];
  const capitalId = pNode.children[1];

  // Fuste de la pilastra
  nodes[shaftId].scale = [1.0, SCALE_WALL_Y, 1.0];
  nodes[shaftId].translation = [0.0, H_NEW / 2.0, 0.0];

  // Capitel / remate superior
  nodes[capitalId].translation = [0.0, 3.65 + DELTA_Y, 0.0];
});
console.log(`✓ 8 Pilastras perimetrales: Fustes ampliados a ${H_NEW.toFixed(2)}m y capiteles elevados a ${(3.65 + DELTA_Y).toFixed(2)}m`);

// --------------------------------------------------------------------------
// 5. Muros Curvos de Fondo de Nichos
// --------------------------------------------------------------------------
// Cubren desde Y=0.10m hasta el remate superior a Y=5.40m
const NICHO_CENTER_Y = (H_NEW + 0.10) / 2.0; // 2.75m
const NICHO_HEIGHT = H_NEW - 0.10; // 5.30m

// Nodo 247: Mesh_369.007 (Deidades, semi-altura 1.40m)
nodes[247].translation = [0.0, NICHO_CENTER_Y, 0.0];
nodes[247].scale = [1.0, NICHO_HEIGHT / 2.80, 1.0];

// Nodo 477: Mesh_830.006 (Fiestas, semi-altura 1.25m)
nodes[477].translation = [0.0, NICHO_CENTER_Y, 0.0];
nodes[477].scale = [1.0, NICHO_HEIGHT / 2.50, 1.0];

// Nodo 559: Mesh_711.006 (Gastronomía, semi-altura 1.25m)
nodes[559].translation = [0.0, NICHO_CENTER_Y, 0.0];
nodes[559].scale = [1.0, NICHO_HEIGHT / 2.50, 1.0];
console.log(`✓ Nichos de fondo (247, 477, 559): Adaptados para cubrir uniformemente de Y=0.10m a ${H_NEW.toFixed(2)}m`);

// --------------------------------------------------------------------------
// 6. Letreros de Sección Flotantes
// --------------------------------------------------------------------------
// Suspendidos de las vigas del techo con visual despejada hacia las obras
const sectionSignIds = [1001, 1027, 1051, 1077];
sectionSignIds.forEach((signId) => {
  nodes[signId].translation[1] = 4.25;
});
console.log('✓ Letreros de sección (1001, 1027, 1051, 1077): Posicionados a Y=4.25m con cables acoplados al techo');

// --------------------------------------------------------------------------
// 7. Empaquetado Final del GLB v15
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
console.log(`\n¡Listo! Archivo consecutivo generado: ${outputPath} (${sizeMb} MB)`);
