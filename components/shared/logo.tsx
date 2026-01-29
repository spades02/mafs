import Image from 'next/image'
import React from 'react'
import logo from '@/public/logo/MAFS.png'

function Logo({ height, width }: { height: number, width: number }) {
  return (
    <div className="mb-4 flex justify-center">
      <Image src={logo} alt="Logo" width={width} height={height} />
    </div>
  )
}

export default Logo