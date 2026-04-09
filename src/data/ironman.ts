export interface PollIronmanInput {
  progressMs: number;
  trackId: string;
  isPlaying: boolean;
}

export interface PollIronmanResult {
  count: number;
}

export interface ReportWeaknessResult {
  broken: boolean;
}
