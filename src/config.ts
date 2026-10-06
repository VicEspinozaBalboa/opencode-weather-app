import { homedir } from "node:os";
import { join } from "node:path";

export type City = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
};

export type Unit = "celsius" | "fahrenheit";

export type Config = {
  unit: Unit;
  cities: City[];
  defaultCityId: number | null;
};

const CONFIG_PATH = join(homedir(), ".weather-cli.json");

function defaultConfig(): Config {
  return { unit: "celsius", cities: [], defaultCityId: null };
}

export async function loadConfig(): Promise<Config> {
  const file = Bun.file(CONFIG_PATH);
  if (!(await file.exists())) return defaultConfig();
  try {
    const data = (await file.json()) as Partial<Config>;
    return {
      unit: data.unit === "fahrenheit" ? "fahrenheit" : "celsius",
      cities: Array.isArray(data.cities) ? data.cities : [],
      defaultCityId: typeof data.defaultCityId === "number" ? data.defaultCityId : null,
    };
  } catch {
    return defaultConfig();
  }
}

export async function saveConfig(config: Config): Promise<void> {
  await Bun.write(CONFIG_PATH, JSON.stringify(config, null, 2));
}

export function getDefaultCity(config: Config): City | undefined {
  if (config.defaultCityId == null) return undefined;
  return config.cities.find((city) => city.id === config.defaultCityId);
}
