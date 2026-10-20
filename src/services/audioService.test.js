import { describe, it, expect } from 'vitest';
import { SoundFX } from './audioService.js';

describe('AudioService', () => {
  it('should initialize and play sounds gracefully without crashing', () => {
    // SoundFX methods should safely handle environments where AudioContext is mocked or absent
    expect(() => SoundFX.init()).not.toThrow();
    expect(() => SoundFX.playClick()).not.toThrow();
    expect(() => SoundFX.playHover()).not.toThrow();
  });
});
