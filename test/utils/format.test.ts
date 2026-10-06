import { describe, expect, test } from 'bun:test';
import {
  formatTemperature,
  formatHumidity,
  formatWindSpeed,
  formatPressure,
  formatPrecipitation,
  getWeatherDescription,
  formatDate,
  formatTime,
  formatShortDate,
} from '../../src/utils/format';

describe('formatTemperature', () => {
  test('formatea temperatura con un decimal y símbolo de grados', () => {
    expect(formatTemperature(25)).toBe('25 °C');
    expect(formatTemperature(25.4)).toBe('25.4 °C');
    expect(formatTemperature(-3)).toBe('-3 °C');
  });

  test('redondea a un decimal', () => {
    expect(formatTemperature(25.45)).toBe('25.5 °C');
    expect(formatTemperature(25.44)).toBe('25.4 °C');
  });
});

describe('formatHumidity', () => {
  test('agrega símbolo de porcentaje', () => {
    expect(formatHumidity(65)).toBe('65 %');
    expect(formatHumidity(0)).toBe('0 %');
  });
});

describe('formatWindSpeed', () => {
  test('formatea velocidad de viento con un decimal', () => {
    expect(formatWindSpeed(12)).toBe('12 km/h');
    expect(formatWindSpeed(12.34)).toBe('12.3 km/h');
  });
});

describe('formatPressure', () => {
  test('redondea a entero y agrega hPa', () => {
    expect(formatPressure(1013.6)).toBe('1014 hPa');
    expect(formatPressure(1010)).toBe('1010 hPa');
  });
});

describe('formatPrecipitation', () => {
  test('formatea precipitación con un decimal y mm', () => {
    expect(formatPrecipitation(0)).toBe('0 mm');
    expect(formatPrecipitation(12.5)).toBe('12.5 mm');
    expect(formatPrecipitation(12.56)).toBe('12.6 mm');
  });
});

describe('getWeatherDescription', () => {
  test('traduce códigos WMO conocidos al español', () => {
    expect(getWeatherDescription(0)).toBe('Cielo despejado');
    expect(getWeatherDescription(3)).toBe('Nublado');
    expect(getWeatherDescription(61)).toBe('Lluvia ligera');
    expect(getWeatherDescription(95)).toBe('Tormenta');
  });

  test('devuelve mensaje genérico para códigos desconocidos', () => {
    expect(getWeatherDescription(999)).toBe('Condición desconocida');
  });
});

describe('formatDate', () => {
  test('formatea fecha completa en español', () => {
    const result = formatDate('2026-10-06T12:00:00Z');
    expect(result).toContain('de octubre de 2026');
  });
});

describe('formatTime', () => {
  test('devuelve hora en formato HH:MM', () => {
    expect(formatTime('2026-10-06T09:30:00Z')).toMatch(/^\d{2}:\d{2}$/);
  });
});

describe('formatShortDate', () => {
  test('devuelve día y mes', () => {
    expect(formatShortDate('2026-10-06T12:00:00Z')).toMatch(/^\d{1,2}\/10$/);
  });
});