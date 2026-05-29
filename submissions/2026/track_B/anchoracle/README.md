# Anchoracle——与故人同行

> 拍一张照，让千年之前的人为你讲述这片土地。

**Anchoracle** 是一款由 **Google Gemma 4** 驱动的多模态城市文化伴游应用。用户在景点拍照，系统识别景点与人物雕像后，会接入对应历史人物的对话页面 —— **苏轼讲西湖，鲁迅讲鲁迅公园，屈原讲东湖** —— 让"打卡"变成一次有温度的对谈。

### 我们想解决什么

今天的人们走过太多景点，却很少真正了解脚下这片土地的历史与人物。我们希望用多模态 AI 降低"读懂一处古迹"的门槛：**不必查资料、不必读长文，拍一张照就能让这片土地的历史人物亲口讲述自己的故事**。让游览不止于拍照打卡，而是一次与传统文化的对话——以此激发更多人对中国历史与传统文化的兴趣，是这个项目的初衷与长期目标。

> 当前内置 10 城 / 30 位历史人物 / ~90 个景点，是一个**经过精选、可低成本扩展的最小可用版本**：全部内容由数据文件驱动（`characters.ts` / `personas.ts` / `landmarks.ts`），**新增城市与人物只需补充数据、无需改动识别与对话代码**，框架天然可规模化到全国乃至更多文化场景。

本项目为 **Gemma 4 开发者大赛 2026 · 赛道 B (Multimodal)** 参赛作品。

🌐 在线体验：<https://travel-history-agent.vercel.app>

---

## ✨ 核心能力（多模态全链路）

| 模态 | 实现 | Gemma 4 模型 |
|------|------|--------------|
| **视觉** | OCR + 场景分类 + 主体识别 + 30 选 1 人物识别 | `gemma-4-31b-it`（Dense） |
| **文本** | 历史人物角色扮演对话，流式输出 | `gemma-4-26b-a4b-it`（MoE） |
| **音频** | Web Speech API 中文语音输入 | 浏览器原生 |

### 一次扫描的完整流程

```
用户上传景点照片
    │
    ▼
Gemma 4 31B 多模态识别
    ├── OCR：提取碑文 / 牌匾文字
    ├── scene_type：从 10 类场景中分类（民居院落、纪念广场、园林、城市街景…）
    ├── subject_type：判断主体（人物雕像 / 建筑外观 / 室内陈设 / 广角风景 …）
    └── person_in_statue：从 30 位历史人物清单中识别雕像人物（闭卷）
    │
    ▼
后端加权评分（多信号融合，非简单规则）
    ├── OCR 景点名命中：+10
    ├── 人物识别命中：+12
    ├── 场景类型匹配：+4 / 不匹配：−2
    └── 主体 × 景点类型冲突：人物雕像 × 故居 = −8（决定性否决）
    │
    ▼
锁定最佳候选 → 跳转至对应历史人物对话页
    │
    ▼
Gemma 4 26B A4B 以该人物口吻流式讲述景点历史
```

---

## 🎯 为什么用 Gemma 4

| 模型 | 用途 | 选型理由 |
|------|------|----------|
| **Gemma 4 31B IT (Dense)** | 视觉感知主路径 | 256K 长上下文 + 多模态原生支持，能在一次推理中并行完成 OCR / 场景分类 / 人物识别四个任务，省去多次调用 |
| **Gemma 4 26B A4B IT (MoE)** | 历史人物对话 | 每次只激活 4B 参数 → 流式生成延迟极低，适合 30 位人物的高并发角色扮演 |

详细模型选型推理见 [TECHNICAL_REPORT.md](./TECHNICAL_REPORT.md)。

---

## 🗺️ 内容覆盖

10 座城市 × 30 位历史人物 × ~90 个景点：

| 城市 | 守护者 |
|------|--------|
| 杭州 | 苏轼、白居易、竺可桢 |
| 无锡 | 顾恺之、钱钟书、徐霞客 |
| 南京 | 孙中山、李白、曹雪芹 |
| 苏州 | 唐伯虎、范仲淹、金圣叹 |
| 上海 | 鲁迅、宋庆龄、徐光启 |
| 北京 | 老舍、梅兰芳、纪晓岚 |
| 天津 | 李叔同、霍元甲、严复 |
| 重庆 | 秦良玉、邹容、卢作孚 |
| 武汉 | 屈原、张之洞、崔颢 |
| 成都 | 杜甫、诸葛亮、巴金 |

> **可扩展性**：以上内容均为数据驱动。扩充一座新城市 / 一位新人物，只需在 `src/data/` 的数据文件中追加条目（人物档案、人设、景点元数据），**识别评分与对话逻辑完全复用、零改动**。当前规模是为评测精选的代表性子集，并非能力上限。

---

## 🚀 快速启动

### 方式 A：一键脚本（推荐）

```bash
git clone https://github.com/SummerTianYi/travel-history-agent.git
cd travel-history-agent
cp .env.example .env.local
# 编辑 .env.local，填入你的 Google AI Studio API Key
npm install
npm run dev
```

打开 <http://localhost:3000>。

### 方式 B：Docker

```bash
git clone https://github.com/SummerTianYi/travel-history-agent.git
cd travel-history-agent
cp .env.example .env.local   # 填入 GOOGLE_API_KEY
docker build -t anchoracle .
docker run -p 3000:3000 --env-file .env.local anchoracle
```

