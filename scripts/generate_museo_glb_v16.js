#!/usr/bin/env node
/**
 * Generador de Sala de Museo Wixárika v16 (.GLB)
 * Genera public/museo_wixarika_v16.glb a partir de public/museo_wixarika_v15.glb
 * (conservando v14 y v15 intactos).
 *
 * Implementa la Propuesta 1 en la sección de Bienvenida / Kalihuey (+Z),
 * ubicada detrás del menú flotante (Z = 3.75m) sin ninguna colisión:
 *
 * 1. Reorganización de pilastras de Bienvenida (+Z):
 *   • Oculta la pilastra central (estela_pilastra_1 en +90°) para despejar el portal.
 *   • Agrega 2 pilastras simétricas a +75° y +105° (altura completa 5.40m con capitel
 *     turquesa y base de madera) que dividen el cuadrante en 3 vanos arquitectónicos de 30°.
 *
 * 2. Vano Central (+90°): Portal Ceremonial del Kalihuey + Logo Institucional ITT:
 *   • Marco arquitectónico en cantera labrada con bases, cornisa de madera oscura y filetes dorados.
 *   • Puerta doble ceremonial en madera oscura (mat_madera_oscura.036) con filetes
 *     geométricos en turquesa y oro ceremonial más manijas verticales doradas.
 *   • Encima del dintel: logo oficial del Instituto Tecnológico de Tepic (ITT) a escala compacta.
 *
 * 3. Vano Izquierdo (+60°, izquierda desde el centro mirando a +Z):
 *   • Logo oficial del CECAN Nayarit en la parte superior del muro.
 *   • Cuadro enmarcado en madera oscura y oro con el mapa ilustrado de Nayarit
 *     (public/texturas/mapa_nayarit_bienvenida.jpg, únicamente con el texto "NAYARIT")
 *     y banca baja de madera oscura junto al zoclo (sin placa dorada inferior).
 *
 * 4. Vano Derecho (+120°, derecha desde el centro mirando a +Z):
 *   • Logo mejorado sin fondo de la Biblioteca Pública Central Estatal Solón Argüello arriba.
 *   • Cuadro gemelo en cantera con la palabra 3D monumental "BIENVENIDOS"
 *     enmarcada por filetes dorados con rombo turquesa arriba y abajo,
 *     y banca baja de madera oscura simétrica (sin placa dorada inferior).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const inputPath = path.resolve(rootDir, 'public', 'museo_wixarika_v15.glb');
const outputPath = path.resolve(rootDir, 'public', 'museo_wixarika_v16.glb');
const mapTexturePath = path.resolve(rootDir, 'public', 'texturas', 'mapa_nayarit_bienvenida.jpg');
const ittLogoPath = path.resolve(rootDir, 'public', 'texturas', 'logo_itt_bienvenida.png');
const cecanLogoPath = path.resolve(rootDir, 'public', 'texturas', 'logo_cecan_bienvenida.png');
const solonLogoPath = path.resolve(rootDir, 'public', 'texturas', 'logo_solon_arguello_bienvenida.png');

for (const reqPath of [inputPath, mapTexturePath, ittLogoPath, cecanLogoPath, solonLogoPath]) {
  if (!fs.existsSync(reqPath)) {
    console.error(`Error: No se encontró el archivo requerido en ${reqPath}`);
    process.exit(1);
  }
}

console.log('=== Generando Museo Wixárika v16 (Propuesta 1 en Bienvenida / Kalihuey) ===');
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
// Utilidades para inyectar BufferGeometry y texturas al GLB binario
// --------------------------------------------------------------------------
const appendRawBytes = (buf) => {
  const alignPad = (4 - (binBuffer.length % 4)) % 4;
  if (alignPad > 0) {
    binBuffer = Buffer.concat([binBuffer, Buffer.alloc(alignPad)]);
  }
  const offset = binBuffer.length;
  binBuffer = Buffer.concat([binBuffer, buf]);
  return { offset, length: buf.length };
};

const appendBufferData = (typedArray) => {
  const newBuf = Buffer.from(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength);
  return appendRawBytes(newBuf);
};

/**
 * Inyecta una BufferGeometry de Three.js como nueva malla en el GLB.
 * flipVForGltf: invierte v = 1 - v para alinear UVs de Three.js con la convención
 * top-left (0,0) de glTF 2.0 cuando se usan texturas 2D.
 */
