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
console.log('  GENERANDO MODELO 3D: SALA DE MUSEO WIXÁRIKA V3 (.GLB)');
console.log('  Open Spec: specs/museo_wixarika_spec_v3.yaml');
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

const matCuadroTatewari = new THREE.MeshStandardMaterial({
  name: 'mat_cuadro_tatewari_nierika',
  color: 0xffffff,
  roughness: 0.75,
  metalness: 0.05
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

// Materiales Dedicados para la Ambientación Arquitectónica Wixárika (v3)
const matOtateRing = new THREE.MeshStandardMaterial({
  name: 'mat_otate_sagrado',
  color: 0xd4a373,
  roughness: 0.65,
  metalness: 0.05
});

const matOtateTie = new THREE.MeshStandardMaterial({
  name: 'mat_amarre_otate',
  color: 0x991b1b,
  roughness: 0.8,
  metalness: 0.0
});

const matFriezeBase = new THREE.MeshStandardMaterial({
  name: 'mat_cenefa_fondo',
  color: 0x2b1810,
  roughness: 0.6,
  metalness: 0.05,
  side: THREE.DoubleSide
});

const matFriezeTurquoise = new THREE.MeshStandardMaterial({
  name: 'mat_cenefa_turquesa',
  color: 0x0d9488,
  roughness: 0.35,
  metalness: 0.15
});

const matFriezeRed = new THREE.MeshStandardMaterial({
  name: 'mat_cenefa_rojo',
  color: 0xdc2626,
  roughness: 0.4,
  metalness: 0.05
});

const matFriezeYellow = new THREE.MeshStandardMaterial({
  name: 'mat_cenefa_amarillo',
  color: 0xfacc15,
  roughness: 0.35,
  metalness: 0.1
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
// 3. SUELO Y COSMOGRAMA CENTRAL WIXÁRIKA (Radio 8.5m)
// ==============================================================================
const sueloGroup = new THREE.Group();
sueloGroup.name = 'grupo_suelo';

// Suelo general de cantera pulida (36 segmentos)
const floorGeo = new THREE.CylinderGeometry(8.5, 8.5, 0.2, 36);
const floorMesh = new THREE.Mesh(floorGeo, matFloor);
floorMesh.position.y = -0.1;
floorMesh.name = 'suelo_principal';
sueloGroup.add(floorMesh);

// 4 Senderos Cardinales Radiales (Incrustaciones hacia los 4 Rumbos Sagrados)
// Sur (+Z / Wirikuta), Este (+X / Xapawiyemeta), Oeste (-X / Haramara), Norte (-Z / Hauxamanaka)
const cardinalAngles = [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2];
cardinalAngles.forEach((cAngle, cIdx) => {
  const pathGroup = new THREE.Group();
  pathGroup.name = `sendero_cardinal_${cIdx + 1}`;
  pathGroup.rotation.y = cAngle;

  // Banda de cantera de 0.36m de ancho extendiéndose desde R = 2.4m hasta R = 5.6m
  const runnerGeo = new THREE.PlaneGeometry(0.36, 3.2);
  const runner = new THREE.Mesh(runnerGeo, matMedallionBase);
  runner.rotation.x = -Math.PI / 2;
  runner.position.set(0, 0.003, 4.0);
  pathGroup.add(runner);

  // Línea central sagrada de turquesa
  const turqLineGeo = new THREE.PlaneGeometry(0.08, 3.2);
  const turqLine = new THREE.Mesh(turqLineGeo, matMedallionTurquoise);
  turqLine.rotation.x = -Math.PI / 2;
  turqLine.position.set(0, 0.004, 4.0);
  pathGroup.add(turqLine);

  // Rombo sagrado en el extremo del sendero (R = 5.4m)
  const markerGeo = new THREE.PlaneGeometry(0.24, 0.24);
  const marker = new THREE.Mesh(markerGeo, cIdx % 2 === 0 ? matKauyumariGold : matFlameOrange);
  marker.rotation.x = -Math.PI / 2;
  marker.rotation.z = Math.PI / 4;
  marker.position.set(0, 0.005, 5.4);
  pathGroup.add(marker);

  sueloGroup.add(pathGroup);
});

// Medallón central concéntrico (Punto exacto del espectador en VR a (0,0,0))
const ringWoodGeo = new THREE.RingGeometry(2.5, 2.8, 36);
const ringWoodMesh = new THREE.Mesh(ringWoodGeo, matMedallionWood);
ringWoodMesh.rotation.x = -Math.PI / 2;
ringWoodMesh.position.y = 0.005;
sueloGroup.add(ringWoodMesh);

// Anillo ceremonial de chaquira perimetral (48 cuentas concéntricas)
const numBeads = 48;
for (let b = 0; b < numBeads; b++) {
  const bAngle = (b * Math.PI * 2) / numBeads;
  const beadColor = [matFriezeTurquoise, matFriezeRed, matFriezeYellow, matKauyumariBlue][b % 4];
  const bead = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.008, 6), beadColor);
  bead.position.set(Math.sin(bAngle) * 2.65, 0.007, Math.cos(bAngle) * 2.65);
  bead.rotation.y = bAngle;
  sueloGroup.add(bead);
}

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

// Estrella geométrica central Wixárika de 8 puntas con rombos escalonados
for (let i = 0; i < 4; i++) {
  const angle = (i * Math.PI) / 4;
  const starPetalGeo = new THREE.PlaneGeometry(0.48, 2.0);
  const starPetalMesh = new THREE.Mesh(starPetalGeo, i % 2 === 0 ? matMedallionTurquoise : matMedallionWood);
  starPetalMesh.rotation.x = -Math.PI / 2;
  starPetalMesh.rotation.z = angle;
  starPetalMesh.position.y = 0.008;
  sueloGroup.add(starPetalMesh);
}

// Rombos interiores de estambre ceremonial
for (let i = 0; i < 4; i++) {
  const angle = (i * Math.PI) / 4 + Math.PI / 8;
  const diamondPetal = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 1.2), i % 2 === 0 ? matFriezeRed : matFriezeYellow);
  diamondPetal.rotation.x = -Math.PI / 2;
  diamondPetal.rotation.z = angle;
  diamondPetal.position.y = 0.0085;
  sueloGroup.add(diamondPetal);
}

const centerSpotGeo = new THREE.CircleGeometry(0.4, 24);
const centerSpotMesh = new THREE.Mesh(centerSpotGeo, matMedallionWood);
centerSpotMesh.rotation.x = -Math.PI / 2;
centerSpotMesh.position.y = 0.009;
sueloGroup.add(centerSpotMesh);

const centerDiamond = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.24), matKauyumariGold);
centerDiamond.rotation.x = -Math.PI / 2;
centerDiamond.rotation.z = Math.PI / 4;
centerDiamond.position.y = 0.010;
sueloGroup.add(centerDiamond);

root.add(sueloGroup);

// ==============================================================================
// 4. MUROS PERIMETRALES, CENEFA SAGRADA 360° Y PILASTRAS (Radio 8.0m, Alto 3.8m)
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

// Zócalo inferior de madera noble y cantera escalonada
const zocaloGeo = new THREE.CylinderGeometry(7.96, 7.96, 0.25, 48, 1, true);
invertNormalsAndWinding(zocaloGeo);
const zocaloMesh = new THREE.Mesh(zocaloGeo, matDarkWood);
zocaloMesh.position.y = 0.125;
zocaloMesh.name = 'zocalo_madera';
murosGroup.add(zocaloMesh);

const zocaloTrimGeo = new THREE.CylinderGeometry(7.94, 7.94, 0.04, 48, 1, true);
invertNormalsAndWinding(zocaloTrimGeo);
const zocaloTrim = new THREE.Mesh(zocaloTrimGeo, matMedallionTurquoise);
zocaloTrim.position.y = 0.27;
murosGroup.add(zocaloTrim);

// Cornisa superior de madera en transición al techo (Y = 3.7m)
const corniceGeo = new THREE.CylinderGeometry(7.88, 7.95, 0.2, 48, 1, true);
invertNormalsAndWinding(corniceGeo);
const corniceMesh = new THREE.Mesh(corniceGeo, matDarkWood);
corniceMesh.position.y = 3.7;
corniceMesh.name = 'cornisa_madera';
murosGroup.add(corniceMesh);

// ------------------------------------------------------------------------------
// CENEFA SAGRADA WIXÁRIKA 360° (Bajo la cornisa, Y = 3.35m a 3.65m)
// ------------------------------------------------------------------------------
const friezeGroup = new THREE.Group();
friezeGroup.name = 'cenefa_sagrada_360';

// Banda base cilíndrica de madera oscura
const friezeBaseGeo = new THREE.CylinderGeometry(7.94, 7.94, 0.32, 48, 1, true);
invertNormalsAndWinding(friezeBaseGeo);
const friezeBase = new THREE.Mesh(friezeBaseGeo, matFriezeBase);
friezeBase.position.y = 3.50;
friezeGroup.add(friezeBase);

// Moldura inferior de turquesa delimitando la cenefa
const friezeTrimGeo = new THREE.CylinderGeometry(7.92, 7.92, 0.03, 48, 1, true);
invertNormalsAndWinding(friezeTrimGeo);
const friezeTrim = new THREE.Mesh(friezeTrimGeo, matMedallionTurquoise);
friezeTrim.position.y = 3.34;
friezeGroup.add(friezeTrim);

