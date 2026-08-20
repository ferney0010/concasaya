$ErrorActionPreference = 'Stop'

$RO = [System.Text.RegularExpressions.RegexOptions]::Singleline -bor [System.Text.RegularExpressions.RegexOptions]::IgnoreCase

function Get-MainContent {
    param([string]$Path)
    $c = Get-Content -Raw -LiteralPath $Path -Encoding UTF8
    # Quitar head
    $c = [regex]::Replace($c, '<head>.*?</head>', '', $RO)
    # Quitar scripts
    $c = [regex]::Replace($c, '<script[^>]*>.*?</script>', '', $RO)
    # Quitar styles
    $c = [regex]::Replace($c, '<style[^>]*>.*?</style>', '', $RO)
    # Quitar nav
    $c = [regex]::Replace($c, '<nav[^>]*>.*?</nav>', '', $RO)
    # Quitar footer
    $c = [regex]::Replace($c, '<footer[^>]*>.*?</footer>', '', $RO)
    # Quitar comentarios
    $c = [regex]::Replace($c, '<!--.*?-->', '', $RO)
    # Quitar todos los tags HTML
    $text = [regex]::Replace($c, '<[^>]+>', ' ')
    $text = [regex]::Replace($text, '\s+', ' ').Trim()
    return $text
}

$samples = @(
    @{ path='C:/Workspace/concasaya/index.html'; label='index.html (home)'; group='INDEXADA' }
    @{ path='C:/Workspace/concasaya/modelos.html'; label='modelos.html'; group='INDEXADA' }
    @{ path='C:/Workspace/concasaya/blog/casas-prefabricadas-en-colombia.html'; label='blog/casas-prefabricadas-en-colombia.html'; group='INDEXADA' }
    @{ path='C:/Workspace/concasaya/pages/chia.html'; label='pages/chia.html'; group='INDEXADA' }
    @{ path='C:/Workspace/concasaya/ventajas.html'; label='ventajas.html'; group='INDEXADA' }
    @{ path='C:/Workspace/concasaya/blog/construccion-panel-eps-vs-bloquelon.html'; label='blog/construccion-panel-eps-vs-bloquelon.html'; group='NO INDEXADA' }
    @{ path='C:/Workspace/concasaya/blog/construccion-prefabricada-vs-tradicional.html'; label='blog/construccion-prefabricada-vs-tradicional.html'; group='NO INDEXADA' }
    @{ path='C:/Workspace/concasaya/blog/guia-casas-prefabricadas-colombia-concasaya.html'; label='blog/guia-casas-prefabricadas-colombia-concasaya.html'; group='NO INDEXADA' }
    @{ path='C:/Workspace/concasaya/blog/plaqueta-concreto-vs-bloquelon.html'; label='blog/plaqueta-concreto-vs-bloquelon.html'; group='NO INDEXADA' }
    @{ path='C:/Workspace/concasaya/contacto.html'; label='contacto.html'; group='NO INDEXADA' }
    @{ path='C:/Workspace/concasaya/faq.html'; label='faq.html'; group='NO INDEXADA' }
    @{ path='C:/Workspace/concasaya/galeria.html'; label='galeria.html'; group='NO INDEXADA' }
    @{ path='C:/Workspace/concasaya/pages/la-calera.html'; label='pages/la-calera.html'; group='NO INDEXADA' }
    @{ path='C:/Workspace/concasaya/pages/villeta.html'; label='pages/villeta.html'; group='NO INDEXADA' }
    @{ path='C:/Workspace/concasaya/referidos.html'; label='referidos.html'; group='NO INDEXADA' }
)

$results = @()
foreach ($s in $samples) {
    $text = Get-MainContent -Path $s.path
    $words = ($text -split '\s+' | Where-Object { $_.Length -gt 0 }).Count
    $chars = $text.Length
    $results += [PSCustomObject]@{
        Group = $s.group
        Label = $s.label
        Words = $words
        Chars = $chars
    }
}

$results | Sort-Object Group, Words -Descending | Format-Table -AutoSize
