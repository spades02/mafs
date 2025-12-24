import React from 'react'

function Logo() {
  return (
    <div className="mb-4 flex justify-center">
      <div className="rounded-full bg-primary/20 p-3">
        <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
          <circle cx="12" cy="12" r="6" strokeWidth="2" />
          <circle cx="12" cy="12" r="2" strokeWidth="2" fill="currentColor" />
        </svg>
      </div>
    </div>
  )
}

export default Logo