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

export type DailyForecastDay = {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipitationProbability?: number;
};

export type DailyForecast = {
  days: DailyForecastDay[];
};

type DailyForecastResponse = {
  daily?: {
    time?: string[];
    weather_code?: (number | null)[];
    temperature_2m_max?: (number | null)[];
    temperature_2m_min?: (number | null)[];
    precipitation_probability_max?: (number | null)[];
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

export async function fetchDailyForecast(city: City, unit: Unit): Promise<DailyForecast> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    forecast_days: "7",
    temperature_unit: unit,
    wind_speed_unit: unit === "fahrenheit" ? "mph" : "kmh",
    timezone: "auto",
  });
  const res = await fetch(`${FORECAST_API}?${params}`);
  if (!res.ok) throw new Error(`Forecast API: HTTP ${res.status}`);
  const data = (await res.json()) as DailyForecastResponse;
  const daily = data.daily;
  if (!daily?.time?.length) throw new Error("Forecast API: respuesta sin pronóstico diario");

  const days: DailyForecastDay[] = [];
  daily.time.forEach((date, index) => {
    const weatherCode = daily.weather_code?.[index];
    const tempMax = daily.temperature_2m_max?.[index];
    const tempMin = daily.temperature_2m_min?.[index];
    if (
      typeof weatherCode !== "number" ||
      typeof tempMax !== "number" ||
      typeof tempMin !== "number"
    ) {
      return;
    }
    const precipitation = daily.precipitation_probability_max?.[index];
    days.push({
      date,
      weatherCode,
      tempMax,
      tempMin,
      precipitationProbability:
        typeof precipitation === "number" ? precipitation : undefined,
    });
  });
  if (days.length === 0) throw new Error("Forecast API: respuesta sin datos diarios");
  return { days };
}
