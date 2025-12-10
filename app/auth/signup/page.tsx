import PlansPreview from "@/components/plans-preview"
import SignupForm from "@/components/signup-form"
import { Target } from "lucide-react"

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#0b0f14] flex items-center justify-center px-4 py-12 bg-digital-noise">
      <div className="w-full max-w-5xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-lg bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Target className="w-7 h-7 text-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">MAFS</h1>
            <p className="text-xs text-gray-400">Multi-Agent Fight Simulator</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Auth Form */}
          <SignupForm />

          {/* Plans Preview */}
          <PlansPreview />
        </div>
      </div>
    </div>
  )
}
