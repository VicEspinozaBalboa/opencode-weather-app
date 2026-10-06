import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import {
  loadSettings,
  saveSettings,
  setDefaultCityId,
  getDefaultCityId,
} from '../../src/storage/settingsStorage';
import { installFakeFileSystem, restoreFileSystem, getFakeFile } from '../helpers/fakeFs';

const SETTINGS_PATH = './data/settings.json';

beforeEach(() => {
  installFakeFileSystem();
});

afterEach(() => {
  restoreFileSystem();
});

describe('loadSettings', () => {
  test('devuelve los valores por defecto si el archivo no existe', async () => {
    expect(await loadSettings()).toEqual({ defaultCityId: null, units: 'metric' });
  });

  test('devuelve los valores por defecto si el archivo está vacío', async () => {
    await Bun.write(SETTINGS_PATH, '');
    expect(await loadSettings()).toEqual({ defaultCityId: null, units: 'metric' });
  });

  test('devuelve los valores por defecto si el archivo tiene JSON inválido', async () => {
    await Bun.write(SETTINGS_PATH, 'no-json');
    expect(await loadSettings()).toEqual({ defaultCityId: null, units: 'metric' });
  });

  test('lee los ajustes guardados', async () => {
    await Bun.write(SETTINGS_PATH, JSON.stringify({ defaultCityId: 'city-1', units: 'imperial' }));
    const settings = await loadSettings();
    expect(settings.defaultCityId).toBe('city-1');
    expect(settings.units).toBe('imperial');
  });

  test('normaliza units no válidos a metric', async () => {
    await Bun.write(SETTINGS_PATH, JSON.stringify({ units: 'weird' }));
    expect((await loadSettings()).units).toBe('metric');
  });
});

describe('saveSettings', () => {
  test('fusiona los ajustes actuales con los cambios', async () => {
    const updated = await saveSettings({ defaultCityId: 'city-9' });
    expect(updated).toEqual({ defaultCityId: 'city-9', units: 'metric' });
    expect(await loadSettings()).toEqual(updated);
  });

  test('persiste el archivo con la nueva configuración', async () => {
    await saveSettings({ defaultCityId: 'city-1', units: 'imperial' });
    expect(getFakeFile(SETTINGS_PATH)).toContain('"units": "imperial"');
  });

  test('sobrescribe solo los campos proporcionados', async () => {
    await saveSettings({ defaultCityId: 'city-1' });
    const updated = await saveSettings({ units: 'imperial' });
    expect(updated).toEqual({ defaultCityId: 'city-1', units: 'imperial' });
  });
});

describe('setDefaultCityId / getDefaultCityId', () => {
  test('setDefaultCityId guarda el id', async () => {
    const settings = await setDefaultCityId('city-5');
    expect(settings.defaultCityId).toBe('city-5');
    expect(await getDefaultCityId()).toBe('city-5');
  });

  test('setDefaultCityId con null limpia el default', async () => {
    await setDefaultCityId('city-5');
    const settings = await setDefaultCityId(null);
    expect(settings.defaultCityId).toBeNull();
    expect(await getDefaultCityId()).toBeNull();
  });

  test('getDefaultCityId devuelve null si no hay configuración', async () => {
    expect(await getDefaultCityId()).toBeNull();
  });
});