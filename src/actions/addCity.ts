import * as citiesStorage from '../storage/citiesStorage';
import * as geocoding from '../api/geocoding';
import * as input from '../presentation/input';
import * as output from '../presentation/output';
import type { City } from '../types/City';
import { randomUUID } from 'node:crypto';

export const execute = async (): Promise<void> => {
  try {
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

    const selection = await input.askQuestion('Seleccione el número de la ciudad (0 para cancelar): ');
    const index = parseInt(selection, 10) - 1;
    
    if (isNaN(index) || index < 0 || index >= results.length) {
      if (selection !== '0') {
        output.showError('Selección inválida');
      }
      return;
    }

    const selected = results[index];
    if (selected === undefined) {
      output.showError('Selección inválida');
      return;
    }

    const existingCity = await citiesStorage.findCityByName(selected.name);
    if (existingCity) {
      output.showError('La ciudad ya está en la lista');
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

    await citiesStorage.addCity(city);
    output.showSuccess(`Ciudad "${city.name}" agregada correctamente`);
  } catch (error) {
    output.showError('Ocurrió un error al agregar la ciudad');
  }
};
