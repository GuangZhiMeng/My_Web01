#!/bin/bash
echo "�� 开始自动化部署网盘资源分享文案生成器..."
SERVER_IP="8.155.47.61"
DOMAIN="gzmabc.xyz"
if [ "$EUID" -ne 0 ]; then
    echo "❌ 请使用root用户运行此脚本"
    exit 1
fi
echo "🔄 更新系统..."
apt update && apt upgrade -y
echo "🐳 安装Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
systemctl start docker
systemctl enable docker
echo "📦 安装Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
echo "📂 解压项目文件..."
cd /root
tar -xzf copywriting-generator.tar.gz
cd copywriting-generator
chmod +x deploy.sh
echo "�� 执行Docker部署..."
./deploy.sh
echo "🌐 安装Nginx..."
apt install -y nginx
echo "⚙️ 配置Nginx..."
cat > /etc/nginx/sites-available/$DOMAIN << 'EOF2'
server {
    listen 80;
    server_name gzmabc.xyz www.gzmabc.xyz;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF2
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
echo "🛡️ 配置防火墙..."
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable
echo "🔒 安装SSL证书..."
apt install -y certbot python3-certbot-nginx
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
echo "🎉 部署完成！"
echo "访问地址: https://$DOMAIN"