// 32 Rombos Tsikuri (Ojos de Dios) en relieve a lo largo de los 360 grados
const numFriezeDiamonds = 32;
const friezeColors = [matFriezeTurquoise, matFriezeRed, matFriezeYellow, matKauyumariBlue];
for (let d = 0; d < numFriezeDiamonds; d++) {
  const dAngle = (d * Math.PI * 2) / numFriezeDiamonds;
  const dGroup = new THREE.Group();

  // Rombo exterior
  const outerMat = friezeColors[d % 4];
  const outerGeo = new THREE.BoxGeometry(0.18, 0.18, 0.018);
  const outer = new THREE.Mesh(outerGeo, outerMat);
  outer.rotation.z = Math.PI / 4;
  dGroup.add(outer);

  // Rombo interior contrastante
  const innerMat = friezeColors[(d + 2) % 4];
  const innerGeo = new THREE.BoxGeometry(0.09, 0.09, 0.024);
  const inner = new THREE.Mesh(innerGeo, innerMat);
  inner.rotation.z = Math.PI / 4;
  dGroup.add(inner);

  // Centro dorado
  const coreGeo = new THREE.BoxGeometry(0.04, 0.04, 0.028);
  const core = new THREE.Mesh(coreGeo, matKauyumariGold);
  core.rotation.z = Math.PI / 4;
  dGroup.add(core);

  dGroup.position.set(Math.sin(dAngle) * 7.90, 3.50, Math.cos(dAngle) * 7.90);
  dGroup.rotation.y = dAngle + Math.PI; // Mirando hacia el centro
  friezeGroup.add(dGroup);
}
murosGroup.add(friezeGroup);

// ------------------------------------------------------------------------------
// 8 PILASTRAS - ESTELAS CEREMONIALES TALLADAS
// ------------------------------------------------------------------------------
for (let i = 0; i < 8; i++) {
  const theta = (i * Math.PI * 2) / 8;
  const pilasterGroup = new THREE.Group();
  pilasterGroup.name = `estela_pilastra_${i + 1}`;

  // Fuste de madera noble de pino/cedro
  const colGeo = new THREE.BoxGeometry(0.35, 3.8, 0.2);
  const colMesh = new THREE.Mesh(colGeo, matDarkWood);
  colMesh.position.y = 1.9;
  pilasterGroup.add(colMesh);

  // Capitel tallado con moldura de turquesa y oro (Y = 3.65m)
  const capMesh = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.10, 0.24), matMedallionTurquoise);
  capMesh.position.y = 3.65;
  pilasterGroup.add(capMesh);

  // Base/Plinto reforzado (Y = 0.15m)
  const plinthMesh = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.22, 0.24), matPedestalBase);
  plinthMesh.position.y = 0.15;
  pilasterGroup.add(plinthMesh);

  // Relieve 1: Rombo Tsikuri superior tallado (Y = 2.9m)
  const dUpper = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.02), matKauyumariGold);
  dUpper.rotation.z = Math.PI / 4;
  dUpper.position.set(0, 2.9, 0.105);
  pilasterGroup.add(dUpper);

  const dUpperCore = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.025), matFriezeTurquoise);
  dUpperCore.rotation.z = Math.PI / 4;
  dUpperCore.position.set(0, 2.9, 0.11);
  pilasterGroup.add(dUpperCore);

  // Relieve 2: Motivo sagrado central (Peyote / Sol) a Y = 1.9m
  const rosette = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.02, 8), matPeyoteGreen);
  rosette.rotation.x = Math.PI / 2;
  rosette.position.set(0, 1.9, 0.105);
  pilasterGroup.add(rosette);

  const rosetteCenter = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), matKauyumariGold);
  rosetteCenter.position.set(0, 1.9, 0.12);
  pilasterGroup.add(rosetteCenter);

  // Relieve 3: Grecas escalonadas inferiores (Y = 1.0m)
  [-0.06, 0.06].forEach((gx) => {
    const chevron = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.24, 0.015), matFriezeRed);
    chevron.position.set(gx, 1.0, 0.105);
    pilasterGroup.add(chevron);
  });

  pilasterGroup.position.set(Math.sin(theta) * 7.9, 0, Math.cos(theta) * 7.9);
  pilasterGroup.rotation.y = theta;
  murosGroup.add(pilasterGroup);
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

// 3 Aros Concéntricos de Otate Sagrado (Tradición Arquitectónica Wixárika del Kalihuey)
const otateHeights = [4.2, 4.6, 5.0];
otateHeights.forEach((oy, oIdx) => {
  const coneRadiusAtY = 8.0 - (oy - 3.8) * (7.0 / 1.6);
  const hoopGeo = new THREE.TorusGeometry(coneRadiusAtY, 0.025, 4, 36);
  const hoop = new THREE.Mesh(hoopGeo, matOtateRing);
  hoop.rotation.x = Math.PI / 2;
  hoop.position.y = oy;
  hoop.name = `aro_otate_techo_${oIdx + 1}`;
  techoGroup.add(hoop);

  // 16 Ataduras ceremoniales rojas en los cruces con las vigas radiales
  for (let v = 0; v < 16; v++) {
    const vTheta = (v * Math.PI * 2) / 16;
    const tieGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.06, 5);
    const tie = new THREE.Mesh(tieGeo, matOtateTie);
    tie.position.set(Math.sin(vTheta) * coneRadiusAtY, oy, Math.cos(vTheta) * coneRadiusAtY);
    techoGroup.add(tie);
  }
});

// Anillo estructural de madera del óculo central (R = 1.0m, Y = 5.4m)
const oculusRingGeo = new THREE.CylinderGeometry(0.96, 1.06, 0.32, 24);
const oculusRingMesh = new THREE.Mesh(oculusRingGeo, matDarkWood);
oculusRingMesh.position.y = 5.4;
oculusRingMesh.name = 'anillo_oculo';
techoGroup.add(oculusRingMesh);

// Roseta Solar Sagrada alrededor del Óculo (Tau / Padre Sol)
const sunRosetteGroup = new THREE.Group();
sunRosetteGroup.name = 'roseta_solar_oculo';
sunRosetteGroup.position.y = 5.36;

const solarRimGeo = new THREE.TorusGeometry(1.15, 0.04, 5, 24);
const solarRim = new THREE.Mesh(solarRimGeo, matKauyumariGold);
solarRim.rotation.x = Math.PI / 2;
sunRosetteGroup.add(solarRim);

// 16 Rayos solares triangulares apuntando hacia afuera
for (let r = 0; r < 16; r++) {
  const rAngle = (r * Math.PI * 2) / 16;
  const rayGeo = new THREE.ConeGeometry(0.06, 0.24, 4);
  const ray = new THREE.Mesh(rayGeo, r % 2 === 0 ? matKauyumariGold : matFlameOrange);
  ray.position.set(Math.sin(rAngle) * 1.28, 0, Math.cos(rAngle) * 1.28);
  ray.rotation.y = -rAngle;
  ray.rotation.x = Math.PI / 2;
  sunRosetteGroup.add(ray);
}
techoGroup.add(sunRosetteGroup);

// 4 Ojos de Dios Ceremoniales (Tsikuris) colgando del óculo hacia los 4 rumbos sagrados
const hangingDirections = [
  { name: 'tsikuri_techo_sur', pos: [0, 5.08, 0.95] },
  { name: 'tsikuri_techo_este', pos: [0.95, 5.08, 0] },
  { name: 'tsikuri_techo_oeste', pos: [-0.95, 5.08, 0] },
  { name: 'tsikuri_techo_norte', pos: [0, 5.08, -0.95] }
];
hangingDirections.forEach((hd, hIdx) => {
  const tsikuriHang = new THREE.Group();
  tsikuriHang.name = hd.name;

  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.28, 3), matLightWood);
  cord.position.y = 0.14;
  tsikuriHang.add(cord);

  const outer = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.20, 0.012), hIdx % 2 === 0 ? matTsikuriRed : matTsikuriBlue);
  outer.rotation.z = Math.PI / 4;
  tsikuriHang.add(outer);

  const mid = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.016), matTsikuriYellow);
  mid.rotation.z = Math.PI / 4;
  tsikuriHang.add(mid);

  const core = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.02), matMedallionTurquoise);
  core.rotation.z = Math.PI / 4;
  tsikuriHang.add(core);

  const feather = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.10, 4), matFeatherEagle);
  feather.position.y = -0.16;
  tsikuriHang.add(feather);

  tsikuriHang.position.set(hd.pos[0], hd.pos[1], hd.pos[2]);
  techoGroup.add(tsikuriHang);
});

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
// 7. CUADRANTE 1: PANTEÓN DE LAS 6 DEIDADES (180° / Sur / Z > 0) - VERSIÓN 2 (v2)
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

// ------------------------------------------------------------------------------
// CONSTRUCTORES DE OFRENDAS Y ELEMENTOS SAGRADOS (v2)
// ------------------------------------------------------------------------------

