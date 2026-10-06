import type { City, Unit } from "./config";
import type { CurrentWeather, DailyForecast } from "./api";
import { green, yellow } from "./colors";

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
  const lines = ["", green(`  ${labelCity(city)}`)];
  lines.push(green(`  Clima:        ${describeWeather(weather.weatherCode)}`));
  lines.push(yellow(`  Temperatura:  ${oneDecimal(weather.temperature)} ${tempUnit}`));
  if (weather.apparentTemperature != null) {
    lines.push(green(`  Sensación:    ${oneDecimal(weather.apparentTemperature)} ${tempUnit}`));
  }
  lines.push(green(`  Viento:       ${oneDecimal(weather.windSpeed)} ${windUnit}`));
  if (weather.humidity != null) {
    lines.push(green(`  Humedad:      ${weather.humidity} %`));
  }
  lines.push("");
  return lines.join("\n");
}

const DAY_NAMES = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

function dayLabel(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (year == null || month == null || day == null) return isoDate;
  const date = new Date(year, month - 1, day);
  const name = DAY_NAMES[date.getDay()] ?? "";
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${name} ${dd}/${mm}`;
}

export function formatDailyForecast(
  city: City,
  forecast: DailyForecast,
  unit: Unit,
): string {
  const tempUnit = unit === "celsius" ? "°C" : "°F";
  const lines = [
    "",
    green(`  ${labelCity(city)}`),
    green(`  Pronóstico 7 días (${tempUnit})`),
    "",
    green(
      `  ${"DÍA".padEnd(10)}${"CLIMA".padEnd(28)}${"MÁX / MÍN".padStart(14)}${"LLUVIA".padStart(9)}`,
    ),
  ];
  for (const day of forecast.days) {
    const label = dayLabel(day.date);
    const description = describeWeather(day.weatherCode);
    const temps = `${oneDecimal(day.tempMax)}° / ${oneDecimal(day.tempMin)}°`;
    const rain =
      day.precipitationProbability != null ? `${day.precipitationProbability} %` : "—";
    lines.push(
      "  " +
        green(label.padEnd(10)) +
        green(description.padEnd(28)) +
        yellow(temps.padStart(14)) +
        green(rain.padStart(9)),
    );
  }
  lines.push("");
  return lines.join("\n");
}
