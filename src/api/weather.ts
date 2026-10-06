import type { WeatherResponse } from '../types/Weather';
import { API_BASE } from '../utils/constants';

export interface WeatherParams {
  latitude: number;
  longitude: number;
  timezone?: string;
}

export const getWeather = async (params: WeatherParams): Promise<WeatherResponse | null> => {
  try {
    const url = new URL(API_BASE.FORECAST);
    url.searchParams.set('latitude', params.latitude.toString());
    url.searchParams.set('longitude', params.longitude.toString());
    url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure');
    url.searchParams.set('hourly', 'temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m');
    url.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,sunrise,sunset');
    url.searchParams.set('timezone', params.timezone ?? 'auto');
    url.searchParams.set('forecast_days', '5');

    const response = await fetch(url.toString());
    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as WeatherResponse;
    return data;
  } catch (error) {
    return null;
  }
};
