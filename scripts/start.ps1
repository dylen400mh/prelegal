# Build and start the prelegal container (Windows / PowerShell).
# The SQLite DB is created from scratch each time the container starts.
$ErrorActionPreference = "Stop"

$Image = "prelegal"
$Container = "prelegal"
$Port = if ($env:PORT) { $env:PORT } else { "8000" }

Set-Location (Join-Path $PSScriptRoot "..")

docker build -t $Image .
if ($LASTEXITCODE -ne 0) { throw "docker build failed" }

docker rm -f $Container 2>$null | Out-Null

$runArgs = @("run", "-d", "--name", $Container, "-p", "${Port}:8000")
if ($env:JWT_SECRET) { $runArgs += @("-e", "JWT_SECRET=$($env:JWT_SECRET)") }
$runArgs += $Image
docker @runArgs
if ($LASTEXITCODE -ne 0) { throw "docker run failed" }

Write-Host "prelegal is running at http://localhost:$Port"
