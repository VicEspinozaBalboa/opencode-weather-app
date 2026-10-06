import type { City, Unit } from "./config";

const GEOCODING_API = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_API = "https://api.open-meteo.com/v1/forecast";

type GeocodingResult = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
};

export type CurrentWeather = {
  temperature: number;
  apparentTemperature?: number;
  weatherCode: number;
  windSpeed: number;
  humidity?: number;
};

type ForecastResponse = {
  current?: {
    temperature_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    apparent_temperature?: number;
    relative_humidity_2m?: number;
  };
};

export async function searchCities(name: string): Promise<City[]> {
  const url = `${GEOCODING_API}?name=${encodeURIComponent(name)}&count=5&language=es&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocoding API: HTTP ${res.status}`);
  const data = (await res.json()) as { results?: GeocodingResult[] };
  return (data.results ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    latitude: r.latitude,
    longitude: r.longitude,
    country: r.country,
    admin1: r.admin1,
  }));
}

export async function fetchWeather(city: City, unit: Unit): Promise<CurrentWeather> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current:
      "temperature_2m,weather_code,wind_speed_10m,apparent_temperature,relative_humidity_2m",
    temperature_unit: unit,
    wind_speed_unit: unit === "fahrenheit" ? "mph" : "kmh",
  });
  const res = await fetch(`${FORECAST_API}?${params}`);
  if (!res.ok) throw new Error(`Forecast API: HTTP ${res.status}`);
  const data = (await res.json()) as ForecastResponse;
  const current = data.current;
  if (!current) throw new Error("Forecast API: respuesta sin datos actuales");
  return {
    temperature: current.temperature_2m,
    apparentTemperature: current.apparent_temperature,
    weatherCode: current.weather_code,
    windSpeed: current.wind_speed_10m,
    humidity: current.relative_humidity_2m,
  };
}
