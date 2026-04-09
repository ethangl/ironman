import {
  createContext,
  ReactNode,
  useContext,
} from "react";

import { getArtistPageData } from "@/data/artists";
import { getFeedItems, type FeedItem } from "@/data/feed";
import {
  activateIronmanHardcore,
  getIronmanStatus,
  pollIronman,
  type PollIronmanInput,
  type PollIronmanResult,
  reportWeakness,
  type ReportWeaknessResult,
  startIronman,
  surrenderIronman,
} from "@/data/ironman";
import {
  getBangersBoard,
  getBrutalityBoard,
  getGlobalLeaderboard,
  getIronmenBoard,
  getTrackLeaderboard,
  type BangerSong,
  type HellscapeSong,
  type IronmenEntry,
  type LeaderboardEntry,
  type TrackLeaderboardResponse,
} from "@/data/leaderboards";
import { getPalette } from "@/data/palette";
import { getProfile, getPublicProfile } from "@/data/profile";
import { searchSpotifyResults, searchTracks } from "@/data/search";
import { getSongStats } from "@/data/songs";
import {
  getPlaylistTracksById,
  getPlaylistsPage,
  getRecentlyPlayedActivity,
  getTopArtistsActivity,
  type ActivityBootstrap,
  type PlaylistsPage,
  type RecentlyPlayedResult,
} from "@/data/spotify-activity";
import type { ProfileData } from "@/frontend/profile/profile-view";
import type { SongStats } from "@/lib/song-stats";
import type { StreakData, TrackInfo } from "@/types";
import type {
  PlaylistTrack,
} from "@/hooks/use-spotify-activity";
import type {
  SpotifyArtistPageData,
  SpotifySearchResults,
  SpotifyTrack,
} from "@/types";

export interface AppDataClient {
  profile: {
    getCurrent: () => Promise<ProfileData | null>;
    getPublic: (userId: string) => Promise<ProfileData | null>;
  };
  songs: {
    getStats: (trackId: string) => Promise<SongStats | null>;
  };
  artists: {
    getPageData: (artistId: string) => Promise<SpotifyArtistPageData | null>;
  };
  feed: {
    getItems: () => Promise<FeedItem[]>;
  };
  ironman: {
    getStatus: () => Promise<StreakData | null>;
    start: (track: TrackInfo & { playbackStarted: boolean }) => Promise<StreakData>;
    activateHardcore: () => Promise<unknown>;
    surrender: () => Promise<unknown>;
    reportWeakness: (
      type: string,
      detail?: string,
    ) => Promise<ReportWeaknessResult | null>;
    poll: (input: PollIronmanInput) => Promise<PollIronmanResult>;
  };
  leaderboards: {
    getGlobal: () => Promise<LeaderboardEntry[]>;
    getTrack: (trackId: string) => Promise<TrackLeaderboardResponse>;
    getIronmen: () => Promise<IronmenEntry[]>;
    getBangers: () => Promise<BangerSong[]>;
    getBrutality: () => Promise<HellscapeSong[]>;
  };
  palette: {
    get: (url: string) => Promise<string[]>;
  };
  search: {
    searchResults: (
      query: string,
      signal?: AbortSignal,
    ) => Promise<SpotifySearchResults>;
    searchTracks: (query: string) => Promise<SpotifyTrack[]>;
  };
  spotifyActivity: {
    getRecentlyPlayed: () => Promise<RecentlyPlayedResult>;
    getPlaylistsPage: (limit?: number, offset?: number) => Promise<PlaylistsPage>;
    getPlaylistTracks: (playlistId: string) => Promise<PlaylistTrack[]>;
    getTopArtists: (limit?: number) => ReturnType<typeof getTopArtistsActivity>;
    loadBootstrap: () => Promise<ActivityBootstrap>;
  };
}

async function loadSpotifyActivityBootstrap(): Promise<ActivityBootstrap> {
  const [recentResult, playlistData, artistData] = await Promise.all([
    getRecentlyPlayedActivity(),
    getPlaylistsPage(),
    getTopArtistsActivity(),
  ]);

  return {
    favoriteArtists: artistData,
    playlists: playlistData.items,
    playlistsTotal: playlistData.total,
    recentTracks: recentResult.items,
  };
}

export const httpAppDataClient: AppDataClient = {
  profile: {
    getCurrent: getProfile,
    getPublic: getPublicProfile,
  },
  songs: {
    getStats: getSongStats,
  },
  artists: {
    getPageData: getArtistPageData,
  },
  feed: {
    getItems: getFeedItems,
  },
  ironman: {
    getStatus: getIronmanStatus,
    start: startIronman,
    activateHardcore: activateIronmanHardcore,
    surrender: surrenderIronman,
    reportWeakness,
    poll: pollIronman,
  },
  leaderboards: {
    getGlobal: getGlobalLeaderboard,
    getTrack: getTrackLeaderboard,
    getIronmen: getIronmenBoard,
    getBangers: getBangersBoard,
    getBrutality: getBrutalityBoard,
  },
  palette: {
    get: getPalette,
  },
  search: {
    searchResults: searchSpotifyResults,
    searchTracks,
  },
  spotifyActivity: {
    getRecentlyPlayed: getRecentlyPlayedActivity,
    getPlaylistsPage,
    getPlaylistTracks: getPlaylistTracksById,
    getTopArtists: getTopArtistsActivity,
    loadBootstrap: loadSpotifyActivityBootstrap,
  },
};

const AppDataClientContext = createContext<AppDataClient>(httpAppDataClient);

export function AppDataClientProvider({
  children,
  client = httpAppDataClient,
}: {
  children: ReactNode;
  client?: AppDataClient;
}) {
  return (
    <AppDataClientContext.Provider value={client}>
      {children}
    </AppDataClientContext.Provider>
  );
}

export function useAppDataClient() {
  return useContext(AppDataClientContext);
}
