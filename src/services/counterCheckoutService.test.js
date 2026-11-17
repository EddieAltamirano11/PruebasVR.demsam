import { describe, it, expect, beforeEach } from 'vitest';
import {
  getRequestedBooks,
  addRequestedBook,
  removeRequestedBook,
  isBookRequested,
  clearRequestedBooks,
  getFolio,
  subscribeRequestedBooks
} from './counterCheckoutService.js';

describe('counterCheckoutService (Sprint 5 - Luis Carlos Durán)', () => {
  beforeEach(() => {
    clearRequestedBooks();
  });

  it('debe generar o recuperar un folio institucional para el mostrador', () => {
    const folio = getFolio();
    expect(folio).toBeDefined();
    expect(folio).toMatch(/^SOLON-VR-\d+$/);
  });

  it('permite apartar un libro para pedir en mostrador', () => {
    const book = {
      id: 'lib-test-01',
      titulo: "El Fuego Sagrado y los Cantos del Mara'akame",
      autor: 'Ramón Medina Silva',
      cultura: 'Wixárika',
      codigo: '299.72 ECH-2022',
      seccion: 'Sala de Culturas Vivas & VR (SEC-VR-01)'
    };

    const requested = addRequestedBook(book);
    expect(requested).toHaveLength(1);
    expect(requested[0].titulo).toBe("El Fuego Sagrado y los Cantos del Mara'akame");
    expect(requested[0].codigo).toBe('299.72 ECH-2022');
    expect(isBookRequested('lib-test-01')).toBe(true);
  });

  it('evita duplicados al apartar el mismo libro múltiples veces', () => {
    const book = {
      id: 'lib-test-02',
      titulo: 'Sabores del Nayar',
      autor: 'Dra. Luisa Gómez Tagle'
    };

    addRequestedBook(book);
    const result = addRequestedBook(book);
    expect(result).toHaveLength(1);
  });

  it('permite quitar un libro de la lista de apartados para mostrador', () => {
    const b1 = { id: 'b1', titulo: 'Libro 1' };
    const b2 = { id: 'b2', titulo: 'Libro 2' };

    addRequestedBook(b1);
    addRequestedBook(b2);
    expect(getRequestedBooks()).toHaveLength(2);

    const remaining = removeRequestedBook('b1');
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe('b2');
    expect(isBookRequested('b1')).toBe(false);
    expect(isBookRequested('b2')).toBe(true);
  });

  it('permite limpiar todos los libros apartados al finalizar la visita', () => {
    addRequestedBook({ id: 'b1', titulo: 'Libro 1' });
    addRequestedBook({ id: 'b2', titulo: 'Libro 2' });
    expect(getRequestedBooks()).toHaveLength(2);

    clearRequestedBooks();
    expect(getRequestedBooks()).toHaveLength(0);
  });

  it('notifica a los suscriptores cuando cambia la lista de apartados', () => {
    let notifiedBooks = null;
    const unsub = subscribeRequestedBooks((list) => {
      notifiedBooks = list;
    });

    addRequestedBook({ id: 'b-sub', titulo: 'Libro Suscrito' });
    expect(notifiedBooks).toHaveLength(1);
    expect(notifiedBooks[0].id).toBe('b-sub');

    unsub();
  });
});
