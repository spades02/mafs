import "server-only";

import { auth } from "./auth";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const session = await auth.api.getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
