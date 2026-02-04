import { auth } from '@/app/lib/auth/auth';
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { headers } from 'next/headers';
import Link from 'next/link'
import { cn } from '@/lib/utils';

async function CTAButtons() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  return (
    <div className='flex justify-center gap-8'>
      {!session && <Button className='rounded-sm' asChild>
        <Link href={'/auth/login'}>
          <ArrowRight />
          Login to get started
        </Link>
      </Button>}
      {session &&
        <Button className='rounded-sm' asChild>
          <Link href={'/dashboard'}>
            <ArrowRight />
            Analyze a card
          </Link>
        </Button>}
      <Button
        className={cn(
          'rounded-full border text-xs font-medium transition-colors hover:text-foreground',
          session?.user?.isPro
            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
            : 'border-primary/30 bg-primary/10 text-primary'
        )}
        asChild
      >

        <Link href={'/billing'}>
          {session?.user?.isPro ? 'Manage PRO Subscription' : 'Upgrade to PRO'}
        </Link>
      </Button>
    </div>
  )
}

export default CTAButtons