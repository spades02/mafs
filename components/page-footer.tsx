export function PageFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#0b0f14] py-8 mt-12">
      <div className="container mx-auto px-4 max-w-[1600px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-400">
          <div>
            <h4 className="font-semibold text-white mb-2">Disclaimer</h4>
            <p className="text-xs leading-relaxed">
              This is an AI-powered analysis tool for educational purposes. Not financial advice.
              Always gamble responsibly.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Model Information</h4>
            <p className="text-xs leading-relaxed">
              Version: 1.5.0 | Last Updated: 2024-01-15 | Multi-Agent Fusion System
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Contact</h4>
            <p className="text-xs leading-relaxed">
              For support or feedback, contact support@ufcai.terminal
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
