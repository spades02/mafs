#requires -Version 5.1
<#
  Manually fire N weekly-sim ticks against prod.

  Each call hits /api/cron/weekly-simulations?ignoreBucket=1 with the
  Bearer CRON_SECRET. The route resumes the existing run for the next
  upcoming event, increments tickIndex, runs Agents() its inner-loop count
  times (bucket-dependent), persists results, and recomputes recurring_edges.

  Usage:
    pwsh ./scripts/run-manual-sims.ps1                    # default 10 ticks against mafs.ai
    pwsh ./scripts/run-manual-sims.ps1 -Count 25
    pwsh ./scripts/run-manual-sims.ps1 -Url http://localhost:3000 -Count 5
#>

param(
  [int]$Count = 10,
  [string]$Url = "https://mafs.ai",
  [int]$DelaySeconds = 3
)

$ErrorActionPreference = "Stop"

# Load CRON_SECRET from .env.local if not already in env
if (-not $env:CRON_SECRET) {
  $envFile = Join-Path $PSScriptRoot ".." ".env.local"
  if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
      if ($_ -match "^\s*CRON_SECRET\s*=\s*(.+?)\s*$") {
        $env:CRON_SECRET = $matches[1].Trim("'`"")
      }
    }
  }
}

if (-not $env:CRON_SECRET) {
  Write-Error "CRON_SECRET not set. Add it to .env.local or `$env:CRON_SECRET = '...'"
  exit 1
}

$endpoint = "$Url/api/cron/weekly-simulations?ignoreBucket=1"
$start = Get-Date
$totalSims = 0
$ticks = 0

Write-Host "Firing $Count ticks at $endpoint" -ForegroundColor Cyan
Write-Host ""

for ($i = 1; $i -le $Count; $i++) {
  $tickStart = Get-Date
  Write-Host "[$i/$Count] " -NoNewline -ForegroundColor Yellow
  try {
    $response = curl.exe -s -H "Authorization: Bearer $env:CRON_SECRET" "$endpoint"
    $parsed = $response | ConvertFrom-Json
    $tickElapsed = [int](((Get-Date) - $tickStart).TotalSeconds)

    if ($parsed.ok) {
      $totalSims += [int]$parsed.fightsSimulated
      $ticks++
      Write-Host ("tick={0} bucket={1} model={2} sims={3} ({4}s)" -f `
        $parsed.tickIndex, $parsed.bucket, $parsed.model, $parsed.fightsSimulated, $tickElapsed) -ForegroundColor Green
    } else {
      Write-Host "skipped: $($parsed.reason)" -ForegroundColor DarkYellow
    }
  } catch {
    Write-Host "FAILED: $_" -ForegroundColor Red
  }

  if ($i -lt $Count) { Start-Sleep -Seconds $DelaySeconds }
}

$totalElapsed = [int](((Get-Date) - $start).TotalSeconds)
Write-Host ""
Write-Host ("Done — {0} successful ticks, {1} sims, {2}s total" -f $ticks, $totalSims, $totalElapsed) -ForegroundColor Cyan
