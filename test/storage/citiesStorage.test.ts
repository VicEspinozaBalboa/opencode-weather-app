import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import {
  loadCities,
  saveCities,
  addCity,
  removeCity,
  findCityById,
  findCityByName,
  setDefaultCity,
  getDefaultCity,
  clearDefaultCity,
} from '../../src/storage/citiesStorage';
import { installFakeFileSystem, restoreFileSystem } from '../helpers/fakeFs';
import type { City } from '../../src/types/City';

const CITIES_PATH = './data/cities.json';

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

const seed = async (content: string): Promise<void> => {
  await Bun.write(CITIES_PATH, content);
};

beforeEach(() => {
  installFakeFileSystem();
});

afterEach(() => {
  restoreFileSystem();
});

describe('loadCities', () => {
  test('devuelve lista vacía si el archivo no existe', async () => {
    expect(await loadCities()).toEqual([]);
  });

  test('devuelve lista vacía si el archivo está vacío', async () => {
    await seed('');
    expect(await loadCities()).toEqual([]);
  });

  test('devuelve lista vacía si el archivo tiene JSON inválido', async () => {
    await seed('{ esto no es json');
    expect(await loadCities()).toEqual([]);
  });

  test('devuelve lista vacía si el contenido no es un array', async () => {
    await seed(JSON.stringify({ ciudades: [] }));
    expect(await loadCities()).toEqual([]);
  });

  test('lee las ciudades guardadas', async () => {
    await seed(JSON.stringify([laPaz, cusco]));
    const cities = await loadCities();
    expect(cities).toHaveLength(2);
    expect(cities[0]?.name).toBe('La Paz');
    expect(cities[1]?.name).toBe('Cusco');
  });
});

describe('saveCities', () => {
  test('persiste el contenido como JSON', async () => {
    await saveCities([laPaz]);
    const result = await loadCities();
    expect(result).toEqual([laPaz]);
  });
});

describe('addCity', () => {
  test('agrega una ciudad nueva y la persiste', async () => {
    const result = await addCity(laPaz);
    expect(result).toEqual([laPaz]);
    expect(await loadCities()).toEqual([laPaz]);
  });

  test('no agrega una ciudad duplicada (ignorando mayúsculas)', async () => {
    await seed(JSON.stringify([laPaz]));
    const result = await addCity({ ...laPaz, id: 'city-otra', name: 'la paz' });
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('city-1');
  });

  test('agrega al final de la lista existente', async () => {
    await seed(JSON.stringify([laPaz]));
    const result = await addCity(cusco);
    expect(result.map((c) => c.name)).toEqual(['La Paz', 'Cusco']);
  });
});

describe('removeCity', () => {
  test('elimina la ciudad con el id indicado', async () => {
    await seed(JSON.stringify([laPaz, cusco]));
    const result = await removeCity(laPaz.id);
    expect(result).toEqual([cusco]);
  });

  test('no falla si el id no existe', async () => {
    await seed(JSON.stringify([laPaz]));
    const result = await removeCity('no-existe');
    expect(result).toEqual([laPaz]);
  });
});

describe('findCityById / findCityByName', () => {
  test('encuentra por id', async () => {
    await seed(JSON.stringify([laPaz, cusco]));
    const city = await findCityById('city-2');
    expect(city?.name).toBe('Cusco');
  });

  test('devuelve null si el id no existe', async () => {
    await seed(JSON.stringify([laPaz]));
    expect(await findCityById('no-existe')).toBeNull();
  });

  test('encuentra por nombre ignorando mayúsculas', async () => {
    await seed(JSON.stringify([laPaz]));
    expect((await findCityByName('LA PAZ'))?.id).toBe('city-1');
  });

  test('devuelve null si el nombre no existe', async () => {
    await seed(JSON.stringify([laPaz]));
    expect(await findCityByName('Lima')).toBeNull();
  });
});

describe('setDefaultCity / getDefaultCity / clearDefaultCity', () => {
  test('marca una única ciudad como default', async () => {
    await seed(JSON.stringify([laPaz, cusco]));
    const result = await setDefaultCity(cusco.id);
    expect(result.find((c) => c.isDefault)?.id).toBe('city-2');
    expect(result.filter((c) => c.isDefault)).toHaveLength(1);
  });

  test('getDefaultCity devuelve la ciudad marcada', async () => {
    await seed(JSON.stringify([laPaz, cusco]));
    await setDefaultCity(cusco.id);
    expect((await getDefaultCity())?.name).toBe('Cusco');
  });

  test('getDefaultCity devuelve null si ninguna es default', async () => {
    await seed(JSON.stringify([laPaz, cusco]));
    expect(await getDefaultCity()).toBeNull();
  });

  test('clearDefaultCity quita la marca de todas', async () => {
    await seed(JSON.stringify([laPaz, cusco]));
    await setDefaultCity(cusco.id);
    const result = await clearDefaultCity();
    expect(result.every((c) => !c.isDefault)).toBe(true);
  });
});