import React from 'react'
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

function ChoosePlan() {
  return (
    <div className="mb-8 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <div className="text-3xl font-bold">$0</div>
              <div className="text-sm text-muted-foreground">per month</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>1 fight analysis per day</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Basic EV calculations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Limited market edges</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">No full card analysis</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">No play tracking</span>
                </li>
              </ul>
              <Button variant="outline" className="mt-6 w-full bg-transparent" disabled>
                Current Plan
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary card-glow">
            <CardHeader>
              <div className="mb-2 inline-flex rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">
                Most Popular
              </div>
              <CardTitle>Pro</CardTitle>
              <div className="text-3xl font-bold">$79</div>
              <div className="text-sm text-muted-foreground">per month</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Unlimited fight analyses</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Full card EV engine</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>All market edges</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Auto parlays & combos</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Play tracking & history</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Priority support</span>
                </li>
              </ul>
              <Button className="mt-6 w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Upgrade Now
              </Button>
            </CardContent>
          </Card>
        </div>
  )
}

export default ChoosePlan