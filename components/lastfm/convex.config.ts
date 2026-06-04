import { defineComponent } from "convex/server";

import actionCache from "@convex-dev/action-cache/convex.config";

const component = defineComponent("lastfm");

component.use(actionCache);

export default component;
