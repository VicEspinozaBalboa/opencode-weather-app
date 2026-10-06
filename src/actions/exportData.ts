import * as citiesStorage from '../storage/citiesStorage';
import * as input from '../presentation/input';
import * as output from '../presentation/output';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

export const execute = async (): Promise<void> => {
  try {
    const cities = await citiesStorage.loadCities();
    
    if (cities.length === 0) {
      output.showInfo('No hay datos para exportar');
      return;
    }

    const format = await input.askQuestion('Formato de exportación (json/csv) [json]: ');
    const exportFormat = format.toLowerCase() === 'csv' ? 'csv' : 'json';
    const defaultPath = `./data/weather_data.${exportFormat}`;
    const filePath = await input.askQuestionWithDefault('Ruta de exportación', defaultPath);

    await mkdir(dirname(filePath), { recursive: true });

    if (exportFormat === 'json') {
      await Bun.write(filePath, JSON.stringify(cities, null, 2));
    } else {
      const csvHeader = 'id,name,latitude,longitude,country,admin1,isDefault\n';
      const csvContent = cities.map((city) => {
        return `${city.id},"${city.name}",${city.latitude},${city.longitude},${city.country ?? ''},${city.admin1 ?? ''},${city.isDefault ? 'true' : 'false'}`;
      }).join('\n');
      await Bun.write(filePath, csvHeader + csvContent);
    }

    output.showSuccess(`Datos exportados correctamente a: ${filePath}`);
  } catch (error) {
    output.showError('Ocurrió un error al exportar los datos');
  }
};
