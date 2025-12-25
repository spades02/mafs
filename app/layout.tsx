export const dynamic = 'force-dynamic';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import NavBar from "@/components/nav-bar";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { GuestNavbar } from "@/components/guest-navbar";
import { Suspense } from "react";
import { NavAvatarSkeleton } from "@/components/nav-avatar-skeleton";
import NavAvatar from "@/components/nav-avatar";
import { NavBarSkeleton } from "@/components/skeletons/nav-bar-skeleton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MAFS",
  description: "Multi Agent Fight Simulator",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const session = await auth.api.getSession({
    headers: await headers()
  });
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="bg-background text-foreground">
        {/* Navbar is fine here; it can include client components internally */}
        {/* {!session && <GuestNavbar/>}
        {session && <NavBar/>} */}
          <NavBar />
        <main>{children}</main>
        {/* Toaster can also be a client component inside */}
        <Toaster />
      </body>
    </html>
  );
}
NavAvatarSkeleton