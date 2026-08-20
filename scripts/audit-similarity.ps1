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
    $text = [regex]::Replace($c, '<[^>]+>', ' ')
    $text = [regex]::Replace($text, '\s+', ' ').Trim()
    return $text
}

# Calcular similitud entre pares
function Get-Similarity {
    param([string]$A, [string]$B)
    $ta = (Get-MainContent -Path $A).ToLower()
    $tb = (Get-MainContent -Path $B).ToLower()
    # n-gramas de 3 palabras para detectar plagio estructural
    $ngram = 3
    function Get-Ngrams {
        param([string]$text, [int]$n)
        $words = $text -split '\s+' | Where-Object { $_.Length -gt 0 }
        $ngrams = @{}
        for ($i = 0; $i -le $words.Count - $n; $i++) {
            $g = ($words[$i..($i+$n-1)] -join ' ')
            if ($ngrams.ContainsKey($g)) { $ngrams[$g]++ } else { $ngrams[$g] = 1 }
        }
        return $ngrams
    }
    $na = Get-Ngrams -text $ta -n $ngram
    $nb = Get-Ngrams -text $tb -n $ngram
    $shared = 0
    foreach ($k in $na.Keys) {
        if ($nb.ContainsKey($k)) { $shared += [math]::Min($na[$k], $nb[$k]) }
    }
    $totalA = ($na.Values | Measure-Object -Sum).Sum
    $totalB = ($nb.Values | Measure-Object -Sum).Sum
    $minTotal = [math]::Min($totalA, $totalB)
    $pct = if ($minTotal -gt 0) { [math]::Round(($shared / $minTotal) * 100, 1) } else { 0 }
    return [PSCustomObject]@{ Shared = $shared; TotalA = $totalA; TotalB = $totalB; Pct = $pct }
}

# Pares a comparar
$laCalera = 'C:/Workspace/concasaya/pages/la-calera.html'
$villeta = 'C:/Workspace/concasaya/pages/villeta.html'
$chia = 'C:/Workspace/concasaya/pages/chia.html'
$laMesa = 'C:/Workspace/concasaya/pages/la-mesa.html'
$contacto = 'C:/Workspace/concasaya/contacto.html'
$faq = 'C:/Workspace/concasaya/faq.html'
$galeria = 'C:/Workspace/concasaya/galeria.html'

Write-Host "=== Similitud estructural (n-gramas de 3 palabras) ===" -ForegroundColor Yellow
Write-Host "Mientras MAS ALTA la similitud, MAS probable que Google las vea como low-value/duplicate"
Write-Host ""

$pairs = @(
    @{ a=$laCalera; b=$villeta; label='la-calera (NO idx) vs villeta (NO idx)' }
    @{ a=$laCalera; b=$chia;     label='la-calera (NO idx) vs chia (SI idx)' }
    @{ a=$laCalera; b=$laMesa;   label='la-calera (NO idx) vs la-mesa (SI idx)' }
    @{ a=$villeta;  b=$chia;     label='villeta (NO idx) vs chia (SI idx)' }
    @{ a=$villeta;  b=$laMesa;   label='villeta (NO idx) vs la-mesa (SI idx)' }
    @{ a=$contacto; b=$faq;      label='contacto (NO idx) vs faq (NO idx)' }
    @{ a=$galeria;  b=$contacto; label='galeria (NO idx) vs contacto (NO idx)' }
)

foreach ($p in $pairs) {
    $s = Get-Similarity -A $p.a -B $p.b
    Write-Host ("  {0,-50} {1,5}%" -f $p.label, $s.Pct)
}
