<#
  Publishes this folder to GitHub Pages from your PERSONAL GitHub account
  (default: https://shipragupta14.github.io/).

  Your Microsoft work GitHub login is left untouched: this script uses its own
  gh profile in %USERPROFILE%\.gh-personal and ignores GH_TOKEN.

  Usage (from any terminal):
    powershell -NoProfile -ExecutionPolicy Bypass -File .\deploy.ps1

  First run opens a browser so you can sign in. Re-run any time to publish edits.
#>
$ErrorActionPreference = 'Continue'
Set-Location -LiteralPath $PSScriptRoot

function Fail([string]$msg) { Write-Host "`nERROR: $msg" -ForegroundColor Red; exit 1 }
function Run([string]$exe, [string[]]$argList) {
  & $exe @argList
  if ($LASTEXITCODE -ne 0) { Fail "$([IO.Path]::GetFileName($exe)) $($argList -join ' ') failed (exit $LASTEXITCODE)." }
}

# --- GitHub CLI, isolated from the work account -------------------------------
$gh = (Get-Command gh -ErrorAction SilentlyContinue).Source
if (-not $gh) {
  $gh = @("$env:ProgramFiles\GitHub CLI\gh.exe", "$env:LOCALAPPDATA\copilot-desktop-gh-2.98.0\gh.exe") |
    Where-Object { Test-Path $_ } | Select-Object -First 1
}
if (-not $gh) { Fail 'GitHub CLI not found. Install it with:  winget install GitHub.cli' }
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { Fail 'git not found. Install it with:  winget install Git.Git' }

Remove-Item Env:GH_TOKEN, Env:GITHUB_TOKEN, Env:GH_ENTERPRISE_TOKEN -ErrorAction SilentlyContinue
$env:GH_CONFIG_DIR = Join-Path $env:USERPROFILE '.gh-personal'
$env:GH_PROMPT_DISABLED = $null

& $gh auth status --hostname github.com *> $null
if ($LASTEXITCODE -ne 0) {
  Write-Host ''
  Write-Host 'Sign in with your PERSONAL GitHub account (Shipragupta14), not the Microsoft one.' -ForegroundColor Yellow
  Write-Host 'Tip: if the browser auto-signs you into the work account, use a private window.' -ForegroundColor DarkGray
  Write-Host ''
  Run $gh @('auth', 'login', '--hostname', 'github.com', '--git-protocol', 'ssh', '--skip-ssh-key', '--web')
}

$login = (& $gh api user --jq .login).Trim()
$uid = (& $gh api user --jq .id).Trim()
if (-not $login) { Fail 'Could not read your GitHub username.' }
if ($login -match '_(microsoft|msft)$') {
  & $gh auth logout --hostname github.com *> $null
  Fail "Signed in as '$login', which is a work account. Run this script again and sign in with your personal account."
}
Write-Host "[ok] Signed in as $login" -ForegroundColor Green

$repo = "$login.github.io"
$site = "https://$($login.ToLower()).github.io/"

# Link-preview tags must use the real domain.
$index = Join-Path $PSScriptRoot 'index.html'
$html = [IO.File]::ReadAllText($index)
$fixed = $html.Replace('https://shipragupta14.github.io/', $site)
if ($fixed -ne $html) { [IO.File]::WriteAllText($index, $fixed, (New-Object Text.UTF8Encoding($false))) }

# --- Local git repo (personal identity, private noreply email) ----------------
if (-not (Test-Path (Join-Path $PSScriptRoot '.git'))) { Run git @('init', '-b', 'main') }
Run git @('config', 'user.name', 'Shipra Gupta')
Run git @('config', 'user.email', "$uid+$login@users.noreply.github.com")
Run git @('add', '-A')
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
  $msg = "Publish interactive cover letter`n`nCo-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>"
  Run git @('commit', '-q', '-m', $msg)
}
Run git @('branch', '-M', 'main')

# --- Create the repo if needed, then push -------------------------------------
& $gh repo view "$login/$repo" --json name *> $null
if ($LASTEXITCODE -ne 0) {
  Run $gh @('repo', 'create', "$login/$repo", '--public', '--description', 'Shipra Gupta - interactive cover letter', '--homepage', $site)
  Write-Host "[ok] Created github.com/$login/$repo" -ForegroundColor Green
}

$remote = "https://github.com/$login/$repo.git"
git remote get-url origin *> $null
if ($LASTEXITCODE -ne 0) { Run git @('remote', 'add', 'origin', $remote) } else { Run git @('remote', 'set-url', 'origin', $remote) }

$helper = "!'" + ($gh -replace '\\', '/') + "' auth git-credential"
Run git @('-c', 'credential.helper=', '-c', "credential.helper=$helper", 'push', '-u', 'origin', 'main')
Write-Host '[ok] Pushed' -ForegroundColor Green

# --- Turn on GitHub Pages ------------------------------------------------------
& $gh api "repos/$login/$repo/pages" *> $null
if ($LASTEXITCODE -ne 0) {
  & $gh api -X POST "repos/$login/$repo/pages" -f 'source[branch]=main' -f 'source[path]=/' *> $null
}

Write-Host "`nWaiting for GitHub Pages to go live (usually 1-2 minutes)..." -ForegroundColor Cyan
$live = $false
for ($i = 0; $i -lt 50 -and -not $live; $i++) {
  try {
    $r = Invoke-WebRequest -Uri "${site}?_=$i" -UseBasicParsing -TimeoutSec 10
    $live = ($r.StatusCode -eq 200 -and $r.Content -match 'Shipra Gupta')
  } catch { }
  if (-not $live) { Start-Sleep -Seconds 6 }
}

Write-Host ''
if ($live) { Write-Host "[ok] LIVE: $site" -ForegroundColor Green }
else { Write-Host "Published. GitHub is still building; it will appear shortly at $site" -ForegroundColor Yellow }
Write-Host "  Personalized example: ${site}?company=Contoso&name=Priya"
Write-Host "  Link builder:         ${site}link-builder.html"
