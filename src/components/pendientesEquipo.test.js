import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { TUTORIAL_2D_MOUSE_STEPS, TUTORIAL_2D_TOUCH_STEPS } from './Tutorial2D.jsx';
import { VR_TUTORIAL_STEPS } from './wixarika/WixarikaVRTutorialPanel.jsx';
import { VIDEO_UNAVAILABLE_MSG } from './wixarika/WixarikaVRVideoPlayer.jsx';
import { VR_TEXT_COLOR } from './wixarika/VRText.jsx';
import { HOVER_BLUE } from './wixarika/ButtonShadow.jsx';

const readGltf = () => {
  const buf = fs.readFileSync(path.resolve(process.cwd(), 'public', 'museo_wixarika_v16.glb'));
  return JSON.parse(buf.toString('utf8', 20, 20 + buf.readUInt32LE(12)));
};

describe('Pendientes del equipo (revisión de la app)', () => {
  it('tutoriales mínimos: pocas frases y cortas, para entrar sin leer mucho', () => {
    for (const steps of [TUTORIAL_2D_MOUSE_STEPS, TUTORIAL_2D_TOUCH_STEPS, VR_TUTORIAL_STEPS]) {
      expect(steps.length).toBeLessThanOrEqual(4);
      steps.forEach((line) => expect(line.split(' ').length).toBeLessThanOrEqual(9));
    }
    expect(VR_TUTORIAL_STEPS).toHaveLength(2);
  });

  it('sin internet el video muestra un aviso neutro, no un error técnico', () => {
    expect(VIDEO_UNAVAILABLE_MSG.toLowerCase()).not.toContain('error');
    expect(VIDEO_UNAVAILABLE_MSG.toLowerCase()).not.toContain('no se pudo');
  });

  it('texto negro en el visor y resaltado azul de lo seleccionado', () => {
    expect(VR_TEXT_COLOR).toBe('#000000');
    expect(HOVER_BLUE).toMatch(/^#2563eb$/i);
  });

  it('GLB: placas de deidades y fiestas con brillo y más gruesas; logos con brillo', () => {
    const gltf = readGltf();
    const placas = gltf.nodes.filter((n) => /^placa_(deidad|fiesta)_/.test(n.name));
    expect(placas).toHaveLength(9);
    placas.forEach((p) => {
      expect(p.scale[2]).toBeGreaterThan(p.scale[0] * 2); // el doble de grosor
      expect(p.scale[1]).toBeGreaterThan(p.scale[0]); // más altas
      const mats = p.children.map((c) => gltf.nodes[c]).filter((k) => k.mesh !== undefined)
        .map((k) => gltf.materials[gltf.meshes[k.mesh].primitives[0].material].name);
      expect(mats).toContain('mat_placa_cantera_brillo');
      expect(mats).toContain('mat_placa_texto_oro_brillo');
    });
    const logos = gltf.materials.filter((m) => /^mat_logo_(itt|cecan|solon_arguello)_bienvenida$/.test(m.name));
    expect(logos).toHaveLength(3);
    logos.forEach((m) => {
      expect(m.emissiveTexture).toBeDefined();
      expect(m.emissiveFactor[0]).toBeGreaterThan(0);
    });
  });

  it('GLB: el botón del muro dice REFERENCIAS (el nodo conserva su nombre para la app)', () => {
    const gltf = readGltf();
    expect(gltf.nodes.some((n) => n.name === 'boton_bienvenida_acerca_de')).toBe(true);
    const script = fs.readFileSync(path.resolve(process.cwd(), 'scripts', 'generate_museo_glb_v16.js'), 'utf8');
    expect(script).toContain("new TextGeometry('REFERENCIAS'");
    expect(script).not.toContain("new TextGeometry('ACERCA DE'");
  });
});
