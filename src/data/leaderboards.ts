import { TrackInfo } from "@/types";

import { requestJson } from "@/data/http";

export interface LeaderboardEntry {
  rank: number;
  id: string;
  userId?: string;
  count: number;
  active: boolean;
  trackId?: string;
  trackName: string;
  trackArtist: string;
  trackImage: string | null;
  trackDuration?: number;
  userName: string | null;
  userImage: string | null;
  startedAt: string;
  isMe?: boolean;
  weaknessCount?: number;
}

export interface TrackLeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  myEntry: LeaderboardEntry | null;
}

export interface IronmenEntry extends TrackInfo {
  rank: number;
  id: string;
  userId: string;
  count: number;
  active: boolean;
  hardcore: boolean;
  userName: string | null;
  userImage: string | null;
  streakScore: number;
  songDifficulty: number;
}

export interface BangerSong extends TrackInfo {
  totalAttempts: number;
  avgCount: number;
  weaknessRate: number;
}

export interface HellscapeSong extends TrackInfo {
  difficulty: number;
  totalAttempts: number;
  avgCount: number;
  weaknessRate: number;
}

export function getGlobalLeaderboard() {
  return requestJson<LeaderboardEntry[]>(
    "/api/leaderboard/global",
    undefined,
    "Could not load leaderboard.",
  );
}

export function getTrackLeaderboard(trackId: string) {
  return requestJson<TrackLeaderboardResponse>(
    `/api/leaderboard/${trackId}`,
    undefined,
    "Could not load leaderboard.",
  );
}

export function getIronmenBoard() {
  return requestJson<IronmenEntry[]>(
    "/api/leaderboard/ironmen",
    undefined,
    "Could not load iron men board.",
  );
}

export function getBangersBoard() {
  return requestJson<BangerSong[]>(
    "/api/leaderboard/bangers",
    undefined,
    "Could not load bangers board.",
  );
}

export function getBrutalityBoard() {
  return requestJson<HellscapeSong[]>(
    "/api/leaderboard/hellscape",
    undefined,
    "Could not load brutality board.",
  );
}
