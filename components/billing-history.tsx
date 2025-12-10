import { Download } from "lucide-react"
import { Button } from "./ui/button"

const BillingHistory = () => {
  return (
    <div className="bg-linear-to-br from-[#0f1419] to-[#0b0f14] border border-foreground/10 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-foreground mb-6">Billing History</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-foreground/10">
                  <th className="text-left py-3 text-sm font-medium text-gray-400">Date</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-400">Plan</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-400">Amount</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-400">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { date: "Dec 1, 2024", plan: "Pro", amount: "$49.00", status: "Paid" },
                  { date: "Nov 1, 2024", plan: "Pro", amount: "$49.00", status: "Paid" },
                  { date: "Oct 1, 2024", plan: "Pro", amount: "$49.00", status: "Paid" },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-foreground/5">
                    <td className="py-4 text-sm text-gray-300">{row.date}</td>
                    <td className="py-4 text-sm text-gray-300">{row.plan}</td>
                    <td className="py-4 text-sm text-foreground font-medium">{row.amount}</td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                        {row.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                        <Download className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
)
}

export default BillingHistory