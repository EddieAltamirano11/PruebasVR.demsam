import { describe, it, expect } from 'vitest';
import { computeFollowRates, MOUSE_FOLLOW } from './MouseFollowLook.jsx';

describe('Experiencia 2D · la vista sigue al mouse', () => {
  it('con el cursor en la zona central la vista no se mueve (se puede apuntar y hacer clic)', () => {
    expect(computeFollowRates(0, 0)).toEqual({ yaw: 0, pitch: 0 });
    expect(computeFollowRates(MOUSE_FOLLOW.deadZone, -MOUSE_FOLLOW.deadZone)).toEqual({ yaw: 0, pitch: 0 });
  });

  it('gira hacia el lado donde está el cursor', () => {
    expect(computeFollowRates(0.9, 0).yaw).toBeGreaterThan(0); // derecha
    expect(computeFollowRates(-0.9, 0).yaw).toBeLessThan(0); // izquierda
    expect(computeFollowRates(0, 0.9).pitch).toBeGreaterThan(0); // arriba
    expect(computeFollowRates(0, -0.9).pitch).toBeLessThan(0); // abajo
  });

  it('acelera hacia el borde y alcanza la velocidad máxima en el borde', () => {
    const cerca = computeFollowRates(0.6, 0).yaw;
    const lejos = computeFollowRates(0.85, 0).yaw;
    expect(lejos).toBeGreaterThan(cerca);
    expect(computeFollowRates(1, 1)).toEqual({ yaw: MOUSE_FOLLOW.maxYawSpeed, pitch: MOUSE_FOLLOW.maxPitchSpeed });
    expect(computeFollowRates(1.4, 0).yaw).toBe(MOUSE_FOLLOW.maxYawSpeed); // fuera de rango no excede el máximo
  });
});
