(function () {
    window.initMoviePlayer = function (streamUrl) {
        var video = document.querySelector('[data-player-video]');
        var cover = document.querySelector('[data-player-cover]');
        var started = false;

        function loadHlsLibrary(callback) {
            if (window.Hls) {
                callback();
                return;
            }

            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
            script.onload = callback;
            script.onerror = callback;
            document.head.appendChild(script);
        }

        function begin() {
            if (!video || started) {
                return;
            }

            started = true;

            if (cover) {
                cover.classList.add('hide');
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                video.play().catch(function () {});
                return;
            }

            loadHlsLibrary(function () {
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        lowLatencyMode: true,
                        backBufferLength: 60
                    });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else {
                    video.src = streamUrl;
                    video.play().catch(function () {});
                }
            });
        }

        if (cover) {
            cover.addEventListener('click', begin);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!started) {
                    begin();
                }
            });
        }
    };
})();
