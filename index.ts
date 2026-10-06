import { getDefaultCity, loadConfig, saveConfig } from "./src/config";
import type { City, Config, Unit } from "./src/config";
import { fetchWeather, searchCities } from "./src/api";
import { formatWeather, labelCity } from "./src/weather";
import { ask, askNumber, askYesNo } from "./src/prompts";
import { cyan, green, red } from "./src/colors";

const LINE = "═".repeat(40);

function unitSymbol(unit: Unit): string {
  return unit === "celsius" ? "°C" : "°F";
}

function printMenu(config: Config): void {
  console.log(cyan(LINE));
  console.log(cyan("         WEATHER CLI"));
  console.log(cyan(LINE));
  console.log(cyan("  1. Clima de ciudad default"));
  console.log(cyan(`  2. Clima de todas las ciudades (${config.cities.length})`));
  console.log(cyan("  3. Buscar y agregar ciudad"));
  console.log(cyan("  4. Eliminar ciudad"));
  console.log(cyan("  5. Establecer ciudad default"));
  console.log(cyan(`  8. Ajustes (${unitSymbol(config.unit)})`));
  console.log(cyan("  9. Salir"));
  console.log(cyan(LINE));
}

function listCities(cities: City[]): void {
  cities.forEach((city, index) => console.log(green(`    ${index + 1}. ${labelCity(city)}`)));
}

async function showWeatherFor(city: City, unit: Unit): Promise<void> {
  try {
    const weather = await fetchWeather(city, unit);
    console.log(formatWeather(city, weather, unit));
  } catch {
    console.log(red(`  No se pudo obtener el clima de ${labelCity(city)}.`));
  }
}

async function weatherOfDefaultCity(config: Config): Promise<void> {
  const city = getDefaultCity(config);
  if (!city) {
    console.log(red("  No hay ciudad default. Usa la opción 5 para establecer una.") + "\n");
    return;
  }
  await showWeatherFor(city, config.unit);
  console.log("");
}

async function weatherOfAllCities(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    console.log(red("  No hay ciudades registradas. Usa la opción 3 para agregar una.") + "\n");
    return;
  }
  for (const city of config.cities) {
    await showWeatherFor(city, config.unit);
  }
  console.log("");
}

async function searchAndAddCity(config: Config): Promise<void> {
  const name = ask(green("  Nombre de la ciudad: "));
  if (!name) {
    console.log(green("  Búsqueda cancelada.") + "\n");
    return;
  }

  let results: City[];
  try {
    results = await searchCities(name);
  } catch {
    console.log(red("  No se pudo consultar la API de geocoding. Revisa tu conexión.") + "\n");
    return;
  }

  if (results.length === 0) {
    console.log(red(`  No se encontró ninguna ciudad llamada "${name}".`) + "\n");
    return;
  }

  let selected: City | undefined;
  if (results.length === 1) {
    selected = results[0];
  } else {
    console.log(green("  Resultados:"));
    listCities(results);
    const choice = askNumber(green("  Elige una opción: "), 1, results.length);
    selected = results[choice - 1];
  }
  if (!selected) return;

  if (config.cities.some((city) => city.id === selected.id)) {
    console.log(red(`  ${labelCity(selected)} ya está en la lista.`) + "\n");
    return;
  }

  config.cities.push(selected);
  if (config.defaultCityId == null) {
    config.defaultCityId = selected.id;
    console.log(green(`  ${labelCity(selected)} se estableció como ciudad default.`));
  }
  await saveConfig(config);
  console.log(green(`  Ciudad agregada: ${labelCity(selected)}`) + "\n");
}

async function removeCity(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    console.log(red("  No hay ciudades registradas.") + "\n");
    return;
  }
  console.log(green("  Ciudades registradas:"));
  listCities(config.cities);
  const choice = askNumber(
    green("  Ciudad a eliminar (0 para cancelar): "),
    0,
    config.cities.length,
  );
  if (choice === 0) {
    console.log(green("  Cancelado.") + "\n");
    return;
  }
  const city = config.cities[choice - 1];
  if (!city) return;
  if (!askYesNo(green(`  ¿Eliminar ${labelCity(city)}? (s/n): `))) {
    console.log(green("  Cancelado.") + "\n");
    return;
  }
  config.cities.splice(choice - 1, 1);
  if (config.defaultCityId === city.id) {
    config.defaultCityId = null;
    console.log(green("  Se eliminó la ciudad default. Usa la opción 5 para establecer otra."));
  }
  await saveConfig(config);
  console.log(green(`  Ciudad eliminada: ${labelCity(city)}`) + "\n");
}

async function setDefaultCity(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    console.log(red("  No hay ciudades registradas. Usa la opción 3 para agregar una.") + "\n");
    return;
  }
  console.log(green("  Ciudades registradas:"));
  listCities(config.cities);
  const choice = askNumber(
    green("  Ciudad default (0 para cancelar): "),
    0,
    config.cities.length,
  );
  if (choice === 0) {
    console.log(green("  Cancelado.") + "\n");
    return;
  }
  const city = config.cities[choice - 1];
  if (!city) return;
  config.defaultCityId = city.id;
  await saveConfig(config);
  console.log(green(`  Ciudad default: ${labelCity(city)}`) + "\n");
}

async function settingsMenu(config: Config): Promise<void> {
  while (true) {
    console.log(cyan(LINE));
    console.log(cyan("             AJUSTES"));
    console.log(cyan(LINE));
    console.log(cyan(`  Unidad actual: ${unitSymbol(config.unit)}`));
    console.log(cyan("  1. Cambiar unidad (°C / °F)"));
    console.log(cyan("  0. Volver"));
    console.log(cyan(LINE));
    const option = ask(cyan("  Selecciona una opción: "));
    console.log("");
    if (option === "0") return;
    if (option === "1") {
      config.unit = config.unit === "celsius" ? "fahrenheit" : "celsius";
      await saveConfig(config);
      console.log(green(`  Unidad cambiada a ${unitSymbol(config.unit)}.`) + "\n");
      continue;
    }
    console.log(red("  Opción no válida.") + "\n");
  }
}

const config = await loadConfig();

while (true) {
  printMenu(config);
  const option = ask(cyan("  Selecciona una opción: "));
  console.log("");

  switch (option) {
    case "1":
      await weatherOfDefaultCity(config);
      break;
    case "2":
      await weatherOfAllCities(config);
      break;
    case "3":
      await searchAndAddCity(config);
      break;
    case "4":
      await removeCity(config);
      break;
    case "5":
      await setDefaultCity(config);
      break;
    case "8":
      await settingsMenu(config);
      break;
    case "9":
      console.log(green("  ¡Hasta luego!"));
      process.exit(0);
      break;
    default:
      console.log(red("  Opción no válida.") + "\n");
  }
}
