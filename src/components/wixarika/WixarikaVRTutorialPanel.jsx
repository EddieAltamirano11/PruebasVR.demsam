import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from './VRText.jsx';
import * as THREE from 'three';
import { WixarikaVRButton } from './WixarikaVRButton.jsx';

const PANEL_W = 3.0;
const PANEL_H = 1.75;
const DISTANCE = 2.4; // m frente al visitante (letra de ~2.7° de alto: se lee sin esfuerzo en el visor)
const REFOLLOW_ANGLE = THREE.MathUtils.degToRad(50); // si se aleja más, el panel vuelve al frente

/**
 * Tutorial VR mínimo: dos frases cortas, letra grande y sin íconos (los íconos parecían botones).
 */
export const VR_TUTORIAL_STEPS = [
  'Mueve la cabeza para mirar.',
  'Mira una imagen 2 segundos para abrirla.'
];

/**
 * Tutorial inicial de la Experiencia VR (panel 3D frente al visitante).
 * Se coloca frente a la mirada al iniciar y, si el visitante gira mucho, vuelve suavemente
 * al frente para que siempre pueda leerse. Se cierra con el botón "Comenzar" (mirada o botón del visor).
 */
export function WixarikaVRTutorialPanel({ onClose, registerMesh, unregisterMesh }) {
  const { camera } = useThree();
  const groupRef = useRef();
  const bgRef = useRef();
  const placed = useRef(false);
  const elapsed = useRef(0);
  const goal = useRef(new THREE.Vector3());
  const camPos = useRef(new THREE.Vector3());
  const camDir = useRef(new THREE.Vector3());
  const toPanel = useRef(new THREE.Vector3());

  // El fondo bloquea la retícula para no seleccionar cuadros que queden detrás del panel
  useEffect(() => {
    const mesh = bgRef.current;
    if (mesh) {
      mesh.userData = { id: 'vr-tutorial-backdrop-blocker', isBlocker: true };
      registerMesh?.(mesh);
    }
    return () => {
      if (mesh) unregisterMesh?.(mesh);
    };
  }, [registerMesh, unregisterMesh]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    elapsed.current += delta;

    camera.updateWorldMatrix(true, false);
    camera.getWorldPosition(camPos.current);
    camera.getWorldDirection(camDir.current);
    camDir.current.y = 0;
    if (camDir.current.lengthSq() < 1e-4) return;
    camDir.current.normalize();

    const frontOfGaze = () =>
      goal.current.copy(camPos.current).addScaledVector(camDir.current, DISTANCE).setY(camPos.current.y);

    // Esperar un instante a que el giroscopio / WebXR entregue la orientación real
    if (!placed.current) {
      if (elapsed.current < 0.35) {
        group.visible = false;
        return;
      }
      frontOfGaze();
      group.position.copy(goal.current);
      group.visible = true;
      placed.current = true;
    } else {
      toPanel.current.copy(group.position).sub(camPos.current).setY(0).normalize();
      if (toPanel.current.angleTo(camDir.current) > REFOLLOW_ANGLE) frontOfGaze();
      group.position.lerp(goal.current, Math.min(1, delta * 3));
    }
    group.lookAt(camPos.current.x, group.position.y, camPos.current.z);
  });

  return (
    <group ref={groupRef} visible={false}>
      {/* Marco y fondo */}
      <mesh position={[0, 0, -0.003]}>
        <planeGeometry args={[PANEL_W + 0.06, PANEL_H + 0.06]} />
        <meshBasicMaterial color="#5c381e" />
      </mesh>
      <mesh position={[0, 0, -0.002]}>
        <planeGeometry args={[PANEL_W + 0.025, PANEL_H + 0.025]} />
        <meshBasicMaterial color="#c69214" />
      </mesh>
      <mesh ref={bgRef}>
        <planeGeometry args={[PANEL_W, PANEL_H]} />
        <meshBasicMaterial color="#faf6eb" />
      </mesh>

      {VR_TUTORIAL_STEPS.map((line, i) => (
        <Text
          key={line}
          position={[0, 0.42 - i * 0.36, 0.005]}
          fontSize={0.135}
          color="#1c1917"
          anchorX="center"
          anchorY="middle"
          maxWidth={PANEL_W * 0.9}
          textAlign="center"
        >
          {line}
        </Text>
      ))}

      <WixarikaVRButton
        id="btn-vr-tutorial-start"
        label="Comenzar"
        variant="cantera"
        width={1.3}
        height={0.34}
        position={[0, -PANEL_H / 2 + 0.36, 0.01]}
        onClick={onClose}
        registerMesh={registerMesh}
        unregisterMesh={unregisterMesh}
        showDiamonds={false}
      />
    </group>
  );
}

export default WixarikaVRTutorialPanel;