// 1. Ofrenda a Kauyumari: Jícara con chaquira, maíz azul y dos flechas sagradas
function buildKauyumariOffering() {
  const g = new THREE.Group();
  g.name = 'ofrenda_deidad_1_kauyumari';

  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.06, 0.05, 10), matRukuriGourd);
  bowl.position.y = 0.025;
  g.add(bowl);

  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.092, 0.008, 4, 10), matKauyumariCyan);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.05;
  g.add(rim);

  const grain = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.01, 10), matMaizeBlue);
  grain.position.y = 0.045;
  g.add(grain);

  [-0.04, 0.04].forEach((ax, aIdx) => {
    const arrow = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.28, 4), matLightWood);
    arrow.rotation.z = aIdx === 0 ? 0.75 : -0.75;
    arrow.rotation.x = 0.25;
    arrow.position.set(ax, 0.06, 0.05);
    g.add(arrow);
  });

  return g;
}

// 2. Ofrenda a Tatewari: Copalero ceremonial de barro con copal humeante
function buildTatewariOffering() {
  const g = new THREE.Group();
  g.name = 'ofrenda_deidad_2_tatewari';

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.04, 8), matClayPot);
  base.position.y = 0.02;
  g.add(base);

  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.04, 0.08, 10), matClayPot);
  cup.position.y = 0.08;
  g.add(cup);

  const ember = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), matFlameOrange);
  ember.position.y = 0.11;
  g.add(ember);

  for (let l = 0; l < 2; l++) {
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 4), matCharcoalLogs);
    log.rotation.z = Math.PI / 2;
    log.position.set(0.10, 0.015, -0.04 + l * 0.04);
    g.add(log);
  }

  return g;
}

// 3. Ofrenda a Tayaupa: Jícara solar con maíz amarillo y plumas sagradas
function buildTayaupaOffering() {
  const g = new THREE.Group();
  g.name = 'ofrenda_deidad_3_tayaupa';

  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.06, 0.05, 10), matRukuriGourd);
  bowl.position.y = 0.025;
  g.add(bowl);

  const maize = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.01, 10), matMaizeYellow);
  maize.position.y = 0.045;
  g.add(maize);

  [-0.05, 0.05].forEach((px, pIdx) => {
    const feather = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.12, 4), matSunGold);
    feather.rotation.z = pIdx === 0 ? 0.6 : -0.6;
    feather.position.set(px, 0.06, 0.02);
    g.add(feather);
  });

  return g;
}

// 4. Ofrenda a Takutsi Nakawe: Canastita con semillas y mazorquitas
function buildTakutsiOffering() {
  const g = new THREE.Group();
  g.name = 'ofrenda_deidad_4_takutsi_nakawe';

  const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.06, 10), matPalmBasket);
  basket.position.y = 0.03;
  g.add(basket);

  const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.10, 6), matMaizeWhite);
  ear.rotation.z = 0.4;
  ear.position.set(0, 0.06, 0);
  g.add(ear);

  const seed = new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 6), matSquashOrange);
  seed.position.set(0.08, 0.025, 0.04);
  g.add(seed);

  return g;
}

// 5. Ofrenda a Tatei Haramara: Cuenco sagrado de agua con conchas marinas de San Blas
function buildHaramaraOffering() {
  const g = new THREE.Group();
  g.name = 'ofrenda_deidad_5_tatei_haramara';

  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.05, 0.05, 10), matClayDark);
  bowl.position.y = 0.025;
  g.add(bowl);

  const water = new THREE.Mesh(new THREE.CircleGeometry(0.085, 10), matKauyumariCyan);
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0.048;
  g.add(water);

  [-0.08, 0.08].forEach((cx, cIdx) => {
    const shell = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.06, 5), matKauyumariWhite);
    shell.rotation.z = cIdx === 0 ? 0.5 : -0.5;
    shell.rotation.x = 0.3;
    shell.position.set(cx, 0.02, 0.04);
    g.add(shell);
  });

  return g;
}

// 6. Ofrenda a Híkuri: Jícara votiva con peyotes sagrados secos
function buildHikuriOffering() {
  const g = new THREE.Group();
  g.name = 'ofrenda_deidad_6_hikuri_peyote';

  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.06, 0.05, 10), matRukuriGourd);
  bowl.position.y = 0.025;
  g.add(bowl);

  const miniPeyote = new THREE.Mesh(new THREE.SphereGeometry(0.032, 7, 6), matPeyoteGreen);
  miniPeyote.position.set(0, 0.045, 0);
  g.add(miniPeyote);

  const miniFlower = new THREE.Mesh(new THREE.SphereGeometry(0.012, 5, 5), matPeyoteFlower);
  miniFlower.position.set(0, 0.072, 0);
  g.add(miniFlower);

  return g;
}

// ------------------------------------------------------------------------------
// CONSTRUCTORES DE MEDALLONES Y AURAS DE PARED (v2)
// ------------------------------------------------------------------------------

// 1. Aura de Kauyumari: Montañas sagradas de Wirikuta y constelación
function buildKauyumariAura() {
  const g = new THREE.Group();
  g.name = 'mural_aura_deidad_1_kauyumari';

  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.74, 1.05, 0.04), matDarkWood);
  g.add(frame);

  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.97), matMedallionBase);
  plate.position.z = 0.022;
  g.add(plate);

  const mountain = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.38, 4), matDarkWood);
  mountain.position.set(0, -0.15, 0.035);
  mountain.rotation.y = Math.PI / 4;
  g.add(mountain);

  [[-0.15, 0.22], [0, 0.32], [0.15, 0.22], [-0.08, 0.12], [0.08, 0.12]].forEach(([sx, sy]) => {
    const star = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.032, 0.01), matKauyumariGold);
    star.rotation.z = Math.PI / 4;
    star.position.set(sx, sy, 0.035);
    g.add(star);
  });

  return g;
}

