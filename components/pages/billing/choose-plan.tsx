import React from 'react'
import { Card, CardTitle, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { FoundingMemberCounter } from '@/components/pages/home/founding-member-counter'

interface ChoosePlanProps {
  isGuest?: boolean
}

function ChoosePlan({ isGuest = false }: ChoosePlanProps) {
  return (
    <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto items-stretch">
      {/* Free Plan */}
      <Card className="bg-[#0f1419]/40 border-primary/10 backdrop-blur-sm relative flex flex-col hover:border-primary/20 transition-all duration-300 h-full">
        <CardHeader className="pb-8">
          <CardTitle className="text-xl font-medium text-gray-200">Free</CardTitle>
          <div className="mt-4 flex items-baseline">
            <span className="text-4xl font-bold text-white">$0</span>
            <span className="ml-2 text-muted-foreground">/month</span>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-3">3 Free Premium Picks</p>
          <p className="text-sm text-gray-400 mt-2">Try the real MAFS engine with limited access</p>
        </CardHeader>
        <CardContent className="flex-1">
          <ul className="space-y-4 text-sm">
            <FeatureItem>3 premium AI simulation runs</FeatureItem>
            <FeatureItem>Access to MAFS confidence engine</FeatureItem>
            <FeatureItem>AI-generated fight predictions</FeatureItem>
            <FeatureItem>Limited edge analysis</FeatureItem>
            <FeatureItem disabled>AI Gameplan engine</FeatureItem>
            <FeatureItem disabled>Bankroll optimization</FeatureItem>
          </ul>
        </CardContent>
        <CardFooter>
          {isGuest ? (
            <Button className="w-full bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20" asChild>
              <Link href="/auth/signup">Start Free</Link>
            </Button>
          ) : (
            <Button variant="outline" className="w-full border-primary/20 text-gray-400 bg-transparent" disabled>
              Current Plan
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Pro Plan */}
      <Card className="bg-[#0f1419] border-primary/40 relative flex flex-col shadow-[0_0_40px_-10px_hsl(var(--primary)/0.2)] z-10 h-full border-t-4 border-t-primary">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-black px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-primary/20 flex items-center gap-1">
          <Sparkles className="w-3 h-3 fill-black" /> Most Popular
        </div>

        <CardHeader className="pb-8">
          <CardTitle className="text-xl font-medium text-primary">Pro</CardTitle>
          <p className="text-[10px] uppercase tracking-widest text-primary mt-1">Founding Member Pricing</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-lg text-muted-foreground line-through decoration-muted-foreground/50">$69</span>
            <span className="text-4xl font-bold text-white">$39</span>
            <span className="ml-2 text-muted-foreground">/month</span>
          </div>
          <p className="text-xs font-semibold text-primary mt-2">First 100 Users</p>
          <FoundingMemberCounter className="mt-3" />
          <p className="text-sm text-gray-400 mt-2">Unlimited access to the full MAFS simulation engine</p>
        </CardHeader>
        <CardContent className="flex-1">
          <ul className="space-y-4 text-sm">
            <FeatureItem active>Unlimited simulation runs</FeatureItem>
            <FeatureItem active>Unlimited fight analysis</FeatureItem>
            <FeatureItem active>AI confidence scoring</FeatureItem>
            <FeatureItem active>Edge detection system</FeatureItem>
            <FeatureItem active>Smart ticket recommendations</FeatureItem>
            <FeatureItem active>Simulation history</FeatureItem>
            <FeatureItem active>Saved plays</FeatureItem>
          </ul>
        </CardContent>
        <CardFooter>
          {isGuest ? (
            <Button className="w-full bg-primary text-black font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 py-6 text-lg" asChild>
              <Link href="/auth/signup">Unlock Unlimited</Link>
            </Button>
          ) : (
            <Button className="w-full bg-primary text-black font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 py-6 text-lg">
              Unlock Unlimited
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Elite Plan */}
      <Card className="bg-[#0f1419] border-primary/30 relative flex flex-col shadow-[0_0_40px_-10px_hsl(var(--primary)/0.25)] h-full border-t-4 border-t-primary/70">
        <div className="absolute top-0 right-3 -translate-y-1/2 bg-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-primary/30">
          Most Advanced
        </div>
        <CardHeader className="pb-8">
          <CardTitle className="text-xl font-medium text-primary">Elite</CardTitle>
          <p className="text-[10px] uppercase tracking-widest text-primary mt-1">Founding Member Pricing</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-lg text-muted-foreground line-through decoration-muted-foreground/50">$149</span>
            <span className="text-4xl font-bold text-primary">$99</span>
            <span className="ml-2 text-muted-foreground">/month</span>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-primary/80 mt-3">1,000 Automated Simulations + AI Gameplan Engine</p>
          <p className="text-sm text-gray-400 mt-2">
            MAFS automatically runs 1,000 simulations weekly and builds the highest-EV betting portfolio for you.
          </p>
        </CardHeader>
        <CardContent className="flex-1">
          <ul className="space-y-4 text-sm">
            <FeatureItem active>Automated 1,000 weekly simulations</FeatureItem>
            <FeatureItem active>AI Gameplan portfolio builder</FeatureItem>
            <FeatureItem active>Automated betting intelligence</FeatureItem>
            <FeatureItem active>Top recurring outcome detection</FeatureItem>
            <FeatureItem active>AI-generated betting slips</FeatureItem>
            <FeatureItem active>Bankroll optimization</FeatureItem>
            <FeatureItem active>Kelly-based stake sizing</FeatureItem>
            <FeatureItem active>Portfolio risk balancing</FeatureItem>
          </ul>
        </CardContent>
        <CardFooter>
          {isGuest ? (
            <Button className="w-full bg-primary text-black font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 py-6 text-lg" asChild>
              <Link href="/auth/signup">Activate AI Gameplan</Link>
            </Button>
          ) : (
            <Button className="w-full bg-primary text-black font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 py-6 text-lg" asChild>
              <Link href="/billing?plan=elite">Activate AI Gameplan</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

function FeatureItem({ children, disabled, active }: { children: React.ReactNode, disabled?: boolean, active?: boolean }) {
  return (
    <li className={cn("flex items-center gap-3", disabled && "opacity-50")}>
      <div className={cn(
        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
        active ? "border-primary bg-primary text-black" : "border-gray-600 text-gray-400",
        disabled && "border-gray-700 bg-transparent"
      )}>
        <Check className="h-3 w-3" />
      </div>
      <span className={cn(active ? "text-white font-medium" : "text-gray-300", disabled && "text-gray-500 line-through decoration-gray-600")}>{children}</span>
    </li>
  )
}

export default ChoosePlan
