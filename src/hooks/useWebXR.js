import { useState, useEffect } from 'react';
import { WebXRService } from '../services/webxrService.js';

/**
 * Custom hook to detect WebXR VR support and device capabilities
 */
export function useWebXR() {
  const [isSupported, setIsSupported] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    WebXRService.checkVRSupport().then((supported) => {
      if (mounted) {
        setIsSupported(supported);
        setChecking(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return { isSupported, checking };
}

export default useWebXR;
