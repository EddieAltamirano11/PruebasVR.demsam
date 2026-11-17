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
 * 2. Vano Central (+90°): Portal Ceremonial del Kalihuey + Medallón Circular del Techo:
 *   • Marco arquitectónico en cantera clara con dintel escalonado.
 *   • Puerta doble ceremonial en madera oscura (mat_madera_oscura.036) con filetes
 *     geométricos en turquesa y oro ceremonial más manijas verticales doradas.
 *   • Encima del dintel: medallón circular con aro de madera oscura y bisel dorado
 *     reutilizando exactamente la textura circular del óculo del techo
 *     (mat_tatewari_oculo_techo.010, orientado derecho hacia el espectador).
 *
 * 3. Vano Izquierdo (+60°, izquierda desde el centro mirando a +Z):
 *   • Cuadro enmarcado en madera oscura y oro con el mapa ilustrado de Nayarit
 *     (public/texturas/mapa_nayarit_bienvenida.jpg, únicamente con el texto "NAYARIT").
 *   • Placa dorada ceremonial inferior y banca baja de madera oscura junto al zoclo.
 *
 * 4. Vano Derecho (+120°, derecha desde el centro mirando a +Z):
 *   • Cuadro gemelo de bienvenida en cantera con tipografía 3D extruida en madera oscura:
 *     "PAMPARIOS · BIENVENIDOS" / "BIBLIOTECA SOLÓN ARGÜELLO" con barra dorada y rombo turquesa.
 *   • Placa dorada ceremonial inferior y banca baja de madera oscura simétrica.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const inputPath = path.resolve(rootDir, 'public', 'museo_wixarika_v15.glb');
const outputPath = path.resolve(rootDir, 'public', 'museo_wixarika_v16.glb');
const mapTexturePath = path.resolve(rootDir, 'public', 'texturas', 'mapa_nayarit_bienvenida.jpg');

