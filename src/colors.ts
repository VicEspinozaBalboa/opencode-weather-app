const enabled = Boolean(process.stdout.isTTY) && !("NO_COLOR" in process.env);

const RESET = "\x1b[0m";

function wrap(code: string, text: string): string {
  if (!enabled) return text;
  return `\x1b[${code}m${text}${RESET}`;
}

export function cyan(text: string): string {
  return wrap("96", text);
}

export function green(text: string): string {
  return wrap("92", text);
}

export function yellow(text: string): string {
  return wrap("93", text);
}

export function red(text: string): string {
  return wrap("91", text);
}
