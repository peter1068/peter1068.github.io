# peter1068.github.io

oke 互动小说 GitHub Pages 个人主页。

## 目录结构

```
├── index.html              # 首页：游戏画廊
├── play.html               # 播放器外壳（iframe + 认证握手）
├── configs/
│   └── games.json          # 游戏列表配置
├── assets/
│   ├── css/home.css
│   └── js/home.js
└── okeweb/
    └── <游戏名>/
        ├── index.html      # 游戏入口
        ├── cover.jpg       # 首页展示封面
        └── ...
```

## 添加新游戏

1. 将游戏构建产物放入 `okeweb/<游戏目录>/`（需包含 `index.html` 和 `cover.jpg`）
2. 编辑 `configs/games.json`，在 `games` 数组中追加一项：

```json
{
  "id": "my-game",
  "title": "游戏标题",
  "description": "简短描述（可选）",
  "cover": "okeweb/my-game/cover.jpg",
  "entry": "okeweb/my-game/index.html",
  "enabled": true,
  "order": 2
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `id` | 是 | 唯一标识 |
| `title` | 是 | 首页显示标题 |
| `cover` | 是 | 封面图路径（站内相对路径） |
| `entry` | 是 | 游戏入口 HTML 路径 |
| `description` | 否 | 卡片描述 |
| `enabled` | 否 | 设为 `false` 可隐藏，默认显示 |
| `order` | 否 | 排序权重，数字越小越靠前 |
| `wrapper` | 否 | 设为 `true` 时经 `play.html` 外壳加载；默认直链 `entry` |

## 本地预览

需通过 HTTP 服务访问（`fetch` 无法直接读取本地文件）：

```bash
# Python
python -m http.server 8080

# 或 Node.js
npx serve .
```

浏览器打开 `http://localhost:8080`。

## 页面说明

- **首页** (`index.html`)：读取 `configs/games.json`，以卡片形式展示游戏封面，点击跳转至播放器
- **播放器外壳** (`play.html`)：可选，通过 iframe 加载游戏；仅当游戏构建产物实现了 `STORY_PLAYER_READY` 握手时才需要

直接访问游戏：`/okeweb/ailisi/index.html`（推荐）  
经外壳访问：`/play.html?player=okeweb/ailisi/index.html`（需游戏支持握手）

### 关于「认证超时」

若通过 `play.html` 进入游戏并看到「认证超时」，说明游戏构建产物**未实现** `postMessage` 握手协议（`STORY_PLAYER_READY` / `STORY_PLAYER_AUTH`）。当前 `okeweb/ailisi` 为独立页面，首页已默认直链 `entry`，无需经过外壳。
