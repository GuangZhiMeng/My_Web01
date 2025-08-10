# 🚀 GitHub Actions 自动部署指南

## 📋 概述

这个项目使用 GitHub Actions 自动部署到阿里云 ECS 服务器。每次推送到 main/master 分支时，会自动构建并部署应用。

## 🔧 设置步骤

### 第一步：创建 GitHub 仓库

1. **在 GitHub 上创建新仓库**
   - 访问 https://github.com/new
   - 仓库名称：`copywriting-generator`
   - 选择 Public 或 Private
   - 不要初始化 README（我们会上传现有代码）

2. **上传项目代码**
   ```bash
   # 在本地项目目录执行
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/你的用户名/copywriting-generator.git
   git push -u origin main
   ```

### 第二步：配置 GitHub Secrets

1. **进入仓库设置**
   - 在 GitHub 仓库页面点击 "Settings"
   - 左侧菜单选择 "Secrets and variables" → "Actions"

2. **添加以下 Secrets**
   - `ALIYUN_HOST`: `8.155.47.61`
   - `ALIYUN_USERNAME`: `root`
   - `ALIYUN_PASSWORD`: `123456` (或你设置的密码)
   - `ALIYUN_PORT`: `22`

### 第三步：修复服务器SSH连接

在阿里云控制台使用"发送远程命令"功能执行：

```bash
# 启动SSH服务
systemctl start sshd
systemctl enable sshd

# 设置root密码
echo 'root:123456' | chpasswd

# 启用密码认证
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config
sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config

# 重启SSH服务
systemctl restart sshd

# 检查SSH服务状态
systemctl status sshd
```

### 第四步：配置域名解析

在阿里云控制台：
1. 进入域名管理
2. 找到 `gzmabc.xyz`
3. 添加解析记录：
   - 记录类型：A
   - 主机记录：@
   - 记录值：8.155.47.61
   - 再添加一条：
   - 记录类型：A
   - 主机记录：www
   - 记录值：8.155.47.61

### 第五步：配置安全组

在阿里云ECS控制台：
1. 找到你的实例
2. 点击"安全组"
3. 添加入方向规则：
   - 端口范围：22/22 (SSH)
   - 授权对象：0.0.0.0/0
   - 端口范围：80/80 (HTTP)
   - 授权对象：0.0.0.0/0
   - 端口范围：443/443 (HTTPS)
   - 授权对象：0.0.0.0/0

## 🚀 触发部署

### 自动部署
- 推送代码到 main/master 分支会自动触发部署
- 在 GitHub 仓库页面可以看到 Actions 标签页

### 手动部署
1. 进入 GitHub 仓库
2. 点击 "Actions" 标签
3. 选择 "Deploy to Aliyun ECS" 工作流
4. 点击 "Run workflow" 按钮

## 📊 部署状态

### 查看部署日志
1. 进入 GitHub 仓库
2. 点击 "Actions" 标签
3. 点击最新的工作流运行
4. 查看详细日志

### 检查服务器状态
```bash
# 连接到服务器
ssh root@8.155.47.61

# 检查Docker容器状态
docker-compose ps

# 查看应用日志
docker-compose logs -f

# 检查Nginx状态
systemctl status nginx
```

## 🌐 访问地址

部署成功后，可以通过以下地址访问：
- **HTTP**: http://gzmabc.xyz
- **IP直接访问**: http://8.155.47.61:3000

## 🔒 SSL证书配置（可选）

如果需要HTTPS，可以在服务器上执行：

```bash
# 安装certbot
yum install -y certbot python3-certbot-nginx

# 获取SSL证书
certbot --nginx -d gzmabc.xyz -d www.gzmabc.xyz

# 设置自动续期
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
```

## 🛠️ 故障排除

### 常见问题

1. **SSH连接失败**
   - 检查安全组是否开放22端口
   - 确认SSH服务正在运行
   - 验证GitHub Secrets中的密码正确

2. **部署失败**
   - 查看GitHub Actions日志
   - 检查服务器磁盘空间
   - 确认Docker服务正常运行

3. **域名无法访问**
   - 检查域名解析是否正确
   - 确认Nginx配置正确
   - 验证防火墙设置

### 手动修复

如果自动部署失败，可以手动执行：

```bash
# 连接到服务器
ssh root@8.155.47.61

# 进入项目目录
cd /root/copywriting-generator

# 重新构建和启动
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# 检查状态
docker-compose ps
```

## 📈 监控和维护

### 查看资源使用情况
```bash
# 查看系统资源
htop

# 查看磁盘使用
df -h

# 查看内存使用
free -h
```

### 更新应用
1. 修改代码
2. 推送到GitHub
3. 自动触发部署

### 备份数据
```bash
# 备份项目文件
tar -czf backup-$(date +%Y%m%d).tar.gz /root/copywriting-generator
```

## 🎉 完成！

设置完成后，你的网盘资源分享文案生成器将：
- ✅ 自动部署到阿里云服务器
- ✅ 支持域名访问
- ✅ 自动重启和恢复
- ✅ 便于维护和更新

如有问题，请查看GitHub Actions日志或联系技术支持。
