# Sample Data — 多模态测试素材

本目录提供用于复现 Anchoracle 多模态识别效果的测试图片，对应赛道 B（Multimodal）评审要求。

## 目录结构

```
samples/
├── landmarks/   # 景点建筑外观（例：故居、纪念馆、园林）
├── statues/     # 人物雕像（例：鲁迅、屈原、苏轼）
└── scenery/     # 开阔风景（例：西湖、武汉东湖、北京颐和园）
```

## 使用方式

1. 启动项目后访问 `/scan` 页面。
2. 上传本目录任意图片。
3. 系统将调用 Gemma 4 31B 完成：OCR + 场景分类 + 主体识别 + 30 选 1 人物识别。
4. 识别结果会引导至对应人物的对话页（`/chat/[characterId]`），由 Gemma 4 26B A4B 进行历史讲述。

## 期望识别结果

| 图片 | 期望识别 | 跳转至 |
|------|---------|--------|
| `statues/luxun-park.jpg` | 鲁迅公园（上海） | 鲁迅对话页 |
| `landmarks/sushi-memorial.jpg` | 苏东坡纪念馆（杭州） | 苏轼对话页 |
| `scenery/west-lake.jpg` | 西湖 | 白居易 / 苏轼对话页 |

（具体清单以实际上传的素材为准。）
