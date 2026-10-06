import { afterEach, describe, expect, test } from 'bun:test';
import { getWeather } from '../../src/api/weather';
import { installFetchMock, getLastFetchUrl, restoreFetchMock } from '../helpers/fakeFetch';

const FORECAST_FIXTURE = {
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
    weather_code: 2,
    wind_speed_10m: 14.2,
    wind_direction_10m: 240,
    surface_pressure: 650,
  },
  daily: {
    time: ['2026-10-06'],
    weather_code: [2],
    temperature_2m_max: [16],
    temperature_2m_min: [6],
    precipitation_probability_max: [20],
    precipitation_sum: [0],
    wind_speed_10m_max: [18],
    sunrise: ['06:00'],
    sunset: ['18:30'],
  },
  hourly: {
    time: ['2026-10-06T00:00:00Z'],
    temperature_2m: [8],
    relative_humidity_2m: [60],
    precipitation_probability: [10],
    weather_code: [2],
    wind_speed_10m: [12],
  },
};

afterEach(() => {
  restoreFetchMock();
});

describe('getWeather', () => {
  test('hace la petición al API de forecast con los parámetros esperados', async () => {
    installFetchMock(() => new Response(JSON.stringify(FORECAST_FIXTURE), { status: 200 }));

    const result = await getWeather({ latitude: -16.5, longitude: -68.15 });

    const url = getLastFetchUrl();
    expect(url).toBeTruthy();
    expect(url).toContain('https://api.open-meteo.com/v1/forecast');
    expect(url).toContain('latitude=-16.5');
    expect(url).toContain('longitude=-68.15');
    expect(url).toContain('current=');
    expect(url).toContain('hourly=');
    expect(url).toContain('daily=');
    expect(url).toContain('forecast_days=5');
    expect(url).toContain('timezone=auto');
    expect(result).not.toBeNull();
    expect(result?.current.temperature).toBe(12.5);
    expect(result?.current.weather_code).toBe(2);
    expect(result?.daily.time[0]).toBe('2026-10-06');
  });

  test('permite configurar el parámetro timezone', async () => {
    installFetchMock(() => new Response(JSON.stringify(FORECAST_FIXTURE), { status: 200 }));

    await getWeather({ latitude: 0, longitude: 0, timezone: 'America/La_Paz' });

    const url = getLastFetchUrl();
    expect(url).toContain('timezone=America%2FLa_Paz');
  });

  test('devuelve null si la respuesta HTTP no es OK', async () => {
    installFetchMock(() => new Response('error', { status: 503 }));
    expect(await getWeather({ latitude: 0, longitude: 0 })).toBeNull();
  });

  test('devuelve null si hay un error de red', async () => {
    installFetchMock(() => {
      throw new Error('network error');
    });
    expect(await getWeather({ latitude: 0, longitude: 0 })).toBeNull();
  });
});