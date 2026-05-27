import { H as Hls } from './hls-vendor-dru42stk.js';

function setupVideoPlayer(wrapper) {
    const video = wrapper.querySelector('video');
    const overlay = wrapper.querySelector('.play-overlay');
    const status = wrapper.querySelector('[data-player-status]');
    const source = wrapper.dataset.video;

    if (!video || !source) {
        return;
    }

    function setStatus(message) {
        if (status) {
            status.textContent = message;
        }
    }

    function attachSource() {
        if (video.dataset.ready === 'true') {
            return;
        }

        if (Hls && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                video.dataset.ready = 'true';
                setStatus('播放源已就绪');
            });
            hls.on(Hls.Events.ERROR, function (eventName, data) {
                if (data && data.fatal) {
                    setStatus('播放源加载失败，请稍后重试');
                }
            });
            wrapper._hls = hls;
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.dataset.ready = 'true';
            setStatus('播放源已就绪');
            return;
        }

        setStatus('当前浏览器不支持 HLS 播放');
    }

    async function playVideo() {
        attachSource();
        try {
            await video.play();
            wrapper.classList.add('playing');
            setStatus('正在播放');
        } catch (error) {
            setStatus('点击播放器控件后继续播放');
        }
    }

    attachSource();

    if (overlay) {
        overlay.addEventListener('click', playVideo);
    }
    video.addEventListener('play', function () {
        wrapper.classList.add('playing');
        setStatus('正在播放');
    });
    video.addEventListener('pause', function () {
        wrapper.classList.remove('playing');
        setStatus('已暂停');
    });
    video.addEventListener('ended', function () {
        wrapper.classList.remove('playing');
        setStatus('播放结束');
    });
}

document.querySelectorAll('[data-video]').forEach(setupVideoPlayer);
