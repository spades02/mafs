"use client"
import Breadcrumbs from "@/components/breadcrumbs";
import { FightSelector } from "@/components/fight-selector";
import InitialUI from "@/components/initial-ui";

export default function Home() {
  return (
    <main className="container mx-auto px-6 py-12 max-w-[1600px] page-glow-frame rounded-3xl mt-6 mb-6 bg-digital-noise">
      <div className="flex flex-col gap-6">
      {/* Breadcrumbs */}
      <Breadcrumbs />
      {/* Choose fight Card */}
      <FightSelector />
      {/* UI when user has not clicked Run Analysis button */}
      <InitialUI/>
      </div>
    </main>
  );
}
