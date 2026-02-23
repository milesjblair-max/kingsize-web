# Search Wikimedia Commons for correct SVG filenames, then download via MD5 URL
Add-Type -AssemblyName System.Security

function Get-WikiThumbUrl($fn, $width = 200) {
    $md5   = [System.Security.Cryptography.MD5]::Create()
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($fn)
    $hash  = ($md5.ComputeHash($bytes) | ForEach-Object { $_.ToString("x2") }) -join ''
    $a     = $hash[0]
    $ab    = $hash.Substring(0,2)
    $enc   = [Uri]::EscapeDataString($fn)
    return "https://upload.wikimedia.org/wikipedia/commons/thumb/$a/$ab/$enc/${width}px-$enc.png"
}

$dest   = "public\brand-logos"
$absDir = (Resolve-Path $dest).Path
$ua     = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36"

$brands = @(
    [pscustomobject]@{ slug="hugo-boss";      q="Hugo Boss logo" },
    [pscustomobject]@{ slug="nautica";        q="Nautica logo brand" },
    [pscustomobject]@{ slug="ben-sherman";    q="Ben Sherman logo" },
    [pscustomobject]@{ slug="calvin-klein";   q="Calvin Klein logo" },
    [pscustomobject]@{ slug="skechers";       q="Skechers logo brand" },
    [pscustomobject]@{ slug="dick-jones";     q="Jack Jones logo fashion brand" },
    [pscustomobject]@{ slug="dickies";        q="Dickies workwear logo" },
    [pscustomobject]@{ slug="jockey";         q="Jockey underwear brand logo" },
    [pscustomobject]@{ slug="keen";           q="Keen footwear logo shoe" },
    [pscustomobject]@{ slug="doc-martens";    q="Dr Martens boot logo" },
    [pscustomobject]@{ slug="raging-bull";    q="Raging Bull clothing brand" },
    [pscustomobject]@{ slug="mustang";        q="Mustang jeans fashion logo" },
    [pscustomobject]@{ slug="daniel-hechter"; q="Daniel Hechter fashion logo" },
    [pscustomobject]@{ slug="north-56";       q="North 56 clothing logo" },
    [pscustomobject]@{ slug="olukai";         q="OluKai footwear logo" }
)

# Fix jack-jones slug
foreach ($b in $brands) {
    if ($b.slug -eq "dick-jones") { $b.slug = "jack-jones" }
}

$ok = 0; $fail = 0

foreach ($b in $brands) {
    $slug    = $b.slug
    $outPath = "$absDir\$slug.png"
    if (Test-Path $outPath) { Write-Host "SKIP $slug"; continue }

    # Step 1: search Wikimedia Commons for SVG files
    try {
        $qEnc    = [Uri]::EscapeDataString($b.q + " filetype:svg")
        $sUrl    = "https://commons.wikimedia.org/w/api.php?action=query&list=search&srnamespace=6&srlimit=8&srsearch=$qEnc&format=json"
        $sResp   = Invoke-WebRequest -Uri $sUrl -UserAgent $ua -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
        $sJson   = $sResp.Content | ConvertFrom-Json
        $hits    = $sJson.query.search

        if (-not $hits -or $hits.Count -eq 0) {
            Write-Host "NOSEARCH $slug"
            $fail++; continue
        }

        $got = $false
        foreach ($hit in $hits) {
            # title is like "File:Hugo Boss logo.svg"
            $rawTitle = $hit.title
            # Strip "File:" prefix and convert spaces to underscores
            $fn = ($rawTitle -replace '^File:', '') -replace ' ', '_'

            # Only try SVG files
            if ($fn -notmatch '\.svg$') { continue }

            $thumbUrl = Get-WikiThumbUrl $fn 200
            try {
                $imgR = Invoke-WebRequest -Uri $thumbUrl -UserAgent $ua -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
                if ($imgR.StatusCode -eq 200 -and $imgR.Content.Length -gt 400) {
                    [System.IO.File]::WriteAllBytes($outPath, $imgR.Content)
                    Write-Host "OK   $slug ($($imgR.Content.Length)b) [$fn]"
                    $ok++; $got = $true; break
                }
            } catch { }
        }

        if (-not $got) {
            Write-Host "FAIL $slug (no valid download from $($hits.Count) search results)"
            $fail++
        }
    } catch {
        Write-Host "ERR  $slug : $($_.Exception.Message.Split([Environment]::NewLine)[0])"
        $fail++
    }
}

Write-Host "`nDone: $ok ok, $fail fail"
Write-Host "Files in brand-logos:"
Get-ChildItem $absDir | ForEach-Object { Write-Host "  $($_.Name) ($($_.Length)b)" }
