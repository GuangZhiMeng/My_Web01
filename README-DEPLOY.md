# 🚀 网盘资源分享文案生成器 - 部署指南

## 📋 部署方式选择

### 方式一：Docker部署（推荐）
最简单快速的部署方式，适合大多数用户。

### 方式二：直接部署
直接在服务器上安装Node.js环境。

## 🐳 Docker部署步骤

### 1. 准备服务器环境

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 启动Docker服务
sudo systemctl start docker
sudo systemctl enable docker
```

### 2. 上传项目文件

```bash
# 在本地打包项目
tar -czf copywriting-generator.tar.gz . --exclude=node_modules --exclude=.next

# 上传到服务器
scp copywriting-generator.tar.gz root@你的服务器IP:/root/

# 在服务器上解压
ssh root@你的服务器IP
cd /root
tar -xzf copywriting-generator.tar.gz
cd copywriting-generator
```

### 3. 一键部署

```bash
# 给部署脚本执行权限
chmod +x deploy.sh

# 执行部署
./deploy.sh
```

### 4. 配置域名和SSL（可选）

```bash
# 安装Nginx
sudo apt install nginx -y

# 配置Nginx
sudo cp nginx.conf /etc/nginx/sites-available/copywriting-generator
sudo ln -s /etc/nginx/sites-available/copywriting-generator /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 安装SSL证书（使用Let's Encrypt）
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

## 🔧 直接部署步骤

### 1. 安装Node.js

```bash
# 安装Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version
npm --version
```

### 2. 部署应用

```bash
# 克隆或上传项目
cd /var/www/
git clone your-repo-url copywriting-generator
cd copywriting-generator

# 安装依赖
npm install

# 构建项目
npm run build

# 启动服务
npm start
```

### 3. 配置PM2（进程管理）

```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start npm --name "copywriting-generator" -- start

# 设置开机自启
pm2 startup
pm2 save
```

## 🌐 域名配置

### 1. 购买域名
在阿里云、腾讯云等平台购买域名。

### 2. 解析设置
将域名解析到你的服务器IP地址。

### 3. 配置Nginx
参考上面的Nginx配置，替换域名和SSL证书路径。

## 🔒 SSL证书配置

### 使用Let's Encrypt（免费）

```bash
# 安装certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo crontab -e
# 添加以下行
0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 监控和维护

### 查看日志

```bash
# Docker方式
docker-compose logs -f

# 直接部署方式
pm2 logs copywriting-generator
```

### 更新应用

```bash
# Docker方式
git pull
./deploy.sh

# 直接部署方式
git pull
npm install
npm run build
pm2 restart copywriting-generator
```

### 备份数据

```bash
# 备份项目文件
tar -czf backup-$(date +%Y%m%d).tar.gz /var/www/copywriting-generator

# 备份数据库（如果有）
mysqldump -u username -p database_name > backup.sql
```

## 🚨 安全配置

### 1. 防火墙设置

```bash
# 只开放必要端口
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 2. 定期更新

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 更新Docker镜像
docker-compose pull
docker-compose up -d
```

## 📞 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   sudo netstat -tulpn | grep :3000
   sudo kill -9 PID
   ```

2. **权限问题**
   ```bash
   sudo chown -R $USER:$USER /var/www/copywriting-generator
   ```

3. **内存不足**
   ```bash
   # 增加swap空间
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

## 🎯 性能优化

### 1. 启用Gzip压缩

在Nginx配置中添加：
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

### 2. 配置缓存

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. 使用CDN

考虑使用阿里云CDN或腾讯云CDN加速静态资源。

## 📈 监控告警

### 1. 安装监控工具

```bash
# 安装htop
sudo apt install htop -y

# 安装netdata（实时监控）
bash <(curl -Ss https://my-netdata.io/kickstart.sh)
```

### 2. 设置告警

配置邮件或微信告警，监控服务器状态和应用可用性。

---

## 🎉 部署完成！

部署成功后，你可以通过以下地址访问：
- 本地访问：http://localhost:3000
- 外网访问：http://你的服务器IP:3000
- 域名访问：https://your-domain.com

如有问题，请查看日志文件或联系技术支持。
