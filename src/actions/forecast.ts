import * as citiesStorage from '../storage/citiesStorage';
import * as geocoding from '../api/geocoding';
import * as weatherApi from '../api/weather';
import * as input from '../presentation/input';
import * as output from '../presentation/output';
import type { City } from '../types/City';
import { randomUUID } from 'node:crypto';

export const execute = async (): Promise<void> => {
  try {
    const cities = await citiesStorage.loadCities();
    const defaultCity = cities.find((c) => c.isDefault);

    if (cities.length > 0) {
      console.log('');
      output.showInfo('Ciudades guardadas:');
      cities.forEach((city, index) => {
        const defaultMark = city.isDefault ? ' (POR DEFECTO)' : '';
        console.log(`${index + 1}. ${city.name}${defaultMark}`);
      });
      console.log('0. Buscar nueva ciudad');
      console.log('');

      const selection = await input.askQuestion('Seleccione una opción (Enter para usar por defecto): ');
      if (selection === '' && defaultCity) {
        await showForecastForCity(defaultCity);
        return;
      } else if (selection === '' && !defaultCity) {
        output.showError('No hay ciudad por defecto establecida');
        return;
      } else if (selection === '0') {
        await searchNewCityForecast();
        return;
      }

      const index = parseInt(selection, 10) - 1;
      if (!isNaN(index) && index >= 0 && index < cities.length) {
        const city = cities[index];
        if (city !== undefined) {
          await showForecastForCity(city);
          return;
        }
      }
      output.showError('Selección inválida');
      return;
    } else {
      await searchNewCityForecast();
    }
  } catch (error) {
    output.showError('Ocurrió un error al obtener el pronóstico');
  }
};

const showForecastForCity = async (city: City): Promise<void> => {
  const weather = await weatherApi.getWeather({
    latitude: city.latitude,
    longitude: city.longitude,
  });

  if (!weather) {
    output.showError('No se pudo obtener el pronóstico para esta ciudad');
    return;
  }

  output.showDailyForecast(city, weather);
};

const searchNewCityForecast = async (): Promise<void> => {
  const cityName = await input.askQuestion('Ingrese el nombre de la ciudad: ');
  if (!cityName) {
    output.showError('Debe ingresar un nombre de ciudad');
    return;
  }

  const results = await geocoding.searchCity(cityName);
  if (results.length === 0) {
    output.showError('No se encontraron resultados para esa ciudad');
    return;
  }

  console.log('');
  output.showInfo('Resultados encontrados:');
  results.forEach((result, index) => {
    const location = [result.admin1, result.country].filter(Boolean).join(', ');
    console.log(`${index + 1}. ${result.name}${location ? ` - ${location}` : ''} (${result.latitude.toFixed(4)}, ${result.longitude.toFixed(4)})`);
  });
  console.log('');

  const selection = await input.askQuestion('Seleccione el número de la ciudad: ');
  const index = parseInt(selection, 10) - 1;
  
  if (isNaN(index) || index < 0 || index >= results.length) {
    output.showError('Selección inválida');
    return;
  }

  const selected = results[index];
  if (selected === undefined) {
    output.showError('Selección inválida');
    return;
  }

  const city: City = {
    id: randomUUID(),
    name: selected.name,
    latitude: selected.latitude,
    longitude: selected.longitude,
    country: selected.country,
    admin1: selected.admin1,
    isDefault: false,
  };

  const weather = await weatherApi.getWeather({
    latitude: city.latitude,
    longitude: city.longitude,
  });

  if (!weather) {
    output.showError('No se pudo obtener el pronóstico para esta ciudad');
    return;
  }

  output.showDailyForecast(city, weather);
  
  const save = await input.askConfirmation('¿Desea guardar esta ciudad?');
  if (save) {
    await citiesStorage.addCity(city);
    output.showSuccess('Ciudad guardada correctamente');
  }
};
