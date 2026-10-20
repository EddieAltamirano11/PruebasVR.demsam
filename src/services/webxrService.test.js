import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebXRService } from './webxrService.js';

describe('WebXRService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should return false when WebXR is not present in navigator', async () => {
    const originalXR = navigator.xr;
    delete navigator.xr;
    const isSupported = await WebXRService.checkVRSupport();
    expect(isSupported).toBe(false);
    navigator.xr = originalXR;
  });

  it('should query navigator.xr.isSessionSupported if available', async () => {
    navigator.xr = {
      isSessionSupported: vi.fn().mockResolvedValue(true)
    };
    const isSupported = await WebXRService.checkVRSupport();
    expect(isSupported).toBe(true);
    expect(navigator.xr.isSessionSupported).toHaveBeenCalledWith('immersive-vr');
  });

  it('should grant orientation permission automatically if DeviceOrientationEvent does not require permission', async () => {
    const granted = await WebXRService.requestOrientationPermission();
    expect(granted).toBe(true);
  });
});