// 2. Cuadro Sagrado de Tatewari (Nierika de Estambre Auténtica con Relieve 3D)
function buildTatewariAura() {
  const g = new THREE.Group();
  g.name = 'mural_aura_deidad_2_tatewari';

  // 1. Marco exterior de madera de cedro oscuro tallado (0.94m x 0.94m cuadrado, proporción 1:1 fiel a la foto)
  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.94, 0.04), matDarkWood);
  g.add(frame);

  // Filete perimetral dorado interior
  const innerGoldBezel = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.88, 0.044), matKauyumariGold);
  g.add(innerGoldBezel);

  // 4 Rombos de chaquira turquesa en las esquinas del marco
  [
    [-0.43, 0.43],
    [0.43, 0.43],
    [-0.43, -0.43],
    [0.43, -0.43]
  ].forEach(([cx, cy]) => {
    const cornerDiamond = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.045, 0.048), matMedallionTurquoise);
    cornerDiamond.rotation.z = Math.PI / 4;
    cornerDiamond.position.set(cx, cy, 0);
    g.add(cornerDiamond);
  });

  // 2. Lienzo base texturizado (0.84m x 0.84m) con la imagen sagrada de Tatewari
  const canvasGeo = new THREE.PlaneGeometry(0.84, 0.84);
  const uvs = canvasGeo.attributes.uv.array;
  // Convención GLTF 2.0 con flipY = false: V=0 es borde superior, V=1 es borde inferior
  uvs[1] = 0; // v0 (top-left) V -> 0
  uvs[3] = 0; // v1 (top-right) V -> 0
  uvs[5] = 1; // v2 (bottom-left) V -> 1
  uvs[7] = 1; // v3 (bottom-right) V -> 1
  canvasGeo.attributes.uv.needsUpdate = true;
  const canvasMesh = new THREE.Mesh(canvasGeo, matCuadroTatewari);
  canvasMesh.name = 'lienzo_tatewari_nierika';
  canvasMesh.position.z = 0.024;
  g.add(canvasMesh);

  // 3. CAPAS ESCULTÓRICAS EN RELIEVE 3D (Fieles a la iconografía de la obra)
  const reliefGroup = new THREE.Group();
  reliefGroup.name = 'relieve_cuadro_tatewari';
  reliefGroup.position.z = 0.024;

  // -------------------------------------------------------------
  // A. TATEWARI (Deidad Central del Fuego)
  // -------------------------------------------------------------
  const tatewariGroup = new THREE.Group();
  tatewariGroup.name = 'tatewari_figura_central';
  tatewariGroup.position.set(0, -0.04, 0.006);

  // Máscara / Rostro sagrado púrpura violeta
  const faceMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.15, 0.012), matTsikuriPurple);
  faceMesh.position.set(0, 0.0, 0.006);
  tatewariGroup.add(faceMesh);

  // Ojos dorados almendrados y boca en relieve
  [-0.032, 0.032].forEach(ex => {
    const eye = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.010, 0.015), matFlameYellow);
    eye.position.set(ex, 0.018, 0.012);
    tatewariGroup.add(eye);
  });
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.008, 0.015), matFlameYellow);
  mouth.position.set(0, -0.045, 0.012);
  tatewariGroup.add(mouth);

  // Aretes de flor solar dorada a los lados del rostro
  [-0.08, 0.08].forEach(sx => {
    const earring = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.014, 8), matFlameYellow);
    earring.rotation.x = Math.PI / 2;
    earring.position.set(sx, -0.06, 0.008);
    tatewariGroup.add(earring);
  });

  // Cabellera / Corona de Llamas Ondulantes en abanico (15 lenguas de fuego en relieve)
  const numHair = 15;
  for (let h = 0; h < numHair; h++) {
    const angle = ((h - (numHair - 1) / 2) / ((numHair - 1) / 2)) * (Math.PI * 0.44); // abanico ~80 grados
    const hairLen = 0.14 - Math.abs(angle) * 0.04;
    const hairMat = [matFlameRed, matFlameOrange, matFlameYellow][h % 3];
    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.014, hairLen, 0.012), hairMat);
    hair.rotation.z = -angle;
    hair.position.set(Math.sin(angle) * (0.07 + hairLen / 2), 0.06 + Math.cos(angle) * (0.07 + hairLen / 2), 0.007);
    tatewariGroup.add(hair);
  }

  // Túnica / Cuerpo llameante trapezoidal que surge del fogón
  const bodyGeo = new THREE.CylinderGeometry(0.06, 0.16, 0.28, 4);
  const bodyMesh = new THREE.Mesh(bodyGeo, matFlameRed);
  bodyMesh.position.set(0, -0.19, 0.006);
  tatewariGroup.add(bodyMesh);

  // Lenguas de fuego verticales en el pecho y túnica
  [-0.08, -0.04, 0, 0.04, 0.08].forEach((fx, fIdx) => {
    const flameStrip = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.24, 0.014), fIdx % 2 === 0 ? matFlameOrange : matFlameYellow);
    flameStrip.position.set(fx, -0.20, 0.012);
    tatewariGroup.add(flameStrip);
  });

  // Brazos y manos llameantes abiertos hacia arriba
  [-1, 1].forEach(side => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.024, 0.012), matFlameRed);
    arm.position.set(side * 0.12, -0.06, 0.008);
    arm.rotation.z = side * 0.35;
    tatewariGroup.add(arm);

    for (let f = 0; f < 4; f++) {
      const fingerAngle = (f - 1.5) * 0.25;
      const finger = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.06, 4), matFlameOrange);
      finger.position.set(side * (0.16 + Math.abs(fingerAngle) * 0.02), -0.02 + f * 0.015, 0.010);
      finger.rotation.z = side * (0.5 + fingerAngle);
      tatewariGroup.add(finger);
    }
  });

  reliefGroup.add(tatewariGroup);

  // -------------------------------------------------------------
  // B. TAYAUPA (Padre Sol - Parte Superior Central)
  // -------------------------------------------------------------
  const sunGroup = new THREE.Group();
  sunGroup.name = 'tayaupa_sol_cuadro';
  sunGroup.position.set(0, 0.28, 0.006);

  const sunFace = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.012, 16), matSunGold);
  sunFace.rotation.x = Math.PI / 2;
  sunFace.position.z = 0.006;
  sunGroup.add(sunFace);

  [-0.018, 0.018].forEach(sx => {
    const sEye = new THREE.Mesh(new THREE.BoxGeometry(0.010, 0.006, 0.014), matDarkWood);
    sEye.position.set(sx, 0.01, 0.013);
    sunGroup.add(sEye);
  });
  const sMouth = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.005, 0.014), matFlameRed);
  sMouth.position.set(0, -0.018, 0.013);
  sunGroup.add(sMouth);

  for (let r = 0; r < 20; r++) {
    const rAngle = (r * Math.PI * 2) / 20;
    const rRay = new THREE.Mesh(new THREE.ConeGeometry(0.010, 0.045, 4), r % 2 === 0 ? matFlameOrange : matFlameYellow);
    rRay.position.set(Math.sin(rAngle) * 0.078, Math.cos(rAngle) * 0.078, 0.008);
    rRay.rotation.z = -rAngle;
    sunGroup.add(rRay);
  }
  reliefGroup.add(sunGroup);

  // -------------------------------------------------------------
  // C. WERIKA (Águila Sagrada - Arriba a la Izquierda)
  // -------------------------------------------------------------
  const eagleGroup = new THREE.Group();
  eagleGroup.name = 'werika_aguila_cuadro';
  eagleGroup.position.set(-0.25, 0.32, 0.006);

  const wingGeo = new THREE.ConeGeometry(0.055, 0.16, 4);
  const leftWing = new THREE.Mesh(wingGeo, matTsikuriBlue);
  leftWing.rotation.z = Math.PI / 2;
  leftWing.position.set(-0.04, 0, 0.006);
  eagleGroup.add(leftWing);

  const beamLine = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.18, 0.008), matFlameRed);
  beamLine.position.set(0.06, -0.08, 0.007);
  beamLine.rotation.z = -0.35;
  eagleGroup.add(beamLine);

  reliefGroup.add(eagleGroup);

  // -------------------------------------------------------------
  // D. KAUYUMARI (Venado Sagrado Blanco/Azul - Medio Izquierda)
  // -------------------------------------------------------------
  const deerGroup = new THREE.Group();
  deerGroup.name = 'kauyumari_venado_cuadro';
  deerGroup.position.set(-0.28, 0.14, 0.006);

  const deerBody = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.065, 0.012), matKauyumariWhite);
  deerBody.position.set(0, 0, 0.006);
  deerGroup.add(deerBody);

  [-0.045, -0.02, 0.02, 0.045].forEach(lx => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.010, 0.07, 0.010), matKauyumariWhite);
    leg.position.set(lx, -0.055, 0.006);
    deerGroup.add(leg);
  });

  const deerNeck = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.06, 0.012), matKauyumariWhite);
  deerNeck.position.set(0.045, 0.04, 0.006);
  deerNeck.rotation.z = -0.3;
  deerGroup.add(deerNeck);

  const antlerLeft = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.05, 0.014), matKauyumariGold);
  antlerLeft.position.set(0.038, 0.085, 0.008);
  antlerLeft.rotation.z = -0.25;
  deerGroup.add(antlerLeft);

  const antlerRight = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.05, 0.014), matKauyumariGold);
  antlerRight.position.set(0.058, 0.085, 0.008);
  antlerRight.rotation.z = 0.25;
  deerGroup.add(antlerRight);

  reliefGroup.add(deerGroup);

  // -------------------------------------------------------------
  // E. SERPIENTES SAGRADAS ONDULANTES (Costados Izquierdo y Derecho)
  // -------------------------------------------------------------
  [-1, 1].forEach(side => {
    const serpentGroup = new THREE.Group();
    serpentGroup.name = side === -1 ? 'serpiente_lateral_izquierda' : 'serpiente_lateral_derecha';
    serpentGroup.position.set(side * 0.28, -0.10, 0.006);

    const sSegments = 6;
    for (let s = 0; s < sSegments; s++) {
      const sy = (s - (sSegments - 1) / 2) * 0.055;
      const sx = Math.sin((s / sSegments) * Math.PI * 2) * 0.055;
      const sBody = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.045, 0.012), matDarkWood);
      sBody.position.set(sx, sy, 0.006);
      serpentGroup.add(sBody);

      const bead = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.015, 6), matKauyumariGold);
      bead.rotation.x = Math.PI / 2;
      bead.position.set(sx, sy, 0.012);
      serpentGroup.add(bead);
    }

    const head = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.055, 4), matFlameRed);
    head.position.set(side * -0.03, 0.18, 0.008);
    head.rotation.z = side * 0.6;
    serpentGroup.add(head);

    reliefGroup.add(serpentGroup);
  });

  // -------------------------------------------------------------
  // F. CAZADOR SAGRADO Y ÁRBOL DE PEYOTE FLORIDO (Derecha)
  // -------------------------------------------------------------
  const hunterGroup = new THREE.Group();
  hunterGroup.name = 'cazador_sagrado_cuadro';
  hunterGroup.position.set(0.18, 0.20, 0.006);

  const hTorso = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.09, 0.012), matFlameOrange);
  hTorso.position.set(0, 0, 0.006);
  hunterGroup.add(hTorso);
  const hHead = new THREE.Mesh(new THREE.SphereGeometry(0.016, 6, 6), matFlameOrange);
  hHead.position.set(0, 0.06, 0.008);
  hunterGroup.add(hHead);

  const bow = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.004, 4, 8, Math.PI), matDarkWood);
  bow.position.set(-0.025, 0.01, 0.008);
  bow.rotation.z = -Math.PI / 2;
  hunterGroup.add(bow);
  const arrow = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.004, 0.008), matKauyumariGold);
  arrow.position.set(-0.03, 0.01, 0.010);
  hunterGroup.add(arrow);

  reliefGroup.add(hunterGroup);

  const plantGroup = new THREE.Group();
  plantGroup.name = 'planta_sagrada_cuadro';
  plantGroup.position.set(0.32, 0.20, 0.006);

  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), matTsikuriBlue);
  bulb.position.set(0, -0.12, 0.006);
  plantGroup.add(bulb);

  const stem = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.24, 0.010), matKauyumariWhite);
  stem.position.set(0, 0.01, 0.006);
  plantGroup.add(stem);

  [-0.04, 0, 0.04].forEach((fx, fIdx) => {
    const flower = new THREE.Mesh(new THREE.ConeGeometry(0.020, 0.065, 4), matFlameYellow);
    flower.position.set(fx, 0.14, 0.008);
    flower.rotation.z = (fIdx - 1) * 0.25;
    plantGroup.add(flower);
  });
  reliefGroup.add(plantGroup);

  // -------------------------------------------------------------
  // G. BASE CEREMONIAL: ROSETAS DE PEYOTE Y SERPIENTE DE AGUA
  // -------------------------------------------------------------
  [-0.26, 0.26].forEach((rx, rIdx) => {
    const rosetteGroup = new THREE.Group();
    rosetteGroup.name = `roseta_base_${rIdx + 1}`;
    rosetteGroup.position.set(rx, -0.32, 0.006);

    for (let p = 0; p < 8; p++) {
      const pAngle = (p * Math.PI) / 4;
      const petal = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.045, 4), p % 2 === 0 ? matFlameOrange : matFlameRed);
      petal.position.set(Math.sin(pAngle) * 0.038, Math.cos(pAngle) * 0.038, 0.006);
      petal.rotation.z = -pAngle;
      rosetteGroup.add(petal);
    }
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.012, 8), matPeyoteGreen);
    core.rotation.x = Math.PI / 2;
    core.position.z = 0.010;
    rosetteGroup.add(core);

    reliefGroup.add(rosetteGroup);
  });

  const botSerpent = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.022, 0.012), matTsikuriBlue);
  botSerpent.position.set(0, -0.38, 0.008);
  reliefGroup.add(botSerpent);

  [-0.37, 0.37].forEach((hx, hIdx) => {
    const sHead = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.045, 4), matDarkWood);
    sHead.position.set(hx, -0.38, 0.010);
    sHead.rotation.z = hIdx === 0 ? Math.PI / 2 : -Math.PI / 2;
    reliefGroup.add(sHead);
  });

  g.add(reliefGroup);

  return g;
}

