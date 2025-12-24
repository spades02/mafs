"use client"
import { Button } from '@/components/ui/button'
import { useSession } from '@/lib/auth/auth-client';
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

function CTAButtons() {
    const { data } = useSession();
    return (
    <div className='mt-8 flex justify-center gap-8'>
          {!data && <Button className='rounded-sm' asChild>
          <Link href={'/auth/login'}>
            <ArrowRight/>
            Login to get started
          </Link>
          </Button>}
          {data &&
            <Button className='rounded-sm' asChild>
          <Link href={'/dashboard'}>
            <ArrowRight/>
            Analyze a card
          </Link>
          </Button>}
          <Button className='rounded-full border border-primary/30 bg-primary/10 text-xs font-medium text-primary hover:text-foreground' asChild>
          <Link href={'/billing'}>
            Get your free plan - 1 card/day
          </Link>
          </Button>
          </div>
  )
}

export default CTAButtons