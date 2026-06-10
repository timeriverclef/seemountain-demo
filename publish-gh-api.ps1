param(
  [string]$Repo = "timeriverclef/seemountain-demo",
  [string]$Branch = "main",
  [string]$GhPath = "..\tools\gh\bin\gh.exe"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path ".\index.html")) {
  throw "Please run this script from the seemountain-static directory."
}

if (-not (Test-Path $GhPath)) {
  throw "GitHub CLI not found at $GhPath"
}

$tmp = Join-Path (Get-Location) ".deploy-api-tmp"
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
$root = (Get-Location).Path.TrimEnd('\')

function Invoke-GhApiText {
  param([string]$ApiPath)
  $previousPreference = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  $output = & $GhPath api $ApiPath 2>$null
  $exitCode = $LASTEXITCODE
  $ErrorActionPreference = $previousPreference
  return @{ ExitCode = $exitCode; Output = ($output -join "`n") }
}

function Write-JsonFile {
  param([string]$Path, [object]$Value)
  $json = $Value | ConvertTo-Json -Depth 10 -Compress
  [System.IO.File]::WriteAllText($Path, $json, [System.Text.UTF8Encoding]::new($false))
}

$branchCheck = Invoke-GhApiText "repos/$Repo/git/ref/heads/$Branch"
$branchExists = $branchCheck.ExitCode -eq 0

$files = Get-ChildItem -File -Recurse -Force |
  Where-Object {
    $fullName = $_.FullName
    $fullName -notlike "$root\.git\*" -and
    $fullName -notlike "$root\.deploy-api-tmp\*" -and
    $_.Name -notlike 'qa-*.png' -and
    $_.Name -notin @('token.txt', 'github_token.txt')
  } |
  Sort-Object FullName

$count = 0
foreach ($file in $files) {
  $relative = $file.FullName.Substring($root.Length + 1)
  $path = $relative -replace '\\', '/'
  $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
  $content = [Convert]::ToBase64String($bytes)

  $payload = @{
    message = if ($branchExists) { "Update $path" } else { "Initialize SeeMountain static web demo" }
    content = $content
  }

  if ($branchExists) {
    $payload.branch = $Branch
    $existing = Invoke-GhApiText "repos/$Repo/contents/$path`?ref=$Branch"
    if ($existing.ExitCode -eq 0 -and $existing.Output) {
      $payload.sha = (($existing.Output | ConvertFrom-Json).sha)
    }
  }

  $payloadPath = Join-Path $tmp ("content_$count.json")
  Write-JsonFile -Path $payloadPath -Value $payload

  & $GhPath api -X PUT "repos/$Repo/contents/$path" --input $payloadPath | Out-Null
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to upload $path"
  }

  $branchExists = $true
  $count += 1
}

& $GhPath api -X PATCH "repos/$Repo" -f default_branch=$Branch | Out-Null
Remove-Item -LiteralPath $tmp -Recurse -Force

Write-Host "Uploaded $count files to $Repo using GitHub Contents API."
