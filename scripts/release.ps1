param([ValidateSet('all','finance','workforce')][string]$Tool = 'all')
$ErrorActionPreference = 'Stop'
$releaseRoot = Split-Path $PSScriptRoot -Parent
$releaseOutput = Join-Path $releaseRoot 'releases'
New-Item -ItemType Directory -Force -Path $releaseOutput | Out-Null
Add-Type -AssemblyName System.IO.Compression.FileSystem

function Export-Tool($Name, $Report, $Demo, $Visuals) {
    $releaseStage = Join-Path $releaseOutput ($Name + '-' + [guid]::NewGuid().ToString('N'))
    New-Item -ItemType Directory -Path $releaseStage | Out-Null
    Copy-Item -LiteralPath (Join-Path $releaseRoot $Report) -Destination (Join-Path $releaseStage 'powerbi') -Recurse
    Copy-Item -LiteralPath (Join-Path $releaseRoot $Demo) -Destination (Join-Path $releaseStage 'demo') -Recurse
    Copy-Item -LiteralPath (Join-Path $releaseRoot $Demo 'index.html') -Destination (Join-Path $releaseStage 'START-DEMO.html')
    if ($Name -eq 'Workforce-OS') {
        # The root demo has no links; targets are a separate entry point.
        Copy-Item -LiteralPath (Join-Path $releaseRoot $Demo 'targets.html') -Destination (Join-Path $releaseStage 'Monthly-Targets.html')
    }
    foreach ($visual in $Visuals) {
        $visualRoot = Join-Path $releaseRoot $visual
        $visualMeta = Get-Content -Raw -LiteralPath (Join-Path $visualRoot 'pbiviz.json') | ConvertFrom-Json
        $visualPackage = Get-ChildItem -LiteralPath (Join-Path $visualRoot 'dist') -Filter '*.pbiviz' | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        if (-not $visualPackage) { throw "Missing build for $visual" }
        $reportFolder = Get-ChildItem -LiteralPath (Join-Path $releaseStage 'powerbi') -Directory -Filter '*.Report' | Select-Object -First 1
        $visualTarget = Join-Path $reportFolder.FullName ('CustomVisuals/' + $visualMeta.visual.guid)
        New-Item -ItemType Directory -Force -Path $visualTarget | Out-Null
        [IO.Compression.ZipFile]::ExtractToDirectory($visualPackage.FullName, $visualTarget, $true)
        $packageName = switch ($visualMeta.visual.name) {
            'financeDashboard' { 'Finance-OS.pbiviz' }
            'workforceTargets' { 'Workforce-Targets.pbiviz' }
            default { 'Workforce-OS.pbiviz' }
        }
        Copy-Item -LiteralPath $visualPackage.FullName -Destination (Join-Path $releaseStage ('powerbi/' + $packageName))
    }
    # Exclude local Power BI state from distributable reports.
    Get-ChildItem -LiteralPath (Join-Path $releaseStage 'powerbi') -Directory -Recurse -Force -Filter '.pbi' | ForEach-Object {
        $statePath = [IO.Path]::GetFullPath($_.FullName)
        if (-not $statePath.StartsWith([IO.Path]::GetFullPath($releaseStage) + [IO.Path]::DirectorySeparatorChar)) { throw 'Unsafe state path' }
        Remove-Item -LiteralPath $statePath -Recurse -Force
    }
    Set-Content -LiteralPath (Join-Path $releaseStage 'README.txt') -Value "Open START-DEMO.html in a browser for the offline interactive synthetic demo. No install or login needed.`nFor Power BI deployment, open the PBIP in powerbi/ using Power BI Desktop. Read powerbi/START-HERE.md for data setup. Publishing requires your own Power BI workspace and credentials."
    $releaseZip = Join-Path $releaseOutput ($Name + '.zip')
    if (Test-Path -LiteralPath $releaseZip) { Remove-Item -LiteralPath $releaseZip }
    [IO.Compression.ZipFile]::CreateFromDirectory($releaseStage, $releaseZip)
    $resolvedStage = [IO.Path]::GetFullPath($releaseStage)
    if (-not $resolvedStage.StartsWith([IO.Path]::GetFullPath($releaseOutput) + [IO.Path]::DirectorySeparatorChar)) { throw 'Unsafe staging path' }
    Remove-Item -LiteralPath $resolvedStage -Recurse -Force
    Write-Output "Created $releaseZip"
}
if ($Tool -in @('all','finance')) { Export-Tool 'Finance-OS' 'reports/FinanceOS' 'demos/finance' @('visuals/FinanceDashboard') }
if ($Tool -in @('all','workforce')) { Export-Tool 'Workforce-OS' 'projects/workforce-os/WorkforceOS' 'demos/workforce' @('projects/workforce-os/visual','projects/workforce-os/targets-visual') }
