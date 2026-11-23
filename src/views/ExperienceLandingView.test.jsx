import { describe, it, expect, vi, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { ExperienceLandingView } from './ExperienceLandingView.jsx';
import { ExperienceSelector, EXPERIENCE_OPTIONS, VR_UNSUPPORTED_MESSAGE } from '../components/ExperienceSelector.jsx';
import { detectVRSupport } from '../utils/vrSupport.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container;
let root;

const render = (element) => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root.render(element));
  return container;
};

const findButton = (text) =>
  [...container.querySelectorAll('button')].find((b) => b.textContent.includes(text));

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
});

describe('Pantalla de inicio: selector de experiencia', () => {
  it('ofrece exactamente dos experiencias: VR y 2D', () => {
    expect(EXPERIENCE_OPTIONS.map((o) => o.id)).toEqual(['vr', '2d']);
  });

  it('muestra ambas tarjetas y el botón "Iniciar sesión" arriba', () => {
    render(<ExperienceLandingView onSelectExperience={() => {}} onLogin={() => {}} />);
    expect(findButton('Experiencia VR')).toBeDefined();
    expect(findButton('Experiencia 2D')).toBeDefined();
    const login = findButton('Iniciar sesión');
    expect(login).toBeDefined();
    expect(login.closest('header')).not.toBeNull();
  });

  it('notifica la experiencia elegida y el clic en iniciar sesión', () => {
    const onSelect = vi.fn();
    const onLogin = vi.fn();
    render(<ExperienceLandingView onSelectExperience={onSelect} onLogin={onLogin} vrSupport="webxr" />);

    act(() => findButton('Experiencia 2D').click());
    act(() => findButton('Experiencia VR').click());
    act(() => findButton('Iniciar sesión').click());

    expect(onSelect.mock.calls).toEqual([['2d'], ['vr']]);
    expect(onLogin).toHaveBeenCalledTimes(1);
  });

  it('con sesión iniciada el botón superior lleva al Panel Admin', () => {
    render(<ExperienceLandingView onSelectExperience={() => {}} onLogin={() => {}} isAuthenticated />);
    expect(findButton('Panel Admin')).toBeDefined();
    expect(findButton('Iniciar sesión')).toBeUndefined();
  });

  it('la variante compacta (menú lateral del admin) también lanza VR o 2D', () => {
    const onSelect = vi.fn();
    render(<ExperienceSelector variant="compact" onSelect={onSelect} vrSupport="mobile" />);
    act(() => findButton('VR').click());
    act(() => findButton('2D').click());
    expect(onSelect.mock.calls).toEqual([['vr'], ['2d']]);
  });

  it('si el dispositivo no soporta VR, la tarjeta VR queda opaca, deshabilitada y con el aviso encima', () => {
    const onSelect = vi.fn();
    render(<ExperienceLandingView onSelectExperience={onSelect} onLogin={() => {}} vrSupport="unsupported" />);
    const vrBtn = findButton('Experiencia VR');
    expect(vrBtn.disabled).toBe(true);
    expect(vrBtn.className).toContain('opacity-40');
    expect(container.textContent).toContain(VR_UNSUPPORTED_MESSAGE);
    act(() => vrBtn.click());
    act(() => findButton('Experiencia 2D').click());
    expect(onSelect.mock.calls).toEqual([['2d']]);
  });

  it('el selector compacto del admin también deshabilita VR si no hay soporte', () => {
    render(<ExperienceSelector variant="compact" onSelect={() => {}} vrSupport="unsupported" />);
    expect(findButton('VR').disabled).toBe(true);
    expect(findButton('2D').disabled).toBe(false);
  });
});

describe('detectVRSupport', () => {
  const fakeWin = ({ xr, mobile }) => ({
    navigator: { xr, userAgent: mobile ? 'Mozilla/5.0 (Linux; Android 14) Mobile' : 'Mozilla/5.0 (X11; Linux x86_64)' },
    DeviceOrientationEvent: function DeviceOrientationEvent() {},
    matchMedia: () => ({ matches: Boolean(mobile) })
  });

  it('prioriza WebXR inmersivo cuando está disponible', async () => {
    const xr = { isSessionSupported: vi.fn().mockResolvedValue(true) };
    expect(await detectVRSupport(fakeWin({ xr }))).toBe('webxr');
  });

  it('usa el modo visor de celular cuando no hay WebXR pero sí sensores móviles', async () => {
    expect(await detectVRSupport(fakeWin({ mobile: true }))).toBe('mobile');
  });

  it('no se queda esperando si isSessionSupported nunca responde', async () => {
    const xr = { isSessionSupported: () => new Promise(() => {}) };
    expect(await detectVRSupport(fakeWin({ xr, mobile: false }), 20)).toBe('unsupported');
  });

  it('marca como no soportado un escritorio sin WebXR', async () => {
    const xr = { isSessionSupported: vi.fn().mockResolvedValue(false) };
    expect(await detectVRSupport(fakeWin({ xr, mobile: false }))).toBe('unsupported');
  });
});

describe('Compatibilidad iPhone (iOS Safari)', () => {
  it('detecta iPhone e iPadOS (que se anuncia como Macintosh táctil)', async () => {
    const { isIOSDevice } = await import('../utils/vrSupport.js');
    expect(isIOSDevice({ navigator: { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X)' } })).toBe(true);
    expect(isIOSDevice({ navigator: { userAgent: 'Mozilla/5.0 (Macintosh)', platform: 'MacIntel', maxTouchPoints: 5 } })).toBe(true);
    expect(isIOSDevice({ navigator: { userAgent: 'Mozilla/5.0 (Linux; Android 14)', platform: 'Linux armv8l' } })).toBe(false);
  });

  it('un iPhone sin WebXR se considera compatible en modo visor (Homido / Cardboard)', async () => {
    const win = {
      navigator: { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) Mobile/15E148' },
      DeviceOrientationEvent: function DeviceOrientationEvent() {},
      matchMedia: () => ({ matches: true })
    };
    expect(await detectVRSupport(win)).toBe('mobile');
  });

  it('pide el permiso de movimiento de iOS 13+ y reporta el rechazo', async () => {
    const { requestMotionPermission } = await import('../utils/vrSupport.js');
    const granted = { DeviceOrientationEvent: { requestPermission: vi.fn().mockResolvedValue('granted') } };
    const denied = { DeviceOrientationEvent: { requestPermission: vi.fn().mockResolvedValue('denied') } };
    const android = { DeviceOrientationEvent: function DeviceOrientationEvent() {} };
    expect(await requestMotionPermission(granted)).toBe('granted');
    expect(await requestMotionPermission(denied)).toBe('denied');
    expect(await requestMotionPermission(android)).toBe('not-required');
  });

  it('muestra el aviso del permiso y el consejo de pantalla de inicio en iPhone', () => {
    render(
      <ExperienceLandingView
        onSelectExperience={() => {}}
        onLogin={() => {}}
        vrSupport="mobile"
        notice="Para la Experiencia VR necesitamos acceso al movimiento del teléfono."
        showIOSTip
      />
    );
    expect(container.querySelector('[role="alert"]').textContent).toContain('acceso al movimiento');
    expect(container.textContent).toContain('Agregar a pantalla de inicio');
  });
});
