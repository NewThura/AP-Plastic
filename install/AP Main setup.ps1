# AP Main setup: puts AP Main on this computer and adds the "AP Plastic" icon to the Desktop and the Start menu.
# Run it with "Install AP Main.bat" (double-click). Running it again updates AP Main; records are never touched.
# Where it goes: E:\AP\AP Main when this computer has a fixed E: drive, otherwise %LOCALAPPDATA%\Programs\AP Main.
# AP Main opens in Chrome (or Edge) in its own window. Records stay where they were chosen inside the app.

param([string]$Dest)   # only for testing: put AP Main somewhere else
$ErrorActionPreference = "Stop"
$src = Split-Path -Parent $PSScriptRoot                     # the AP Main folder this setup came with

function Say($t) { Write-Host $t }

# 1. where AP Main goes
$e = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='E:'" -ErrorAction SilentlyContinue
if ($Dest) { $dest = $Dest } elseif ($e -and $e.DriveType -eq 3) { $dest = "E:\AP\AP Main" } else { $dest = Join-Path $env:LOCALAPPDATA "Programs\AP Main" }

# 2. copy the app files (only the app: never records)
$files = @("index.html", "icon.png", "icon-512.png", "logo-mark.png")
foreach ($f in $files) { if (-not (Test-Path (Join-Path $src $f))) { throw "Missing $f next to the install folder." } }
$same = (Resolve-Path $src).Path.TrimEnd('\') -ieq ([IO.Path]::GetFullPath($dest)).TrimEnd('\')
if (-not $same) {
  New-Item -ItemType Directory -Force $dest | Out-Null
  foreach ($f in $files) { Copy-Item (Join-Path $src $f) (Join-Path $dest $f) -Force }
  New-Item -ItemType Directory -Force (Join-Path $dest "install") | Out-Null
  Copy-Item (Join-Path $PSScriptRoot "*") (Join-Path $dest "install") -Force
}
Say "AP Main is in $dest"

# 3. the icon (every size, made from the logo; kept next to this setup as ap-main.ico)
$iconDir = Join-Path $env:LOCALAPPDATA "AP Main"
New-Item -ItemType Directory -Force $iconDir | Out-Null
# the copy's name changes with the icon, so Windows shows a new icon at once instead of its saved old one
$srcIco = Join-Path $PSScriptRoot "ap-main.ico"
$ico = Join-Path $iconDir ("ap-main-" + (Get-FileHash $srcIco -Algorithm MD5).Hash.Substring(0, 8) + ".ico")
Get-ChildItem $iconDir -Filter "ap-main*.ico" | Where-Object { $_.FullName -ne $ico } | Remove-Item -Force -ErrorAction SilentlyContinue
Copy-Item $srcIco $ico -Force

# 4. the browser that opens it: Chrome, else Edge
$browser = @(
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
  "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
) | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
if (-not $browser) { throw "Chrome or Edge is needed. Please install Google Chrome, then run this again." }

# 5. shortcuts on the Desktop and in the Start menu
$url = "file:///" + ((Join-Path $dest "index.html") -replace '\\', '/' -replace ' ', '%20')
$sh = New-Object -ComObject WScript.Shell
$places = @([Environment]::GetFolderPath("Desktop"), (Join-Path ([Environment]::GetFolderPath("Programs")) ""))
foreach ($p in $places) {
  $l = $sh.CreateShortcut((Join-Path $p "AP Plastic.lnk"))
  $l.TargetPath = $browser
  $l.Arguments = "--app=`"$url`""
  $l.IconLocation = "$ico,0"
  $l.Description = "AP Main"
  $l.Save()
}
Say "Done. Open AP Main with the gold AP Plastic icon on the Desktop or in the Start menu."
