"use server";

import { auth } from "./auth";
import { redirect } from "next/navigation";

export async function requireGuest() {
  const session = await auth.api.getSession();

  if (session) {
    redirect("/dashboard");
  }
}
