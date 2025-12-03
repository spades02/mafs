"use client"
import { useAnalysisStore } from '@/lib/hooks/useAnalysisStore'

const InitialUI = () => {
    const analysisRun = useAnalysisStore((s)=>s.analysisRun)
  return (
    !analysisRun && (<div className="flex flex-col items-center justify-center py-40 px-6 animate-fade-in">
          <h2 className="text-4xl font-bold text-white mb-4 text-center">Ready to Analyze a Fight</h2>
          <p className="text-gray-400 text-center max-w-xl text-lg leading-relaxed mb-12">
            Complete Step 1 above to generate the AI's comprehensive betting analysis.
          </p>
          {/* Premium checklist with clearer instructions */}
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-4 text-gray-300 text-base">
              <div className="w-9 h-9 rounded-full border-2 border-blue-500/50 flex items-center justify-center shrink-0 bg-blue-500/10">
                <span className="text-sm font-bold text-blue-400">1</span>
              </div>
              <span>Select the UFC event from the dropdown</span>
            </div>
            <div className="flex items-center gap-4 text-gray-300 text-base">
              <div className="w-9 h-9 rounded-full border-2 border-blue-500/50 flex items-center justify-center shrink-0 bg-blue-500/10">
                <span className="text-sm font-bold text-blue-400">2</span>
              </div>
              <span>Choose which matchup you want to bet on</span>
            </div>
            <div className="flex items-center gap-4 text-gray-300 text-base">
              <div className="w-9 h-9 rounded-full border-2 border-blue-500/50 flex items-center justify-center shrink-0 bg-blue-500/10">
                <span className="text-sm font-bold text-blue-400">3</span>
              </div>
              <span>Click the green button to run the AI analysis</span>
            </div>
          </div>
        </div>)
  )
}

export default InitialUI