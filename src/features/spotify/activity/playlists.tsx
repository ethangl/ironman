import { FC, useCallback } from "react";

import { List, ListItem } from "@/components/list";
import {
  Section,
  SectionContent,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Thumbnail } from "@/features/spotify/activity/thumbnail";
import { useSpotifyClient } from "@/features/spotify/client";
import { SpotifyPlaylist, Track } from "@/types";
import { PlaylistCell } from "./playlist-cell";
import { usePlayableTrackCollection } from "./use-playable-track-collection";

export type PlaylistsProps = {
  action: React.ReactNode;
  display?: "list" | "thumbnails";
  playlists: SpotifyPlaylist[];
  title: string;
};

export const Playlists: FC<PlaylistsProps> = ({
  action,
  display = "list",
  playlists,
  title,
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
    <Section>
      <SectionHeader>
        <SectionTitle>
          {title}
          {action}
        </SectionTitle>
      </SectionHeader>
      {display === "list" ? (
        <SectionContent>
          <List count={playlists.length}>
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
        </SectionContent>
      ) : (
        <ScrollArea>
          <SectionContent className="flex gap-4 w-max">
            {playlists.map((playlist) => (
              <Thumbnail
                key={playlist.id}
                description={`${playlist.trackCount} songs`}
                handlePlay={() => void playItem(playlist)}
                name={playlist.name}
                src={playlist.image}
              />
            ))}
          </SectionContent>
        </ScrollArea>
      )}
    </Section>
  );
};
