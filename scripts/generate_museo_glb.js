// ==============================================================================
// Generador 3D Procedural: Museo Virtual Wixárika (WebXR)
// Cumple con la especificación formal: specs/museo_wixarika_spec.yaml
// Equipo 10 - Taller Full Stack | Biblioteca Solón Argüello
// ==============================================================================

// Polyfill FileReader for Node.js environment
global.FileReader = class FileReader {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then(buf => {
      this.result = buf;
      if (this.onloadend) this.onloadend();
    });
  }
};

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import fs from 'fs';
import path from 'path';

console.log('================================================================');
console.log('  GENERANDO MODELO 3D: SALA DE MUSEO WIXÁRIKA + 4 SECCIONES (.GLB)');
console.log('  Open Spec: specs/museo_wixarika_spec.yaml');
console.log('================================================================\n');

// Cargar tipografía para los letreros y carteles en relieve 3D
const fontPath = path.resolve('node_modules', 'three', 'examples', 'fonts', 'helvetiker_bold.typeface.json');
const fontData = JSON.parse(fs.readFileSync(fontPath, 'utf8'));
const font = new FontLoader().parse(fontData);

// 1. Crear Escena y Grupo Raíz
const scene = new THREE.Scene();
const root = new THREE.Group();
root.name = 'museo_wixarika_base';
scene.add(root);

// ==============================================================================
// 2. DEFINICIÓN DE MATERIALES PBR ESTILIZADOS
// ==============================================================================
// Materiales Arquitectónicos
const matFloor = new THREE.MeshStandardMaterial({
  name: 'mat_suelo_cantera',
  color: 0xbaa896,
  roughness: 0.6,
  metalness: 0.05
});

const matMedallionBase = new THREE.MeshStandardMaterial({
  name: 'mat_medallon_base',
  color: 0xd9cbbe,
  roughness: 0.5,
  metalness: 0.05
});

const matMedallionWood = new THREE.MeshStandardMaterial({
  name: 'mat_medallon_madera',
  color: 0x5a3825,
  roughness: 0.45,
  metalness: 0.0
});

const matMedallionTurquoise = new THREE.MeshStandardMaterial({
  name: 'mat_medallon_turquesa',
  color: 0x0d9488,
  roughness: 0.35,
  metalness: 0.1
});

const matWall = new THREE.MeshStandardMaterial({
  name: 'mat_muro_adobe',
  color: 0xe3d5c5,
  roughness: 0.85,
  metalness: 0.02,
  side: THREE.DoubleSide
});

const matWallNiche = new THREE.MeshStandardMaterial({
  name: 'mat_muro_nicho',
  color: 0xc8b7a4,
  roughness: 0.8,
  metalness: 0.02,
  side: THREE.DoubleSide
});

const matDarkWood = new THREE.MeshStandardMaterial({
  name: 'mat_madera_oscura',
  color: 0x3d2314,
  roughness: 0.5,
  metalness: 0.0
});

const matLightWood = new THREE.MeshStandardMaterial({
  name: 'mat_madera_clara',
  color: 0x8a5b3a,
  roughness: 0.55,
  metalness: 0.0
});

const matPedestalBase = new THREE.MeshStandardMaterial({
  name: 'mat_pedestal_madera',
  color: 0x4a2e1b,
  roughness: 0.45,
  metalness: 0.0
});

const matPedestalTop = new THREE.MeshStandardMaterial({
  name: 'mat_pedestal_tope',
  color: 0xe8e2d8,
  roughness: 0.3,
  metalness: 0.05
});

const matCeilingPanels = new THREE.MeshStandardMaterial({
  name: 'mat_techo_artesonado',
  color: 0x9c7453,
  roughness: 0.7,
  metalness: 0.0,
  side: THREE.DoubleSide
});

const matOculusGlass = new THREE.MeshStandardMaterial({
  name: 'mat_oculo_cristal',
  color: 0xf0fdfa,
  roughness: 0.15,
  metalness: 0.1,
  transparent: true,
  opacity: 0.85,
  emissive: 0xdbeafe,
  emissiveIntensity: 0.35,
  side: THREE.DoubleSide
});

const matLightingFixtures = new THREE.MeshStandardMaterial({
  name: 'mat_luminarias',
  color: 0x262626,
  roughness: 0.35,
  metalness: 0.85
});

// Materiales Dedicados para las 6 Deidades Sagradas
const matKauyumariBlue = new THREE.MeshStandardMaterial({
  name: 'mat_kauyumari_azul',
  color: 0x1e3a8a,
  roughness: 0.38,
  metalness: 0.1
});

const matKauyumariCyan = new THREE.MeshStandardMaterial({
  name: 'mat_kauyumari_turquesa',
  color: 0x06b6d4,
  emissive: 0x0891b2,
  emissiveIntensity: 0.3,
  roughness: 0.25,
  metalness: 0.15
});

const matKauyumariGold = new THREE.MeshStandardMaterial({
  name: 'mat_kauyumari_oro',
  color: 0xf59e0b,
  roughness: 0.25,
  metalness: 0.45
});

const matKauyumariWhite = new THREE.MeshStandardMaterial({
  name: 'mat_kauyumari_blanco',
  color: 0xf8fafc,
  roughness: 0.4,
  metalness: 0.0
});

const matVolcanicStone = new THREE.MeshStandardMaterial({
  name: 'mat_piedra_volcanica',
  color: 0x292524,
  roughness: 0.88,
  metalness: 0.05
});

const matCharcoalLogs = new THREE.MeshStandardMaterial({
  name: 'mat_lenos_carbon',
  color: 0x44403c,
  roughness: 0.8,
  metalness: 0.0
});

const matFlameRed = new THREE.MeshStandardMaterial({
  name: 'mat_fuego_rojo',
  color: 0xdc2626,
  emissive: 0x991b1b,
  emissiveIntensity: 0.4,
  roughness: 0.2
});

const matFlameOrange = new THREE.MeshStandardMaterial({
  name: 'mat_fuego_naranja',
  color: 0xf97316,
  emissive: 0xea580c,
  emissiveIntensity: 0.55,
  roughness: 0.2
});

const matFlameYellow = new THREE.MeshStandardMaterial({
  name: 'mat_fuego_amarillo',
  color: 0xfef08a,
  emissive: 0xfacc15,
  emissiveIntensity: 0.8,
  roughness: 0.15
});

const matSunGold = new THREE.MeshStandardMaterial({
  name: 'mat_sol_oro',
  color: 0xf59e0b,
  roughness: 0.25,
  metalness: 0.5
});

const matSunCore = new THREE.MeshStandardMaterial({
  name: 'mat_sol_nucleo',
  color: 0xfbbf24,
  emissive: 0xd97706,
  emissiveIntensity: 0.35,
  roughness: 0.2,
  metalness: 0.3
});

const matSunWood = new THREE.MeshStandardMaterial({
  name: 'mat_sol_madera',
  color: 0x78350f,
  roughness: 0.5,
  metalness: 0.0
});

const matSunRed = new THREE.MeshStandardMaterial({
  name: 'mat_sol_rojo',
  color: 0xb91c1c,
  roughness: 0.3,
  metalness: 0.1
});

const matEarthGreen = new THREE.MeshStandardMaterial({
  name: 'mat_tierra_verde',
  color: 0x166534,
  roughness: 0.7,
  metalness: 0.0
});

const matEarthBrown = new THREE.MeshStandardMaterial({
  name: 'mat_tierra_manto',
  color: 0x713f12,
  roughness: 0.8,
  metalness: 0.0
});

const matAncientWood = new THREE.MeshStandardMaterial({
  name: 'mat_baculo_madera',
  color: 0x3e2723,
  roughness: 0.65,
  metalness: 0.0
});

const matSeedGold = new THREE.MeshStandardMaterial({
  name: 'mat_semillas_maiz',
  color: 0xca8a04,
  emissive: 0x854d0e,
  emissiveIntensity: 0.2,
  roughness: 0.35
});

const matOceanDeep = new THREE.MeshStandardMaterial({
  name: 'mat_oceano_profundo',
  color: 0x0369a1,
  roughness: 0.3,
  metalness: 0.15
});

const matOceanTurquoise = new THREE.MeshStandardMaterial({
  name: 'mat_oceano_turquesa',
  color: 0x06b6d4,
  emissive: 0x0891b2,
  emissiveIntensity: 0.25,
  roughness: 0.2,
  metalness: 0.1
});

const matPearlWhite = new THREE.MeshStandardMaterial({
  name: 'mat_nacar_blanco',
  color: 0xf8fafc,
  roughness: 0.35,
  metalness: 0.15
});

const matSeaFoam = new THREE.MeshStandardMaterial({
  name: 'mat_espuma_marina',
  color: 0xe0f2fe,
  roughness: 0.4,
  metalness: 0.0
});

const matPeyoteGreen = new THREE.MeshStandardMaterial({
  name: 'mat_peyote_verde',
  color: 0x22c55e,
  roughness: 0.55,
  metalness: 0.05
});

const matPeyoteFlower = new THREE.MeshStandardMaterial({
  name: 'mat_peyote_flor',
  color: 0xf472b6,
  roughness: 0.3,
  metalness: 0.05
});

const matPeyoteTufts = new THREE.MeshStandardMaterial({
  name: 'mat_peyote_pelusa',
  color: 0xf1f5f9,
  roughness: 0.9,
  metalness: 0.0
});

const matRukuriGourd = new THREE.MeshStandardMaterial({
  name: 'mat_rukuri_jicara',
  color: 0x854d0e,
  roughness: 0.45,
  metalness: 0.0
});

const matChaquiraBeads = new THREE.MeshStandardMaterial({
  name: 'mat_chaquira_adorno',
  color: 0x0284c7,
  roughness: 0.25,
  metalness: 0.2
});

// Materiales Dedicados para la Exhibición Gastronómica Tradicional Wixárika
const matClayPot = new THREE.MeshStandardMaterial({
  name: 'mat_olla_barro_nayarita',
  color: 0xb45309,
  roughness: 0.45,
  metalness: 0.05
});

const matClayDark = new THREE.MeshStandardMaterial({
  name: 'mat_cazuela_barro_oscuro',
  color: 0x78350f,
  roughness: 0.6,
  metalness: 0.02
});

const matMaizeBlue = new THREE.MeshStandardMaterial({
  name: 'mat_maiz_azul_yuawi',
  color: 0x2e2b6e,
  roughness: 0.45,
  metalness: 0.05
});

const matMaizeYellow = new THREE.MeshStandardMaterial({
  name: 'mat_maiz_amarillo_kanari',
  color: 0xeab308,
  roughness: 0.45,
  metalness: 0.05
});

const matMaizeRed = new THREE.MeshStandardMaterial({
  name: 'mat_maiz_rojo_utsari',
  color: 0x991b1b,
  roughness: 0.45,
  metalness: 0.05
});

const matMaizeWhite = new THREE.MeshStandardMaterial({
  name: 'mat_maiz_blanco_tusame',
  color: 0xfef3c7,
  roughness: 0.5,
  metalness: 0.0
});

const matMaizePinto = new THREE.MeshStandardMaterial({
  name: 'mat_maiz_pinto_tsipuari',
  color: 0xb45309,
  roughness: 0.5,
  metalness: 0.0
});

const matTotomoxtle = new THREE.MeshStandardMaterial({
  name: 'mat_totomoxtle_hojas',
  color: 0xf5ebd7,
  roughness: 0.75,
  metalness: 0.0,
  side: THREE.DoubleSide
});

const matTortillaYellow = new THREE.MeshStandardMaterial({
  name: 'mat_tortilla_maiz_amarillo',
  color: 0xfde047,
  roughness: 0.7,
  metalness: 0.0
});

const matTortillaBlue = new THREE.MeshStandardMaterial({
  name: 'mat_tortilla_maiz_azul',
  color: 0x3730a3,
  roughness: 0.7,
  metalness: 0.0
});

const matPalmBasket = new THREE.MeshStandardMaterial({
  name: 'mat_canasta_palma_otate',
  color: 0xd4b996,
  roughness: 0.8,
  metalness: 0.0
});

const matEmbroideryCloth = new THREE.MeshStandardMaterial({
  name: 'mat_servilleta_bordada',
  color: 0xfef9c3,
  roughness: 0.85,
  metalness: 0.0,
  side: THREE.DoubleSide
});

const matTejuinoDrink = new THREE.MeshStandardMaterial({
  name: 'mat_bebida_tejuino',
  color: 0xb45309,
  roughness: 0.25,
  metalness: 0.1
});

const matStewHuachales = new THREE.MeshStandardMaterial({
  name: 'mat_guiso_huachales',
  color: 0xb91c1c,
  roughness: 0.35,
  metalness: 0.05
});

const matMetateStone = new THREE.MeshStandardMaterial({
  name: 'mat_metate_piedra_volcanica',
  color: 0x374151,
  roughness: 0.88,
  metalness: 0.05
});

const matChiliRed = new THREE.MeshStandardMaterial({
  name: 'mat_chile_seco_serrano',
  color: 0xdc2626,
  roughness: 0.35,
  metalness: 0.05
});

const matSquashOrange = new THREE.MeshStandardMaterial({
  name: 'mat_calabaza_serrana',
  color: 0xea580c,
  roughness: 0.55,
  metalness: 0.05
});

// Materiales Dedicados para Fiestas Patronales y Música Ceremonial
const matLeatherDrum = new THREE.MeshStandardMaterial({
  name: 'mat_parche_tambor_piel',
  color: 0xd97706,
  roughness: 0.6,
  metalness: 0.05
});

const matDrumWood = new THREE.MeshStandardMaterial({
  name: 'mat_madera_tambor_tepu',
  color: 0x5c2c16,
  roughness: 0.5,
  metalness: 0.0
});

const matDrumRope = new THREE.MeshStandardMaterial({
  name: 'mat_soga_tambor',
  color: 0xd4b996,
  roughness: 0.85,
  metalness: 0.0
});

const matViolinWood = new THREE.MeshStandardMaterial({
  name: 'mat_violin_xaweri',
  color: 0xb45309,
  roughness: 0.35,
  metalness: 0.05
});

const matGuitarWood = new THREE.MeshStandardMaterial({
  name: 'mat_guitarra_kanari',
  color: 0xfcd34d,
  roughness: 0.4,
  metalness: 0.0
});

