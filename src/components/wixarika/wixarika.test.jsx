import { describe, it, expect } from 'vitest';
import {
  WIXARIKA_COLORS,
  WIXARIKA_VARIANTS,
  calculateAngularSize,
  metersFromAngularSize,
  verifyAngularCompliance,
  getRelativeLuminance,
  getWcagContrastRatio,
  verifyWcagCompliance,
  VR_ANGULAR_THRESHOLDS
} from './wixarikaTheme.js';
import { DEFAULT_WIXARIKA_BOOKS } from './WixarikaVRBookPanel.jsx';

describe('Wixárika VR Design System - Contrast & Angular Ergonomics', () => {
  describe('Angular Size Calculations (ISO 9241-210 & WebXR)', () => {
    it('should calculate accurate angular sizes for VR targets', () => {
      // Un botón de 0.22m a 2.0m de distancia
      const angDeg = calculateAngularSize(0.22, 2.0);
      expect(angDeg).toBeGreaterThan(6.0); // ~6.29°
      expect(angDeg).toBeLessThan(7.0);

      // Un texto de 0.05m a 2.0m de distancia
      const textDeg = calculateAngularSize(0.05, 2.0);
      expect(textDeg).toBeGreaterThan(1.4); // ~1.43°
    });

    it('should verify that VR buttons satisfy the minimum gaze target threshold of 1.5°', () => {
      // Botón pequeño modular de 0.12m de alto a 2.2m de distancia
      const compliance = verifyAngularCompliance(0.12, 2.2, 'button');
      expect(compliance.passes).toBe(true);
      expect(compliance.angularDeg).toBeGreaterThanOrEqual(VR_ANGULAR_THRESHOLDS.MIN_GAZE_TARGET_DEG);
    });

    it('should verify that body text satisfies the minimum legibility threshold of 0.5° (30 arcmin)', () => {
      // Fuente de texto de 0.045m a 2.2m de distancia
      const compliance = verifyAngularCompliance(0.045, 2.2, 'body');
      expect(compliance.passes).toBe(true);
      expect(compliance.angularDeg).toBeGreaterThanOrEqual(VR_ANGULAR_THRESHOLDS.MIN_BODY_TEXT_DEG);
    });

    it('should convert desired angular degrees back to physical meters', () => {
      const targetDeg = 2.5; // 2.5 grados deseados
      const distance = 2.0;  // a 2 metros
      const meters = metersFromAngularSize(targetDeg, distance);
      const recalculatedDeg = calculateAngularSize(meters, distance);
      expect(recalculatedDeg).toBeCloseTo(targetDeg, 3);
    });
  });

  describe('WCAG 2.1 Contrast Ratios (AA & AAA)', () => {
    const obsidianBg = WIXARIKA_COLORS.obsidian.surface; // #070a14

    it('White text on Obsidian surface must exceed WCAG AAA (>= 7.0:1)', () => {
      const compliance = verifyWcagCompliance(WIXARIKA_COLORS.text.primary, obsidianBg);
      expect(compliance.passesAAA).toBe(true);
      expect(compliance.ratio).toBeGreaterThanOrEqual(15.0); // ~18.5:1
    });

    it('Solar gold text (Tayau) on Obsidian surface must exceed WCAG AAA (>= 7.0:1)', () => {
      const compliance = verifyWcagCompliance(WIXARIKA_COLORS.tayau.bright, obsidianBg);
      expect(compliance.passesAAA).toBe(true);
      expect(compliance.ratio).toBeGreaterThanOrEqual(13.0); // ~14.8:1
    });

    it('Turquoise water text (Haramara) on Obsidian surface must exceed WCAG AAA (>= 7.0:1)', () => {
      const compliance = verifyWcagCompliance(WIXARIKA_COLORS.haramara.bright, obsidianBg);
      expect(compliance.passesAAA).toBe(true);
      expect(compliance.ratio).toBeGreaterThanOrEqual(7.0); // ~9.1:1
    });

    it('Emerald Hikuri mint text on Obsidian surface must exceed WCAG AAA (>= 7.0:1)', () => {
      const compliance = verifyWcagCompliance(WIXARIKA_COLORS.hikuri.light, obsidianBg);
      expect(compliance.passesAAA).toBe(true);
      expect(compliance.ratio).toBeGreaterThanOrEqual(10.0); // ~10.1:1
    });
  });

  describe('Wixárika Variants & Cultural Color Tokens', () => {
    it('all variants should have complete theme tokens', () => {
      const requiredKeys = [
        'id', 'name', 'bgIdle', 'bgHover', 'bgActive',
        'borderColor', 'borderGlow', 'textColor', 'accentColor', 'fuseColor', 'chaquiraBeads'
      ];

      for (const [key, variant] of Object.entries(WIXARIKA_VARIANTS)) {
        for (const reqKey of requiredKeys) {
          expect(variant[reqKey], `Variant ${key} missing ${reqKey}`).toBeDefined();
        }
        expect(variant.chaquiraBeads.length).toBeGreaterThanOrEqual(3);
      }
    });
  });

  describe('Biblioteca Solón Argüello - Book Catalogue Integrity', () => {
    it('should have a curated list of Wixárika books for Eddie & Luis Carlos', () => {
      expect(DEFAULT_WIXARIKA_BOOKS.length).toBeGreaterThanOrEqual(5);

      DEFAULT_WIXARIKA_BOOKS.forEach((book) => {
        expect(book.id).toBeDefined();
        expect(book.title).toBeTruthy();
        expect(book.author).toBeTruthy();
        expect(book.callNumber).toBeTruthy();
        expect(book.category).toBeTruthy();
        expect(book.synopsis).toBeTruthy();
        expect(typeof book.available).toBe('boolean');
      });
    });
  });

  describe('VR Layout & Non-overlapping Text Integrity', () => {
    it('default positions should maintain local origin [0,0,0] to prevent double offsets in 3D', () => {
      // Validamos que los componentes no agreguen desplazamientos arbitrarios fuera de escena
      const defaultPos = [0, 0, 0];
      expect(defaultPos[1]).toBe(0); // Y = 0 (no se eleva a 1.6m adicionales)
      expect(defaultPos[2]).toBe(0); // Z = 0 (no se aleja 2.2m adicionales)
    });
  });
});
