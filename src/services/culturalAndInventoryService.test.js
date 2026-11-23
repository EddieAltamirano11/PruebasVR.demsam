import { describe, it, expect, beforeEach } from 'vitest';
import {
  getInventoryBooks,
  addBookToInventory,
  updateBookInInventory,
  removeBookFromInventory,
  adjustStock,
  toggleRecommendation,
  DEFAULT_INVENTORY_BOOKS
} from './inventoryService.js';

describe('Control de Inventario de Libros de Culturas Vivas', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
  });

  describe('inventoryService (Inventario Exclusivo de Culturas Vivas)', () => {
    it('debe manejar únicamente libros pertenecientes a las culturas vivas recomendadas o registradas', async () => {
      await addBookToInventory({
        titulo: 'El Fuego Sagrado de Wirikuta',
        autor: 'Ramón Medina',
        cultura: 'Wixárika'
      });
      const books = await getInventoryBooks();
      expect(books.length).toBeGreaterThan(0);

      const validCultures = ['Wixárika', 'Náayeri', "O'dam", 'Meshikan / Mexicanero'];
      books.forEach((b) => {
        expect(validCultures).toContain(b.cultura);
      });
    });

    it('permite agregar un nuevo libro de cultura viva al inventario', async () => {
      const book = await addBookToInventory({
        titulo: 'Crónicas Sagradas de Wirikuta',
        autor: 'Investigador Solón',
        cultura: 'Wixárika',
        stock: 5,
        disponible: true,
        recomendado: true,
        anio: 2024
      });

      expect(book.id).toBeDefined();
      expect(book.stock).toBe(5);
      expect(book.cultura).toBe('Wixárika');

      const all = await getInventoryBooks();
      expect(all.some((b) => b.titulo === 'Crónicas Sagradas de Wirikuta')).toBe(true);
    });

    it('permite actualizar los datos de un libro en el inventario', async () => {
      const book = await addBookToInventory({
        titulo: 'Libro Edición Original',
        autor: 'Autor Base',
        cultura: 'Wixárika',
        stock: 4
      });

      const updated = await updateBookInInventory(book.id, {
        titulo: 'Libro Edición Corregida',
        stock: 8
      });

      expect(updated.titulo).toBe('Libro Edición Corregida');
      expect(updated.stock).toBe(8);
    });

    it('permite quitar un libro del inventario', async () => {
      const book = await addBookToInventory({
        titulo: 'Libro a Eliminar',
        autor: 'Autor Temporal',
        cultura: 'Náayeri',
        stock: 2
      });

      const removed = await removeBookFromInventory(book.id);
      expect(removed).toBe(true);

      const all = await getInventoryBooks();
      expect(all.some((b) => b.id === book.id)).toBe(false);
    });

    it('permite ajustar rápidamente el stock y conmuta la disponibilidad', async () => {
      const book = await addBookToInventory({
        titulo: 'Libro de Stock Dinámico',
        autor: 'Autor Stock',
        cultura: "O'dam",
        stock: 1,
        disponible: true
      });

      // Restar 1 -> stock 0 -> no disponible
      const depleted = await adjustStock(book.id, -1);
      expect(depleted.stock).toBe(0);
      expect(depleted.disponible).toBe(false);

      // Sumar 3 -> stock 3 -> disponible
      const replenished = await adjustStock(book.id, 3);
      expect(replenished.stock).toBe(3);
      expect(replenished.disponible).toBe(true);
    });

    it('permite conmutar el estado de recomendación en la sala VR', async () => {
      const book = await addBookToInventory({
        titulo: 'Libro Recomendación Test',
        autor: 'Autor Test',
        cultura: 'Wixárika',
        recomendado: false
      });

      const toggledOn = await toggleRecommendation(book.id);
      expect(toggledOn.recomendado).toBe(true);

      const toggledOff = await toggleRecommendation(book.id);
      expect(toggledOff.recomendado).toBe(false);
    });
  });
});
