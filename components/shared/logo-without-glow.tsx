import React from 'react'

type LogoProps = {
    size: number;
  };

function LogoWithoutGlow({size}: LogoProps) {
  return (
    <div className="mb-4 flex justify-center mr-2">
      <div className="rounded-full">
        <svg className={`h-${size} w-${size} text-primary`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
          <circle cx="12" cy="12" r="6" strokeWidth="2" />
          <circle cx="12" cy="12" r="2" strokeWidth="2" fill="currentColor" />
        </svg>
      </div>
    </div>
  )
}

export default LogoWithoutGlow