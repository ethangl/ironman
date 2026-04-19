export class MusicBrainzApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "MusicBrainzApiError";
    this.status = status;
  }
}