const addGeometryMeshToGltf = (rawGeom, materialIdx, meshName, { flipVForGltf = false } = {}) => {
  const geom = rawGeom.index ? rawGeom.toNonIndexed() : rawGeom.clone();
  if (!geom.attributes.normal) {
    geom.computeVertexNormals();
  }
  if (flipVForGltf && geom.attributes.uv) {
    const uvArr = geom.attributes.uv.array;
    for (let i = 1; i < uvArr.length; i += 2) {
      uvArr[i] = 1.0 - uvArr[i];
    }
    geom.attributes.uv.needsUpdate = true;
  }
  geom.computeBoundingBox();
  const bb = geom.boundingBox;

  const posAttr = geom.attributes.position;
  const normAttr = geom.attributes.normal;
  const uvAttr = geom.attributes.uv;
  const vertCount = posAttr.count;

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

const embedImageMaterial = (
  filePath,
  mimeType,
  texName,
  matName,
  { alphaMode = null, roughnessFactor = 0.72, doubleSided = false } = {}
) => {
  const imgBytes = fs.readFileSync(filePath);
  const imgSlice = appendRawBytes(imgBytes);
  const imgBvIdx = gltf.bufferViews.length;
  gltf.bufferViews.push({
    buffer: 0,
    byteOffset: imgSlice.offset,
    byteLength: imgSlice.length
  });

  const imgIdx = gltf.images.length;
  gltf.images.push({
    name: texName,
    mimeType,
    bufferView: imgBvIdx
  });

  const texIdx = gltf.textures.length;
  gltf.textures.push({
    sampler: 0,
    source: imgIdx
  });

  const matIdx = gltf.materials.length;
  const matDef = {
    name: matName,
    pbrMetallicRoughness: {
      baseColorTexture: { index: texIdx },
      metallicFactor: alphaMode ? 0.0 : 0.05,
      roughnessFactor
    }
  };
  if (alphaMode) matDef.alphaMode = alphaMode;
  if (doubleSided) matDef.doubleSided = true;
  gltf.materials.push(matDef);

  return { matIdx, texIdx, imgIdx };
};

const lookAtOriginQuat = (x, y, z) => {
  const dummy = new THREE.Object3D();
  dummy.position.set(x, y, z);
  dummy.lookAt(0, y, 0);
  return [dummy.quaternion.x, dummy.quaternion.y, dummy.quaternion.z, dummy.quaternion.w];
};

// Materiales oficiales existentes en el GLB
const MAT_MARCO_ORO = 1;         // mat_kauyumari_oro.044
const MAT_MADERA_OSCURA = 3;     // mat_madera_oscura.036
const MAT_TURQUESA = 4;          // mat_medallon_turquesa.045
const MAT_CANTERA = 9;           // mat_letrero_cantera.021
const MAT_TEXTO_ORO_3D = 10;     // mat_texto_oro_3d.021 (color y acabado oro idéntico a las deidades)
const MAT_OCULO_TECHO = 82;      // mat_tatewari_oculo_techo.010 (imagen circular del techo)
const MAT_MADERA_PROFUNDA = 84;  // mat_letrero_madera.021

// Asegurar que cuadrante_bienvenida (nodo 0) tenga arreglo children
if (!nodes[0].children) {
  nodes[0].children = [];
}

// ==========================================================================
// PARTE 1: REORGANIZAR PILASTRAS EN BIENVENIDA (+Z) PARA 3 VANOS SIMÉTRICOS
// ==========================================================================
console.log('\n[1] Reorganizando pilastras de Bienvenida (+75° y +105°) para despejar el portal central...');

// Ocultar la pilastra central (estela_pilastra_1, nodo 740 en +90°)
nodes[740].scale = [0.0, 0.0, 0.0];
if (nodes[814]?.children) {
  nodes[814].children = nodes[814].children.filter((c) => c !== 740);
}

// Crear 2 pilastras arquitectónicas simétricas en +75° (izq. del portal) y +105° (der. del portal)
// Reutilizan exactamente las mallas de fuste (512), capitel turquesa (513) y base (514) de estela_pilastra_1
const SCALE_WALL_Y = 5.40 / 3.80;
const R_PILASTRA = 7.90;
const flankingPilasters = [
  { name: 'pilastra_bienvenida_izquierda', deg: 75.0 },
  { name: 'pilastra_bienvenida_derecha',   deg: 105.0 }
];

for (const pil of flankingPilasters) {
  const rad = (pil.deg * Math.PI) / 180;
  const px = R_PILASTRA * Math.cos(rad);
  const pz = R_PILASTRA * Math.sin(rad);
  const quat = lookAtOriginQuat(px, 0, pz);

  const shaftIdx = nodes.length;
  nodes.push({
    name: `${pil.name}_fuste`,
    mesh: 512,
    translation: [0.0, 2.70, 0.0],
    scale: [1.0, SCALE_WALL_Y, 1.0]
  });

  const capitalIdx = nodes.length;
  nodes.push({
    name: `${pil.name}_capitel`,
    mesh: 513,
    translation: [0.0, 5.25, 0.0]
  });

  const baseIdx = nodes.length;
  nodes.push({
    name: `${pil.name}_base`,
    mesh: 514,
    translation: [0.0, 0.15, 0.0]
  });

  const pilRootIdx = nodes.length;
  nodes.push({
    name: pil.name,
    translation: [px, 0.0, pz],
    rotation: quat,
    children: [shaftIdx, capitalIdx, baseIdx]
  });

  nodes[0].children.push(pilRootIdx);
}
console.log('✓ Pilastras flanqueantes creadas en +75° y +105° (3 vanos limpios de 30° cada uno).');

// ==========================================================================
// PARTE 2: PORTAL CEREMONIAL DEL KALIHUEY + MEDALLÓN CIRCULAR DEL TECHO (+90°)
// ==========================================================================
console.log('\n[2] Construyendo Portal Ceremonial del Kalihuey y Medallón Circular del Techo...');

// Material propio de cantera labrada con alto contraste frente al muro adobe claro (0.77,0.67,0.56)
// y frente a las hojas de madera oscura (0.047,0.017,0.007)
const MAT_PORTAL_CANTERA = gltf.materials.length;
gltf.materials.push({
  name: 'mat_portal_cantera_labrada',
  pbrMetallicRoughness: {
    baseColorFactor: [0.42, 0.32, 0.23, 1.0],
    metallicFactor: 0.04,
    roughnessFactor: 0.72
  }
});

const PORTAL_Z = 7.78;
const portalChildren = [];

// 2.1 Marco arquitectónico de cantera labrada (jambas + bases + dintel escalonado + filetes de contraste)
const { meshIdx: jambaMeshIdx } = addGeometryMeshToGltf(
  new THREE.BoxGeometry(0.30, 2.26, 0.22),
  MAT_PORTAL_CANTERA,
  'mesh_portal_jamba_cantera'
);
const { meshIdx: jambaBaseMeshIdx } = addGeometryMeshToGltf(
  new THREE.BoxGeometry(0.36, 0.22, 0.26),
  MAT_MADERA_OSCURA,
  'mesh_portal_jamba_base'
);
const { meshIdx: dintelMeshIdx } = addGeometryMeshToGltf(
  new THREE.BoxGeometry(2.74, 0.30, 0.26),
  MAT_PORTAL_CANTERA,
  'mesh_portal_dintel_cantera'
);
const { meshIdx: dintelCornisaMeshIdx } = addGeometryMeshToGltf(
  new THREE.BoxGeometry(2.84, 0.07, 0.29),
  MAT_MADERA_OSCURA,
  'mesh_portal_dintel_cornisa'
);
const { meshIdx: dintelFileteOroMeshIdx } = addGeometryMeshToGltf(
  new THREE.BoxGeometry(2.68, 0.028, 0.275),
  MAT_MARCO_ORO,
  'mesh_portal_dintel_filete_oro'
);
const { meshIdx: jambaPerfilOroMeshIdx } = addGeometryMeshToGltf(
  new THREE.BoxGeometry(0.026, 2.24, 0.235),
  MAT_MARCO_ORO,
  'mesh_portal_jamba_filete_oro'
);

const jambaIzqIdx = nodes.length;
nodes.push({ name: 'portal_jamba_izquierda', mesh: jambaMeshIdx, translation: [-1.11, 1.13, 0.02] });
portalChildren.push(jambaIzqIdx);

const jambaDerIdx = nodes.length;
nodes.push({ name: 'portal_jamba_derecha', mesh: jambaMeshIdx, translation: [1.11, 1.13, 0.02] });
portalChildren.push(jambaDerIdx);

const jambaBaseIzqIdx = nodes.length;
nodes.push({ name: 'portal_jamba_base_izquierda', mesh: jambaBaseMeshIdx, translation: [-1.11, 0.11, 0.03] });
portalChildren.push(jambaBaseIzqIdx);

const jambaBaseDerIdx = nodes.length;
nodes.push({ name: 'portal_jamba_base_derecha', mesh: jambaBaseMeshIdx, translation: [1.11, 0.11, 0.03] });
portalChildren.push(jambaBaseDerIdx);

const jambaOroIzqIdx = nodes.length;
nodes.push({ name: 'portal_jamba_oro_izquierda', mesh: jambaPerfilOroMeshIdx, translation: [-0.96, 1.13, 0.025] });
portalChildren.push(jambaOroIzqIdx);

const jambaOroDerIdx = nodes.length;
nodes.push({ name: 'portal_jamba_oro_derecha', mesh: jambaPerfilOroMeshIdx, translation: [0.96, 1.13, 0.025] });
portalChildren.push(jambaOroDerIdx);

const dintelIdx = nodes.length;
nodes.push({ name: 'portal_dintel_superior', mesh: dintelMeshIdx, translation: [0.0, 2.39, 0.04] });
portalChildren.push(dintelIdx);

const dintelCornisaIdx = nodes.length;
nodes.push({ name: 'portal_dintel_cornisa_madera', mesh: dintelCornisaMeshIdx, translation: [0.0, 2.555, 0.05] });
portalChildren.push(dintelCornisaIdx);

const dintelOroIdx = nodes.length;
nodes.push({ name: 'portal_dintel_filete_oro', mesh: dintelFileteOroMeshIdx, translation: [0.0, 2.255, 0.045] });
portalChildren.push(dintelOroIdx);

// 2.2 Puerta doble ceremonial en madera oscura con incrustaciones turquesa y oro
const { meshIdx: hojaPuertaMeshIdx } = addGeometryMeshToGltf(
  new THREE.BoxGeometry(0.94, 2.24, 0.08),
  MAT_MADERA_OSCURA,
  'mesh_portal_hoja_puerta'
);
const { meshIdx: juntaCentralMeshIdx } = addGeometryMeshToGltf(
  new THREE.BoxGeometry(0.04, 2.24, 0.06),
  MAT_MADERA_PROFUNDA,
  'mesh_portal_junta_central'
);
const { meshIdx: manijaOroMeshIdx } = addGeometryMeshToGltf(
  new THREE.BoxGeometry(0.032, 0.34, 0.045),
  MAT_MARCO_ORO,
  'mesh_portal_manija_oro'
);

const hojaIzqIdx = nodes.length;
nodes.push({ name: 'portal_hoja_izquierda', mesh: hojaPuertaMeshIdx, translation: [-0.49, 1.12, -0.01] });
portalChildren.push(hojaIzqIdx);

const hojaDerIdx = nodes.length;
nodes.push({ name: 'portal_hoja_derecha', mesh: hojaPuertaMeshIdx, translation: [0.49, 1.12, -0.01] });
portalChildren.push(hojaDerIdx);

const juntaIdx = nodes.length;
nodes.push({ name: 'portal_junta_central', mesh: juntaCentralMeshIdx, translation: [0.0, 1.12, -0.01] });
portalChildren.push(juntaIdx);

const manijaIzqIdx = nodes.length;
nodes.push({ name: 'portal_manija_izquierda', mesh: manijaOroMeshIdx, translation: [-0.11, 1.02, 0.055] });
portalChildren.push(manijaIzqIdx);

const manijaDerIdx = nodes.length;
nodes.push({ name: 'portal_manija_derecha', mesh: manijaOroMeshIdx, translation: [0.11, 1.02, 0.055] });
portalChildren.push(manijaDerIdx);

// Helper para barras de incrustación geométrica (turquesa y oro) sobre cada hoja de puerta
const addDoorBar = (name, x1, y1, x2, y2, thickness, matIdx, zOff = 0.036) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);
  const { meshIdx } = addGeometryMeshToGltf(
    new THREE.BoxGeometry(len, thickness, 0.012),
    matIdx,
    `mesh_${name}`
  );
  const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), angle);
  const nIdx = nodes.length;
  nodes.push({
    name,
    mesh: meshIdx,
    translation: [(x1 + x2) / 2, (y1 + y2) / 2, zOff],
    rotation: [q.x, q.y, q.z, q.w]
  });
  portalChildren.push(nIdx);
};