const matTsikuriRed = new THREE.MeshStandardMaterial({
  name: 'mat_estambre_rojo',
  color: 0xdc2626,
  roughness: 0.85,
  metalness: 0.0
});

const matTsikuriBlue = new THREE.MeshStandardMaterial({
  name: 'mat_estambre_turquesa',
  color: 0x0284c7,
  roughness: 0.85,
  metalness: 0.0
});

const matTsikuriYellow = new THREE.MeshStandardMaterial({
  name: 'mat_estambre_amarillo',
  color: 0xfacc15,
  roughness: 0.85,
  metalness: 0.0
});

const matTsikuriPurple = new THREE.MeshStandardMaterial({
  name: 'mat_estambre_morado',
  color: 0x7e22ce,
  roughness: 0.85,
  metalness: 0.0
});

const matFeatherEagle = new THREE.MeshStandardMaterial({
  name: 'mat_pluma_ceremonial',
  color: 0xfef08a,
  roughness: 0.6,
  metalness: 0.0
});

const matSoyateHat = new THREE.MeshStandardMaterial({
  name: 'mat_sombrero_soyate',
  color: 0xfde68a,
  roughness: 0.7,
  metalness: 0.0
});

const matKutsuriBag = new THREE.MeshStandardMaterial({
  name: 'mat_morral_kutsuri',
  color: 0xf8fafc,
  roughness: 0.85,
  metalness: 0.0
});

const matSignBoardWood = new THREE.MeshStandardMaterial({
  name: 'mat_letrero_madera',
  color: 0x2b1810,
  roughness: 0.45,
  metalness: 0.0
});

const matSignStone = new THREE.MeshStandardMaterial({
  name: 'mat_letrero_cantera',
  color: 0xe2d7cb,
  roughness: 0.4,
  metalness: 0.05
});

const matTextGold = new THREE.MeshStandardMaterial({
  name: 'mat_texto_oro_3d',
  color: 0xf59e0b,
  metalness: 0.5,
  roughness: 0.25
});

// Helper: Invertir normales y orden de devanado (winding) para superficies vistas desde el interior
function invertNormalsAndWinding(geometry) {
  const normals = geometry.attributes.normal;
  if (normals) {
    for (let i = 0; i < normals.count; i++) {
      normals.setXYZ(i, -normals.getX(i), -normals.getY(i), -normals.getZ(i));
    }
    normals.needsUpdate = true;
  }
  const index = geometry.index;
  if (index) {
    for (let i = 0; i < index.count; i += 3) {
      const tmp = index.getX(i);
      index.setX(i, index.getX(i + 2));
      index.setX(i + 2, tmp);
    }
    index.needsUpdate = true;
  }
}

// ==============================================================================
// 3. SUELO Y MEDALLÓN CENTRAL (Radio 8.5m)
// ==============================================================================
const sueloGroup = new THREE.Group();
sueloGroup.name = 'grupo_suelo';

// Suelo general de cantera pulida (36 segmentos)
const floorGeo = new THREE.CylinderGeometry(8.5, 8.5, 0.2, 36);
const floorMesh = new THREE.Mesh(floorGeo, matFloor);
floorMesh.position.y = -0.1;
floorMesh.name = 'suelo_principal';
sueloGroup.add(floorMesh);

// Medallón central concéntrico (Punto exacto del espectador en VR a (0,0,0))
const ringWoodGeo = new THREE.RingGeometry(2.5, 2.8, 36);
const ringWoodMesh = new THREE.Mesh(ringWoodGeo, matMedallionWood);
ringWoodMesh.rotation.x = -Math.PI / 2;
ringWoodMesh.position.y = 0.005;
sueloGroup.add(ringWoodMesh);

const ringTurqGeo = new THREE.RingGeometry(2.2, 2.5, 36);
const ringTurqMesh = new THREE.Mesh(ringTurqGeo, matMedallionTurquoise);
ringTurqMesh.rotation.x = -Math.PI / 2;
ringTurqMesh.position.y = 0.006;
sueloGroup.add(ringTurqMesh);

const innerDiscGeo = new THREE.CircleGeometry(2.2, 36);
const innerDiscMesh = new THREE.Mesh(innerDiscGeo, matMedallionBase);
innerDiscMesh.rotation.x = -Math.PI / 2;
innerDiscMesh.position.y = 0.007;
sueloGroup.add(innerDiscMesh);

// Estrella geométrica central Wixárika de 8 puntas
for (let i = 0; i < 4; i++) {
  const angle = (i * Math.PI) / 4;
  const starPetalGeo = new THREE.PlaneGeometry(0.5, 2.0);
  const starPetalMesh = new THREE.Mesh(starPetalGeo, i % 2 === 0 ? matMedallionTurquoise : matMedallionWood);
  starPetalMesh.rotation.x = -Math.PI / 2;
  starPetalMesh.rotation.z = angle;
  starPetalMesh.position.y = 0.008;
  sueloGroup.add(starPetalMesh);
}

const centerSpotGeo = new THREE.CircleGeometry(0.4, 24);
const centerSpotMesh = new THREE.Mesh(centerSpotGeo, matMedallionWood);
centerSpotMesh.rotation.x = -Math.PI / 2;
centerSpotMesh.position.y = 0.009;
sueloGroup.add(centerSpotMesh);

root.add(sueloGroup);

// ==============================================================================
// 4. MUROS PERIMETRALES Y MOLDURAS (Radio 8.0m, Alto 3.8m)
// ==============================================================================
const murosGroup = new THREE.Group();
murosGroup.name = 'grupo_muros';

// Muro cilíndrico continuo con normales apuntando hacia adentro (48 segmentos)
const wallGeo = new THREE.CylinderGeometry(8.0, 8.0, 3.8, 48, 1, true);
invertNormalsAndWinding(wallGeo);
const wallMesh = new THREE.Mesh(wallGeo, matWall);
wallMesh.position.y = 1.9;
wallMesh.name = 'muro_cilindrico';
murosGroup.add(wallMesh);

// Zócalo inferior de madera
const zocaloGeo = new THREE.CylinderGeometry(7.96, 7.96, 0.25, 48, 1, true);
invertNormalsAndWinding(zocaloGeo);
const zocaloMesh = new THREE.Mesh(zocaloGeo, matDarkWood);
zocaloMesh.position.y = 0.125;
zocaloMesh.name = 'zocalo_madera';
murosGroup.add(zocaloMesh);

// Cornisa superior de madera en transición al techo (Y = 3.7m)
const corniceGeo = new THREE.CylinderGeometry(7.88, 7.95, 0.2, 48, 1, true);
invertNormalsAndWinding(corniceGeo);
const corniceMesh = new THREE.Mesh(corniceGeo, matDarkWood);
corniceMesh.position.y = 3.7;
corniceMesh.name = 'cornisa_madera';
murosGroup.add(corniceMesh);

// 8 Pilastras arquitectónicas adosadas al muro
for (let i = 0; i < 8; i++) {
  const theta = (i * Math.PI * 2) / 8;
  const colGeo = new THREE.BoxGeometry(0.35, 3.8, 0.2);
  const colMesh = new THREE.Mesh(colGeo, matDarkWood);
  colMesh.position.set(Math.sin(theta) * 7.9, 1.9, Math.cos(theta) * 7.9);
  colMesh.rotation.y = theta;
  colMesh.name = `columna_${i + 1}`;
  murosGroup.add(colMesh);
}

root.add(murosGroup);

// ==============================================================================
// 5. TECHO Y DOMO CÓNICO (CORRECCIÓN DE ROTACIÓN Y NORMALES)
// ==============================================================================
const techoGroup = new THREE.Group();
techoGroup.name = 'grupo_techo_domo';

// Superficie cónica del techo con normales apuntando hacia el interior (48 segmentos)
const domeGeo = new THREE.CylinderGeometry(1.0, 8.0, 1.6, 48, 1, true);
invertNormalsAndWinding(domeGeo);
const domeMesh = new THREE.Mesh(domeGeo, matCeilingPanels);
domeMesh.position.y = 4.6; // Y de 3.8 a 5.4
domeMesh.name = 'superficie_domo_conico';
techoGroup.add(domeMesh);

// Anillo perimetral de madera en la base del domo (sellado visual de junta a Y = 3.8)
const domeBaseRingGeo = new THREE.CylinderGeometry(7.88, 7.94, 0.14, 48, 1, true);
invertNormalsAndWinding(domeBaseRingGeo);
const domeBaseRing = new THREE.Mesh(domeBaseRingGeo, matDarkWood);
domeBaseRing.position.y = 3.8;
techoGroup.add(domeBaseRing);

// 16 VIGAS RADIALES DE MADERA: Alineación Ortonormal Exacta (Zero Twist Bug Fix)
// Cada viga se alinea mediante base ortonormal [axisX (tangente), axisY (longitud), axisZ (profundidad)]
for (let i = 0; i < 16; i++) {
  const theta = (i * Math.PI * 2) / 16;
  const pWall = new THREE.Vector3(Math.sin(theta) * 7.95, 3.82, Math.cos(theta) * 7.95);
  const pOculus = new THREE.Vector3(Math.sin(theta) * 1.02, 5.38, Math.cos(theta) * 1.02);

  const midpoint = new THREE.Vector3().addVectors(pWall, pOculus).multiplyScalar(0.5);
  const beamLength = pWall.distanceTo(pOculus);

  // Viga con longitud a lo largo del eje Y local
  const beamGeo = new THREE.BoxGeometry(0.18, beamLength, 0.22);
  const beamMesh = new THREE.Mesh(beamGeo, matDarkWood);

  // Construcción de Base Ortonormal sin torsión
  const axisY = new THREE.Vector3().subVectors(pOculus, pWall).normalize(); // Dirección a lo largo de la viga
  const axisX = new THREE.Vector3(Math.cos(theta), 0, -Math.sin(theta)).normalize(); // Tangente horizontal estricta
  const axisZ = new THREE.Vector3().crossVectors(axisX, axisY).normalize(); // Normal perpendicular al techo

  const rotMat = new THREE.Matrix4().makeBasis(axisX, axisY, axisZ);
  beamMesh.quaternion.setFromRotationMatrix(rotMat);
  beamMesh.position.copy(midpoint);
  beamMesh.name = `viga_radial_${i + 1}`;
  techoGroup.add(beamMesh);
}

// Anillo estructural de madera del óculo central (R = 1.0m, Y = 5.4m)
const oculusRingGeo = new THREE.CylinderGeometry(0.96, 1.06, 0.32, 24);
const oculusRingMesh = new THREE.Mesh(oculusRingGeo, matDarkWood);
oculusRingMesh.position.y = 5.4;
oculusRingMesh.name = 'anillo_oculo';
techoGroup.add(oculusRingMesh);

// Tragaluz cenital / Cristal del óculo
const oculusGlassGeo = new THREE.CircleGeometry(0.95, 24);
const oculusGlassMesh = new THREE.Mesh(oculusGlassGeo, matOculusGlass);
oculusGlassMesh.rotation.x = Math.PI / 2;
oculusGlassMesh.position.y = 5.45;
oculusGlassMesh.name = 'tragaluz_oculo_cenital';
techoGroup.add(oculusGlassMesh);

// Riel perimetral de iluminación circular (R = 5.0m, Y = 4.2m)
const trackRingGeo = new THREE.TorusGeometry(5.0, 0.03, 6, 32);
const trackRingMesh = new THREE.Mesh(trackRingGeo, matLightingFixtures);
trackRingMesh.rotation.x = Math.PI / 2;
trackRingMesh.position.y = 4.2;
trackRingMesh.name = 'riel_iluminacion';
techoGroup.add(trackRingMesh);

// 12 Focos dirigidos orientados con vector ortonormal hacia paredes y pedestales
for (let i = 0; i < 12; i++) {
  const theta = (i * Math.PI * 2) / 12;
  const spotPos = new THREE.Vector3(Math.sin(theta) * 5.0, 4.18, Math.cos(theta) * 5.0);
  const spotTarget = new THREE.Vector3(Math.sin(theta) * 7.2, 1.2, Math.cos(theta) * 7.2);

  const spotGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.2, 12);
  const spotMesh = new THREE.Mesh(spotGeo, matLightingFixtures);

  const axisY = new THREE.Vector3().subVectors(spotTarget, spotPos).normalize();
  const axisX = new THREE.Vector3(Math.cos(theta), 0, -Math.sin(theta)).normalize();
  const axisZ = new THREE.Vector3().crossVectors(axisX, axisY).normalize();

  const spotRotMat = new THREE.Matrix4().makeBasis(axisX, axisY, axisZ);
  spotMesh.quaternion.setFromRotationMatrix(spotRotMat);
  spotMesh.position.copy(spotPos);
  spotMesh.name = `foco_riel_${i + 1}`;
  techoGroup.add(spotMesh);
}

root.add(techoGroup);

// ==============================================================================
// 6. CONSTRUCTORES DE MODELOS 3D DE LAS 6 DEIDADES SAGRADAS
// ==============================================================================

