import { auth } from '@/app/lib/auth/auth';
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { headers } from 'next/headers';
import Link from 'next/link'

async function CTAButtons() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
    return (
    <div className='mt-8 flex justify-center gap-8'>
          {!session && <Button className='rounded-sm' asChild>
          <Link href={'/auth/login'}>
            <ArrowRight/>
            Login to get started
          </Link>
          </Button>}
          {session &&
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