// Patrón geométrico simétrico en ambas hojas (turquesa + oro, fiel a Propuesta 1)
for (const side of [-1, 1]) {
  const tag = side < 0 ? 'izq' : 'der';
  // Filete escalonado turquesa (sube junto al centro, quiebra hacia afuera y baja)
  addDoorBar(`portal_filete_turq_v1_${tag}`, side * 0.19, 1.38, side * 0.19, 2.22, 0.024, MAT_TURQUESA);
  addDoorBar(`portal_filete_turq_diag_${tag}`, side * 0.19, 1.38, side * 0.38, 1.18, 0.024, MAT_TURQUESA);
  addDoorBar(`portal_filete_turq_v2_${tag}`, side * 0.38, 0.56, side * 0.38, 1.18, 0.024, MAT_TURQUESA);
  addDoorBar(`portal_filete_turq_h1_${tag}`, side * 0.38, 0.56, side * 0.86, 0.56, 0.024, MAT_TURQUESA);

  // Filete interior dorado paralelo
  addDoorBar(`portal_filete_oro_v1_${tag}`, side * 0.25, 1.44, side * 0.25, 2.22, 0.018, MAT_MARCO_ORO);
  addDoorBar(`portal_filete_oro_diag_${tag}`, side * 0.25, 1.44, side * 0.44, 1.24, 0.018, MAT_MARCO_ORO);
  addDoorBar(`portal_filete_oro_v2_${tag}`, side * 0.44, 0.68, side * 0.44, 1.24, 0.018, MAT_MARCO_ORO);
  addDoorBar(`portal_filete_oro_h1_${tag}`, side * 0.44, 0.68, side * 0.86, 0.68, 0.018, MAT_MARCO_ORO);
  addDoorBar(`portal_filete_oro_h2_${tag}`, side * 0.44, 0.44, side * 0.86, 0.44, 0.018, MAT_MARCO_ORO);
}

// 2.3 Logo del Instituto Tecnológico de Tepic (ITT) encima del portal (más compacto que el medallón previo)
const { matIdx: MAT_LOGO_ITT } = embedImageMaterial(
  ittLogoPath,
  'image/png',
  'tex_logo_itt_bienvenida',
  'mat_logo_itt_bienvenida',
  { alphaMode: 'BLEND', roughnessFactor: 0.85, doubleSided: true }
);

const ITT_SIZE = 1.32; // 1.32m × 1.32m (más grande que 1.12m, pero más compacto que el medallón de 1.74m)
const ITT_Y = 3.74;    // Más arriba: borde inferior 3.08m (49cm sobre cornisa 2.59m), borde superior 4.40m (52cm bajo cenefa)
const { meshIdx: logoIttMeshIdx } = addGeometryMeshToGltf(
  new THREE.PlaneGeometry(ITT_SIZE, ITT_SIZE),
  MAT_LOGO_ITT,
  'mesh_logo_itt_bienvenida',
  { flipVForGltf: true }
);

const logoIttIdx = nodes.length;
nodes.push({
  name: 'logo_itt_portal_bienvenida',
  mesh: logoIttMeshIdx,
  translation: [0.0, ITT_Y, 0.03]
});
portalChildren.push(logoIttIdx);

const portalRootIdx = nodes.length;
nodes.push({
  name: 'portal_ceremonial_kalihuey',
  translation: [0.0, 0.0, PORTAL_Z],
  rotation: lookAtOriginQuat(0.0, 0.0, PORTAL_Z),
  children: portalChildren
});
nodes[0].children.push(portalRootIdx);
console.log('✓ Portal Ceremonial y Logo ITT (1.12m × 1.12m) instalados en +90°.');

// ==========================================================================
// PARTE 3: CUADROS LATERALES, LOGOS CECAN / SOLÓN ARGÜELLO Y BANCAS
// ==========================================================================
console.log('\n[3] Construyendo Mapa Nayarit + CECAN (+60°), Pamparios/Bienvenidos + Solón Argüello (+120°) y bancas...');

// Inyectar texturas del mapa de Nayarit y de los logos institucionales (CECAN y Solón Argüello sin fondo)
const { matIdx: MAT_MAPA_NAYARIT } = embedImageMaterial(
  mapTexturePath,
  'image/jpeg',
  'tex_mapa_nayarit_bienvenida',
  'mat_mapa_nayarit_bienvenida'
);
const { matIdx: MAT_LOGO_CECAN } = embedImageMaterial(
  cecanLogoPath,
  'image/png',
  'tex_logo_cecan_bienvenida',
  'mat_logo_cecan_bienvenida',
  { alphaMode: 'BLEND', roughnessFactor: 0.85, doubleSided: true }
);
const { matIdx: MAT_LOGO_SOLON } = embedImageMaterial(
  solonLogoPath,
  'image/png',
  'tex_logo_solon_arguello_bienvenida',
  'mat_logo_solon_arguello_bienvenida',
  { alphaMode: 'BLEND', roughnessFactor: 0.85, doubleSided: true }
);

// Cargar tipografía helvetiker_bold
const fontPath = path.resolve(rootDir, 'node_modules/three/examples/fonts/helvetiker_bold.typeface.json');
const fontData = JSON.parse(fs.readFileSync(fontPath, 'utf8'));
const font = new FontLoader().parse(fontData);

// Geometrías compartidas de marcos (sin placas doradas inferiores)
const FRAME_W = 2.46;
const FRAME_H = 1.66;
const GOLD_W = 2.34;
const GOLD_H = 1.54;
const CANVAS_W = 2.24;
const CANVAS_H = 1.46;

const { meshIdx: frameMaderaMeshIdx } = addGeometryMeshToGltf(
  new THREE.BoxGeometry(FRAME_W, FRAME_H, 0.052),
  MAT_MADERA_OSCURA,
  'mesh_bienvenida_marco_madera'
);
const { meshIdx: frameOroMeshIdx } = addGeometryMeshToGltf(
  new THREE.BoxGeometry(GOLD_W, GOLD_H, 0.056),
  MAT_MARCO_ORO,
  'mesh_bienvenida_marco_oro'
);
const { meshIdx: mapaLienzoMeshIdx } = addGeometryMeshToGltf(
  new THREE.PlaneGeometry(CANVAS_W, CANVAS_H),
  MAT_MAPA_NAYARIT,
  'mesh_bienvenida_lienzo_mapa_nayarit',
  { flipVForGltf: true }
);
const { meshIdx: panelCanteraMeshIdx } = addGeometryMeshToGltf(
  new THREE.PlaneGeometry(CANVAS_W, CANVAS_H),
  MAT_CANTERA,
  'mesh_bienvenida_panel_cantera'
);