// DEIDAD 1: Tamatsi Kauyumari (El Hermano Mayor Venado Azul Sagrado)
function buildKauyumari() {
  const g = new THREE.Group();
  g.name = 'escultura_deidad_1_kauyumari';

  // Plinto ceremonial de base
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.04, 16), matDarkWood);
  plinth.position.y = 0.02;
  g.add(plinth);

  // Torso estilizado de venado
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.38, 12), matKauyumariBlue);
  body.rotation.x = Math.PI / 2 - 0.15;
  body.position.set(0, 0.32, -0.04);
  g.add(body);

  // Grupa trasera
  const rump = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), matKauyumariBlue);
  rump.position.set(0, 0.31, -0.21);
  g.add(rump);

  // Cola erguida con punta blanca
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.09, 6), matKauyumariWhite);
  tail.rotation.x = -Math.PI / 4;
  tail.position.set(0, 0.38, -0.27);
  g.add(tail);

  // Pecho orgulloso
  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), matKauyumariBlue);
  chest.position.set(0, 0.36, 0.13);
  g.add(chest);

  // Nierika sagrado turquesa en el pecho (corazón del venado)
  const heart = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.02), matKauyumariCyan);
  heart.rotation.z = Math.PI / 4;
  heart.position.set(0, 0.36, 0.23);
  g.add(heart);

  // Cuello largo y esbelto
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.24, 10), matKauyumariBlue);
  neck.rotation.x = -0.45;
  neck.position.set(0, 0.49, 0.18);
  g.add(neck);

  // Cabeza estilizada
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.18, 10), matKauyumariBlue);
  head.rotation.x = Math.PI / 2 + 0.25;
  head.position.set(0, 0.60, 0.25);
  g.add(head);

  // Hocico blanco y trufa
  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.032, 6, 4), matKauyumariWhite);
  muzzle.position.set(0, 0.57, 0.34);
  g.add(muzzle);

  // Ojos turquesa resplandecientes
  [-0.038, 0.038].forEach((eyeX) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.015, 6, 4), matKauyumariCyan);
    eye.position.set(eyeX, 0.62, 0.24);
    g.add(eye);
  });

  // Orejas alertas
  [-0.05, 0.05].forEach((earX, idx) => {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.1, 6), matKauyumariBlue);
    ear.rotation.set(0.3, 0, idx === 0 ? -0.5 : 0.5);
    ear.position.set(earX, 0.68, 0.20);
    g.add(ear);
  });

  // Astas Sagradas Doradas Ramificadas (4 tines por asta)
  [-0.04, 0.04].forEach((antlerX, idx) => {
    const sign = idx === 0 ? -1 : 1;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.018, 0.26, 6), matKauyumariGold);
    stem.rotation.set(-0.35, sign * 0.2, sign * 0.45);
    stem.position.set(antlerX + sign * 0.04, 0.75, 0.16);
    g.add(stem);

    const t1 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.12, 6), matKauyumariGold);
    t1.rotation.set(-0.7, 0, sign * 0.6);
    t1.position.set(antlerX + sign * 0.08, 0.77, 0.20);
    g.add(t1);

    const t2 = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.011, 0.11, 6), matKauyumariGold);
    t2.rotation.set(0.1, sign * 0.4, sign * 0.8);
    t2.position.set(antlerX + sign * 0.11, 0.83, 0.13);
    g.add(t2);

    const t3 = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.01, 0.09, 6), matKauyumariGold);
    t3.rotation.set(-0.5, sign * -0.2, sign * 0.3);
    t3.position.set(antlerX + sign * 0.07, 0.88, 0.14);
    g.add(t3);
  });

  // 4 Patas esbeltas y pezuñas doradas
  [
    [-0.065, 0.16, 0.10],
    [0.065, 0.16, 0.10],
    [-0.07, 0.15, -0.16],
    [0.07, 0.15, -0.16]
  ].forEach(([lx, ly, lz]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.32, 6), matKauyumariBlue);
    leg.position.set(lx, ly, lz);
    g.add(leg);

    const hoof = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.03, 0.045), matKauyumariGold);
    hoof.position.set(lx, 0.015, lz);
    g.add(hoof);
  });

  return g;
}

// DEIDAD 2: Tatewari (Nuestro Abuelo Fuego Sagrado)
function buildTatewari() {
  const g = new THREE.Group();
  g.name = 'escultura_deidad_2_tatewari';

  // Base circular de soporte
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.28, 0.04, 16), matDarkWood);
  base.position.y = 0.02;
  g.add(base);

  // Anillo de 8 piedras volcánicas sagradas
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8;
    const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.055, 0), matVolcanicStone);
    stone.position.set(Math.sin(angle) * 0.19, 0.06, Math.cos(angle) * 0.19);
    stone.rotation.set(i, i * 0.5, i * 0.3);
    g.add(stone);
  }

  // Leños de madera cruzados
  const logGeo = new THREE.CylinderGeometry(0.025, 0.028, 0.32, 6);
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 4;
    const log = new THREE.Mesh(logGeo, matCharcoalLogs);
    log.rotation.y = angle;
    log.rotation.z = Math.PI / 2;
    log.position.set(0, 0.06 + i * 0.015, 0);
    g.add(log);
  }

  // Brasas ardientes
  const embers = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.03, 10), matFlameRed);
  embers.position.y = 0.08;
  g.add(embers);

  // Lengua de fuego exterior roja
  const flameOuter = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.48, 8), matFlameRed);
  flameOuter.position.set(0, 0.32, 0);
  g.add(flameOuter);

  // Lenguas medias de fuego naranja danzante
  [-0.04, 0.04].forEach((fx, idx) => {
    const midFlame = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.42, 7), matFlameOrange);
    midFlame.rotation.z = idx === 0 ? 0.18 : -0.18;
    midFlame.position.set(fx, 0.31, idx === 0 ? 0.02 : -0.02);
    g.add(midFlame);
  });

  // Núcleo interno amarillo solar luminoso
  const coreFlame = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.52, 7), matFlameYellow);
  coreFlame.position.set(0, 0.37, 0);
  g.add(coreFlame);

  // Punta espiral superior de la flama divina
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.18, 6), matFlameYellow);
  tip.rotation.z = 0.12;
  tip.position.set(0.01, 0.65, 0);
  g.add(tip);

  // Jícara votiva tradicional con ofrenda
  const rukuri = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.025, 0.035, 8), matRukuriGourd);
  rukuri.position.set(0.13, 0.04, 0.16);
  g.add(rukuri);

  return g;
}

// DEIDAD 3: Tamatsi Tayaupa / Tau (Nuestro Padre Sol)
function buildTayaupa() {
  const g = new THREE.Group();
  g.name = 'escultura_deidad_3_tayaupa';

  // Base de madera sagrada
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.04, 0.22), matSunWood);
  base.position.y = 0.02;
  g.add(base);

  // Soporte vertical ceremonial
  const stand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.42, 0.08), matSunWood);
  stand.position.set(0, 0.23, -0.03);
  g.add(stand);

  // Horqueta de sujeción
  const bracket = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.08, 0.1, 10), matSunWood);
  bracket.position.set(0, 0.42, -0.02);
  g.add(bracket);

  // Gran Disco Solar Dorado Central (18 segmentos)
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.04, 18), matSunGold);
  disc.rotation.x = Math.PI / 2;
  disc.position.set(0, 0.52, 0.02);
  g.add(disc);

  // Aro concéntrico exterior en relieve (6x16 segmentos)
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.02, 6, 16), matSunCore);
  rim.position.set(0, 0.52, 0.045);
  g.add(rim);

  // Ojo sagrado Wixárika central (Tsikuri)
  const rhombus = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.11, 0.02), matSunRed);
  rhombus.rotation.z = Math.PI / 4;
  rhombus.position.set(0, 0.52, 0.05);
  g.add(rhombus);

  const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), matSunCore);
  pupil.position.set(0, 0.52, 0.065);
  g.add(pupil);

  // Corona de 12 Rayos Cósmicos Radiantes
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI * 2) / 12;
    const isLong = i % 2 === 0;
    const rayLength = isLong ? 0.18 : 0.12;
    const rayWidth = isLong ? 0.06 : 0.045;

    const ray = new THREE.Mesh(new THREE.ConeGeometry(rayWidth, rayLength, 4), isLong ? matSunGold : matSunCore);
    const rDist = 0.23 + rayLength * 0.48;
    ray.position.set(Math.sin(angle) * rDist, 0.52 + Math.cos(angle) * rDist, 0.02);
    ray.rotation.z = -angle;
    g.add(ray);
  }

  return g;
}

// DEIDAD 4: Takutsi Nakawe (Nuestra Abuela Tierra y Crecimiento)
function buildTakutsiNakawe() {
  const g = new THREE.Group();
  g.name = 'escultura_deidad_4_takutsi_nakawe';

  // Base circular
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.04, 16), matDarkWood);
  base.position.y = 0.02;
  g.add(base);

  // Manto / vestido cónico verde sierra (vegetación y cerros sagrados)
  const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.22, 0.48, 12), matEarthGreen);
  robe.position.y = 0.27;
  g.add(robe);

  // Chal / rebozo de tierra fértil ocre sobre los hombros
  const shawl = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.22, 12), matEarthBrown);
  shawl.position.y = 0.44;
  g.add(shawl);

  // Cabeza venerable de la deidad ancestral
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), matMedallionBase);
  head.position.set(0, 0.59, 0.02);
  g.add(head);

  // Cinta tejida en la frente
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.082, 0.015, 6, 14), matKauyumariCyan);
  band.rotation.x = Math.PI / 2;
  band.position.set(0, 0.61, 0.02);
  g.add(band);

  // Peinado tradicional en la nuca
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), matDarkWood);
  hair.position.set(0, 0.61, -0.06);
  g.add(hair);

  // Báculo sagrado de árbol nudoso
  const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.02, 0.76, 6), matAncientWood);
  staff.position.set(0.16, 0.38, 0.08);
  staff.rotation.z = -0.08;
  g.add(staff);

  // Retoño de vida en la cima del báculo
  const bud = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), matEarthGreen);
  bud.position.set(0.19, 0.77, 0.08);
  g.add(bud);

  // Jícara de la fertilidad en sus manos
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.035, 0.045, 10), matRukuriGourd);
  bowl.position.set(-0.02, 0.38, 0.15);
  g.add(bowl);

  // Granos dorados de maíz sagrado
  const seeds = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), matSeedGold);
  seeds.position.set(-0.02, 0.40, 0.15);
  g.add(seeds);

  return g;
}

// DEIDAD 5: Tatei Haramara (Nuestra Madre el Océano y Aguas Sagradas)
function buildTateiHaramara() {
  const g = new THREE.Group();
  g.name = 'escultura_deidad_5_tatei_haramara';

  // Base circular de soporte
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.28, 0.04, 16), matDarkWood);
  base.position.y = 0.02;
  g.add(base);

  // Ola 1: Océano profundo azul marino (6x16 segmentos)
  const wave1 = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.06, 6, 16, Math.PI * 1.8), matOceanDeep);
  wave1.rotation.x = Math.PI / 2;
  wave1.position.y = 0.08;
  g.add(wave1);

  // Ola 2: Agua turquesa brillante (6x16 segmentos)
  const wave2 = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.05, 6, 16, Math.PI * 1.6), matOceanTurquoise);
  wave2.rotation.x = Math.PI / 2 + 0.2;
  wave2.rotation.z = 1.0;
  wave2.position.set(0, 0.15, 0);
  g.add(wave2);

  // Cresta de espuma blanca pura (6x14 segmentos)
  const foam = new THREE.Mesh(new THREE.TorusGeometry(0.10, 0.035, 6, 14, Math.PI * 1.4), matSeaFoam);
  foam.rotation.x = Math.PI / 2 + 0.35;
  foam.rotation.z = 2.4;
  foam.position.set(0.02, 0.22, 0.02);
  g.add(foam);

  // Gran Caracol Sagrado Marino Ceremonial (Kura de nácar blanco marfil)
  const shell = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.38, 10), matPearlWhite);
  shell.rotation.set(-0.4, 0.3, 0.7);
  shell.position.set(-0.02, 0.35, -0.02);
  g.add(shell);

  // Vueltas espirales del caracol (5x10 segmentos)
  [0.08, 0.12, 0.15].forEach((swR, idx) => {
    const sw = new THREE.Mesh(new THREE.TorusGeometry(swR, 0.022, 5, 10), matPearlWhite);
    sw.rotation.set(-0.4, 0.3, 0.7);
    sw.position.set(-0.02 + idx * 0.03, 0.32 + idx * 0.06, -0.02);
    g.add(sw);
  });

  // Boca del caracol orientada hacia arriba
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.028, 6, 12), matOceanTurquoise);
  mouth.rotation.set(0.6, 0.2, 0.1);
  mouth.position.set(0.10, 0.44, 0.08);
  g.add(mouth);

  // Gotas de rocío sagrado / lluvia ascendente
  [
    [-0.08, 0.52, 0.05, 0.022],
    [0.04, 0.60, 0.12, 0.026],
    [0.12, 0.56, 0.02, 0.020],
    [0.01, 0.68, 0.07, 0.028]
  ].forEach(([dx, dy, dz, dr]) => {
    const drop = new THREE.Mesh(new THREE.SphereGeometry(dr, 6, 4), matOceanTurquoise);
    drop.position.set(dx, dy, dz);
    g.add(drop);
  });

  return g;
}

// DEIDAD 6: Tatei Híkuri (El Cactus Sagrado / Peyote)
function buildHikuri() {
  const g = new THREE.Group();
  g.name = 'escultura_deidad_6_hikuri_peyote';

  // Base circular
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.04, 16), matDarkWood);
  base.position.y = 0.02;
  g.add(base);

  // Jícara Ceremonial Tallada (Rukuri)
  const gourd = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.14, 0.10, 16), matRukuriGourd);
  gourd.position.y = 0.08;
  g.add(gourd);

  // Ribete de chaquira votiva en el borde (6x18 segmentos)
  const beads = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.016, 6, 18), matChaquiraBeads);
  beads.rotation.x = Math.PI / 2;
  beads.position.y = 0.13;
  g.add(beads);

  // Cama de tierra fértil
  const earth = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.02, 16), matCharcoalLogs);
  earth.position.y = 0.12;
  g.add(earth);

  // Núcleo semiesférico del peyote verde salvia (10x8 segmentos)
  const domeCore = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), matPeyoteGreen);
  domeCore.position.y = 0.13;
  g.add(domeCore);

  // 8 Gajos acanalados sagrados (7x5 segmentos)
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8;
    const ribGeo = new THREE.SphereGeometry(0.065, 7, 5);
    ribGeo.scale(1.0, 0.8, 1.8);
    const rib = new THREE.Mesh(ribGeo, matPeyoteGreen);
    const rDist = 0.09;
    rib.position.set(Math.sin(angle) * rDist, 0.18, Math.cos(angle) * rDist);
    rib.rotation.y = angle;
    g.add(rib);

    // Botón de pelusa blanca sagrada en cada gajo (5x4 segmentos)
    const tuft = new THREE.Mesh(new THREE.SphereGeometry(0.018, 5, 4), matPeyoteTufts);
    tuft.position.set(Math.sin(angle) * 0.11, 0.23, Math.cos(angle) * 0.11);
    g.add(tuft);
  }

  // Cáliz floral
  const flowerBase = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.02, 0.04, 8), matPeyoteGreen);
  flowerBase.position.y = 0.26;
  g.add(flowerBase);

  // 8 Pétalos rosados abiertos en estrella (5 segmentos)
  for (let p = 0; p < 8; p++) {
    const pAngle = (p * Math.PI * 2) / 8;
    const petal = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.08, 5), matPeyoteFlower);
    petal.rotation.x = Math.PI / 2 - 0.45;
    petal.rotation.z = -pAngle;
    petal.position.set(Math.sin(pAngle) * 0.04, 0.29, Math.cos(pAngle) * 0.04);
    g.add(petal);
  }

  // Pistilo solar amarillo en el centro de la flor
  const stamen = new THREE.Mesh(new THREE.SphereGeometry(0.022, 7, 5), matFlameYellow);
  stamen.position.y = 0.30;
  g.add(stamen);

  return g;
}

