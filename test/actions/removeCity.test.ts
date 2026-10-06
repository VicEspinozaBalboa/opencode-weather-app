import { beforeEach, describe, expect, test } from 'bun:test';
import { inputMock, citiesStorageMock } from '../helpers/mockModules';
import type { City } from '../../src/types/City';

const { execute } = await import('../../src/actions/removeCity');

const laPaz: City = {
  id: 'city-1',
  name: 'La Paz',
  latitude: -16.5,
  longitude: -68.15,
  country: 'Bolivia',
  admin1: 'Departamento de La Paz',
  isDefault: true,
};

const cusco: City = {
  id: 'city-2',
  name: 'Cusco',
  latitude: -13.53,
  longitude: -71.97,
  country: 'Perú',
  admin1: 'Cusco',
};

beforeEach(() => {
  inputMock.askQuestion.mockImplementation(async () => '');
  inputMock.askConfirmation.mockImplementation(async () => false);
  citiesStorageMock.loadCities.mockImplementation(async () => [laPaz, cusco]);
  citiesStorageMock.removeCity.mockImplementation(async () => [laPaz]);
  citiesStorageMock.removeCity.mockClear();
  citiesStorageMock.loadCities.mockClear();
});

describe('execute (removeCity)', () => {
  test('elimina la ciudad confirmada', async () => {
    inputMock.askQuestion.mockImplementation(async () => '2');
    inputMock.askConfirmation.mockImplementation(async () => true);

    await execute();

    expect(citiesStorageMock.removeCity).toHaveBeenCalledWith('city-2');
  });

  test('no elimina si el usuario cancela la confirmación', async () => {
    inputMock.askQuestion.mockImplementation(async () => '2');
    inputMock.askConfirmation.mockImplementation(async () => false);

    await execute();

    expect(citiesStorageMock.removeCity).not.toHaveBeenCalled();
  });

  test('muestra aviso si no hay ciudades', async () => {
    citiesStorageMock.loadCities.mockImplementation(async () => []);

    await execute();

    expect(citiesStorageMock.removeCity).not.toHaveBeenCalled();
  });

  test('no elimina con una selección inválida', async () => {
    inputMock.askQuestion.mockImplementation(async () => '99');

    await execute();

    expect(citiesStorageMock.removeCity).not.toHaveBeenCalled();
  });

  test('cancela cuando el usuario elige 0', async () => {
    inputMock.askQuestion.mockImplementation(async () => '0');

    await execute();

    expect(citiesStorageMock.removeCity).not.toHaveBeenCalled();
  });
});