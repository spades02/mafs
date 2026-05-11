import { auth } from "@/app/lib/auth/auth";
import { headers } from "next/headers";
import GameplanClient from "./gameplan-client";

function isAdminUserId(userId: string | undefined): boolean {
  if (!userId) return false;
  return (process.env.MAFS_ADMIN_USER_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .includes(userId);
}

export default async function GameplanPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const isPro = (session?.user as { isPro?: boolean } | undefined)?.isPro === true;
  const isElite = (session?.user as { isElite?: boolean } | undefined)?.isElite === true;
  const tier = (session?.user as { subscriptionTier?: string } | undefined)?.subscriptionTier ?? "free";
  const isAdmin = isAdminUserId(session?.user?.id);

  return (
    <GameplanClient
      isAuthenticated={!!session}
      isPro={isPro}
      isElite={isElite}
      tier={tier}
      isAdmin={isAdmin}
    />
  );
}
