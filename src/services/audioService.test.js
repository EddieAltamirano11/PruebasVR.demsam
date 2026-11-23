import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SoundFX, AMBIENT_TRACK_URL } from './audioService.js';

describe('AudioService', () => {
  it('should initialize and play sounds gracefully without crashing', () => {
    // SoundFX methods should safely handle environments where AudioContext is mocked or absent
    expect(() => SoundFX.init()).not.toThrow();
    expect(() => SoundFX.playClick()).not.toThrow();
    expect(() => SoundFX.playHover()).not.toThrow();
  });
});

describe('Audio Cultural (música tradicional wixárika)', () => {
  let OriginalAudio;
  let created;

  beforeEach(() => {
    OriginalAudio = globalThis.Audio;
    created = [];
    globalThis.Audio = class FakeAudio {
      constructor(src) {
        this.src = src;
        this.paused = true;
        this.muted = false;
        this.listeners = {};
        created.push(this);
      }
      setAttribute() {}
      addEventListener(type, fn) {
        (this.listeners[type] ||= []).push(fn);
      }
      emit(type) {
        (this.listeners[type] || []).forEach((fn) => fn());
      }
      play() {
        this.paused = false;
        this.emit('play');
        return Promise.resolve();
      }
      pause() {
        this.paused = true;
        this.emit('pause');
      }
    };
    SoundFX.ambientEl = null;
    SoundFX.ambientPlaying = false;
    SoundFX.ambientUnlocked = false;
    SoundFX.priming = false;
  });

  afterEach(() => {
    SoundFX.pauseAmbient();
    globalThis.Audio = OriginalAudio;
  });

  it('reproduce la pista MP3 en bucle (no el tono sintetizado)', async () => {
    await SoundFX.playAmbient();
    expect(created).toHaveLength(1);
    expect(created[0].src).toBe(AMBIENT_TRACK_URL);
    expect(created[0].loop).toBe(true);
    expect(SoundFX.ambientPlaying).toBe(true);
  });

  it('notifica a los suscriptores (botón del menú) cuando un video pausa la música', async () => {
    const states = [];
    const unsubscribe = SoundFX.subscribeAmbient((playing) => states.push(playing));
    await SoundFX.playAmbient();
    SoundFX.pauseAmbient(); // lo que hace el reproductor de video al empezar
    unsubscribe();
    expect(states).toEqual([false, true, false]);
  });

  it('al activar la música avisa a los videos para que se pausen', async () => {
    const onStart = vi.fn();
    window.addEventListener('wixarika:ambient-start', onStart);
    await SoundFX.playAmbient();
    window.removeEventListener('wixarika:ambient-start', onStart);
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('el desbloqueo para iOS no deja la música sonando ni cambia el estado', async () => {
    const states = [];
    const unsubscribe = SoundFX.subscribeAmbient((playing) => states.push(playing));
    SoundFX.primeAmbientForIOS();
    await new Promise((r) => setTimeout(r, 0));
    unsubscribe();
    expect(created[0].paused).toBe(true);
    expect(created[0].muted).toBe(false);
    expect(states).toEqual([false]);
  });
});
