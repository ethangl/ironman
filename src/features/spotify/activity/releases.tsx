import { FC, useCallback } from "react";

import { List, ListItem } from "@/components/list";
import { Section, SectionContent, SectionHeader } from "@/components/section";
import { spotifyArtistsClient } from "@/features/spotify/client";
import type { SpotifyAlbumRelease, Track } from "@/types";
import { PlaylistCell } from "./playlist-cell";
import { usePlayableTrackCollection } from "./use-playable-track-collection";

function formatReleaseDate(value: string | null) {
  if (!value) return "Unknown release date";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: value.length > 4 ? "short" : undefined,
    day: value.length > 7 ? "numeric" : undefined,
  });
}

function formatReleaseMeta(release: SpotifyAlbumRelease) {
  return [
    formatReleaseDate(release.releaseDate),
    `${release.totalTracks} tracks`,
  ].join(" • ");
}

export type ReleasesProps = {
  releases: SpotifyAlbumRelease[];
  title: string;
};

export const Releases: FC<ReleasesProps> = ({ releases, title }) => {
  const loadTracks = useCallback(
    async (release: SpotifyAlbumRelease): Promise<Track[]> => {
      return spotifyArtistsClient.getAlbumTracks(release.id);
    },
    [],
  );
  const { getCachedTracks, loadingItemId, playItem } =
    usePlayableTrackCollection<SpotifyAlbumRelease>({
      emptyMessage: "That release does not have any playable tracks.",
      fallbackErrorMessage: "Could not load that release right now.",
      loadTracks,
    });

  if (releases.length === 0) {
    return null;
  }

  return (
    <Section>
      <SectionHeader>{title}</SectionHeader>
      <SectionContent>
        <List count={releases.length}>
          {releases.map((release, i) => (
            <ListItem key={release.id}>
              <PlaylistCell
                count={i + 1}
                disabled={loadingItemId === release.id}
                image={release.image}
                name={release.name}
                subtitle={formatReleaseMeta(release)}
                tracks={getCachedTracks(release.id)}
                onPlay={() => void playItem(release)}
              />
            </ListItem>
          ))}
        </List>
      </SectionContent>
    </Section>
  );
};