// Mallas de logos institucionales respetando sus proporciones exactas
// CECAN vertical apilado: 1024×995 (ratio 1.0291) -> 1.461m × 1.42m (gran legibilidad sobre el mapa)
const CECAN_H = 1.42;
const CECAN_W = CECAN_H * (1024 / 995);
const { meshIdx: logoCecanMeshIdx } = addGeometryMeshToGltf(
  new THREE.PlaneGeometry(CECAN_W, CECAN_H),
  MAT_LOGO_CECAN,
  'mesh_logo_cecan_bienvenida',
  { flipVForGltf: true }
);

// Solón Argüello (+10% respecto a 1.95m): 1364×562 (ratio 2.427) -> 2.145m × 0.884m
const SOLON_W = 1.95 * 1.10;
const SOLON_H = SOLON_W / (1364 / 562);
const { meshIdx: logoSolonMeshIdx } = addGeometryMeshToGltf(
  new THREE.PlaneGeometry(SOLON_W, SOLON_H),
  MAT_LOGO_SOLON,
  'mesh_logo_solon_arguello_bienvenida',
  { flipVForGltf: true }
);

const R_CUADRO = 7.74;
const CUADRO_Y = 2.28; // Cuadro: 1.45m..3.11m (espacio limpio de 1.81m arriba para logos bajo cenefa 4.925m)

// 3.1 VANO IZQUIERDO (+60° -> +X, +Z): Cuadro Mapa de Nayarit + Logo CECAN arriba (sin placa dorada inferior)
{
  const rad = (60.0 * Math.PI) / 180;
  const x = R_CUADRO * Math.cos(rad);
  const z = R_CUADRO * Math.sin(rad);

  const mIdx = nodes.length;
  nodes.push({ name: 'mapa_nayarit_marco_madera', mesh: frameMaderaMeshIdx, translation: [0, 0, 0] });
  const oIdx = nodes.length;
  nodes.push({ name: 'mapa_nayarit_marco_oro', mesh: frameOroMeshIdx, translation: [0, 0, 0] });
  const cIdx = nodes.length;
  nodes.push({ name: 'lienzo_mapa_nayarit_bienvenida', mesh: mapaLienzoMeshIdx, translation: [0, 0, 0.031] });

  // Logo CECAN apilado centrado arriba del cuadro (world Y = 2.28 + 1.72 = 4.00m -> 3.29m..4.71m)
  const cecanIdx = nodes.length;
  nodes.push({ name: 'logo_cecan_bienvenida', mesh: logoCecanMeshIdx, translation: [0, 1.72, 0.018] });

  const rootIdx = nodes.length;
  nodes.push({
    name: 'cuadro_bienvenida_mapa_nayarit',
    translation: [x, CUADRO_Y, z],
    rotation: lookAtOriginQuat(x, CUADRO_Y, z),
    children: [mIdx, oIdx, cIdx, cecanIdx]
  });
  nodes[0].children.push(rootIdx);
  console.log(`  ✓ Mapa de Nayarit + Logo CECAN (+60°) pos=(${x.toFixed(2)}, ${CUADRO_Y}, ${z.toFixed(2)})`);
}

// 3.2 VANO DERECHO (+120° -> -X, +Z): Cuadro "BIENVENIDOS" (una sola palabra monumental) + Logo Solón Argüello arriba
{
  const rad = (120.0 * Math.PI) / 180;
  const x = R_CUADRO * Math.cos(rad);
  const z = R_CUADRO * Math.sin(rad);

  // Texto único "BIENVENIDOS" escalado para ocupar ~85% del ancho del lienzo de cantera
  const TARGET_TEXT_W = CANVAS_W * 0.85;
  const probe = new TextGeometry('BIENVENIDOS', { font, size: 0.2, depth: 0.02, curveSegments: 3, bevelEnabled: false });
  probe.computeBoundingBox();
  const probeW = probe.boundingBox.max.x - probe.boundingBox.min.x;
  const welcomeSize = Math.min(0.30, 0.2 * (TARGET_TEXT_W / probeW));

  const welcomeGeom = new TextGeometry('BIENVENIDOS', {
    font,
    size: welcomeSize,
    depth: 0.02,
    curveSegments: 4,
    bevelEnabled: false
  });
  welcomeGeom.computeVertexNormals();
  welcomeGeom.center();
  const { meshIdx: welcomeMeshIdx, bb: welcomeBb } = addGeometryMeshToGltf(
    welcomeGeom,
    MAT_MADERA_OSCURA,
    'mesh_texto_bienvenidos_monumental'
  );

  const { meshIdx: dividerBarMeshIdx } = addGeometryMeshToGltf(
    new THREE.BoxGeometry(1.74, 0.018, 0.010),
    MAT_MARCO_ORO,
    'mesh_bienvenida_linea_oro'
  );

  const diamondGeom = new THREE.BoxGeometry(0.064, 0.064, 0.014);
  diamondGeom.rotateZ(Math.PI / 4);
  const { meshIdx: diamondMeshIdx } = addGeometryMeshToGltf(
    diamondGeom,
    MAT_TURQUESA,
    'mesh_bienvenida_rombo_turquesa'
  );

  const mIdx = nodes.length;
  nodes.push({ name: 'letrero_bienvenida_marco_madera', mesh: frameMaderaMeshIdx, translation: [0, 0, 0] });
  const oIdx = nodes.length;
  nodes.push({ name: 'letrero_bienvenida_marco_oro', mesh: frameOroMeshIdx, translation: [0, 0, 0] });
  const cIdx = nodes.length;
  nodes.push({ name: 'letrero_bienvenida_fondo_cantera', mesh: panelCanteraMeshIdx, translation: [0, 0, 0.031] });

  const tIdx = nodes.length;
  nodes.push({ name: 'letrero_bienvenida_texto', mesh: welcomeMeshIdx, translation: [0, 0.0, 0.043] });

  // Filetes dorados con rombo turquesa arriba y abajo de la palabra (simetría ceremonial)
  const ornamentIdx = [];
  for (const [suffix, y] of [['superior', 0.42], ['inferior', -0.42]]) {
    const barIdx = nodes.length;
    nodes.push({ name: `letrero_bienvenida_linea_${suffix}`, mesh: dividerBarMeshIdx, translation: [0, y, 0.036] });
    const diaIdx = nodes.length;
    nodes.push({ name: `letrero_bienvenida_rombo_${suffix}`, mesh: diamondMeshIdx, translation: [0, y, 0.040] });
    ornamentIdx.push(barIdx, diaIdx);
  }

  // Logo Biblioteca Solón Argüello (+10%) centrado arriba del cuadro (world Y = 2.28 + 1.66 = 3.94m -> 3.50m..4.38m)
  const solonIdx = nodes.length;
  nodes.push({ name: 'logo_solon_arguello_bienvenida', mesh: logoSolonMeshIdx, translation: [0, 1.66, 0.018] });

  const rootIdx = nodes.length;
  nodes.push({
    name: 'cuadro_bienvenida_letrero',
    translation: [x, CUADRO_Y, z],
    rotation: lookAtOriginQuat(x, CUADRO_Y, z),
    children: [mIdx, oIdx, cIdx, tIdx, ...ornamentIdx, solonIdx]
  });
  nodes[0].children.push(rootIdx);
  console.log(
    `  ✓ Cuadro "BIENVENIDOS" + Logo Solón Argüello (+120°) pos=(${x.toFixed(2)}, ${CUADRO_Y}, ${z.toFixed(2)}) | ` +
    `texto=${(welcomeBb.max.x - welcomeBb.min.x).toFixed(2)}m × ${(welcomeBb.max.y - welcomeBb.min.y).toFixed(2)}m`
  );
}

