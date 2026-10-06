import { STORAGE_PATHS, DEFAULT_SETTINGS } from '../utils/constants';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

export interface Settings {
  defaultCityId: string | null;
  units: 'metric' | 'imperial';
}

const ensureDir = async (filePath: string): Promise<void> => {
  try {
    await mkdir(dirname(filePath), { recursive: true });
  } catch (error) {
    // Ignorar errores
  }
};

export const loadSettings = async (): Promise<Settings> => {
  try {
    await ensureDir(STORAGE_PATHS.SETTINGS);
    const file = Bun.file(STORAGE_PATHS.SETTINGS);
    const exists = await file.exists();
    if (!exists) {
      return { ...DEFAULT_SETTINGS };
    }
    const content = await file.text();
    if (!content.trim()) {
      return { ...DEFAULT_SETTINGS };
    }
    const parsed = JSON.parse(content) as unknown;
    if (parsed && typeof parsed === 'object') {
      const result = parsed as Partial<Settings>;
      return {
        defaultCityId: result.defaultCityId ?? null,
        units: result.units === 'imperial' ? 'imperial' : 'metric',
      };
    }
    return { ...DEFAULT_SETTINGS };
  } catch (error) {
    return { ...DEFAULT_SETTINGS };
  }
};

export const saveSettings = async (settings: Partial<Settings>): Promise<Settings> => {
  try {
    const current = await loadSettings();
    const updated: Settings = {
      defaultCityId: settings.defaultCityId !== undefined ? settings.defaultCityId : current.defaultCityId,
      units: settings.units ?? current.units,
    };
    await ensureDir(STORAGE_PATHS.SETTINGS);
    await Bun.write(STORAGE_PATHS.SETTINGS, JSON.stringify(updated, null, 2));
    return updated;
  } catch (error) {
    return { ...DEFAULT_SETTINGS };
  }
};

export const setDefaultCityId = async (cityId: string | null): Promise<Settings> => {
  return await saveSettings({ defaultCityId: cityId });
};

export const getDefaultCityId = async (): Promise<string | null> => {
  const settings = await loadSettings();
  return settings.defaultCityId;
};
