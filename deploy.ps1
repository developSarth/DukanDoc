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

# 2. Fix permissions on private key
Write-Host "`n[1/4] Securing permissions on $KEY_FILE..." -ForegroundColor Yellow
icacls.exe $KEY_FILE /inheritance:r | Out-Null
icacls.exe $KEY_FILE /grant:r "$($env:USERNAME):(R)" | Out-Null
Write-Host "  -> Permissions secured." -ForegroundColor Green

# 3. Upload .env directly to EC2
Write-Host "`n[2/4] Uploading .env secrets to EC2 server..." -ForegroundColor Yellow
scp -o StrictHostKeyChecking=no -i $KEY_FILE .env "${USER}@${EC2_IP}:/home/ubuntu/.env"
Write-Host "  -> .env uploaded." -ForegroundColor Green

# 4. Upload remote setup bash script
Write-Host "`n[3/4] Uploading automated setup script to EC2..." -ForegroundColor Yellow
# Convert Windows CRLF to Linux LF for the bash script before upload
$content = Get-Content "remote_setup.sh" -Raw
$content = $content -replace "`r`n", "`n"
[System.IO.File]::WriteAllText("$PSScriptRoot/remote_setup_unix.sh", $content, [System.Text.UTF8Encoding]::new($false))
scp -o StrictHostKeyChecking=no -i $KEY_FILE "$PSScriptRoot/remote_setup_unix.sh" "${USER}@${EC2_IP}:/home/ubuntu/remote_setup.sh"
Remove-Item "$PSScriptRoot/remote_setup_unix.sh" -Force -ErrorAction SilentlyContinue
Write-Host "  -> Setup script uploaded." -ForegroundColor Green

# 5. Run setup script on EC2
Write-Host "`n[4/4] Running automated setup on EC2 (installing Python, Node, Nginx, building app)..." -ForegroundColor Yellow
Write-Host "  -> This takes about 1-2 minutes. Please wait..." -ForegroundColor Gray
ssh -o StrictHostKeyChecking=no -i $KEY_FILE "${USER}@${EC2_IP}" "chmod +x /home/ubuntu/remote_setup.sh && /home/ubuntu/remote_setup.sh"

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host " DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host " Your app is live at: http://$EC2_IP" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
