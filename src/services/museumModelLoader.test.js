import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { startMuseumModelDownload, MUSEUM_MODEL_URL, __resetMuseumModelLoader } from './museumModelLoader.js';

const streamOf = (parts) => {
  let i = 0;
  return {
    getReader: () => ({
      read: async () => (i < parts.length ? { done: false, value: parts[i++] } : { done: true })
    })
  };
};

describe('Descarga del modelo 3D con avance', () => {
  const realFetch = globalThis.fetch;
  const realCreate = URL.createObjectURL;
  beforeEach(() => {
    __resetMuseumModelLoader();
    URL.createObjectURL = vi.fn(() => 'blob:museo');
  });
  afterEach(() => {
    globalThis.fetch = realFetch;
    URL.createObjectURL = realCreate;
  });

  it('descarga una sola vez, mide los bytes y entrega una URL local', async () => {
    const parts = [new Uint8Array(400), new Uint8Array(600)];
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      headers: { get: () => '1000' },
      body: streamOf(parts)
    }));
    const p1 = startMuseumModelDownload();
    const p2 = startMuseumModelDownload();
    expect(p1).toBe(p2);
    await expect(p1).resolves.toBe('blob:museo');
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(globalThis.fetch).toHaveBeenCalledWith(MUSEUM_MODEL_URL);
  });

  it('si la descarga falla, usa la URL original del modelo', async () => {
    globalThis.fetch = vi.fn(async () => ({ ok: false, status: 503, headers: { get: () => null } }));
    await expect(startMuseumModelDownload()).resolves.toBe(MUSEUM_MODEL_URL);
  });
});
