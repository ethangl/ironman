import { useMemo, useSyncExternalStore } from "react";

const URL_CHANGE_EVENT = "app:url-change";

function getSearchSnapshot() {
  if (typeof window === "undefined") return "";
  return window.location.search;
}

function subscribeToUrlChanges(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("popstate", onStoreChange);
  window.addEventListener(URL_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("popstate", onStoreChange);
    window.removeEventListener(URL_CHANGE_EVENT, onStoreChange);
  };
}

export function replaceBrowserUrl(url: string) {
  if (typeof window === "undefined") return;

  window.history.replaceState(window.history.state, "", url);
  window.dispatchEvent(new Event(URL_CHANGE_EVENT));
}

export function useBrowserSearchParams() {
  const search = useSyncExternalStore(
    subscribeToUrlChanges,
    getSearchSnapshot,
    () => "",
  );

  return useMemo(() => new URLSearchParams(search), [search]);
}
