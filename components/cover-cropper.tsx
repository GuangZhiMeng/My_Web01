"use client"

import { useCallback, useEffect, useState } from "react"
import Cropper, { type Area } from "react-easy-crop"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

type CoverCropperProps = {
  open?: boolean
  imageSrc?: string
  aspect?: number
  onClose?: () => void
  onApply?: (blobUrl: string, blob: Blob) => void
  allowExport?: boolean // 对外链图像可能无法导出，允许显示提示
}

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
  aspect = 16 / 9,
  onClose = () => {},
  onApply = () => {},
  allowExport = true,
}: CoverCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1.2)
  const [areaPixels, setAreaPixels] = useState<Area | null>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (!open) {
      setCrop({ x: 0, y: 0 })
      setZoom(1.2)
      setAreaPixels(null)
      setExporting(false)
    }
  }, [open])

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

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : null)}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>调整封面位置与裁剪（16:9）</DialogTitle>
        </DialogHeader>

        {!allowExport ? (
          <Alert className="mb-2">
            <Info className="h-4 w-4" />
            <AlertDescription>
              当前为外链图片，可能因跨域导致无法导出裁剪后的结果。建议“本地上传”后再裁剪，成功率更高。
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-black/80">
          {imageSrc ? (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
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

        <div className="space-y-2">
          <Label htmlFor="zoom">缩放</Label>
          <Slider id="zoom" min={1} max={3} step={0.01} value={[zoom]} onValueChange={(v) => setZoom(v[0] ?? 1)} />
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
