import { beforeEach, describe, expect, test } from 'bun:test';
import {
  inputMock,
  geocodingMock,
  weatherApiMock,
  citiesStorageMock,
} from '../helpers/mockModules';
import type { City } from '../../src/types/City';
import type { GeocodingResult, WeatherResponse } from '../../src/types/Weather';

const { execute } = await import('../../src/actions/getWeather');

const laPaz: City = {
  id: 'city-1',
  name: 'La Paz',
  latitude: -16.5,
  longitude: -68.15,
  country: 'Bolivia',
  admin1: 'Departamento de La Paz',
  isDefault: true,
};

const laPazResult: GeocodingResult = {
  id: 1234,
  name: 'La Paz',
  latitude: -16.5,
  longitude: -68.15,
  country: 'Bolivia',
  country_code: 'BO',
  admin1: 'Departamento de La Paz',
};

const weatherFixture: WeatherResponse = {
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
    weather_code: [0],
    wind_speed_10m: [12],
  },
};

beforeEach(() => {
  inputMock.askQuestion.mockImplementation(async () => '');
  inputMock.askConfirmation.mockImplementation(async () => false);
  geocodingMock.searchCity.mockImplementation(async () => []);
  weatherApiMock.getWeather.mockImplementation(async () => weatherFixture);
  citiesStorageMock.loadCities.mockImplementation(async () => []);
  citiesStorageMock.addCity.mockImplementation(async (city) => [city]);
  citiesStorageMock.addCity.mockClear();
  weatherApiMock.getWeather.mockClear();
});

describe('execute (getWeather)', () => {
  test('con ciudades y default, Enter usa la ciudad por defecto', async () => {
    citiesStorageMock.loadCities.mockImplementation(async () => [laPaz]);
    inputMock.askQuestion.mockImplementation(async () => '');

    await execute();

    expect(weatherApiMock.getWeather).toHaveBeenCalledTimes(1);
    const params = weatherApiMock.getWeather.mock.calls[0]?.[0];
    expect(params?.latitude).toBe(-16.5);
    expect(params?.longitude).toBe(-68.15);
    expect(citiesStorageMock.addCity).not.toHaveBeenCalled();
  });

  test('con ciudades y sin default, selecciona una ciudad guardada', async () => {
    citiesStorageMock.loadCities.mockImplementation(async () => [{ ...laPaz, isDefault: false }]);
    inputMock.askQuestion.mockImplementation(async () => '1');

    await execute();

    expect(weatherApiMock.getWeather).toHaveBeenCalledTimes(1);
    expect(citiesStorageMock.addCity).not.toHaveBeenCalled();
  });

  test('sin default y Enter, muestra error', async () => {
    citiesStorageMock.loadCities.mockImplementation(async () => [{ ...laPaz, isDefault: false }]);
    inputMock.askQuestion.mockImplementation(async () => '');

    await execute();

    expect(weatherApiMock.getWeather).not.toHaveBeenCalled();
  });

  test('con selección inválida, muestra error', async () => {
    citiesStorageMock.loadCities.mockImplementation(async () => [laPaz]);
    inputMock.askQuestion.mockImplementation(async () => '99');

    await execute();

    expect(weatherApiMock.getWeather).not.toHaveBeenCalled();
  });

  test('sin ciudades, busca una nueva y la guarda si confirma', async () => {
    geocodingMock.searchCity.mockImplementation(async () => [laPazResult]);
    inputMock.askQuestion
      .mockImplementationOnce(async () => 'La Paz')
      .mockImplementationOnce(async () => '1');
    inputMock.askConfirmation.mockImplementation(async () => true);

    await execute();

    expect(citiesStorageMock.addCity).toHaveBeenCalledTimes(1);
    const added = citiesStorageMock.addCity.mock.calls[0]?.[0];
    expect(added?.name).toBe('La Paz');
  });

  test('sin ciudades, no guarda si no confirma', async () => {
    geocodingMock.searchCity.mockImplementation(async () => [laPazResult]);
    inputMock.askQuestion
      .mockImplementationOnce(async () => 'La Paz')
      .mockImplementationOnce(async () => '1');
    inputMock.askConfirmation.mockImplementation(async () => false);

    await execute();

    expect(citiesStorageMock.addCity).not.toHaveBeenCalled();
  });

  test('muestra error si no hay resultados de la búsqueda', async () => {
    geocodingMock.searchCity.mockImplementation(async () => []);
    inputMock.askQuestion.mockImplementation(async () => 'Ciudad Inexistente');

    await execute();

    expect(weatherApiMock.getWeather).not.toHaveBeenCalled();
    expect(citiesStorageMock.addCity).not.toHaveBeenCalled();
  });
});