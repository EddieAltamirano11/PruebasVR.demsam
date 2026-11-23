import { describe, it, expect } from 'vitest';
import { computeLensLayout, VIEWER_PROFILE } from './StereoVRManager.jsx';

describe('StereoVRManager · modo visor (iPhone / navegadores sin WebXR)', () => {
  it('centra cada ojo en su lente: separación física de 64 mm, simétrica respecto al centro', () => {
    // iPhone 14 en horizontal: 844 × 390 px CSS, renderizado a 2×
    const layout = computeLensLayout({ cssWidth: 844, cssHeight: 390, pixelRatio: 2 });
    expect(layout.width).toBe(1688);
    expect(layout.height).toBe(780);

    const separationMm = (layout.right[0] - layout.left[0]) / layout.pxPerMm;
    expect(separationMm).toBeCloseTo(VIEWER_PROFILE.interLensMm, 6);
    expect(layout.width / 2 - layout.left[0]).toBeCloseTo(layout.right[0] - layout.width / 2, 6);
    expect(layout.left[1]).toBe(layout.height / 2);
  });

  it('cada lente cae dentro de su mitad de pantalla', () => {
    const layout = computeLensLayout({ cssWidth: 844, cssHeight: 390, pixelRatio: 2 });
    expect(layout.left[0]).toBeGreaterThan(0);
    expect(layout.left[0]).toBeLessThan(layout.width / 2);
    expect(layout.right[0]).toBeGreaterThan(layout.width / 2);
    expect(layout.right[0]).toBeLessThan(layout.width);
  });

  it('convierte con el pixelRatio real del render (no con devicePixelRatio)', () => {
    const at1 = computeLensLayout({ cssWidth: 844, cssHeight: 390, pixelRatio: 1 });
    const at2 = computeLensLayout({ cssWidth: 844, cssHeight: 390, pixelRatio: 2 });
    expect(at2.pxPerMm).toBeCloseTo(at1.pxPerMm * 2, 6);
    expect(at2.left[0]).toBeCloseTo(at1.left[0] * 2, 6);
  });
});
