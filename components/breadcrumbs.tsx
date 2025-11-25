"use client"
import React, { useState } from 'react'

const Breadcrumbs = () => {
    const [analysisRun, setAnalysisRun] = useState(false);
    return (
    <div className='flex items-center gap-4'>
        <div
            className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all duration-300 ${
              !analysisRun
                ? "bg-linear-to-r from-blue-500/20 to-cyan-500/20 border-2 border-blue-400/50 shadow-lg shadow-blue-500/30"
                : "bg-white/5 border border-white/20"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                !analysisRun
                  ? "bg-linear-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/50"
                  : "bg-green-500 text-white"
              }`}
            >
              {!analysisRun ? "1" : "✓"}
            </div>
            <span className={`font-semibold ${!analysisRun ? "text-white" : "text-gray-400"}`}>Choose Your Fight</span>
          </div>
          <div className="h-0.5 w-12 bg-linear-to-r from-white/20 to-white/5" />
        <div
            className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all duration-300 ${
              analysisRun
                ? "bg-linear-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-400/50 shadow-lg shadow-green-500/30"
                : "bg-white/5 border border-white/20"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                analysisRun
                  ? "bg-linear-to-br from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/50 animate-glow-pulse-green"
                  : "bg-white/10 text-gray-500"
              }`}
            >
              2
            </div>
            <span className={`font-semibold ${analysisRun ? "text-white" : "text-gray-400"}`}>Review AI Breakdown</span>
          </div>
    </div>
  )
}

export default Breadcrumbs