// 3. Aura de Tayaupa: Sol radiante dorado de 12 rayos
function buildTayaupaAura() {
  const g = new THREE.Group();
  g.name = 'mural_aura_deidad_3_tayaupa';

  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.74, 1.05, 0.04), matDarkWood);
  g.add(frame);

  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.97), matMedallionBase);
  plate.position.z = 0.022;
  g.add(plate);

  const sunDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.012, 16), matSunGold);
  sunDisc.rotation.x = Math.PI / 2;
  sunDisc.position.set(0, 0.12, 0.032);
  g.add(sunDisc);

  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.016, 14), matSunCore);
  core.rotation.x = Math.PI / 2;
  core.position.set(0, 0.12, 0.038);
  g.add(core);

  for (let r = 0; r < 12; r++) {
    const angle = (r * Math.PI * 2) / 12;
    const ray = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.14, 4), matSunGold);
    ray.position.set(Math.sin(angle) * 0.28, 0.12 + Math.cos(angle) * 0.28, 0.035);
    ray.rotation.z = -angle;
    g.add(ray);
  }

  return g;
}

// 4. Aura de Takutsi Nakawe: Árbol cósmico Iwi y fertilidad
function buildTakutsiAura() {
  const g = new THREE.Group();
  g.name = 'mural_aura_deidad_4_takutsi_nakawe';

  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.74, 1.05, 0.04), matDarkWood);
  g.add(frame);

  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.97), matMedallionBase);
  plate.position.z = 0.022;
  g.add(plate);

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.45, 6), matSunWood);
  trunk.position.set(0, -0.05, 0.032);
  g.add(trunk);

  const crown = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), matPeyoteGreen);
  crown.position.set(0, 0.18, 0.035);
  crown.scale.set(1, 0.7, 0.4);
  g.add(crown);

  return g;
}

// 5. Aura de Tatei Haramara: Espiral marina y olas sagradas
function buildHaramaraAura() {
  const g = new THREE.Group();
  g.name = 'mural_aura_deidad_5_tatei_haramara';

  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.74, 1.05, 0.04), matDarkWood);
  g.add(frame);

  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.97), matMedallionBase);
  plate.position.z = 0.022;
  g.add(plate);

  [0.14, 0.22, 0.30].forEach((wr, wIdx) => {
    const wave = new THREE.Mesh(new THREE.TorusGeometry(wr, 0.016, 4, 14, Math.PI), wIdx % 2 === 0 ? matKauyumariCyan : matKauyumariBlue);
    wave.rotation.z = Math.PI / 4;
    wave.position.set(0, 0.08, 0.035);
    g.add(wave);
  });

  const foam = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), matKauyumariWhite);
  foam.position.set(0, 0.08, 0.04);
  g.add(foam);

  return g;
}

// 6. Aura de Híkuri: Mandala de roseta sagrada de 8 gajos
function buildHikuriAura() {
  const g = new THREE.Group();
  g.name = 'mural_aura_deidad_6_hikuri_peyote';

  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.74, 1.05, 0.04), matDarkWood);
  g.add(frame);

  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.97), matMedallionBase);
  plate.position.z = 0.022;
  g.add(plate);

  const outer = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.012, 16), matPeyoteGreen);
  outer.rotation.x = Math.PI / 2;
  outer.position.set(0, 0.12, 0.032);
  g.add(outer);

  const flower = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.016, 8), matPeyoteFlower);
  flower.rotation.x = Math.PI / 2;
  flower.position.set(0, 0.12, 0.038);
  g.add(flower);

  const center = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), matSunGold);
  center.position.set(0, 0.12, 0.044);
  g.add(center);

  return g;
}

// ------------------------------------------------------------------------------
// PEBETEROS CEREMONIALES DE ACCESO
// ------------------------------------------------------------------------------
function buildCeremonialBrazier(nodeName) {
  const group = new THREE.Group();
  group.name = nodeName;

  const baseGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.72, 14);
  const base = new THREE.Mesh(baseGeo, matPedestalBase);
  base.position.y = 0.36;
  group.add(base);

  const trimGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.05, 14);
  const trim = new THREE.Mesh(trimGeo, matMedallionTurquoise);
  trim.position.y = 0.745;
  group.add(trim);

  const bowlGeo = new THREE.CylinderGeometry(0.25, 0.15, 0.14, 14);
  const bowl = new THREE.Mesh(bowlGeo, matKauyumariGold);
  bowl.position.y = 0.84;
  group.add(bowl);

  const coalGeo = new THREE.SphereGeometry(0.18, 8, 6);
  const coal = new THREE.Mesh(coalGeo, matCharcoalLogs);
  coal.position.y = 0.88;
  group.add(coal);

  const flameGeo = new THREE.ConeGeometry(0.08, 0.22, 6);
  const flame = new THREE.Mesh(flameGeo, matFlameYellow);
  flame.position.y = 1.01;
  group.add(flame);

  const innerFlame = new THREE.ConeGeometry(0.05, 0.16, 6);
  const inner = new THREE.Mesh(innerFlame, matFlameOrange);
  inner.position.y = 0.98;
  group.add(inner);

  return group;
}

const brazierLeft = buildCeremonialBrazier('pebetero_sagrado_izquierdo');
brazierLeft.position.set(-2.6, 0, 4.2);
deidadesGroup.add(brazierLeft);

const brazierRight = buildCeremonialBrazier('pebetero_sagrado_derecho');
brazierRight.position.set(2.6, 0, 4.2);
deidadesGroup.add(brazierRight);

