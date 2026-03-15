param(
  [int]$Size = 1024,
  [string]$OutputDir = "assets"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

function New-RoundedRectPath {
  param(
    [float]$X,
    [float]$Y,
    [float]$Width,
    [float]$Height,
    [float]$Radius
  )

  $diameter = $Radius * 2
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddArc($X, $Y, $diameter, $diameter, 180, 90)
  $path.AddArc($X + $Width - $diameter, $Y, $diameter, $diameter, 270, 90)
  $path.AddArc($X + $Width - $diameter, $Y + $Height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($X, $Y + $Height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

function Convert-ToPointFArray {
  param(
    [double[][]]$Points,
    [float]$Scale
  )

  $result = New-Object 'System.Collections.Generic.List[System.Drawing.PointF]'
  foreach ($point in $Points) {
    $result.Add((New-Object System.Drawing.PointF(($point[0] * $Scale), ($point[1] * $Scale))))
  }

  return $result.ToArray()
}

function Draw-Mark {
  param(
    [System.Drawing.Graphics]$Graphics,
    [float]$Scale
  )

  $primaryBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#F4F7FB"))
  $accentBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#B8C7DA"))

  try {
    $rearShard = Convert-ToPointFArray @(@(24, 48), @(40, 48), @(51, 35), @(35, 35)) $Scale
    $mainShard = Convert-ToPointFArray @(@(33, 72), @(50, 72), @(74, 42), @(57, 42), @(46, 55), @(37, 55)) $Scale
    $frontShard = Convert-ToPointFArray @(@(59, 42), @(77, 42), @(85, 31), @(67, 31)) $Scale

    $Graphics.FillPolygon($primaryBrush, $rearShard)
    $Graphics.FillPolygon($primaryBrush, $mainShard)
    $Graphics.FillPolygon($accentBrush, $frontShard)
  } finally {
    $primaryBrush.Dispose()
    $accentBrush.Dispose()
  }
}

function New-Canvas {
  param([int]$PixelSize)

  $bitmap = New-Object System.Drawing.Bitmap($PixelSize, $PixelSize)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.Clear([System.Drawing.Color]::Transparent)

  return @{
    Bitmap = $bitmap
    Graphics = $graphics
  }
}

function Save-Png {
  param(
    [System.Drawing.Bitmap]$Bitmap,
    [string]$Path
  )

  $Bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
}

if (-not (Test-Path $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$scale = $Size / 96.0

$iconCanvas = New-Canvas -PixelSize $Size
try {
  $backgroundX = [float](8 * $scale)
  $backgroundY = [float](8 * $scale)
  $backgroundWidth = [float](80 * $scale)
  $backgroundHeight = [float](80 * $scale)
  $backgroundRadius = [float](24 * $scale)
  $gradientStart = New-Object System.Drawing.PointF([float](12 * $scale), [float](10 * $scale))
  $gradientEnd = New-Object System.Drawing.PointF([float](84 * $scale), [float](86 * $scale))
  $backgroundPath = New-RoundedRectPath -X $backgroundX -Y $backgroundY -Width $backgroundWidth -Height $backgroundHeight -Radius $backgroundRadius
  $backgroundBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $gradientStart,
    $gradientEnd,
    ([System.Drawing.ColorTranslator]::FromHtml("#0B1220")),
    ([System.Drawing.ColorTranslator]::FromHtml("#17263B"))
  )

  try {
    $iconCanvas.Graphics.FillPath($backgroundBrush, $backgroundPath)
    Draw-Mark -Graphics $iconCanvas.Graphics -Scale $scale
  } finally {
    $backgroundBrush.Dispose()
    $backgroundPath.Dispose()
  }

  Save-Png -Bitmap $iconCanvas.Bitmap -Path (Join-Path $OutputDir "icon.png")
} finally {
  $iconCanvas.Graphics.Dispose()
  $iconCanvas.Bitmap.Dispose()
}

$adaptiveCanvas = New-Canvas -PixelSize $Size
try {
  Draw-Mark -Graphics $adaptiveCanvas.Graphics -Scale $scale
  Save-Png -Bitmap $adaptiveCanvas.Bitmap -Path (Join-Path $OutputDir "adaptive-icon.png")
} finally {
  $adaptiveCanvas.Graphics.Dispose()
  $adaptiveCanvas.Bitmap.Dispose()
}

$monoCanvas = New-Canvas -PixelSize $Size
try {
  $monoCanvas.Graphics.Clear([System.Drawing.Color]::White)
  $monoBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#111827"))

  try {
    $rearShard = Convert-ToPointFArray @(@(24, 48), @(40, 48), @(51, 35), @(35, 35)) $scale
    $mainShard = Convert-ToPointFArray @(@(33, 72), @(50, 72), @(74, 42), @(57, 42), @(46, 55), @(37, 55)) $scale
    $frontShard = Convert-ToPointFArray @(@(59, 42), @(77, 42), @(85, 31), @(67, 31)) $scale

    $monoCanvas.Graphics.FillPolygon($monoBrush, $rearShard)
    $monoCanvas.Graphics.FillPolygon($monoBrush, $mainShard)
    $monoCanvas.Graphics.FillPolygon($monoBrush, $frontShard)
  } finally {
    $monoBrush.Dispose()
  }

  Save-Png -Bitmap $monoCanvas.Bitmap -Path (Join-Path $OutputDir "icon-monochrome.png")
} finally {
  $monoCanvas.Graphics.Dispose()
  $monoCanvas.Bitmap.Dispose()
}
