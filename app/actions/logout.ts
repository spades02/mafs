'use server'

import { revalidatePath } from 'next/cache';
import { auth } from '@/app/lib/auth/auth';
import { headers } from 'next/headers';

export async function logoutAction() {
  const nextHeaders = await headers();
  const authHeaders = new Headers(nextHeaders);
  await auth.api.signOut({
    headers: authHeaders
  });
  
  // revalidatePath('/', 'layout'); // revalidate all pages
  return { success: true }
}