// 3.3 Dos bancas bajas de madera oscura pegadas al zoclo en ambos vanos laterales
const BENCH_W = 2.15;
const BENCH_D = 0.46;
const BENCH_H = 0.45;
const R_BENCH = 7.38;

const { meshIdx: benchTopMeshIdx } = addGeometryMeshToGltf(
  new THREE.BoxGeometry(BENCH_W, 0.075, BENCH_D),
  MAT_MADERA_OSCURA,
  'mesh_banca_bienvenida_asiento'
);
const { meshIdx: benchLegMeshIdx } = addGeometryMeshToGltf(
  new THREE.BoxGeometry(0.11, BENCH_H - 0.075, BENCH_D - 0.06),
  MAT_MADERA_OSCURA,
  'mesh_banca_bienvenida_pata'
);
const { meshIdx: benchBarMeshIdx } = addGeometryMeshToGltf(
  new THREE.BoxGeometry(BENCH_W - 0.24, 0.06, 0.06),
  MAT_MADERA_OSCURA,
  'mesh_banca_bienvenida_travesano'
);

for (const bench of [
  { name: 'banca_bienvenida_izquierda', deg: 60.0 },
  { name: 'banca_bienvenida_derecha',   deg: 120.0 }
]) {
  const rad = (bench.deg * Math.PI) / 180;
  const bx = R_BENCH * Math.cos(rad);
  const bz = R_BENCH * Math.sin(rad);

  const topIdx = nodes.length;
  nodes.push({ name: `${bench.name}_asiento`, mesh: benchTopMeshIdx, translation: [0, BENCH_H - 0.0375, 0] });
  const legLIdx = nodes.length;
  nodes.push({ name: `${bench.name}_pata_izq`, mesh: benchLegMeshIdx, translation: [-BENCH_W / 2 + 0.14, (BENCH_H - 0.075) / 2, 0] });
  const legRIdx = nodes.length;
  nodes.push({ name: `${bench.name}_pata_der`, mesh: benchLegMeshIdx, translation: [BENCH_W / 2 - 0.14, (BENCH_H - 0.075) / 2, 0] });
  const barIdx = nodes.length;
  nodes.push({ name: `${bench.name}_travesano`, mesh: benchBarMeshIdx, translation: [0, 0.16, 0] });

  const bRootIdx = nodes.length;
  nodes.push({
    name: bench.name,
    translation: [bx, 0.0, bz],
    rotation: lookAtOriginQuat(bx, 0.0, bz),
    children: [topIdx, legLIdx, legRIdx, barIdx]
  });
  nodes[0].children.push(bRootIdx);
}
console.log('✓ Bancas bajas de madera oscura instaladas en ambos vanos laterales.');

// ==========================================================================
// 3.4 BOTONES 3D INTERACTIVOS ESTILO CUADRO DE DEIDAD ("ACERCA DE" y "MENÚ")
// ==========================================================================
console.log('\n[3.4] Construyendo botones 3D estilo cuadro de deidad ("ACERCA DE" y "MENÚ") en los vanos...');

const BTN_W = 2.18;
const BTN_H = 0.62;
const BTN_D = 0.045;
const BTN_ORO_W = 2.10;
const BTN_ORO_H = 0.54;
const BTN_ORO_D = 0.048;
const BTN_CANVAS_W = 2.02;
const BTN_CANVAS_H = 0.46;

const { meshIdx: btnFrameMaderaMeshIdx } = addGeometryMeshToGltf(
  new THREE.BoxGeometry(BTN_W, BTN_H, BTN_D),
  MAT_MADERA_OSCURA,
  'mesh_boton_bienvenida_marco_madera'
);

const { meshIdx: btnFrameOroMeshIdx } = addGeometryMeshToGltf(
  new THREE.BoxGeometry(BTN_ORO_W, BTN_ORO_H, BTN_ORO_D),
  MAT_MARCO_ORO,
  'mesh_boton_bienvenida_marco_oro'
);

const { meshIdx: btnPanelCanteraMeshIdx } = addGeometryMeshToGltf(
  new THREE.PlaneGeometry(BTN_CANVAS_W, BTN_CANVAS_H),
  MAT_CANTERA,
  'mesh_boton_bienvenida_panel_cantera'
);

const btnDiamondGeom = new THREE.BoxGeometry(0.060, 0.060, 0.015);
btnDiamondGeom.rotateZ(Math.PI / 4);
const { meshIdx: btnDiamondTurquesaMeshIdx } = addGeometryMeshToGltf(
  btnDiamondGeom,
  MAT_TURQUESA,
  'mesh_boton_bienvenida_rombo_turquesa'
);

const btnDiamondOroGeom = new THREE.BoxGeometry(0.072, 0.072, 0.012);
btnDiamondOroGeom.rotateZ(Math.PI / 4);
const { meshIdx: btnDiamondOroMeshIdx } = addGeometryMeshToGltf(
  btnDiamondOroGeom,
  MAT_MARCO_ORO,
  'mesh_boton_bienvenida_rombo_oro'
);

// Texto 3D dorado para "ACERCA DE" (escala y material idéntico a las placas de las deidades)
const acercaTextGeom = new TextGeometry('ACERCA DE', {
  font,
  size: 0.165,
  depth: 0.024,
  curveSegments: 3,
  bevelEnabled: false
});
acercaTextGeom.computeVertexNormals();
acercaTextGeom.center();
const { meshIdx: acercaTextMeshIdx } = addGeometryMeshToGltf(
  acercaTextGeom,
  MAT_TEXTO_ORO_3D,
  'mesh_texto_boton_acerca_de'
);

// Texto 3D dorado para "MENÚ" con acento agudo real modelado en 3D sobre la U (resuelve la ausencia de glifo Ú en helvetiker)
const menuBaseGeom = new TextGeometry('MENU', {
  font,
  size: 0.185,
  depth: 0.024,
  curveSegments: 3,
  bevelEnabled: false
});
menuBaseGeom.center();

const accentBox = new THREE.BoxGeometry(0.045, 0.018, 0.024).toNonIndexed();
accentBox.rotateZ(Math.PI / 6);
accentBox.translate(0.265, 0.130, 0);

const menuTextGeom = mergeGeometries([menuBaseGeom, accentBox]);
menuTextGeom.computeVertexNormals();

const { meshIdx: menuTextMeshIdx } = addGeometryMeshToGltf(
  menuTextGeom,
  MAT_TEXTO_ORO_3D,
  'mesh_texto_boton_menu'
);

const BTN_Y = 1.02;

// Capas en Z (frente del botón). El marco de oro (BoxGeometry de 0.048) tiene su cara
// frontal en z = 0.024; antes el panel de cantera también estaba en 0.024 y ambas caras
// coplanares producían z-fighting (parpadeo / "algo encima" del botón). Cada capa queda
// ahora separada al menos 4 mm de la anterior.
const BTN_Z_CANTERA = BTN_ORO_D / 2 + 0.004;     // 0.028 (encima del marco de oro)
const BTN_Z_ROMBO_ORO = BTN_Z_CANTERA + 0.008;   // caja 0.012 → 0.030..0.042
const BTN_Z_ROMBO_TURQ = BTN_Z_CANTERA + 0.014;  // caja 0.015 → 0.0345..0.0495
const BTN_Z_TEXTO = BTN_Z_CANTERA + 0.014;       // texto centrado de 0.024 → 0.030..0.054

