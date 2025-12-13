import { Card, CardContent } from '@/components/ui/card'

function SummaryStrip() {
  return (
    <Card className="mb-8 card-glow">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              <div>
                <div className="text-3xl font-bold text-primary">24.5u</div>
                <div className="text-sm text-muted-foreground">Units risked</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">+42.8%</div>
                <div className="text-sm text-muted-foreground">ROI</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">68.2%</div>
                <div className="text-sm text-muted-foreground">Win rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">+10.5u</div>
                <div className="text-sm text-muted-foreground">Total profit</div>
              </div>
            </div>
          </CardContent>
        </Card>
  )
}

export default SummaryStrip