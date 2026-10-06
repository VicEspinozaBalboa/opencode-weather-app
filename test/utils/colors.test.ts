import { describe, expect, test } from 'bun:test';
import { colorize, colors } from '../../src/utils/colors';

describe('colorize', () => {
  test('envuelve el texto con el código ANSI del color', () => {
    expect(colorize('red', 'texto')).toBe(`${colors.red}texto${colors.reset}`);
    expect(colorize('green', 'ok')).toBe(`\x1b[32mok\x1b[0m`);
  });

  test('soporta el color cyan', () => {
    expect(colorize('cyan', 'banner')).toBe(`\x1b[36mbanner\x1b[0m`);
  });

  test('reset cierra el código', () => {
    const result = colorize('yellow', 'x');
    expect(result.endsWith(colors.reset)).toBe(true);
  });
});