// ------------------------------------------------------------------------------
// CONFIGURACIÓN DE LOS 6 PEDESTALES, ESCULTURAS, PLACAS Y OFRENDAS (v2)
// ------------------------------------------------------------------------------
const deidadesConfig = [
  {
    theta: Math.PI * 0.76,
    pedName: 'pedestal_deidad_1_kauyumari',
    sculptName: 'escultura_deidad_1_kauyumari',
    plaqueName: 'placa_deidad_1_kauyumari',
    hitboxName: 'hitbox_deidad_1_kauyumari',
    offeringName: 'ofrenda_deidad_1_kauyumari',
    auraName: 'mural_aura_deidad_1_kauyumari',
    name3d: 'KAUYUMARI',
    builder: buildKauyumari,
    offeringBuilder: buildKauyumariOffering,
    auraBuilder: buildKauyumariAura
  },
  {
    theta: Math.PI * 0.86,
    pedName: 'pedestal_deidad_2_tatewari',
    sculptName: 'escultura_deidad_2_tatewari',
    plaqueName: 'placa_deidad_2_tatewari',
    hitboxName: 'hitbox_deidad_2_tatewari',
    offeringName: 'ofrenda_deidad_2_tatewari',
    auraName: 'mural_aura_deidad_2_tatewari',
    name3d: 'TATEWARI',
    builder: buildTatewari,
    offeringBuilder: buildTatewariOffering,
    auraBuilder: buildTatewariAura
  },
  {
    theta: Math.PI * 0.95,
    pedName: 'pedestal_deidad_3_tayaupa',
    sculptName: 'escultura_deidad_3_tayaupa',
    plaqueName: 'placa_deidad_3_tayaupa',
    hitboxName: 'hitbox_deidad_3_tayaupa',
    offeringName: 'ofrenda_deidad_3_tayaupa',
    auraName: 'mural_aura_deidad_3_tayaupa',
    name3d: 'TAYAUPA',
    builder: buildTayaupa,
    offeringBuilder: buildTayaupaOffering,
    auraBuilder: buildTayaupaAura
  },
  {
    theta: Math.PI * 1.05,
    pedName: 'pedestal_deidad_4_takutsi_nakawe',
    sculptName: 'escultura_deidad_4_takutsi_nakawe',
    plaqueName: 'placa_deidad_4_takutsi_nakawe',
    hitboxName: 'hitbox_deidad_4_takutsi_nakawe',
    offeringName: 'ofrenda_deidad_4_takutsi_nakawe',
    auraName: 'mural_aura_deidad_4_takutsi_nakawe',
    name3d: 'TAKUTSI',
    builder: buildTakutsiNakawe,
    offeringBuilder: buildTakutsiOffering,
    auraBuilder: buildTakutsiAura
  },
  {
    theta: Math.PI * 1.14,
    pedName: 'pedestal_deidad_5_tatei_haramara',
    sculptName: 'escultura_deidad_5_tatei_haramara',
    plaqueName: 'placa_deidad_5_tatei_haramara',
    hitboxName: 'hitbox_deidad_5_tatei_haramara',
    offeringName: 'ofrenda_deidad_5_tatei_haramara',
    auraName: 'mural_aura_deidad_5_tatei_haramara',
    name3d: 'HARAMARA',
    builder: buildTateiHaramara,
    offeringBuilder: buildHaramaraOffering,
    auraBuilder: buildHaramaraAura
  },
  {
    theta: Math.PI * 1.24,
    pedName: 'pedestal_deidad_6_hikuri_peyote',
    sculptName: 'escultura_deidad_6_hikuri_peyote',
    plaqueName: 'placa_deidad_6_hikuri_peyote',
    hitboxName: 'hitbox_deidad_6_hikuri_peyote',
    offeringName: 'ofrenda_deidad_6_hikuri_peyote',
    auraName: 'mural_aura_deidad_6_hikuri_peyote',
    name3d: 'HIKURI',
    builder: buildHikuri,
    offeringBuilder: buildHikuriOffering,
    auraBuilder: buildHikuriAura
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
  sculpture.position.set(0, 0.96, 0);
  pedGroup.add(sculpture);

  // 1. Placa de Identificación Individual con Relieve 3D en la cara frontal
  const plaqueGroup = new THREE.Group();
  plaqueGroup.name = cfg.plaqueName;
  plaqueGroup.position.set(0, 0.52, 0.28);

  const plaqueBack = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.20, 0.018), matDarkWood);
  plaqueGroup.add(plaqueBack);

  const plaquePlate = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.16, 0.01), matSignStone);
  plaquePlate.position.z = 0.01;
  plaqueGroup.add(plaquePlate);

  const nameGeo = new TextGeometry(cfg.name3d, {
    font,
    size: 0.038,
    depth: 0.008,
    curveSegments: 1
  });
  nameGeo.center();
  const nameMesh = new THREE.Mesh(nameGeo, matTextGold);
  nameMesh.position.set(0, 0.02, 0.018);
  plaqueGroup.add(nameMesh);

  const lineMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.006, 0.006), matMedallionTurquoise);
  lineMesh.position.set(0, -0.04, 0.018);
  plaqueGroup.add(lineMesh);

  pedGroup.add(plaqueGroup);

  // 2. Hitbox interactiva para VR Raycasting
  const hitboxGeo = new THREE.BoxGeometry(0.66, 1.45, 0.66);
  const hitboxMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.0 });
  const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
  hitbox.position.y = 1.05;
  hitbox.name = cfg.hitboxName;
  pedGroup.add(hitbox);

  // 3. Ofrendas ceremoniales al pie del pedestal
  const offering = cfg.offeringBuilder();
  offering.position.set(0, -0.05, 0.44);
  pedGroup.add(offering);

  // 4. Mural / Aura Sagrada en el nicho de pared detrás de la deidad
  const aura = cfg.auraBuilder();
  const auraR = 7.72;
  aura.position.set(Math.sin(cfg.theta) * auraR, 2.05, Math.cos(cfg.theta) * auraR);
  aura.rotation.y = cfg.theta + Math.PI;
  deidadesGroup.add(aura);

  // Posicionar el pedestal en el arco a R = 6.1m orientado hacia el centro del usuario
  const r = 6.1;
  pedGroup.position.set(Math.sin(cfg.theta) * r, 0.15, Math.cos(cfg.theta) * r);
  pedGroup.rotation.y = cfg.theta + Math.PI;
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
// 10. CUADRANTE 4: BIENVENIDA Y PORTAL SAGRADO (0° / Norte / Z < 0)
// ==============================================================================
const bienvenidaGroup = new THREE.Group();
bienvenidaGroup.name = 'cuadrante_bienvenida';

// Gran Mural en Relieve: La Peregrinación Sagrada a Wirikuta
const welcomeBoard = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.2, 0.08), matDarkWood);
welcomeBoard.position.set(0, 2.0, -7.8);
welcomeBoard.name = 'panel_bienvenida_marco';
bienvenidaGroup.add(welcomeBoard);

const welcomeInner = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.0), matKauyumariBlue);
welcomeInner.position.set(0, 2.0, -7.75);
welcomeInner.name = 'panel_bienvenida_lienzo';
bienvenidaGroup.add(welcomeInner);

// Relieve mural: Serranías sagradas de la Sierra Madre y Real de Catorce
const mtnBack = new THREE.Mesh(new THREE.ConeGeometry(1.4, 0.9, 4), matDarkWood);
mtnBack.rotation.y = Math.PI / 4;
mtnBack.position.set(0.6, 1.6, -7.72);
bienvenidaGroup.add(mtnBack);

const mtnFront = new THREE.Mesh(new THREE.ConeGeometry(1.0, 0.7, 4), matMedallionWood);
mtnFront.rotation.y = Math.PI / 4;
mtnFront.position.set(-0.8, 1.4, -7.70);
bienvenidaGroup.add(mtnFront);

// Padre Sol Tau radiante en el cielo del mural
const muralSun = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.02, 16), matSunGold);
muralSun.rotation.x = Math.PI / 2;
muralSun.position.set(-0.7, 2.4, -7.71);
bienvenidaGroup.add(muralSun);

// Silueta dorada del venado azul Kauyumari guiando el camino
const deerMural = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.44, 4), matKauyumariGold);
deerMural.position.set(0.4, 1.8, -7.69);
deerMural.rotation.z = -0.2;
bienvenidaGroup.add(deerMural);

// Cactus sagrado de peyote en el desierto de Wirikuta
const peyoteMural = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), matPeyoteGreen);
peyoteMural.position.set(1.1, 1.25, -7.68);
bienvenidaGroup.add(peyoteMural);

// Título 3D del Portal Sagrado sobre el lienzo
const portalTitleGeo = new TextGeometry('KALIHUEY WIXARIKA', {
  font,
  size: 0.075,
  depth: 0.015,
  curveSegments: 1
});
portalTitleGeo.center();
const portalTitleMesh = new THREE.Mesh(portalTitleGeo, matKauyumariGold);
portalTitleMesh.position.set(0, 2.85, -7.68);
bienvenidaGroup.add(portalTitleMesh);

// Pilares y Dintel del Pórtico Ceremonial
[-2.0, 2.0].forEach((posX, pIdx) => {
  const pilar = new THREE.Mesh(new THREE.BoxGeometry(0.35, 3.8, 0.35), matDarkWood);
  pilar.position.set(posX, 1.9, -7.6);
  pilar.name = `pilar_portico_${pIdx + 1}`;

  // Grabado de Tsikuri en los pilares del portal
  const pilarDiamond = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.02), matMedallionTurquoise);
  pilarDiamond.rotation.z = Math.PI / 4;
  pilarDiamond.position.set(0, 0.6, 0.18);
  pilar.add(pilarDiamond);

  bienvenidaGroup.add(pilar);
});

const lintel = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.3, 0.3), matDarkWood);
lintel.position.set(0, 3.2, -7.6);
lintel.name = 'dintel_portico';

// Franja decorativa de estambre en el dintel
const lintelTrim = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.06, 0.02), matMedallionTurquoise);
lintelTrim.position.set(0, 0, 0.16);
lintel.add(lintelTrim);
bienvenidaGroup.add(lintel);

// Pedestales y Tótems de Entrada
[-2.2, 2.2].forEach((posX, pIdx) => {
  const entryPed = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 0.75, 16), matPedestalBase);
  entryPed.position.set(posX, 0.375, -5.5);
  entryPed.name = `pedestal_entrada_${pIdx + 1}`;
  bienvenidaGroup.add(entryPed);

  const entryTop = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.06, 16), matPedestalTop);
  entryTop.position.set(posX, 0.78, -5.5);
  bienvenidaGroup.add(entryTop);

  // Escultura ceremonial en cada tótem de entrada: Tsikuri sagrado
  const totemTsikuri = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.02), pIdx === 0 ? matTsikuriRed : matTsikuriBlue);
  totemTsikuri.rotation.z = Math.PI / 4;
  totemTsikuri.position.set(posX, 1.05, -5.5);
  bienvenidaGroup.add(totemTsikuri);
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

