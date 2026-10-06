import { beforeEach, describe, expect, test } from 'bun:test';
import { inputMock, citiesStorageMock } from '../helpers/mockModules';
import type { City } from '../../src/types/City';

const { execute } = await import('../../src/actions/setDefaultCity');

const laPaz: City = {
  id: 'city-1',
  name: 'La Paz',
  latitude: -16.5,
  longitude: -68.15,
  country: 'Bolivia',
  admin1: 'Departamento de La Paz',
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
  citiesStorageMock.loadCities.mockImplementation(async () => [laPaz, cusco]);
  citiesStorageMock.setDefaultCity.mockImplementation(async (cityId) =>
    [laPaz, cusco].map((c) => ({ ...c, isDefault: c.id === cityId })),
  );
  citiesStorageMock.clearDefaultCity.mockImplementation(async () => [laPaz, cusco]);
  citiesStorageMock.setDefaultCity.mockClear();
  citiesStorageMock.clearDefaultCity.mockClear();
});

describe('execute (setDefaultCity)', () => {
  test('marca la ciudad seleccionada como default', async () => {
    inputMock.askQuestion.mockImplementation(async () => '2');

    await execute();

    expect(citiesStorageMock.setDefaultCity).toHaveBeenCalledWith('city-2');
    expect(citiesStorageMock.clearDefaultCity).not.toHaveBeenCalled();
  });

  test('quita el default con la opción 0', async () => {
    inputMock.askQuestion.mockImplementation(async () => '0');

    await execute();

    expect(citiesStorageMock.clearDefaultCity).toHaveBeenCalledTimes(1);
    expect(citiesStorageMock.setDefaultCity).not.toHaveBeenCalled();
  });

  test('muestra aviso si no hay ciudades', async () => {
    citiesStorageMock.loadCities.mockImplementation(async () => []);

    await execute();

    expect(citiesStorageMock.setDefaultCity).not.toHaveBeenCalled();
  });

  test('muestra error con una selección inválida', async () => {
    inputMock.askQuestion.mockImplementation(async () => '9');

    await execute();

    expect(citiesStorageMock.setDefaultCity).not.toHaveBeenCalled();
  });
});