// Función auxiliar para agregar los 4 rombos de esquina
const createCornerDiamonds = (baseName) => {
  const cornerIndices = [];
  const cx = BTN_CANVAS_W / 2 - 0.055;
  const cy = BTN_CANVAS_H / 2 - 0.055;
  const corners = [
    [-cx, cy],
    [cx, cy],
    [-cx, -cy],
    [cx, -cy]
  ];
  corners.forEach(([corX, corY], i) => {
    const dOroIdx = nodes.length;
    nodes.push({ name: `${baseName}_rombo_oro_${i}`, mesh: btnDiamondOroMeshIdx, translation: [corX, corY, BTN_Z_ROMBO_ORO] });
    const dTurqIdx = nodes.length;
    nodes.push({ name: `${baseName}_rombo_turq_${i}`, mesh: btnDiamondTurquesaMeshIdx, translation: [corX, corY, BTN_Z_ROMBO_TURQ] });
    cornerIndices.push(dOroIdx, dTurqIdx);
  });
  return cornerIndices;
};

// 1. Botón "ACERCA DE" en el vano izquierdo (+60°, debajo del mapa de Nayarit)
{
  const rad = (60.0 * Math.PI) / 180;
  const x = R_CUADRO * Math.cos(rad);
  const z = R_CUADRO * Math.sin(rad);

  const mIdx = nodes.length;
  nodes.push({ name: 'boton_acerca_de_marco_madera', mesh: btnFrameMaderaMeshIdx, translation: [0, 0, 0] });
  const oIdx = nodes.length;
  nodes.push({ name: 'boton_acerca_de_marco_oro', mesh: btnFrameOroMeshIdx, translation: [0, 0, 0] });
  const cIdx = nodes.length;
  nodes.push({ name: 'boton_acerca_de_fondo_cantera', mesh: btnPanelCanteraMeshIdx, translation: [0, 0, BTN_Z_CANTERA] });
  const tIdx = nodes.length;
  nodes.push({ name: 'boton_acerca_de_texto_oro', mesh: acercaTextMeshIdx, translation: [0, 0, BTN_Z_TEXTO] });
  const diamondIndices = createCornerDiamonds('boton_acerca_de');

  const rootIdx = nodes.length;
  nodes.push({
    name: 'boton_bienvenida_acerca_de',
    translation: [x, BTN_Y, z],
    rotation: lookAtOriginQuat(x, BTN_Y, z),
    children: [mIdx, oIdx, cIdx, tIdx, ...diamondIndices]
  });
  nodes[0].children.push(rootIdx);
  console.log(`  ✓ Botón "ACERCA DE" estilo cuadro de deidad (+60°) pos=(${x.toFixed(2)}, ${BTN_Y}, ${z.toFixed(2)})`);
}

// 2. Botón "MENÚ" en el vano derecho (+120°, debajo de Pamparios/Bienvenidos)
{
  const rad = (120.0 * Math.PI) / 180;
  const x = R_CUADRO * Math.cos(rad);
  const z = R_CUADRO * Math.sin(rad);

  const mIdx = nodes.length;
  nodes.push({ name: 'boton_menu_marco_madera', mesh: btnFrameMaderaMeshIdx, translation: [0, 0, 0] });
  const oIdx = nodes.length;
  nodes.push({ name: 'boton_menu_marco_oro', mesh: btnFrameOroMeshIdx, translation: [0, 0, 0] });
  const cIdx = nodes.length;
  nodes.push({ name: 'boton_menu_fondo_cantera', mesh: btnPanelCanteraMeshIdx, translation: [0, 0, BTN_Z_CANTERA] });
  const tIdx = nodes.length;
  nodes.push({ name: 'boton_menu_texto_oro', mesh: menuTextMeshIdx, translation: [0, 0, BTN_Z_TEXTO] });
  const diamondIndices = createCornerDiamonds('boton_menu');

  const rootIdx = nodes.length;
  nodes.push({
    name: 'boton_bienvenida_menu',
    translation: [x, BTN_Y, z],
    rotation: lookAtOriginQuat(x, BTN_Y, z),
    children: [mIdx, oIdx, cIdx, tIdx, ...diamondIndices]
  });
  nodes[0].children.push(rootIdx);
  console.log(`  ✓ Botón "MENÚ" estilo cuadro de deidad (+120°) pos=(${x.toFixed(2)}, ${BTN_Y}, ${z.toFixed(2)})`);
}

// ==========================================================================
// 3.5 AMBIENTACIÓN DE MESAS: GASTRONOMÍA (media luna) Y FIESTAS (música / objetos sagrados)
//     La mesa de Deidades se deja intacta a petición del equipo.
// ==========================================================================
console.log('\n[3.5] Ambientando mesas de Gastronomía y Fiestas con objetos alusivos...');

// Materiales existentes en la base v15 (se reutilizan para no inflar el GLB)
const MAT_FUEGO_AMARILLO = 6;
const MAT_FUEGO_NARANJA = 8;
const MAT_JICARA = 20;              // mat_rukuri_jicara
const MAT_PIEDRA_VOLCANICA = 35;
const MAT_CERA_BLANCA = 32;         // mat_kauyumari_blanco
const MAT_ESTAMBRE_ROJO = 33;
const MAT_CHAQUIRA = 34;
const MAT_ESTAMBRE_TURQUESA = 36;
const MAT_ESTAMBRE_AMARILLO = 37;
const MAT_MAIZ_AZUL = 45;
const MAT_FOOD_ATOLE = 46;
const MAT_FOOD_TAMALES = 47;
const MAT_TOTOMOXTLE = 48;
const MAT_CANASTA_PALMA = 49;
const MAT_FOOD_TORTILLAS = 50;
const MAT_SERVILLETA = 51;
const MAT_CAZUELA_BARRO = 55;
const MAT_FOOD_CALDO = 56;
const MAT_MAIZ_AMARILLO = 57;
const MAT_MAIZ_ROJO = 58;
const MAT_FOOD_MAIZ_TOSTADO = 59;
const MAT_FOOD_PERRURI = 60;
const MAT_OLLA_BARRO = 66;
const MAT_CHILE_SECO = 67;
const MAT_CALABAZA = 68;

const findNodeIdx = (name) => {
  const idx = nodes.findIndex((n) => n.name === name);
  if (idx < 0) {
    console.error(`Error: no se encontró el nodo base "${name}" en la v15.`);
    process.exit(1);
  }
  return idx;
};

// Caché de mallas: la misma geometría + material se escribe una sola vez en el binario
const propMeshCache = new Map();
const propMesh = (key, buildGeom, matIdx, { textured = false } = {}) => {
  const cacheKey = `${key}|${matIdx}`;
  if (!propMeshCache.has(cacheKey)) {
    const { meshIdx } = addGeometryMeshToGltf(buildGeom(), matIdx, `mesh_utileria_${key}`, {
      flipVForGltf: textured
    });
    propMeshCache.set(cacheKey, meshIdx);
  }
  return propMeshCache.get(cacheKey);
};

const quatY = (deg) => {
  const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), (deg * Math.PI) / 180);
  return [q.x, q.y, q.z, q.w];
};
const quatXY = (degX, degY) => {
  const q = new THREE.Quaternion().setFromEuler(
    new THREE.Euler((degX * Math.PI) / 180, (degY * Math.PI) / 180, 0, 'YXZ')
  );
  return [q.x, q.y, q.z, q.w];
};

/** Agrega un nodo-malla y devuelve su índice. */
const pushPart = (name, meshIdx, translation, rotation) => {
  const idx = nodes.length;
  nodes.push({ name, mesh: meshIdx, translation, ...(rotation ? { rotation } : {}) });
  return idx;
};
/** Agrega un grupo (sin malla) y devuelve su índice. */
const pushGroup = (name, children, translation, rotation) => {
  const idx = nodes.length;
  nodes.push({ name, translation, ...(rotation ? { rotation } : {}), children });
  return idx;
};

// ---------- Geometrías base (origen en la base del objeto, Y hacia arriba) ----------
const latheFrom = (profile, segments = 20) =>
  new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), segments);