// ==============================================================================
// 7. CUADRANTE 1: PANTEÓN DE LAS 6 DEIDADES (180° / Sur / Z > 0)
// ==============================================================================
const deidadesGroup = new THREE.Group();
deidadesGroup.name = 'cuadrante_deidades';

// Plataforma curva escalonada base (24 segmentos)
const platformGeo = new THREE.CylinderGeometry(7.4, 7.4, 0.15, 24, 1, false, Math.PI * 0.72, Math.PI * 0.56);
const platformMesh = new THREE.Mesh(platformGeo, matMedallionBase);
platformMesh.position.y = 0.075;
platformMesh.name = 'plataforma_alcoba_deidades';
deidadesGroup.add(platformMesh);

const platformBorderGeo = new THREE.CylinderGeometry(6.65, 6.75, 0.16, 24, 1, true, Math.PI * 0.72, Math.PI * 0.56);
invertNormalsAndWinding(platformBorderGeo);
const platformBorderMesh = new THREE.Mesh(platformBorderGeo, matDarkWood);
platformBorderMesh.position.y = 0.08;
deidadesGroup.add(platformBorderMesh);

// Nicho curvo de pared (24 segmentos)
const nicheBackGeo = new THREE.CylinderGeometry(7.94, 7.94, 2.8, 24, 1, true, Math.PI * 0.72, Math.PI * 0.56);
invertNormalsAndWinding(nicheBackGeo);
const nicheBackMesh = new THREE.Mesh(nicheBackGeo, matWallNiche);
nicheBackMesh.position.y = 1.9;
deidadesGroup.add(nicheBackMesh);

// Cornisa del nicho de deidades (24 segmentos)
const nicheArchGeo = new THREE.CylinderGeometry(7.75, 7.82, 0.25, 24, 1, false, Math.PI * 0.72, Math.PI * 0.56);
const nicheArchMesh = new THREE.Mesh(nicheArchGeo, matDarkWood);
nicheArchMesh.position.y = 3.3;
deidadesGroup.add(nicheArchMesh);

// Configuración de los 6 Pedestales y sus Esculturas
const deidadesConfig = [
  {
    theta: Math.PI * 0.76,
    pedName: 'pedestal_deidad_1_kauyumari',
    builder: buildKauyumari
  },
  {
    theta: Math.PI * 0.86,
    pedName: 'pedestal_deidad_2_tatewari',
    builder: buildTatewari
  },
  {
    theta: Math.PI * 0.95,
    pedName: 'pedestal_deidad_3_tayaupa',
    builder: buildTayaupa
  },
  {
    theta: Math.PI * 1.05,
    pedName: 'pedestal_deidad_4_takutsi_nakawe',
    builder: buildTakutsiNakawe
  },
  {
    theta: Math.PI * 1.14,
    pedName: 'pedestal_deidad_5_tatei_haramara',
    builder: buildTateiHaramara
  },
  {
    theta: Math.PI * 1.24,
    pedName: 'pedestal_deidad_6_hikuri_peyote',
    builder: buildHikuri
  }
];

deidadesConfig.forEach((cfg) => {
  const pedGroup = new THREE.Group();
  pedGroup.name = cfg.pedName;

  // Plinto inferior (madera oscura)
  const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.12, 0.65), matPedestalBase);
  baseMesh.position.y = 0.06;
  pedGroup.add(baseMesh);

  // Columna / fuste
  const bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.76, 0.54), matPedestalBase);
  bodyMesh.position.y = 0.5;
  pedGroup.add(bodyMesh);

  // Moldura turquesa decorativa
  const trimMesh = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.04, 0.56), matMedallionTurquoise);
  trimMesh.position.y = 0.86;
  pedGroup.add(trimMesh);

  // Tope de cantera clara
  const topMesh = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.08, 0.62), matPedestalTop);
  topMesh.position.y = 0.92;
  topMesh.name = `tope_${cfg.pedName}`;
  pedGroup.add(topMesh);

  // MODELO 3D DE LA DEIDAD SOBRE SU PEDESTAL
  const sculpture = cfg.builder();
  sculpture.position.set(0, 0.96, 0); // Descansa exactamente sobre el tope de cantera
  pedGroup.add(sculpture);

  // Posicionar en el arco a R = 6.1m orientado hacia el centro del usuario
  const r = 6.1;
  pedGroup.position.set(Math.sin(cfg.theta) * r, 0.15, Math.cos(cfg.theta) * r);
  pedGroup.rotation.y = cfg.theta + Math.PI; // Mirando al espectador en (0,0,0)
  deidadesGroup.add(pedGroup);
});

root.add(deidadesGroup);

// ==============================================================================
// 8. CUADRANTE 2: GASTRONOMÍA TRADICIONAL WIXÁRIKA (90° / Este / X > 0)
// ==============================================================================
const gastroGroup = new THREE.Group();
gastroGroup.name = 'cuadrante_gastronomia';

// Nicho curvo de pared
const nicheGastroGeo = new THREE.CylinderGeometry(7.94, 7.94, 2.5, 24, 1, true, Math.PI * 0.28, Math.PI * 0.44);
invertNormalsAndWinding(nicheGastroGeo);
const nicheGastroMesh = new THREE.Mesh(nicheGastroGeo, matWallNiche);
nicheGastroMesh.position.y = 1.9;
gastroGroup.add(nicheGastroMesh);

// Gran Mesa Rústica de Exhibición Gastronómica (3.0m x 0.9m)
const tableGroup = new THREE.Group();
tableGroup.name = 'mesa_exhibicion_gastronomia';

const tableTopMesh = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.08, 0.9), matLightWood);
tableTopMesh.position.y = 0.82;
tableGroup.add(tableTopMesh);

[
  [-1.3, 0.39, -0.32],
  [1.3, 0.39, -0.32],
  [-1.3, 0.39, 0.32],
  [1.3, 0.39, 0.32]
].forEach(([x, y, z]) => {
  const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.78, 0.12), matDarkWood);
  leg.position.set(x, y, z);
  tableGroup.add(leg);
});

const stretcher = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.06, 0.08), matDarkWood);
stretcher.position.set(0, 0.2, 0);
tableGroup.add(stretcher);

// ------------------------------------------------------------------------------
// CONSTRUCTORES 3D DE GASTRONOMÍA WIXÁRIKA
// ------------------------------------------------------------------------------

// 1. Estación del Maíz Sagrado de 5 Colores (Ikú)
function buildMaizeStation() {
  const group = new THREE.Group();
  group.name = 'estacion_maiz_sagrado';

  // Canasta tejida de mimbre/otate (ovalada)
  const basketGeo = new THREE.CylinderGeometry(0.30, 0.22, 0.12, 18, 1, false);
  const basketMesh = new THREE.Mesh(basketGeo, matPalmBasket);
  basketMesh.position.y = 0.06;
  basketMesh.scale.set(1.15, 1.0, 0.85);
  group.add(basketMesh);

  // Borde trenzado
  const rimGeo = new THREE.TorusGeometry(0.30, 0.02, 6, 20);
  const rimMesh = new THREE.Mesh(rimGeo, matPalmBasket);
  rimMesh.rotation.x = Math.PI / 2;
  rimMesh.position.y = 0.12;
  rimMesh.scale.set(1.15, 0.85, 1.0);
  group.add(rimMesh);

  // Base de totomoxtle
  const bedGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.04, 16);
  const bedMesh = new THREE.Mesh(bedGeo, matTotomoxtle);
  bedMesh.position.y = 0.09;
  bedMesh.scale.set(1.1, 1.0, 0.8);
  group.add(bedMesh);

  // 5 Mazorcas sagradas de maíz de colores tradicionales (Ikú)
  const cornColors = [
    { name: 'maiz_azul_yuawi', mat: matMaizeBlue, pos: [-0.13, 0.13, -0.05], rot: [0.15, 0.3, 0.4] },
    { name: 'maiz_amarillo_kanari', mat: matMaizeYellow, pos: [0.0, 0.15, -0.07], rot: [-0.1, 0.0, 0.2] },
    { name: 'maiz_rojo_utsari', mat: matMaizeRed, pos: [0.13, 0.13, -0.04], rot: [-0.2, -0.3, -0.35] },
    { name: 'maiz_blanco_tusame', mat: matMaizeWhite, pos: [-0.07, 0.14, 0.05], rot: [0.35, 0.2, 0.6] },
    { name: 'maiz_pinto_tsipuari', mat: matMaizePinto, pos: [0.07, 0.14, 0.06], rot: [0.3, -0.2, -0.5] }
  ];

  cornColors.forEach((corn) => {
    const earGroup = new THREE.Group();
    earGroup.name = corn.name;

    const earGeo = new THREE.CylinderGeometry(0.026, 0.036, 0.22, 10);
    const earMesh = new THREE.Mesh(earGeo, corn.mat);
    earMesh.position.y = 0.11;
    earGroup.add(earMesh);

    const tipGeo = new THREE.SphereGeometry(0.026, 8, 6);
    const tipMesh = new THREE.Mesh(tipGeo, corn.mat);
    tipMesh.position.y = 0.22;
    earGroup.add(tipMesh);

    [-0.028, 0.028].forEach((hx, hIdx) => {
      const huskGeo = new THREE.PlaneGeometry(0.045, 0.16);
      const huskMesh = new THREE.Mesh(huskGeo, matTotomoxtle);
      huskMesh.rotation.set(0.2, hIdx === 0 ? 0.4 : -0.4, hIdx === 0 ? -0.3 : 0.3);
      huskMesh.position.set(hx, 0.05, 0);
      earGroup.add(huskMesh);
    });

    earGroup.position.set(...corn.pos);
    earGroup.rotation.set(...corn.rot);
    group.add(earGroup);
  });

  // 3 Jícaras votivas de madera pulida con granos desgranados
  const bowlConfigs = [
    { matGrain: matMaizeBlue, pos: [-0.18, 0.0, 0.24], label: 'jicara_granos_azules' },
    { matGrain: matMaizeYellow, pos: [0.0, 0.0, 0.26], label: 'jicara_granos_amarillos' },
    { matGrain: matMaizeRed, pos: [0.18, 0.0, 0.24], label: 'jicara_granos_rojos' }
  ];

  bowlConfigs.forEach((b) => {
    const bowlGroup = new THREE.Group();
    bowlGroup.name = b.label;

    const jicGeo = new THREE.CylinderGeometry(0.065, 0.04, 0.045, 12);
    const jicMesh = new THREE.Mesh(jicGeo, matRukuriGourd);
    jicMesh.position.y = 0.022;
    bowlGroup.add(jicMesh);

    const grainGeo = new THREE.SphereGeometry(0.058, 8, 6);
    const grainMesh = new THREE.Mesh(grainGeo, b.matGrain);
    grainMesh.position.y = 0.035;
    grainMesh.scale.set(1.0, 0.35, 1.0);
    bowlGroup.add(grainMesh);

    bowlGroup.position.set(...b.pos);
    group.add(bowlGroup);
  });

  return group;
}

// 2. Estación de Tortillas de Comal y Tamales Ceremoniales (Yeuxi)
function buildTortillasAndTamalesStation() {
  const group = new THREE.Group();
  group.name = 'estacion_tortillas_tamales';

  // Canastilla tortillera de palma
  const basketGeo = new THREE.CylinderGeometry(0.20, 0.17, 0.08, 16);
  const basket = new THREE.Mesh(basketGeo, matPalmBasket);
  basket.position.set(-0.16, 0.04, 0.05);
  group.add(basket);

  // Servilleta ceremonial bordada Wixárika
  const clothGeo = new THREE.PlaneGeometry(0.34, 0.34);
  const cloth = new THREE.Mesh(clothGeo, matEmbroideryCloth);
  cloth.rotation.x = -Math.PI / 2;
  cloth.rotation.z = Math.PI / 6;
  cloth.position.set(-0.16, 0.082, 0.05);
  group.add(cloth);

  // Pila de 10 tortillas de maíz azul y amarillo alternadas
  for (let i = 0; i < 10; i++) {
    const isBlue = i % 2 === 0;
    const tortGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.008, 14);
    const tortMesh = new THREE.Mesh(tortGeo, isBlue ? matTortillaBlue : matTortillaYellow);
    tortMesh.position.set(-0.16 + (i % 3 - 1) * 0.003, 0.086 + i * 0.009, 0.05 + (i % 2) * 0.003);
    group.add(tortMesh);
  }

  // Bandeja rústica de madera para tamales ceremoniales
  const trayGeo = new THREE.BoxGeometry(0.40, 0.03, 0.26);
  const tray = new THREE.Mesh(trayGeo, matLightWood);
  tray.position.set(0.20, 0.015, -0.02);
  group.add(tray);

  // 4 Tamales ceremoniales envueltos en totomoxtle con amarres
  const tamalPositions = [
    [-0.07, 0.04, -0.05, 0.18],
    [0.07, 0.04, -0.05, -0.12],
    [-0.07, 0.04, 0.05, -0.18],
    [0.07, 0.04, 0.05, 0.1]
  ];

  tamalPositions.forEach(([tx, ty, tz, trot], tIdx) => {
    const tamalGroup = new THREE.Group();
    tamalGroup.name = `tamal_ceremonial_${tIdx + 1}`;

    const tGeo = new THREE.CylinderGeometry(0.032, 0.036, 0.16, 8);
    const tMesh = new THREE.Mesh(tGeo, matTotomoxtle);
    tMesh.rotation.z = Math.PI / 2;
    tamalGroup.add(tMesh);

    [-0.05, 0.0, 0.05].forEach((tieX) => {
      const tieGeo = new THREE.TorusGeometry(0.036, 0.005, 5, 10);
      const tieMesh = new THREE.Mesh(tieGeo, matPalmBasket);
      tieMesh.rotation.y = Math.PI / 2;
      tieMesh.position.x = tieX;
      tamalGroup.add(tieMesh);
    });

    tamalGroup.position.set(0.20 + tx, ty, -0.02 + tz);
    tamalGroup.rotation.y = trot;
    group.add(tamalGroup);
  });

  return group;
}

