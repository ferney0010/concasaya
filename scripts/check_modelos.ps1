$r = (Invoke-WebRequest -Uri "http://127.0.0.1:8000/modelos.html" -UseBasicParsing -TimeoutSec 5).Content

$checks = @{
  "categoryGalleryModal"      = [bool]($r -match 'id="categoryGalleryModal"')
  "cat-modal-grid"            = [bool]($r -match 'id="cat-modal-grid"')
  "cat-modal-tabs"            = [bool]($r -match 'id="cat-modal-tabs"')
  "CSS cat-modal-grid"        = [bool]($r -match '\.cat-modal-grid\s*\{')
  "JS open cat modal"         = [bool]($r -match 'function openFromCard')
  "data-category=cabana"      = ([regex]::Matches($r, 'data-category="cabana"').Count)
  "data-category=plaqueta"    = ([regex]::Matches($r, 'data-category="plaqueta"').Count)
  "data-category=2pisos"      = ([regex]::Matches($r, 'data-category="2pisos"').Count)
  "data-category=cubo"        = ([regex]::Matches($r, 'data-category="cubo"').Count)
  "data-category=eps"         = ([regex]::Matches($r, 'data-category="eps"').Count)
  "data-category=materiales"  = ([regex]::Matches($r, 'data-category="materiales"').Count)
  "data-category=proceso"     = ([regex]::Matches($r, 'data-category="proceso"').Count)
  "data-variant=altillo"      = ([regex]::Matches($r, 'data-variant="altillo"').Count)
  "data-variant=vidrio"       = ([regex]::Matches($r, 'data-variant="vidrio"').Count)
  "Ver mas modelos"           = ([regex]::Matches($r, 'Ver más modelos').Count)
  "Ver mas (cubos)"           = ([regex]::Matches($r, 'fa-images"></i>Ver más').Count)
  "open-modal-btn"            = ([regex]::Matches($r, 'class="open-modal-btn').Count)
  "File size (KB)"            = [int]($r.Length / 1024)
}

$checks.GetEnumerator() | Sort-Object Name | ForEach-Object {
  "{0,-30} : {1}" -f $_.Key, $_.Value
}
