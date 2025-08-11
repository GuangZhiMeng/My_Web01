"use client"

import React, { useCallback, useRef, useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Download, Palette, Type, Image as ImageIcon, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

type ImageGeneratorProps = {
  open?: boolean
  resourceName: string
  coverUrl?: string
  onClose?: () => void
}

// 预设的样式主题
const STYLE_THEMES = [
  { value: "modern", label: "现代简约", gradient: "from-blue-500 to-purple-600", description: "适合软件、应用类资源" },
  { value: "gradient", label: "渐变炫彩", gradient: "from-pink-500 via-red-500 to-yellow-500", description: "适合创意、设计类资源" },
  { value: "dark", label: "深色科技", gradient: "from-gray-900 via-purple-900 to-violet-900", description: "适合游戏、技术类资源" },
  { value: "nature", label: "自然清新", gradient: "from-green-400 to-blue-500", description: "适合壁纸、自然类资源" },
  { value: "warm", label: "温暖橙色", gradient: "from-orange-400 to-red-500", description: "适合书籍、阅读类资源" },
  { value: "ocean", label: "海洋蓝调", gradient: "from-cyan-500 to-blue-500", description: "适合课程、学习类资源" },
  { value: "sunset", label: "日落紫红", gradient: "from-pink-500 to-orange-500", description: "适合音乐、艺术类资源" },
  { value: "forest", label: "森林绿意", gradient: "from-emerald-500 to-teal-500", description: "适合资料、报告类资源" },
  { value: "business", label: "商务专业", gradient: "from-slate-600 to-blue-700", description: "适合商务、专业类资源" },
  { value: "creative", label: "创意多彩", gradient: "from-violet-500 via-purple-500 to-pink-500", description: "适合创意、艺术类资源" },
]

// 字体选项
const FONT_OPTIONS = [
  { value: "sans", label: "无衬线体", font: "font-sans", description: "现代简洁" },
  { value: "serif", label: "衬线体", font: "font-serif", description: "传统优雅" },
  { value: "mono", label: "等宽体", font: "font-mono", description: "技术感强" },
]

export default function ImageGenerator({
  open = false,
  resourceName = "",
  coverUrl = "",
  onClose = () => {},
}: ImageGeneratorProps) {
  const [style, setStyle] = useState("modern")
  const [font, setFont] = useState("sans")
  const [fontSize, setFontSize] = useState(48)
  const [showCover, setShowCover] = useState(true)
  const [coverOpacity, setCoverOpacity] = useState(0.3)
  const [textColor, setTextColor] = useState("#ffffff")
  const [showShadow, setShowShadow] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [imageSize, setImageSize] = useState("1200x630")
  const [coverPosition, setCoverPosition] = useState("right")
  const [textPosition, setTextPosition] = useState("center")
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const selectedTheme = STYLE_THEMES.find(t => t.value === style) || STYLE_THEMES[0]
  const selectedFont = FONT_OPTIONS.find(f => f.value === font) || FONT_OPTIONS[0]

  const generateImage = useCallback(async () => {
    if (!resourceName.trim()) return
    
    setGenerating(true)
    
    try {
      const canvas = canvasRef.current
      if (!canvas) return
      
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      // 设置画布尺寸
      const [width, height] = imageSize.split('x').map(Number)
      canvas.width = width
      canvas.height = height
      
      // 创建渐变背景
      const gradient = ctx.createLinearGradient(0, 0, width, height)
      const [fromColor, toColor] = selectedTheme.gradient.split(' ').slice(1, 3)
      
      // 简单的颜色映射（实际项目中可以使用更复杂的颜色解析）
      const colorMap: Record<string, string> = {
        'blue-500': '#3b82f6',
        'purple-600': '#9333ea',
        'pink-500': '#ec4899',
        'red-500': '#ef4444',
        'yellow-500': '#eab308',
        'gray-900': '#111827',
        'violet-900': '#4c1d95',
        'green-400': '#4ade80',
        'orange-400': '#fb923c',
        'cyan-500': '#06b6d4',
        'emerald-500': '#10b981',
        'teal-500': '#14b8a6',
      }
      
      gradient.addColorStop(0, colorMap[fromColor] || '#3b82f6')
      gradient.addColorStop(1, colorMap[toColor] || '#9333ea')
      
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
      
      // 如果有封面图且需要显示
      if (showCover && coverUrl) {
        try {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve()
            img.onerror = reject
            img.src = coverUrl
          })
          
          // 计算封面图的位置和大小
          const coverSize = Math.min(width, height) * 0.4
          let coverX, coverY
          
          switch (coverPosition) {
            case "left":
              coverX = 50
              break
            case "center":
              coverX = (width - coverSize) / 2
              break
            case "right":
            default:
              coverX = width - coverSize - 50
              break
          }
          coverY = (height - coverSize) / 2
          
          // 设置透明度
          ctx.globalAlpha = coverOpacity
          ctx.drawImage(img, coverX, coverY, coverSize, coverSize)
          ctx.globalAlpha = 1
        } catch (error) {
          console.warn('封面图加载失败:', error)
        }
      }
      
      // 绘制文字
      ctx.fillStyle = textColor
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // 设置字体
      const fontFamily = font === 'sans' ? 'Arial, sans-serif' : 
                        font === 'serif' ? 'Times New Roman, serif' : 
                        'Courier New, monospace'
      
      ctx.font = `bold ${fontSize}px ${fontFamily}`
      
      // 添加文字阴影
      if (showShadow) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
        ctx.shadowBlur = 10
        ctx.shadowOffsetX = 2
        ctx.shadowOffsetY = 2
      }
      
      // 文字换行处理
      const maxWidth = width * 0.8
      const words = resourceName.split('')
      const lines: string[] = []
      let currentLine = ''
      
      for (const char of words) {
        const testLine = currentLine + char
        const metrics = ctx.measureText(testLine)
        
        if (metrics.width > maxWidth && currentLine !== '') {
          lines.push(currentLine)
          currentLine = char
        } else {
          currentLine = testLine
        }
      }
      if (currentLine) {
        lines.push(currentLine)
      }
      
      // 绘制多行文字
      const lineHeight = fontSize * 1.2
      const totalHeight = lines.length * lineHeight
      let startY
      
      switch (textPosition) {
        case "top":
          startY = 100
          break
        case "bottom":
          startY = height - totalHeight - 100
          break
        case "center":
        default:
          startY = (height - totalHeight) / 2
          break
      }
      
      lines.forEach((line, index) => {
        const y = startY + index * lineHeight
        ctx.fillText(line, width / 2, y)
      })
      
      // 重置阴影
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      
    } catch (error) {
      console.error('生成图片失败:', error)
    } finally {
      setGenerating(false)
    }
  }, [resourceName, coverUrl, style, font, fontSize, showCover, coverOpacity, textColor, showShadow, selectedTheme])

  const downloadImage = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const link = document.createElement('a')
    link.download = `${resourceName}-封面图.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [resourceName])

  // 当参数变化时重新生成
  const regenerate = useCallback(() => {
    if (open && resourceName.trim()) {
      generateImage()
    }
  }, [open, resourceName, generateImage])

  // 监听参数变化自动重新生成
  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(regenerate, 100)
      return () => clearTimeout(timer)
    }
  }, [open, regenerate, style, font, fontSize, showCover, coverOpacity, textColor, showShadow, imageSize, coverPosition, textPosition])

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : null)}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            生成封面图片
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：预览区域 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>预览效果</Label>
              <div 
                className="relative w-full overflow-hidden rounded-lg border bg-gray-100"
                style={{
                  aspectRatio: imageSize === "1200x630" ? "1200/630" :
                               imageSize === "1080x1080" ? "1/1" :
                               imageSize === "1920x1080" ? "16/9" :
                               imageSize === "1080x1920" ? "9/16" :
                               imageSize === "800x600" ? "4/3" : "1200/630"
                }}
              >
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-contain"
                />
                {generating && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="text-white font-medium">生成中...</div>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                当前尺寸：{imageSize} 像素
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={regenerate}
                disabled={generating || !resourceName.trim()}
                className="flex-1"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                重新生成
              </Button>
              <Button
                onClick={downloadImage}
                disabled={generating || !resourceName.trim()}
                variant="outline"
              >
                <Download className="mr-2 h-4 w-4" />
                下载图片
              </Button>
            </div>
          </div>

          {/* 右侧：设置面板 */}
          <div className="space-y-6">
            {/* 图片尺寸 */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                图片尺寸
              </Label>
              <Select value={imageSize} onValueChange={setImageSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1200x630">1200x630 (社交媒体)</SelectItem>
                  <SelectItem value="1080x1080">1080x1080 (正方形)</SelectItem>
                  <SelectItem value="1920x1080">1920x1080 (横版)</SelectItem>
                  <SelectItem value="1080x1920">1080x1920 (竖版)</SelectItem>
                  <SelectItem value="800x600">800x600 (传统)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 样式主题 */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                样式主题
              </Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STYLE_THEMES.map((theme) => (
                    <SelectItem key={theme.value} value={theme.value}>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-4 h-4 rounded", `bg-gradient-to-r ${theme.gradient}`)} />
                        <div>
                          <div className="font-medium">{theme.label}</div>
                          <div className="text-xs text-muted-foreground">{theme.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 字体设置 */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                字体设置
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <Select value={font} onValueChange={setFont}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="space-y-2">
                  <Label className="text-xs">字体大小</Label>
                  <Slider
                    min={24}
                    max={80}
                    step={2}
                    value={[fontSize]}
                    onValueChange={(v) => setFontSize(v[0] || 48)}
                  />
                  <span className="text-xs text-muted-foreground">{fontSize}px</span>
                </div>
              </div>
            </div>

            {/* 布局设置 */}
            <div className="space-y-3">
              <Label>布局设置</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">文字位置</Label>
                  <Select value={textPosition} onValueChange={setTextPosition}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">顶部</SelectItem>
                      <SelectItem value="center">居中</SelectItem>
                      <SelectItem value="bottom">底部</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {coverUrl && (
                  <div className="space-y-2">
                    <Label className="text-xs">封面位置</Label>
                    <Select value={coverPosition} onValueChange={setCoverPosition}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">左侧</SelectItem>
                        <SelectItem value="center">居中</SelectItem>
                        <SelectItem value="right">右侧</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* 封面图设置 */}
            {coverUrl && (
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  封面图设置
                </Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">显示封面图</span>
                    <Switch checked={showCover} onCheckedChange={setShowCover} />
                  </div>
                  
                  {showCover && (
                    <div className="space-y-2">
                      <Label className="text-xs">封面透明度</Label>
                      <Slider
                        min={0.1}
                        max={0.8}
                        step={0.05}
                        value={[coverOpacity]}
                        onValueChange={(v) => setCoverOpacity(v[0] || 0.3)}
                      />
                      <span className="text-xs text-muted-foreground">{Math.round(coverOpacity * 100)}%</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 文字效果 */}
            <div className="space-y-3">
              <Label>文字效果</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">文字阴影</span>
                  <Switch checked={showShadow} onCheckedChange={setShowShadow} />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs">文字颜色</Label>
                  <div className="flex gap-2">
                    {['#ffffff', '#000000', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'].map((color) => (
                      <button
                        key={color}
                        onClick={() => setTextColor(color)}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-all",
                          textColor === color ? "border-gray-800 scale-110" : "border-gray-300 hover:scale-105"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