// 3. Cazuela de Barro con Guiso Tradicional de Huachales
function buildStewStation() {
  const group = new THREE.Group();
  group.name = 'estacion_cazuela_guiso';

  const potGeo = new THREE.CylinderGeometry(0.22, 0.15, 0.11, 16);
  const pot = new THREE.Mesh(potGeo, matClayDark);
  pot.position.y = 0.055;
  group.add(pot);

  const rimGeo = new THREE.TorusGeometry(0.22, 0.018, 6, 16);
  const rim = new THREE.Mesh(rimGeo, matClayDark);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.11;
  group.add(rim);

  [-0.23, 0.23].forEach((hx, hIdx) => {
    const handleGeo = new THREE.TorusGeometry(0.04, 0.012, 5, 10, Math.PI);
    const handle = new THREE.Mesh(handleGeo, matClayDark);
    handle.rotation.z = hIdx === 0 ? Math.PI / 2 : -Math.PI / 2;
    handle.position.set(hx, 0.08, 0);
    group.add(handle);
  });

  const stewGeo = new THREE.CircleGeometry(0.20, 14);
  const stew = new THREE.Mesh(stewGeo, matStewHuachales);
  stew.rotation.x = -Math.PI / 2;
  stew.position.y = 0.095;
  group.add(stew);

  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI * 2) / 6;
    const r = 0.05 + (i % 2) * 0.04;
    const grain = new THREE.Mesh(new THREE.SphereGeometry(0.016, 5, 5), i % 2 === 0 ? matMaizeYellow : matMaizeRed);
    grain.position.set(Math.sin(angle) * r, 0.102, Math.cos(angle) * r);
    group.add(grain);
  }

  return group;
}

// 4. Gran Olla de Barro Nayarita y Bebidas Sagradas (Tejuino y Atole / Nava)
function buildOllaBeveragesStation() {
  const group = new THREE.Group();
  group.name = 'estacion_olla_bebidas';

  // Gran Olla de barro bruñido
  const bodyGeo = new THREE.SphereGeometry(0.19, 14, 12);
  const body = new THREE.Mesh(bodyGeo, matClayPot);
  body.position.y = 0.19;
  body.scale.set(1.0, 0.95, 1.0);
  group.add(body);

  const neckGeo = new THREE.CylinderGeometry(0.13, 0.10, 0.09, 14);
  const neck = new THREE.Mesh(neckGeo, matClayPot);
  neck.position.y = 0.34;
  group.add(neck);

  const mouthRimGeo = new THREE.TorusGeometry(0.13, 0.016, 6, 16);
  const mouthRim = new THREE.Mesh(mouthRimGeo, matClayPot);
  mouthRim.rotation.x = Math.PI / 2;
  mouthRim.position.y = 0.385;
  group.add(mouthRim);

  [-0.20, 0.20].forEach((ax, aIdx) => {
    const handleGeo = new THREE.TorusGeometry(0.055, 0.016, 5, 10, Math.PI * 0.85);
    const handle = new THREE.Mesh(handleGeo, matClayPot);
    handle.rotation.z = aIdx === 0 ? Math.PI * 0.4 : -Math.PI * 0.4;
    handle.position.set(ax, 0.22, 0);
    group.add(handle);
  });

  // Tapa de barro ladeada
  const lidGeo = new THREE.CylinderGeometry(0.05, 0.12, 0.035, 14);
  const lid = new THREE.Mesh(lidGeo, matClayPot);
  lid.position.set(0.11, 0.39, 0.07);
  lid.rotation.z = 0.35;
  group.add(lid);

  const knobGeo = new THREE.SphereGeometry(0.022, 6, 6);
  const knob = new THREE.Mesh(knobGeo, matClayPot);
  knob.position.set(0.12, 0.42, 0.07);
  group.add(knob);

  // Cucharón de madera tradicional
  const spoonStemGeo = new THREE.CylinderGeometry(0.011, 0.013, 0.42, 6);
  const spoonStem = new THREE.Mesh(spoonStemGeo, matLightWood);
  spoonStem.rotation.z = -0.42;
  spoonStem.position.set(-0.05, 0.39, 0);
  group.add(spoonStem);

  // 2 Jícaras servidas con tejuino tradicional
  [-0.17, 0.17].forEach((jx, jIdx) => {
    const jicGroup = new THREE.Group();
    jicGroup.name = `jicara_tejuino_${jIdx + 1}`;

    const jicGeo = new THREE.CylinderGeometry(0.06, 0.038, 0.05, 12);
    const jic = new THREE.Mesh(jicGeo, matRukuriGourd);
    jic.position.y = 0.025;
    jicGroup.add(jic);

    const drinkGeo = new THREE.CircleGeometry(0.055, 10);
    const drink = new THREE.Mesh(drinkGeo, matTejuinoDrink);
    drink.rotation.x = -Math.PI / 2;
    drink.position.y = 0.045;
    jicGroup.add(drink);

    jicGroup.position.set(jx, 0, 0.24);
    group.add(jicGroup);
  });

  // Molinillo tradicional de madera torneada
  const molStemGeo = new THREE.CylinderGeometry(0.011, 0.013, 0.36, 6);
  const molStem = new THREE.Mesh(molStemGeo, matLightWood);
  molStem.rotation.z = 0.65;
  molStem.position.set(0.22, 0.15, 0.16);
  group.add(molStem);

  const molHeadGeo = new THREE.CylinderGeometry(0.035, 0.03, 0.07, 10);
  const molHead = new THREE.Mesh(molHeadGeo, matLightWood);
  molHead.rotation.z = 0.65;
  molHead.position.set(0.30, 0.06, 0.16);
  group.add(molHead);

  return group;
}

// 5. Estación Lateral del Metate Sagrado de Piedra Volcánica
function buildMetateStation() {
  const group = new THREE.Group();
  group.name = 'estacion_metate_molienda';

  // Tronco rústico de pino
  const trunkGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.48, 14);
  const trunk = new THREE.Mesh(trunkGeo, matDarkWood);
  trunk.position.y = 0.24;
  group.add(trunk);

  // Metate tradicional cóncavo
  const metateBodyGeo = new THREE.BoxGeometry(0.46, 0.08, 0.30);
  const metateBody = new THREE.Mesh(metateBodyGeo, matMetateStone);
  metateBody.position.set(0, 0.52, 0);
  metateBody.rotation.x = 0.12;
  group.add(metateBody);

  // 3 Patas cónicas de piedra volcánica
  const legGeo = new THREE.ConeGeometry(0.032, 0.08, 6);
  [
    [-0.17, 0.46, -0.10],
    [0.17, 0.46, -0.10],
    [0.0, 0.45, 0.10]
  ].forEach(([lx, ly, lz]) => {
    const leg = new THREE.Mesh(legGeo, matMetateStone);
    leg.rotation.x = Math.PI;
    leg.position.set(lx, ly, lz);
    group.add(leg);
  });

  // Metlapil (mano de moler de piedra)
  const manoGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.34, 10);
  const mano = new THREE.Mesh(manoGeo, matMetateStone);
  mano.rotation.z = Math.PI / 2;
  mano.position.set(0, 0.58, -0.04);
  group.add(mano);

  // Porción de masa fresca de maíz azul
  const doughGeo = new THREE.SphereGeometry(0.065, 8, 6);
  doughGeo.scale(1.2, 0.4, 0.8);
  const dough = new THREE.Mesh(doughGeo, matMaizeBlue);
  dough.position.set(0.04, 0.57, 0.05);
  group.add(dough);

  return group;
}

// 6. Alacena Flotante (Items de Repisas de Muro)
function buildShelf1Items() {
  const shelf1Items = new THREE.Group();
  shelf1Items.name = 'repisa_gastronomia_1_items';

  [-0.65, 0.55].forEach((cx) => {
    const jugGroup = new THREE.Group();
    const jugBody = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), matClayPot);
    jugBody.position.y = 0.08;
    jugGroup.add(jugBody);

    const jugNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.045, 0.10, 8), matClayPot);
    jugNeck.position.y = 0.16;
    jugGroup.add(jugNeck);

    const jugHandle = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.01, 5, 8, Math.PI * 0.9), matClayPot);
    jugHandle.position.set(0.06, 0.14, 0);
    jugGroup.add(jugHandle);

    jugGroup.position.set(cx, 0.025, 0);
    shelf1Items.add(jugGroup);
  });

  [-0.18, 0.18].forEach((jx, idx) => {
    const jic = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.038, 0.04, 10), matRukuriGourd);
    jic.position.set(jx, 0.04, 0);
    shelf1Items.add(jic);

    const seeds = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 5), idx === 0 ? matSeedGold : matMaizeRed);
    seeds.scale.set(1.0, 0.35, 1.0);
    seeds.position.set(jx, 0.055, 0);
    shelf1Items.add(seeds);
  });

  return shelf1Items;
}

function buildShelf2Items() {
  const shelf2Items = new THREE.Group();
  shelf2Items.name = 'repisa_gastronomia_2_items';

  // Calabaza serrana entera
  const squashGroup = new THREE.Group();
  const squashBody = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), matSquashOrange);
  squashBody.scale.set(1.2, 0.85, 1.0);
  squashBody.position.y = 0.09;
  squashGroup.add(squashBody);

  const squashStem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.05, 5), matDarkWood);
  squashStem.rotation.z = 0.35;
  squashStem.position.set(0.02, 0.19, 0);
  squashGroup.add(squashStem);

  squashGroup.position.set(-0.45, 0.025, 0);
  shelf2Items.add(squashGroup);

  // 2 Jícaras con chiles secos de la sierra
  [0.0, 0.45].forEach((cx) => {
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.038, 0.04, 10), matRukuriGourd);
    bowl.position.set(cx, 0.04, 0);
    shelf2Items.add(bowl);

    for (let c = 0; c < 4; c++) {
      const angle = (c * Math.PI * 2) / 4;
      const chili = new THREE.Mesh(new THREE.ConeGeometry(0.011, 0.045, 5), matChiliRed);
      chili.rotation.set(0.4, angle, 0.3);
      chili.position.set(cx + Math.sin(angle) * 0.025, 0.058, Math.cos(angle) * 0.025);
      shelf2Items.add(chili);
    }
  });

  return shelf2Items;
}

// ------------------------------------------------------------------------------
// MONTAJE DE ESTACIONES GASTRONÓMICAS
// ------------------------------------------------------------------------------

// 1. Estación de Maíz Sagrado de 5 Colores (Lado izquierdo de la mesa: x = -0.85)
const maizeStation = buildMaizeStation();
maizeStation.position.set(-0.85, 0.86, 0.04);
tableGroup.add(maizeStation);

// 2. Estación de Tortillas y Tamales (Centro de la mesa: x = -0.05)
const tortStation = buildTortillasAndTamalesStation();
tortStation.position.set(-0.05, 0.86, 0.04);
tableGroup.add(tortStation);

// 3. Estación de Cazuela de Huachales (Centro-fondo de la mesa: x = 0.40, z = -0.15)
const stewStation = buildStewStation();
stewStation.position.set(0.40, 0.86, -0.14);
tableGroup.add(stewStation);

// 4. Estación de Olla de Bebidas y Tejuino (Lado derecho de la mesa: x = 0.95)
const ollaStation = buildOllaBeveragesStation();
ollaStation.position.set(0.95, 0.86, 0.02);
tableGroup.add(ollaStation);

// Montar la gran mesa en el cuadrante
tableGroup.position.set(6.4, 0, 0);
tableGroup.rotation.y = -Math.PI / 2;
gastroGroup.add(tableGroup);

// 5. Estación Lateral del Metate Ancestral de Molienda (Z = 1.9m, hacia el panteón de deidades)
const metateStation = buildMetateStation();
metateStation.position.set(5.75, 0, 1.85);
metateStation.rotation.y = -Math.PI / 2 - 0.25; // Inclinado hacia el espectador central
gastroGroup.add(metateStation);

// 6 y 7. Montar repisas flotantes con sus items tradicionales
const shelf1 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.05, 0.35), matLightWood);
shelf1.position.set(7.5, 1.6, 0);
shelf1.rotation.y = -Math.PI / 2;
shelf1.name = 'repisa_gastronomia_1';
const s1Items = buildShelf1Items();
shelf1.add(s1Items);
gastroGroup.add(shelf1);

const shelf2 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.05, 0.35), matLightWood);
shelf2.position.set(7.5, 2.1, 0);
shelf2.rotation.y = -Math.PI / 2;
shelf2.name = 'repisa_gastronomia_2';
const s2Items = buildShelf2Items();
shelf2.add(s2Items);
gastroGroup.add(shelf2);

root.add(gastroGroup);

// ==============================================================================
// 9. CUADRANTE 3: FIESTAS PATRONALES Y CEREMONIAS SAGRADAS (270° / Oeste / X < 0)
// ==============================================================================
const fiestasGroup = new THREE.Group();
fiestasGroup.name = 'cuadrante_fiestas_patronales';

// Nicho curvo de fondo en la pared oeste
const nicheFiestasGeo = new THREE.CylinderGeometry(7.94, 7.94, 2.5, 24, 1, true, Math.PI * 1.28, Math.PI * 0.44);
invertNormalsAndWinding(nicheFiestasGeo);
const nicheFiestasMesh = new THREE.Mesh(nicheFiestasGeo, matWallNiche);
nicheFiestasMesh.position.y = 1.9;
fiestasGroup.add(nicheFiestasMesh);

