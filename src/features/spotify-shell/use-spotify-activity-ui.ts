import {
  createContext,
  type Dispatch,
  type SetStateAction,
  useContext,
  useMemo,
  useState,
} from "react";

interface SpotifyActivityUiContextValue {
  isExpanded: boolean;
  setIsExpanded: Dispatch<SetStateAction<boolean>>;
}

export const SpotifyActivityUiContext =
  createContext<SpotifyActivityUiContextValue | null>(null);

export function useSpotifyActivityUiState(): SpotifyActivityUiContextValue {
  const [isExpanded, setIsExpanded] = useState(true);

  return useMemo(
    () => ({
      isExpanded,
      setIsExpanded,
    }),
    [isExpanded],
  );
}

export function useSpotifyActivityUi() {
  const ctx = useContext(SpotifyActivityUiContext);
  if (!ctx) {
    throw new Error(
      "useSpotifyActivityUi must be used within SpotifyActivityProvider",
    );
  }

  return ctx;
}
