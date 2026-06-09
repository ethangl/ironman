import { FC, ReactNode } from "react";

import { List } from "@/components/list";
import { Section, SectionHeader, SectionTitle } from "@/components/section";
import type {
  AlbumRelease,
  Page,
} from "@/features/catalog/types";
import { PlaylistCell } from "@/features/playlists/playlist-cell";

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

function formatReleaseMeta(release: AlbumRelease) {
  return [
    formatReleaseDate(release.releaseDate),
    `${release.totalTracks} tracks`,
  ].join(" • ");
}

export type ReleasesProps = {
  page: Page<AlbumRelease>;
  paginate?: ReactNode;
  title: string;
  /** Link target for a release cell. Defaults to the nested Spotify route. */
  hrefFor?: (release: AlbumRelease) => string;
};

export const Releases: FC<ReleasesProps> = ({
  page,
  paginate,
  title,
  hrefFor = (release) => `release/${release.id}`,
}) => {
  const releases = page.items;

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
      <List count={releases.length}>
        {releases.map((release) => (
          <PlaylistCell
            key={release.id}
            href={hrefFor(release)}
            image={release.image}
            name={release.name}
            subtitle={formatReleaseMeta(release)}
          />
        ))}
        {paginate}
      </List>
    </Section>
  );
};
