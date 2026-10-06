import * as citiesStorage from '../storage/citiesStorage';
import * as input from '../presentation/input';
import * as output from '../presentation/output';

export const execute = async (): Promise<void> => {
  try {
    const cities = await citiesStorage.loadCities();
    if (cities.length === 0) {
      output.showInfo('No hay ciudades para eliminar');
      return;
    }

    output.showCitiesList(cities);
    const selection = await input.askQuestion('Seleccione el número de la ciudad a eliminar (0 para cancelar): ');
    const index = parseInt(selection, 10) - 1;
    
    if (isNaN(index) || index < 0 || index >= cities.length) {
      if (selection !== '0') {
        output.showError('Selección inválida');
      }
      return;
    }

    const city = cities[index];
    if (city === undefined) {
      output.showError('Selección inválida');
      return;
    }

    const confirm = await input.askConfirmation(`¿Está seguro de eliminar "${city.name}"?`);
    if (!confirm) {
      output.showInfo('Operación cancelada');
      return;
    }

    await citiesStorage.removeCity(city.id);
    output.showSuccess(`Ciudad "${city.name}" eliminada correctamente`);
  } catch (error) {
    output.showError('Ocurrió un error al eliminar la ciudad');
  }
};
