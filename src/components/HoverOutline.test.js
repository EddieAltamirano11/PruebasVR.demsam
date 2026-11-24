import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { frontRectangle, findOutlineRoot, setOutlineRoot } from './HoverOutline.jsx';

const boxPts = (arr) => arr.map((a) => new THREE.Vector3(...a));
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

  it('dibuja un rectángulo plano (no una caja) frente al visitante', () => {
    // Cuadro en el muro norte (-Z): 1.2 m de ancho, 0.8 m de alto, 5 cm de grosor
    const box = new THREE.Box3(new THREE.Vector3(-0.6, 1.6, -7.05), new THREE.Vector3(0.6, 2.4, -7.0));
    const pts = boxPts(frontRectangle(box, new THREE.Vector3(0, 1.6, 0)));
    expect(pts).toHaveLength(5); // 4 esquinas + cierre
    expect(pts[0].equals(pts[4])).toBe(true);
    // Todas las esquinas en el mismo plano, delante de la cara frontal del cuadro
    pts.forEach((p) => expect(p.z).toBeCloseTo(-6.985, 6));
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(1.2 + 0.06, 6);
    expect(Math.max(...ys) - Math.min(...ys)).toBeCloseTo(0.8 + 0.06, 6);
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
    expect(DEVELOPERS.map((d) => d.name)).toEqual([
      'Eddie David Altamirano Plantillas',
      'Luis Carlos Durán Ocampo',
      'Samir Adrián Cárdenas Gámez',
      'Alejandro Bautista Meza'
    ]);
    DEVELOPERS.forEach((d) => {
      expect(d).toHaveProperty('name');
      expect(d).toHaveProperty('email');
      expect(d).toHaveProperty('phone');
    });
  });
});
