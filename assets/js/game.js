(function () {
    'use strict';

    var common = window.SiteCommon;
    if (!common) {
        console.error('[game] SiteCommon 未加载');
        return;
    }

    var loadingEl;
    var errorEl;
    var errorMessageEl;
    var promoMainEl;
    var promoBgEl;
    var promoVideoEl;
    var promoPosterEl;
    var posterImgEl;
    var gameTitleEl;
    var gameDescEl;
    var playBtnEl;
    var versionEl;

    function showLoading() {
        loadingEl.classList.remove('status--hidden');
        errorEl.classList.add('status--hidden');
        promoMainEl.classList.add('status--hidden');
    }

    function showError(message) {
        loadingEl.classList.add('status--hidden');
        errorEl.classList.remove('status--hidden');
        promoMainEl.classList.add('status--hidden');
        errorMessageEl.textContent = message;
    }

    function showContent() {
        loadingEl.classList.add('status--hidden');
        errorEl.classList.add('status--hidden');
        promoMainEl.classList.remove('status--hidden');
    }

    function getGameIdFromUrl() {
        var params = new URLSearchParams(window.location.search);
        return (params.get('id') || '').trim();
    }

    /**
     * 设置封面背景与海报
     * @param {string} cover
     * @param {string} title
     */
    function setupCover(cover, title) {
        if (!common.isSafeRelativePath(cover)) {
            return;
        }
        var coverUrl = common.resolveMediaUrl(cover);
        promoBgEl.style.backgroundImage = 'url("' + coverUrl + '")';
        posterImgEl.src = coverUrl;
        posterImgEl.alt = title + ' 封面';
    }

    /**
     * 尝试加载宣传视频，失败则展示封面海报
     * @param {string} videoPath
     * @param {string} coverPath
     */
    function setPosterVisible(visible) {
        if (visible) {
            promoPosterEl.classList.remove('is-hidden');
            promoPosterEl.hidden = false;
        } else {
            promoPosterEl.classList.add('is-hidden');
            promoPosterEl.hidden = true;
        }
    }

    function setupVideo(videoPath, coverPath) {
        promoVideoEl.classList.remove('is-hidden');
        setPosterVisible(false);
        promoVideoEl.pause();

        promoVideoEl.onerror = null;
        promoVideoEl.onloadeddata = null;
        promoVideoEl.onloadedmetadata = null;
        promoVideoEl.removeAttribute('src');
        promoVideoEl.removeAttribute('poster');

        if (!common.isSafeRelativePath(videoPath)) {
            if (common.isSafeRelativePath(coverPath)) {
                posterImgEl.src = common.resolveMediaUrl(coverPath);
            }
            promoVideoEl.classList.add('is-hidden');
            setPosterVisible(true);
            return;
        }

        var videoUrl = common.resolveMediaUrl(videoPath);
        var coverUrl = common.isSafeRelativePath(coverPath)
            ? common.resolveMediaUrl(coverPath)
            : '';
        var isReady = false;

        function showPoster() {
            if (isReady) {
                return;
            }
            promoVideoEl.pause();
            promoVideoEl.removeAttribute('src');
            promoVideoEl.onerror = null;
            promoVideoEl.onloadeddata = null;
            promoVideoEl.onloadedmetadata = null;
            if (coverUrl) {
                posterImgEl.src = coverUrl;
            }
            promoVideoEl.classList.add('is-hidden');
            setPosterVisible(true);
        }

        function markVideoReady() {
            if (isReady) {
                return;
            }
            isReady = true;
            promoVideoEl.removeAttribute('poster');
            promoVideoEl.classList.remove('is-hidden');
            setPosterVisible(false);

            // 显示视频首帧，避免播放器一直停留在封面 poster 上
            if (promoVideoEl.readyState >= 1) {
                try {
                    promoVideoEl.currentTime = 0.01;
                } catch (error) {
                    // 忽略 seek 失败
                }
            }
        }

        promoVideoEl.onerror = function () {
            if (!promoVideoEl.currentSrc) {
                return;
            }
            console.warn('[game] 宣传视频加载失败:', videoUrl);
            showPoster();
        };

        promoVideoEl.onloadedmetadata = markVideoReady;
        promoVideoEl.onloadeddata = markVideoReady;

        if (coverUrl) {
            promoVideoEl.poster = coverUrl;
        }

        promoVideoEl.src = videoUrl;
    }

    /**
     * 渲染宣传页
     * @param {object} game
     */
    function render(game) {
        document.title = game.title + ' — 宣传视频';

        gameTitleEl.textContent = game.title;
        gameDescEl.textContent = game.description || '进入互动世界，开启你的故事旅程。';
        playBtnEl.href = common.buildPlayUrl(game);
        playBtnEl.setAttribute('aria-label', '开始游戏：' + game.title);

        setupCover(game.cover, game.title);
        setupVideo(common.getVideoPath(game), game.cover);
        showContent();
    }

    function loadGame() {
        var gameId = getGameIdFromUrl();
        if (!gameId) {
            showError('未指定游戏，请从首页选择游戏进入。');
            return;
        }

        showLoading();

        common.loadGamesConfig()
            .then(function (config) {
                var game = common.findGameById(config, gameId);
                if (!game) {
                    showError('未找到该游戏，可能已下架或链接无效。');
                    return;
                }
                if (!game.title || !common.isSafeRelativePath(game.entry) || !common.isSafeRelativePath(game.cover)) {
                    showError('游戏配置不完整，请检查 configs/games.json。');
                    return;
                }
                render(game);
            })
            .catch(function (error) {
                console.error('[game] 加载失败:', error);
                showError('无法加载游戏信息，请稍后重试。');
            });
    }

    function bindDom() {
        loadingEl = document.getElementById('loading');
        errorEl = document.getElementById('error');
        errorMessageEl = document.getElementById('errorMessage');
        promoMainEl = document.getElementById('promoMain');
        promoBgEl = document.getElementById('promoBg');
        promoVideoEl = document.getElementById('promoVideo');
        promoPosterEl = document.getElementById('promoPoster');
        posterImgEl = document.getElementById('posterImg');
        gameTitleEl = document.getElementById('gameTitle');
        gameDescEl = document.getElementById('gameDesc');
        playBtnEl = document.getElementById('playBtn');
        versionEl = document.getElementById('siteVersion');
    }

    function init() {
        bindDom();

        if (!promoMainEl || !playBtnEl) {
            console.error('[game] 页面 DOM 未就绪');
            return;
        }

        if (versionEl && typeof SITE_VERSION !== 'undefined') {
            versionEl.textContent = 'v' + SITE_VERSION;
        }

        loadGame();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
