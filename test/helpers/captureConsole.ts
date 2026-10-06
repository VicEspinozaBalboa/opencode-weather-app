const originalLog = console.log;

let lines: string[] = [];

export const captureConsole = (): void => {
  lines = [];
  console.log = (...args: unknown[]) => {
    lines.push(args.map(String).join(' '));
  };
};

export const getConsoleLines = (): string[] => lines;

export const restoreConsole = (): void => {
  console.log = originalLog;
  lines = [];
};