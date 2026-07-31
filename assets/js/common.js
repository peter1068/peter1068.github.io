/**
 * 站点公共工具（首页、宣传页共用）
 */
(function (global) {
    'use strict';

    var SAFE_PATH_RE = /^(?!\/)(?!.*\.\.)([a-zA-Z0-9_\-./]+)$/;
    var PLAY_PAGE = './play.html';
    var PROMO_PAGE = './game.html';
    var CONFIG_URL = './configs/games.json';

    function normalizePath(path) {
        return String(path).replace(/\\/g, '/');
    }

    function isSafeRelativePath(path) {
        if (!path || typeof path !== 'string') {
            return false;
        }
        var normalized = normalizePath(path);
        return SAFE_PATH_RE.test(normalized) && !/^https?:/i.test(normalized);
    }

    function getCacheVersion() {
        return typeof SITE_VERSION !== 'undefined' ? SITE_VERSION : String(Date.now());
    }

    function withCacheBust(url) {
        var sep = url.indexOf('?') >= 0 ? '&' : '?';
        return url + sep + 'v=' + encodeURIComponent(getCacheVersion());
    }

    /**
     * 将站内相对路径解析为绝对 URL（避免部分环境下相对路径解析错误）
     * @param {string} path
     * @returns {string}
     */
    function resolveMediaUrl(path) {
        if (!isSafeRelativePath(path)) {
            return '';
        }
        try {
            return new URL(normalizePath(path), window.location.href).href;
        } catch (error) {
            return normalizePath(path);
        }
    }

    /**
     * 从 entry 路径解析游戏目录
     * @param {string} entry
     * @returns {string}
     */
    function getGameDirectory(entry) {
        if (!isSafeRelativePath(entry)) {
            return '';
        }
        var normalized = normalizePath(entry);
        var slash = normalized.lastIndexOf('/');
        if (slash <= 0) {
            return '';
        }
        return normalized.slice(0, slash);
    }

    /**
     * 获取宣传视频路径（默认 <游戏目录>/video.mp4）
     * @param {object} game
     * @returns {string}
     */
    function getVideoPath(game) {
        if (game && game.video && isSafeRelativePath(game.video)) {
            return normalizePath(game.video);
        }
        var dir = getGameDirectory(game && game.entry);
        return dir ? dir + '/video.mp4' : '';
    }

    /**
     * 构建播放器链接
     * @param {object} game
     * @returns {string}
     */
    function buildPlayUrl(game) {
        var entry = normalizePath(game.entry);
        if (game.wrapper === false) {
            return './' + entry;
        }
        return PLAY_PAGE + '?player=' + encodeURIComponent(entry);
    }

    /**
     * 构建宣传页链接
     * @param {object} game
     * @returns {string}
     */
    function buildPromoUrl(game) {
        return PROMO_PAGE + '?id=' + encodeURIComponent(game.id);
    }

    /**
     * 加载游戏配置
     * @returns {Promise<object>}
     */
    function loadGamesConfig() {
        return fetch(withCacheBust(CONFIG_URL), { cache: 'no-cache' })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('HTTP ' + response.status);
                }
                return response.json();
            });
    }

    /**
     * 按 id 查找游戏
     * @param {object} config
     * @param {string} id
     * @returns {object|null}
     */
    function findGameById(config, id) {
        if (!config || !Array.isArray(config.games) || !id) {
            return null;
        }
        for (var i = 0; i < config.games.length; i++) {
            if (config.games[i].id === id && config.games[i].enabled !== false) {
                return config.games[i];
            }
        }
        return null;
    }

    global.SiteCommon = {
        CONFIG_URL: CONFIG_URL,
        normalizePath: normalizePath,
        isSafeRelativePath: isSafeRelativePath,
        getCacheVersion: getCacheVersion,
        withCacheBust: withCacheBust,
        resolveMediaUrl: resolveMediaUrl,
        getGameDirectory: getGameDirectory,
        getVideoPath: getVideoPath,
        buildPlayUrl: buildPlayUrl,
        buildPromoUrl: buildPromoUrl,
        loadGamesConfig: loadGamesConfig,
        findGameById: findGameById
    };
})(window);