if (!fs.existsSync(inputPath)) {
  console.error(`Error: No se encontró el archivo base en ${inputPath}`);
  process.exit(1);
}
if (!fs.existsSync(mapTexturePath)) {
  console.error(`Error: No se encontró la textura del mapa en ${mapTexturePath}`);
  process.exit(1);
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

const embedImageMaterial = (filePath, mimeType, texName, matName) => {
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
  gltf.materials.push({
    name: matName,
    pbrMetallicRoughness: {
      baseColorTexture: { index: texIdx },
      metallicFactor: 0.05,
      roughnessFactor: 0.72
    }
  });

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

// 2.3 Medallón Circular con la imagen oficial del techo (mat_tatewari_oculo_techo.010)
const MEDALLON_Y = 3.54; // Borde inferior 2.67m (8cm libre sobre cornisa 2.59m), borde superior 4.41m (51cm bajo cenefa)
const MEDALLON_R_MADERA = 0.87;
const MEDALLON_R_ORO = 0.83;
const MEDALLON_R_ARTE = 0.795;

// Cilindros rotados en X (+90°) para quedar como discos planos mirando hacia +Z local
const maderaDiscGeom = new THREE.CylinderGeometry(MEDALLON_R_MADERA, MEDALLON_R_MADERA, 0.06, 64);
maderaDiscGeom.rotateX(Math.PI / 2);
const { meshIdx: medallonMaderaMeshIdx } = addGeometryMeshToGltf(
  maderaDiscGeom,
  MAT_MADERA_OSCURA,
  'mesh_medallon_bienvenida_marco_madera'
);

const oroDiscGeom = new THREE.CylinderGeometry(MEDALLON_R_ORO, MEDALLON_R_ORO, 0.068, 64);
oroDiscGeom.rotateX(Math.PI / 2);
const { meshIdx: medallonOroMeshIdx } = addGeometryMeshToGltf(
  oroDiscGeom,
  MAT_MARCO_ORO,
  'mesh_medallon_bienvenida_marco_oro'
);

const fondoDiscGeom = new THREE.CircleGeometry(MEDALLON_R_ARTE, 64);
const { meshIdx: medallonFondoMeshIdx } = addGeometryMeshToGltf(
  fondoDiscGeom,
  MAT_MADERA_PROFUNDA,
  'mesh_medallon_bienvenida_fondo'
);

// Disco frontal reutilizando la textura del techo (mat 82) con flipVForGltf para que Tatewari quede derecho
const oculoDiscGeom = new THREE.CircleGeometry(MEDALLON_R_ARTE, 64);
const { meshIdx: medallonOculoMeshIdx } = addGeometryMeshToGltf(
  oculoDiscGeom,
  MAT_OCULO_TECHO,
  'mesh_medallon_bienvenida_oculo_techo',
  { flipVForGltf: true }
);

const medMaderaIdx = nodes.length;
nodes.push({ name: 'medallon_bienvenida_madera', mesh: medallonMaderaMeshIdx, translation: [0.0, MEDALLON_Y, 0.0] });
portalChildren.push(medMaderaIdx);

const medOroIdx = nodes.length;
nodes.push({ name: 'medallon_bienvenida_oro', mesh: medallonOroMeshIdx, translation: [0.0, MEDALLON_Y, 0.002] });
portalChildren.push(medOroIdx);

const medFondoIdx = nodes.length;
nodes.push({ name: 'medallon_bienvenida_fondo', mesh: medallonFondoMeshIdx, translation: [0.0, MEDALLON_Y, 0.038] });
portalChildren.push(medFondoIdx);

const medArteIdx = nodes.length;
nodes.push({ name: 'medallon_bienvenida_oculo_techo', mesh: medallonOculoMeshIdx, translation: [0.0, MEDALLON_Y, 0.042] });
portalChildren.push(medArteIdx);

const portalRootIdx = nodes.length;
nodes.push({
  name: 'portal_ceremonial_kalihuey',
  translation: [0.0, 0.0, PORTAL_Z],
  rotation: lookAtOriginQuat(0.0, 0.0, PORTAL_Z),
  children: portalChildren
});
nodes[0].children.push(portalRootIdx);
console.log('✓ Portal Ceremonial y Medallón Circular (textura mat_tatewari_oculo_techo.010) instalados en +90°.');

// ==========================================================================
// PARTE 3: CUADROS LATERALES (MAPA DE NAYARIT Y PAMPARIOS · BIENVENIDOS) + BANCAS
// ==========================================================================
console.log('\n[3] Construyendo cuadro de Mapa de Nayarit (+60°), cuadro Pamparios (+120°) y bancas...');

// Inyectar textura del mapa limpio de Nayarit (únicamente con texto "NAYARIT")
const { matIdx: MAT_MAPA_NAYARIT } = embedImageMaterial(
  mapTexturePath,
  'image/jpeg',
  'tex_mapa_nayarit_bienvenida',
  'mat_mapa_nayarit_bienvenida'
);

// Cargar tipografía helvetiker_bold e inyectar glifos 'Ó' y 'Ü' para "SOLÓN ARGÜELLO"
const fontPath = path.resolve(rootDir, 'node_modules/three/examples/fonts/helvetiker_bold.typeface.json');
const fontData = JSON.parse(fs.readFileSync(fontPath, 'utf8'));

if (!fontData.glyphs['Ó'] && fontData.glyphs['O']) {
  const baseO = fontData.glyphs['O'];
  fontData.glyphs['Ó'] = {
    x_min: baseO.x_min,
    x_max: baseO.x_max,
    ha: baseO.ha,
    o: `${baseO.o}m 520 1120 l 425 1120 l 560 1320 l 680 1320 l 520 1120 `
  };
}
if (!fontData.glyphs['Ü'] && fontData.glyphs['U']) {
  const baseU = fontData.glyphs['U'];
  fontData.glyphs['Ü'] = {
    x_min: baseU.x_min,
    x_max: baseU.x_max,
    ha: baseU.ha,
    o: `${baseU.o}m 230 1140 l 370 1140 l 370 1280 l 230 1280 l 230 1140 m 530 1140 l 670 1140 l 670 1280 l 530 1280 l 530 1140 `
  };
}
const font = new FontLoader().parse(fontData);

// Geometrías compartidas de marcos y placas doradas inferiores
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

// Placa pequeña dorada decorativa debajo de cada cuadro (como en Propuesta 1)
const { meshIdx: placaChicaMaderaMeshIdx } = addGeometryMeshToGltf(
  new THREE.BoxGeometry(0.68, 0.24, 0.024),
  MAT_MADERA_OSCURA,
  'mesh_bienvenida_placa_chica_madera'
);
const { meshIdx: placaChicaOroMeshIdx } = addGeometryMeshToGltf(
  new THREE.BoxGeometry(0.62, 0.18, 0.028),
  MAT_MARCO_ORO,
  'mesh_bienvenida_placa_chica_oro'
);

const R_CUADRO = 7.74;
const CUADRO_Y = 2.52;
const PLACA_CHICA_LOCAL_Y = -1.08; // World Y = 1.44m

// 3.1 VANO IZQUIERDO (+60° -> +X, +Z): Cuadro Mapa de Nayarit
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

  const pmIdx = nodes.length;
  nodes.push({ name: 'placa_mapa_nayarit_madera', mesh: placaChicaMaderaMeshIdx, translation: [0, PLACA_CHICA_LOCAL_Y, 0] });
  const poIdx = nodes.length;
  nodes.push({ name: 'placa_mapa_nayarit_oro', mesh: placaChicaOroMeshIdx, translation: [0, PLACA_CHICA_LOCAL_Y, 0] });

  const rootIdx = nodes.length;
  nodes.push({
    name: 'cuadro_bienvenida_mapa_nayarit',
    translation: [x, CUADRO_Y, z],
    rotation: lookAtOriginQuat(x, CUADRO_Y, z),
    children: [mIdx, oIdx, cIdx, pmIdx, poIdx]
  });
  nodes[0].children.push(rootIdx);
  console.log(`  ✓ Mapa de Nayarit (+60°) pos=(${x.toFixed(2)}, ${CUADRO_Y}, ${z.toFixed(2)})`);
}

// 3.2 VANO DERECHO (+120° -> -X, +Z): Cuadro "PAMPARIOS · BIENVENIDOS / BIBLIOTECA SOLÓN ARGÜELLO"
{
  const rad = (120.0 * Math.PI) / 180;
  const x = R_CUADRO * Math.cos(rad);
  const z = R_CUADRO * Math.sin(rad);

  const titleGeom = new TextGeometry('PAMPARIOS · BIENVENIDOS', {
    font,
    size: 0.105,
    depth: 0.012,
    curveSegments: 3,
    bevelEnabled: false
  });
  titleGeom.computeVertexNormals();
  titleGeom.center();
  const { meshIdx: titleMeshIdx, bb: titleBb } = addGeometryMeshToGltf(
    titleGeom,
    MAT_MADERA_OSCURA,
    'mesh_texto_pamparios_bienvenidos'
  );

  const subtitleGeom = new TextGeometry('BIBLIOTECA SOLÓN ARGÜELLO', {
    font,
    size: 0.080,
    depth: 0.010,
    curveSegments: 3,
    bevelEnabled: false
  });
  subtitleGeom.computeVertexNormals();
  subtitleGeom.center();
  const { meshIdx: subtitleMeshIdx, bb: subBb } = addGeometryMeshToGltf(
    subtitleGeom,
    MAT_MADERA_OSCURA,
    'mesh_texto_biblioteca_solon_arguello'
  );

  const { meshIdx: dividerBarMeshIdx } = addGeometryMeshToGltf(
    new THREE.BoxGeometry(1.62, 0.014, 0.008),
    MAT_MARCO_ORO,
    'mesh_bienvenida_linea_oro'
  );

  const diamondGeom = new THREE.BoxGeometry(0.050, 0.050, 0.012);
  diamondGeom.rotateZ(Math.PI / 4);
  const { meshIdx: diamondMeshIdx } = addGeometryMeshToGltf(
    diamondGeom,
    MAT_TURQUESA,
    'mesh_bienvenida_rombo_turquesa'
  );

  const mIdx = nodes.length;
  nodes.push({ name: 'pamparios_marco_madera', mesh: frameMaderaMeshIdx, translation: [0, 0, 0] });
  const oIdx = nodes.length;
  nodes.push({ name: 'pamparios_marco_oro', mesh: frameOroMeshIdx, translation: [0, 0, 0] });
  const cIdx = nodes.length;
  nodes.push({ name: 'pamparios_fondo_cantera', mesh: panelCanteraMeshIdx, translation: [0, 0, 0.031] });

  const t1Idx = nodes.length;
  nodes.push({ name: 'pamparios_texto_titulo', mesh: titleMeshIdx, translation: [0, 0.16, 0.038] });
  const barIdx = nodes.length;
  nodes.push({ name: 'pamparios_linea_dorada', mesh: dividerBarMeshIdx, translation: [0, 0.01, 0.036] });
  const diaIdx = nodes.length;
  nodes.push({ name: 'pamparios_rombo_central', mesh: diamondMeshIdx, translation: [0, 0.01, 0.039] });
  const t2Idx = nodes.length;
  nodes.push({ name: 'pamparios_texto_subtitulo', mesh: subtitleMeshIdx, translation: [0, -0.15, 0.038] });

  const pmIdx = nodes.length;
  nodes.push({ name: 'placa_pamparios_madera', mesh: placaChicaMaderaMeshIdx, translation: [0, PLACA_CHICA_LOCAL_Y, 0] });
  const poIdx = nodes.length;
  nodes.push({ name: 'placa_pamparios_oro', mesh: placaChicaOroMeshIdx, translation: [0, PLACA_CHICA_LOCAL_Y, 0] });

  const rootIdx = nodes.length;
  nodes.push({
    name: 'cuadro_bienvenida_pamparios',
    translation: [x, CUADRO_Y, z],
    rotation: lookAtOriginQuat(x, CUADRO_Y, z),
    children: [mIdx, oIdx, cIdx, t1Idx, barIdx, diaIdx, t2Idx, pmIdx, poIdx]
  });
  nodes[0].children.push(rootIdx);
  console.log(
    `  ✓ Cuadro Pamparios (+120°) pos=(${x.toFixed(2)}, ${CUADRO_Y}, ${z.toFixed(2)}) | ` +
    `título=${(titleBb.max.x - titleBb.min.x).toFixed(2)}m, subtítulo=${(subBb.max.x - subBb.min.x).toFixed(2)}m`
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
