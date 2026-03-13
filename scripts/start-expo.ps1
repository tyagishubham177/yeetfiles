param(
  [ValidateSet('tunnel', 'lan')]
  [string]$HostMode = 'lan',
  [switch]$DevClient,
  [switch]$Clear,
  [int]$MaxAttempts = 3,
  [int]$QuickFailureSeconds = 20
)

$ErrorActionPreference = 'Stop'

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $projectRoot

function Invoke-ProjectCommand {
  param(
    [string]$FilePath,
    [string[]]$Arguments
  )

  & $FilePath @Arguments
  return $LASTEXITCODE
}

function Get-ExpoArgs {
  param(
    [string]$Mode,
    [bool]$UseDevClient,
    [bool]$UseClear
  )

  $args = @('expo', 'start')

  if ($UseDevClient) {
    $args += '--dev-client'
  }

  $args += "--$Mode"

  if ($UseClear) {
    $args += '--clear'
  }

  return $args
}

for ($attempt = 1; $attempt -le $MaxAttempts; $attempt++) {
  Write-Host ""
  Write-Host "[FileSwipe] Startup attempt $attempt/$MaxAttempts ($HostMode)"

  Invoke-ProjectCommand -FilePath 'powershell' -Arguments @('-ExecutionPolicy', 'Bypass', '-File', '.\scripts\free-expo-port.ps1') | Out-Null
  Invoke-ProjectCommand -FilePath 'node' -Arguments @('.\scripts\patch-expo-ngrok-timeout.js') | Out-Null

  $useClear = $Clear.IsPresent -or $attempt -gt 1
  $expoArgs = Get-ExpoArgs -Mode $HostMode -UseDevClient $DevClient.IsPresent -UseClear $useClear
  $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

  & npx.cmd @expoArgs
  $exitCode = $LASTEXITCODE
  $stopwatch.Stop()

  if ($exitCode -eq 0) {
    exit 0
  }

  $failedQuickly = $stopwatch.Elapsed.TotalSeconds -lt $QuickFailureSeconds
  $canRetry = $HostMode -eq 'tunnel' -and $failedQuickly -and $attempt -lt $MaxAttempts

  if (-not $canRetry) {
    Write-Host ""
    Write-Host "[FileSwipe] Expo start exited with code $exitCode after $([math]::Round($stopwatch.Elapsed.TotalSeconds, 1))s."
    if ($HostMode -eq 'tunnel') {
      Write-Host "[FileSwipe] Tunnel stayed unstable. If your phone is on the same Wi-Fi, use: npm run dev:lan"
    }
    exit $exitCode
  }

  Write-Host ""
  Write-Warning "Tunnel failed quickly after $([math]::Round($stopwatch.Elapsed.TotalSeconds, 1))s. Retrying with fresh Expo/ngrok state..."
  Start-Sleep -Seconds ([Math]::Min(5, $attempt * 2))
}

exit 1
