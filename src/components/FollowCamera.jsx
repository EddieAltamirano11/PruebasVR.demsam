import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const _targetDir = new THREE.Vector3();
const _targetQuat = new THREE.Quaternion();
const _forwardZ = new THREE.Vector3(0, 0, -1);

export function FollowCamera({
  carObj,
  followActive,
  followType, // 'chase' | 'side' | 'roof'
  fixedView, // 'origin' | 'center' | 'aerial' | null
  orbitControlsRef,
  cameraRigRef,
  vrMode = false
}) {
  const { camera } = useThree();
  const tempVec = useRef(new THREE.Vector3());
  const targetCamPos = useRef(new THREE.Vector3(-445, 4.5, 32));
  const lookTarget = useRef(new THREE.Vector3(-470, 4.5, 32));
  const prevVrMode = useRef(vrMode);

  // Inicializar suavemente la posicion del Camera Rig al entrar a WebXR
  useEffect(() => {
    if (vrMode && !prevVrMode.current && cameraRigRef?.current) {
      cameraRigRef.current.position.copy(targetCamPos.current);
      camera.position.set(0, 0, 0);
    }
    prevVrMode.current = vrMode;
  }, [vrMode, camera, cameraRigRef]);

  useFrame((state, delta) => {
    // 1. Calcular posicion deseada de camara y objetivo de mirada segun el modo
    if (followActive && carObj) {
      carObj.getWorldPosition(tempVec.current);
      const carPos = tempVec.current;
      const carCenterZ = carPos.z - 13.2;

      if (followType === 'chase') {
        // Detras de la defensa trasera del Bocho
        targetCamPos.current.set(carPos.x - 52, 9.5, carCenterZ);
        lookTarget.current.set(carPos.x, 5.0, carCenterZ);
      } else if (followType === 'side') {
        // Vista lateral en acera/ventanilla mirando al auto
        targetCamPos.current.set(carPos.x - 16, 5.5, carCenterZ + 25);
        lookTarget.current.set(carPos.x - 16, 4.5, carCenterZ);
      } else {
        // Vista techo / cofre mirando al frente de la marcha
        targetCamPos.current.set(carPos.x - 12, 8.5, carCenterZ);
        lookTarget.current.set(carPos.x + 30, 4.0, carCenterZ);
      }
    } else {
      // VISTAS FIJAS (Salida, Acera, Aerea) - Operativas 100% en WebXR y 2D
      if (fixedView === 'origin') {
        targetCamPos.current.set(-445, 4.5, 32);
        lookTarget.current.set(-470, 4.5, 32);
      } else if (fixedView === 'center') {
        targetCamPos.current.set(0, 4, 38);
        lookTarget.current.set(0, 3, 0);
      } else if (fixedView === 'aerial') {
        targetCamPos.current.set(0, 60, 120);
        lookTarget.current.set(0, 0, 0);
      }
    }

    const factor = Math.min(1.0, delta * 12);
    const rig = cameraRigRef?.current;

    // 2. Mover segun el modo: WebXR opera sobre el Camera Rig (Dolly), 2D sobre camera directamente
    if (vrMode && rig) {
      rig.position.lerp(targetCamPos.current, factor);

      // Orientar el rig en el plano horizontal para que el frente del visor (WebXR) mire a la accion
      _targetDir.subVectors(lookTarget.current, targetCamPos.current);
      _targetDir.y = 0; // Mantener nivelado con el horizonte en VR para evitar mareos
      if (_targetDir.lengthSq() > 0.001) {
        _targetDir.normalize();
        _targetQuat.setFromUnitVectors(_forwardZ, _targetDir);
        rig.quaternion.slerp(_targetQuat, Math.min(1.0, delta * 8));
      }
    } else {
      // En modo 2D (no VR): mantener rig neutral y mover la camara directamente
      if (rig) {
        rig.position.set(0, 0, 0);
        rig.quaternion.identity();
      }
      camera.position.lerp(targetCamPos.current, factor);
      camera.lookAt(lookTarget.current);

      if (orbitControlsRef?.current) {
        orbitControlsRef.current.target.lerp(lookTarget.current, Math.min(1.0, delta * 8));
        orbitControlsRef.current.update();
      }
    }
  });

  return null;
}
