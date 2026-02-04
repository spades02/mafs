import Logo from "@/components/shared/logo"
import SignupForm from "@/components/signup-form"
import { Target } from "lucide-react"

export default function SignupPage() {
  return (
    <div className="h-auto premium-bg overflow-hidden neural-bg font-sans selection:bg-primary/30 relative flex items-center justify-center px-4">
      <div className="hero-orb opacity-50 scale-75" />
      <div className="scanlines" />

      {/* Particles */}
      <div className="particle" style={{ left: "10%", animationDelay: "0s" }} />
      <div className="particle" style={{ left: "80%", animationDelay: "2s" }} />

      <div className="w-full max-w-md text-primary relative z-10 m-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="pt-4 w-14 h-14 rounded-lg bg-primary/20 flex items-center justify-center shadow-[0_0_20px_rgba(100,255,218,0.3)] glass-glow">
            <Logo height={150} width={150} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">MAFS</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Multi-Agent Fight Simulator</p>
          </div>
        </div>

        {/* Auth Form */}
        <div className="w-full">
          <SignupForm />
        </div>
      </div>
    </div>
  )
}