// Constructor Maestro de Letrero Museográfico Colgante de Techo (Ceiling Hanging Sign)
function createSignPost(titleText, subtitleText, emblemGroup, nodeName, position, yawAngle) {
  const signGroup = new THREE.Group();
  signGroup.name = nodeName;

  // 1. Cables/Varillas de suspensión vertical anclados a la techumbre (libera 100% el suelo)
  const suspensionHeight = 1.35;
  [-0.48, 0.48].forEach((rx) => {
    // Varilla vertical de suspensión (madera noble oscura)
    const rodGeo = new THREE.CylinderGeometry(0.007, 0.007, suspensionHeight, 6);
    const rod = new THREE.Mesh(rodGeo, matDarkWood);
    rod.position.set(rx, suspensionHeight / 2 + 0.22, 0);
    signGroup.add(rod);

    // Herraje superior de anclaje a las vigas del techo
    const topAnchor = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.06), matKauyumariGold);
    topAnchor.position.set(rx, suspensionHeight + 0.22, 0);
    signGroup.add(topAnchor);

    // Argolla ceremonial de fijación al marco
    const eyelet = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.005, 4, 8), matKauyumariGold);
    eyelet.position.set(rx, 0.24, 0);
    signGroup.add(eyelet);
  });

  // 2. Tablero de lectura colgante inclinado hacia abajo (15°) para vista ergonómica desde el centro
  const plaqueHead = new THREE.Group();
  plaqueHead.rotation.x = Math.PI / 12; // Inclinación hacia el usuario para lectura clara y sin reflejos

  // Marco exterior de madera noble tallada (1.42m x 0.48m)
  const frameBoard = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.48, 0.04), matSignBoardWood);
  plaqueHead.add(frameBoard);

  // Filete perimetral dorado Wixárika
  const frameBorder = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.42, 0.045), matKauyumariGold);
  plaqueHead.add(frameBorder);

  // Lienzo interior de piedra cantera clara / pátina museográfica
  const innerPlate = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.38, 0.015), matSignStone);
  innerPlate.position.z = 0.024;
  plaqueHead.add(innerPlate);

  // Título principal en relieve 3D (TextGeometry con helvetiker_bold)
  const textGeo = new TextGeometry(titleText, {
    font,
    size: 0.062,
    depth: 0.014,
    curveSegments: 1
  });
  textGeo.center();
  const textMesh = new THREE.Mesh(textGeo, matTextGold);
  textMesh.position.set(0, 0.065, 0.038);
  plaqueHead.add(textMesh);

  // Barra de acento geométrico Wixárika con rombo central de turquesa y oro
  const barMesh = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.007, 0.008), matMedallionTurquoise);
  barMesh.position.set(0, 0.005, 0.038);
  plaqueHead.add(barMesh);

  const barDiamond = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.024, 0.01), matKauyumariGold);
  barDiamond.rotation.z = Math.PI / 4;
  barDiamond.position.set(0, 0.005, 0.040);
  plaqueHead.add(barDiamond);

  // Subtítulo descriptivo en relieve 3D
  const subGeo = new TextGeometry(subtitleText, {
    font,
    size: 0.030,
    depth: 0.008,
    curveSegments: 1
  });
  subGeo.center();
  const subMesh = new THREE.Mesh(subGeo, matDarkWood);
  subMesh.position.set(0, -0.065, 0.038);
  plaqueHead.add(subMesh);

  // 3. Montar Emblema Escultural 3D coronando el marco del letrero
  if (emblemGroup) {
    const emblemMount = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.06, 0.03), matDarkWood);
    emblemMount.position.set(0, 0.25, 0);
    plaqueHead.add(emblemMount);

    emblemGroup.position.set(0, 0.38, 0.02);
    plaqueHead.add(emblemGroup);
  }

  signGroup.add(plaqueHead);

  // Posicionar suspendido en el techo y orientar frontalmente hacia el centro del usuario
  signGroup.position.set(position[0], position[1], position[2]);
  signGroup.rotation.y = yawAngle;

  return signGroup;
}

// ------------------------------------------------------------------------------
// INSTANCIACIÓN DE LOS 4 LETREROS MUSEOGRÁFICOS COLGANTES EN EL TECHO
// ------------------------------------------------------------------------------

// 1. Letrero de la Sección de Deidades Sagradas (Norte / Z = -4.8, Y = 3.15, orientado hacia el centro +Z)
const signDeidades = createSignPost(
  'DEIDADES SAGRADAS',
  'COSMOVISION',
  buildDeitiesEmblem(),
  'letrero_seccion_deidades',
  [0.0, 3.15, -4.8],
  0.0 // Frente orientado hacia (0, 0, 0)
);
letrerosGroup.add(signDeidades);

// 2. Letrero de la Sección de Gastronomía Tradicional (Este / X = 4.6, Z = -1.6, Y = 3.15)
const signGastro = createSignPost(
  'GASTRONOMIA TRADICIONAL',
  'TRADICION',
  buildGastroEmblem(),
  'letrero_seccion_gastronomia',
  [4.6, 3.15, -1.6],
  Math.atan2(-4.6, 1.6) // Frente orientado hacia (0, 0, 0)
);
letrerosGroup.add(signGastro);

// 3. Letrero de la Sección de Fiestas y Ceremonias (Oeste / X = -4.6, Z = -1.6, Y = 3.15)
const signFiestas = createSignPost(
  'FIESTAS Y CEREMONIAS',
  'CEREMONIAS',
  buildFiestasEmblem(),
  'letrero_seccion_fiestas',
  [-4.6, 3.15, -1.6],
  Math.atan2(4.6, 1.6) // Frente orientado hacia (0, 0, 0)
);
letrerosGroup.add(signFiestas);

