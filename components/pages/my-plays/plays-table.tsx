import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function PlaysTable() {
  return (
    <Card>
          <CardHeader>
            <CardTitle>All Plays</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-sm text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Fight</th>
                    <th className="pb-3 pr-4 font-medium">Bet Type</th>
                    <th className="pb-3 pr-4 font-medium">Odds</th>
                    <th className="pb-3 pr-4 font-medium">Stake</th>
                    <th className="pb-3 pr-4 font-medium">EV %</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Result</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    {
                      fight: "Strickland vs Adesanya",
                      betType: "Strickland ML",
                      odds: "+500",
                      stake: "2.5u",
                      ev: "+28.7%",
                      status: "Won",
                      result: "+12.5u",
                      resultPositive: true,
                    },
                    {
                      fight: "Pantoja vs Erceg",
                      betType: "Pantoja ITD",
                      odds: "-150",
                      stake: "3.0u",
                      ev: "+21.3%",
                      status: "Won",
                      result: "+2.0u",
                      resultPositive: true,
                    },
                    {
                      fight: "Makhachev vs Poirier",
                      betType: "Over 2.5 Rounds",
                      odds: "+120",
                      stake: "2.0u",
                      ev: "+18.5%",
                      status: "Pending",
                      result: "—",
                      resultPositive: null,
                    },
                    {
                      fight: "Oliveira vs Chandler",
                      betType: "Oliveira Dec",
                      odds: "+200",
                      stake: "1.5u",
                      ev: "+12.1%",
                      status: "Lost",
                      result: "-1.5u",
                      resultPositive: false,
                    },
                    {
                      fight: "Holloway vs Gaethje",
                      betType: "Holloway ML",
                      odds: "+180",
                      stake: "2.0u",
                      ev: "+15.8%",
                      status: "Won",
                      result: "+3.6u",
                      resultPositive: true,
                    },
                    {
                      fight: "Volkanovski vs Topuria",
                      betType: "Under 4.5 Rounds",
                      odds: "-120",
                      stake: "2.5u",
                      ev: "+9.2%",
                      status: "Won",
                      result: "+2.1u",
                      resultPositive: true,
                    },
                    {
                      fight: "Aspinall vs Blaydes",
                      betType: "Aspinall ITD",
                      odds: "-180",
                      stake: "3.0u",
                      ev: "+13.4%",
                      status: "Won",
                      result: "+1.7u",
                      resultPositive: true,
                    },
                    {
                      fight: "Pereira vs Hill",
                      betType: "Pereira R1 KO",
                      odds: "+350",
                      stake: "1.0u",
                      ev: "+22.1%",
                      status: "Won",
                      result: "+3.5u",
                      resultPositive: true,
                    },
                  ].map((play, index) => (
                    <tr key={index} className="border-b border-border/50">
                      <td className="py-4 pr-4 font-medium">{play.fight}</td>
                      <td className="py-4 pr-4">{play.betType}</td>
                      <td className="py-4 pr-4 font-mono">{play.odds}</td>
                      <td className="py-4 pr-4 font-semibold">{play.stake}</td>
                      <td className="py-4 pr-4 font-semibold text-primary">{play.ev}</td>
                      <td className="py-4 pr-4">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            play.status === "Won"
                              ? "bg-green-500/20 text-green-400"
                              : play.status === "Lost"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {play.status}
                        </span>
                      </td>
                      <td className="py-4 pr-4">
                        {play.resultPositive === null ? (
                          <span className="text-muted-foreground">{play.result}</span>
                        ) : (
                          <span className={`font-bold ${play.resultPositive ? "text-green-400" : "text-red-400"}`}>
                            {play.result}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
  )
}

export default PlaysTable