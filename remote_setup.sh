#!/bin/bash
set -e

echo "=========================================================="
echo " Starting DukanDoc Automated EC2 Deployment"
echo "=========================================================="

echo "[1/6] Updating apt packages and installing system tools..."
sudo apt-get update -y
sudo apt-get install -y python3 python3-pip python3-venv git nginx curl

# Install Node.js 20 LTS if not present
if ! command -v node &> /dev/null; then
    echo "Installing Node.js 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo "[2/6] Syncing code repository..."
cd /home/ubuntu
if [ -d "DukanDoc" ]; then
    cd DukanDoc
    git reset --hard
    git pull origin main
else
    git clone https://github.com/developSarth/DukanDoc.git
    cd DukanDoc
fi

# Copy uploaded .env into place
if [ -f "/home/ubuntu/.env" ]; then
    cp /home/ubuntu/.env /home/ubuntu/DukanDoc/.env
    mkdir -p /home/ubuntu/DukanDoc/backend
    cp /home/ubuntu/.env /home/ubuntu/DukanDoc/backend/.env
    echo ".env copied to DukanDoc root and backend/"
fi

echo "[3/6] Setting up Python virtual environment..."
cd /home/ubuntu/DukanDoc
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo "[4/6] Creating Systemd service for FastAPI..."
sudo tee /etc/systemd/system/dukandoc-backend.service > /dev/null << 'EOF'
[Unit]
Description=DukanDoc FastAPI Backend Service
After=network.target

[Service]
User=ubuntu
Group=ubuntu
WorkingDirectory=/home/ubuntu/DukanDoc
Environment="PATH=/home/ubuntu/DukanDoc/venv/bin"
EnvironmentFile=/home/ubuntu/DukanDoc/.env
ExecStart=/home/ubuntu/DukanDoc/venv/bin/uvicorn backend.server:app --host 127.0.0.1 --port 8000 --workers 2

Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable dukandoc-backend
sudo systemctl restart dukandoc-backend

echo "[5/6] Building React Frontend..."
cd /home/ubuntu/DukanDoc
npm install
npm run build

sudo mkdir -p /var/www/dukandoc
sudo cp -r dist/* /var/www/dukandoc/
sudo chown -R www-data:www-data /var/www/dukandoc
sudo chmod -R 755 /var/www/dukandoc

echo "[6/6] Configuring Nginx reverse proxy..."
sudo tee /etc/nginx/sites-available/dukandoc > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        root /var/www/dukandoc;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 90s;
        proxy_send_timeout 90s;
        proxy_read_timeout 90s;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        root /var/www/dukandoc;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/dukandoc /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo ""
echo "=========================================================="
echo " DEPLOYMENT COMPLETE! App is LIVE at:"
echo " http://13.203.197.156"
echo "=========================================================="
