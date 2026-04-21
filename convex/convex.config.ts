import { defineApp } from "convex/server";

import actionCache from "@convex-dev/action-cache/convex.config";
import betterAuth from "@convex-dev/better-auth/convex.config";
import presence from "@convex-dev/presence/convex.config";
import lastfm from "./components/lastfm/convex.config";
import musicbrainz from "./components/musicbrainz/convex.config";

const app = defineApp();

app.use(actionCache);
app.use(betterAuth);
app.use(presence);
app.use(lastfm);
app.use(musicbrainz);

export default app;
