import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

export function WebXRManager({ onSessionChange, onTriggerRef }) {
  const { gl } = useThree();

  useEffect(() => {
    // 1. Habilitar el motor WebXR en Three.js
    gl.xr.enabled = true;

    // 2. Crear el botón nativo de WebXR pero SIN mostrarlo: la compatibilidad se comunica en la
    //    pantalla de inicio (tarjeta "Experiencia VR" opaca con aviso). Three.js reescribe
    //    style.display del botón, por eso se aloja dentro de un contenedor oculto; click()
    //    programático sigue funcionando para iniciar la sesión inmersiva.
    const button = VRButton.createButton(gl);
    const hiddenHost = document.createElement('div');
    hiddenHost.setAttribute('aria-hidden', 'true');
    hiddenHost.dataset.webxrHiddenButton = 'true';
    hiddenHost.style.display = 'none';
    hiddenHost.appendChild(button);
    document.body.appendChild(hiddenHost);

    // 3. Vincular ref para que cualquier otro boton pueda disparar el clic nativo
    if (onTriggerRef) {
      onTriggerRef.current = () => {
        button.click();
      };
    }

    // 4. Escuchar eventos de inicio y fin de sesion VR
    const onStart = () => {
      console.log('Sesion WebXR iniciada');

      // Maximizar nitidez: factor de escala 1.5 en el framebuffer WebXR
      if (typeof gl.xr.setFramebufferScaleFactor === 'function') {
        gl.xr.setFramebufferScaleFactor(1.5);
      }

      // Eliminar foveación periférica para evitar textos borrosos
      if (typeof gl.xr.setFoveation === 'function') {
        gl.xr.setFoveation(0);
      }

      if (onSessionChange) onSessionChange(true);
    };

    const onEnd = () => {
      console.log('Sesion WebXR finalizada');
      if (onSessionChange) onSessionChange(false);
    };

    gl.xr.addEventListener('sessionstart', onStart);
    gl.xr.addEventListener('sessionend', onEnd);

    return () => {
      gl.xr.removeEventListener('sessionstart', onStart);
      gl.xr.removeEventListener('sessionend', onEnd);
      hiddenHost.remove();
    };
  }, [gl, onSessionChange, onTriggerRef]);

  return null;
}
