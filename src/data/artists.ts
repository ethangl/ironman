import { requestOptionalJson } from "@/data/http";
import { SpotifyArtistPageData } from "@/types";

export function getArtistPageData(artistId: string) {
  return requestOptionalJson<SpotifyArtistPageData>(
    `/api/artists/${artistId}`,
    undefined,
    { fallbackMessage: "Could not load artist details." },
  );
}
