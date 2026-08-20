$ErrorActionPreference = 'Stop'

$targets = @(
    'C:/Workspace/concasaya/blog/construccion-panel-eps-vs-bloquelon.html'
    'C:/Workspace/concasaya/blog/construccion-prefabricada-vs-tradicional.html'
    'C:/Workspace/concasaya/blog/guia-casas-prefabricadas-colombia-concasaya.html'
    'C:/Workspace/concasaya/blog/plaqueta-concreto-vs-bloquelon.html'
    'C:/Workspace/concasaya/contacto.html'
    'C:/Workspace/concasaya/faq.html'
    'C:/Workspace/concasaya/galeria.html'
    'C:/Workspace/concasaya/pages/la-calera.html'
    'C:/Workspace/concasaya/pages/villeta.html'
    'C:/Workspace/concasaya/referidos.html'
)

foreach ($path in $targets) {
    $name = Split-Path $path -Leaf
    $content = Get-Content -Raw -LiteralPath $path -Encoding UTF8

    Write-Host ""
    Write-Host ("===== {0} =====" -f $name) -ForegroundColor Cyan

    # canonical
    $canon = [regex]::Match($content, '<link\s+rel="canonical"\s+href="([^"]+)"')
    if ($canon.Success) {
        Write-Host ("  canonical: {0}" -f $canon.Groups[1].Value)
    } else {
        Write-Host "  canonical: *** NO ENCONTRADO ***" -ForegroundColor Red
    }

    # meta robots
    $robots = [regex]::Match($content, '<meta\s+name="robots"\s+content="([^"]+)"')
    if ($robots.Success) {
        $val = $robots.Groups[1].Value
        $color = if ($val -match 'noindex') { 'Red' } else { 'Green' }
        Write-Host ("  meta robots: {0}" -f $val) -ForegroundColor $color
    } else {
        Write-Host "  meta robots: (default: index, follow)" -ForegroundColor DarkGray
    }

    # X-Robots-Tag in meta
    $xrobots = [regex]::Match($content, '<meta\s+name="x-robots-tag"\s+content="([^"]+)"')
    if ($xrobots.Success) {
        Write-Host ("  x-robots-tag: {0}" -f $xrobots.Groups[1].Value) -ForegroundColor Red
    }

    # title
    $title = [regex]::Match($content, '<title>([^<]+)</title>')
    if ($title.Success) {
        Write-Host ("  title: {0}" -f $title.Groups[1].Value)
    }

    # description
    $desc = [regex]::Match($content, 'name="description"\s+content="([^"]+)"')
    if ($desc.Success) {
        $d = $desc.Groups[1].Value
        if ($d.Length -gt 100) { $d = $d.Substring(0, 100) + "..." }
        Write-Host ("  description ({0} chars): {1}" -f $desc.Groups[1].Value.Length, $d)
    } else {
        Write-Host "  description: *** NO ENCONTRADA ***" -ForegroundColor Red
    }

    # Word count of visible body (rough)
    $body = [regex]::Match($content, '<body[^>]*>(.*?)</body>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
    if ($body.Success) {
        # Strip tags
        $text = [regex]::Replace($body.Groups[1].Value, '<[^>]+>', ' ')
        $text = [regex]::Replace($text, '\s+', ' ').Trim()
        $words = ($text -split '\s+' | Where-Object { $_.Length -gt 0 }).Count
        $color = if ($words -lt 200) { 'Red' } elseif ($words -lt 500) { 'Yellow' } else { 'Green' }
        Write-Host ("  body word count: {0}" -f $words) -ForegroundColor $color
    }
}
