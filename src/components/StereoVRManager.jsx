import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

/**
 * Parámetros del visor (estilo Google Cardboard v2 / Homido Grab).
 * Se usan solo en el modo visor propio (iPhone y navegadores sin WebXR); en Android con
 * Chrome la vista la dibuja el WebXR nativo con su propio perfil de visor.
 */
export const VIEWER_PROFILE = {
  interLensMm: 64, // distancia entre centros de los lentes
  screenToLensMm: 39, // distancia de la pantalla a los lentes
  k1: 0.34, // coeficientes de distorsión de barril
  k2: 0.55,
  eyeFovDeg: 100, // campo de visión renderizado por ojo
  cssPxPerMm: 6.3 // densidad típica de un celular en píxeles CSS por milímetro (~160 por pulgada)
};

/**
 * Posición de los centros de los lentes en píxeles del búfer (no CSS): three.js dibuja el
 * búfer con pixelRatio aplicado, así que todo se convierte con ese factor.
 */
export function computeLensLayout({
  cssWidth,
  cssHeight,
  pixelRatio = 1,
  cssPxPerMm = VIEWER_PROFILE.cssPxPerMm,
  interLensMm = VIEWER_PROFILE.interLensMm
}) {
  const width = cssWidth * pixelRatio;
  const height = cssHeight * pixelRatio;
  const pxPerMm = cssPxPerMm * pixelRatio;
  const halfLens = (interLensMm / 2) * pxPerMm;
  return {
    width,
    height,
    pxPerMm,
    left: [width / 2 - halfLens, height / 2],
    right: [width / 2 + halfLens, height / 2]
  };
}

const distortionVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// Compone ambos ojos en pantalla: centra cada imagen en su lente, aplica distorsión de barril
// (compensa la curvatura de los lentes) y deja en negro todo lo que queda fuera del círculo
// visible de cada ojo, igual que el modo Cardboard de Android.
const distortionFragment = /* glsl */ `
  uniform sampler2D tLeft;
  uniform sampler2D tRight;
  uniform vec2 uResolution;
  uniform vec2 uLensLeft;
  uniform vec2 uLensRight;
  uniform float uPxPerMm;
  uniform float uScreenToLensMm;
  uniform float uK1;
  uniform float uK2;
  uniform float uTanHalfFov;
  varying vec2 vUv;

  void main() {
    vec2 frag = vUv * uResolution;
    float halfW = uResolution.x * 0.5;
    bool isLeft = frag.x < halfW;
    vec2 lens = isLeft ? uLensLeft : uLensRight;

    // Línea divisoria negra de 2 px entre ambos ojos
    if (abs(frag.x - halfW) < 2.0) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }

    // Tangente del ángulo de visión en la pantalla (mm desde el centro del lente / distancia al lente)
    vec2 t = (frag - lens) / uPxPerMm / uScreenToLensMm;
    float r2 = dot(t, t);
    // Distorsión de barril: tangente en el mundo virtual
    vec2 w = t * (1.0 + uK1 * r2 + uK2 * r2 * r2);
    float wr = length(w);

    if (wr > uTanHalfFov) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }

    vec2 uv = 0.5 + 0.5 * (w / uTanHalfFov);
    vec4 color = isLeft ? texture2D(tLeft, uv) : texture2D(tRight, uv);

    // Viñeta suave en el borde del círculo visible
    float vignette = 1.0 - smoothstep(uTanHalfFov * 0.90, uTanHalfFov, wr);
    gl_FragColor = vec4(color.rgb * vignette, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function StereoVRManager({ eyeSep = 0.064 }) {
  const { gl } = useThree();
  const sizeVec = useRef(new THREE.Vector2());

  const eye = useMemo(() => {
    const fov = VIEWER_PROFILE.eyeFovDeg;
    const makeTarget = () =>
      new THREE.WebGLRenderTarget(1024, 1024, {
        samples: 4,
        type: THREE.UnsignedByteType,
        depthBuffer: true
      });
    return {
      camera: new THREE.PerspectiveCamera(fov, 1, 0.05, 1000),
      left: makeTarget(),
      right: makeTarget(),
      tanHalfFov: Math.tan(THREE.MathUtils.degToRad(fov / 2))
    };
  }, []);

  const composite = useMemo(() => {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        tLeft: { value: eye.left.texture },
        tRight: { value: eye.right.texture },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uLensLeft: { value: new THREE.Vector2() },
        uLensRight: { value: new THREE.Vector2() },
        uPxPerMm: { value: 1 },
        uScreenToLensMm: { value: VIEWER_PROFILE.screenToLensMm },
        uK1: { value: VIEWER_PROFILE.k1 },
        uK2: { value: VIEWER_PROFILE.k2 },
        uTanHalfFov: { value: eye.tanHalfFov }
      },
      vertexShader: distortionVertex,
      fragmentShader: distortionFragment,
      depthTest: false,
      depthWrite: false
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    quad.frustumCulled = false;
    const scene = new THREE.Scene();
    scene.add(quad);
    return { scene, material, camera: new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1) };
  }, [eye]);

  useEffect(
    () => () => {
      eye.left.dispose();
      eye.right.dispose();
      composite.material.dispose();
      composite.scene.children[0].geometry.dispose();
    },
    [eye, composite]
  );

  const eyeWorldPos = useRef(new THREE.Vector3());
  const eyeWorldQuat = useRef(new THREE.Quaternion());

  // Bucle de renderizado prioritario (priority 1) exclusivo para el modo visor
  useFrame(({ scene, camera }) => {
    gl.getSize(sizeVec.current);
    const cssW = sizeVec.current.x;
    const cssH = sizeVec.current.y;
    if (cssW <= 0 || cssH <= 0) return;

    const layout = computeLensLayout({ cssWidth: cssW, cssHeight: cssH, pixelRatio: gl.getPixelRatio() });

    // Resolución de cada ojo proporcional a la pantalla (máximo 1536 px para no saturar la GPU)
    const eyeRes = Math.round(THREE.MathUtils.clamp(layout.height * 1.1, 512, 1536));
    if (eye.left.width !== eyeRes) {
      eye.left.setSize(eyeRes, eyeRes);
      eye.right.setSize(eyeRes, eyeRes);
    }

    // Cámara de cada ojo: misma orientación que la cabeza, desplazada ±IPD/2 en su eje X
    camera.updateMatrixWorld();
    camera.getWorldPosition(eyeWorldPos.current);
    camera.getWorldQuaternion(eyeWorldQuat.current);
    const eyeCam = eye.camera;
    eyeCam.near = camera.near || 0.05;
    eyeCam.far = camera.far || 1000;
    eyeCam.updateProjectionMatrix();

    const prevTarget = gl.getRenderTarget();
    const renderEye = (target, offset) => {
      eyeCam.position.copy(eyeWorldPos.current);
      eyeCam.quaternion.copy(eyeWorldQuat.current);
      eyeCam.translateX(offset);
      eyeCam.updateMatrixWorld();
      gl.setRenderTarget(target);
      gl.clear();
      gl.render(scene, eyeCam);
    };
    renderEye(eye.left, -eyeSep / 2);
    renderEye(eye.right, eyeSep / 2);

    // Composición final en pantalla con distorsión de lentes y bordes negros
    const u = composite.material.uniforms;
    u.uResolution.value.set(layout.width, layout.height);
    u.uLensLeft.value.set(layout.left[0], layout.left[1]);
    u.uLensRight.value.set(layout.right[0], layout.right[1]);
    u.uPxPerMm.value = layout.pxPerMm;

    gl.setRenderTarget(null);
    gl.setScissorTest(false);
    gl.setViewport(0, 0, cssW, cssH);
    gl.clear();
    gl.render(composite.scene, composite.camera);
    gl.setRenderTarget(prevTarget);
  }, 1);

  return null;
}
