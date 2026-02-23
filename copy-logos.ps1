$src = "Brand Logos"
$dest = "public\brand-logos"
if (!(Test-Path $dest)) { New-Item -Path $dest -ItemType Directory }

$mappings = @{
    "hugo boss.png" = "hugo-boss.png"
    "nautica.png" = "nautica.png"
    "Ben Sherman.png" = "ben-sherman.png"
    "levis.png" = "levis.png"
    "Calvin Klein.png" = "calvin-klein.png"
    "jack and jones.png" = "jack-jones.png"
    "new balance.png" = "new-balance.png"
    "skechers.png" = "skechers.png"
    "vans.png" = "vans.png"
    "dickies.png" = "dickies.png"
    "jockey.png" = "jockey.png"
    "keen.png" = "keen.png"
    "north 564.png" = "north-56.png"
    "RAGING BULL.png" = "raging-bull.png"
    "Ansett.png" = "ansett.png"
    "Bak Bay.png" = "backbay.png"
    "Breakway.png" = "breakaway.png"
    "Bronco.png" = "bronco.png"
    "Brooksfield.png" = "brooksfield.png"
    "Boston fine tailoring.png" = "boston.png"
    "Buckle.png" = "buckle.png"
    "Cipollini.png" = "cipollini.png"
    "City club.png" = "city-club.png"
    "dario beltran.png" = "dario-beltran.png"
    "daws.png" = "dawgs.png"
    "the duke clothing co.png" = "duke.png"
    "espionage.png" = "espionage.png"
    "glow weave.png" = "gloweave.png"
    "high country.png" = "high-country.png"
    "hunt holditch.png" = "hunt-holditch.png"
    "jimmy stuart.png" = "jimmy-stuart.png"
    "kam jeans.png" = "kam.png"
    "koala.png" = "koala.png"
    "PERRONE.png" = "perrone.png"
    "PILBRA COLLECTION.png" = "pilbara.png"
    "redpoint.png" = "red-point.png"
    "remgrandt.png" = "rembrandt.png"
    "slatters.png" = "slatters.png"
    "tradewinds by ansett.png" = "trade-winds.png"
    "tradie.png" = "tradies.png"
    "workland.png" = "workland.png"
    "daniel hechter.png" = "daniel-hechter.png"
    "Casa Moda.png" = "casa-moda.png"
    "gazman.png" = "gaz-man.png"
}

foreach ($key in $mappings.Keys) {
    $val = $mappings[$key]
    $srcPath = Join-Path $src $key
    $destPath = Join-Path $dest $val
    if (Test-Path $srcPath) {
        Copy-Item $srcPath $destPath -Force
        Write-Host "Copied $key to $val"
    } else {
        Write-Warning "Source file not found: $key"
    }
}
