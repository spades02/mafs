"use client"
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { FightEdgeSummary } from '@/types/fight-edge-summary';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Skeleton } from './ui/skeleton';

type FightTableProps = {
  fightData: FightEdgeSummary[];
  onSelectFight: (id: string) => void;
};

function FightTable({
  fightData,
  onSelectFight,
}: FightTableProps) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Fight Table – Mispriced Fights</CardTitle>
      </CardHeader>
      {(!fightData || fightData.length === 0) && (
          <>
            {[1].map(() => (
              <div className="border rounded-lg">
              <Table className="lg:max-w-lg mx-auto">
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Skeleton className="h-3 w-[300px]" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-3 w-[300px]" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-3 w-[300px]" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-3 w-[300px]" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(7)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-5 w-[300px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-[300px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-[300px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-[300px]" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            ))}
          </>
        )}
        {Array.isArray(fightData) && fightData.length > 0 && (
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
              <tr className="border-b border-border text-left text-sm text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Fight</th>
                <th className="pb-3 pr-4 font-medium">MAFS Score</th>
                <th className="pb-3 pr-4 font-medium">Best Bet</th>
                <th className="pb-3 pr-4 font-medium">EV %</th>
                <th className="pb-3 pr-4 font-medium">Confidence</th>
                <th className="pb-3 pr-4 font-medium">Risk</th>
                <th className="pb-3 pr-4 font-medium">Value Tier</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {fightData
              .filter((fight)=> fight.ev !== 0)
              .map((fight, index) => (
                <tr
                  key={`${fight.id}-${index}`}
                  onClick={() => onSelectFight(fight.id)}
                  className="cursor-pointer border-b border-border/50 transition-colors hover:bg-muted/50"
                >
                  <td className="py-4 pr-4 font-medium">{fight.fight}</td>
                  <td className="py-4 pr-4">
                    <span className="font-bold text-primary">{fight.score}</span>
                  </td>
                  <td className="py-4 pr-4">{fight.bet}</td>
                  <td className="py-4 pr-4 font-semibold text-primary">{fight.ev}</td>
                  <td className="py-4 pr-4">{fight.confidence}</td>
                  <td className="py-4 pr-4">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        fight.risk <= 50
                          ? "bg-green-500/20 text-green-400"
                          : fight.risk > 50 && fight.risk < 78  
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {fight.risk}
                    </span>
                  </td>
                  <td className="py-4 pr-4">
                    <span className="rounded-full bg-primary/20 px-2 py-1 text-xs font-medium text-primary">
                      {fight.tier}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
        )}
    </Card>
  )
}

export default FightTable