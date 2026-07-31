# peter1068.github.io

OKE.X33工作室 GitHub Pages 个人主页。

## 目录结构

```
├── index.html              # 首页：游戏画廊
├── game.html               # 宣传页：视频 + 游戏信息 + 开始游戏
├── play.html               # 播放器外壳（iframe + 认证握手）
├── configs/
│   └── games.json          # 游戏列表配置
├── assets/
│   ├── version.js          # 站点版本号（缓存刷新）
│   ├── css/home.css
│   ├── css/game.css
│   ├── js/common.js
│   ├── js/home.js
│   └── js/game.js
└── okeweb/
    └── <游戏名>/
        ├── index.html      # 游戏入口
        ├── cover.jpg       # 首页展示封面
        ├── video.mp4       # 宣传视频（可选，默认此文件名）
        └── ...
```

## 访问流程

```
首页 index.html → 宣传页 game.html?id=xxx → 播放器 play.html?player=...
```

## 添加新游戏

1. 将游戏构建产物放入 `okeweb/<游戏目录>/`（需包含 `index.html` 和封面图）
2. （可选）在同目录放置宣传视频 `video.mp4`
3. 编辑 `configs/games.json`，在 `games` 数组中追加一项：

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
| `video` | 否 | 宣传视频路径，默认 `<游戏目录>/video.mp4` |
| `description` | 否 | 卡片与宣传页描述 |
| `enabled` | 否 | 设为 `false` 可隐藏，默认显示 |
| `order` | 否 | 排序权重，数字越小越靠前 |
| `wrapper` | 否 | 设为 `false` 时直链 `entry`；默认经 `play.html` 外壳加载（oke 游戏必须） |

## 本地预览

需通过 HTTP 服务访问（`fetch` 无法直接读取本地文件）：

```bash
# Python
python -m http.server 8080

# 或 Node.js
npx serve .
```

浏览器打开 `http://localhost:8080`。

## 版本号与缓存

每次修改站点后，更新 `assets/version.js` 中的 `SITE_VERSION`（格式：`YYYYMMDD-HHmm`），并同步更新以下文件中的版本查询参数：

- `index.html`
- `game.html`
- `play.html`

```html
<script src="./assets/version.js?v=20260731-2135"></script>
```

```javascript
var SITE_VERSION = '20260731-2135';
```

版本号会：
- 显示在首页页脚、宣传页与播放器页
- 作为静态资源与 `games.json` 的查询参数，触发浏览器与 CDN 缓存刷新

## 页面说明

- **首页** (`index.html`)：读取 `configs/games.json`，展示游戏封面，点击进入宣传页
- **宣传页** (`game.html`)：展示宣传视频、游戏标题与描述，点击「开始游戏」进入播放器
- **播放器外壳** (`play.html`)：iframe 加载游戏并完成 `STORY_PLAYER_AUTH` 握手（**oke 游戏启动的必要条件**）

### 宣传视频说明

- 默认路径：与 `entry` 同目录下的 `video.mp4`
- 若视频不存在或加载失败，自动降级为封面海报展示，仍可正常进入游戏
- 可在 `games.json` 中用 `video` 字段自定义视频路径

### 为什么不能直链 index.html？

oke 游戏构建产物内置了 `CanPlay` 认证：启动前会向父页面发送 `STORY_PLAYER_READY`，收到正确的 `STORY_PLAYER_AUTH`（`AUTH_KEY` 需与 `play.html` 一致）后才会渲染。直接打开 `okeweb/xxx/index.html` 没有父页面响应握手，页面会一直保持黑屏。
