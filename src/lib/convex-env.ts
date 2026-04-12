function resolveEnvValue(name: "CONVEX_URL" | "CONVEX_SITE_URL") {
  if (typeof window === "undefined") {
    return process.env[name];
  }

  return import.meta.env[name];
}

export function getConvexUrl(context: string) {
  const url = resolveEnvValue("CONVEX_URL");

  if (!url) {
    throw new Error(`Missing CONVEX_URL for ${context}.`);
  }

  return url;
}

export function getConvexSiteUrl(context: string) {
  const url =
    resolveEnvValue("CONVEX_SITE_URL") ??
    (process.env.NODE_ENV === "test" ? "http://127.0.0.1:3210" : undefined);

  if (!url) {
    throw new Error(`Missing CONVEX_SITE_URL for ${context}.`);
  }

  return url;
}
