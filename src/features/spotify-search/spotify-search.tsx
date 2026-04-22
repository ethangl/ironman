import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { Spinner } from "@/components/ui/spinner";
import { getAuthenticatedSpotifyConvexClient } from "@/features/spotify-client/spotify-convex-client";
import type { SpotifyPlaylist } from "@/features/spotify-client/types";
import { useWebPlayerActions } from "@/features/spotify-player";
import { api } from "@api";
import { SearchIcon } from "lucide-react";
import { useSearch } from "./search-provider";

export function SpotifySearch() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loadingPlaylistId, setLoadingPlaylistId] = useState<string | null>(
    null,
  );
  const { playTrack, playTracks } = useWebPlayerActions();
  const { error, loading, query, results, setQuery } = useSearch();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const trimmedQuery = query.trim();

  const hasResults =
    results.tracks.length > 0 ||
    results.playlists.length > 0 ||
    results.artists.length > 0;

  async function playPlaylist(playlist: SpotifyPlaylist) {
    setLoadingPlaylistId(playlist.id);

    try {
      const client = await getAuthenticatedSpotifyConvexClient();
      const tracks = await client.action(api.spotify.playlistTracks, {
        playlistId: playlist.id,
      });

      if (tracks.length === 0) {
        toast.error("That playlist does not have any playable tracks.");
        return;
      }

      await playTracks(tracks);
      setOpen(false);
    } catch (nextError) {
      toast.error(
        nextError instanceof Error
          ? nextError.message
          : "Could not load playlist tracks.",
      );
    } finally {
      setLoadingPlaylistId((current) =>
        current === playlist.id ? null : current,
      );
    }
  }

  return (
    <>
      <Button variant="ghost" size="icon-sm" onClick={() => setOpen(true)}>
        <SearchIcon />
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="Search Spotify for songs, artists, or playlists..."
          />
          <CommandList className="max-h-[60vh]">
            {loading && (
              <CommandGroup heading="Searching">
                <CommandItem disabled>
                  <Spinner />
                  Searching Spotify...
                </CommandItem>
              </CommandGroup>
            )}

            {error && (
              <CommandGroup heading="Error">
                <CommandItem disabled>{error}</CommandItem>
              </CommandGroup>
            )}

            {!loading && !error && hasResults && (
              <>
                {results.tracks.length > 0 && (
                  <CommandGroup heading="Songs">
                    {results.tracks.map((track) => (
                      <CommandItem
                        key={track.id}
                        value={`${track.name} ${track.artist}`}
                        onSelect={() => {
                          void playTrack(track);
                          setOpen(false);
                        }}
                      >
                        <div className="min-w-0">
                          <p className="truncate">{track.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {track.artist}
                          </p>
                        </div>
                        <CommandShortcut>Play</CommandShortcut>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {results.playlists.length > 0 && (
                  <CommandGroup heading="Playlists">
                    {results.playlists.map((playlist) => {
                      const isLoadingPlaylist =
                        loadingPlaylistId === playlist.id;

                      return (
                        <CommandItem
                          key={playlist.id}
                          value={`${playlist.name} ${playlist.owner ?? ""}`}
                          disabled={isLoadingPlaylist}
                          onSelect={() => void playPlaylist(playlist)}
                        >
                          <div className="min-w-0">
                            <p className="truncate">{playlist.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {playlist.owner
                                ? `${playlist.trackCount} songs by ${playlist.owner}`
                                : `${playlist.trackCount} songs`}
                            </p>
                          </div>
                          <CommandShortcut>
                            {isLoadingPlaylist ? "Loading..." : "Play"}
                          </CommandShortcut>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                )}

                {results.artists.length > 0 && (
                  <CommandGroup heading="Artists">
                    {results.artists.map((artist) => (
                      <CommandItem
                        key={artist.id}
                        value={artist.name}
                        onSelect={() => {
                          navigate(`/artist/${artist.id}`);
                          setOpen(false);
                        }}
                      >
                        <p className="truncate">{artist.name}</p>
                        <CommandShortcut>Open</CommandShortcut>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {!loading && !hasResults && (
                  <CommandEmpty>
                    No Spotify results for "${trimmedQuery}"
                  </CommandEmpty>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
