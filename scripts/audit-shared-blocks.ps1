$ErrorActionPreference = 'Stop'

$RO = [System.Text.RegularExpressions.RegexOptions]::Singleline -bor [System.Text.RegularExpressions.RegexOptions]::IgnoreCase

function Get-MainContent {
    param([string]$Path)
    $c = Get-Content -Raw -LiteralPath $Path -Encoding UTF8
    $c = [regex]::Replace($c, '<head>.*?</head>', '', $RO)
    $c = [regex]::Replace($c, '<script[^>]*>.*?</script>', '', $RO)
    $c = [regex]::Replace($c, '<style[^>]*>.*?</style>', '', $RO)
    $c = [regex]::Replace($c, '<nav[^>]*>.*?</nav>', '', $RO)
    $c = [regex]::Replace($c, '<footer[^>]*>.*?</footer>', '', $RO)
    $c = [regex]::Replace($c, '<!--.*?-->', '', $RO)
    # Quitar sections con class que suelen ser compartidas (heuristica)
    $c = [regex]::Replace($c, '<section[^>]*>.*?</section>', '', $RO)
    $text = [regex]::Replace($c, '<[^>]+>', ' ')
    $text = [regex]::Replace($text, '\s+', ' ').Trim()
    return $text
}

function Get-Sections {
    param([string]$Path)
    $c = Get-Content -Raw -LiteralPath $Path -Encoding UTF8
    # Extraer las <section>...</section>
    $sections = [regex]::Matches($c, '<section[^>]*>(.*?)</section>', $RO)
    $result = @()
    foreach ($s in $sections) {
        $inner = [regex]::Replace($s.Groups[1].Value, '<[^>]+>', ' ')
        $inner = [regex]::Replace($inner, '\s+', ' ').Trim()
        if ($inner.Length -gt 50) {
            $result += $inner.Substring(0, [math]::Min(80, $inner.Length))
        }
    }
    return $result
}

# Comparar galeria vs contacto
Write-Host "=== Primeras 80 chars de cada <section> en GALERIA ===" -ForegroundColor Cyan
Get-Sections -Path 'C:/Workspace/concasaya/galeria.html' | ForEach-Object { Write-Host "  $_" }

Write-Host ""
Write-Host "=== Primeras 80 chars de cada <section> en CONTACTO ===" -ForegroundColor Cyan
Get-Sections -Path 'C:/Workspace/concasaya/contacto.html' | ForEach-Object { Write-Host "  $_" }

Write-Host ""
Write-Host "=== Primeras 80 chars de cada <section> en LA-CALERA ===" -ForegroundColor Cyan
Get-Sections -Path 'C:/Workspace/concasaya/pages/la-calera.html' | ForEach-Object { Write-Host "  $_" }

Write-Host ""
Write-Host "=== Primeras 80 chars de cada <section> en VILLETA ===" -ForegroundColor Cyan
Get-Sections -Path 'C:/Workspace/concasaya/pages/villeta.html' | ForEach-Object { Write-Host "  $_" }
