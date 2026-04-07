import { FC, useCallback } from "react";

import { useSpotifyActivity, Playlist } from "@/hooks/use-spotify-activity";
import { useWebPlayerActions } from "@/hooks/use-web-player";
import { PlayableTrack } from "@/types";
import { Thumbnail } from "./thumbnail";

function toPlayable(t: Playlist["tracks"][number]): PlayableTrack {
  return {
    id: t.id,
    name: t.name,
    artist: t.artist,
    albumImage: t.albumImage,
    durationMs: t.durationMs,
  };
}

export const Playlists: FC = () => {
  const { playlists } = useSpotifyActivity();
  const { playTracks } = useWebPlayerActions();

  const handlePlay = useCallback(
    (playlist: Playlist) => {
      if (playlist.tracks.length === 0) return;
      playTracks(playlist.tracks.map(toPlayable));
    },
    [playTracks],
  );

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-bold">Playlists</h3>
      <div className="max-w-full -mb-8 overflow-x-auto pb-8">
        <ol className="flex gap-2">
          {playlists.map((playlist) => (
            <li key={playlist.id}>
              <Thumbnail
                description={`${playlist.trackCount} songs`}
                name={playlist.name}
                onPlay={() => handlePlay(playlist)}
                src={playlist.image}
              />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};
