import { FC, useCallback } from "react";
import { toast } from "sonner";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Thumbnail } from "@/frontend/home/thumbnail";
import { Playlist, useSpotifyActivity } from "@/hooks/use-spotify-activity";
import { useWebPlayerActions } from "@/hooks/use-web-player";

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
    <section className="space-y-4">
      <h3 className="text-lg font-bold">Playlists</h3>
      <ScrollArea>
        <ol className="flex w-max gap-2">
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
