import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

describe('QA - Lightweight Bundle Performance Verification', () => {
  const distPath = path.resolve(process.cwd(), 'dist', 'assets');

  it('dist/assets directory should exist after build', () => {
    const exists = fs.existsSync(distPath);
    expect(exists).toBe(true);
  });

  it('all javascript asset chunks must be under 500 KB gzip', () => {
    if (!fs.existsSync(distPath)) return;

    const files = fs.readdirSync(distPath).filter(f => f.endsWith('.js'));
    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const filePath = path.join(distPath, file);
      const content = fs.readFileSync(filePath);
      const gzipped = zlib.gzipSync(content);
      const sizeKB = gzipped.length / 1024;

      // Quality Gate: Each chunk must be strictly under 500 KB gzip
      expect(sizeKB).toBeLessThan(500);
    }
  });
});
