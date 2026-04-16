import { FC, useCallback } from "react";

import { List, ListItem } from "@/components/list";
import { Section, SectionProps } from "@/components/section";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Thumbnail } from "@/features/spotify/activity/thumbnail";
import { useSpotifyClient } from "@/features/spotify/client";
import { SpotifyPlaylist, Track } from "@/types";
import { PlaylistCell } from "./playlist-cell";
import { usePlayableTrackCollection } from "./use-playable-track-collection";

export type PlaylistsProps = SectionProps & {
  display?: "list" | "thumbnails";
  playlists: SpotifyPlaylist[];
};

export const Playlists: FC<PlaylistsProps> = ({
  display = "list",
  playlists,
  ...props
}) => {
  const client = useSpotifyClient();
  const loadTracks = useCallback(
    async (playlist: SpotifyPlaylist): Promise<Track[]> => {
      return client.spotifyActivity.getPlaylistTracks(playlist.id);
    },
    [client],
  );
  const { getCachedTracks, loadingItemId, playItem } =
    usePlayableTrackCollection<SpotifyPlaylist>({
      emptyMessage: "That playlist does not have any playable tracks.",
      fallbackErrorMessage: "Could not load playlist tracks.",
      loadTracks,
    });

  return (
    <Section {...props}>
      {display === "list" ? (
        <List count={playlists.length} className="p-4">
          {playlists.map((playlist, i) => (
            <ListItem key={playlist.id}>
              <PlaylistCell
                count={i + 1}
                disabled={loadingItemId === playlist.id}
                image={playlist.image}
                name={playlist.name}
                subtitle={
                  playlist.owner
                    ? `${playlist.trackCount} songs by ${playlist.owner}`
                    : `${playlist.trackCount} songs`
                }
                tracks={getCachedTracks(playlist.id)}
                onPlay={() => void playItem(playlist)}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <ScrollArea>
          <ol className="flex gap-4 p-4 w-max">
            {playlists.map((playlist) => (
              <li key={playlist.id}>
                <Thumbnail
                  description={`${playlist.trackCount} songs`}
                  handlePlay={() => void playItem(playlist)}
                  name={playlist.name}
                  src={playlist.image}
                />
              </li>
            ))}
          </ol>
        </ScrollArea>
      )}
    </Section>
  );
};
