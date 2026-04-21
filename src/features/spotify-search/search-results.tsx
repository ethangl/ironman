import { EnqueueTrackButton } from "../rooms/ui/enqueue-track-button";
import { Artists } from "../artist";
import { Playlists } from "../spotify-playlists";
import { Tracks } from "../spotify-tracks";
import { useSearch } from "./search-provider";

export function SearchResults() {
  const { query, results, error } = useSearch();

  const trimmedQuery = query.trim();

  if (!trimmedQuery) return null;

  if (error) {
    return <p className="mt-3 text-sm text-red-300/90">{error}</p>;
  }

  return (
    <>
      <Tracks
        title={`Songs matching "${trimmedQuery}"`}
        tracks={results.tracks}
        renderTrackAction={(track) => <EnqueueTrackButton track={track} />}
      />
      <Playlists
        title={`Playlists matching "${trimmedQuery}"`}
        playlists={results.playlists}
      />
      <Artists
        title={`Artists matching "${trimmedQuery}"`}
        artists={results.artists}
      />
    </>
  );
}