const geomOlla = (r, h) => () =>
  latheFrom([
    [0.0001, 0], [r * 0.55, 0], [r * 0.9, h * 0.22], [r, h * 0.45], [r * 0.88, h * 0.7],
    [r * 0.58, h * 0.84], [r * 0.56, h * 0.92], [r * 0.66, h]
  ]);
const geomCuenco = (r, h) => () =>
  latheFrom([[0.0001, 0], [r * 0.45, 0], [r * 0.8, h * 0.35], [r * 0.97, h * 0.75], [r, h]]);
const geomDisco = (r) => () => {
  const g = new THREE.CircleGeometry(r, 28);
  g.rotateX(-Math.PI / 2);
  return g;
};
const geomCilindro = (rTop, rBottom, h, seg = 20) => () => {
  const g = new THREE.CylinderGeometry(rTop, rBottom, h, seg);
  g.translate(0, h / 2, 0);
  return g;
};
const geomCapsulaAcostada = (r, len) => () => {
  const g = new THREE.CapsuleGeometry(r, len, 4, 10);
  g.rotateZ(Math.PI / 2);
  g.translate(0, r, 0);
  return g;
};
const geomEsfera = (r, sy = 1) => () => {
  const g = new THREE.SphereGeometry(r, 14, 10);
  g.scale(1, sy, 1);
  g.translate(0, r * sy, 0);
  return g;
};
const geomServilleta = (w, d) => () => {
  const g = new THREE.BoxGeometry(w, 0.004, d);
  g.translate(0, 0.002, 0);
  return g;
};
const geomCono = (r, h) => () => {
  const g = new THREE.ConeGeometry(r, h, 10);
  g.translate(0, h / 2, 0);
  return g;
};

// ---------- Utilería compuesta ----------
const S = 0.004; // altura de la servilleta bordada bajo cada platillo

const servilleta = (base, size = 0.46) =>
  pushPart(`${base}_servilleta_bordada`, propMesh(`servilleta_${size}`, geomServilleta(size, size), MAT_SERVILLETA), [0, 0, 0], quatY(45));

const platilloTortillas = (base) => {
  const parts = [servilleta(base)];
  parts.push(pushPart(`${base}_comal_barro`, propMesh('comal', geomCilindro(0.20, 0.17, 0.025, 28), MAT_CAZUELA_BARRO), [0, S, 0]));
  parts.push(pushPart(`${base}_pila_tortillas`, propMesh('pila_tortillas', geomCilindro(0.13, 0.13, 0.05, 28), MAT_MAIZ_AMARILLO), [0, S + 0.025, 0]));
  parts.push(pushPart(`${base}_tortilla_superior`, propMesh('disco_tortilla', geomDisco(0.13), MAT_FOOD_TORTILLAS, { textured: true }), [0, S + 0.0765, 0]));
  return parts;
};

const platilloTamales = (base) => {
  const parts = [servilleta(base)];
  parts.push(pushPart(`${base}_canasta_palma`, propMesh('canasta', geomCuenco(0.17, 0.10), MAT_CANASTA_PALMA), [0, S, 0]));
  parts.push(pushPart(`${base}_relleno`, propMesh('disco_tamales', geomDisco(0.155), MAT_FOOD_TAMALES, { textured: true }), [0, S + 0.085, 0]));
  const tamalPos = [[-0.06, -0.04, 20], [0.05, -0.05, -15], [0.0, 0.05, 80], [-0.07, 0.06, 110], [0.07, 0.05, 60]];
  tamalPos.forEach(([tx, tz, rot], i) => {
    parts.push(pushPart(`${base}_tamal_${i}`, propMesh('tamal', geomCapsulaAcostada(0.03, 0.09), MAT_TOTOMOXTLE), [tx, S + 0.085, tz], quatY(rot)));
  });
  return parts;
};

const platilloAtole = (base) => {
  const parts = [servilleta(base, 0.52)];
  parts.push(pushPart(`${base}_olla_barro`, propMesh('olla_atole', geomOlla(0.12, 0.26), MAT_OLLA_BARRO), [0.04, S, -0.04]));
  parts.push(pushPart(`${base}_olla_superficie`, propMesh('disco_atole_olla', geomDisco(0.072), MAT_FOOD_ATOLE, { textured: true }), [0.04, S + 0.235, -0.04]));
  [[-0.14, 0.12], [0.13, 0.15]].forEach(([jx, jz], i) => {
    parts.push(pushPart(`${base}_jicara_${i}`, propMesh('jicara_bebida', geomCuenco(0.065, 0.05), MAT_JICARA), [jx, S, jz]));
    parts.push(pushPart(`${base}_jicara_${i}_atole`, propMesh('disco_atole_jicara', geomDisco(0.058), MAT_FOOD_ATOLE, { textured: true }), [jx, S + 0.042, jz]));
  });
  return parts;
};

const platilloCazuela = (base, foodMat, key) => {
  const parts = [servilleta(base)];
  parts.push(pushPart(`${base}_cazuela`, propMesh('cazuela', geomCuenco(0.17, 0.09), MAT_CAZUELA_BARRO), [0, S, 0]));
  parts.push(pushPart(`${base}_contenido`, propMesh(`disco_${key}`, geomDisco(0.158), foodMat, { textured: true }), [0, S + 0.078, 0]));
  return parts;
};

const platilloPerruri = (base) => {
  const parts = [servilleta(base)];
  parts.push(pushPart(`${base}_plato_barro`, propMesh('plato', geomCilindro(0.17, 0.14, 0.02, 28), MAT_CAZUELA_BARRO), [0, S, 0]));
  parts.push(pushPart(`${base}_pan`, propMesh('disco_perruri', geomDisco(0.15), MAT_FOOD_PERRURI, { textured: true }), [0, S + 0.0215, 0]));
  return parts;
};

const mazorca = (name, mat, t, rotY) =>
  [
    pushPart(`${name}_granos`, propMesh('mazorca', geomCapsulaAcostada(0.035, 0.15), mat), t, quatY(rotY)),
    pushPart(`${name}_hojas`, propMesh('hoja_mazorca', geomCono(0.03, 0.10), MAT_TOTOMOXTLE),
      [t[0] + 0.12 * Math.cos((rotY * Math.PI) / 180), t[1] + 0.035, t[2] - 0.12 * Math.sin((rotY * Math.PI) / 180)],
      quatXY(0, rotY))
  ];

