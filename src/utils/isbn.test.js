import { describe, it, expect, vi } from 'vitest';
import { normalizeIsbn, validateIsbn, lookupIsbn, friendlyErrorMessage } from './isbn.js';

describe('ISBN tolerante (Ley de Postel)', () => {
  it('normaliza guiones, espacios, prefijo ISBN y x minúscula', () => {
    expect(normalizeIsbn('978-607-8423-62-0')).toBe('9786078423620');
    expect(normalizeIsbn(' ISBN: 978 607 8423 62 0 ')).toBe('9786078423620');
    expect(normalizeIsbn('0-306-40615-x')).toBe('030640615X');
  });

  it('acepta ISBN-10 e ISBN-13 válidos en distintos formatos', () => {
    expect(validateIsbn('968-29-8518-8').valid).toBe(true);
    expect(validateIsbn('9786078423620').valid).toBe(true);
    expect(validateIsbn('0 306 40615 2').valid).toBe(true);
  });

  it('el campo vacío es válido (opcional)', () => {
    expect(validateIsbn('').valid).toBe(true);
  });

  it('da mensajes claros para longitud o dígito verificador incorrecto', () => {
    expect(validateIsbn('12345').message).toMatch(/10 o 13 dígitos/);
    expect(validateIsbn('978-607-8423-62-1').message).toMatch(/dígito verificador/);
    expect(validateIsbn('ABC').message).toMatch(/solo puede contener números/);
  });
});

describe('Autocompletado por ISBN (Ley de Tesler)', () => {
  it('mapea la respuesta de Open Library a campos del formulario', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        'ISBN:9786078423620': {
          title: 'La cultura wixárika',
          authors: [{ name: 'Sarah Corona Berkin' }],
          publishers: [{ name: 'CONACULTA' }],
          publish_date: 'March 2015'
        }
      })
    });
    const data = await lookupIsbn('978-607-8423-62-0', fetchMock);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('ISBN:9786078423620'));
    expect(data).toMatchObject({
      titulo: 'La cultura wixárika',
      autor: 'Sarah Corona Berkin',
      editorial: 'CONACULTA',
      anio: 2015
    });
  });

  it('no consulta la red con un ISBN inválido y tolera fallos de red', async () => {
    const fetchMock = vi.fn();
    expect(await lookupIsbn('123', fetchMock)).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
    const failing = vi.fn().mockRejectedValue(new Error('Failed to fetch'));
    expect(await lookupIsbn('9786078423620', failing)).toBeNull();
  });

  it('traduce errores técnicos a mensajes en español', () => {
    expect(friendlyErrorMessage({ code: '23505', message: 'duplicate key' })).toMatch(/Ya existe/);
    expect(friendlyErrorMessage(new Error('Failed to fetch'))).toMatch(/conexión/);
  });
});
