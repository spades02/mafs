function ScanningBar() {
  return (
    <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-2xl border-b border-border/30">
      <div className="container mx-auto px-6 py-2.5">
        <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <span>Scanning 27 sportsbooks for pricing inefficiencies</span>
        </div>
      </div>
    </div>
  )
}

export default ScanningBar
