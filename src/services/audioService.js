/**
 * Audio Service
 * Web Audio API synthesizer for UI interactions and immersive feedback
 */
/** Pista de "Audio Cultural": música tradicional wixárika (Wirikuta). */
export const AMBIENT_TRACK_URL = './audio/musica_tradicional_wixarika.mp3';

class AudioService {
  constructor() {
    this.ctx = null;
    // Audio Cultural: pista de música tradicional wixárika en bucle (HTMLAudioElement)
    this.ambientEl = null;
    this.ambientPlaying = false;
    this.ambientUnlocked = false;
    this.ambientListeners = new Set();
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /**
   * iOS Safari solo permite reproducir audio después de un toque real del usuario.
   * Se invoca en el primer touchend/click: reanuda el contexto y reproduce un buffer mudo.
   */
  unlock() {
    this.primeAmbientForIOS();
    this.init();
    if (!this.ctx) return false;
    try {
      const buffer = this.ctx.createBuffer(1, 1, 22050);
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.ctx.destination);
      source.start(0);
    } catch {
      // Best-effort
    }
    return this.ctx.state === 'running';
  }

  click() {
    this.playClick();
  }

  hover() {
    this.playHover();
  }

  playClick() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1000, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (err) {
      console.debug('Sound playClick bypassed:', err);
    }
  }

  playHover() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (err) {
      console.debug('Sound playHover bypassed:', err);
    }
  }

  // ---------------------------------------------------------------------------
  // AUDIO CULTURAL (música tradicional wixárika)
  // Un solo estado compartido: el menú se suscribe y los videos lo pausan para que
  // nunca suenen la música y un video al mismo tiempo.
  // ---------------------------------------------------------------------------
  getAmbientElement() {
    const AudioCtor = globalThis.Audio;
    if (this.ambientEl || typeof AudioCtor !== 'function') return this.ambientEl;
    const el = new AudioCtor(AMBIENT_TRACK_URL);
    el.loop = true;
    el.preload = 'auto';
    el.volume = 0.55;
    el.setAttribute?.('playsinline', '');
    el.addEventListener?.('pause', () => {
      if (!this.priming) this.setAmbientState(false);
    });
    el.addEventListener?.('play', () => {
      if (!this.priming) this.setAmbientState(true);
    });
    this.ambientEl = el;
    return el;
  }

  setAmbientState(playing) {
    if (this.ambientPlaying === playing) return;
    this.ambientPlaying = playing;
    this.ambientListeners.forEach((fn) => {
      try {
        fn(playing);
      } catch {
        /* listener best-effort */
      }
    });
  }

  /** Suscribe a cambios de reproducción del Audio Cultural. Devuelve la función para desuscribir. */
  subscribeAmbient(listener) {
    this.ambientListeners.add(listener);
    listener(this.ambientPlaying);
    return () => this.ambientListeners.delete(listener);
  }

  /** Inicia la música y emite 'wixarika:ambient-start' para que cualquier video en reproducción se pause. */
  playAmbient() {
    const el = this.getAmbientElement();
    if (!el) return Promise.resolve(false);
    this.priming = false;
    const EventCtor = globalThis.CustomEvent;
    if (typeof window !== 'undefined' && typeof EventCtor === 'function') {
      window.dispatchEvent(new EventCtor('wixarika:ambient-start'));
    }
    this.setAmbientState(true);
    return Promise.resolve(el.play())
      .then(() => true)
      .catch((err) => {
        console.debug('Audio cultural bloqueado por el navegador:', err?.message);
        this.setAmbientState(false);
        return false;
      });
  }

  pauseAmbient() {
    if (this.ambientEl && !this.ambientEl.paused) this.ambientEl.pause();
    this.setAmbientState(false);
  }

  toggleAmbient() {
    if (this.ambientPlaying) {
      this.pauseAmbient();
      return false;
    }
    this.playAmbient();
    return true;
  }

  /**
   * iOS: un <audio> solo puede reproducirse sin gesto (p. ej. por mirada en VR) si antes se
   * reprodujo dentro de un toque real. En el primer toque se reproduce en silencio y se pausa.
   */
  primeAmbientForIOS() {
    if (this.ambientUnlocked || this.ambientPlaying) return;
    const el = this.getAmbientElement();
    if (!el) return;
    this.ambientUnlocked = true;
    this.priming = true;
    const wasMuted = el.muted;
    el.muted = true;
    Promise.resolve(el.play())
      .then(() => {
        if (this.priming) {
          el.pause();
          el.currentTime = 0;
        }
      })
      .catch(() => {
        this.ambientUnlocked = false;
      })
      .finally(() => {
        el.muted = wasMuted;
        this.priming = false;
      });
  }
}

export const SoundFX = new AudioService();
export default SoundFX;
