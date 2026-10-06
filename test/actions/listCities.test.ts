import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { citiesStorageMock } from '../helpers/mockModules';
import { captureConsole, getConsoleLines, restoreConsole } from '../helpers/captureConsole';
import type { City } from '../../src/types/City';

const { execute } = await import('../../src/actions/listCities');

const laPaz: City = {
  id: 'city-1',
  name: 'La Paz',
  latitude: -16.5,
  longitude: -68.15,
  country: 'Bolivia',
  admin1: 'Departamento de La Paz',
  isDefault: true,
};

afterEach(() => {
  restoreConsole();
});

beforeEach(() => {
  citiesStorageMock.loadCities.mockImplementation(async () => [laPaz]);
  citiesStorageMock.loadCities.mockClear();
  captureConsole();
});

describe('execute (listCities)', () => {
  test('muestra la lista de ciudades guardadas', async () => {
    await execute();

    expect(citiesStorageMock.loadCities).toHaveBeenCalledTimes(1);
    expect(getConsoleLines().join('\n')).toContain('La Paz');
    expect(getConsoleLines().join('\n')).toContain('[POR DEFECTO]');
  });

  test('muestra aviso si no hay ciudades', async () => {
    citiesStorageMock.loadCities.mockImplementation(async () => []);

    await execute();

    expect(getConsoleLines().join('\n')).toContain('No hay ciudades guardadas.');
  });
});