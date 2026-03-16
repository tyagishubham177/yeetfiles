param(
  [ValidateSet('Debug', 'Release')]
  [string]$Variant = 'Release'
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot

Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
using System.Text;

public static class ShortPathNative {
    [DllImport("kernel32.dll", CharSet = CharSet.Auto)]
    public static extern uint GetShortPathName(string lpszLongPath, StringBuilder lpszShortPath, uint cchBuffer);
}
"@

function Get-ShortPathOrOriginal {
  param([string]$PathValue)

  if ([string]::IsNullOrWhiteSpace($PathValue) -or -not (Test-Path $PathValue)) {
    return $PathValue
  }

  $builder = New-Object System.Text.StringBuilder 1024
  $result = [ShortPathNative]::GetShortPathName($PathValue, $builder, $builder.Capacity)
  if ($result -gt 0) {
    return $builder.ToString()
  }

  return $PathValue
}

function Remove-IfExists {
  param([string]$TargetPath)

  if (Test-Path $TargetPath) {
    Remove-Item -Path $TargetPath -Recurse -Force -ErrorAction SilentlyContinue
  }
}

function Add-Candidate {
  param(
    [System.Collections.Generic.List[string]]$List,
    [string]$Candidate
  )

  if (-not [string]::IsNullOrWhiteSpace($Candidate)) {
    $List.Add($Candidate)
  }
}

function Resolve-JavaHomeCandidate {
  param([string]$PathValue)

  if ([string]::IsNullOrWhiteSpace($PathValue)) {
    return $null
  }

  $trimmed = $PathValue.Trim('"').Trim()
  if ([string]::IsNullOrWhiteSpace($trimmed)) {
    return $null
  }

  if ($trimmed -match 'java(?:\.exe)?$') {
    $binDir = Split-Path -Parent $trimmed
    if ($binDir) {
      return Split-Path -Parent $binDir
    }
  }

  if ((Split-Path -Leaf $trimmed) -eq 'bin') {
    return Split-Path -Parent $trimmed
  }

  return $trimmed
}

function Test-JavaHome {
  param(
    [string]$PathValue,
    [ref]$FailureReason
  )

  if ([string]::IsNullOrWhiteSpace($PathValue)) {
    $FailureReason.Value = 'Empty path'
    return $false
  }

  $javaExe = Join-Path $PathValue 'bin\java.exe'
  if (-not (Test-Path $javaExe)) {
    $FailureReason.Value = "Missing $javaExe"
    return $false
  }

  try {
    & cmd.exe /d /c """$javaExe"" -version >nul 2>&1"
    if ($LASTEXITCODE -eq 0) {
      return $true
    }

    $versionOutput = & $javaExe -version 2>&1
    $summary = (($versionOutput | ForEach-Object { "$_".Trim() }) -join ' ').Trim()
    $FailureReason.Value = if ($summary) { $summary } else { "java.exe exited with code $LASTEXITCODE" }
    return $false
  } catch {
    $message = $_.Exception.Message
    if ($message) {
      $message = ($message -split 'At ')[0].Trim()
    }
    $FailureReason.Value = if ($message) { $message } else { 'java.exe failed to launch' }
    return $false
  }
}

function Get-JavaCandidates {
  $candidates = [System.Collections.Generic.List[string]]::new()

  Add-Candidate -List $candidates -Candidate $env:JAVA_HOME

  if ($env:JDK_HOME) {
    Add-Candidate -List $candidates -Candidate $env:JDK_HOME
  }

  $staticCandidates = @(
    'C:\Program Files\Android\Android Studio\jbr',
    (Join-Path $env:LOCALAPPDATA 'Programs\Android Studio\jbr'),
    'C:\Program Files\Microsoft\jdk-17',
    (Join-Path $env:LOCALAPPDATA 'Programs\MicrosoftJDK\jdk-17.0.18+8'),
    (Join-Path $env:LOCALAPPDATA 'Programs\Microsoft\jdk-17.0.10.7-hotspot')
  )

  foreach ($candidate in $staticCandidates) {
    Add-Candidate -List $candidates -Candidate $candidate
  }

  $searchRoots = @(
    'C:\Program Files',
    'C:\Program Files\Java',
    'C:\Program Files\Microsoft',
    (Join-Path $env:LOCALAPPDATA 'Programs'),
    (Join-Path $env:LOCALAPPDATA 'Programs\Microsoft'),
    (Join-Path $env:LOCALAPPDATA 'Programs\MicrosoftJDK')
  )

  foreach ($root in $searchRoots) {
    if (-not (Test-Path $root)) {
      continue
    }

    Get-ChildItem -Path $root -Directory -ErrorAction SilentlyContinue |
      Where-Object { $_.Name -match 'jdk|jbr|java' } |
      ForEach-Object { Add-Candidate -List $candidates -Candidate $_.FullName }
  }

  try {
    $javaCommands = & where.exe java 2>$null
    foreach ($javaCommand in $javaCommands) {
      Add-Candidate -List $candidates -Candidate (Resolve-JavaHomeCandidate $javaCommand)
    }
  } catch {}

  $javaRegistryKeys = @(
    'HKLM:\SOFTWARE\JavaSoft\JDK',
    'HKLM:\SOFTWARE\JavaSoft\Java Development Kit',
    'HKLM:\SOFTWARE\WOW6432Node\JavaSoft\JDK',
    'HKLM:\SOFTWARE\WOW6432Node\JavaSoft\Java Development Kit'
  )

  foreach ($key in $javaRegistryKeys) {
    if (-not (Test-Path $key)) {
      continue
    }

    try {
      $rootProps = Get-ItemProperty -Path $key -ErrorAction Stop
      if ($rootProps.CurrentVersion) {
        $currentKey = Join-Path $key $rootProps.CurrentVersion
        if (Test-Path $currentKey) {
          $currentProps = Get-ItemProperty -Path $currentKey -ErrorAction SilentlyContinue
          Add-Candidate -List $candidates -Candidate $currentProps.JavaHome
        }
      }

      Get-ChildItem -Path $key -ErrorAction SilentlyContinue | ForEach-Object {
        $versionProps = Get-ItemProperty -Path $_.PSPath -ErrorAction SilentlyContinue
        Add-Candidate -List $candidates -Candidate $versionProps.JavaHome
      }
    } catch {}
  }

  $uninstallRoots = @(
    'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall',
    'HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall',
    'HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall'
  )

  foreach ($root in $uninstallRoots) {
    if (-not (Test-Path $root)) {
      continue
    }

    Get-ChildItem -Path $root -ErrorAction SilentlyContinue | ForEach-Object {
      try {
        $props = Get-ItemProperty -Path $_.PSPath -ErrorAction Stop
        if ($props.DisplayName -notmatch 'OpenJDK|JDK|Java|Android Studio') {
          return
        }

        Add-Candidate -List $candidates -Candidate $props.InstallLocation
        Add-Candidate -List $candidates -Candidate (Resolve-JavaHomeCandidate $props.DisplayIcon)
      } catch {}
    }
  }

  $workspaceToolsDir = Join-Path $repoRoot '.tools'
  if (Test-Path $workspaceToolsDir) {
    Get-ChildItem -Path $workspaceToolsDir -Directory -ErrorAction SilentlyContinue |
      Where-Object { $_.Name -match 'jdk|jbr|java' } |
      ForEach-Object { Add-Candidate -List $candidates -Candidate $_.FullName }
  }

  return $candidates |
    ForEach-Object { Resolve-JavaHomeCandidate $_ } |
    Where-Object { -not [string]::IsNullOrWhiteSpace($_) } |
    Select-Object -Unique
}

$javaCheckFailures = [System.Collections.Generic.List[string]]::new()
$javaHome = $null

foreach ($candidate in (Get-JavaCandidates)) {
  $failureReason = ''
  $isValidJavaHome = Test-JavaHome -PathValue $candidate -FailureReason ([ref]$failureReason)
  if ($isValidJavaHome -eq $true) {
    $javaHome = $candidate
    break
  }

  if (-not [string]::IsNullOrWhiteSpace($failureReason)) {
    $javaCheckFailures.Add("${candidate} -> ${failureReason}")
  }
}

if (-not $javaHome) {
  $details = if ($javaCheckFailures.Count -gt 0) {
    "Checked Java candidates:`n - " + ($javaCheckFailures -join "`n - ")
  } else {
    "No Java candidates were discovered from env vars, PATH, registry, Android Studio, or the repo .tools folder."
  }

  $repairHint = @(
    "Install or repair JDK 17, then re-run 'npm.cmd run apk:local'.",
    "Recommended Windows admin command: choco install microsoft-openjdk17 -y",
    "If Java is already installed, set JAVA_HOME to the JDK folder that contains bin\java.exe."
  ) -join "`n"

  throw "$details`n`n$repairHint"
}

$env:JAVA_HOME = $javaHome
$env:Path = "$(Join-Path $env:JAVA_HOME 'bin');$env:Path"
$env:NODE_ENV = 'production'

$workingRepoRoot = Get-ShortPathOrOriginal $repoRoot
$env:GRADLE_USER_HOME = Join-Path $workingRepoRoot '.g'

foreach ($drive in @('Y', 'X')) {
  try {
    if (Test-Path "${drive}:\") {
      & subst.exe "${drive}:" /d | Out-Null
    }
  } catch {}
}

if (-not (Test-Path $env:GRADLE_USER_HOME)) {
  New-Item -ItemType Directory -Path $env:GRADLE_USER_HOME -Force | Out-Null
}

$androidDir = Join-Path $workingRepoRoot 'android'
$nativeIntermediatesToClean = @(
  (Join-Path $repoRoot '.gradle-user-home'),
  (Join-Path $repoRoot 'android\.cxx'),
  (Join-Path $repoRoot 'android\app\.cxx'),
  (Join-Path $repoRoot 'node_modules\react-native-screens\android\.cxx'),
  (Join-Path $repoRoot 'node_modules\react-native-reanimated\android\.cxx'),
  (Join-Path $repoRoot 'node_modules\react-native-worklets\android\.cxx'),
  (Join-Path $repoRoot 'node_modules\react-native-reanimated\android\build'),
  (Join-Path $repoRoot 'node_modules\react-native-worklets\android\build')
)

if ($workingRepoRoot -ne $repoRoot) {
  foreach ($targetPath in $nativeIntermediatesToClean) {
    Remove-IfExists $targetPath
  }
}

$gradleWrapper = Join-Path $androidDir 'gradlew.bat'

if (-not (Test-Path $gradleWrapper)) {
  throw "Could not find Gradle wrapper at $gradleWrapper"
}

$gradleTask = if ($Variant -eq 'Debug') { ':app:assembleDebug' } else { ':app:assembleRelease' }
$deviceArchitectures = 'armeabi-v7a,arm64-v8a'
$apkPath = if ($Variant -eq 'Debug') {
  Join-Path $androidDir 'app\build\outputs\apk\debug\app-debug.apk'
} else {
  Join-Path $androidDir 'app\build\outputs\apk\release\app-release.apk'
}

Write-Host "Using JAVA_HOME: $env:JAVA_HOME"
if ($workingRepoRoot -ne $repoRoot) {
  Write-Host "Using short repo path: $workingRepoRoot"
}
Write-Host "Using GRADLE_USER_HOME: $env:GRADLE_USER_HOME"
Write-Host "Using NODE_ENV: $env:NODE_ENV"
Write-Host "Using React Native architectures: $deviceArchitectures"
Write-Host "Running Gradle task: $gradleTask"

Push-Location $androidDir
try {
  & $gradleWrapper --no-daemon $gradleTask "-PreactNativeArchitectures=$deviceArchitectures"
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
