import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { inputMock, citiesStorageMock } from '../helpers/mockModules';
import { installFakeFileSystem, restoreFileSystem, getFakeFile } from '../helpers/fakeFs';
import { captureConsole, getConsoleLines, restoreConsole } from '../helpers/captureConsole';
import type { City } from '../../src/types/City';

const { execute } = await import('../../src/actions/exportData');

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
  restoreFileSystem();
});

beforeEach(() => {
  installFakeFileSystem();
  inputMock.askQuestion.mockImplementation(async () => '');
  inputMock.askQuestionWithDefault.mockImplementation(async (_q, d) => d);
  citiesStorageMock.loadCities.mockImplementation(async () => [laPaz]);
  captureConsole();
});

describe('execute (exportData)', () => {
  test('muestra aviso si no hay datos para exportar', async () => {
    citiesStorageMock.loadCities.mockImplementation(async () => []);

    await execute();

    expect(getConsoleLines().join('\n')).toContain('No hay datos para exportar');
    expect(getFakeFile('./data/weather_data.json')).toBeUndefined();
  });

  test('exporta en JSON por defecto', async () => {
    inputMock.askQuestion.mockImplementation(async () => '');

    await execute();

    const content = getFakeFile('./data/weather_data.json');
    expect(content).toBeTruthy();
    const parsed = JSON.parse(content ?? '[]') as City[];
    expect(parsed[0]?.name).toBe('La Paz');
    expect(getConsoleLines().join('\n')).toContain('Datos exportados correctamente');
  });

  test('exporta en CSV cuando se elige ese formato', async () => {
    inputMock.askQuestion.mockImplementation(async () => 'csv');

    await execute();

    const content = getFakeFile('./data/weather_data.csv');
    expect(content).toContain('id,name,latitude,longitude,country,admin1,isDefault');
    expect(content).toContain('La Paz');
  });
});