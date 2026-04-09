import { defineApp } from "convex/server";

import betterAuth from "@convex-dev/better-auth/convex.config";
import spotify from "./components/spotify/convex.config";

const app = defineApp();

app.use(betterAuth);
app.use(spotify);

export default app;
