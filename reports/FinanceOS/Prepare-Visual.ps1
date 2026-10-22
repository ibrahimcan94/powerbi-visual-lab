param([switch]$Build)
$ErrorActionPreference = 'Stop'
$financeRepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$financeVisualRoot = Join-Path $financeRepoRoot 'visuals\FinanceDashboard'
if (-not (Test-Path -LiteralPath $financeVisualRoot)) {
    throw 'This helper is for reports/FinanceOS inside the Git repository. The downloadable ZIP already includes its visual; open FinanceOS.pbip directly.'
}
if ($Build) {
    Push-Location $financeVisualRoot
    try {
        npm run build
        if ($LASTEXITCODE -ne 0) { throw 'Finance OS visual packaging failed.' }
    } finally { Pop-Location }
}
$financePackage = Get-ChildItem -LiteralPath (Join-Path $financeVisualRoot 'dist') -Filter '*.pbiviz' | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $financePackage) { throw 'Build the Finance OS visual first, or run this script with -Build.' }
Add-Type -AssemblyName System.IO.Compression.FileSystem
$financeArchive = [IO.Compression.ZipFile]::OpenRead($financePackage.FullName)
try {
    $financeManifestEntry = $financeArchive.GetEntry('package.json')
    $financeReader = [IO.StreamReader]::new($financeManifestEntry.Open())
    try { $financeManifest = $financeReader.ReadToEnd() | ConvertFrom-Json } finally { $financeReader.Dispose() }
    $financeGuid = $financeManifest.visual.guid
    if ($financeGuid -notmatch '^financeDashboard[A-Za-z0-9]+$') { throw 'Unexpected visual GUID.' }
    $financeDestination = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot ('FinanceOS.Report\CustomVisuals\' + $financeGuid)))
    $financeAllowedRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot 'FinanceOS.Report\CustomVisuals')) + [IO.Path]::DirectorySeparatorChar
    if (-not $financeDestination.StartsWith($financeAllowedRoot, [StringComparison]::OrdinalIgnoreCase)) { throw 'Invalid extraction destination.' }
    foreach ($financeEntry in $financeArchive.Entries) {
        if ($financeEntry.FullName.EndsWith('/')) { continue }
        $financeFile = [IO.Path]::GetFullPath((Join-Path $financeDestination $financeEntry.FullName))
        if (-not $financeFile.StartsWith($financeDestination + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'Unsafe archive entry.' }
        [IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($financeFile)) | Out-Null
        [IO.Compression.ZipFileExtensions]::ExtractToFile($financeEntry, $financeFile, $true)
    }
} finally { $financeArchive.Dispose() }
Write-Output 'Finance OS visual installed. Open FinanceOS.pbip and refresh the embedded sample data.'