// ------------------------------------------------------------------------------
// 9.1 Altar del Tambor Ceremonial Sagrado (Tepu) y Fogón de Templanza
// ------------------------------------------------------------------------------
function buildTepuDrumStation() {
  const group = new THREE.Group();
  group.name = 'estacion_tambor_tepu';

  // Base / plataforma escalonada del altar
  const platformGeo = new THREE.CylinderGeometry(0.85, 0.92, 0.10, 20);
  const platform = new THREE.Mesh(platformGeo, matPedestalBase);
  platform.position.y = 0.05;
  group.add(platform);

  const platTrimGeo = new THREE.TorusGeometry(0.86, 0.02, 6, 20);
  const platTrim = new THREE.Mesh(platTrimGeo, matDarkWood);
  platTrim.rotation.x = Math.PI / 2;
  platTrim.position.y = 0.10;
  group.add(platTrim);

  // Cuerpo cilíndrico del tambor Tepu (tronco sagrado ahuecado)
  const drumBodyGeo = new THREE.CylinderGeometry(0.32, 0.28, 0.62, 16);
  const drumBody = new THREE.Mesh(drumBodyGeo, matDrumWood);
  drumBody.position.y = 0.52;
  group.add(drumBody);

  // Relieves tallados perimetrales en el tambor
  [0.34, 0.52, 0.70].forEach((ry) => {
    const ringGeo = new THREE.TorusGeometry(0.305, 0.016, 6, 16);
    const ring = new THREE.Mesh(ringGeo, matDarkWood);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = ry;
    group.add(ring);
  });

  // 3 Patas esculpidas en la base del tronco
  for (let leg = 0; leg < 3; leg++) {
    const lAngle = (leg * Math.PI * 2) / 3;
    const legGeo = new THREE.CylinderGeometry(0.045, 0.06, 0.24, 8);
    const legMesh = new THREE.Mesh(legGeo, matDrumWood);
    legMesh.position.set(Math.sin(lAngle) * 0.24, 0.21, Math.cos(lAngle) * 0.24);
    group.add(legMesh);
  }

  // Parche superior de piel de venado (tensado ceremonial)
  const drumHeadGeo = new THREE.CylinderGeometry(0.325, 0.325, 0.022, 16);
  const drumHead = new THREE.Mesh(drumHeadGeo, matLeatherDrum);
  drumHead.position.y = 0.835;
  group.add(drumHead);

  // Aro de tensión y clavijas de madera con soga perimetral
  const headRimGeo = new THREE.TorusGeometry(0.328, 0.018, 6, 16);
  const headRim = new THREE.Mesh(headRimGeo, matDarkWood);
  headRim.rotation.x = Math.PI / 2;
  headRim.position.y = 0.835;
  group.add(headRim);

  const numPegs = 10;
  for (let p = 0; p < numPegs; p++) {
    const pAngle = (p * Math.PI * 2) / numPegs;
    const pegGeo = new THREE.ConeGeometry(0.018, 0.06, 5);
    const peg = new THREE.Mesh(pegGeo, matDarkWood);
    peg.rotation.z = Math.PI;
    peg.position.set(Math.sin(pAngle) * 0.34, 0.81, Math.cos(pAngle) * 0.34);
    group.add(peg);

    // Cuerdas de tensión en zigzag hacia el cuerpo
    const ropeGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.30, 4);
    const rope = new THREE.Mesh(ropeGeo, matDrumRope);
    rope.position.set(Math.sin(pAngle) * 0.31, 0.66, Math.cos(pAngle) * 0.31);
    rope.rotation.x = (Math.cos(pAngle) * 0.12);
    rope.rotation.z = (-Math.sin(pAngle) * 0.12);
    group.add(rope);
  }

  // Baquetas ceremoniales cruzadas sobre el parche
  [-0.32, 0.32].forEach((rotZ, bIdx) => {
    const stickGroup = new THREE.Group();
    const shaftGeo = new THREE.CylinderGeometry(0.01, 0.012, 0.38, 5);
    const shaft = new THREE.Mesh(shaftGeo, matLightWood);
    shaft.rotation.z = Math.PI / 2;
    stickGroup.add(shaft);

    const malletHeadGeo = new THREE.SphereGeometry(0.028, 8, 8);
    const malletHead = new THREE.Mesh(malletHeadGeo, matLeatherDrum);
    malletHead.position.x = 0.19;
    stickGroup.add(malletHead);

    stickGroup.position.set(0, 0.855 + bIdx * 0.015, (bIdx - 0.5) * 0.04);
    stickGroup.rotation.y = rotZ * 2.2;
    group.add(stickGroup);
  });

  // Fogón ritual al pie del tambor (para calentar y templar el parche de venado)
  const hearthGroup = new THREE.Group();
  hearthGroup.name = 'fogon_templanza_tepu';
  hearthGroup.position.set(0, 0.10, 0.52);

  // 7 Piedras volcánicas circulares
  for (let s = 0; s < 7; s++) {
    const sAngle = (s * Math.PI * 2) / 7;
    const stoneGeo = new THREE.DodecahedronGeometry(0.052, 0);
    const stone = new THREE.Mesh(stoneGeo, matVolcanicStone);
    stone.position.set(Math.sin(sAngle) * 0.17, 0.038, Math.cos(sAngle) * 0.17);
    stone.rotation.set(s * 0.6, s * 0.4, s * 0.8);
    hearthGroup.add(stone);
  }

  // Leños de carbón cruzados
  for (let log = 0; log < 3; log++) {
    const lAngle = (log * Math.PI) / 3;
    const logGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.24, 6);
    const logMesh = new THREE.Mesh(logGeo, matCharcoalLogs);
    logMesh.rotation.y = lAngle;
    logMesh.rotation.x = Math.PI / 2;
    logMesh.position.y = 0.03;
    hearthGroup.add(logMesh);
  }

  // Brasas y flama sagrada suave
  const emberGeo = new THREE.SphereGeometry(0.065, 8, 6);
  const ember = new THREE.Mesh(emberGeo, matFlameOrange);
  ember.position.y = 0.045;
  hearthGroup.add(ember);

  const flameGeo = new THREE.ConeGeometry(0.04, 0.12, 6);
  const flame = new THREE.Mesh(flameGeo, matFlameYellow);
  flame.position.y = 0.10;
  hearthGroup.add(flame);

  group.add(hearthGroup);
  return group;
}

// ------------------------------------------------------------------------------
// 9.2 Mesa de Instrumentos Musicales de Fiesta (Xaweri, Kanari y Tuxame)
// ------------------------------------------------------------------------------
function buildFiestaMusicStation() {
  const group = new THREE.Group();
  group.name = 'estacion_musica_fiesta';

  // Mesa de exhibición
  const tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 0.8), matLightWood);
  tableTop.position.y = 0.82;
  group.add(tableTop);

  const tableBase = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.79, 0.68), matPedestalBase);
  tableBase.position.y = 0.395;
  group.add(tableBase);

  // 1. Violín Huichol Tradicional (Xaweri)
  const xaweriGroup = new THREE.Group();
  xaweriGroup.name = 'instrumento_xaweri';

  // Caja de resonancia rústica tallada en una pieza
  const xBodyGeo = new THREE.BoxGeometry(0.16, 0.05, 0.34);
  const xBody = new THREE.Mesh(xBodyGeo, matViolinWood);
  xaweriGroup.add(xBody);

  // Tapa armónica con curvatura y oídos sonoros
  const xTopGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.34, 10);
  const xTop = new THREE.Mesh(xTopGeo, matViolinWood);
  xTop.rotation.x = Math.PI / 2;
  xTop.scale.set(0.95, 0.32, 1);
  xTop.position.y = 0.026;
  xaweriGroup.add(xTop);

  // Cuello, diapasón y clavijero
  const xNeckGeo = new THREE.BoxGeometry(0.038, 0.032, 0.28);
  const xNeck = new THREE.Mesh(xNeckGeo, matDarkWood);
  xNeck.position.set(0, 0.02, 0.28);
  xaweriGroup.add(xNeck);

  // Clavijas de madera
  [-0.025, 0.025].forEach((px) => {
    [-0.04, 0.04].forEach((pz) => {
      const peg = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.004, 0.04, 5), matDarkWood);
      peg.rotation.z = Math.PI / 2;
      peg.position.set(px, 0.035, 0.36 + pz);
      xaweriGroup.add(peg);
    });
  });

  // Puente y cuerdas
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.025, 0.008), matDarkWood);
  bridge.position.set(0, 0.042, 0.02);
  xaweriGroup.add(bridge);

  // Arco del violín (con cerdas de crin de caballo)
  const bowShaftGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.54, 4);
  const bowShaft = new THREE.Mesh(bowShaftGeo, matViolinWood);
  bowShaft.rotation.x = Math.PI / 2;
  bowShaft.position.set(0.12, 0.02, 0.08);
  xaweriGroup.add(bowShaft);

  const bowHairGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.52, 3);
  const bowHair = new THREE.Mesh(bowHairGeo, matKauyumariWhite);
  bowHair.rotation.x = Math.PI / 2;
  bowHair.position.set(0.12, 0.008, 0.08);
  xaweriGroup.add(bowHair);

  xaweriGroup.position.set(-0.42, 0.87, 0.02);
  xaweriGroup.rotation.y = -0.15;
  group.add(xaweriGroup);

  // 2. Guitarra Huichola de Fiesta (Kanari)
  const kanariGroup = new THREE.Group();
  kanariGroup.name = 'instrumento_kanari';

  // Caja de resonancia (lóbulo inferior y superior)
  const kBody1 = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.065, 12), matGuitarWood);
  kBody1.rotation.x = Math.PI / 2;
  kBody1.position.z = -0.08;
  kanariGroup.add(kBody1);

  const kBody2 = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.065, 12), matGuitarWood);
  kBody2.rotation.x = Math.PI / 2;
  kBody2.position.z = 0.10;
  kanariGroup.add(kBody2);

  // Boca sonora con roseta circular grabada
  const kRosette = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.068, 12), matDarkWood);
  kRosette.rotation.x = Math.PI / 2;
  kRosette.position.z = 0.02;
  kanariGroup.add(kRosette);

  const kRosetteTrim = new THREE.Mesh(new THREE.TorusGeometry(0.046, 0.006, 4, 12), matSunGold);
  kRosetteTrim.position.set(0, 0.034, 0.02);
  kRosetteTrim.rotation.x = Math.PI / 2;
  kanariGroup.add(kRosetteTrim);

  // Mástil y clavijero
  const kNeck = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.035, 0.32), matDarkWood);
  kNeck.position.set(0, 0.02, 0.32);
  kanariGroup.add(kNeck);

  // 4 Clavijas de afinación
  [-0.03, 0.03].forEach((px) => {
    [0.40, 0.45].forEach((pz) => {
      const peg = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.004, 0.035, 5), matDarkWood);
      peg.rotation.z = Math.PI / 2;
      peg.position.set(px, 0.035, pz);
      kanariGroup.add(peg);
    });
  });

  kanariGroup.position.set(0.24, 0.88, 0.04);
  kanariGroup.rotation.y = 0.22;
  group.add(kanariGroup);

  // 3. Sonajas Ceremoniales de Jícara y Plumas (Tuxame)
  [-0.04, 0.58].forEach((rx, rIdx) => {
    const rattleGroup = new THREE.Group();
    rattleGroup.name = `sonaja_tuxame_${rIdx + 1}`;

    // Mango de madera torneada
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.014, 0.26, 6), matDarkWood);
    handle.rotation.x = Math.PI / 2;
    rattleGroup.add(handle);

    // Jícara esférica perforada con semillas
    const gourd = new THREE.Mesh(new THREE.SphereGeometry(0.068, 10, 8), matRukuriGourd);
    gourd.position.z = -0.10;
    rattleGroup.add(gourd);

    // Banda decorativa de chaquira
    const beadBand = new THREE.Mesh(new THREE.TorusGeometry(0.070, 0.007, 4, 12), rIdx === 0 ? matTsikuriRed : matChaquiraBeads);
    beadBand.position.z = -0.10;
    rattleGroup.add(beadBand);

    // Mechón de plumas sagradas en la punta
    const feather = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.12, 5), matFeatherEagle);
    feather.rotation.x = -Math.PI / 2;
    feather.position.z = -0.22;
    rattleGroup.add(feather);

    rattleGroup.position.set(rx, 0.87, rIdx === 0 ? -0.22 : -0.18);
    rattleGroup.rotation.y = 0.45 - rIdx * 0.9;
    group.add(rattleGroup);
  });

  return group;
}

