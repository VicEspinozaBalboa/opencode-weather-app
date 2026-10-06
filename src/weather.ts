import type { City, Unit } from "./config";
import type { CurrentWeather } from "./api";

const WMO_CODES: Record<number, string> = {
  0: "Despejado",
  1: "Mayormente despejado",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Niebla",
  48: "Niebla con escarcha",
  51: "Llovizna ligera",
  53: "Llovizna moderada",
  55: "Llovizna densa",
  56: "Llovizna helada ligera",
  57: "Llovizna helada densa",
  61: "Lluvia ligera",
  63: "Lluvia moderada",
  65: "Lluvia fuerte",
  66: "Lluvia helada ligera",
  67: "Lluvia helada fuerte",
  71: "Nieve ligera",
  73: "Nieve moderada",
  75: "Nieve fuerte",
  77: "Granos de nieve",
  80: "Chubascos ligeros",
  81: "Chubascos moderados",
  82: "Chubascos violentos",
  85: "Chubascos de nieve ligeros",
  86: "Chubascos de nieve fuertes",
  95: "Tormenta",
  96: "Tormenta con granizo ligero",
  99: "Tormenta con granizo fuerte",
};

export function describeWeather(code: number): string {
  return WMO_CODES[code] ?? `Código climático ${code}`;
}

export function labelCity(city: City): string {
  const parts = [city.name, city.admin1, city.country].filter(
    (part): part is string => Boolean(part),
  );
  return parts.join(", ");
}

function oneDecimal(value: number): string {
  return value.toFixed(1);
}

export function formatWeather(city: City, weather: CurrentWeather, unit: Unit): string {
  const tempUnit = unit === "celsius" ? "°C" : "°F";
  const windUnit = unit === "celsius" ? "km/h" : "mph";
  const lines = ["", `  ${labelCity(city)}`];
  lines.push(`  Clima:        ${describeWeather(weather.weatherCode)}`);
  lines.push(`  Temperatura:  ${oneDecimal(weather.temperature)} ${tempUnit}`);
  if (weather.apparentTemperature != null) {
    lines.push(`  Sensación:    ${oneDecimal(weather.apparentTemperature)} ${tempUnit}`);
  }
  lines.push(`  Viento:       ${oneDecimal(weather.windSpeed)} ${windUnit}`);
  if (weather.humidity != null) {
    lines.push(`  Humedad:      ${weather.humidity} %`);
  }
  lines.push("");
  return lines.join("\n");
}
