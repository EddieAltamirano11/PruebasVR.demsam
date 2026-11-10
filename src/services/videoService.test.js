import { describe, it, expect, vi } from 'vitest';
import {
  VIDEO_QUALITIES,
  DEFAULT_VIDEO_SOURCES,
  DEFAULT_VIDEO_POSTER,
  formatVideoTime,
  getDefaultVideoQuality,
  resolveVideoSource,
  parseContentRangeTotal,
  formatBytesMB,
  probeHttpRangeSupport
} from './videoService.js';

describe('Video Streaming Service (720p/480p + HTTP Range)', () => {
  describe('formatVideoTime', () => {
    it('formats seconds safely into MM:SS or H:MM:SS', () => {
      expect(formatVideoTime(0)).toBe('00:00');
      expect(formatVideoTime(-5)).toBe('00:00');
      expect(formatVideoTime(Number.NaN)).toBe('00:00');
      expect(formatVideoTime(65)).toBe('01:05');
      expect(formatVideoTime(202)).toBe('03:22');
      expect(formatVideoTime(3661)).toBe('1:01:01');
    });
  });

  describe('getDefaultVideoQuality', () => {
    it('selects 480p when Save-Data or slow mobile networks are reported', () => {
      expect(getDefaultVideoQuality({ connection: { saveData: true, effectiveType: '4g' } })).toBe('480p');
      expect(getDefaultVideoQuality({ connection: { saveData: false, effectiveType: '3g' } })).toBe('480p');
      expect(getDefaultVideoQuality({ connection: { saveData: false, effectiveType: '2g' } })).toBe('480p');
      expect(getDefaultVideoQuality({ connection: { saveData: false, effectiveType: '4g', downlink: 1.8 } })).toBe('480p');
    });

    it('defaults to 720p on fast or unknown connections', () => {
      expect(getDefaultVideoQuality({ connection: { saveData: false, effectiveType: '4g', downlink: 10 } })).toBe('720p');
      expect(getDefaultVideoQuality(null)).toBe('720p');
      expect(getDefaultVideoQuality({})).toBe('720p');
    });
  });

  describe('resolveVideoSource & quality constants', () => {
    it('resolves 720p and 480p sources accurately with safe fallbacks', () => {
      expect(VIDEO_QUALITIES).toEqual(['720p', '480p']);
      expect(DEFAULT_VIDEO_POSTER).toBe('./videos/videoPrueba_poster.jpg');

      const mockVideo = {
        sources: {
          '720p': './videos/videoPrueba_720p.mp4',
          '480p': './videos/videoPrueba_480p.mp4'
        }
      };

      expect(resolveVideoSource(mockVideo, '720p')).toBe(DEFAULT_VIDEO_SOURCES['720p']);
      expect(resolveVideoSource(mockVideo, '480p')).toBe(DEFAULT_VIDEO_SOURCES['480p']);
      expect(resolveVideoSource(mockVideo, 'invalid')).toBe(DEFAULT_VIDEO_SOURCES['720p']);
      expect(resolveVideoSource({}, '480p')).toBe(DEFAULT_VIDEO_SOURCES['480p']);
    });
  });

  describe('Content-Range & byte formatting helpers', () => {
    it('parses HTTP Content-Range total bytes cleanly', () => {
      expect(parseContentRangeTotal('bytes 0-1023/17502331')).toBe(17502331);
      expect(parseContentRangeTotal('bytes 1024-2047/8797062')).toBe(8797062);
      expect(parseContentRangeTotal('bytes */*')).toBeNull();
      expect(parseContentRangeTotal(null)).toBeNull();
    });

    it('formats byte counts in megabytes', () => {
      expect(formatBytesMB(17502331)).toBe('16.7 MB');
      expect(formatBytesMB(8797062)).toBe('8.4 MB');
      expect(formatBytesMB(0)).toBe('0.0 MB');
    });
  });

  describe('probeHttpRangeSupport', () => {
    it('detects HTTP 206 Partial Content with Content-Range metadata using a 1KB GET Range probe', async () => {
      const cancelSpy = vi.fn().mockResolvedValue(undefined);
      const mockFetch = vi.fn().mockResolvedValue({
        status: 206,
        headers: {
          get: (key) => {
            const k = key.toLowerCase();
            if (k === 'accept-ranges') return 'bytes';
            if (k === 'content-range') return 'bytes 0-1023/17502331';
            if (k === 'content-length') return '1024';
            return null;
          }
        },
        body: { cancel: cancelSpy }
      });

      const result = await probeHttpRangeSupport('./videos/videoPrueba_720p.mp4', {
        fetchImpl: mockFetch
      });

      expect(mockFetch).toHaveBeenCalledWith('./videos/videoPrueba_720p.mp4', {
        method: 'GET',
        headers: { Range: 'bytes=0-1023' },
        signal: undefined
      });
      expect(cancelSpy).toHaveBeenCalledTimes(1);
      expect(result.status).toBe(206);
      expect(result.supported).toBe(true);
      expect(result.partialContent).toBe(true);
      expect(result.totalBytes).toBe(17502331);
      expect(result.sizeLabel).toBe('16.7 MB');
    });

    it('handles HTTP 200 servers without 206 Partial Content gracefully', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        status: 200,
        headers: {
          get: (key) => (key.toLowerCase() === 'content-length' ? '8797062' : null)
        },
        body: { cancel: vi.fn() }
      });

      const result = await probeHttpRangeSupport('./videos/videoPrueba_480p.mp4', {
        fetchImpl: mockFetch
      });

      expect(result.status).toBe(200);
      expect(result.supported).toBe(false);
      expect(result.partialContent).toBe(false);
      expect(result.sizeLabel).toBe('8.4 MB');
    });

    it('returns aborted flag cleanly when request is cancelled', async () => {
      const abortErr = new Error('The operation was aborted.');
      abortErr.name = 'AbortError';
      const mockFetch = vi.fn().mockRejectedValue(abortErr);

      const result = await probeHttpRangeSupport('./videos/videoPrueba_720p.mp4', {
        fetchImpl: mockFetch
      });

      expect(result.aborted).toBe(true);
      expect(result.supported).toBe(false);
    });
  });
});
