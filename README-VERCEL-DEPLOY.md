# 🚀 Vercel 部署指南

## 📋 概述

Vercel是Next.js的官方部署平台，提供：
- ✅ 自动部署
- ✅ 全球CDN
- ✅ HTTPS证书
- ✅ 自定义域名
- ✅ 实时预览
- ✅ 零配置部署

## 🔧 部署步骤

### 方法一：通过Vercel CLI部署

#### 第一步：安装Vercel CLI
```bash
# 全局安装Vercel CLI
npm install -g vercel

# 或者使用npx
npx vercel
```

#### 第二步：登录Vercel
```bash
vercel login
```

#### 第三步：部署项目
```bash
# 在项目根目录执行
vercel

# 或者指定生产环境
vercel --prod
```

### 方法二：通过GitHub集成部署

#### 第一步：推送代码到GitHub
```bash
git add .
git commit -m "Add Vercel deployment configuration"
git push origin main
```

#### 第二步：连接Vercel和GitHub
1. **访问Vercel**：https://vercel.com
2. **使用GitHub账号登录**
3. **点击 "New Project"**
4. **选择你的GitHub仓库**：`GuangZhiMeng/My_Web01`
5. **点击 "Import"**

#### 第三步：配置部署设置
- **Framework Preset**: Next.js (自动检测)
- **Root Directory**: `./` (默认)
- **Build Command**: `npm run build` (默认)
- **Output Directory**: `.next` (默认)
- **Install Command**: `npm install` (默认)

#### 第四步：环境变量配置（如果需要）
在Vercel项目设置中添加环境变量：
- `NODE_ENV`: `production`

#### 第五步：点击 "Deploy"

### 方法三：直接拖拽部署

1. **访问Vercel**：https://vercel.com
2. **登录账号**
3. **点击 "New Project"**
4. **选择 "Upload"**
5. **拖拽项目文件夹到上传区域**
6. **配置部署设置**
7. **点击 "Deploy"**

## 🌐 自定义域名配置

### 添加自定义域名
1. **进入Vercel项目仪表板**
2. **点击 "Settings" 标签**
3. **选择 "Domains"**
4. **添加域名**：`gzmabc.xyz`
5. **配置DNS记录**

### DNS配置
在阿里云域名管理中添加以下记录：

**CNAME记录：**
- 记录类型：CNAME
- 主机记录：@
- 记录值：`your-project.vercel.app`
- TTL：10分钟

**或者使用A记录：**
- 记录类型：A
- 主机记录：@
- 记录值：`76.76.19.76`
- TTL：10分钟

## 📊 部署状态监控

### 查看部署日志
1. **进入Vercel项目仪表板**
2. **点击 "Deployments" 标签**
3. **查看最新部署的详细日志**

### 实时预览
- 每次推送代码都会自动创建预览部署
- 可以在合并前测试更改

## 🔄 自动部署

### GitHub集成
- 推送到 `main` 分支自动触发生产部署
- 创建Pull Request自动创建预览部署
- 合并Pull Request自动部署到生产环境

### 手动部署
```bash
# 部署到预览环境
vercel

# 部署到生产环境
vercel --prod
```

## 🛠️ 故障排除

### 常见问题

1. **构建失败**
   - 检查 `package.json` 中的依赖
   - 查看构建日志中的错误信息
   - 确保所有依赖都已安装

2. **环境变量问题**
   - 在Vercel项目设置中配置环境变量
   - 确保变量名称和值正确

3. **域名解析问题**
   - 检查DNS记录配置
   - 等待DNS传播（可能需要几分钟）

### 调试命令
```bash
# 本地测试构建
npm run build

# 本地测试生产环境
npm run start

# 检查Vercel配置
vercel --debug
```

## 📈 性能优化

### Vercel自动优化
- ✅ 自动代码分割
- ✅ 图片优化
- ✅ 静态资源缓存
- ✅ 边缘函数

### 手动优化建议
1. **使用Next.js Image组件**
2. **启用静态生成**
3. **优化字体加载**
4. **减少JavaScript包大小**

## 🔒 安全设置

### 自动安全功能
- ✅ HTTPS证书
- ✅ 安全头部
- ✅ DDoS保护
- ✅ 边缘安全

### 自定义安全配置
在 `vercel.json` 中配置安全头部：
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

## 📱 移动端优化

### 响应式设计
- ✅ 自动适配移动设备
- ✅ 触摸友好的交互
- ✅ 优化的加载速度

## 🎯 部署完成后的功能

部署成功后，你的网盘资源分享文案生成器将具备：
- ✅ 全球CDN加速
- ✅ 自动HTTPS
- ✅ 实时部署
- ✅ 性能监控
- ✅ 错误追踪
- ✅ 自定义域名支持

## 📞 支持

- **Vercel文档**：https://vercel.com/docs
- **Next.js文档**：https://nextjs.org/docs
- **社区支持**：https://github.com/vercel/vercel/discussions

## 🎉 完成！

设置完成后，你的应用将：
- 自动部署到Vercel
- 通过自定义域名访问
- 享受全球CDN加速
- 获得企业级安全保护

访问地址：https://your-project.vercel.app 或 https://gzmabc.xyz
