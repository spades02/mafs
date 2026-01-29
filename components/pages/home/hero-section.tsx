import Logo from '@/components/shared/logo'
import { Button } from '@/components/ui/button'
import { ArrowRight, DollarSign } from 'lucide-react'

function HeroSection() {
  return (
    <div className="mb-12 text-center hero-glow">
      <Logo height={200} width={200} />
      <h1 className="mb-3 text-4xl font-bold text-balance">Find the truth behind the odds.</h1>
      <p className="mb-4 text-lg text-muted-foreground text-balance">
        MAFS doesn't predict winners — it finds mispriced lines and gives you the most profitable bets.
      </p>
      <div className="flex items-center justify-center gap-2 text-sm text-primary">
        <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
        <span>AI is live — scanning UFC markets for mispriced lines in real time…</span>
      </div>
    </div>
  )
}

export default HeroSection