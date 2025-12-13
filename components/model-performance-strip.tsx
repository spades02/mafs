import React from 'react'
import { Card, CardContent } from './ui/card'

function ModelPerformanceStrip() {
  return (
    <Card className="mb-8 card-glow">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              <div>
                <div className="text-3xl font-bold text-primary">+42.8%</div>
                <div className="text-sm text-muted-foreground">ROI (last 90 days)</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">68.2%</div>
                <div className="text-sm text-muted-foreground">Win rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">247</div>
                <div className="text-sm text-muted-foreground">Sample size</div>
              </div>
              <div>
                <div className="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-sm font-medium text-primary">
                  Live, transparent performance
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
  )
}

export default ModelPerformanceStrip