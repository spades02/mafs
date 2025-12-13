import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'

function CurrentPlan() {
  return (
    <Card  className="mb-8 card-glow">
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="mb-1 text-2xl font-bold">Free Plan</div>
                <div className="text-muted-foreground">$0 / month • 1 fight per day</div>
              </div>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Upgrade to Pro</Button>
            </div>
          </CardContent>
        </Card>
  )
}

export default CurrentPlan