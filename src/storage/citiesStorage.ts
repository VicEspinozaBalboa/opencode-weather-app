import type { CitiesList, City } from '../types/City';
import { STORAGE_PATHS } from '../utils/constants';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

const ensureDir = async (filePath: string): Promise<void> => {
  try {
    await mkdir(dirname(filePath), { recursive: true });
  } catch (error) {
    // Ignorar errores si el directorio ya existe
  }
};

export const loadCities = async (): Promise<CitiesList> => {
  try {
    await ensureDir(STORAGE_PATHS.CITIES);
    const file = Bun.file(STORAGE_PATHS.CITIES);
    const exists = await file.exists();
    if (!exists) {
      return [];
    }
    const content = await file.text();
    if (!content.trim()) {
      return [];
    }
    const parsed = JSON.parse(content) as unknown;
    if (Array.isArray(parsed)) {
      return parsed as CitiesList;
    }
    return [];
  } catch (error) {
    return [];
  }
};

export const saveCities = async (cities: CitiesList): Promise<void> => {
  try {
    await ensureDir(STORAGE_PATHS.CITIES);
    await Bun.write(STORAGE_PATHS.CITIES, JSON.stringify(cities, null, 2));
  } catch (error) {
    // Silenciosamente falla - mejor manejar con presentación si necesario
  }
};

export const addCity = async (city: City): Promise<CitiesList> => {
  const cities = await loadCities();
  const exists = cities.some((c) => c.name.toLowerCase() === city.name.toLowerCase());
  if (exists) {
    return cities;
  }
  cities.push(city);
  await saveCities(cities);
  return cities;
};

export const removeCity = async (cityId: string): Promise<CitiesList> => {
  const cities = await loadCities();
  const filtered = cities.filter((c) => c.id !== cityId);
  await saveCities(filtered);
  return filtered;
};

export const findCityById = async (cityId: string): Promise<City | null> => {
  const cities = await loadCities();
  return cities.find((c) => c.id === cityId) ?? null;
};

export const findCityByName = async (name: string): Promise<City | null> => {
  const cities = await loadCities();
  return cities.find((c) => c.name.toLowerCase() === name.toLowerCase()) ?? null;
};

export const setDefaultCity = async (cityId: string): Promise<CitiesList> => {
  const cities = await loadCities();
  const updated = cities.map((c) => ({
    ...c,
    isDefault: c.id === cityId,
  }));
  await saveCities(updated);
  return updated;
};

export const getDefaultCity = async (): Promise<City | null> => {
  const cities = await loadCities();
  return cities.find((c) => c.isDefault) ?? null;
};

export const clearDefaultCity = async (): Promise<CitiesList> => {
  const cities = await loadCities();
  const updated = cities.map((c) => ({ ...c, isDefault: false }));
  await saveCities(updated);
  return updated;
};
