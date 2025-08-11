"use client"

import { useCallback, useEffect, useState } from "react"
import Cropper, { type Area } from "react-easy-crop"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Info } from "lucide-react"

type CoverCropperProps = {
  open?: boolean
  imageSrc?: string
  aspect?: number
  onClose?: () => void
  onApply?: (blobUrl: string, blob: Blob) => void
  allowExport?: boolean // 对外链图像可能无法导出，允许显示提示
}

// 预设的宽高比选项
const ASPECT_RATIOS = [
  { value: 0, label: "自适应（保持原比例）" },
  { value: 16/9, label: "16:9（横版视频）" },
  { value: 4/3, label: "4:3（传统横版）" },
  { value: 1, label: "1:1（正方形）" },
  { value: 3/4, label: "3:4（竖版）" },
  { value: 9/16, label: "9:16（手机竖版）" },
  { value: 2/1, label: "2:1（超宽横版）" },
  { value: 1/2, label: "1:2（超窄竖版）" },
]

async function createCroppedBlob(imageSrc: string, crop: Area): Promise<Blob> {
  const img = new Image()
  img.crossOrigin = "anonymous"
  img.src = imageSrc

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = (e) => reject(e)
  })

  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas not supported")

  canvas.width = Math.max(1, Math.floor(crop.width))
  canvas.height = Math.max(1, Math.floor(crop.height))

  // 将原图按照裁剪区域绘制到画布
  ctx.drawImage(
    img,
    Math.max(0, Math.floor(crop.x)),
    Math.max(0, Math.floor(crop.y)),
    Math.max(1, Math.floor(crop.width)),
    Math.max(1, Math.floor(crop.height)),
    0,
    0,
    canvas.width,
    canvas.height,
  )

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error("导出图片失败"))
      },
      "image/jpeg",
      0.92,
    )
  })
}

export default function CoverCropper({
  open = false,
  imageSrc = "",
  aspect = 0, // 默认改为0，表示自适应
  onClose = () => {},
  onApply = () => {},
  allowExport = true,
}: CoverCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1.2)
  const [areaPixels, setAreaPixels] = useState<Area | null>(null)
  const [exporting, setExporting] = useState(false)
  const [selectedAspect, setSelectedAspect] = useState(aspect)

  useEffect(() => {
    if (!open) {
      setCrop({ x: 0, y: 0 })
      setZoom(1.2)
      setAreaPixels(null)
      setExporting(false)
      setSelectedAspect(aspect)
    }
  }, [open, aspect])

  const onCropComplete = useCallback((_area: Area, areaPx: Area) => {
    setAreaPixels(areaPx)
  }, [])

  const handleApply = async () => {
    if (!imageSrc || !areaPixels) return
    try {
      setExporting(true)
      const blob = await createCroppedBlob(imageSrc, areaPixels)
      const url = URL.createObjectURL(blob)
      onApply(url, blob)
      onClose()
    } catch (e) {
      console.error(e)
      alert("导出失败：该图片不允许裁剪导出或浏览器限制。请尝试本地上传的图片。")
    } finally {
      setExporting(false)
    }
  }

  const currentAspectLabel = ASPECT_RATIOS.find(ratio => ratio.value === selectedAspect)?.label || "自适应"

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : null)}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>调整封面位置与裁剪</DialogTitle>
        </DialogHeader>

        {!allowExport ? (
          <Alert className="mb-2">
            <Info className="h-4 w-4" />
            <AlertDescription>
              当前为外链图片，可能因跨域导致无法导出裁剪后的结果。建议"本地上传"后再裁剪，成功率更高。
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="space-y-4">
          {/* 宽高比选择 */}
          <div className="space-y-2">
            <Label htmlFor="aspect-ratio">裁剪比例</Label>
            <Select value={selectedAspect.toString()} onValueChange={(v) => setSelectedAspect(parseFloat(v))}>
              <SelectTrigger id="aspect-ratio">
                <SelectValue placeholder="选择裁剪比例" />
              </SelectTrigger>
              <SelectContent>
                {ASPECT_RATIOS.map((ratio) => (
                  <SelectItem key={ratio.value} value={ratio.value.toString()}>
                    {ratio.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              当前选择：{currentAspectLabel} {selectedAspect > 0 ? `(${selectedAspect.toFixed(2)})` : ""}
            </p>
          </div>

          {/* 裁剪预览区域 */}
          <div className="relative w-full overflow-hidden rounded-md border bg-black/80" style={{
            aspectRatio: selectedAspect > 0 ? selectedAspect : 'auto',
            minHeight: '300px',
            maxHeight: '500px'
          }}>
            {imageSrc ? (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={selectedAspect > 0 ? selectedAspect : undefined}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                objectFit="cover"
                zoomWithScroll
                restrictPosition
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                {"未选择图片"}
              </div>
            )}
          </div>

          {/* 缩放控制 */}
          <div className="space-y-2">
            <Label htmlFor="zoom">缩放</Label>
            <Slider id="zoom" min={1} max={3} step={0.01} value={[zoom]} onValueChange={(v) => setZoom(v[0] ?? 1)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleApply} disabled={!imageSrc || !allowExport || exporting}>
            {exporting ? "导出中…" : "应用裁剪"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