// ------------------------------------------------------------------------------
// 9.3 Mesa de Objetos Sagrados de Fiesta (Tsikuri, Urukame, Sombrero y Morral)
// ------------------------------------------------------------------------------
function buildSacredObjectsStation() {
  const group = new THREE.Group();
  group.name = 'estacion_objetos_sagrados_fiesta';

  // Mesa de exhibición
  const tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 0.8), matLightWood);
  tableTop.position.y = 0.82;
  group.add(tableTop);

  const tableBase = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.79, 0.68), matPedestalBase);
  tableBase.position.y = 0.395;
  group.add(tableBase);

  // 1. Gran Ojo de Dios Ceremonial de 5 Rombos (Tsikuri de Protección)
  const tsikuriGroup = new THREE.Group();
  tsikuriGroup.name = 'gran_tsikuri_cinco_rombos';

  // Soporte de exhibición
  const standBase = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.12, 0.03, 12), matDarkWood);
  tsikuriGroup.add(standBase);
  const standPole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.48, 6), matDarkWood);
  standPole.position.y = 0.24;
  tsikuriGroup.add(standPole);

  // Cruz central de varas de madera
  const crossH = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.52, 5), matDarkWood);
  crossH.rotation.z = Math.PI / 2;
  crossH.position.y = 0.44;
  tsikuriGroup.add(crossH);

  const crossV = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.52, 5), matDarkWood);
  crossV.position.y = 0.44;
  tsikuriGroup.add(crossV);

  // Rombo Central Multicolor (4 capas concéntricas de estambre)
  const yarnLayers = [
    { size: 0.24, mat: matTsikuriRed, z: 0.002 },
    { size: 0.18, mat: matTsikuriBlue, z: 0.005 },
    { size: 0.12, mat: matTsikuriYellow, z: 0.008 },
    { size: 0.06, mat: matTsikuriPurple, z: 0.011 }
  ];
  yarnLayers.forEach((yl) => {
    const diamond = new THREE.Mesh(new THREE.PlaneGeometry(yl.size, yl.size), yl.mat);
    diamond.rotation.z = Math.PI / 4;
    diamond.position.set(0, 0.44, yl.z);
    tsikuriGroup.add(diamond);
  });

  // 4 Rombos Satélites en las puntas de la cruz
  const satOffsets = [
    { x: 0, y: 0.44 + 0.20 },
    { x: 0, y: 0.44 - 0.20 },
    { x: -0.20, y: 0.44 },
    { x: 0.20, y: 0.44 }
  ];
  satOffsets.forEach((so, sIdx) => {
    const satOuter = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.09), sIdx % 2 === 0 ? matTsikuriYellow : matTsikuriBlue);
    satOuter.rotation.z = Math.PI / 4;
    satOuter.position.set(so.x, so.y, 0.004);
    tsikuriGroup.add(satOuter);

    const satInner = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.05), matTsikuriRed);
    satInner.rotation.z = Math.PI / 4;
    satInner.position.set(so.x, so.y, 0.007);
    tsikuriGroup.add(satInner);
  });

  tsikuriGroup.position.set(-0.44, 0.85, -0.05);
  group.add(tsikuriGroup);

  // 2. Sombrero Tradicional de Soyate con Borlas y Plumas
  const hatGroup = new THREE.Group();
  hatGroup.name = 'sombrero_soyate_fiesta';

  // Ala ancha circular
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.014, 18), matSoyateHat);
  hatGroup.add(brim);

  // Copa baja cónica
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.085, 16), matSoyateHat);
  crown.position.y = 0.045;
  hatGroup.add(crown);

  // Toquilla con bordado rojo
  const hatBand = new THREE.Mesh(new THREE.TorusGeometry(0.142, 0.008, 4, 16), matTsikuriRed);
  hatBand.rotation.x = Math.PI / 2;
  hatBand.position.y = 0.015;
  hatGroup.add(hatBand);

  // 8 Borlas de estambre colgando del ala
  for (let t = 0; t < 8; t++) {
    const tAngle = (t * Math.PI * 2) / 8;
    const tassel = new THREE.Mesh(new THREE.SphereGeometry(0.016, 6, 6), t % 2 === 0 ? matTsikuriRed : matTsikuriBlue);
    tassel.position.set(Math.sin(tAngle) * 0.23, -0.018, Math.cos(tAngle) * 0.23);
    hatGroup.add(tassel);
  }

  // Pluma ceremonial en la toquilla
  const hatFeather = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.14, 4), matFeatherEagle);
  hatFeather.rotation.set(0.4, 0.2, 0.5);
  hatFeather.position.set(0.11, 0.08, 0.08);
  hatGroup.add(hatFeather);

  hatGroup.position.set(0.12, 0.86, -0.12);
  hatGroup.rotation.set(0.1, -0.2, 0.05);
  group.add(hatGroup);

  // 3. Flechas de Plegaria Sagradas (Urukame)
  [-0.06, 0.06].forEach((uy, uIdx) => {
    const arrowGroup = new THREE.Group();
    arrowGroup.name = `flecha_urukame_${uIdx + 1}`;

    // Asta de carrizo / madera
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.58, 4), matLightWood);
    shaft.rotation.z = Math.PI / 2;
    arrowGroup.add(shaft);

    // Punta de piedra / pedernal tallado
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.05, 4), matVolcanicStone);
    tip.rotation.z = -Math.PI / 2;
    tip.position.x = 0.31;
    arrowGroup.add(tip);

    // Plumas de halcón / águila en la culata
    const fletch1 = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.024), matFeatherEagle);
    fletch1.position.set(-0.24, 0.014, 0);
    arrowGroup.add(fletch1);

    const fletch2 = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.024), matFeatherEagle);
    fletch2.rotation.x = Math.PI / 2;
    fletch2.position.set(-0.24, 0, 0.014);
    arrowGroup.add(fletch2);

    // Jícara votiva miniatura atada al asta
    const miniRukuri = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), matRukuriGourd);
    miniRukuri.position.set(0.04, -0.02, 0);
    arrowGroup.add(miniRukuri);

    arrowGroup.position.set(0.15, 0.87, 0.14 + uy);
    arrowGroup.rotation.y = 0.12 + uIdx * 0.08;
    group.add(arrowGroup);
  });

  // 4. Morral Tradicional Bordado (Kutsuri)
  const kutsuriGroup = new THREE.Group();
  kutsuriGroup.name = 'morral_kutsuri_fiesta';

  const bagBody = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.035, 0.26), matKutsuriBag);
  kutsuriGroup.add(bagBody);

  // Bordado central de rombo y venado sagrado
  const embPatch = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.18), matTsikuriRed);
  embPatch.rotation.x = -Math.PI / 2;
  embPatch.position.y = 0.019;
  kutsuriGroup.add(embPatch);

  const embDeer = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.11), matKauyumariBlue);
  embDeer.rotation.x = -Math.PI / 2;
  embDeer.rotation.z = Math.PI / 4;
  embDeer.position.y = 0.021;
  kutsuriGroup.add(embDeer);

  // Correa tejida cayendo al frente
  const strapGeo = new THREE.BoxGeometry(0.04, 0.01, 0.32);
  const strap = new THREE.Mesh(strapGeo, matTsikuriYellow);
  strap.position.set(-0.06, 0.015, 0.22);
  strap.rotation.y = 0.3;
  kutsuriGroup.add(strap);

  kutsuriGroup.position.set(0.52, 0.86, -0.04);
  kutsuriGroup.rotation.y = -0.35;
  group.add(kutsuriGroup);

  return group;
}

// ------------------------------------------------------------------------------
// 9.4 Cuadros de Estambre Ceremoniales en Muro (Nierikas de Fiesta)
// ------------------------------------------------------------------------------
const nierikaFiestasThemes = [
  { name: 'nierika_fiesta_1', title: 'Tatei Neixa', motifMat: matMaizeYellow, coreMat: matTsikuriRed },
  { name: 'nierika_fiesta_2', title: 'Peregrinacion Wirikuta', motifMat: matKauyumariBlue, coreMat: matPeyoteGreen },
  { name: 'nierika_fiesta_3', title: 'Tatewari y la Noche', motifMat: matFlameOrange, coreMat: matFlameYellow }
];

[-1.6, 0, 1.6].forEach((offsetZ, nIdx) => {
  const nTheme = nierikaFiestasThemes[nIdx];
  const nierikaGroup = new THREE.Group();
  nierikaGroup.name = nTheme.name;

  // Marco de madera tallada oscura
  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.2, 0.06), matDarkWood);
  frame.name = `${nTheme.name}_marco`;
  nierikaGroup.add(frame);

  // Lienzo de cera de campeche y estambre
  const canvas = new THREE.Mesh(new THREE.PlaneGeometry(0.76, 1.06), matMedallionBase);
  canvas.position.z = 0.032;
  canvas.name = `${nTheme.name}_lienzo`;
  nierikaGroup.add(canvas);

  // Relieve de estambre concéntrico y figura sagrada
  const sunDisk = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.012, 16), nTheme.motifMat);
  sunDisk.rotation.x = Math.PI / 2;
  sunDisk.position.set(0, 0.18, 0.042);
  nierikaGroup.add(sunDisk);

  const sacredCore = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.016), nTheme.coreMat);
  sacredCore.rotation.z = Math.PI / 4;
  sacredCore.position.set(0, 0.18, 0.048);
  nierikaGroup.add(sacredCore);

  const borderTrim = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.014, 4, 16), matTsikuriPurple);
  borderTrim.position.set(0, 0.18, 0.052);
  nierikaGroup.add(borderTrim);

  // Motivos inferiores de maíz y ofrendas
  [-0.18, 0.18].forEach((mx) => {
    const symbol = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.22, 5), nTheme.motifMat);
    symbol.position.set(mx, -0.25, 0.042);
    nierikaGroup.add(symbol);
  });

  nierikaGroup.position.set(-7.7, 2.0, offsetZ);
  nierikaGroup.rotation.y = Math.PI / 2;
  fiestasGroup.add(nierikaGroup);
});

// ------------------------------------------------------------------------------
// MONTAJE DE ESTACIONES DE FIESTAS Y CEREMONIAS
// ------------------------------------------------------------------------------

// 1. Altar del Tambor Tepu (Centro del cuadrante: X = -6.0, Z = 0)
const tepuStation = buildTepuDrumStation();
tepuStation.position.set(-6.0, 0, 0);
tepuStation.rotation.y = Math.PI / 2;
fiestasGroup.add(tepuStation);

// 2. Mesa de Instrumentos Musicales (Hacia la entrada: X = -5.7, Z = -1.85)
const musicStation = buildFiestaMusicStation();
musicStation.position.set(-5.7, 0, -1.85);
musicStation.rotation.y = Math.PI / 2 + 0.25; // Angulado hacia el espectador central
fiestasGroup.add(musicStation);

// 3. Mesa de Objetos Sagrados y Votivos (Hacia las deidades: X = -5.7, Z = 1.85)
const sacredStation = buildSacredObjectsStation();
sacredStation.position.set(-5.7, 0, 1.85);
sacredStation.rotation.y = Math.PI / 2 - 0.25; // Angulado hacia el espectador central
fiestasGroup.add(sacredStation);

root.add(fiestasGroup);

// ==============================================================================
// 10. CUADRANTE 4: BIENVENIDA Y PÓRTICO (0° / Norte / Z < 0)
// ==============================================================================
const bienvenidaGroup = new THREE.Group();
bienvenidaGroup.name = 'cuadrante_bienvenida';

const welcomeBoard = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.8, 0.08), matDarkWood);
welcomeBoard.position.set(0, 2.0, -7.8);
welcomeBoard.name = 'panel_bienvenida_marco';
bienvenidaGroup.add(welcomeBoard);

const welcomeInner = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 1.6), matMedallionBase);
welcomeInner.position.set(0, 2.0, -7.75);
welcomeInner.name = 'panel_bienvenida_lienzo';
bienvenidaGroup.add(welcomeInner);

[-2.0, 2.0].forEach((posX, pIdx) => {
  const pilar = new THREE.Mesh(new THREE.BoxGeometry(0.35, 3.8, 0.35), matDarkWood);
  pilar.position.set(posX, 1.9, -7.6);
  pilar.name = `pilar_portico_${pIdx + 1}`;
  bienvenidaGroup.add(pilar);
});

const lintel = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.3, 0.3), matDarkWood);
lintel.position.set(0, 3.2, -7.6);
lintel.name = 'dintel_portico';
bienvenidaGroup.add(lintel);

[-2.2, 2.2].forEach((posX, pIdx) => {
  const entryPed = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 0.75, 16), matPedestalBase);
  entryPed.position.set(posX, 0.375, -5.5);
  entryPed.name = `pedestal_entrada_${pIdx + 1}`;
  bienvenidaGroup.add(entryPed);

  const entryTop = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.06, 16), matPedestalTop);
  entryTop.position.set(posX, 0.78, -5.5);
  bienvenidaGroup.add(entryTop);
});

root.add(bienvenidaGroup);

// ==============================================================================
// 10.5 LETREROS MUSEOGRÁFICOS ILUSTRATIVOS CON RELIEVE 3D (4 SECCIONES)
// ==============================================================================
const letrerosGroup = new THREE.Group();
letrerosGroup.name = 'letreros_museograficos';

// Emblema Escultural 3D para Deidades Sagradas (Kauyumari: Hermano Mayor Venado Azul y Sol)
function buildDeitiesEmblem() {
  const group = new THREE.Group();
  group.name = 'emblema_deidades';

  // Disco de sol posterior
  const sunDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.02, 16), matSunGold);
  sunDisc.rotation.x = Math.PI / 2;
  group.add(sunDisc);

  // Cabeza estilizada de venado azul Kauyumari
  const headGeo = new THREE.ConeGeometry(0.065, 0.22, 6);
  const head = new THREE.Mesh(headGeo, matKauyumariBlue);
  head.rotation.x = -Math.PI / 2;
  head.position.set(0, 0, 0.06);
  group.add(head);

  // Ojos de turquesa
  [-0.038, 0.038].forEach((ox) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.016, 6, 6), matKauyumariCyan);
    eye.position.set(ox, 0.04, 0.08);
    group.add(eye);
  });

  // Astas sagradas ramificadas doradas
  [-0.065, 0.065].forEach((ax, aIdx) => {
    const mainAntler = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.018, 0.24, 5), matKauyumariGold);
    mainAntler.position.set(ax, 0.12, 0.02);
    mainAntler.rotation.z = aIdx === 0 ? 0.35 : -0.35;
    group.add(mainAntler);

    const tine = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.11, 4), matKauyumariGold);
    tine.position.set(ax * 1.55, 0.15, 0.04);
    tine.rotation.z = aIdx === 0 ? 0.8 : -0.8;
    group.add(tine);
  });

  // Rombo sagrado de peyote en la frente
  const foreheadDiamond = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.01), matPeyoteGreen);
  foreheadDiamond.rotation.z = Math.PI / 4;
  foreheadDiamond.position.set(0, 0.02, 0.14);
  group.add(foreheadDiamond);

  group.scale.set(0.85, 0.85, 0.85);
  return group;
}

// Emblema Escultural 3D para Gastronomía Tradicional (Mazorca Sagrada Ikú y Cazuela)
function buildGastroEmblem() {
  const group = new THREE.Group();
  group.name = 'emblema_gastronomia';

  // Mazorca sagrada dorada
  const earGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.22, 10);
  const ear = new THREE.Mesh(earGeo, matMaizeYellow);
  ear.position.set(0, 0.04, 0.02);
  group.add(ear);

  // Granos en relieve
  for (let g = 0; g < 4; g++) {
    const gy = -0.04 + g * 0.05;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.058, 0.012, 4, 10), matSunGold);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, gy, 0.02);
    group.add(ring);
  }

  // Hojas de totomoxtle abiertas
  [-0.06, 0.06].forEach((hx, hIdx) => {
    const husk = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.24, 4), matTotomoxtle);
    husk.position.set(hx, 0.01, 0.01);
    husk.rotation.z = hIdx === 0 ? -0.35 : 0.35;
    group.add(husk);
  });

  // Cazuelita de barro al frente
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.06, 0.07, 12), matClayPot);
  pot.position.set(0, -0.07, 0.07);
  group.add(pot);

  // Cucharón de madera cruzado
  const spoon = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.18, 4), matLightWood);
  spoon.position.set(0.02, -0.04, 0.10);
  spoon.rotation.z = 0.55;
  group.add(spoon);

  group.scale.set(0.85, 0.85, 0.85);
  return group;
}

