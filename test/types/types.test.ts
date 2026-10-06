import { describe, expect, test } from 'bun:test';
import type { City } from '../../src/types/City';
import type { MenuChoice, MenuOption } from '../../src/types/MenuOption';
import type {
  CurrentWeather,
  DailyForecast,
  HourlyForecast,
  WeatherResponse,
} from '../../src/types/Weather';

describe('tipo City', () => {
  const city: City = {
    id: 'city-1',
    name: 'La Paz',
    latitude: -16.5,
    longitude: -68.15,
    country: 'Bolivia',
    admin1: 'Departamento de La Paz',
    isDefault: true,
  };

  test('una ciudad válida cumple el contrato del tipo', () => {
    expect(typeof city.id).toBe('string');
    expect(typeof city.name).toBe('string');
    expect(typeof city.latitude).toBe('number');
    expect(typeof city.longitude).toBe('number');
    expect(city.isDefault).toBe(true);
  });

  test('isDefault es opcional', () => {
    const sinDefault: City = {
      id: 'city-2',
      name: 'Cusco',
      latitude: -13.53,
      longitude: -71.97,
    };
    expect(sinDefault.isDefault).toBeUndefined();
  });
});

describe('tipo CurrentWeather', () => {
  test('contiene los campos del clima actual', () => {
    const current: CurrentWeather = {
      time: '2026-10-06T09:30:00Z',
      temperature: 12.5,
      relative_humidity_2m: 58,
      apparent_temperature: 11.2,
      precipitation: 0,
      weather_code: 0,
      wind_speed_10m: 14.2,
      wind_direction_10m: 240,
      surface_pressure: 650,
    };
    expect(current.temperature).toBeGreaterThanOrEqual(-50);
    expect(current.temperature).toBeLessThanOrEqual(60);
    expect(current.relative_humidity_2m).toBeGreaterThanOrEqual(0);
  });
});

describe('tipo WeatherResponse', () => {
  test('una respuesta completa satisface el contrato', () => {
    const weather: WeatherResponse = {
      latitude: -16.5,
      longitude: -68.15,
      generationtime_ms: 0.5,
      utc_offset_seconds: 0,
      timezone: 'GMT',
      timezone_abbreviation: 'GMT',
      elevation: 3600,
      current: {
        time: '2026-10-06T09:30:00Z',
        temperature: 12.5,
        relative_humidity_2m: 58,
        apparent_temperature: 11.2,
        precipitation: 0,
        weather_code: 0,
        wind_speed_10m: 14.2,
        wind_direction_10m: 240,
        surface_pressure: 650,
      },
      daily: {
        time: ['2026-10-06'],
        weather_code: [0],
        temperature_2m_max: [16],
        temperature_2m_min: [6],
        precipitation_probability_max: [20],
        precipitation_sum: null,
        wind_speed_10m_max: null,
        sunrise: null,
        sunset: null,
      },
      hourly: {
        time: ['2026-10-06T00:00:00Z'],
        temperature_2m: [8],
        relative_humidity_2m: [60],
        precipitation_probability: null,
        weather_code: [0],
        wind_speed_10m: null,
      },
    };

    expect(weather.current.weather_code).toBe(0);
    expect(weather.daily.time[0]).toBe('2026-10-06');
    expect(weather.hourly.temperature_2m[0]).toBe(8);
  });

  test('arrays diarios opcionales pueden ser null', () => {
    const daily: DailyForecast = {
      time: ['2026-10-06'],
      weather_code: [0],
      temperature_2m_max: [16],
      temperature_2m_min: [6],
      precipitation_probability_max: null,
      precipitation_sum: null,
      wind_speed_10m_max: null,
      sunrise: null,
      sunset: null,
    };
    expect(daily.precipitation_probability_max).toBeNull();
    expect(daily.time).toHaveLength(1);
  });

  test('arrays horarios opcionales pueden ser null', () => {
    const hourly: HourlyForecast = {
      time: ['2026-10-06T00:00:00Z'],
      temperature_2m: [8],
      relative_humidity_2m: [60],
      precipitation_probability: null,
      weather_code: [0],
      wind_speed_10m: null,
    };
    expect(hourly.wind_speed_10m).toBeNull();
  });
});

describe('tipo MenuOption / MenuChoice', () => {
  const opcionesValidas: MenuOption[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  test('las opciones del menú son strings válidos', () => {
    for (const option of opcionesValidas) {
      expect(option).toMatch(/^\d$/);
    }
  });

  test('una elección del menú tiene opción y etiqueta', () => {
    const salir: MenuChoice = { option: '9', label: 'Salir' };
    expect(salir.option).toBe('9');
    expect(salir.label.length).toBeGreaterThan(0);
  });
});