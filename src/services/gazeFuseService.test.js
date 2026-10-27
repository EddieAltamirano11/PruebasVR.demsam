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

  it('should use exactly 1.2 seconds as default fuse duration', () => {
    expect(GAZE_FUSE_DEFAULT_DURATION).toBe(1.2);
    expect(controller.fuseDuration).toBe(1.2);
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
    expect(result.progress).toBeCloseTo(0.1 / 1.2, 4);
  });

  it('should accumulate gaze time and trigger at exactly 1.2 seconds', () => {
    const dummyTarget = { id: 'modulo-gastronomia' };

    // Primer frame: 0.5s -> progreso ~ 0.5/1.2 = 0.4166
    let res = controller.update(dummyTarget, 0.5);
    expect(res.triggered).toBe(false);
    expect(res.progress).toBeCloseTo(0.4167, 3);
    expect(onTrigger).not.toHaveBeenCalled();

    // Segundo frame: +0.4s -> 0.9s / 1.2 = 0.75
    res = controller.update(dummyTarget, 0.4);
    expect(res.triggered).toBe(false);
    expect(res.progress).toBeCloseTo(0.75, 4);
    expect(onTrigger).not.toHaveBeenCalled();

    // Tercer frame: +0.3s -> 1.2s completados -> DISPARO
    res = controller.update(dummyTarget, 0.3);
    expect(res.triggered).toBe(true);
    expect(res.progress).toBe(1.0);
    expect(onTrigger).toHaveBeenCalledTimes(1);
    expect(onTrigger).toHaveBeenCalledWith(dummyTarget);
  });

  it('should not flood triggers on subsequent frames while continuing to gaze', () => {
    const dummyTarget = { id: 'modulo-fiestas' };

    // Completar los 1.2s
    controller.update(dummyTarget, 1.2);
    expect(onTrigger).toHaveBeenCalledTimes(1);

    // Siguientes frames continuando mirando el mismo objeto
    const resAfter = controller.update(dummyTarget, 0.016);
    expect(resAfter.triggered).toBe(false);
    expect(resAfter.progress).toBe(1.0);
    expect(onTrigger).toHaveBeenCalledTimes(1); // No vuelve a disparar hasta reset
  });

  it('should reset timer and trigger onHoverEnd if gaze leaves target before 1.2s', () => {
    const dummyTarget = { id: 'modulo-biblioteca' };

    // Mirar durante 0.8s (incompleto)
    controller.update(dummyTarget, 0.8);
    expect(controller.getProgress()).toBeCloseTo(0.8 / 1.2, 4);

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

    // Mirar targetA por 0.6s
    controller.update(targetA, 0.6);
    expect(onHoverStart).toHaveBeenCalledWith(targetA);

    // Mover inmediatamente a targetB por 0.2s
    const resB = controller.update(targetB, 0.2);
    expect(onHoverEnd).toHaveBeenCalledWith(targetA);
    expect(onHoverStart).toHaveBeenCalledWith(targetB);
    expect(resB.progress).toBeCloseTo(0.2 / 1.2, 4);
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
