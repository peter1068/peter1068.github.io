(function () {
    'use strict';

    var CONFIG_URL = './configs/games.json';
    var PLAY_PAGE = './play.html';

    // 仅允许站内相对路径，防止 open redirect
    var SAFE_PATH_RE = /^(?!\/)(?!.*\.\.)([a-zA-Z0-9_\-./]+)$/;

    var siteTitleEl = document.getElementById('siteTitle');
    var siteDescEl = document.getElementById('siteDesc');
    var loadingEl = document.getElementById('loading');
    var errorEl = document.getElementById('error');
    var errorMessageEl = document.getElementById('errorMessage');
    var retryButton = document.getElementById('retryButton');
    var gridEl = document.getElementById('gameGrid');
    var yearEl = document.getElementById('year');
    var versionEl = document.getElementById('siteVersion');

    function getCacheVersion() {
        return typeof SITE_VERSION !== 'undefined' ? SITE_VERSION : String(Date.now());
    }

    function withCacheBust(url) {
        var sep = url.indexOf('?') >= 0 ? '&' : '?';
        return url + sep + 'v=' + encodeURIComponent(getCacheVersion());
    }

    /**
     * 校验资源路径是否安全（站内相对路径）
     * @param {string} path
     * @returns {boolean}
     */
    function isSafeRelativePath(path) {
        if (!path || typeof path !== 'string') {
            return false;
        }
        var normalized = path.replace(/\\/g, '/');
        return SAFE_PATH_RE.test(normalized) && !/^https?:/i.test(normalized);
    }

    /**
     * 规范化路径分隔符
     * @param {string} path
     * @returns {string}
     */
    function normalizePath(path) {
        return path.replace(/\\/g, '/');
    }

    /**
     * 构建游戏跳转链接
     * - 默认经 play.html 外壳加载（oke 游戏需 STORY_PLAYER_AUTH 握手后才能启动）
     * - wrapper: false 时直链 entry（仅适用于无需外壳认证的独立游戏）
     * @param {object} game
     * @returns {string}
     */
    function buildGameUrl(game) {
        var entry = normalizePath(game.entry);
        if (game.wrapper === false) {
            return './' + entry;
        }
        return PLAY_PAGE + '?player=' + encodeURIComponent(entry);
    }

    /**
     * 创建游戏卡片 DOM
     * @param {object} game
     * @returns {HTMLElement|null}
     */
    function createGameCard(game) {
        if (!game || game.enabled === false) {
            return null;
        }

        if (!game.title || !isSafeRelativePath(game.entry) || !isSafeRelativePath(game.cover)) {
            console.warn('[home] 跳过无效游戏配置:', game);
            return null;
        }

        var link = document.createElement('a');
        link.className = 'card';
        link.href = buildGameUrl(game);
        link.setAttribute('aria-label', '进入游戏：' + game.title);

        var coverWrap = document.createElement('div');
        coverWrap.className = 'card__cover-wrap';

        var img = document.createElement('img');
        img.className = 'card__cover';
        img.src = normalizePath(game.cover);
        img.alt = game.title + ' 封面';
        img.loading = 'lazy';
        img.decoding = 'async';
        img.width = 225;
        img.height = 400;

        img.addEventListener('error', function () {
            img.classList.add('card__cover--fallback');
            img.removeAttribute('src');
            img.alt = '封面加载失败';
        });

        coverWrap.appendChild(img);

        var body = document.createElement('div');
        body.className = 'card__body';

        var title = document.createElement('h2');
        title.className = 'card__title';
        title.textContent = game.title;

        body.appendChild(title);

        if (game.description) {
            var desc = document.createElement('p');
            desc.className = 'card__desc';
            desc.textContent = game.description;
            body.appendChild(desc);
        }

        link.appendChild(coverWrap);
        link.appendChild(body);

        return link;
    }

    /**
     * 按 order 字段排序游戏列表
     * @param {Array} games
     * @returns {Array}
     */
    function sortGames(games) {
        return games.slice().sort(function (a, b) {
            var orderA = typeof a.order === 'number' ? a.order : 9999;
            var orderB = typeof b.order === 'number' ? b.order : 9999;
            return orderA - orderB;
        });
    }

    function showLoading() {
        loadingEl.classList.remove('status--hidden');
        errorEl.classList.add('status--hidden');
        gridEl.classList.add('grid--hidden');
    }

    function showError(message) {
        loadingEl.classList.add('status--hidden');
        errorEl.classList.remove('status--hidden');
        gridEl.classList.add('grid--hidden');
        errorMessageEl.textContent = message;
    }

    function showGrid() {
        loadingEl.classList.add('status--hidden');
        errorEl.classList.add('status--hidden');
        gridEl.classList.remove('grid--hidden');
    }

    /**
     * 渲染首页
     * @param {object} config
     */
    function render(config) {
        if (!config || !Array.isArray(config.games)) {
            showError('配置文件格式不正确，请检查 configs/games.json。');
            return;
        }

        var site = config.site || {};

        document.title = site.title || 'oke 互动小说';
        siteTitleEl.textContent = site.title || 'oke 互动小说';
        siteDescEl.textContent = site.description || '';

        gridEl.innerHTML = '';

        var games = sortGames(config.games);
        var rendered = 0;

        games.forEach(function (game) {
            var card = createGameCard(game);
            if (card) {
                gridEl.appendChild(card);
                rendered += 1;
            }
        });

        if (rendered === 0) {
            showError('暂无可用游戏，请在 configs/games.json 中添加并启用游戏。');
            return;
        }

        showGrid();
    }

    function loadConfig() {
        showLoading();

        fetch(withCacheBust(CONFIG_URL), { cache: 'no-cache' })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('HTTP ' + response.status);
                }
                return response.json();
            })
            .then(render)
            .catch(function (error) {
                console.error('[home] 加载配置失败:', error);
                showError('无法加载游戏列表，请确认 configs/games.json 存在且格式正确。');
            });
    }

    function init() {
        if (yearEl) {
            yearEl.textContent = String(new Date().getFullYear());
        }

        if (versionEl && typeof SITE_VERSION !== 'undefined') {
            versionEl.textContent = 'v' + SITE_VERSION;
        }

        retryButton.addEventListener('click', loadConfig);
        loadConfig();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
