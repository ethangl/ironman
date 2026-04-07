import { FC, useCallback } from "react";
import { toast } from "sonner";

import {
  useSpotifyActivity,
  Playlist,
  PlaylistTrack,
} from "@/hooks/use-spotify-activity";
import { useWebPlayerActions } from "@/hooks/use-web-player";
import { PlayableTrack } from "@/types";
import { Thumbnail } from "./thumbnail";

function toPlayable(t: PlaylistTrack): PlayableTrack {
  return {
    id: t.id,
    name: t.name,
    artist: t.artist,
    albumImage: t.albumImage,
    durationMs: t.durationMs,
  };
}

export const Playlists: FC = () => {
  const { playlists, getPlaylistTracks } = useSpotifyActivity();
  const { playTracks } = useWebPlayerActions();

  const handlePlay = useCallback(
    async (playlist: Playlist) => {
      try {
        const tracks = playlist.tracks ?? (await getPlaylistTracks(playlist.id));
        if (tracks.length === 0) {
          toast.error("That playlist does not have any playable tracks.");
          return;
        }
        playTracks(tracks.map(toPlayable));
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Could not load that playlist right now.",
        );
      }
    },
    [getPlaylistTracks, playTracks],
  );

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-bold">Playlists</h3>
      <div className="max-w-full -mb-8 overflow-x-auto pb-8">
        <ol className="flex gap-2">
          {playlists.map((playlist) => (
            <li key={playlist.id}>
              <Thumbnail
                description={`${playlist.trackCount} songs`}
                name={playlist.name}
                onPlay={() => void handlePlay(playlist)}
                src={playlist.image}
              />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};
