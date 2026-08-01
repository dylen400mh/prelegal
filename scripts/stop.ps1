# Stop and remove the prelegal container (Windows / PowerShell).
$ErrorActionPreference = "Stop"

$Container = "prelegal"

if (docker rm -f $Container 2>$null) {
  Write-Host "prelegal stopped"
} else {
  Write-Host "prelegal is not running"
}
