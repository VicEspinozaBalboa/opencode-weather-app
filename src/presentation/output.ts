import { colorize } from '../utils/colors';
import type { City } from '../types/City';
import type { WeatherResponse } from '../types/Weather';
import {
  formatTemperature,
  formatHumidity,
  formatWindSpeed,
  formatPressure,
  formatPrecipitation,
  getWeatherDescription,
  formatDate,
  formatTime,
  formatShortDate,
} from '../utils/format';

const BANNER = `
 __      __               __  .__                 ___________ .__  .__
/  \\    /  \\ ____ _____ _/  |_|  |__   __________\\__    ___/ |  | |__|
\\   \\/\\/   // __ \\\\__  \\\\   __\\  |  \\_/ __ \\_  __ \\|    |    |  | |  |
 \\        /\\  ___/ / __ \\|  | |   Y  \\  ___/|  | \\/|    |    |  |_|  |
  \\__/\\  /  \\___  >____  /__| |___|  /\\___  >__|   |____|    |____/__|
       \\/       \\/     \\/          \\/     \\/                       

            CLI del Clima - OpenMeteo
`;

export const showBanner = (): void => {
  console.log(colorize('cyan', BANNER));
};

export const showWelcome = (): void => {
  console.log(colorize('green', '¡Bienvenido al CLI del Clima!'));
  console.log('');
};

export const showMenu = (): void => {
  console.log('');
  console.log(colorize('yellow', '=== MENÚ PRINCIPAL ==='));
  console.log('1. Consultar clima actual');
  console.log('2. Agregar ciudad');
  console.log('3. Eliminar ciudad');
  console.log('4. Establecer ciudad por defecto');
  console.log('5. Listar ciudades');
  console.log('6. Ver pronóstico (próximos 5 días)');
  console.log('7. Configuración');
  console.log('8. Exportar datos');
  console.log('9. Salir');
  console.log('');
};

export const showError = (message: string): void => {
  console.log(colorize('red', `❌ Error: ${message}`));
};

export const showSuccess = (message: string): void => {
  console.log(colorize('green', `✅ ${message}`));
};

export const showInfo = (message: string): void => {
  console.log(colorize('blue', `ℹ️  ${message}`));
};

export const showWarning = (message: string): void => {
  console.log(colorize('yellow', `⚠️  ${message}`));
};

export const showCitiesList = (cities: City[]): void => {
  if (cities.length === 0) {
    showInfo('No hay ciudades guardadas.');
    return;
  }

  console.log('');
  console.log(colorize('cyan', '=== CIUDADES GUARDADAS ==='));
  cities.forEach((city, index) => {
    const defaultMark = city.isDefault ? colorize('green', ' [POR DEFECTO]') : '';
    console.log(
      `${index + 1}. ${city.name}${defaultMark} (${city.latitude.toFixed(4)}, ${city.longitude.toFixed(4)})`
    );
    if (city.country) {
      console.log(`   País: ${city.country}`);
    }
    if (city.admin1) {
      console.log(`   Región: ${city.admin1}`);
    }
    console.log(`   ID: ${city.id}`);
    console.log('');
  });
};

export const showWeather = (city: City, weather: WeatherResponse): void => {
  console.log('');
  console.log(colorize('cyan', `=== CLIMA ACTUAL - ${city.name.toUpperCase()} ===`));
  console.log(`Fecha: ${formatDate(weather.current.time)}`);
  console.log(`Hora: ${formatTime(weather.current.time)}`);
  console.log('');
  console.log(`🌡️  Temperatura: ${formatTemperature(weather.current.temperature)}`);
  console.log(`Sensación térmica: ${formatTemperature(weather.current.apparent_temperature)}`);
  console.log(`Humedad: ${formatHumidity(weather.current.relative_humidity_2m)}`);
  console.log(`Presión: ${formatPressure(weather.current.surface_pressure)}`);
  console.log(`Viento: ${formatWindSpeed(weather.current.wind_speed_10m)}`);
  console.log(`Precipitación: ${formatPrecipitation(weather.current.precipitation)}`);
  console.log(`Condición: ${getWeatherDescription(weather.current.weather_code)}`);
  console.log('');
};

export const showDailyForecast = (city: City, weather: WeatherResponse): void => {
  console.log('');
  console.log(colorize('cyan', `=== PRONÓSTICO - ${city.name.toUpperCase()} (5 DÍAS) ===`));
  console.log('');

  const daily = weather.daily;
  if (daily.time.length === 0) {
    showInfo('No hay pronóstico disponible.');
    return;
  }

  for (let i = 0; i < daily.time.length; i++) {
    const date = daily.time[i];
    const maxTemp = daily.temperature_2m_max[i];
    const minTemp = daily.temperature_2m_min[i];
    const code = daily.weather_code[i];
    const precipProb = daily.precipitation_probability_max?.[i];

    if (date === undefined) continue;

    console.log(`${formatDate(date)} (${formatShortDate(date)})`);
    console.log(`  ${getWeatherDescription(code ?? 0)}`);
    console.log(
      `  Máx: ${formatTemperature(maxTemp ?? 0)} | Mín: ${formatTemperature(minTemp ?? 0)}`
    );
    if (precipProb !== null && precipProb !== undefined) {
      console.log(`  Prob. precipitación: ${precipProb}%`);
    }
    console.log('');
  }
};

export const showPrompt = (message: string): void => {
  process.stdout.write(colorize('yellow', `${message}: `));
};

export const clearScreen = (): void => {
  console.clear();
};

export const showGoodbye = (): void => {
  console.log('');
  console.log(colorize('green', '¡Hasta luego!'));
};
