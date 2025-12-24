import React from 'react'
import { Card, CardContent } from './ui/card'
import { Skeleton } from './ui/skeleton'
import { FightEdgeSummary } from '@/types/fight-edge-summary'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion'
import { TrendingUp } from 'lucide-react'
import { CiWarning } from "react-icons/ci";
import LogoWithoutGlow from './shared/logo-without-glow'

function BestBets({fightData}: {fightData: FightEdgeSummary[]}) {
  return (
    <div className="mb-8">
      <h2 className="mb-4 text-2xl font-bold flex"><LogoWithoutGlow size={8}/>Best Bets on This Card</h2>
      <div className="grid gap-4 md:grid-cols-3">
      {(!fightData || fightData.length === 0) && (
  <>
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex flex-col space-y-3">
        <Skeleton className="h-[125px] w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    ))}
  </>
)}
{/* if some fight has zero ev, it will not be displayed */}
        {fightData
          .filter((bet) => bet.ev !== 0)
          .sort((a, b) => b.ev - a.ev)
          .map((bet, index) => (
            <Card key={index} className="card-glow">
              <CardContent className="p-6">
                <div className="mb-2 text-xs font-semibold text-primary">{index === 0 ? `#${index + 1} Highest EV` : `#${index + 1}`}</div>
                <div className="mb-3 text-2xl font-bold">{bet.bet}</div>
                <div className="mb-2 flex items-center gap-4">
                  <span className={`text-3xl text-glow font-bold ${index === 0 ? "text-[#00DF8F]" : "text-[#05EA78]"}`}>{bet.ev}%</span>
                <div className="inline-flex rounded-full bg-primary/40 border-[#245A54] border px-3 py-1 text-xs font-medium text-foreground">
                  {bet.tier}
                </div>
                </div>
                <div className='justify-between flex'>
                  <span className="text-sm text-muted-foreground">Confidence</span>
                  <span className="text-sm text-foreground font-bold">{bet.confidence}%</span>  
                </div>
                <div className='border-y-2 border-primary/5 py-4 mt-6'/>
                <Accordion type="single" collapsible>
                  <AccordionItem value="item-1">
                    <AccordionTrigger>
                    <span className='flex place-content-center'><LogoWithoutGlow size={5}/>
                      Why MAFS Likes This Bet</span>
                    </AccordionTrigger>
                    <AccordionContent className='text-xs text-primary flex flex-col gap-8'>
                      <div>
                      <h1 className='font-bold flex gap-1'><TrendingUp className='size-4' />MARKET INEFFICIENCY DETECTED</h1>
                      <span className='text-primary/80'>
                      <ul>{bet.rationale.sections.marketInefficiencyDetected
                      .map((item,index) => (
                          <li className= "mb-0.5"  key={index}>• {item}</li>
                        ))
                        }</ul></span>
                      </div>
                      <div className='border border-primary/5'/>
                      <div>
                        <h1 className='font-bold text-foreground/80 mb-1'>MATCHUP DRIVERS</h1>
                      <ul>{bet.rationale.sections.matchupDrivers.map((item,index) => (
                          <li className= "mb-0.5"  key={index}>• {item}</li>
                        ))
                        }</ul>
                      </div>
                      <div className='border border-primary/5'/>
                      <div>
                        <h1 className='font-bold text-foreground/80 mb-1'>DATA SIGNALS ALIGNED</h1>
                      <ul>{bet.rationale.sections.dataSignalsAligned.map((item,index) => (
                          <li className= "mb-0.5"  key={index}>• {item}</li>
                        ))
                        }</ul>
                      </div>
                      <div className='border border-primary/5'/>
                      <div>
                        <h1 className='font-bold text-warning flex gap-1.5'><CiWarning className='size-4' />RISK FACTORS</h1>
                      <ul>{bet.rationale.sections.riskFactors
                        .map((item,index) => (
                          <li className= "mb-0.5"  key={index}>• {item}</li>
                        ))
                        }</ul>
                      </div>
                      <div className='border border-primary/5'/>
                      <div>
                        <h1 className='font-bold text-foreground/80 mb-1'>WHY THIS LINE (NOT OTHERS)</h1>
                      <ul>{bet.rationale.sections.whyThisLineNotOthers.map((item, index) => (
                        <li className= "mb-0.5"  key={index}>• {item}</li>
                      ))}</ul>
                      </div>
                      <div className='border border-primary/5'/>
                      <Card>
                        <CardContent>
                          {bet.rationale.summary}
                        </CardContent>
                      </Card>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          ))
        }
      </div>
    </div>
  )
}

export default BestBets