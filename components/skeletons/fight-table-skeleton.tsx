import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Skeleton } from '../ui/skeleton'

function FightTableSkeleton() {
  return (
    <div className="border rounded-lg">
    <Table className="lg:max-w-lg mx-auto">
      <TableHeader>
        <TableRow>
          <TableHead><Skeleton className="h-3 w-[300px]" /></TableHead>
          <TableHead><Skeleton className="h-3 w-[300px]" /></TableHead>
          <TableHead><Skeleton className="h-3 w-[300px]" /></TableHead>
          <TableHead><Skeleton className="h-3 w-[300px]" /></TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {[...Array(7)].map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-5 w-[300px]" /></TableCell>
            <TableCell><Skeleton className="h-5 w-[300px]" /></TableCell>
            <TableCell><Skeleton className="h-5 w-[300px]" /></TableCell>
            <TableCell><Skeleton className="h-5 w-[300px]" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
  )
}

export default FightTableSkeleton