# AP Plastic ERP - Windows app setup
# Creates a Desktop and Start menu app that opens the ERP in its own window.
# Data is kept in Supabase. Nothing else is installed.

$ErrorActionPreference = 'Stop'
$AppUrl  = 'https://newthura.github.io/AP-Plastic/'
$AppName = 'AP Plastic ERP'

try {
    # 1. Keep the icon in the user's own app folder
    $AppDir = Join-Path $env:LOCALAPPDATA $AppName
    New-Item -ItemType Directory -Force -Path $AppDir | Out-Null
    $IconSrc = Join-Path $PSScriptRoot "$AppName.ico"
    $Icon    = Join-Path $AppDir "$AppName.ico"
    if (Test-Path $IconSrc) { Copy-Item $IconSrc $Icon -Force }

    # 2. Find Chrome or Edge (Edge comes with every Windows 10 and 11)
    $Candidates = @(
        (Join-Path $env:ProgramFiles 'Google\Chrome\Application\chrome.exe'),
        (Join-Path ${env:ProgramFiles(x86)} 'Google\Chrome\Application\chrome.exe'),
        (Join-Path $env:LOCALAPPDATA 'Google\Chrome\Application\chrome.exe'),
        (Join-Path ${env:ProgramFiles(x86)} 'Microsoft\Edge\Application\msedge.exe'),
        (Join-Path $env:ProgramFiles 'Microsoft\Edge\Application\msedge.exe')
    )
    $Browser = $null
    foreach ($c in $Candidates) { if ($c -and (Test-Path $c)) { $Browser = $c; break } }
    if (-not $Browser) {
        foreach ($exe in @('chrome.exe', 'msedge.exe')) {
            $key = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\$exe"
            $p = (Get-ItemProperty -Path $key -ErrorAction SilentlyContinue).'(default)'
            if ($p -and (Test-Path $p)) { $Browser = $p; break }
        }
    }
    if (-not $Browser) {
        Write-Host ''
        Write-Host 'Could not find Google Chrome or Microsoft Edge on this computer.' -ForegroundColor Red
        Write-Host 'Install one of them, then run this setup again.'
        exit 1
    }

    # 3. Make the shortcuts: Desktop and Start menu
    $AppArgs = "--app=$AppUrl --window-size=1400,900"
    $Shell = New-Object -ComObject WScript.Shell
    $Places = @(
        [Environment]::GetFolderPath('Desktop'),
        [Environment]::GetFolderPath('Programs')
    )
    foreach ($dir in $Places) {
        if (-not $dir) { continue }
        $lnk = $Shell.CreateShortcut((Join-Path $dir "$AppName.lnk"))
        $lnk.TargetPath       = $Browser
        $lnk.Arguments        = $AppArgs
        $lnk.WorkingDirectory = Split-Path $Browser
        $lnk.Description      = 'AP Plastic factory ERP'
        if (Test-Path $Icon) { $lnk.IconLocation = "$Icon,0" }
        $lnk.Save()
    }

    Write-Host ''
    Write-Host 'AP Plastic ERP is installed.' -ForegroundColor Green
    Write-Host 'Open it from the AP Plastic ERP icon on your Desktop or in the Start menu.'
    Write-Host 'Sign in with your username and password.'
    Write-Host ''

    # 4. Open it now
    Start-Process -FilePath $Browser -ArgumentList $AppArgs
}
catch {
    Write-Host ''
    Write-Host ('Setup stopped: ' + $_.Exception.Message) -ForegroundColor Red
    exit 1
}
