import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { boxEdgeSegments, findOutlineRoot, setOutlineRoot } from './HoverOutline.jsx';
import { DEVELOPERS } from './wixarika/developersData.js';
import { GazeFuseController } from '../services/gazeFuseService.js';

describe('Contorno de resaltado de objetos del GLB', () => {
  it('encuentra el objeto completo (cuadro) desde cualquier malla hija', () => {
    const station = new THREE.Group();
    const lienzo = new THREE.Mesh();
    const detalle = new THREE.Mesh();
    station.add(lienzo);
    lienzo.add(detalle);
    setOutlineRoot(lienzo, station);
    expect(findOutlineRoot(lienzo)).toBe(station);
    expect(findOutlineRoot(detalle)).toBe(station);
  });

  it('los menús flotantes (sin raíz registrada) no se resaltan', () => {
    expect(findOutlineRoot(new THREE.Mesh())).toBeNull();
    expect(findOutlineRoot(null)).toBeNull();
  });

  it('dibuja las 12 aristas de la caja', () => {
    const box = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 2, 3));
    const pts = boxEdgeSegments(box);
    expect(pts).toHaveLength(24);
    pts.flat().forEach((v) => expect([0, 1, 2, 3]).toContain(v));
  });
});

describe('Gaze Fuse desactivado en la Experiencia 2D', () => {
  it('con delta 0 (modo 2D) mirar un objeto nunca lo selecciona, pero sí detecta el enfoque', () => {
    let triggered = 0;
    let hovered = 0;
    const ctrl = new GazeFuseController({ onTrigger: () => triggered++, onHoverStart: () => hovered++ });
    const target = {};
    for (let i = 0; i < 500; i++) ctrl.update(target, 0);
    expect(triggered).toBe(0);
    expect(hovered).toBe(1);
    expect(ctrl.triggerImmediate(target)).toBe(true); // el clic sí selecciona
    expect(triggered).toBe(1);
  });
});

describe('Acerca de · Desarrolladores', () => {
  it('deja espacio para 4 integrantes con nombre, correo y teléfono', () => {
    expect(DEVELOPERS).toHaveLength(4);
    DEVELOPERS.forEach((d) => {
      expect(d).toHaveProperty('name');
      expect(d).toHaveProperty('email');
      expect(d).toHaveProperty('phone');
    });
  });
});
