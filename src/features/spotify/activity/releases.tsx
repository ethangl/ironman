import { FC, useCallback, useState } from "react";
import { toast } from "sonner";

import { List, ListItem } from "@/components/list";
import { Section, SectionContent, SectionHeader } from "@/components/section";
import { getSpotifyAlbumTracks } from "@/features/artist/spotify-artist-client";
import { useWebPlayerActions } from "@/features/spotify/player";
import type { SpotifyAlbumRelease, Track } from "@/types";
import { PlaylistCell } from "./playlist-cell";

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
  const { playTracks } = useWebPlayerActions();
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  const loadReleaseTracks = useCallback(
    async (release: SpotifyAlbumRelease): Promise<Track[]> => {
      setLoadingItemId(release.id);

      try {
        return await getSpotifyAlbumTracks(release.id);
      } finally {
        setLoadingItemId((current) => (current === release.id ? null : current));
      }
    },
    [],
  );

  const playRelease = useCallback(
    async (release: SpotifyAlbumRelease) => {
      try {
        const tracks = await loadReleaseTracks(release);

        if (tracks.length === 0) {
          toast.error("That release does not have any playable tracks.");
          return;
        }

        await playTracks(tracks);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Could not load that release right now.",
        );
      }
    },
    [loadReleaseTracks, playTracks],
  );

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
                tracks={[]}
                onPlay={() => void playRelease(release)}
              />
            </ListItem>
          ))}
        </List>
      </SectionContent>
    </Section>
  );
};
