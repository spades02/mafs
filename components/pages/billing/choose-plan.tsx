import React from 'react'
import { Card, CardTitle, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface ChoosePlanProps {
  isGuest?: boolean
}

function ChoosePlan({ isGuest = false }: ChoosePlanProps) {
  return (
    <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto items-start">
      {/* Free Plan */}
      <Card className="bg-[#0f1419]/40 border-primary/10 backdrop-blur-sm relative flex flex-col hover:border-primary/20 transition-all duration-300 h-full">
        <CardHeader className="pb-8">
          <CardTitle className="text-xl font-medium text-gray-200">Free</CardTitle>
          <div className="mt-4 flex items-baseline">
            <span className="text-4xl font-bold text-white">$0</span>
            <span className="ml-2 text-muted-foreground">/month</span>
          </div>
          <p className="text-sm text-gray-400 mt-2">Perfect for trying out the platform.</p>
        </CardHeader>
        <CardContent className="flex-1">
          <ul className="space-y-4 text-sm">
            <FeatureItem>1 fight analysis per day</FeatureItem>
            <FeatureItem>Basic EV calculations</FeatureItem>
            <FeatureItem>Limited market edges</FeatureItem>
            <FeatureItem disabled>No full card analysis</FeatureItem>
            <FeatureItem disabled>No play tracking</FeatureItem>
          </ul>
        </CardContent>
        <CardFooter>
          {isGuest ? (
            <Button className="w-full bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20" asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          ) : (
            <Button variant="outline" className="w-full border-primary/20 text-gray-400 bg-transparent" disabled>
              Current Plan
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Pro Plan */}
      <Card className="bg-[#0f1419] border-primary/40 relative flex flex-col shadow-[0_0_40px_-10px_hsl(var(--primary)/0.2)] md:scale-110 z-10 h-full border-t-4 border-t-primary">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-black px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-primary/20 flex items-center gap-1">
          <Sparkles className="w-3 h-3 fill-black" /> Most Popular
        </div>

        <CardHeader className="pb-8">
          <CardTitle className="text-xl font-medium text-primary">Pro</CardTitle>
          <div className="mt-4 flex items-baseline">
            <span className="text-4xl font-bold text-white">$79</span>
            <span className="ml-2 text-muted-foreground">/month</span>
          </div>
          <p className="text-sm text-gray-400 mt-2">For serious bettors who want the edge.</p>
        </CardHeader>
        <CardContent className="flex-1">
          <ul className="space-y-4 text-sm">
            <FeatureItem active>Unlimited fight analyses</FeatureItem>
            <FeatureItem active>Full card EV engine & Edges</FeatureItem>
            <FeatureItem active>Auto parlays & combos</FeatureItem>
            <FeatureItem active>Play tracking & history</FeatureItem>
            <FeatureItem active>Priority support</FeatureItem>
            <FeatureItem active>Early access to models</FeatureItem>
          </ul>
        </CardContent>
        <CardFooter>
          {isGuest ? (
            <Button className="w-full bg-primary text-black font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 py-6 text-lg" asChild>
              <Link href="/auth/signup">Get Pro Access</Link>
            </Button>
          ) : (
            <Button className="w-full bg-primary text-black font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 py-6 text-lg">
              Upgrade Now
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