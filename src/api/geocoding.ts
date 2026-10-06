import type { GeocodingResponse, GeocodingResult } from '../types/Weather';
import { API_BASE } from '../utils/constants';

export const searchCity = async (query: string): Promise<GeocodingResult[]> => {
  try {
    const url = new URL(API_BASE.GEOCODING);
    url.searchParams.set('name', query.trim());
    url.searchParams.set('count', '10');
    url.searchParams.set('language', 'es');
    url.searchParams.set('format', 'json');

    const response = await fetch(url.toString());
    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as GeocodingResponse;
    if (!data.results || data.results.length === 0) {
      return [];
    }

    return data.results;
  } catch (error) {
    return [];
  }
};

export const getCoordinates = async (cityName: string): Promise<GeocodingResult | null> => {
  const results = await searchCity(cityName);
  if (results.length === 0) {
    return null;
  }
  return results[0] ?? null;
};
