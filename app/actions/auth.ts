'use server'

import { auth } from "@/app/lib/auth/auth";

export async function getSession() {
  return await auth.api.getSession({
    headers: await import('next/headers').then(mod => mod.headers())
  });
}

export async function getUser() {
  const session = await getSession();
  return session?.user ?? null;
}