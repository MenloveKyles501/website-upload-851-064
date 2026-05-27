(function () {
    window.setupMoviePlayer = function (sourceUrl) {
        var video = document.querySelector(".movie-video");
        var stage = document.querySelector(".player-stage");
        var cover = document.querySelector(".player-cover");
        var playButton = document.querySelector(".player-play-button");
        var attached = false;
        var hlsInstance = null;

        if (!video || !stage || !sourceUrl) {
            return;
        }

        function attachSource() {
            if (attached) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }

            attached = true;
        }

        function beginPlayback() {
            attachSource();

            if (cover) {
                cover.classList.add("hidden");
            }

            video.controls = true;
            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        stage.addEventListener("click", function (event) {
            if (event.target === video && !video.paused) {
                return;
            }
            beginPlayback();
        });

        if (playButton) {
            playButton.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                beginPlayback();
            });
        }

        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("hidden");
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
}());
