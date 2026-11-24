import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import {
  VIEWER_CENTER,
  LOOK_RADIUS,
  initialLookTarget,
  lookTargetFromAngles,
  stationLookAngles,
  anglesFromDirection,
  shortestAngle
} from './viewerCenter.js';

const dirTo = (target) => new THREE.Vector3(...target).sub(new THREE.Vector3(...VIEWER_CENTER));

describe('Espectador fijo en el centro del museo', () => {
  it('el centro está en x = z = 0 a la altura de los ojos del modo VR', () => {
    expect(VIEWER_CENTER).toEqual([0, 1.6, 0]);
  });

  it('la vista inicial mira a Bienvenida (+Z) desde el centro', () => {
    const d = dirTo(initialLookTarget());
    expect(d.length()).toBeCloseTo(LOOK_RADIUS, 6);
    expect(d.z).toBeGreaterThan(0.09);
    expect(Math.abs(d.x)).toBeLessThan(1e-9);
  });

  it('cada sala se ve girando desde el centro hacia su muro', () => {
    const cases = { deidades: [0, -1], gastronomia: [1, 0], fiestas: [-1, 0], home: [0, 1] };
    for (const [id, [x, z]] of Object.entries(cases)) {
      const { yaw, pitch } = stationLookAngles(id);
      const d = dirTo(lookTargetFromAngles(yaw, pitch)).setY(0).normalize();
      expect(d.x).toBeCloseTo(x, 6);
      expect(d.z).toBeCloseTo(z, 6);
    }
    expect(stationLookAngles('no-existe')).toBeNull();
  });

  it('ángulos y giro más corto', () => {
    const a = anglesFromDirection(new THREE.Vector3(1, 0, 0));
    expect(a.yaw).toBeCloseTo(Math.PI / 2, 6);
    expect(a.pitch).toBeCloseTo(0, 6);
    expect(shortestAngle(Math.PI * 0.9, -Math.PI * 0.9)).toBeCloseTo(Math.PI * 0.2, 6);
  });
});
