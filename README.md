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

每次修改站点后，更新 `assets/version.js` 中的 `SITE_VERSION`（格式：`YYYYMMDD-HHmm`）：

```javascript
var SITE_VERSION = '20260730-0105';
```

版本号会：
- 显示在首页页脚和播放器页右下角
- 作为 `home.css`、`home.js`、`games.json` 的查询参数，触发浏览器与 CDN 缓存刷新

## 页面说明

- **首页** (`index.html`)：读取 `configs/games.json`，以卡片形式展示游戏封面，点击跳转至播放器
- **播放器外壳** (`play.html`)：首页点击游戏后由此页 iframe 加载游戏，并完成 `STORY_PLAYER_AUTH` 握手（**oke 游戏启动的必要条件**）

### 为什么不能直链 index.html？

oke 游戏构建产物内置了 `CanPlay` 认证：启动前会向父页面发送 `STORY_PLAYER_READY`，收到正确的 `STORY_PLAYER_AUTH`（`AUTH_KEY` 需与 `play.html` 一致）后才会渲染。直接打开 `okeweb/xxx/index.html` 没有父页面响应握手，页面会一直保持黑屏。
