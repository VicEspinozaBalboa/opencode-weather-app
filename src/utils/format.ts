const WMO_CODE_TO_ES: Record<number, string> = {
  0: 'Cielo despejado',
  1: 'Mayormente despejado',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Niebla',
  48: 'Niebla con escarcha',
  51: 'Lluvia ligera',
  53: 'Lluvia moderada',
  55: 'Lluvia intensa',
  56: 'Lluvia helada ligera',
  57: 'Lluvia helada intensa',
  61: 'Lluvia ligera',
  63: 'Lluvia moderada',
  65: 'Lluvia intensa',
  66: 'Lluvia helada ligera',
  67: 'Lluvia helada intensa',
  71: 'Nieve ligera',
  73: 'Nieve moderada',
  75: 'Nieve intensa',
  77: 'Granos de nieve',
  80: 'Chubascos ligeros',
  81: 'Chubascos moderados',
  82: 'Chubascos intensos',
  85: 'Chubascos de nieve ligeros',
  86: 'Chubascos de nieve intensos',
  95: 'Tormenta',
  96: 'Tormenta con granizo ligero',
  99: 'Tormenta con granizo intenso',
};

export const formatTemperature = (temp: number): string => {
  return `${Math.round(temp * 10) / 10} °C`;
};

export const formatHumidity = (humidity: number): string => {
  return `${humidity} %`;
};

export const formatWindSpeed = (speed: number): string => {
  return `${Math.round(speed * 10) / 10} km/h`;
};

export const formatPressure = (pressure: number): string => {
  return `${Math.round(pressure)} hPa`;
};

export const formatPrecipitation = (precip: number): string => {
  return `${Math.round(precip * 10) / 10} mm`;
};

export const getWeatherDescription = (code: number): string => {
  return WMO_CODE_TO_ES[code] ?? 'Condición desconocida';
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatShortDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
  });
};
