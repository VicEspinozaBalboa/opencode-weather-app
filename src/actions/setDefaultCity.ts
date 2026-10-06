import * as citiesStorage from '../storage/citiesStorage';
import * as input from '../presentation/input';
import * as output from '../presentation/output';

export const execute = async (): Promise<void> => {
  try {
    const cities = await citiesStorage.loadCities();
    if (cities.length === 0) {
      output.showInfo('No hay ciudades guardadas');
      return;
    }

    output.showCitiesList(cities);
    const selection = await input.askQuestion('Seleccione el número de la ciudad por defecto (0 para quitar): ');
    if (selection === '0') {
      await citiesStorage.clearDefaultCity();
      output.showSuccess('Ciudad por defecto eliminada');
      return;
    }

    const index = parseInt(selection, 10) - 1;
    if (isNaN(index) || index < 0 || index >= cities.length) {
      output.showError('Selección inválida');
      return;
    }

    const city = cities[index];
    if (city === undefined) {
      output.showError('Selección inválida');
      return;
    }

    await citiesStorage.setDefaultCity(city.id);
    output.showSuccess(`Ciudad por defecto establecida: ${city.name}`);
  } catch (error) {
    output.showError('Ocurrió un error al establecer la ciudad por defecto');
  }
};
