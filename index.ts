import { getDefaultCity, loadConfig, saveConfig } from "./src/config";
import type { City, Config, Unit } from "./src/config";
import { fetchWeather, searchCities } from "./src/api";
import { formatWeather, labelCity } from "./src/weather";
import { ask, askNumber, askYesNo } from "./src/prompts";

const LINE = "═".repeat(40);

function unitSymbol(unit: Unit): string {
  return unit === "celsius" ? "°C" : "°F";
}

function printMenu(config: Config): void {
  console.log(LINE);
  console.log("         WEATHER CLI");
  console.log(LINE);
  console.log("  1. Clima de ciudad default");
  console.log(`  2. Clima de todas las ciudades (${config.cities.length})`);
  console.log("  3. Buscar y agregar ciudad");
  console.log("  4. Eliminar ciudad");
  console.log("  5. Establecer ciudad default");
  console.log(`  8. Ajustes (${unitSymbol(config.unit)})`);
  console.log("  9. Salir");
  console.log(LINE);
}

function listCities(cities: City[]): void {
  cities.forEach((city, index) => console.log(`    ${index + 1}. ${labelCity(city)}`));
}

async function showWeatherFor(city: City, unit: Unit): Promise<void> {
  try {
    const weather = await fetchWeather(city, unit);
    console.log(formatWeather(city, weather, unit));
  } catch {
    console.log(`  No se pudo obtener el clima de ${labelCity(city)}.`);
  }
}

async function weatherOfDefaultCity(config: Config): Promise<void> {
  const city = getDefaultCity(config);
  if (!city) {
    console.log("  No hay ciudad default. Usa la opción 5 para establecer una.\n");
    return;
  }
  await showWeatherFor(city, config.unit);
  console.log("");
}

async function weatherOfAllCities(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    console.log("  No hay ciudades registradas. Usa la opción 3 para agregar una.\n");
    return;
  }
  for (const city of config.cities) {
    await showWeatherFor(city, config.unit);
  }
  console.log("");
}

async function searchAndAddCity(config: Config): Promise<void> {
  const name = ask("  Nombre de la ciudad: ");
  if (!name) {
    console.log("  Búsqueda cancelada.\n");
    return;
  }

  let results: City[];
  try {
    results = await searchCities(name);
  } catch {
    console.log("  No se pudo consultar la API de geocoding. Revisa tu conexión.\n");
    return;
  }

  if (results.length === 0) {
    console.log(`  No se encontró ninguna ciudad llamada "${name}".\n`);
    return;
  }

  let selected: City | undefined;
  if (results.length === 1) {
    selected = results[0];
  } else {
    console.log("  Resultados:");
    listCities(results);
    const choice = askNumber("  Elige una opción: ", 1, results.length);
    selected = results[choice - 1];
  }
  if (!selected) return;

  if (config.cities.some((city) => city.id === selected.id)) {
    console.log(`  ${labelCity(selected)} ya está en la lista.\n`);
    return;
  }

  config.cities.push(selected);
  if (config.defaultCityId == null) {
    config.defaultCityId = selected.id;
    console.log(`  ${labelCity(selected)} se estableció como ciudad default.`);
  }
  await saveConfig(config);
  console.log(`  Ciudad agregada: ${labelCity(selected)}\n`);
}

async function removeCity(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    console.log("  No hay ciudades registradas.\n");
    return;
  }
  console.log("  Ciudades registradas:");
  listCities(config.cities);
  const choice = askNumber("  Ciudad a eliminar (0 para cancelar): ", 0, config.cities.length);
  if (choice === 0) {
    console.log("  Cancelado.\n");
    return;
  }
  const city = config.cities[choice - 1];
  if (!city) return;
  if (!askYesNo(`  ¿Eliminar ${labelCity(city)}? (s/n): `)) {
    console.log("  Cancelado.\n");
    return;
  }
  config.cities.splice(choice - 1, 1);
  if (config.defaultCityId === city.id) {
    config.defaultCityId = null;
    console.log("  Se eliminó la ciudad default. Usa la opción 5 para establecer otra.");
  }
  await saveConfig(config);
  console.log(`  Ciudad eliminada: ${labelCity(city)}\n`);
}

async function setDefaultCity(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    console.log("  No hay ciudades registradas. Usa la opción 3 para agregar una.\n");
    return;
  }
  console.log("  Ciudades registradas:");
  listCities(config.cities);
  const choice = askNumber("  Ciudad default (0 para cancelar): ", 0, config.cities.length);
  if (choice === 0) {
    console.log("  Cancelado.\n");
    return;
  }
  const city = config.cities[choice - 1];
  if (!city) return;
  config.defaultCityId = city.id;
  await saveConfig(config);
  console.log(`  Ciudad default: ${labelCity(city)}\n`);
}

async function settingsMenu(config: Config): Promise<void> {
  while (true) {
    console.log(LINE);
    console.log("             AJUSTES");
    console.log(LINE);
    console.log(`  Unidad actual: ${unitSymbol(config.unit)}`);
    console.log("  1. Cambiar unidad (°C / °F)");
    console.log("  0. Volver");
    console.log(LINE);
    const option = ask("  Selecciona una opción: ");
    console.log("");
    if (option === "0") return;
    if (option === "1") {
      config.unit = config.unit === "celsius" ? "fahrenheit" : "celsius";
      await saveConfig(config);
      console.log(`  Unidad cambiada a ${unitSymbol(config.unit)}.\n`);
      continue;
    }
    console.log("  Opción no válida.\n");
  }
}

const config = await loadConfig();

while (true) {
  printMenu(config);
  const option = ask("  Selecciona una opción: ");
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
      console.log("  ¡Hasta luego!");
      process.exit(0);
      break;
    default:
      console.log("  Opción no válida.\n");
  }
}
