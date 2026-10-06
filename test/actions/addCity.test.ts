import { beforeEach, describe, expect, test } from 'bun:test';
import {
  inputMock,
  geocodingMock,
  citiesStorageMock,
} from '../helpers/mockModules';
import type { GeocodingResult } from '../../src/types/Weather';

const { execute } = await import('../../src/actions/addCity');

const laPazResult: GeocodingResult = {
  id: 1234,
  name: 'La Paz',
  latitude: -16.5,
  longitude: -68.15,
  country: 'Bolivia',
  country_code: 'BO',
  admin1: 'Departamento de La Paz',
};

beforeEach(() => {
  inputMock.askQuestion.mockImplementation(async () => '');
  inputMock.askConfirmation.mockImplementation(async () => false);
  geocodingMock.searchCity.mockImplementation(async () => []);
  citiesStorageMock.findCityByName.mockImplementation(async () => null);
  citiesStorageMock.addCity.mockImplementation(async (city) => [city]);
  citiesStorageMock.addCity.mockClear();
  citiesStorageMock.findCityByName.mockClear();
  geocodingMock.searchCity.mockClear();
  inputMock.askQuestion.mockClear();
});

describe('execute (addCity)', () => {
  test('agrega la ciudad seleccionada por el usuario', async () => {
    geocodingMock.searchCity.mockImplementation(async () => [laPazResult]);
    inputMock.askQuestion
      .mockImplementationOnce(async () => 'La Paz')
      .mockImplementationOnce(async () => '1');

    await execute();

    expect(citiesStorageMock.findCityByName).toHaveBeenCalledWith('La Paz');
    expect(citiesStorageMock.addCity).toHaveBeenCalledTimes(1);
    const added = citiesStorageMock.addCity.mock.calls[0]?.[0];
    expect(added?.name).toBe('La Paz');
    expect(added?.country).toBe('Bolivia');
    expect(added?.isDefault).toBe(false);
  });

  test('muestra error si no se ingresa un nombre', async () => {
    inputMock.askQuestion.mockImplementation(async () => '');

    await execute();

    expect(geocodingMock.searchCity).not.toHaveBeenCalled();
    expect(citiesStorageMock.addCity).not.toHaveBeenCalled();
  });

  test('muestra error si no hay resultados', async () => {
    inputMock.askQuestion.mockImplementation(async () => 'Ciudad Inexistente');

    await execute();

    expect(citiesStorageMock.addCity).not.toHaveBeenCalled();
  });

  test('cancela sin guardar cuando el usuario elige 0', async () => {
    geocodingMock.searchCity.mockImplementation(async () => [laPazResult]);
    inputMock.askQuestion
      .mockImplementationOnce(async () => 'La Paz')
      .mockImplementationOnce(async () => '0');

    await execute();

    expect(citiesStorageMock.addCity).not.toHaveBeenCalled();
  });

  test('no guarda con una selección inválida', async () => {
    geocodingMock.searchCity.mockImplementation(async () => [laPazResult]);
    inputMock.askQuestion
      .mockImplementationOnce(async () => 'La Paz')
      .mockImplementationOnce(async () => '9');

    await execute();

    expect(citiesStorageMock.addCity).not.toHaveBeenCalled();
  });

  test('no duplica una ciudad ya existente', async () => {
    geocodingMock.searchCity.mockImplementation(async () => [laPazResult]);
    citiesStorageMock.findCityByName.mockImplementation(async () => ({ ...laPazResult, id: 'city-1' }));
    inputMock.askQuestion
      .mockImplementationOnce(async () => 'La Paz')
      .mockImplementationOnce(async () => '1');

    await execute();

    expect(citiesStorageMock.addCity).not.toHaveBeenCalled();
  });
});