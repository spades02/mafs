"use client"

import { useState } from "react"
import NavBar from "@/components/nav-bar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AllMarketEdges from "@/components/all-market-edges"
import FightBreakdown from "@/components/fight-breakdown"
import BestBets from "@/components/best-bets"
import FightTable from "@/components/fight-table"
import EventRunner from "@/components/event-runner"
import AnalysisSection from "@/components/analysis-section"
import ModelPerformanceStrip from "@/components/model-performance-strip"
import HeroSection from "@/components/hero-section"

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <HeroSection/>

        {/* Model Performance Strip */}
        <ModelPerformanceStrip />

        {/* Analysis Section */}
        <AnalysisSection />
        
      </main>
    </div>
  )
}
