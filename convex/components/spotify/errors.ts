export class SpotifyApiError extends Error {
  status: number;
  retryAfterSeconds: number | null;

  constructor(
    status: number,
    message: string,
    retryAfterSeconds?: number | null,
  ) {
    super(message);
    this.name = "SpotifyApiError";
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds ?? null;
  }
}
