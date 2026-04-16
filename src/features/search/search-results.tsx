import { cn } from "@/lib/utils";
import { Artists } from "../spotify/activity/artists";
import { Playlists } from "../spotify/activity/playlists";
import { Tracks } from "../spotify/activity/tracks";
import { useSearch } from "./search-provider";

export function SearchResults() {
  const { query, results, loading, error } = useSearch();

  const trimmedQuery = query.trim();

  const hasResults =
    results.tracks.length > 0 ||
    results.artists.length > 0 ||
    results.playlists.length > 0;

  if (!trimmedQuery) return null;

  if (error) {
    return <p className="mt-3 text-sm text-red-300/90">{error}</p>;
  }

  if (!loading && !hasResults) {
    return (
      <p className="mt-3 text-sm text-muted-foreground">
        No songs, artists, or playlists matched that search.
      </p>
    );
  }

  return (
    <div
      className={cn(
        "duration-555 ease-out flex flex-col gap-3 m-3 starting:opacity-0 transition-discrete z-15",
        // !hasResults && "hidden opacity-0 pointer-events-none",
      )}
    >
      <Tracks
        title={`Songs matching "${trimmedQuery}"`}
        tracks={results.tracks}
      />
      <Playlists
        title={`Playlists matching "${trimmedQuery}"`}
        playlists={results.playlists}
      />
      <Artists
        title={`Artists matching "${trimmedQuery}"`}
        artists={results.artists}
      />
    </div>
  );
}
