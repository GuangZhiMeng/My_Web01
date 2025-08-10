# 🚀 Vercel 部署指南

## 📋 快速部署

### 方法一：GitHub集成（推荐）

1. **访问Vercel**：https://vercel.com
2. **使用GitHub账号登录**
3. **点击 "New Project"**
4. **选择仓库**：`GuangZhiMeng/My_Web01`
5. **点击 "Import"**
6. **配置设置**：
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
7. **点击 "Deploy"**

### 方法二：CLI部署

```bash
# 安装Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

## 🌐 自定义域名

1. **进入项目设置**
2. **添加域名**：`gzmabc.xyz`
3. **配置DNS记录**：
   - 类型：CNAME
   - 值：`your-project.vercel.app`

## ✅ 优势

- 自动HTTPS
- 全球CDN
- 实时部署
- 零配置
- 性能监控

## 🎯 完成

部署后访问：https://your-project.vercel.app

## 📊 部署状态

### 查看部署日志
1. 进入Vercel项目仪表板
2. 点击 "Deployments" 标签
3. 查看最新部署的详细日志

### 实时预览
- 每次推送代码都会自动创建预览部署
- 可以在合并前测试更改

## 🔄 自动部署

### GitHub集成
- 推送到 `main` 分支自动触发生产部署
- 创建Pull Request自动创建预览部署
- 合并Pull Request自动部署到生产环境

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

## 📈 性能优化

### Vercel自动优化
- ✅ 自动代码分割
- ✅ 图片优化
- ✅ 静态资源缓存
- ✅ 边缘函数

## 🔒 安全设置

### 自动安全功能
- ✅ HTTPS证书
- ✅ 安全头部
- ✅ DDoS保护
- ✅ 边缘安全

## 🎉 完成！

设置完成后，你的网盘资源分享文案生成器将：
- ✅ 自动部署到Vercel
- ✅ 通过自定义域名访问
- ✅ 享受全球CDN加速
- ✅ 获得企业级安全保护

访问地址：https://your-project.vercel.app 或 https://gzmabc.xyz
