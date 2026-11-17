import { describe, it, expect, beforeEach } from 'vitest';
import {
  getCultures,
  addCulture,
  updateCulture,
  deleteCulture,
  DEFAULT_CULTURAS
} from './culturalService.js';
import {
  getInventoryBooks,
  addBookToInventory,
  updateBookInInventory,
  removeBookFromInventory,
  adjustStock,
  toggleRecommendation,
  DEFAULT_INVENTORY_BOOKS
} from './inventoryService.js';

describe('Gestión de Culturas Vivas y Control de Inventario', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
  });

  describe('culturalService (Culturas Vivas de Nayarit)', () => {
    it('debe inicializar con las 4 culturas vivas representativas de Nayarit', async () => {
      const cultures = await getCultures();
      expect(cultures.length).toBeGreaterThanOrEqual(4);

      const names = cultures.map((c) => c.nombre);
      expect(names).toContain('Wixárika');
      expect(names).toContain('Náayeri');
      expect(names).toContain("O'dam");
      expect(names).toContain('Meshikan / Mexicanero');
    });

    it('permite al administrador agregar una nueva cultura viva', async () => {
      const nueva = await addCulture({
        nombre: 'Cultura de Prueba',
        variante: 'Prueba Sierra',
        region: 'Norte de Nayarit',
        lengua: 'Variante Serrana',
        descripcion: 'Cosmovisión de prueba para validación de servicios',
        tradiciones: 'Danza ritual de prueba',
        activaVR: true
      });

      expect(nueva.id).toBeDefined();
      expect(nueva.nombre).toBe('Cultura de Prueba');

      const all = await getCultures();
      const found = all.find((c) => c.id === nueva.id);
      expect(found).toBeDefined();
      expect(found.region).toBe('Norte de Nayarit');
    });

    it('permite al administrador actualizar la información de una cultura existente', async () => {
      const cultures = await getCultures();
      const target = cultures[0];

      const updated = await updateCulture(target.id, {
        region: 'Región Actualizada de Nayarit',
        descripcion: 'Descripción antropológica revisada'
      });

      expect(updated.region).toBe('Región Actualizada de Nayarit');
      expect(updated.descripcion).toBe('Descripción antropológica revisada');
    });

    it('permite al administrador quitar / eliminar una cultura', async () => {
      const nueva = await addCulture({
        nombre: 'Cultura Temporal',
        region: 'Sur de Nayarit'
      });

      const deleted = await deleteCulture(nueva.id);
      expect(deleted).toBe(true);

      const all = await getCultures();
      expect(all.find((c) => c.id === nueva.id)).toBeUndefined();
    });
  });

  describe('inventoryService (Inventario Exclusivo de Culturas Vivas)', () => {
    it('debe manejar únicamente libros pertenecientes a las culturas vivas recomendadas o registradas', async () => {
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
