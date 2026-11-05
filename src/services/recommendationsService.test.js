import { describe, it, expect } from 'vitest';
import {
  filterBooksByStation,
  searchRecommendedBooks,
  isValidBookRecommendation,
  getAvailabilityLabel,
  formatBookMinimal
} from './recommendationsService.js';

describe('RecommendationsService (Sprint 3 - Luis Carlos Durán Ocampo)', () => {
  const sampleBooks = [
    {
      id: '1',
      stationId: 'deidades',
      titulo: "El Fuego Sagrado y los Cantos del Mara'akame",
      autor: 'Ramón Medina Silva',
      cultura: 'Wixárika',
      stock: 3
    },
    {
      id: '2',
      stationId: 'gastronomia',
      titulo: 'Sabores del Nayar',
      autor: 'Dra. Luisa Gómez Tagle',
      cultura: 'Cora',
      stock: 1
    },
    {
      id: '3',
      stationId: 'fiestas',
      titulo: 'Fiestas Sagradas de la Sierra Wixárika',
      autor: 'Miguel León-Portilla',
      cultura: 'Wixárika',
      stock: 0
    }
  ];

  it('should filter books by cultural station accurately', () => {
    const deidadesBooks = filterBooksByStation(sampleBooks, 'deidades');
    expect(deidadesBooks).toHaveLength(1);
    expect(deidadesBooks[0].titulo).toContain('Fuego Sagrado');

    const allBooks = filterBooksByStation(sampleBooks, 'all');
    expect(allBooks).toHaveLength(3);

    const emptyFilter = filterBooksByStation(sampleBooks, null);
    expect(emptyFilter).toHaveLength(3);
  });

  it('should search books by title, author, or culture query', () => {
    const byAuthor = searchRecommendedBooks(sampleBooks, 'Medina');
    expect(byAuthor).toHaveLength(1);
    expect(byAuthor[0].autor).toBe('Ramón Medina Silva');

    const byCulture = searchRecommendedBooks(sampleBooks, 'Wixárika');
    expect(byCulture).toHaveLength(2);

    const noMatches = searchRecommendedBooks(sampleBooks, 'Desconocido 123');
    expect(noMatches).toHaveLength(0);
  });

  it('should validate book recommendation schema correctly', () => {
    expect(isValidBookRecommendation({ id: 'b1', titulo: 'Libro válido' })).toBe(true);
    expect(isValidBookRecommendation(null)).toBe(false);
    expect(isValidBookRecommendation({})).toBe(false);
    expect(isValidBookRecommendation({ id: 'b2' })).toBe(false);
  });

  it('should format availability labels based on stock count', () => {
    expect(getAvailabilityLabel({ stock: 0 })).toBe('Agotado en sala');
    expect(getAvailabilityLabel({ stock: 1 })).toBe('1 ejemplar disponible');
    expect(getAvailabilityLabel({ stock: 4 })).toBe('4 ejemplares disponibles');
    expect(getAvailabilityLabel(null)).toBe('No disponible');
  });

  it('should format book to minimal structure containing strictly title, author, and book code', () => {
    const formatted = formatBookMinimal({
      id: 'b1',
      title: "El Fuego Sagrado y los Cantos del Mara'akame",
      author: 'Ramón Medina Silva',
      callNumber: '299.72 ECH-2022',
      synopsis: 'Largo texto antropológico no requerido en la vista VR minimalista',
      year: 2022
    });
    expect(formatted.title).toBe("El Fuego Sagrado y los Cantos del Mara'akame");
    expect(formatted.author).toBe('Ramón Medina Silva');
    expect(formatted.code).toBe('299.72 ECH-2022');
  });
});
