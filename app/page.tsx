"use client"

import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Copy, ExternalLink, ImagePlus, Loader2, RotateCcw, Scissors, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import CoverCropper from "@/components/cover-cropper"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Accent wrapper (dopamine colors)
function AccentCard({
  children,
  gradient = "from-sky-300 via-fuchsia-300 to-emerald-300",
  className = "",
}: {
  children: React.ReactNode
  gradient?: string
  className?: string
}) {
  return (
    <div className={cn("relative", className)}>
      <div className={cn("absolute inset-x-0 top-0 h-1 rounded-t-xl bg-gradient-to-r", gradient)} />
      <Card className="rounded-xl border border-muted shadow-sm">{children}</Card>
    </div>
  )
}

type Tone = "plain" | "marketing" | "fun" | "pro" | "warm" | "trendy"
type Category =
  | "app"
  | "video"
  | "course"
  | "ebook"
  | "template"
  | "music"
  | "game"
  | "font"
  | "wallpaper"
  | "data"
  | "dev"
  | "unknown"

type LengthKind = "short" | "medium" | "long"

const CATEGORY_LABEL: Record<Category, string> = {
  app: "软件/应用",
  video: "影视/剧集",
  course: "课程/教程",
  ebook: "电子书/资料",
  template: "模板/素材",
  music: "音乐/音频",
  game: "游戏/资源",
  font: "字体",
  wallpaper: "壁纸",
  data: "资料/报告",
  dev: "源码/项目",
  unknown: "未识别",
}

// 文案长度范围
const LENGTH_RANGE: Record<LengthKind, { min: number; max: number; label: string }> = {
  short: { min: 10, max: 50, label: "10~50字" },
  medium: { min: 50, max: 100, label: "50~100字" },
  long: { min: 100, max: 200, label: "100~200字" },
}

// —— 分类 + 文案 —— //
function classifyResource(rawName: string) {
  const name = normalize(rawName)
  const buckets: Record<Category, string[]> = {
    app: [
      "软件",
      "app",
      "应用",
      "工具",
      "助手",
      "神器",
      "客户端",
      "mac",
      "win",
      "安卓",
      "android",
      "ios",
      "播放器",
      "浏览器",
      "插件",
      "扩展",
      "ocr",
      "pdf工具",
      "压缩",
      "录屏",
      "剪辑",
      "去广告",
      "清理",
      "启动器",
      "tv",
      "盒子",
      "影院",
      "追剧",
      "观影",
      "影视",
      "片源",
    ],
    video: ["电影", "电视剧", "综艺", "番剧", "动漫", "纪录片", "片单", "蓝光", "1080p", "4k", "剧集", "片源合集"],
    course: ["课程", "教程", "训练营", "网课", "课件", "实战", "视频课", "系统课", "合集课"],
    ebook: ["电子书", "书籍", "pdf", "mobi", "epub", "读物", "手册", "白皮书", "教辅"],
    template: [
      "模板",
      "素材",
      "psd",
      "ai",
      "ae",
      "pr",
      "figma",
      "sketch",
      "ppt",
      "word",
      "excel",
      "海报",
      "插画",
      "图标",
    ],
    music: ["音乐", "专辑", "无损", "flac", "mp3", "wav", "音频", "有声书", "铃声", "歌单"],
    game: ["游戏", "mod", "存档", "整合包", "dlc", "汉化", "联机", "模拟器", "switch", "ps", "steam"],
    font: ["字体", "字库", "ttf", "otf", "woff"],
    wallpaper: ["壁纸", "4k壁纸", "桌面", "无水印", "手机壁纸"],
    data: ["资料", "笔记", "讲义", "真题", "题库", "课件", "报告", "论文", "数据集", "表格"],
    dev: ["源码", "源代码", "项目", "脚本", "demo", "sdk", "库", "component", "template repo"],
    unknown: [],
  }

  const matches: { cat: Category; hits: string[] }[] = []
  for (const cat of Object.keys(buckets) as Category[]) {
    if (cat === "unknown") continue
    const hits = buckets[cat].filter((kw) => name.includes(normalize(kw)))
    if (hits.length) matches.push({ cat, hits })
  }

  if (!matches.length) {
    if (/[追看观]剧|追番|观影|看片|片源/.test(name)) {
      return { category: "app" as Category, matched: ["追剧/观影"], reason: "包含追剧/观影相关词" }
    }
    return { category: "unknown" as Category, matched: [], reason: "未命中关键词" }
  }

  const maxHit = Math.max(...matches.map((m) => m.hits.length))
  const top = matches.filter((m) => m.hits.length === maxHit)
  const priority: Category[] = [
    "app",
    "course",
    "video",
    "template",
    "ebook",
    "dev",
    "data",
    "game",
    "music",
    "font",
    "wallpaper",
  ]
  const category = top.length === 1 ? top[0].cat : priority.find((p) => top.some((t) => t.cat === p)) || top[0].cat
  const mergedHits = Array.from(new Set(matches.filter((m) => m.cat === category).flatMap((m) => m.hits)))
  return { category, matched: mergedHits, reason: mergedHits.length ? "命中关键词" : "多类别命中，综合判断" }
}

