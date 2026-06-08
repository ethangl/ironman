import { PlusIcon } from "lucide-react";
import { useParams } from "react-router-dom";

import { AlbumArt } from "@/components/album-art";
import { MainContent } from "@/components/main";
import {
  Section,
  SectionContent,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import { Spinner } from "@/components/ui/spinner";
import { useOptionalRooms } from "@/features/rooms";
import type { SpotifyTrack } from "@/features/spotify-client/types";
import { useAppleArtist, type AppleArtistTrack } from "./use-apple-artist";

/** Apple catalog songs carry everything the queue needs; drop a null ISRC. */
function toEnqueueable(song: AppleArtistTrack): SpotifyTrack {
  return {
    id: song.id,
    name: song.name,
    artist: song.artist,
    albumName: song.albumName,
    albumImage: song.albumImage,
    durationMs: song.durationMs,
    ...(song.isrc ? { isrc: song.isrc } : {}),
  };
}

export function AppleArtist() {
  const { artistId = "" } = useParams();
  const state = useAppleArtist(artistId);
  const rooms = useOptionalRooms();
  const activeRoom = rooms?.activeRoom ?? null;
  const enqueueTrack = rooms?.enqueueTrack;
  const canEnqueue = !!activeRoom?.playback.canEnqueue && !!enqueueTrack;

  if (state.status === "loading") {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (state.status === "not_found" || state.status === "error") {
    return (
      <div className="py-32 text-center text-muted-foreground">
        {state.status === "not_found"
          ? "That artist could not be found on Apple Music."
          : "Couldn’t load this artist. Try again."}
      </div>
    );
  }

  const { artist, topSongs } = state.detail;

  return (
    <MainContent>
      <Section>
        <SectionHeader className="flex items-center gap-4">
          <AlbumArt src={artist.image} className="size-16 rounded-full" />
          <SectionTitle>{artist.name}</SectionTitle>
        </SectionHeader>
        <SectionContent className="space-y-1">
          {topSongs.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No top songs available.
            </p>
          ) : (
            topSongs.map((song) => (
              <button
                key={song.id}
                type="button"
                disabled={!canEnqueue}
                onClick={() => {
                  if (!activeRoom?.playback.canEnqueue || !enqueueTrack) {
                    return;
                  }
                  void enqueueTrack(toEnqueueable(song), activeRoom.room._id);
                }}
                className="group flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-white/5 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <AlbumArt src={song.albumImage} className="size-10" />
                <div className="min-w-0 flex-auto space-y-1">
                  <div className="truncate leading-tight">{song.name}</div>
                  <div className="truncate text-xs leading-tight text-muted-foreground">
                    {song.artist}
                  </div>
                </div>
                {canEnqueue ? (
                  <PlusIcon className="size-5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                ) : null}
              </button>
            ))
          )}
        </SectionContent>
      </Section>
    </MainContent>
  );
}