---

## 🔑 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `GOOGLE_API_KEY` | ✅ | Google AI Studio API Key，在 [aistudio.google.com](https://aistudio.google.com/apikey) 申请 |
| `HTTPS_PROXY` | 仅本地开发 | 国内开发时如需代理，可设置（生产环境不需要） |
| `DEBUG_API` | ❌ | 设为 `true` 时 `/api/scan` 会返回 `_debug` 内部数据（仅调试） |

> 单 key 模式：项目仅读取 `GOOGLE_API_KEY`，不轮换备用 key。Free tier 配额耗尽请直接升级 Tier 1。

### 🔑 更换 API Key（评委必看）

全应用**只用一个环境变量** `GOOGLE_API_KEY`，**唯一读取处**是 `src/lib/aiClient.ts:12`：

```ts
const API_KEY = process.env.GOOGLE_API_KEY!;
```

更换 key **无需改动任何源码**，按你的评测方式二选一即可：

- **直接用线上 demo**（<https://travel-history-agent.vercel.app>）：零配置开箱即用，用的是作者部署在 Vercel 上的 key。若遇到限流 / 配额耗尽，请改用下面的本地方式。
- **本地评测（推荐，最稳定）**：克隆仓库后，在项目根目录新建 / 编辑 `.env.local`，填入你自己的 key：

  ```bash
  GOOGLE_API_KEY=你的_AI_Studio_key
  ```

  key 申请：<https://aistudio.google.com/apikey>，改完重启 `npm run dev` 即生效。

> ℹ️ **两套环境互不影响**：`.env.local` 已被 `.gitignore`，只作用于你本机的 `npm run dev`；线上 demo 的 key 单独配置在作者的 Vercel 后台。你在本地换 key 只影响你自己的机器，**不会**改动也不会读取作者的线上部署。

---

## 📂 项目结构

```
travel-history-agent/
├── src/
│   ├── app/
│   │   ├── page.tsx              # 首页
│   │   ├── scan/page.tsx         # 拍照识别页
│   │   ├── chat/[characterId]/   # 对话页（流式 + 语音输入）
│   │   ├── city/[cityId]/        # 城市详情页
│   │   └── api/
│   │       ├── scan/route.ts     # Gemma 4 多模态识别 + 评分
│   │       └── chat/route.ts     # Gemma 4 流式对话 + 实用查询
│   ├── data/
│   │   ├── characters.ts         # 30 人物 / 90 景点 / 场景类型
│   │   ├── landmarks.ts          # 景点元数据
│   │   └── personas.ts           # 人物对话人设
│   └── lib/
│       ├── aiClient.ts           # Gemma / Gemini SDK 单例
│       ├── chatDb.ts             # 聊天记录本地存储（IndexedDB）
│       └── imageUtils.ts         # 上传图片压缩
├── samples/                       # 多模态测试素材（赛道 B 必需）
├── demo/                          # 演示视频
├── TECHNICAL_REPORT.md           # 技术报告（架构 / 模型选型）
└── Dockerfile                     # 容器化部署
```

---

## 🧪 试用建议

1. 进入 `/scan` 页。
2. 上传 `samples/` 目录任意图片，或拍摄你身边的景点 / 雕像。
3. 等待 5-10 秒（Gemma 4 31B 视觉推理）。
4. 跳转至对话页，与对应历史人物聊聊这片土地。
5. 可点击麦克风按钮使用语音输入。

---

## ⚠️ 评测须知 / 已知限制（评委必看）

为帮助评委顺利复现，以下是测试中可能遇到的情况及应对方式（均为环境 / 配额因素，非功能缺陷）：

1. **API 配额有限**：线上 demo 使用单个 free-tier key，配额耗尽后识别 / 对话会报错。如需稳定评测，请按上方「🔑 更换 API Key」**在本地填入你自己的 key** 运行，或升级更高 Tier。
2. **scan 识别不准** → 页面支持**手动选择城市**缩小候选范围，可显著提升匹配准确率；也可改用 `samples/` 中的标准测试图。
3. **chat 无正常响应** → 多为 Vercel 函数超时（`maxDuration=60s`），**重试几次**即可恢复。
4. **首次请求较慢（冷启动）**：Serverless 冷启动叠加 Gemma 4 31B 视觉推理，首个请求可能偏慢甚至超时，**首次失败请直接重试**，属正常现象。
5. **并发限流**：多位评委同时访问线上 demo，共享 key 易触发 429 限流，导致 scan / chat 同时失败——建议**错峰测试或本地自带 key**。
6. **内容库为闭集**：仅覆盖内置 10 城 / 30 人物 / ~90 景点。上传**库外**照片（如国外建筑、随手拍）无法匹配属预期行为，**并非 bug**；请用 `samples/` 或这 10 座城市的真实景点 / 雕像测试。
7. **语音输入的浏览器限制**：Web Speech API 中文识别在 **Chrome / Edge 桌面版**最稳定，Safari / Firefox 可能不支持；首次使用需允许麦克风权限。
8. **兜底模型差异**：当 Gemma 异常 / 限流时，系统自动降级到 `gemini-2.5-flash`，输出风格可能略有不同——这是设计内的容错降级，非故障。

---

## 📄 许可证

[MIT License](./LICENSE)

---

## 🙏 致谢

- Google DeepMind — Gemma 4 模型家族
- GDG Shanghai — 主办本次大赛