function normalize(s: string) {
  return s.normalize("NFKC").toLowerCase().trim()
}
function limitChars(input: string, max: number) {
  return input.length <= max ? input : input.slice(0, max)
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function keywordExtras(hints: string[]): string[] {
  if (!hints.length) return []
  const uniq = Array.from(new Set(hints)).slice(0, 3)
  return [`按关键词整理：${uniq.join("/")}。`]
}

function extraFragments(category: Category, isDramaApp: boolean): string[] {
  const generic = [
    "结构清晰、取用便捷，减少检索与筛选时间。",
    "适合日常使用与长期收藏，随用随取更省心。",
    "包含基础说明与注意事项，新手也能快速上手。",
    "建议转存至个人网盘，避免失效与遗漏。",
  ]
  const app = [
    "界面清爽不打扰，核心功能直达，不用冗余设置。",
    "支持快捷搜索与分类管理，常用场景一步到位。",
    "安装与更新步骤简单，兼容性与稳定性良好。",
  ]
  const drama = [
    "聚合片源与更新提醒，热门剧集不错过，追更体验顺滑。",
    "支持片单订阅与历史记录，想看就看，不再东找西翻。",
    "清晰度与加载速度表现稳定，观影过程更连贯。",
  ]
  const video = [
    "清晰度与音画表现优良，片单分类一目了然。",
    "按年份/类型/地区整理，检索效率更高。",
    "适合边看边收藏，方便后续回看与推荐。",
  ]
  const course = [
    "章节编排循序渐进，配套资料/练习题便于巩固。",
    "包含实操示例与要点总结，学完即可应用。",
    "适合从入门到进阶的连续学习。",
  ]
  const ebook = [
    "目录与书签完善，检索关键词更高效。",
    "排版清晰可读，适合做笔记与标注。",
    "重点内容覆盖完整，可作为日常参考。",
  ]
  const template = [
    "多风格多尺寸覆盖常见场景，改动门槛低。",
    "可编辑图层/组件规范，二次创作更高效。",
    "适合快速出图与团队协作提交。",
  ]
  const music = ["音质与标签整理良好，按曲风/专辑筛选更便捷。", "适合通勤/学习/办公等场景循环播放。"]
  const game = ["含必要的配置说明与注意事项，安装流程清晰。", "启动即玩，支持常见外设与分辨率设置。"]
  const font = ["字重覆盖常见场景，渲染清晰便于排版。", "商用前请自查授权，合理合规使用。"]
  const wallpaper = ["分辨率与观感表现良好，手机/桌面适配友好。", "风格多样，随心切换营造氛围。"]
  const data = ["分类标签清晰，检索路径明确。", "适用于备考/研究/工作参考，减少信息收集时间。"]
  const dev = ["目录结构与依赖说明规范，便于集成与复用。", "示例与 README 完整，二次开发上手快。"]

  const map: Record<Category, string[]> = {
    app: isDramaApp ? [...generic, ...app, ...drama] : [...generic, ...app],
    video: [...generic, ...video],
    course: [...generic, ...course],
    ebook: [...generic, ...ebook],
    template: [...generic, ...template],
    music: [...generic, ...music],
    game: [...generic, ...game],
    font: [...generic, ...font],
    wallpaper: [...generic, ...wallpaper],
    data: [...generic, ...data],
    dev: [...generic, ...dev],
    unknown: [...generic],
  }
  return map[category]
}

// 在范围内扩展，尽量对齐句子边界
function expandWithinRange(base: string, extras: string[], min: number, max: number, hardMax = 1000) {
  const pool = [...extras]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  let out = base
  let i = 0
  while (out.length < min && i < pool.length) {
    const sep = out.endsWith("。") || out.endsWith("！") || out.endsWith("～") ? "" : "。"
    out = `${out}${sep}${pool[i]}`
    i++
  }
  if (out.length > max) {
    const limit = Math.min(out.length, Math.max(max, min))
    const cutPunct = Math.max(out.lastIndexOf("。", limit), out.lastIndexOf("！", limit), out.lastIndexOf("～", limit))
    if (cutPunct >= Math.floor(min * 0.7)) {
      out = out.slice(0, cutPunct + 1)
    } else {
      out = limitChars(out, max)
    }
  }
  return limitChars(out, hardMax)
}

// 语气映射与轻量变换
function resolveBaseTone(tone: Tone): Exclude<Tone, "warm" | "trendy"> {
  if (tone === "warm") return "plain"
  if (tone === "trendy") return "fun"
  return tone
}
function stylizeByTone(text: string, tone: Tone, range: { min: number; max: number }) {
  let t = text
  if (tone === "warm") {
    t = t.replace(/！/g, "～")
    if (t.length < range.max - 6 && !/一起慢慢看/.test(t)) t = `${t}${t.endsWith("。") ? "" : "。"}一起慢慢看～`
  } else if (tone === "trendy") {
    if (!/[✨🔥⚡️]/u.test(t)) t = `✨${t}`
    t = t.replace(/推荐/g, "强推").replace(/分享/g, "速分享")
    if (t.length < range.max - 2 && !/[🔥]$/u.test(t)) t = `${t} 🔥`
  }
  return t
}

function genCopyByCategory(
  name: string,
  category: Category,
  tone: Tone,
  withHashtags: boolean,
  hints: string[],
  range: { min: number; max: number },
) {
  const cleanName = name.trim().replace(/\s+/g, " ")
  const baseTags = ["网盘资源", "值得收藏"]
  const tags = ` #${baseTags.join(" #")}`

  const isDramaApp =
    category === "app" &&
    (/[追看观]剧|追番|观影|影视|片源|影院|tv|盒子/.test(normalize(name)) || hints.includes("追剧/观影"))

  // 基础模板（删除了内嵌的 tags，标签统一在末尾追加）
  const templates: Record<Category, Record<Exclude<Tone, "warm" | "trendy">, ((n: string) => string)[]>> = {
    app: {
      plain: isDramaApp
        ? [
            (n) => `《${n}》追剧利器，聚合片源、更新提醒，界面清爽即开即用。`,
            (n) => `安利《${n}》，智能追更＋片源聚合，打开就能看，操作简单不折腾。`,
          ]
        : [
            (n) => `《${n}》，功能实用、上手即用，日常效率加倍。轻量稳定，值得长期收藏。`,
            (n) => `推荐《${n}》，常用场景一网打尽，安装即用少踩坑。`,
          ],
      marketing: isDramaApp
        ? [
            (n) => `追剧党的福音《${n}》！聚合片源＋追更提醒，清爽无干扰。现在入手～`,
            (n) => `高能推荐《${n}》，热门剧集快更不错过，观影更顺滑。抓紧转存！`,
          ]
        : [
            (n) => `限时分享《${n}》，高效率工具，安装即战斗。工作/学习两不误～`,
            (n) => `提升效率用《${n}》，关键功能齐备，少折腾更专注。别错过！`,
          ],
      fun: isDramaApp
        ? [
            (n) => `追剧冲冲冲，用《${n}》！更新不掉队，片源不东找西翻，打开就看～`,
            (n) => `《${n}》真香！追更提醒＋聚合片源，追剧不再手忙脚乱～安排！`,
          ]
        : [
            (n) => `这款《${n}》太顺手！一把梭日常任务，轻便不打扰～收下不亏。`,
            (n) => `《${n}》用过都说好，爽利不臃肿，效率直接起飞～`,
          ],
      pro: isDramaApp
        ? [
            (n) => `发布《${n}》，聚合片源与更新提醒，降低检索成本，提升观影效率。建议收藏。`,
            (n) => `《${n}》支持片源聚合/追更通知，体验清爽，适合日常追剧使用。`,
          ]
        : [
            (n) => `资源《${n}》，功能聚焦、体验稳定，适合长期使用场景。欢迎查阅与转存。`,
            (n) => `整理《${n}》，覆盖核心需求，减少配置时间，提升执行效率。建议收藏。`,
          ],
    },
    video: {
      plain: [
        (n) => `《${n}》高清整理，分类清楚、更新及时，支持快速检索与观看/下载。`,
        (n) => `分享《${n}》，清晰度高，片单规整，追更友好。自用与分享都合适。`,
      ],
      marketing: [
        (n) => `高分片单《${n}》，高清无水印，追更不掉队。想看就转存～`,
        (n) => `强烈推荐《${n}》，清晰度拉满，分类清爽更好找。入手不亏！`,
      ],
      fun: [
        (n) => `《${n}》安排！清晰好看不糊眼，片单一键到位～看片不迷路。`,
        (n) => `好片别错过，《${n}》给你安排得明明白白～冲！`,
      ],
      pro: [
        (n) => `发布《${n}》，按剧集/年份等维度整理，清晰度与更新频率良好，便于检索。`,
        (n) => `《${n}》，结构规整、片源完整，适合系统观看与收藏。`,
      ],
    },
    course: {
      plain: [
        (n) => `《${n}》系统课程，含配套资料/源码，适合新手到进阶，按章节学习更高效。`,
        (n) => `分享《${n}》，结构清晰、要点覆盖全面，学习路径明确，值得收藏。`,
      ],
      marketing: [
        (n) => `高效进阶《${n}》，核心知识一次掌握，资料齐备即学即用。抓紧转存～`,
        (n) => `强推《${n}》，体系化内容＋实操示例，学习效率翻倍！`,
      ],
      fun: [
        (n) => `《${n}》学就完了！思路清晰不绕弯，跟着做很快见效～`,
        (n) => `安排《${n}》，少踩坑多进步，学习不弯路～`,
      ],
      pro: [
        (n) => `发布《${n}》，覆盖核心概念与实践案例，便于系统性学习与复盘。`,
        (n) => `《${n}》结构化良好，适合阶段性提升与知识巩固。建议收藏。`,
      ],
    },
    ebook: {
      plain: [
        (n) => `《${n}》电子书/资料，排版清晰、目录完整，便于检索与笔记整理。`,
        (n) => `分享《${n}》，可快速查阅的高质量读物，值得常备。`,
      ],
      marketing: [
        (n) => `精选读物《${n}》，高清易读，学习/查阅两相宜。现在转存不丢！`,
        (n) => `高分推荐《${n}》，要点清晰、重点直达，速收～`,
      ],
      fun: [(n) => `《${n}》读起来顺手，查资料更省心。收藏随时翻！`, (n) => `这本《${n}》很顶，重点都在这儿～`],
      pro: [
        (n) => `《${n}》，结构清晰、可检索性好，适合长期学习与参考。`,
        (n) => `整理《${n}》，内容完整度较高，建议纳入资料库。`,
      ],
    },
    template: {
      plain: [
        (n) => `《${n}》模板/素材，即下即用，含多格式文件，适合快速出图与排版。`,
        (n) => `分享《${n}》，风格多样、可编辑，效率直线上升。`,
      ],
      marketing: [
        (n) => `效率神器《${n}》，套用即成片，做事更快一步！`,
        (n) => `强推《${n}》模板库，质量在线，提升产出不费劲～`,
      ],
      fun: [(n) => `《${n}》一套搞定！设计排版不再手忙脚乱～`, (n) => `素材真香，《${n}》助你轻松拿捏风格～`],
      pro: [
        (n) => `发布《${n}》，覆盖常见场景模板，编辑灵活，适合快速交付。`,
        (n) => `《${n}》素材整理规范，可复用性强，建议收藏。`,
      ],
    },
    music: {
      plain: [
        (n) => `《${n}》音乐整理，高音质、分类清楚，听歌学习两不误。`,
        (n) => `分享《${n}》，曲库丰富，目录清晰，随取随用。`,
      ],
      marketing: [
        (n) => `听感升级《${n}》，无损曲库即刻拥有！收藏不亏～`,
        (n) => `强推《${n}》，音质在线，风格齐全，一键转存～`,
      ],
      fun: [(n) => `安排《${n}》，好歌循环根本停不下来～`, (n) => `《${n}》快乐加倍，耳朵要被宠坏啦～`],
      pro: [
        (n) => `《${n}》曲库整理度高，标签与目录清晰，便于筛选与收藏。`,
        (n) => `发布《${n}》，音质与分类良好，可作为日常曲库使用。`,
      ],
    },
    game: {
      plain: [
        (n) => `《${n}》游戏资源，版本稳定，安装步骤简单，开箱即玩。`,
        (n) => `分享《${n}》，配置说明清楚，上手不费劲。`,
      ],
      marketing: [(n) => `开玩即爽《${n}》，稳定流畅不折腾，速速收藏！`, (n) => `强推《${n}》，一键上手，快乐拉满～`],
      fun: [(n) => `《${n}》走起！畅玩不停～`, (n) => `安排《${n}》，快乐就现在！`],
      pro: [
        (n) => `《${n}》，版本清晰、说明完善，适合快速部署与体验。`,
        (n) => `发布《${n}》，兼容性与稳定性良好，建议收藏。`,
      ],
    },
    font: {
      plain: [
        (n) => `《${n}》字体包，字重齐全、渲染清晰，适合设计与排版使用。使用前请自查授权。`,
        (n) => `分享《${n}》，风格多样，覆盖常见场景。请留意商用许可。`,
      ],
      marketing: [
        (n) => `高质量《${n}》，字重齐全即用即搭！收藏不亏～`,
        (n) => `推荐《${n}》，设计排版一键匹配，效率up！`,
      ],
      fun: [(n) => `《${n}》好看又好用，搭配出片没难度～`, (n) => `这套《${n}》真香，风格拿捏住了～`],
      pro: [
        (n) => `《${n}》收录完整，字形质量良好，适合专业设计场景。授权自查。`,
        (n) => `发布《${n}》，覆盖常用字重，使用灵活。`,
      ],
    },
    wallpaper: {
      plain: [
        (n) => `《${n}》壁纸合集，4K/无水印，风格多样，手机/桌面都好看。`,
        (n) => `分享《${n}》，即下即用，高颜值耐看。`,
      ],
      marketing: [(n) => `高能颜值《${n}》，一键换新桌面！速速收藏～`, (n) => `强推《${n}》，清晰细腻，随心切换风格～`],
      fun: [(n) => `《${n}》太好看啦！换上心情都变好～`, (n) => `安排《${n}》，桌面焕然一新～`],
      pro: [(n) => `《${n}》画质优秀、主题多样，适合作为壁纸素材库。`, (n) => `发布《${n}》，分辨率与观感表现良好。`],
    },
    data: {
      plain: [
        (n) => `《${n}》资料整理，分类清晰、可检索，适合备考/研究/工作参考。`,
        (n) => `分享《${n}》，要点集中，查找更高效。`,
      ],
      marketing: [(n) => `效率提升《${n}》，关键信息一目了然，检索迅速！`, (n) => `强推《${n}》，资料齐备，省时省力～`],
      fun: [(n) => `《${n}》查资料不再抓狂～一搜即得！`, (n) => `安排《${n}》，学习办公都好用～`],
      pro: [
        (n) => `《${n}》，结构化整理，标签清晰，便于快速定位内容。`,
        (n) => `发布《${n}》，覆盖核心主题，检索体验友好。`,
      ],
    },
    dev: {
      plain: [
        (n) => `《${n}》源码/项目，结构清晰，含README与依赖说明，适合学习与二次开发。`,
        (n) => `分享《${n}》，示例完善，上手快。`,
      ],
      marketing: [
        (n) => `高质量《${n}》，代码清爽，拿来即用！收藏不亏～`,
        (n) => `强推《${n}》，实战价值高，学习效率翻倍～`,
      ],
      fun: [(n) => `《${n}》上手就会爱，不卷配置只卷结果～`, (n) => `安排《${n}》，造轮子不再累～`],
      pro: [
        (n) => `《${n}》工程化良好，依赖明确，便于集成与复用。`,
        (n) => `发布《${n}》，目录规范，示例完整，建议收藏。`,
      ],
    },
    unknown: {
      plain: [
        (n) => `分享《${n}》，内容实用、取用便捷，适合收藏备用。需要的朋友自取～`,
        (n) => `《${n}》，整理齐全，上手简单。喜欢就收下吧！`,
      ],
      marketing: [(n) => `限时分享《${n}》，质量在线，入手不亏～抓紧转存！`, (n) => `强推《${n}》，即用即得，效率up！`],
      fun: [(n) => `《${n}》真香！用起来就是顺手～`, (n) => `安排《${n}》，省心好用不费劲～`],
      pro: [(n) => `发布《${n}》，结构清晰、体验友好。欢迎查阅与转存。`, (n) => `《${n}》，覆盖常见场景，建议收藏。`],
    },
  }

  const baseTone = resolveBaseTone(tone)
  const base = pick(templates[category][baseTone])(cleanName)
  const extras = [
    ...extraFragments(category, isDramaApp),
    ...keywordExtras(hints), // 利用命中关键词补充一条说明，增强“因关键词而异”
  ]
  const expanded = expandWithinRange(base, extras, range.min, range.max)
  let styled = stylizeByTone(expanded, tone, range)

  // 标签仅在文案末尾追加
  if (withHashtags) {
    const needPunct = !/[。！～.!?]$/.test(styled)
    styled = `${styled}${needPunct ? "。" : ""}${tags}`
  }

  return styled
}

// —— 页面 —— //
export default function Page() {
  const { toast } = useToast()
  const btnFx =
    "relative overflow-hidden transition-all duration-200 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-400/60"
  const ripple = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget as HTMLElement
    const rect = el.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 2.4 // bigger ripple to cover container
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2

    const circle = document.createElement("span")
    Object.assign(circle.style, {
      position: "absolute",
      left: `${x}px`,
      top: `${y}px`,
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: "9999px",
      pointerEvents: "none",
      background: "rgba(56,189,248,0.5)", // slightly higher opacity
      transform: "scale(0)",
      opacity: "0.75",
      transition: "transform 520ms ease-out, opacity 900ms ease-out",
      mixBlendMode: "multiply",
    } as CSSStyleDeclaration)
    el.appendChild(circle)

    requestAnimationFrame(() => {
      circle.style.transform = "scale(1)"
      circle.style.opacity = "0"
    })
    window.setTimeout(() => {
      circle.remove()
    }, 950)
  }
  const [name, setName] = useState("")
  const [link, setLink] = useState("")
  const [tone, setTone] = useState<Tone>("plain")
  const [withTags, setWithTags] = useState(true)
  const [lengthKind, setLengthKind] = useState<LengthKind>("medium")
  const [loading, setLoading] = useState(false)
  const [copyText, setCopyText] = useState("")

  // 封面图（可选）
  const [coverUrl, setCoverUrl] = useState<string>("")
  const [coverOrigin, setCoverOrigin] = useState<"url" | "upload" | "">("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const prevBlobUrlRef = useRef<string | null>(null)

  // 裁剪弹窗
  const [cropOpen, setCropOpen] = useState(false)

  // 清理旧的 blob URL
  useEffect(() => {
    return () => {
      if (prevBlobUrlRef.current) {
        URL.revokeObjectURL(prevBlobUrlRef.current)
        prevBlobUrlRef.current = null
      }
    }
  }, [])

  // 手动改类型（自动/手动）
  const [categoryOverride, setCategoryOverride] = useState<"auto" | Category>("auto")
  const effectiveCategory = useMemo<Category>(
    () => (categoryOverride === "auto" ? classifyResource(name).category : categoryOverride),
    [categoryOverride, name],
  )

  const canGenerate = useMemo(() => name.trim().length > 0, [name])
  const cls = useMemo(() => classifyResource(name), [name])

  const onGenerate = async () => {
    if (!canGenerate) {
      toast({ title: "请先填写资源名称", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      const text = genCopyByCategory(name, effectiveCategory, tone, withTags, cls.matched, LENGTH_RANGE[lengthKind])
      setCopyText(text)
    } catch (e) {
      console.error(e)
      toast({ title: "生成失败，请重试", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const regenerate = () => {
    if (!canGenerate) return
    const text = genCopyByCategory(name, effectiveCategory, tone, withTags, cls.matched, LENGTH_RANGE[lengthKind])
    setCopyText(text)
  }

  const doCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({ title: "已复制到剪贴板" })
    } catch {
      toast({ title: "复制失败，请手动复制", variant: "destructive" })
    }
  }

  // 仅复制 文案 + 链接
  const copyAll = () => {
    const parts = [copyText]
    if (link.trim()) parts.push(`链接：${link.trim()}`)
    doCopy(parts.filter(Boolean).join("\n"))
  }

  const openBaiduImages = () => {
    const q = name.trim()
    if (!q) {
      toast({ title: "请先填写资源名称再去百度图片搜索", variant: "destructive" })
      return
    }
    const url = `https://image.baidu.com/search/index?tn=baiduimage&ie=utf-8&word=${encodeURIComponent(q)}`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const applyCoverUrl = (value: string) => {
    if (prevBlobUrlRef.current) {
      URL.revokeObjectURL(prevBlobUrlRef.current)
      prevBlobUrlRef.current = null
    }
    setCoverUrl(value)
    setCoverOrigin(value ? "url" : "")
  }

  const triggerUpload = () => fileInputRef.current?.click()

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast({ title: "请选择图片文件", variant: "destructive" })
      return
    }
    if (prevBlobUrlRef.current) {
      URL.revokeObjectURL(prevBlobUrlRef.current)
      prevBlobUrlRef.current = null
    }
    const blobUrl = URL.createObjectURL(file)
    prevBlobUrlRef.current = blobUrl
    setCoverUrl(blobUrl)
    setCoverOrigin("upload")
    setTimeout(() => setCropOpen(true), 0)
  }

  const clearCover = () => {
    if (prevBlobUrlRef.current) {
      URL.revokeObjectURL(prevBlobUrlRef.current)
      prevBlobUrlRef.current = null
    }
    setCoverUrl("")
    setCoverOrigin("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const reset = () => {
    setCopyText("")
    setLink("")
    setTone("plain")
    setWithTags(true)
    setLengthKind("medium")
    setName("")
    clearCover()
    setCategoryOverride("auto")
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(56,189,248,0.12),transparent),radial-gradient(900px_500px_at_90%_0%,rgba(167,139,250,0.12),transparent)]">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight bg-gradient-to-r from-sky-600 via-violet-600 to-emerald-600 bg-clip-text text-transparent">
            {"网盘资源分享文案生成器"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            输入资源名称与链接：自动识别类型并生成功能性中文文案。封面图可选：去百度挑选或上传并裁剪，统一适配 16:9。
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)] xl:grid-cols-[440px_minmax(0,1fr)] lg:gap-8">
          {/* 左侧：配置（大屏固定） */}
          <div className="self-start lg:sticky lg:top-8">
            <AccentCard gradient="from-sky-300 via-cyan-300 to-sky-300">
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
                <CardDescription>名称决定分类与写作方向；链接可拼接到最终分享内容。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">资源名称</Label>
                  <Input
                    id="name"
                    placeholder="请输入要分享的资源名称"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  {name ? (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Badge variant="secondary">识别类型：{CATEGORY_LABEL[cls.category]}</Badge>
                      {categoryOverride !== "auto" ? (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                          手动类型：{CATEGORY_LABEL[effectiveCategory]}
                        </Badge>
                      ) : null}
                      {cls.matched.slice(0, 4).map((w) => (
                        <Badge key={w} variant="outline">
                          命中：{w}
                        </Badge>
                      ))}
                      {cls.reason ? <span className="text-xs text-muted-foreground">（{cls.reason}）</span> : null}
                    </div>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="link">网盘链接（可选）</Label>
                  <Input
                    id="link"
                    placeholder="夸克/百度/迅雷/UC网盘链接"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">资源类型</Label>
                  <Select value={categoryOverride} onValueChange={(v) => setCategoryOverride(v as "auto" | Category)}>
                    <SelectTrigger id="category" className={cn("w-full", btnFx)} onMouseDown={ripple}>
                      <SelectValue placeholder="选择资源类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">
                        自动识别（{CATEGORY_LABEL[classifyResource(name).category]}）
                      </SelectItem>
                      <SelectItem value="app">软件/应用</SelectItem>
                      <SelectItem value="video">影视/剧集</SelectItem>
                      <SelectItem value="course">课程/教程</SelectItem>
                      <SelectItem value="ebook">电子书/资料</SelectItem>
                      <SelectItem value="template">模板/素材</SelectItem>
                      <SelectItem value="music">音乐/音频</SelectItem>
                      <SelectItem value="game">游戏/资源</SelectItem>
                      <SelectItem value="font">字体</SelectItem>
                      <SelectItem value="wallpaper">壁纸</SelectItem>
                      <SelectItem value="data">资料/报告</SelectItem>
                      <SelectItem value="dev">源码/项目</SelectItem>
                      <SelectItem value="unknown">其他/未确定</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-sky-700 bg-sky-50 rounded px-2 py-1">
                    识别不准？切换类型将影响写作模板与措辞。
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>文案风格</Label>
                  <RadioGroup
                    value={tone}
                    onValueChange={(v) => setTone(v as Tone)}
                    className="grid grid-cols-2 gap-2 sm:grid-cols-3"
                  >
                    <div
                      className={cn(
                        "flex items-center space-x-2 rounded-md border p-2 hover:bg-muted/40 cursor-pointer select-none",
                        btnFx,
                      )}
                      onMouseDown={ripple}
                    >
                      <RadioGroupItem value="plain" id="plain" />
                      <Label htmlFor="plain" className="cursor-pointer">
                        朴素
                      </Label>
                    </div>
                    <div
                      className={cn(
                        "flex items-center space-x-2 rounded-md border p-2 hover:bg-muted/40 cursor-pointer select-none",
                        btnFx,
                      )}
                      onMouseDown={ripple}
                    >
                      <RadioGroupItem value="marketing" id="marketing" />
                      <Label htmlFor="marketing" className="cursor-pointer">
                        营销
                      </Label>
                    </div>
                    <div
                      className={cn(
                        "flex items-center space-x-2 rounded-md border p-2 hover:bg-muted/40 cursor-pointer select-none",
                        btnFx,
                      )}
                      onMouseDown={ripple}
                    >
                      <RadioGroupItem value="fun" id="fun" />
                      <Label htmlFor="fun" className="cursor-pointer">
                        风趣
                      </Label>
                    </div>
                    <div
                      className={cn(
                        "flex items-center space-x-2 rounded-md border p-2 hover:bg-muted/40 cursor-pointer select-none",
                        btnFx,
                      )}
                      onMouseDown={ripple}
                    >
                      <RadioGroupItem value="pro" id="pro" />
                      <Label htmlFor="pro" className="cursor-pointer">
                        专业
                      </Label>
                    </div>
                    <div
                      className={cn(
                        "flex items-center space-x-2 rounded-md border p-2 hover:bg-muted/40 cursor-pointer select-none",
                        btnFx,
                      )}
                      onMouseDown={ripple}
                    >
                      <RadioGroupItem value="warm" id="warm" />
                      <Label htmlFor="warm" className="cursor-pointer">
                        治愈
                      </Label>
                    </div>
                    <div
                      className={cn(
                        "flex items-center space-x-2 rounded-md border p-2 hover:bg-muted/40 cursor-pointer select-none",
                        btnFx,
                      )}
                      onMouseDown={ripple}
                    >
                      <RadioGroupItem value="trendy" id="trendy" />
                      <Label htmlFor="trendy" className="cursor-pointer">
                        潮流
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* 文案长度 - 分段式美化（对比度优化） */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>文案长度</Label>
                    <span className="text-xs text-muted-foreground">当前目标：{LENGTH_RANGE[lengthKind].label}</span>
                  </div>
                  <Tabs value={lengthKind} onValueChange={(v) => setLengthKind(v as LengthKind)}>
                    <TabsList className="grid w-full grid-cols-3 rounded-lg border border-slate-200 bg-white p-1 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.02)]">
                      <TabsTrigger
                        value="short"
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-md py-2 hover:bg-slate-50 text-slate-700",
                          "data-[state=active]:bg-sky-100 data-[state=active]:text-sky-900 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-sky-200",
                          btnFx,
                        )}
                        onMouseDown={ripple}
                      >
                        <span className="text-sm font-semibold tracking-wide">短</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium leading-none text-slate-700 ring-1 ring-slate-200 data-[state=active]:bg-white data-[state=active]:text-sky-800 data-[state=active]:ring-sky-200">
                          {LENGTH_RANGE.short.label}
                        </span>
                      </TabsTrigger>

                      <TabsTrigger
                        value="medium"
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-md py-2 hover:bg-slate-50 text-slate-700",
                          "data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-900 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-indigo-200",
                          btnFx,
                        )}
                        onMouseDown={ripple}
                      >
                        <span className="text-sm font-semibold tracking-wide">适中</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium leading-none text-slate-700 ring-1 ring-slate-200 data-[state=active]:bg-white data-[state=active]:text-indigo-800 data-[state=active]:ring-indigo-200">
                          {LENGTH_RANGE.medium.label}
                        </span>
                      </TabsTrigger>

                      <TabsTrigger
                        value="long"
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-md py-2 hover:bg-slate-50 text-slate-700",
                          "data-[state=active]:bg-violet-100 data-[state=active]:text-violet-900 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-violet-200",
                          btnFx,
                        )}
                        onMouseDown={ripple}
                      >
                        <span className="text-sm font-semibold tracking-wide">偏长</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium leading-none text-slate-700 ring-1 ring-slate-200 data-[state=active]:bg-white data-[state=active]:text-violet-800 data-[state=active]:ring-violet-200">
                          {LENGTH_RANGE.long.label}
                        </span>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <p className="inline-block rounded-md bg-sky-50 px-2 py-1 text-xs text-sky-800">
                    将在范围内智能扩展，并尽量在句号处截断，保证阅读顺滑。
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-md border p-3">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">附带话题标签</div>
                    <div className="text-xs text-muted-foreground">如 #网盘资源 #值得收藏（将添加在文案末尾）</div>
                  </div>
                  <Switch checked={withTags} onCheckedChange={setWithTags} />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={onGenerate}
                    disabled={!canGenerate || loading}
                    className={"flex-1 " + btnFx}
                    onMouseDown={ripple}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        生成中…
                      </span>
                    ) : (
                      "生成文案"
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={reset}
                    disabled={loading}
                    title="重置"
                    className={btnFx}
                    onMouseDown={ripple}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </AccentCard>
          </div>

          {/* 右侧：文案 + 封面 */}
          <div className="space-y-6">
            {/* 文案编辑（可编辑） */}
            <AccentCard gradient="from-fuchsia-300 via-violet-300 to-sky-300">
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>文案编辑</CardTitle>
                  <CardDescription>生成后可在下方自由修改，支持增删改，字数实时统计。</CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="bg-gradient-to-r from-violet-600 to-sky-600 text-white">
                    {CATEGORY_LABEL[effectiveCategory]}
                  </Badge>
                  <Badge variant="outline" className="border-violet-200 text-violet-700">
                    {copyText ? `${copyText.length} 字` : `目标 ${LENGTH_RANGE[lengthKind].label}`}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={copyText}
                  onChange={(e) => setCopyText(e.target.value)}
                  placeholder="点击“生成文案”后，这里会出现可编辑的内容。你可以在这里自由修改、增删。"
                  className="min-h-[160px] resize-y"
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => doCopy(copyText)}
                    disabled={!copyText.trim()}
                    className={btnFx}
                    onMouseDown={ripple}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    复制文案
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={copyAll}
                    disabled={!copyText.trim()}
                    className={btnFx}
                    onMouseDown={ripple}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    复制文案 + 链接
                  </Button>
                  <Button size="sm" onClick={regenerate} disabled={!canGenerate} className={btnFx} onMouseDown={ripple}>
                    换一版
                  </Button>
                </div>
                {link ? <div className="break-all text-xs text-muted-foreground">链接：{link}</div> : null}
              </CardContent>
            </AccentCard>

            {/* 封面图（可选） */}
            <AccentCard gradient="from-emerald-300 via-teal-300 to-sky-300">
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>封面图（可选）</CardTitle>
                  <CardDescription>去百度图片挑选或本地上传，然后一键裁剪，自动适配 16:9 封面。</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-gradient-to-br from-emerald-50 to-teal-50">
                  {coverUrl ? (
                    <img
                      src={coverUrl || "/placeholder.svg?height=360&width=640&query=cover%20preview%2016x9"}
                      alt="封面预览"
                      className="h-full w-full object-cover"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                      暂无封面图，请点击下方按钮选择
                    </div>
                  )}
                </div>

                <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                  <div className="space-y-2">
                    <Label htmlFor="cover-url">封面图链接（可选）</Label>
                    <Input
                      id="cover-url"
                      placeholder="从百度图片复制图片链接后粘贴到这里"
                      value={coverUrl}
                      onChange={(e) => applyCoverUrl(e.target.value)}
                    />
                    <p className="text-xs text-teal-700">
                      来源：{coverOrigin === "upload" ? "本地上传" : coverUrl ? "外链" : "未设置"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-end gap-2 md:items-center md:justify-end">
                    <Button
                      type="button"
                      onClick={openBaiduImages}
                      variant="secondary"
                      className={btnFx}
                      onMouseDown={ripple}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      去百度选封面
                    </Button>
                    <Button type="button" onClick={triggerUpload} className={btnFx} onMouseDown={ripple}>
                      <ImagePlus className="mr-2 h-4 w-4" />
                      上传图片
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setCropOpen(true)}
                      variant="outline"
                      disabled={!coverUrl}
                      title="调整封面位置/裁剪"
                      className={btnFx}
                      onMouseDown={ripple}
                    >
                      <Scissors className="mr-2 h-4 w-4" />
                      调整/裁剪
                    </Button>
                    <Button
                      type="button"
                      onClick={clearCover}
                      variant="ghost"
                      disabled={!coverUrl}
                      title="清除封面"
                      className={btnFx}
                      onMouseDown={ripple}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
                  </div>
                </div>

                <p className="text-xs text-teal-700/80 bg-teal-50 rounded-md px-2 py-1">
                  提示：裁剪功能优先用于“本地上传”的图片；部分外链图片因跨域限制可能无法导出裁剪结果。
                </p>
              </CardContent>
            </AccentCard>
          </div>
        </div>

        <footer className="mt-10 text-center text-xs text-muted-foreground">
          小提示：页面布局已针对移动端/平板/桌面适配；如需特定平台字数或风格预设，也可以继续定制。
        </footer>

        {/* 裁剪弹窗 */}
        <CoverCropper
          open={cropOpen}
          onClose={() => setCropOpen(false)}
          imageSrc={coverUrl}
          aspect={16 / 9}
          allowExport={coverOrigin !== "url"}
          onApply={(blobUrl) => {
            if (prevBlobUrlRef.current) {
              URL.revokeObjectURL(prevBlobUrlRef.current)
              prevBlobUrlRef.current = null
            }
            prevBlobUrlRef.current = blobUrl
            setCoverUrl(blobUrl)
            setCoverOrigin("upload")
          }}
        />
      </main>
    </div>
  )
}
