#!/bin/bash

# 网盘资源分享文案生成器部署脚本

echo "🚀 开始部署网盘资源分享文案生成器..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

# 检查Docker Compose是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

# 停止并删除旧容器
echo "🔄 停止旧容器..."
docker-compose down

# 删除旧镜像
echo "🧹 清理旧镜像..."
docker rmi copywriting-generator_web 2>/dev/null || true

# 构建新镜像
echo "🔨 构建新镜像..."
docker-compose build --no-cache

# 启动服务
echo "🚀 启动服务..."
docker-compose up -d

# 检查服务状态
echo "📊 检查服务状态..."
sleep 5
docker-compose ps

# 检查服务是否正常运行
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ 部署成功！"
    echo "🌐 访问地址: http://localhost:3000"
    echo "🌐 外网访问: http://你的服务器IP:3000"
else
    echo "❌ 部署失败，请检查日志:"
    docker-compose logs
fi
