import { Target, Zap } from 'lucide-react'
import React from 'react'
import NavMenu from './nav-menu'
import { Button } from './ui/button'
import Link from 'next/link'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import UserDp from './user-dp'

const Navbar = () => {
  return (
    <div className='sticky flex justify-between py-5 px-8 bg-[#0b0f14]/90 drop-shadow-2xl shadow-2xl'>
        {/* Logo Navbar */}
        <div className='flex gap-2'>
            <div className='w-11 h-11 rounded-xl flex items-center justify-center bg-linear-to-br from-blue-500 to-cyan-500 animate-glow-pulse'>
                <Target className='text-white w-6 h-6'/>
            </div>
            <div>
            <h1 className='font-bold text-xl'>MAFS</h1>
            <p className='font-medium text-[11px] text-gray-400'>Multi-Agent Fight Simulator</p>
            </div>
        </div>

        {/* Pages Navbar */}
        <NavMenu />
        <div className='flex gap-4'>
        {/* Free Plan Button */}
        <Link href={"/billing"}>
        <Button className='hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-full bg-linear-to-r from-blue-500/15 to-cyan-500/15 border border-blue-500/30 hover:border-blue-500/60 hover:from-blue-500/25 hover:to-cyan-500/25 transition-all duration-300 cursor-pointer transform hover:scale-105'>
        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shadow-lg shadow-blue-400/60" />
        <span className='font-medium text-xs'>Free Plan - 1 fight/day</span>
        </Button>
        </Link>
        {/* Upgrade to pro Button */}
        <Tooltip>
        <Link className='cursor-pointer' href={"/billing"}>
        <TooltipTrigger>
        <Button className='bg-linear-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-600 hover:via-emerald-600 hover:to-green-700 text-white font-semibold px-6 py-2 rounded-full shadow-xl shadow-green-500/50 hover:shadow-2xl hover:shadow-green-500/60 hover:scale-105 active:scale-95 transition-all duration-300 animate-glow-pulse-green text-sm'><Zap /> <span>Upgrade to Pro - $79/mo</span></Button>
        </TooltipTrigger>
        <TooltipContent>Click to upgrade to Pro for unlimited access</TooltipContent>
        </Link>
        </Tooltip>
        <UserDp/>
        </div>

    </div>
  )
}

export default Navbar