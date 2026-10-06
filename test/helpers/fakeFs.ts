const files = new Map<string, string>();

const originalFile = Bun.file;
const originalWrite = Bun.write;

class FakeFile {
  readonly name: string;

  constructor(path: string) {
    this.name = path;
  }

  async exists(): Promise<boolean> {
    return files.has(this.name);
  }

  async text(): Promise<string> {
    return files.get(this.name) ?? '';
  }

  async json<T = unknown>(): Promise<T> {
    return JSON.parse(files.get(this.name) ?? 'null') as T;
  }

  get size(): number {
    return files.get(this.name)?.length ?? 0;
  }
}

export const installFakeFileSystem = (): void => {
  files.clear();
  Bun.file = ((path: string) => new FakeFile(path)) as unknown as typeof Bun.file;
  Bun.write = ((path: string, data: string) => {
    files.set(path, data);
    return Promise.resolve();
  }) as unknown as typeof Bun.write;
};

export const restoreFileSystem = (): void => {
  Bun.file = originalFile;
  Bun.write = originalWrite;
};

export const getFakeFile = (path: string): string | undefined => {
  return files.get(path);
};

export const resetFakeFileSystem = (): void => {
  files.clear();
};