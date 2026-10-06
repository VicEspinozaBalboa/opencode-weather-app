import { mock } from 'bun:test';
import type { City } from '../../src/types/City';
import type { GeocodingResult, WeatherResponse } from '../../src/types/Weather';

export type WeatherParams = {
  latitude: number;
  longitude: number;
  timezone?: string;
};

export const inputMock = {
  askQuestion: mock(async (_question: string): Promise<string> => ''),
  askQuestionWithDefault: mock(
    async (_question: string, defaultValue: string): Promise<string> => defaultValue,
  ),
  askConfirmation: mock(async (_question: string): Promise<boolean> => false),
  readLine: mock(async (): Promise<string> => ''),
};

export const geocodingMock = {
  searchCity: mock(async (_query: string): Promise<GeocodingResult[]> => []),
  getCoordinates: mock(async (_query: string): Promise<GeocodingResult | null> => null),
};

export const weatherApiMock = {
  getWeather: mock(async (_params: WeatherParams): Promise<WeatherResponse | null> => null),
};

export const citiesStorageMock = {
  loadCities: mock(async (): Promise<City[]> => []),
  saveCities: mock(async (_cities: City[]): Promise<City[]> => []),
  addCity: mock(async (city: City): Promise<City[]> => [city]),
  removeCity: mock(async (_cityId: string): Promise<City[]> => []),
  findCityById: mock(async (): Promise<City | null> => null),
  findCityByName: mock(async (): Promise<City | null> => null),
  setDefaultCity: mock(async (_cityId: string): Promise<City[]> => []),
  getDefaultCity: mock(async (): Promise<City | null> => null),
  clearDefaultCity: mock(async (): Promise<City[]> => []),
};

mock.module('../../src/presentation/input', () => inputMock);
mock.module('../../src/api/geocoding', () => geocodingMock);
mock.module('../../src/api/weather', () => weatherApiMock);
mock.module('../../src/storage/citiesStorage', () => citiesStorageMock);