import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { rotateLookDirection, POINTER_LOOK } from './PointerLockLook.jsx';

const forward = () => new THREE.Vector3(0, 0, -1); // mirando al norte (-Z)

describe('Experiencia 2D · vista tipo juego con el mouse capturado', () => {
  it('sin movimiento la mirada no cambia', () => {
    const d = rotateLookDirection(forward(), 0, 0);
    expect(d.x).toBeCloseTo(0, 6);
    expect(d.y).toBeCloseTo(0, 6);
    expect(d.z).toBeCloseTo(-1, 6);
  });

  it('mover el mouse a la derecha gira a la derecha; hacia arriba mira hacia arriba', () => {
    expect(rotateLookDirection(forward(), 50, 0).x).toBeGreaterThan(0); // derecha = +X mirando a -Z
    expect(rotateLookDirection(forward(), -50, 0).x).toBeLessThan(0);
    expect(rotateLookDirection(forward(), 0, -50).y).toBeGreaterThan(0); // movementY < 0 = mouse arriba
    expect(rotateLookDirection(forward(), 0, 50).y).toBeLessThan(0);
  });

  it('la inclinación se limita para no voltear la vista', () => {
    const up = rotateLookDirection(forward(), 0, -100000);
    expect(Math.asin(up.y)).toBeCloseTo(POINTER_LOOK.maxPitch, 6);
    expect(up.length()).toBeCloseTo(1, 6);
  });
});
