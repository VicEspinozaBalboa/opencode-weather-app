import { afterEach, describe, expect, test } from 'bun:test';
import { searchCity, getCoordinates } from '../../src/api/geocoding';
import {
  installFetchMock,
  getLastFetchUrl,
  restoreFetchMock,
} from '../helpers/fakeFetch';

const GEOFIXTURE = {
  results: [
    {
      id: 1234,
      name: 'La Paz',
      latitude: -16.5,
      longitude: -68.15,
      country: 'Bolivia',
      country_code: 'BO',
      admin1: 'Departamento de La Paz',
    },
  ],
};

afterEach(() => {
  restoreFetchMock();
});

describe('searchCity', () => {
  test('hace la petición al API de geocoding con los parámetros esperados', async () => {
    installFetchMock(() => new Response(JSON.stringify(GEOFIXTURE), { status: 200 }));

    const results = await searchCity('La Paz');

    const url = getLastFetchUrl();
    expect(url).toBeTruthy();
    expect(url).toContain('https://geocoding-api.open-meteo.com/v1/search');
    expect(url).toContain('name=La+Paz');
    expect(url).toContain('count=10');
    expect(url).toContain('language=es');
    expect(url).toContain('format=json');
    expect(results).toHaveLength(1);
    expect(results[0]?.name).toBe('La Paz');
    expect(results[0]?.country).toBe('Bolivia');
  });

  test('devuelve array vacío si la respuesta HTTP no es OK', async () => {
    installFetchMock(() => new Response('error', { status: 500 }));
    expect(await searchCity('X')).toEqual([]);
  });

  test('devuelve array vacío cuando no hay resultados', async () => {
    installFetchMock(() => new Response(JSON.stringify({ results: undefined }), { status: 200 }));
    expect(await searchCity('Nada')).toEqual([]);
  });

  test('devuelve array vacío si hay un error de red', async () => {
    installFetchMock(() => {
      throw new Error('network error');
    });
    expect(await searchCity('X')).toEqual([]);
  });

  test('recorta espacios en el nombre de la ciudad', async () => {
    installFetchMock(() => new Response(JSON.stringify(GEOFIXTURE), { status: 200 }));
    await searchCity('  La Paz  ');
    const url = getLastFetchUrl();
    expect(url).toContain('name=La+Paz');
  });
});

describe('getCoordinates', () => {
  test('devuelve el primer resultado encontrado', async () => {
    installFetchMock(() => new Response(JSON.stringify(GEOFIXTURE), { status: 200 }));
    const result = await getCoordinates('La Paz');
    expect(result).not.toBeNull();
    expect(result?.latitude).toBe(-16.5);
    expect(result?.longitude).toBe(-68.15);
  });

  test('devuelve null si no hay resultados', async () => {
    installFetchMock(() => new Response(JSON.stringify({ results: [] }), { status: 200 }));
    expect(await getCoordinates('Nada')).toBeNull();
  });
});