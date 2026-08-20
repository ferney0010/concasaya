$ErrorActionPreference = 'Stop'

$root = 'C:/Workspace/concasaya'
$htmlFiles = Get-ChildItem -Path $root -Recurse -Filter *.html -File |
    Where-Object { $_.FullName -notmatch '[\\\/]node_modules[\\\/]' } |
    Where-Object { $_.FullName -notmatch '[\\\/]\.git[\\\/]' } |
    Where-Object { $_.FullName -notmatch '[\\\/]admin[\\\/]' } |
    Where-Object { $_.FullName -notmatch '[\\\/]blog[\\\/]snippets[\\\/]' } |
    Sort-Object FullName

# 10 URLs sin indexar (relPath = path relativo a la raíz del repo)
$targets = @(
    @{ relPath = 'blog/construccion-panel-eps-vs-bloquelon.html' }
    @{ relPath = 'blog/construccion-prefabricada-vs-tradicional.html' }
    @{ relPath = 'blog/guia-casas-prefabricadas-colombia-concasaya.html' }
    @{ relPath = 'blog/plaqueta-concreto-vs-bloquelon.html' }
    @{ relPath = 'contacto.html' }
    @{ relPath = 'faq.html' }
    @{ relPath = 'galeria.html' }
    @{ relPath = 'pages/la-calera.html' }
    @{ relPath = 'pages/villeta.html' }
    @{ relPath = 'referidos.html' }
)

function Get-RelativeToRepo {
    param([string]$FullName, [string]$Root)
    $FullName.Substring($Root.Length + 1).Replace('\', '/')
}

$report = @()

foreach ($target in $targets) {
    $targetRel = $target.relPath
    $targetName = Split-Path $targetRel -Leaf
    $sources = @()

    foreach ($file in $htmlFiles) {
        $fileRel = Get-RelativeToRepo -FullName $file.FullName -Root $root
        if ($fileRel -eq $targetRel) { continue }

        $content = Get-Content -Raw -LiteralPath $file.FullName -Encoding UTF8
        $hits = 0
        $anchors = @()

        # Patrón 1: cualquier href o src que contenga el filename (con prefijo ../ o /)
        $pattern1 = '(href|src)\s*=\s*"([^"]*' + [regex]::Escape($targetName) + ')"'
        $m1 = [regex]::Matches($content, $pattern1)
        $hits += $m1.Count
        foreach ($m in $m1) { $anchors += $m.Groups[2].Value }

        # Patrón 2: URL absoluta https://www.concasaya.com/<path>
        $absUrl = 'https://www.concasaya.com/' + $targetRel
        $pattern2 = '(href|src)\s*=\s*"' + [regex]::Escape($absUrl) + '"'
        $m2 = [regex]::Matches($content, $pattern2)
        $hits += $m2.Count
        foreach ($m in $m2) { $anchors += $m.Groups[0].Value }

        if ($hits -gt 0) {
            $uniqueAnchors = ($anchors | Select-Object -Unique) -join ' | '
            $sources += [PSCustomObject]@{
                Source = $fileRel
                Hits = $hits
                Anchors = $uniqueAnchors
            }
        }
    }

    $report += [PSCustomObject]@{
        Target = $targetRel
        SourceCount = $sources.Count
        TotalHits = ($sources | Measure-Object -Property Hits -Sum).Sum
        Sources = $sources
    }
}

# Output
foreach ($r in $report) {
    Write-Host ""
    Write-Host ("===== {0} =====" -f $r.Target) -ForegroundColor Cyan
    $summary = "Paginas unicas: {0}  |  Total hits: {1}" -f $r.SourceCount, $r.TotalHits
    Write-Host $summary
    if ($r.Sources.Count -eq 0) {
        Write-Host "  *** HUERFANA - ningun enlace interno encontrado ***" -ForegroundColor Red
    } else {
        foreach ($s in $r.Sources) {
            Write-Host ("  [{0}x] {1}" -f $s.Hits, $s.Source)
            if ($s.Anchors) { Write-Host ("       href: {0}" -f $s.Anchors) -ForegroundColor DarkGray }
        }
    }
}

Write-Host ""
Write-Host "===== RESUMEN CLASIFICADO =====" -ForegroundColor Yellow
foreach ($r in $report) {
    if ($r.SourceCount -eq 0) { $state = 'HUERFANA' }
    elseif ($r.SourceCount -le 2) { $state = 'DEBIL' }
    elseif ($r.SourceCount -le 5) { $state = 'OK' }
    else { $state = 'FUERTE' }
    $line = "{0,-65} {1,-10} {2,3} fuentes" -f $r.Target, $state, $r.SourceCount
    Write-Host $line
}
