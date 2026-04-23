import { FC, useCallback, useState } from "react";
import { toast } from "sonner";

import { List, ListItem } from "@/components/list";
import {
  Section,
  SectionContent,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getSpotifyAlbumTracks } from "@/features/artist/spotify-artist-client";
import type {
  SpotifyAlbumRelease,
  SpotifyPage,
  Track,
} from "@/features/spotify-client/types";
import { useWebPlayerActions } from "@/features/spotify-player";
import { PlaylistCell } from "@/features/spotify-playlists/playlist-cell";

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
  page: SpotifyPage<SpotifyAlbumRelease>;
  title: string;
  loadingMore?: boolean;
  onLoadMore?: () => Promise<void>;
};

export const Releases: FC<ReleasesProps> = ({
  page,
  title,
  loadingMore = false,
  onLoadMore,
}) => {
  const { playTracks } = useWebPlayerActions();
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const releases = page.items;

  const loadReleaseTracks = useCallback(
    async (release: SpotifyAlbumRelease): Promise<Track[]> => {
      setLoadingItemId(release.id);

      try {
        return await getSpotifyAlbumTracks(release.id);
      } finally {
        setLoadingItemId((current) =>
          current === release.id ? null : current,
        );
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

  const loadMore = useCallback(async () => {
    if (!onLoadMore) {
      return;
    }

    try {
      await onLoadMore();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not load more releases right now.",
      );
    }
  }, [onLoadMore]);

  if (releases.length === 0) {
    return null;
  }

  return (
    <Section>
      <SectionHeader>
        <SectionTitle>
          <span>{title}</span>
        </SectionTitle>
      </SectionHeader>
      <SectionContent>
        <List count={releases.length}>
          {releases.map((release) => (
            <ListItem key={release.id}>
              <PlaylistCell
                disabled={loadingItemId === release.id}
                image={release.image}
                name={release.name}
                subtitle={formatReleaseMeta(release)}
                tracks={[]}
                onPlay={() => void playRelease(release)}
              />
            </ListItem>
          ))}
          {page.hasMore && onLoadMore && (
            <Button
              variant="secondary"
              size="sm"
              disabled={loadingMore}
              onClick={() => void loadMore()}
              className="w-full rounded-2xl"
            >
              {loadingMore ? (
                <Spinner className="size-3" />
              ) : (
                `Load more ${title}`
              )}
            </Button>
          )}
        </List>
      </SectionContent>
    </Section>
  );
};
