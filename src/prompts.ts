import { red } from "./colors";

export function ask(message: string): string {
  const input = prompt(message);
  if (input === null) {
    console.log("\n" + red("  Entrada no disponible. Saliendo."));
    process.exit(0);
  }
  return input.trim();
}

export function askNumber(message: string, min: number, max: number): number {
  while (true) {
    const raw = ask(message);
    const value = Number(raw);
    if (Number.isInteger(value) && value >= min && value <= max) return value;
    console.log(red(`  Ingresa un número entre ${min} y ${max}.`));
  }
}

export function askYesNo(message: string): boolean {
  while (true) {
    const raw = ask(message).toLowerCase();
    if (raw === "s" || raw === "si" || raw === "sí" || raw === "y" || raw === "yes") return true;
    if (raw === "n" || raw === "no") return false;
    console.log(red("  Responde con s (sí) o n (no)."));
  }
}
