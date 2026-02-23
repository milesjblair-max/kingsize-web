# Download from seeklogo CDN - direct asset URLs
$dest = "public\brand-logos"
$absDir = (Resolve-Path $dest).Path

# These are direct CDN links from seeklogo and similar that don't require JS
$logos = @(
    @{ slug="hugo-boss";    url="https://content.seeklogo.com/logo-image/602/hugo-boss-logo.png" },
    @{ slug="nautica";      url="https://content.seeklogo.com/logo-image/514/nautica-logo.png" },
    @{ slug="ben-sherman";  url="https://content.seeklogo.com/logo-image/517/ben-sherman-logo.png" },
    @{ slug="levis";        url="https://content.seeklogo.com/logo-image/506/levi-s-logo.png" },
    @{ slug="calvin-klein"; url="https://content.seeklogo.com/logo-image/509/calvin-klein-logo.png" },
    @{ slug="jack-jones";   url="https://content.seeklogo.com/logo-image/516/jack-jones-logo.png" },
    @{ slug="new-balance";  url="https://content.seeklogo.com/logo-image/505/new-balance-logo.png" },
    @{ slug="skechers";     url="https://content.seeklogo.com/logo-image/513/skechers-logo.png" },
    @{ slug="vans";         url="https://content.seeklogo.com/logo-image/504/vans-logo.png" },
    @{ slug="dickies";      url="https://content.seeklogo.com/logo-image/519/dickies-logo.png" },
    @{ slug="jockey";       url="https://content.seeklogo.com/logo-image/526/jockey-logo.png" },
    @{ slug="keen";         url="https://content.seeklogo.com/logo-image/508/keen-logo.png" },
    @{ slug="doc-martens";  url="https://content.seeklogo.com/logo-image/528/dr-martens-logo.png" }
)

$ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
$headers = @{
    "Referer" = "https://seeklogo.com/"
    "Accept"  = "image/png,image/*,*/*;q=0.8"
}
$ok   = 0
$fail = 0

foreach ($item in $logos) {
    $slug = $item.slug
    $out  = "$absDir\$slug.png"
    try {
        $resp = Invoke-WebRequest -Uri $item.url -UserAgent $ua -Headers $headers -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
        if ($resp.StatusCode -eq 200 -and $resp.Content.Length -gt 500) {
            [System.IO.File]::WriteAllBytes($out, $resp.Content)
            Write-Host "OK   $slug ($($resp.Content.Length) bytes)"
            $ok++
        } else {
            Write-Host "FAIL $slug status=$($resp.StatusCode) size=$($resp.Content.Length)"
            $fail++
        }
    } catch {
        Write-Host "ERR  $slug"
        $fail++
    }
}

Write-Host "Done: $ok ok, $fail failed"
