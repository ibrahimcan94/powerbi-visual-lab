$ErrorActionPreference = 'Stop'
$sourceRoot = Split-Path $PSScriptRoot -Parent
$sourceOutput = Join-Path $sourceRoot 'releases/Business-OS-Source.zip'
New-Item -ItemType Directory -Force -Path (Split-Path $sourceOutput -Parent) | Out-Null
$sourceFiles = & git -C $sourceRoot -c core.quotepath=false ls-files --cached --others --exclude-standard
if ($LASTEXITCODE -ne 0) { throw 'Could not list repository files.' }
Add-Type -AssemblyName System.IO.Compression.FileSystem
if (Test-Path -LiteralPath $sourceOutput) { Remove-Item -LiteralPath $sourceOutput }
$sourceArchive = [IO.Compression.ZipFile]::Open($sourceOutput, [IO.Compression.ZipArchiveMode]::Create)
try {
    foreach ($sourceRelative in ($sourceFiles | Sort-Object -Unique)) {
        $sourcePath = Join-Path $sourceRoot $sourceRelative
        if (Test-Path -LiteralPath $sourcePath -PathType Leaf) {
            [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($sourceArchive, $sourcePath, $sourceRelative.Replace('\','/')) | Out-Null
        }
    }
} finally { $sourceArchive.Dispose() }
Write-Output "Created $sourceOutput (current working files, without Git history or ignored build dependencies)."
