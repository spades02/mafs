'use server'

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth'; // your auth instance
import { headers } from 'next/headers';

export async function logoutAction() {
  await auth.api.signOut({
    headers: await headers()
  });
  
  revalidatePath('/', 'layout'); // revalidate all pages
  return { success: true }
}