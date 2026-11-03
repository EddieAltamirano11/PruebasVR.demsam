/**
 * Audio Service
 * Web Audio API synthesizer for UI interactions and immersive feedback
 */
class AudioService {
  constructor() {
    this.ctx = null;
    this.ambientOsc = null;
    this.ambientGain = null;
    this.ambientPlaying = false;
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

  toggleAmbient() {
    try {
      this.init();
      if (!this.ctx) return false;
      if (this.ambientPlaying) {
        if (this.ambientOsc) {
          try {
            this.ambientGain?.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.4);
            setTimeout(() => {
              try { this.ambientOsc?.stop(); } catch (_) {}
              this.ambientOsc = null;
            }, 500);
          } catch (_) {}
        }
        this.ambientPlaying = false;
        return false;
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(216, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.035, this.ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      this.ambientOsc = osc;
      this.ambientGain = gain;
      this.ambientPlaying = true;
      return true;
    } catch (err) {
      console.debug('Ambient audio bypassed:', err);
      return false;
    }
  }
}

export const SoundFX = new AudioService();
export default SoundFX;
