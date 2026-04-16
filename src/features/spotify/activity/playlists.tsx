import { FC, useCallback } from "react";
import { toast } from "sonner";

import { Section } from "@/components/section";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWebPlayerActions } from "@/features/spotify/player";
import type { Playlist } from "@/types/spotify-activity";
import { Thumbnail } from "./thumbnail";
import { useSpotifyActivity } from "./use-spotify-activity";

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
        playTracks(tracks);
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
    <Section title="Your Playlists" color="--color-emerald-400">
      <ScrollArea>
        <ol className="flex gap-4 p-4 w-max">
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
    </Section>
  );
};
