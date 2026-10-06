import { afterEach, describe, expect, test } from 'bun:test';
import { captureConsole, getConsoleLines, restoreConsole } from '../helpers/captureConsole';

const { execute } = await import('../../src/actions/configuration');

afterEach(() => {
  restoreConsole();
});

describe('execute (configuration)', () => {
  test('muestra el aviso de configuración por ahora', async () => {
    captureConsole();

    await execute();

    const output = getConsoleLines().join('\n');
    expect(output).toContain('Configuración');
    expect(output).toContain('en desarrollo');
  });
});