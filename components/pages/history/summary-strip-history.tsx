import { Card, CardContent } from '@/components/ui/card'

function SummaryStripHistory() {
  return (
    <Card className="mb-8 card-glow">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              <div>
                <div className="text-3xl font-bold text-primary">+24.0u</div>
                <div className="text-sm text-muted-foreground">Lifetime profit</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">+36.5%</div>
                <div className="text-sm text-muted-foreground">Lifetime ROI</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">72.4%</div>
                <div className="text-sm text-muted-foreground">Lifetime hit rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">18</div>
                <div className="text-sm text-muted-foreground">Total events</div>
              </div>
            </div>
          </CardContent>
        </Card>
  )
}

export default SummaryStripHistory