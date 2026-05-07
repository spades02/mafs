import { auth } from "@/app/lib/auth/auth";
import { headers } from "next/headers";
import GameplanClient from "./gameplan-client";

export default async function GameplanPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const isPro = (session?.user as { isPro?: boolean } | undefined)?.isPro === true;
  const isElite = (session?.user as { isElite?: boolean } | undefined)?.isElite === true;
  const tier = (session?.user as { subscriptionTier?: string } | undefined)?.subscriptionTier ?? "free";

  return <GameplanClient isAuthenticated={!!session} isPro={isPro} isElite={isElite} tier={tier} />;
}
