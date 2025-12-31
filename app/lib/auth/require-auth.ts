import "server-only";

import { auth } from "./auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function requireAuth() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/login");
  }

  return session;
}
