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
