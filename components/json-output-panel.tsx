import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check } from 'lucide-react'
import { useState } from "react"
import type { Fight } from "@/lib/data/mock-data"

interface JsonOutputPanelProps {
  fight: Fight
}

export function JsonOutputPanel({ fight }: JsonOutputPanelProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(fight, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="p-6 bg-[#0f1419] border-foreground/10 elevation-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">JSON Output</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="gap-2"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy JSON"}
        </Button>
      </div>
      
      <pre className="bg-black/30 p-4 rounded-lg overflow-x-auto text-xs text-gray-300 max-h-[600px] overflow-y-auto">
        {JSON.stringify(fight, null, 2)}
      </pre>
    </Card>
  )
}
