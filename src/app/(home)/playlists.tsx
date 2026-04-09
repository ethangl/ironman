import { FC, useCallback } from "react";
import { toast } from "sonner";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Playlist,
  PlaylistTrack,
  useSpotifyActivity,
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
        const tracks =
          playlist.tracks ?? (await getPlaylistTracks(playlist.id));
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
      <ScrollArea>
        <ol className="flex gap-2 w-max">
          {playlists.map((playlist) => (
            <li key={playlist.id}>
              <Thumbnail
                description={`${playlist.trackCount} songs`}
                handlePlay={() => void handlePlay(playlist)}
                name={playlist.name}
                src={playlist.image}
              />
            </li>
          ))}
        </ol>
      </ScrollArea>
    </section>
  );
};
