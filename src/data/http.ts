export class HttpError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.data = data;
  }
}

async function parseJsonSafe(response: Response) {
  return response.json().catch(() => null);
}

export function getRouteErrorMessage(data: unknown, fallback: string) {
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    data.error &&
    typeof data.error === "object" &&
    "message" in data.error &&
    typeof data.error.message === "string"
  ) {
    return data.error.message;
  }

  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    typeof data.error === "string"
  ) {
    return data.error;
  }

  return fallback;
}

export async function requestJson<T>(
  input: string,
  init?: RequestInit,
  fallbackMessage = "Request failed.",
): Promise<T> {
  const response = await fetch(input, init);
  const data = await parseJsonSafe(response);

  if (!response.ok) {
    throw new HttpError(
      getRouteErrorMessage(data, fallbackMessage),
      response.status,
      data,
    );
  }

  return data as T;
}

export async function requestOptionalJson<T>(
  input: string,
  init?: RequestInit,
  options?: {
    fallbackMessage?: string;
    notFoundStatuses?: number[];
  },
): Promise<T | null> {
  const response = await fetch(input, init);
  const data = await parseJsonSafe(response);
  const notFoundStatuses = options?.notFoundStatuses ?? [404];

  if (notFoundStatuses.includes(response.status)) {
    return null;
  }

  if (!response.ok) {
    throw new HttpError(
      getRouteErrorMessage(data, options?.fallbackMessage ?? "Request failed."),
      response.status,
      data,
    );
  }

  return data as T;
}