// ---------- 1. Mesa de media luna de Gastronomía ----------
{
  const mesaIdx = findNodeIdx('mesa_gastronomia_media_luna');
  const TOP_Y = 0.865; // tablero (0.785) + espesor (0.08)
  const RX = 1.30;
  const RZ = 1.62;

  // Mismo orden que los recuadros del muro (de -Z a +Z): tortillas/caldo, tamales/maíz, perruri/atole
  const platillos = [
    { key: 'tortillas', deg: -54, build: platilloTortillas },
    { key: 'caldo_toro', deg: -32, build: (b) => platilloCazuela(b, MAT_FOOD_CALDO, 'caldo') },
    { key: 'tamales', deg: -11, build: platilloTamales },
    { key: 'maiz_tostado', deg: 11, build: (b) => platilloCazuela(b, MAT_FOOD_MAIZ_TOSTADO, 'maiz_tostado') },
    { key: 'perruri', deg: 32, build: platilloPerruri },
    { key: 'atole', deg: 54, build: platilloAtole }
  ];

  const groupChildren = [];
  for (const p of platillos) {
    const rad = (p.deg * Math.PI) / 180;
    const base = `utileria_gastronomia_${p.key}`;
    const parts = p.build(base);
    groupChildren.push(pushGroup(base, parts, [-RX * Math.cos(rad), TOP_Y, RZ * Math.sin(rad)]));
  }

  // Fila trasera (junto al muro, baja para no tapar las cédulas): maíces criollos, calabazas y chiles
  const back = [];
  back.push(...mazorca('utileria_gastronomia_mazorca_azul', MAT_MAIZ_AZUL, [-0.42, TOP_Y, -0.62], 12));
  back.push(...mazorca('utileria_gastronomia_mazorca_amarilla', MAT_MAIZ_AMARILLO, [-0.38, TOP_Y, -0.48], -8));
  back.push(...mazorca('utileria_gastronomia_mazorca_roja', MAT_MAIZ_ROJO, [-0.44, TOP_Y, -0.34], 18));
  back.push(...mazorca('utileria_gastronomia_mazorca_blanca', MAT_CERA_BLANCA, [-0.40, TOP_Y, -0.20], -4));
  back.push(pushPart('utileria_gastronomia_calabaza_1', propMesh('calabaza_grande', geomEsfera(0.11, 0.72), MAT_CALABAZA), [-0.40, TOP_Y, 0.22]));
  back.push(pushPart('utileria_gastronomia_calabaza_2', propMesh('calabaza_chica', geomEsfera(0.08, 0.75), MAT_CALABAZA), [-0.52, TOP_Y, 0.42]));
  [[-0.36, 0.62, 30], [-0.42, 0.70, -20], [-0.34, 0.76, 70], [-0.46, 0.80, 5]].forEach(([cx, cz, r], i) => {
    back.push(pushPart(`utileria_gastronomia_chile_seco_${i}`, propMesh('chile_seco', geomCapsulaAcostada(0.014, 0.07), MAT_CHILE_SECO), [cx, TOP_Y, cz], quatY(r)));
  });
  back.push(pushPart('utileria_gastronomia_metate_mano', propMesh('mano_metate', geomCapsulaAcostada(0.03, 0.20), MAT_PIEDRA_VOLCANICA), [-0.40, TOP_Y, 0.0], quatY(90)));
  groupChildren.push(pushGroup('utileria_gastronomia_fila_trasera', back, [0, 0, 0]));

  const rootIdx = pushGroup('utileria_mesa_gastronomia', groupChildren, [0, 0, 0]);
  nodes[mesaIdx].children = [...(nodes[mesaIdx].children || []), rootIdx];
  console.log(`  ✓ Mesa de media luna: ${platillos.length} platillos sobre servilletas bordadas + maíces criollos, calabazas y chiles.`);
}

// ---------- 2. Mesas de Fiestas (velas, jícaras votivas, tejuino y cempasúchil) ----------
const velaCeremonial = (base, h) => [
  pushPart(`${base}_cera`, propMesh(`vela_${h}`, geomCilindro(0.022, 0.024, h, 14), MAT_CERA_BLANCA), [0, 0, 0]),
  pushPart(`${base}_liston_rojo`, propMesh('liston_vela', geomCilindro(0.026, 0.026, 0.02, 14), MAT_ESTAMBRE_ROJO), [0, h * 0.45, 0]),
  pushPart(`${base}_liston_turquesa`, propMesh('liston_vela_t', geomCilindro(0.026, 0.026, 0.012, 14), MAT_ESTAMBRE_TURQUESA), [0, h * 0.45 + 0.026, 0]),
  pushPart(`${base}_mecha_fuego`, propMesh('flama_vela', geomCono(0.012, 0.045), MAT_FUEGO_AMARILLO), [0, h + 0.004, 0]),
  pushPart(`${base}_flama_naranja`, propMesh('flama_vela_base', geomEsfera(0.011, 1.1), MAT_FUEGO_NARANJA), [0, h + 0.002, 0])
];

const jicaraVotiva = (base) => [
  pushPart(`${base}_jicara`, propMesh('jicara_votiva', geomCuenco(0.08, 0.055), MAT_JICARA), [0, 0, 0]),
  pushPart(`${base}_chaquira`, propMesh('disco_chaquira', geomDisco(0.072), MAT_CHAQUIRA), [0, 0.048, 0])
];

const jicaraCempasuchil = (base) => {
  const parts = [pushPart(`${base}_jicara`, propMesh('jicara_flores', geomCuenco(0.075, 0.05), MAT_JICARA), [0, 0, 0])];
  const flores = [[0, 0], [0.04, 0.02], [-0.04, 0.02], [0.02, -0.04], [-0.025, -0.035], [0.0, 0.045], [0.045, -0.02]];
  flores.forEach(([fx, fz], i) => {
    parts.push(pushPart(`${base}_flor_${i}`, propMesh('flor_cempasuchil', geomEsfera(0.026, 0.8), i % 2 ? MAT_FUEGO_NARANJA : MAT_ESTAMBRE_AMARILLO), [fx, 0.032, fz]));
  });
  return parts;
};

const ollaTejuino = (base) => [
  pushPart(`${base}_olla`, propMesh('olla_tejuino', geomOlla(0.09, 0.19), MAT_OLLA_BARRO), [0, 0, 0]),
  pushPart(`${base}_tejuino`, propMesh('disco_tejuino', geomDisco(0.054), MAT_JICARA), [0, 0.172, 0]),
  pushPart(`${base}_jicara_servir`, propMesh('jicara_bebida', geomCuenco(0.065, 0.05), MAT_JICARA), [0.13, 0, 0.02])
];

{
  const FIESTA_TOP_Y = 0.85; // tablero de las mesas de fiesta (0.82 + 0.03)

  // Mesa de música (kanari, xaweri, sonajas): trío de velas y jícara votiva con chaquira
  const musicaIdx = findNodeIdx('estacion_musica_fiesta');
  const musicaChildren = [
    pushGroup('utileria_fiesta_musica_vela_0', velaCeremonial('utileria_fiesta_musica_vela_0', 0.20), [0.64, FIESTA_TOP_Y, 0.18]),
    pushGroup('utileria_fiesta_musica_vela_1', velaCeremonial('utileria_fiesta_musica_vela_1', 0.15), [0.71, FIESTA_TOP_Y, 0.27]),
    pushGroup('utileria_fiesta_musica_vela_2', velaCeremonial('utileria_fiesta_musica_vela_2', 0.12), [0.60, FIESTA_TOP_Y, 0.30]),
    pushGroup('utileria_fiesta_musica_jicara_votiva', jicaraVotiva('utileria_fiesta_musica_jicara_votiva'), [-0.05, FIESTA_TOP_Y, 0.27])
  ];
  const musicaRoot = pushGroup('utileria_mesa_fiesta_musica', musicaChildren, [0, 0, 0]);
  nodes[musicaIdx].children = [...(nodes[musicaIdx].children || []), musicaRoot];

  // Mesa de objetos sagrados (flechas, tsikuri, morral, sombrero): tejuino, cempasúchil y velas
  const objetosIdx = findNodeIdx('estacion_objetos_sagrados_fiesta');
  const objetosChildren = [
    pushGroup('utileria_fiesta_objetos_tejuino', ollaTejuino('utileria_fiesta_objetos_tejuino'), [-0.44, FIESTA_TOP_Y, 0.25]),
    pushGroup('utileria_fiesta_objetos_cempasuchil', jicaraCempasuchil('utileria_fiesta_objetos_cempasuchil'), [0.68, FIESTA_TOP_Y, -0.28]),
    pushGroup('utileria_fiesta_objetos_vela_0', velaCeremonial('utileria_fiesta_objetos_vela_0', 0.18), [-0.70, FIESTA_TOP_Y, -0.04]),
    pushGroup('utileria_fiesta_objetos_vela_1', velaCeremonial('utileria_fiesta_objetos_vela_1', 0.13), [-0.70, FIESTA_TOP_Y, -0.18])
  ];
  const objetosRoot = pushGroup('utileria_mesa_fiesta_objetos', objetosChildren, [0, 0, 0]);
  nodes[objetosIdx].children = [...(nodes[objetosIdx].children || []), objetosRoot];

  console.log('  ✓ Mesas de Fiestas: velas ceremoniales, jícara votiva con chaquira, olla de tejuino y ofrenda de cempasúchil.');
}

// ==========================================================================
// PARTE 4: EMPAQUETADO FINAL DEL GLB v16
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
