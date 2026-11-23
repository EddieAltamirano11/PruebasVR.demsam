import { describe, it, expect } from 'vitest';
import { computeEyeViewports } from './StereoVRManager.jsx';

describe('StereoVRManager · vista dividida para cada ojo (modo visor iPhone / Cardboard)', () => {
  it('divide la pantalla en dos mitades en píxeles CSS (three.js aplica el DPR después)', () => {
    // iPhone 14 en horizontal: 844 × 390 CSS px (DPR 3, limitado a 2 en la app)
    const { left, right } = computeEyeViewports(844, 390);
    expect(left).toEqual([0, 0, 422, 390]);
    expect(right).toEqual([422, 0, 422, 390]);
  });

  it('ambos ojos cubren exactamente el ancho visible sin salirse de la pantalla', () => {
    const width = 915;
    const { left, right } = computeEyeViewports(width, 412);
    expect(left[2] + right[2]).toBe(width);
    expect(right[0] + right[2]).toBe(width);
  });
});
