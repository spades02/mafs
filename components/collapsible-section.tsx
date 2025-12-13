"use client"

import { useState } from "react"
import { ChevronDown } from 'lucide-react'

interface CollapsibleSectionProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}

export function CollapsibleSection({ title, subtitle, icon, children, defaultOpen = false }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="rounded-xl border border-foreground/10 bg-[#0f1419] overflow-hidden elevation-md hover-glow">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 hover:bg-foreground/5 transition-colors"
      >
        <div className="flex-1 text-left">
          <div className="flex items-center gap-3">
            {icon && <div className="text-blue-400">{icon}</div>}
            <h3 className="text-2xl font-bold text-foreground">{title}</h3>
          </div>
          {subtitle && (
            <p className="section-subtitle ml-8 mt-1">{subtitle}</p>
          )}
        </div>
        <ChevronDown 
          className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      
      {isOpen && (
        <div className="p-6 border-t border-foreground/10 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  )
}
