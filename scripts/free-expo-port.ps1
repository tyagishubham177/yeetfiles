$ports = @(8081, 19000, 19001, 19002)
$collectedPids = @()

foreach ($port in $ports) {
  $matches = netstat -ano | Select-String -Pattern ":$port\s" | ForEach-Object {
    ($_ -split '\s+')[-1]
  }

  foreach ($procId in $matches) {
    if ($procId -match '^[0-9]+$') {
      $collectedPids += [int]$procId
    }
  }
}

$ngrokPids = @(Get-Process ngrok -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Id)
$allPids = @($collectedPids + $ngrokPids | Select-Object -Unique)

if ($allPids.Count -gt 0) {
  Write-Host "Stopping stale Expo processes: $($allPids -join ', ')"
  Stop-Process -Id $allPids -Force
}
