param(
  [ValidateSet('Debug', 'Release')]
  [string]$Variant = 'Release'
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot

function Test-JavaHome {
  param([string]$PathValue)

  if ([string]::IsNullOrWhiteSpace($PathValue)) {
    return $false
  }

  $javaExe = Join-Path $PathValue 'bin\java.exe'
  if (-not (Test-Path $javaExe)) {
    return $false
  }

  try {
    & $javaExe -version *> $null
    return $LASTEXITCODE -eq 0
  } catch {
    return $false
  }
}

function Get-JavaCandidates {
  $candidates = [System.Collections.Generic.List[string]]::new()

  if ($env:JAVA_HOME) {
    $candidates.Add($env:JAVA_HOME)
  }

  $staticCandidates = @(
    'C:\Program Files\Android\Android Studio\jbr',
    (Join-Path $env:LOCALAPPDATA 'Programs\Android Studio\jbr'),
    'C:\Program Files\Microsoft\jdk-17',
    (Join-Path $env:LOCALAPPDATA 'Programs\MicrosoftJDK\jdk-17.0.18+8'),
    (Join-Path $env:LOCALAPPDATA 'Programs\Microsoft\jdk-17.0.10.7-hotspot')
  )

  foreach ($candidate in $staticCandidates) {
    if (-not [string]::IsNullOrWhiteSpace($candidate)) {
      $candidates.Add($candidate)
    }
  }

  $searchRoots = @(
    'C:\Program Files',
    (Join-Path $env:LOCALAPPDATA 'Programs')
  )

  foreach ($root in $searchRoots) {
    if (-not (Test-Path $root)) {
      continue
    }

    Get-ChildItem -Path $root -Directory -ErrorAction SilentlyContinue |
      Where-Object { $_.Name -match 'jdk|jbr|java' } |
      ForEach-Object { $candidates.Add($_.FullName) }
  }

  $workspaceToolsDir = Join-Path $repoRoot '.tools'
  if (Test-Path $workspaceToolsDir) {
    Get-ChildItem -Path $workspaceToolsDir -Directory -ErrorAction SilentlyContinue |
      Where-Object { $_.Name -match 'jdk|jbr|java' } |
      ForEach-Object { $candidates.Add($_.FullName) }
  }
  return $candidates | Select-Object -Unique
}

$javaHome = Get-JavaCandidates | Where-Object { Test-JavaHome $_ } | Select-Object -First 1

if (-not $javaHome) {
  throw "No working JDK was found. Install JDK 17 or Android Studio, then set JAVA_HOME to that folder and re-run 'npm.cmd run apk:local'."
}

$env:JAVA_HOME = $javaHome
$env:Path = "$(Join-Path $env:JAVA_HOME 'bin');$env:Path"

$androidDir = Join-Path $repoRoot 'android'
$gradleWrapper = Join-Path $androidDir 'gradlew.bat'

if (-not (Test-Path $gradleWrapper)) {
  throw "Could not find Gradle wrapper at $gradleWrapper"
}

$gradleTask = if ($Variant -eq 'Debug') { ':app:assembleDebug' } else { ':app:assembleRelease' }
$apkPath = if ($Variant -eq 'Debug') {
  Join-Path $androidDir 'app\build\outputs\apk\debug\app-debug.apk'
} else {
  Join-Path $androidDir 'app\build\outputs\apk\release\app-release.apk'
}

Write-Host "Using JAVA_HOME: $env:JAVA_HOME"
Write-Host "Running Gradle task: $gradleTask"

Push-Location $androidDir
try {
  & $gradleWrapper $gradleTask
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
} finally {
  Pop-Location
}

if (-not (Test-Path $apkPath)) {
  throw "Gradle finished but the APK was not found at $apkPath"
}

Write-Host "APK ready: $apkPath"
