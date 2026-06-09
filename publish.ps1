param(
  [Parameter(Mandatory = $true)]
  [string]$RemoteUrl,

  [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path ".\index.html")) {
  throw "Please run this script from the seemountain-static directory."
}

if (-not (Test-Path ".\.git")) {
  git init
}

git branch -M $Branch

$existingRemote = git remote
if ($existingRemote -contains "origin") {
  git remote set-url origin $RemoteUrl
} else {
  git remote add origin $RemoteUrl
}

git add .

$hasChanges = git status --porcelain
if ($hasChanges) {
  git commit -m "Deploy SeeMountain static web demo"
} else {
  Write-Host "No local changes to commit."
}

git push -u origin $Branch

Write-Host ""
Write-Host "Pushed to $RemoteUrl"
Write-Host "Open the GitHub repository Settings -> Pages, then select GitHub Actions as the deployment source."
