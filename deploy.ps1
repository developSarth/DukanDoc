# ==========================================================
# DukanDoc 1-Click AWS EC2 Automated Deployment Script
# ==========================================================

$EC2_IP   = "13.203.197.156"
$KEY_FILE = "dukandockey.pem"
$USER     = "ubuntu"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " DukanDoc Automated 1-Click Deployment to AWS EC2" -ForegroundColor Cyan
Write-Host " Target Instance: $USER@$EC2_IP" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Verify files exist
if (-not (Test-Path $KEY_FILE)) {
    Write-Error "Key file '$KEY_FILE' not found in current directory."
    exit 1
}
if (-not (Test-Path ".env")) {
    Write-Error "'.env' file not found in current directory."
    exit 1
}
if (-not (Test-Path "remote_setup.sh")) {
    Write-Error "'remote_setup.sh' not found in current directory."
    exit 1
}

# 2. Fix Windows permissions on private key
Write-Host "`n[1/4] Securing permissions on $KEY_FILE..." -ForegroundColor Yellow
icacls.exe $KEY_FILE /inheritance:r 2>$null | Out-Null
icacls.exe $KEY_FILE /grant:r "$($env:USERNAME):(R)" 2>$null | Out-Null
icacls.exe $KEY_FILE /remove:g "NT AUTHORITY\Authenticated Users" 2>$null | Out-Null
icacls.exe $KEY_FILE /remove:g "*S-1-5-11" 2>$null | Out-Null
icacls.exe $KEY_FILE /remove:g "BUILTIN\Users" 2>$null | Out-Null
icacls.exe $KEY_FILE /remove:g "Everyone" 2>$null | Out-Null
Write-Host "  -> Permissions secured successfully." -ForegroundColor Green

# 3. Upload .env directly to EC2
Write-Host "`n[2/4] Uploading .env secrets to EC2 server..." -ForegroundColor Yellow
scp -o StrictHostKeyChecking=no -i $KEY_FILE .env "${USER}@${EC2_IP}:/home/ubuntu/.env"
$exitCode = $LASTEXITCODE
if ($exitCode -ne 0) {
    Write-Error "Failed to upload .env to server."
    exit 1
}
Write-Host "  -> .env uploaded." -ForegroundColor Green

# 4. Upload remote setup bash script
Write-Host "`n[3/4] Uploading automated setup script to EC2..." -ForegroundColor Yellow
$content = Get-Content "remote_setup.sh" -Raw
$content = $content -replace "`r`n", "`n"
$tempScript = "$PSScriptRoot/remote_setup_unix.sh"
[System.IO.File]::WriteAllText($tempScript, $content, [System.Text.UTF8Encoding]::new($false))
scp -o StrictHostKeyChecking=no -i $KEY_FILE $tempScript "${USER}@${EC2_IP}:/home/ubuntu/remote_setup.sh"
$exitCode = $LASTEXITCODE
Remove-Item $tempScript -Force -ErrorAction SilentlyContinue
if ($exitCode -ne 0) {
    Write-Error "Failed to upload remote setup script."
    exit 1
}
Write-Host "  -> Setup script uploaded." -ForegroundColor Green

# 5. Run setup script on EC2
Write-Host "`n[4/4] Running automated setup on EC2 (installing Python, Node, Nginx, building app)..." -ForegroundColor Yellow
Write-Host "  -> This takes about 1-2 minutes. Please wait..." -ForegroundColor Gray
ssh -n -o StrictHostKeyChecking=no -i $KEY_FILE "${USER}@${EC2_IP}" "chmod +x /home/ubuntu/remote_setup.sh && /home/ubuntu/remote_setup.sh"
$exitCode = $LASTEXITCODE
if ($exitCode -ne 0) {
    Write-Error "Remote setup encountered an error."
    exit 1
}

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host " DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host " Your app is live at: http://$EC2_IP" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
