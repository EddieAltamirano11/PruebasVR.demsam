import { describe, it, expect, vi, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { ExperienceLandingView } from './ExperienceLandingView.jsx';
import { ExperienceSelector, EXPERIENCE_OPTIONS } from '../components/ExperienceSelector.jsx';

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
    render(<ExperienceLandingView onSelectExperience={onSelect} onLogin={onLogin} />);

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
    render(<ExperienceSelector variant="compact" onSelect={onSelect} />);
    act(() => findButton('VR').click());
    act(() => findButton('2D').click());
    expect(onSelect.mock.calls).toEqual([['vr'], ['2d']]);
  });
});
