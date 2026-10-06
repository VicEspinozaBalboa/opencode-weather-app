export const API_BASE = {
  GEOCODING: 'https://geocoding-api.open-meteo.com/v1/search',
  FORECAST: 'https://api.open-meteo.com/v1/forecast',
} as const;

export const STORAGE_PATHS = {
  CITIES: './data/cities.json',
  SETTINGS: './data/settings.json',
} as const;

export const DEFAULT_SETTINGS = {
  defaultCityId: null as string | null,
  units: 'metric' as const,
};

export const APP_NAME = 'Weather CLI';
