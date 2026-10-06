import * as citiesStorage from '../storage/citiesStorage';
import * as output from '../presentation/output';

export const execute = async (): Promise<void> => {
  const cities = await citiesStorage.loadCities();
  output.showCitiesList(cities);
};
