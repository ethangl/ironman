import { FC } from "react";

import { SidebarContent } from "@/components/sidebar";
import { SpotifyHeader } from "../spotify-shell/spotify-header";
import { Tracks } from "../spotify-tracks";
import { useRelease } from "./release-provider";

export const Release: FC = () => {
  const { artistId, data } = useRelease();

  const { artists, name, tracks } = data;
  const artistNames = artists.map((artist) => artist.name).join(", ");

  return (
    <>
      <SpotifyHeader
        href={`/artist/${artistId}`}
        title={name}
        subtitle={artistNames}
      />
      <SidebarContent>
        <Tracks
          title={name}
          description={artistNames}
          // action={<EnqueuePlaylistButton playlist={playlist} />}
          tracks={tracks ?? []}
        />
      </SidebarContent>
    </>
  );
};
