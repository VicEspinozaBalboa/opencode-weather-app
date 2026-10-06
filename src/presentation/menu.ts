import * as input from './input';
import * as output from './output';
import { execute as getWeather } from '../actions/getWeather';
import { execute as addCity } from '../actions/addCity';
import { execute as removeCity } from '../actions/removeCity';
import { execute as setDefaultCity } from '../actions/setDefaultCity';
import { execute as listCities } from '../actions/listCities';
import { execute as forecast } from '../actions/forecast';
import { execute as configuration } from '../actions/configuration';
import { execute as exportData } from '../actions/exportData';

export const startMenu = async (): Promise<void> => {
  let running = true;

  while (running) {
    output.showMenu();
    const option = await input.askQuestion('Seleccione una opción: ');

    switch (option) {
      case '1':
        await getWeather();
        await pause();
        break;
      case '2':
        await addCity();
        await pause();
        break;
      case '3':
        await removeCity();
        await pause();
        break;
      case '4':
        await setDefaultCity();
        await pause();
        break;
      case '5':
        await listCities();
        await pause();
        break;
      case '6':
        await forecast();
        await pause();
        break;
      case '7':
        await configuration();
        await pause();
        break;
      case '8':
        await exportData();
        await pause();
        break;
      case '9':
        running = false;
        output.showGoodbye();
        break;
      default:
        output.showError('Opción inválida. Por favor, seleccione una opción del 1 al 9.');
        await pause();
        break;
    }
  }
};

const pause = async (): Promise<void> => {
  console.log('');
  await input.askQuestion('Presione Enter para continuar...');
};
