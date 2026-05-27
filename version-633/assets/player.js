(function () {
    function initPlayer(source, poster, title) {
        var video = document.getElementById('movieVideo');
        var start = document.getElementById('playerStart');
        var message = document.getElementById('playerMessage');
        var attached = false;
        var hlsInstance = null;

        if (!video || !source) {
            return;
        }

        if (poster) {
            video.setAttribute('poster', poster);
        }

        if (title) {
            video.setAttribute('aria-label', title);
        }

        function showMessage(text) {
            if (!message) {
                return;
            }
            message.textContent = text;
            message.classList.add('is-show');
        }

        function attachSource() {
            if (attached) {
                return;
            }
            attached = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hlsInstance.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hlsInstance.recoverMediaError();
                        } else {
                            showMessage('视频暂时无法播放');
                        }
                    }
                });
                return;
            }

            video.src = source;
        }

        function begin() {
            attachSource();
            if (start) {
                start.classList.add('is-hidden');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    if (start) {
                        start.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (start) {
            start.addEventListener('click', begin);
        }

        video.addEventListener('play', function () {
            if (start) {
                start.classList.add('is-hidden');
            }
        });

        video.addEventListener('error', function () {
            showMessage('视频暂时无法播放');
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    window.initPlayer = initPlayer;
}());
