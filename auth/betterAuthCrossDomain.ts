import type { BetterAuthPlugin } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { generateRandomString } from "better-auth/crypto";
import { crossDomain as upstreamCrossDomain } from "@convex-dev/better-auth/plugins";

type CrossDomainCallbackContext = {
  context: {
    newSession?: {
      session: {
        token: string;
      };
    } | null;
    internalAdapter: {
      createVerificationValue: (args: {
        value: string;
        identifier: string;
        expiresAt: Date;
      }) => Promise<unknown>;
    };
    responseHeaders?: Headers | null;
    logger: {
      error: (...args: unknown[]) => void;
    };
  };
  redirect: (url: string) => never;
};

export async function handleCrossDomainCallbackRedirect(
  ctx: CrossDomainCallbackContext,
) {
  const session = ctx.context.newSession;
  if (!session) {
    return;
  }

  const token = generateRandomString(32);
  const expiresAt = new Date(Date.now() + 3 * 60 * 1000);
  await ctx.context.internalAdapter.createVerificationValue({
    value: session.session.token,
    identifier: `one-time-token:${token}`,
    expiresAt,
  });
  const redirectTo = ctx.context.responseHeaders?.get("location");
  if (!redirectTo) {
    ctx.context.logger.error("No redirect to found");
    return;
  }
  const url = new URL(redirectTo);
  url.searchParams.set("ott", token);
  throw ctx.redirect(url.toString());
}

export function crossDomain({
  siteUrl,
}: {
  siteUrl: string;
}): BetterAuthPlugin {
  const plugin = upstreamCrossDomain({ siteUrl });
  const afterHooks = plugin.hooks?.after ?? [];

  return {
    ...plugin,
    hooks: {
      ...plugin.hooks,
      after: afterHooks.map((hook, index) => {
        if (index !== 1) {
          return hook;
        }

        return {
          ...hook,
          handler: createAuthMiddleware(async (ctx) => {
            await handleCrossDomainCallbackRedirect(
              ctx as unknown as CrossDomainCallbackContext,
            );
          }),
        };
      }),
    },
  };
}