// 4. Letrero de la Sección de Bienvenida (Sur / Z = 4.8, Y = 3.15, orientado hacia el centro -Z / Espacio para Menú 2D)
const signBienvenida = createSignPost(
  'BIENVENIDA CULTURAL',
  'KALIHUEY',
  buildBienvenidaEmblem(),
  'letrero_seccion_bienvenida',
  [0.0, 3.15, 4.8],
  Math.PI // Frente orientado hacia (0, 0, 0)
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

// Detectar placas individuales de deidades en la escena
const expectedPlaques = [
  'placa_deidad_1_kauyumari',
  'placa_deidad_2_tatewari',
  'placa_deidad_3_tayaupa',
  'placa_deidad_4_takutsi_nakawe',
  'placa_deidad_5_tatei_haramara',
  'placa_deidad_6_hikuri_peyote'
];
const foundPlaques = [];
expectedPlaques.forEach((pName) => {
  if (scene.getObjectByName(pName)) foundPlaques.push(pName);
});

// Detectar ofrendas tradicionales al pie de las deidades
const expectedOfferings = [
  'ofrenda_deidad_1_kauyumari',
  'ofrenda_deidad_2_tatewari',
  'ofrenda_deidad_3_tayaupa',
  'ofrenda_deidad_4_takutsi_nakawe',
  'ofrenda_deidad_5_tatei_haramara',
  'ofrenda_deidad_6_hikuri_peyote'
];
const foundOfferings = [];
expectedOfferings.forEach((oName) => {
  if (scene.getObjectByName(oName)) foundOfferings.push(oName);
});

// Detectar auras murales en el nicho de deidades
const expectedAuras = [
  'mural_aura_deidad_1_kauyumari',
  'mural_aura_deidad_2_tatewari',
  'mural_aura_deidad_3_tayaupa',
  'mural_aura_deidad_4_takutsi_nakawe',
  'mural_aura_deidad_5_tatei_haramara',
  'mural_aura_deidad_6_hikuri_peyote'
];
const foundAuras = [];
expectedAuras.forEach((aName) => {
  if (scene.getObjectByName(aName)) foundAuras.push(aName);
});

// Detectar elementos arquitectónicos Wixárika añadidos en v3
let friezeDiamondsCount = 0;
let carvedPilastersCount = 0;
let otateHoopsCount = 0;
let hangingTsikurisCount = 0;
let cardinalPathwaysCount = 0;

scene.traverse((node) => {
  if (node.name && node.name.startsWith('estela_pilastra_')) carvedPilastersCount++;
  if (node.name && node.name.startsWith('aro_otate_techo_')) otateHoopsCount++;
  if (node.name && node.name.startsWith('tsikuri_techo_')) hangingTsikurisCount++;
  if (node.name && node.name.startsWith('sendero_cardinal_')) cardinalPathwaysCount++;
});

const friezeNode = scene.getObjectByName('cenefa_sagrada_360');
if (friezeNode) {
  friezeDiamondsCount = friezeNode.children.length - 2; // Descontar base y trim
}

meshBreakdown.sort((a, b) => b.verts - a.verts);
console.log('Top 15 Meshes by Vertex Count:');
meshBreakdown.slice(0, 15).forEach((m, idx) => console.log(`   ${idx + 1}. [${m.name}] (${m.type}): ${m.verts} verts`));

console.log('\nResultados de Auditoría 3D y Validación Open Spec v3:');
console.log(`  • Vértices totales: ${totalVertices}`);
console.log(`  • Triángulos totales: ${Math.round(totalTriangles)}`);
console.log(`  • Deidades sagradas modeladas e insertadas: ${foundDeities.length}/6`);
foundDeities.forEach((d, idx) => console.log(`     ${idx + 1}. ${d}`));
console.log(`  • Placas individuales de deidades con relieve 3D: ${foundPlaques.length}/${expectedPlaques.length}`);
console.log(`  • Ofrendas sagradas al pie de las deidades: ${foundOfferings.length}/${expectedOfferings.length}`);
console.log(`  • Auras murales sagradas en nicho de pared: ${foundAuras.length}/${expectedAuras.length}`);
console.log(`  • Estaciones gastronómicas modeladas e insertadas: ${foundGastroStations.length}/${expectedGastroStations.length}`);
console.log(`  • Estaciones de fiestas patronales modeladas e insertadas: ${foundFiestaStations.length}/${expectedFiestaStations.length}`);
console.log(`  • Nierikas ceremoniales de fiesta: ${foundFiestaNierikas.length}/${expectedFiestaNierikas.length}`);
console.log(`  • Letreros museográficos con relieve 3D instalados: ${foundSignposts.length}/${expectedSignposts.length}`);
console.log(`  • Rombos Tsikuri en cenefa ceremonial 360°: ${friezeDiamondsCount}/32`);
console.log(`  • Pilastras - Estelas ceremoniales talladas: ${carvedPilastersCount}/8`);
console.log(`  • Aros concéntricos de otate sagrado en techo: ${otateHoopsCount}/3`);
console.log(`  • Ojos de Dios (Tsikuris) colgantes en el óculo: ${hangingTsikurisCount}/4`);
console.log(`  • Senderos cardinales radiales en el piso cosmograma: ${cardinalPathwaysCount}/4`);

const maxAllowedVertices = 70000;
const passVerts = totalVertices <= maxAllowedVertices;
const passDeities = foundDeities.length === 6 && foundPlaques.length === 6 && foundOfferings.length === 6 && foundAuras.length === 6;
const passGastro = foundGastroStations.length === expectedGastroStations.length;
const passFiestas = foundFiestaStations.length === expectedFiestaStations.length && foundFiestaNierikas.length === expectedFiestaNierikas.length;
const passSigns = foundSignposts.length === expectedSignposts.length;
const passArch = friezeDiamondsCount >= 32 && carvedPilastersCount === 8 && otateHoopsCount === 3 && hangingTsikurisCount === 4 && cardinalPathwaysCount === 4;

console.log(`\n  • Estado DoD Polígonos (<= ${maxAllowedVertices} vértices): ${passVerts ? '✓ CUMPLE' : '✗ EXCEDIDO'}`);
console.log(`  • Estado DoD Deidades v3 (6 esculturas + 6 placas + 6 ofrendas + 6 auras): ${passDeities ? '✓ CUMPLE' : '✗ INCOMPLETO'}`);
console.log(`  • Estado DoD Gastronomía (7 estaciones presentes): ${passGastro ? '✓ CUMPLE' : '✗ INCOMPLETO'}`);
console.log(`  • Estado DoD Fiestas Patronales (3 estaciones + 3 nierikas): ${passFiestas ? '✓ CUMPLE' : '✗ INCOMPLETO'}`);
console.log(`  • Estado DoD Letreros Museográficos (4 letreros con relieve 3D): ${passSigns ? '✓ CUMPLE' : '✗ INCOMPLETO'}`);
console.log(`  • Estado DoD Arquitectura Wixárika (Cenefa 360 + Estelas + Otate + Tsikuris + Cosmograma): ${passArch ? '✓ CUMPLE' : '✗ INCOMPLETO'}`);

if (!passDeities || !passGastro || !passFiestas || !passSigns || !passVerts || !passArch) {
  console.error('Error: Faltan elementos según la especificación o se excedió el presupuesto.');
  process.exit(1);
}

// ==============================================================================
// 12. EXPORTACIÓN A .GLB BINARIO CON TEXTURA EMBEBIDA (VERSIÓN 3)
// ==============================================================================
function injectTextureIntoGlb(rawGlb, imageBuf, materialName, textureName = 'tex_cuadro_tatewari_nierika') {
  const chunk0Len = rawGlb.readUInt32LE(12);
  const jsonBuf = rawGlb.subarray(20, 20 + chunk0Len);
  const gltf = JSON.parse(jsonBuf.toString('utf8'));

  const chunk1Offset = 20 + chunk0Len;
  const chunk1Len = rawGlb.readUInt32LE(chunk1Offset);
  const binBytes = rawGlb.subarray(chunk1Offset + 8, chunk1Offset + 8 + chunk1Len);

  const imageByteOffset = binBytes.length;
  const imageByteLength = imageBuf.length;
  const binPadding = (4 - (imageByteLength % 4)) % 4;
  const newBinBytes = Buffer.concat([binBytes, imageBuf, Buffer.alloc(binPadding, 0)]);

  gltf.bufferViews = gltf.bufferViews || [];
  const newBvIdx = gltf.bufferViews.length;
  gltf.bufferViews.push({
    buffer: 0,
    byteOffset: imageByteOffset,
    byteLength: imageByteLength
  });

  gltf.images = gltf.images || [];
  const newImgIdx = gltf.images.length;
  gltf.images.push({
    bufferView: newBvIdx,
    mimeType: 'image/png',
    name: textureName
  });

  gltf.textures = gltf.textures || [];
  const newTexIdx = gltf.textures.length;
  gltf.textures.push({
    source: newImgIdx
  });

  gltf.buffers[0].byteLength = newBinBytes.length;

  const mat = gltf.materials.find(m => m.name === materialName);
  if (mat) {
    mat.pbrMetallicRoughness = mat.pbrMetallicRoughness || {};
    mat.pbrMetallicRoughness.baseColorTexture = {
      index: newTexIdx,
      texCoord: 0
    };
    mat.pbrMetallicRoughness.baseColorFactor = [1, 1, 1, 1];
  } else {
    console.warn(`[injectTextureIntoGlb] Material "${materialName}" no encontrado en GLTF.`);
  }

  const newJsonStr = JSON.stringify(gltf);
  const newJsonBuf = Buffer.from(newJsonStr, 'utf8');
  const jsonPadding = (4 - (newJsonBuf.length % 4)) % 4;
  const paddedJsonBuf = Buffer.concat([newJsonBuf, Buffer.alloc(jsonPadding, 0x20)]);

  const totalLen = 12 + 8 + paddedJsonBuf.length + 8 + newBinBytes.length;
  const outGlb = Buffer.alloc(totalLen);

  // Encabezado GLB (12 bytes)
  outGlb.writeUInt32LE(0x46546C67, 0); // magic: 'glTF'
  outGlb.writeUInt32LE(2, 4);          // version: 2
  outGlb.writeUInt32LE(totalLen, 8);   // longitud total

  // Chunk 0 (JSON)
  outGlb.writeUInt32LE(paddedJsonBuf.length, 12);
  outGlb.writeUInt32LE(0x4E4F534A, 16); // 'JSON'
  paddedJsonBuf.copy(outGlb, 20);

  // Chunk 1 (BIN)
  const chunk1Pos = 20 + paddedJsonBuf.length;
  outGlb.writeUInt32LE(newBinBytes.length, chunk1Pos);
  outGlb.writeUInt32LE(0x004E4942, chunk1Pos + 4); // 'BIN\0'
  newBinBytes.copy(outGlb, chunk1Pos + 8);

  return outGlb;
}

const exporter = new GLTFExporter();
exporter.parse(
  scene,
  (glbArrayBuffer) => {
    let buffer = Buffer.from(glbArrayBuffer);

    // Inyectar la textura auténtica de Tatewari en el binario GLB
    const tatewariTexPath = path.resolve('public', 'texturas', 'tatewari_nierika.png');
    if (fs.existsSync(tatewariTexPath)) {
      const texBuf = fs.readFileSync(tatewariTexPath);
      buffer = injectTextureIntoGlb(buffer, texBuf, 'mat_cuadro_tatewari_nierika', 'tex_cuadro_tatewari_nierika');
      console.log(`✓ Textura de Tatewari embebida directamente en GLB binario (${(texBuf.length / 1024).toFixed(2)} KB)`);
    } else {
      console.warn(`[ADVERTENCIA] No se encontró el archivo de textura en: ${tatewariTexPath}`);
    }

    // 1. Guardar como versión v3
    const publicV3Path = path.resolve('public', 'museo_wixarika_v3.glb');
    fs.writeFileSync(publicV3Path, buffer);
    console.log(`\n✓ Archivo GLB v3 guardado en: ${publicV3Path} (${(buffer.length / 1024).toFixed(2)} KB)`);

    const refV3Path = path.resolve('imagenesRef', 'museo_wixarika_v3.glb');
    fs.writeFileSync(refV3Path, buffer);
    console.log(`✓ Copia de respaldo v3 guardada en: ${refV3Path}`);

    // 2. Actualizar también versión v4 sincronizada
    const publicV4Path = path.resolve('public', 'museo_wixarika_v4.glb');
    fs.writeFileSync(publicV4Path, buffer);
    console.log(`✓ Archivo GLB v4 actualizado en: ${publicV4Path}`);

    const refV4Path = path.resolve('imagenesRef', 'museo_wixarika_v4.glb');
    fs.writeFileSync(refV4Path, buffer);
    console.log(`✓ Copia de respaldo v4 guardada en: ${refV4Path}`);

    // 3. Actualizar el archivo base principal para que la app cargue de inmediato
    const publicBasePath = path.resolve('public', 'museo_wixarika_base.glb');
    fs.writeFileSync(publicBasePath, buffer);
    console.log(`✓ Archivo GLB principal (base) actualizado: ${publicBasePath}`);

    const refBasePath = path.resolve('imagenesRef', 'museo_wixarika_base.glb');
    fs.writeFileSync(refBasePath, buffer);
    console.log(`✓ Respaldo base actualizado en: ${refBasePath}`);

    console.log('\n================================================================');
    console.log('  PROCESO DE GENERACIÓN V3 FINALIZADO CON ÉXITO');
    console.log('================================================================');
  },
  (error) => {
    console.error('Error al exportar GLB:', error);
    process.exit(1);
  },
  { binary: true }
);
