/**
 * Gaze Fuse Interaction Service
 * Calibrado a exactamente 1.2 segundos (1200ms) segun especificacion ISO 9241-210
 * para interaccion manos libres sin fatiga cervical y soporte de gatillo dual (Homido Grab)
 */

export const GAZE_FUSE_DEFAULT_DURATION = 1.2;

export class GazeFuseController {
  constructor({
    fuseDuration = GAZE_FUSE_DEFAULT_DURATION,
    onTrigger,
    onHoverStart,
    onHoverEnd,
    onProgress
  } = {}) {
    this.fuseDuration = fuseDuration;
    this.onTrigger = onTrigger;
    this.onHoverStart = onHoverStart;
    this.onHoverEnd = onHoverEnd;
    this.onProgress = onProgress;

    this.timer = 0;
    this.currentTarget = null;
    this.isTriggered = false;
  }

  /**
   * Actualiza el temporizador de fijacion visual con el paso de tiempo (delta en segundos)
   * @param {any} target - Objeto interactivo detectado bajo la reticula (o null)
   * @param {number} delta - Tiempo transcurrido en segundos desde el ultimo cuadro
   * @returns {{ progress: number, isHovered: boolean, triggered: boolean, target: any }}
   */
  update(target, delta = 0) {
    // Caso 1: No hay objeto enfocado
    if (!target) {
      if (this.currentTarget !== null) {
        const prevTarget = this.currentTarget;
        this.reset();
        this.onHoverEnd?.(prevTarget);
        this.onProgress?.(0, null);
      }
      return { progress: 0, isHovered: false, triggered: false, target: null };
    }

    // Caso 2: El objeto enfocado cambio
    if (this.currentTarget !== target) {
      if (this.currentTarget !== null) {
        this.onHoverEnd?.(this.currentTarget);
      }
      this.currentTarget = target;
      this.timer = 0;
      this.isTriggered = false;
      this.onHoverStart?.(target);
      this.onProgress?.(0, target);
    }

    // Caso 3: Ya se disparo en esta fijacion continua (evitar rafagas repetidas)
    if (this.isTriggered) {
      return { progress: 1.0, isHovered: true, triggered: false, target: this.currentTarget };
    }

    // Caso 4: Acumular tiempo de fijacion visual
    this.timer += delta;
    const progress = Math.min(1.0, this.timer / this.fuseDuration);
    this.onProgress?.(progress, this.currentTarget);

    // Verificacion de umbral de 1.2s
    if (this.timer >= this.fuseDuration) {
      this.isTriggered = true;
      this.onTrigger?.(this.currentTarget);
      return { progress: 1.0, isHovered: true, triggered: true, target: this.currentTarget };
    }

    return { progress, isHovered: true, triggered: false, target: this.currentTarget };
  }

  /**
   * Gatillo dual inmediato: permite activar la accion instantaneamente
   * si el usuario presiona el boton fisico capacitivo del visor Homido Grab
   * sin esperar a que transcurran los 1.2 segundos.
   * @returns {boolean} true si se disparo exitosamente una accion
   */
  triggerImmediate() {
    if (this.currentTarget !== null && !this.isTriggered) {
      this.isTriggered = true;
      this.timer = this.fuseDuration;
      this.onProgress?.(1.0, this.currentTarget);
      this.onTrigger?.(this.currentTarget);
      return true;
    }
    return false;
  }

  /**
   * Reinicia el temporizador y el estado del fuse
   */
  reset() {
    this.timer = 0;
    this.currentTarget = null;
    this.isTriggered = false;
  }

  /**
   * Obtiene el progreso normalizado actual (0.0 a 1.0)
   */
  getProgress() {
    return Math.min(1.0, this.timer / this.fuseDuration);
  }
}

export default GazeFuseController;
