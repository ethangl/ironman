import { useQuery } from "convex/react";
import { useRef } from "react";

// Adapted from convex-helpers:
// https://github.com/get-convex/convex-helpers/blob/main/src/hooks/useStableQuery.ts
export const useStableQuery = ((query, ...args) => {
  const result = useQuery(query, ...args);
  const stored = useRef(result);

  if (result !== undefined) {
    stored.current = result;
  }

  return stored.current;
}) as typeof useQuery;
