/**
 * WebXR & Device Sensor Service
 */
export const WebXRService = {
  /**
   * Check if immersive VR is supported by the user agent
   */
  async checkVRSupport() {
    if (typeof navigator !== 'undefined' && 'xr' in navigator && navigator.xr) {
      try {
        return await navigator.xr.isSessionSupported('immersive-vr');
      } catch (err) {
        console.warn('WebXR support check failed:', err);
        return false;
      }
    }
    return false;
  },

  /**
   * Request device orientation sensor permission (required on iOS Safari)
   */
  async requestOrientationPermission() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const response = await DeviceOrientationEvent.requestPermission();
        return response === 'granted';
      } catch (err) {
        console.warn('DeviceOrientationEvent requestPermission failed:', err);
        return false;
      }
    }
    return true;
  },

  /**
   * Toggle fullscreen mode
   */
  async toggleFullscreen(enable) {
    const el = document.documentElement;
    if (enable) {
      const rfs = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
      if (rfs) {
        await Promise.resolve(rfs.call(el)).catch(() => {});
        if (window.screen?.orientation?.lock) {
          await window.screen.orientation.lock('landscape').catch(() => {});
        }
      }
    } else {
      const efs = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
      if (efs && (document.fullscreenElement || document.webkitFullscreenElement)) {
        await Promise.resolve(efs.call(document)).catch(() => {});
      }
    }
  }
};

export default WebXRService;