// Emblema Escultural 3D para Fiestas Patronales (Tsikuri Ojo de Dios, Plumas y Tambor Tepu)
function buildFiestasEmblem() {
  const group = new THREE.Group();
  group.name = 'emblema_fiestas';

  // Rombo Tsikuri principal
  const outerDiamond = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.015), matTsikuriRed);
  outerDiamond.rotation.z = Math.PI / 4;
  group.add(outerDiamond);

  const midDiamond = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.17, 0.02), matTsikuriBlue);
  midDiamond.rotation.z = Math.PI / 4;
  midDiamond.position.z = 0.006;
  group.add(midDiamond);

  const innerDiamond = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.10, 0.025), matTsikuriYellow);
  innerDiamond.rotation.z = Math.PI / 4;
  innerDiamond.position.z = 0.012;
  group.add(innerDiamond);

  // Tamborcito Tepu en relieve al frente
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.11, 10), matDrumWood);
  drum.position.set(0, -0.05, 0.05);
  group.add(drum);

  const drumSkin = new THREE.Mesh(new THREE.CylinderGeometry(0.066, 0.066, 0.012, 10), matLeatherDrum);
  drumSkin.position.set(0, 0.006, 0.05);
  group.add(drumSkin);

  // Plumas ceremoniales laterales
  [-0.14, 0.14].forEach((fx, fIdx) => {
    const feather = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.16, 4), matFeatherEagle);
    feather.position.set(fx, 0.06, 0.02);
    feather.rotation.z = fIdx === 0 ? 0.6 : -0.6;
    group.add(feather);
  });

  group.scale.set(0.85, 0.85, 0.85);
  return group;
}

// Emblema Escultural 3D para Bienvenida Cultural (Estrella Sagrada de 8 Puntas de Wirikuta)
function buildBienvenidaEmblem() {
  const group = new THREE.Group();
  group.name = 'emblema_bienvenida';

  // Anillo exterior de cantera con grecas
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.018, 5, 16), matMedallionTurquoise);
  group.add(ring);

  // Estrella de 8 puntas (2 cuadrados cruzados a 45 grados)
  const sq1 = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.19, 0.016), matKauyumariGold);
  group.add(sq1);

  const sq2 = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.19, 0.016), matKauyumariGold);
  sq2.rotation.z = Math.PI / 4;
  group.add(sq2);

  // Núcleo central del ojo sagrado
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.024, 12), matMedallionBase);
  core.rotation.x = Math.PI / 2;
  core.position.z = 0.01;
  group.add(core);

  const bead = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), matFlameOrange);
  bead.position.z = 0.026;
  group.add(bead);

  group.scale.set(0.85, 0.85, 0.85);
  return group;
}

// Constructor Maestro de Letrero Museográfico de Sección
function createSignPost(titleText, subtitleText, emblemGroup, nodeName, position, yawAngle) {
  const signGroup = new THREE.Group();
  signGroup.name = nodeName;

  // 1. Base robusta de pedestal en el suelo
  const basePlinth = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.08, 16), matPedestalBase);
  basePlinth.position.y = 0.04;
  signGroup.add(basePlinth);

  const baseTrim = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.04, 16), matDarkWood);
  baseTrim.position.y = 0.10;
  signGroup.add(baseTrim);

  // 2. Columna / Fuste vertical del atril
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.76, 0.12), matPedestalBase);
  post.position.y = 0.48;
  signGroup.add(post);

  const capital = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.18), matDarkWood);
  capital.position.y = 0.86;
  signGroup.add(capital);

  // 3. Tablero de lectura inclinado hacia el espectador (32 grados de declinación)
  const plaqueHead = new THREE.Group();
  plaqueHead.position.set(0, 0.94, 0);
  plaqueHead.rotation.x = -Math.PI / 5.5; // Inclinado hacia el visitante para lectura cómoda

  // Marco de madera noble
  const frameBoard = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.52, 0.04), matSignBoardWood);
  plaqueHead.add(frameBoard);

  // Lienzo interior de piedra / pátina museográfica
  const innerPlate = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.44, 0.015), matSignStone);
  innerPlate.position.z = 0.018;
  plaqueHead.add(innerPlate);

  // Título principal en relieve 3D (TextGeometry con helvetiker_bold)
  const textGeo = new TextGeometry(titleText, {
    font,
    size: 0.065,
    depth: 0.014,
    curveSegments: 1
  });
  textGeo.center();
  const textMesh = new THREE.Mesh(textGeo, matTextGold);
  textMesh.position.set(0, 0.08, 0.032);
  plaqueHead.add(textMesh);

  // Barra de acento geométrico Wixárika con rombo central
  const barMesh = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.007, 0.008), matMedallionTurquoise);
  barMesh.position.set(0, 0.012, 0.032);
  plaqueHead.add(barMesh);

  const barDiamond = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.024, 0.01), matKauyumariGold);
  barDiamond.rotation.z = Math.PI / 4;
  barDiamond.position.set(0, 0.012, 0.034);
  plaqueHead.add(barDiamond);

  // Subtítulo descriptivo en relieve 3D
  const subGeo = new TextGeometry(subtitleText, {
    font,
    size: 0.032,
    depth: 0.008,
    curveSegments: 1
  });
  subGeo.center();
  const subMesh = new THREE.Mesh(subGeo, matDarkWood);
  subMesh.position.set(0, -0.06, 0.032);
  plaqueHead.add(subMesh);

  // 4. Montar Emblema Escultural 3D en la corona superior del atril
  if (emblemGroup) {
    const emblemMount = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.03), matDarkWood);
    emblemMount.position.set(0, 0.28, 0);
    plaqueHead.add(emblemMount);

    emblemGroup.position.set(0, 0.46, 0.02);
    plaqueHead.add(emblemGroup);
  }

  signGroup.add(plaqueHead);

  // Posicionar y orientar en la sala
  signGroup.position.set(position[0], position[1], position[2]);
  signGroup.rotation.y = yawAngle;

  return signGroup;
}

// ------------------------------------------------------------------------------
// INSTANCIACIÓN DE LOS 4 LETREROS MUSEOGRÁFICOS
// ------------------------------------------------------------------------------

// 1. Letrero de la Sección de Deidades Sagradas (Sur / Z = 4.4, mirando hacia el centro -Z)
const signDeidades = createSignPost(
  'DEIDADES SAGRADAS',
  'COSMOVISION',
  buildDeitiesEmblem(),
  'letrero_seccion_deidades',
  [0.0, 0.0, 4.4],
  Math.PI // Frente orientado hacia (0, 0, 0)
);
letrerosGroup.add(signDeidades);

// 2. Letrero de la Sección de Gastronomía Tradicional (Este / X = 4.8, Z = -1.6)
const signGastro = createSignPost(
  'GASTRONOMIA TRADICIONAL',
  'TRADICION',
  buildGastroEmblem(),
  'letrero_seccion_gastronomia',
  [4.8, 0.0, -1.6],
  Math.atan2(-4.8, 1.6) // Frente orientado hacia (0, 0, 0)
);
letrerosGroup.add(signGastro);

// 3. Letrero de la Sección de Fiestas y Ceremonias (Oeste / X = -4.8, Z = -1.6)
const signFiestas = createSignPost(
  'FIESTAS Y CEREMONIAS',
  'CEREMONIAS',
  buildFiestasEmblem(),
  'letrero_seccion_fiestas',
  [-4.8, 0.0, -1.6],
  Math.atan2(4.8, 1.6) // Frente orientado hacia (0, 0, 0)
);
letrerosGroup.add(signFiestas);

// 4. Letrero de la Sección de Bienvenida (Norte / Z = -5.2, mirando hacia el centro +Z)
const signBienvenida = createSignPost(
  'BIENVENIDA CULTURAL',
  'KALIHUEY',
  buildBienvenidaEmblem(),
  'letrero_seccion_bienvenida',
  [0.0, 0.0, -5.2],
  0.0 // Frente orientado hacia (0, 0, 0)
);
letrerosGroup.add(signBienvenida);

root.add(letrerosGroup);

// ==============================================================================
// 11. VALIDACIÓN CONTRA OPEN SPEC (specs/museo_wixarika_spec.yaml)
// ==============================================================================
let totalVertices = 0;
let totalTriangles = 0;
const foundDeities = [];

const meshBreakdown = [];
scene.traverse((node) => {
  if (node.isMesh && node.geometry) {
    const geo = node.geometry;
    const pos = geo.attributes.position;
    if (pos) {
      totalVertices += pos.count;
      meshBreakdown.push({
        name: node.name || node.parent?.name || 'mesh',
        type: geo.type,
        verts: pos.count
      });
    }
    if (geo.index) {
      totalTriangles += geo.index.count / 3;
    } else if (pos) {
      totalTriangles += pos.count / 3;
    }
  }
  if (node.name && node.name.startsWith('escultura_deidad_')) {
    foundDeities.push(node.name);
  }
});

// Detectar estaciones de gastronomía en la escena
const expectedGastroStations = [
  'estacion_maiz_sagrado',
  'estacion_tortillas_tamales',
  'estacion_cazuela_guiso',
  'estacion_olla_bebidas',
  'estacion_metate_molienda',
  'repisa_gastronomia_1_items',
  'repisa_gastronomia_2_items'
];
const foundGastroStations = [];
expectedGastroStations.forEach((stName) => {
  if (scene.getObjectByName(stName)) {
    foundGastroStations.push(stName);
  }
});

// Detectar estaciones de fiestas patronales en la escena
const expectedFiestaStations = [
  'estacion_tambor_tepu',
  'estacion_musica_fiesta',
  'estacion_objetos_sagrados_fiesta'
];
const foundFiestaStations = [];
expectedFiestaStations.forEach((stName) => {
  if (scene.getObjectByName(stName)) {
    foundFiestaStations.push(stName);
  }
});

// Detectar Nierikas de fiestas en la escena
const expectedFiestaNierikas = [
  'nierika_fiesta_1',
  'nierika_fiesta_2',
  'nierika_fiesta_3'
];
const foundFiestaNierikas = [];
expectedFiestaNierikas.forEach((nName) => {
  if (scene.getObjectByName(nName)) {
    foundFiestaNierikas.push(nName);
  }
});

// Detectar letreros museográficos en la escena
const expectedSignposts = [
  'letrero_seccion_deidades',
  'letrero_seccion_gastronomia',
  'letrero_seccion_fiestas',
  'letrero_seccion_bienvenida'
];
const foundSignposts = [];
expectedSignposts.forEach((spName) => {
  if (scene.getObjectByName(spName)) {
    foundSignposts.push(spName);
  }
});

meshBreakdown.sort((a, b) => b.verts - a.verts);
console.log('Top 15 Meshes by Vertex Count:');
meshBreakdown.slice(0, 15).forEach((m, idx) => console.log(`   ${idx + 1}. [${m.name}] (${m.type}): ${m.verts} verts`));

console.log('\nResultados de Auditoría 3D y Validación Open Spec:');
console.log(`  • Vértices totales: ${totalVertices}`);
console.log(`  • Triángulos totales: ${Math.round(totalTriangles)}`);
console.log(`  • Deidades sagradas modeladas e insertadas: ${foundDeities.length}/6`);
foundDeities.forEach((d, idx) => console.log(`     ${idx + 1}. ${d}`));
console.log(`  • Estaciones gastronómicas modeladas e insertadas: ${foundGastroStations.length}/${expectedGastroStations.length}`);
foundGastroStations.forEach((g, idx) => console.log(`     ${idx + 1}. ${g}`));
console.log(`  • Estaciones de fiestas patronales modeladas e insertadas: ${foundFiestaStations.length}/${expectedFiestaStations.length}`);
foundFiestaStations.forEach((f, idx) => console.log(`     ${idx + 1}. ${f}`));
console.log(`  • Nierikas ceremoniales de fiesta: ${foundFiestaNierikas.length}/${expectedFiestaNierikas.length}`);
foundFiestaNierikas.forEach((n, idx) => console.log(`     ${idx + 1}. ${n}`));
console.log(`  • Letreros museográficos con relieve 3D instalados: ${foundSignposts.length}/${expectedSignposts.length}`);
foundSignposts.forEach((s, idx) => console.log(`     ${idx + 1}. ${s}`));

const maxAllowedVertices = 45000;
const passVerts = totalVertices <= maxAllowedVertices;
const passDeities = foundDeities.length === 6;
const passGastro = foundGastroStations.length === expectedGastroStations.length;
const passFiestas = foundFiestaStations.length === expectedFiestaStations.length && foundFiestaNierikas.length === expectedFiestaNierikas.length;
const passSigns = foundSignposts.length === expectedSignposts.length;

console.log(`\n  • Estado DoD Polígonos (<= ${maxAllowedVertices} vértices): ${passVerts ? '✓ CUMPLE' : '✗ EXCEDIDO'}`);
console.log(`  • Estado DoD Deidades (6 presentes): ${passDeities ? '✓ CUMPLE' : '✗ INCOMPLETO'}`);
console.log(`  • Estado DoD Gastronomía (7 estaciones presentes): ${passGastro ? '✓ CUMPLE' : '✗ INCOMPLETO'}`);
console.log(`  • Estado DoD Fiestas Patronales (3 estaciones + 3 nierikas): ${passFiestas ? '✓ CUMPLE' : '✗ INCOMPLETO'}`);
console.log(`  • Estado DoD Letreros Museográficos (4 letreros con relieve 3D): ${passSigns ? '✓ CUMPLE' : '✗ INCOMPLETO'}`);

if (!passDeities || !passGastro || !passFiestas || !passSigns || !passVerts) {
  console.error('Error: Faltan elementos según la especificación o se excedió el presupuesto.');
  process.exit(1);
}

// ==============================================================================
// 12. EXPORTACIÓN A .GLB BINARIO
// ==============================================================================
const exporter = new GLTFExporter();
exporter.parse(
  scene,
  (glbArrayBuffer) => {
    const buffer = Buffer.from(glbArrayBuffer);

    // Guardar en public/ (para Vite y React Three Fiber)
    const publicPath = path.resolve('public', 'museo_wixarika_base.glb');
    fs.writeFileSync(publicPath, buffer);
    console.log(`\n✓ Archivo GLB actualizado en: ${publicPath} (${(buffer.length / 1024).toFixed(2)} KB)`);

    // Guardar copia de respaldo en imagenesRef/
    const refPath = path.resolve('imagenesRef', 'museo_wixarika_base.glb');
    fs.writeFileSync(refPath, buffer);
    console.log(`✓ Copia de respaldo guardada en: ${refPath}`);

    console.log('\n================================================================');
    console.log('  PROCESO DE GENERACIÓN Y ACTUALIZACIÓN 3D FINALIZADO CON ÉXITO');
    console.log('================================================================');
  },
  (error) => {
    console.error('Error al exportar GLB:', error);
    process.exit(1);
  },
  { binary: true }
);
