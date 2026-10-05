export function jsonRequest(url: string, options: RequestInit = {}): Request {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return new Request(url, { ...options, headers });
}

export function routeContext<T extends Record<string, string>>(params: T) {
  return { params: Promise.resolve(params) };
}

export async function parseJson<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}
