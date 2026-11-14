import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GazeFuseController, GAZE_FUSE_DEFAULT_DURATION } from './gazeFuseService.js';

describe('GazeFuseController - ISO 9241-210 Usability & Interaction Verification', () => {
  let onTrigger;
  let onHoverStart;
  let onHoverEnd;
  let onProgress;
  let controller;

  beforeEach(() => {
    onTrigger = vi.fn();
    onHoverStart = vi.fn();
    onHoverEnd = vi.fn();
    onProgress = vi.fn();

    controller = new GazeFuseController({
      fuseDuration: GAZE_FUSE_DEFAULT_DURATION,
      onTrigger,
      onHoverStart,
      onHoverEnd,
      onProgress
    });
  });

  it('should use exactly 3.0 seconds as default fuse duration', () => {
    expect(GAZE_FUSE_DEFAULT_DURATION).toBe(3.0);
    expect(controller.fuseDuration).toBe(3.0);
  });

  it('should remain idle with 0 progress when no target is in gaze', () => {
    const result = controller.update(null, 0.016);
    expect(result.progress).toBe(0);
    expect(result.isHovered).toBe(false);
    expect(result.triggered).toBe(false);
    expect(onHoverStart).not.toHaveBeenCalled();
    expect(onTrigger).not.toHaveBeenCalled();
  });

  it('should trigger onHoverStart when a target enters gaze', () => {
    const dummyTarget = { id: 'modulo-deidades' };
    const result = controller.update(dummyTarget, 0.1);

    expect(onHoverStart).toHaveBeenCalledTimes(1);
    expect(onHoverStart).toHaveBeenCalledWith(dummyTarget);
    expect(result.isHovered).toBe(true);
    expect(result.triggered).toBe(false);
    expect(result.progress).toBeCloseTo(0.1 / 3.0, 4);
  });

  it('should accumulate gaze time and trigger at exactly 3.0 seconds', () => {
    const dummyTarget = { id: 'modulo-gastronomia' };

    // Primer frame: 1.0s -> progreso ~ 1.0/3.0 = 0.3333
    let res = controller.update(dummyTarget, 1.0);
    expect(res.triggered).toBe(false);
    expect(res.progress).toBeCloseTo(1.0 / 3.0, 3);
    expect(onTrigger).not.toHaveBeenCalled();

    // Segundo frame: +1.0s -> 2.0s / 3.0 = 0.6666
    res = controller.update(dummyTarget, 1.0);
    expect(res.triggered).toBe(false);
    expect(res.progress).toBeCloseTo(2.0 / 3.0, 3);
    expect(onTrigger).not.toHaveBeenCalled();

    // Tercer frame: +1.0s -> 3.0s completados -> DISPARO
    res = controller.update(dummyTarget, 1.0);
    expect(res.triggered).toBe(true);
    expect(res.progress).toBe(1.0);
    expect(onTrigger).toHaveBeenCalledTimes(1);
    expect(onTrigger).toHaveBeenCalledWith(dummyTarget);
  });

  it('should not flood triggers on subsequent frames while continuing to gaze', () => {
    const dummyTarget = { id: 'modulo-fiestas' };

    // Completar los 3.0s
    controller.update(dummyTarget, 3.0);
    expect(onTrigger).toHaveBeenCalledTimes(1);

    // Siguientes frames continuando mirando el mismo objeto
    const resAfter = controller.update(dummyTarget, 0.016);
    expect(resAfter.triggered).toBe(false);
    expect(resAfter.progress).toBe(1.0);
    expect(onTrigger).toHaveBeenCalledTimes(1); // No vuelve a disparar hasta reset
  });

  it('should reset timer and trigger onHoverEnd if gaze leaves target before 3.0s', () => {
    const dummyTarget = { id: 'modulo-biblioteca' };

    // Mirar durante 1.5s (incompleto)
    controller.update(dummyTarget, 1.5);
    expect(controller.getProgress()).toBeCloseTo(1.5 / 3.0, 4);

    // Salir del objeto (target = null)
    const resExit = controller.update(null, 0.016);
    expect(resExit.progress).toBe(0);
    expect(resExit.isHovered).toBe(false);
    expect(onHoverEnd).toHaveBeenCalledTimes(1);
    expect(onHoverEnd).toHaveBeenCalledWith(dummyTarget);
    expect(onTrigger).not.toHaveBeenCalled();
    expect(controller.getProgress()).toBe(0);
  });

  it('should switch targets cleanly and restart fuse timer when moving to a new object', () => {
    const targetA = { id: 'targetA' };
    const targetB = { id: 'targetB' };

    // Mirar targetA por 1.0s
    controller.update(targetA, 1.0);
    expect(onHoverStart).toHaveBeenCalledWith(targetA);

    // Mover inmediatamente a targetB por 0.5s
    const resB = controller.update(targetB, 0.5);
    expect(onHoverEnd).toHaveBeenCalledWith(targetA);
    expect(onHoverStart).toHaveBeenCalledWith(targetB);
    expect(resB.progress).toBeCloseTo(0.5 / 3.0, 4);
  });

  it('should support immediate triggering with dual interaction (Homido Grab button press)', () => {
    const dummyTarget = { id: 'boton-homido-capacitivo' };

    // Apuntar al target (frame inicial)
    controller.update(dummyTarget, 0.1);
    expect(onTrigger).not.toHaveBeenCalled();

    // El usuario presiona el boton fisico del visor inmediatamente
    const triggered = controller.triggerImmediate();
    expect(triggered).toBe(true);
    expect(onTrigger).toHaveBeenCalledTimes(1);
    expect(onTrigger).toHaveBeenCalledWith(dummyTarget);
    expect(controller.getProgress()).toBe(1.0);
  });

  it('should return false on triggerImmediate if no object is currently in gaze', () => {
    const triggered = controller.triggerImmediate();
    expect(triggered).toBe(false);
    expect(onTrigger).not.toHaveBeenCalled();
  });
});
