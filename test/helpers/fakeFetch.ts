export type FetchCall = {
  url: string;
  init?: RequestInit;
};

const originalFetch = globalThis.fetch;

let calls: FetchCall[] = [];
let handler: (url: string, init?: RequestInit) => Response | Promise<Response> = () => new Response();

export const installFetchMock = (
  nextHandler: (url: string, init?: RequestInit) => Response | Promise<Response>,
): void => {
  calls = [];
  handler = nextHandler;
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;
    calls.push({ url, init });
    return handler(url, init);
  }) as typeof fetch;
};

export const restoreFetchMock = (): void => {
  globalThis.fetch = originalFetch;
  calls = [];
};

export const getFetchCalls = (): FetchCall[] => calls;

export const getLastFetchUrl = (): string | undefined => {
  return calls.at(-1)?.url;
};