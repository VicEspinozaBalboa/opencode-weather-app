import { afterEach, describe, expect, test } from 'bun:test';
import { captureConsole, getConsoleLines, restoreConsole } from '../helpers/captureConsole';
import {
  showBanner,
  showWelcome,
  showMenu,
  showError,
  showSuccess,
  showInfo,
  showWarning,
  showCitiesList,
  showWeather,
  showDailyForecast,
  showGoodbye,
} from '../../src/presentation/output';
import type { City } from '../../src/types/City';
import type { WeatherResponse } from '../../src/types/Weather';

afterEach(() => {
  restoreConsole();
});

const capture = () => {
  captureConsole();
};

const laPaz: City = {
  id: 'city-1',
  name: 'La Paz',
  latitude: -16.5,
  longitude: -68.15,
  country: 'Bolivia',
  admin1: 'Departamento de La Paz',
  isDefault: true,
};

const weatherFixture: WeatherResponse = {
  latitude: -16.5,
  longitude: -68.15,
  generationtime_ms: 0.5,
  utc_offset_seconds: 0,
  timezone: 'GMT',
  timezone_abbreviation: 'GMT',
  elevation: 3600,
  current: {
    time: '2026-10-06T09:30:00Z',
    temperature: 12.5,
    relative_humidity_2m: 58,
    apparent_temperature: 11.2,
    precipitation: 0,
    weather_code: 0,
    wind_speed_10m: 14.2,
    wind_direction_10m: 240,
    surface_pressure: 650,
  },
  daily: {
    time: ['2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09', '2026-10-10'],
    weather_code: [0, 1, 2, 3, 61],
    temperature_2m_max: [16, 17, 18, 19, 15],
    temperature_2m_min: [6, 7, 8, 9, 5],
    precipitation_probability_max: [20, 30, 40, 50, 60],
    precipitation_sum: [0, 0, 1, 2, 3],
    wind_speed_10m_max: [18, 19, 20, 21, 22],
    sunrise: ['06:00', '06:01', '06:02', '06:03', '06:04'],
    sunset: ['18:30', '18:31', '18:32', '18:33', '18:34'],
  },
  hourly: {
    time: ['2026-10-06T00:00:00Z'],
    temperature_2m: [8],
    relative_humidity_2m: [60],
    precipitation_probability: [10],
    weather_code: [0],
    wind_speed_10m: [12],
  },
};

describe('mensajes simples', () => {
  test('showBanner muestra el banner', () => {
    capture();
    showBanner();
    expect(getConsoleLines().join('\n')).toContain('CLI del Clima - OpenMeteo');
  });

  test('showWelcome muestra el saludo', () => {
    capture();
    showWelcome();
    expect(getConsoleLines().join('\n')).toContain('¡Bienvenido al CLI del Clima!');
  });

  test('showMenu incluye las nueve opciones', () => {
    capture();
    showMenu();
    const output = getConsoleLines().join('\n');
    expect(output).toContain('=== MENÚ PRINCIPAL ===');
    for (let i = 1; i <= 9; i++) {
      expect(output).toContain(`${i}.`);
    }
    expect(output).toContain('Salir');
  });

  test('showError muestra mensaje de error', () => {
    capture();
    showError('algo falló');
    expect(getConsoleLines().join('\n')).toContain('❌ Error: algo falló');
  });

  test('showSuccess muestra confirmación', () => {
    capture();
    showSuccess('guardado');
    expect(getConsoleLines().join('\n')).toContain('✅ guardado');
  });

  test('showInfo muestra información', () => {
    capture();
    showInfo('detalle');
    expect(getConsoleLines().join('\n')).toContain('detalle');
  });

  test('showWarning muestra advertencia', () => {
    capture();
    showWarning('cuidado');
    expect(getConsoleLines().join('\n')).toContain('⚠️  cuidado');
  });

  test('showGoodbye se despide', () => {
    capture();
    showGoodbye();
    expect(getConsoleLines().join('\n')).toContain('¡Hasta luego!');
  });
});

describe('showCitiesList', () => {
  test('muestra aviso cuando no hay ciudades', () => {
    capture();
    showCitiesList([]);
    expect(getConsoleLines().join('\n')).toContain('No hay ciudades guardadas.');
  });

  test('muestra las ciudades con su información', () => {
    capture();
    showCitiesList([laPaz]);
    const output = getConsoleLines().join('\n');
    expect(output).toContain('=== CIUDADES GUARDADAS ===');
    expect(output).toContain('La Paz');
    expect(output).toContain('[POR DEFECTO]');
    expect(output).toContain('País: Bolivia');
    expect(output).toContain('Región: Departamento de La Paz');
    expect(output).toContain('ID: city-1');
  });
});

describe('showWeather', () => {
  test('muestra el clima actual de la ciudad', () => {
    capture();
    showWeather(laPaz, weatherFixture);
    const output = getConsoleLines().join('\n');
    expect(output).toContain('=== CLIMA ACTUAL - LA PAZ ===');
    expect(output).toContain('Temperatura: 12.5 °C');
    expect(output).toContain('Sensación térmica: 11.2 °C');
    expect(output).toContain('Humedad: 58 %');
    expect(output).toContain('Presión: 650 hPa');
    expect(output).toContain('Viento: 14.2 km/h');
    expect(output).toContain('Precipitación: 0 mm');
    expect(output).toContain('Condición: Cielo despejado');
  });
});

describe('showDailyForecast', () => {
  test('muestra el encabezado y las temperaturas por día', () => {
    capture();
    showDailyForecast(laPaz, weatherFixture);
    const output = getConsoleLines().join('\n');
    expect(output).toContain('=== PRONÓSTICO - LA PAZ (5 DÍAS) ===');
    expect(output).toContain('Máx: 16 °C | Mín: 6 °C');
  });

  test('muestra aviso cuando no hay días de pronóstico', () => {
    const emptyForecast: WeatherResponse = {
      ...weatherFixture,
      daily: { ...weatherFixture.daily, time: [] },
    };
    capture();
    showDailyForecast(laPaz, emptyForecast);
    expect(getConsoleLines().join('\n')).toContain('No hay pronóstico disponible.');
  });
});