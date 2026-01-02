export const dynamic = 'force-dynamic';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import NavBar from "@/components/nav-bar";
import NextTopLoader from 'nextjs-toploader';

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

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="bg-background text-foreground min-h-screen">
        {/* Navbar is fine here; it can include client components internally */}
        {/* {!session && <GuestNavbar/>}
        {session && <NavBar/>} */}
          <NavBar />
        <main>
        <NextTopLoader 
          color="#2299DD" 
          initialPosition={0.08} 
          crawlSpeed={200} 
          height={3} 
          showSpinner={false} 
        />
        {children}
        </main>
        {/* Toaster can also be a client component inside */}
        <Toaster />
      </body>
    </html>
  );
}