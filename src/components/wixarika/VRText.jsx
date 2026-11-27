import React, { createContext, forwardRef, useContext } from 'react';
import { Text as DreiText } from '@react-three/drei';

/**
 * true cuando la escena se ve en el visor VR. Lo provee MuseumScene dentro del Canvas.
 */
export const VRModeContext = createContext(false);

/** Color de todo el texto 3D en el visor: negro, el más fácil de leer a través de las lentes. */
export const VR_TEXT_COLOR = '#000000';

/**
 * Texto 3D (troika) de los paneles del museo. Igual que el Text de drei, pero en el visor VR
 * fuerza el color negro para que todo se lea con el máximo contraste sobre la cantera clara.
 */
export const Text = forwardRef(function VRText({ color, ...props }, ref) {
  const vrMode = useContext(VRModeContext);
  return <DreiText ref={ref} color={vrMode ? VR_TEXT_COLOR : color} {...props} />;
});

export default Text;
