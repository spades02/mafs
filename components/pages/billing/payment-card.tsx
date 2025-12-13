import { Button } from '../../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'

function PaymentCard() {
  return (
    <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Card number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium">Expiry</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">CVC</label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Country</label>
                  <input
                    type="text"
                    placeholder="United States"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Save Payment Method</Button>
            </div>
          </CardContent>
        </Card>
  )
}

export default PaymentCard