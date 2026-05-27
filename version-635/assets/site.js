(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var button = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var opened = panel.classList.toggle('open');
      document.body.classList.toggle('menu-open', opened);
      button.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
        dot.setAttribute('aria-current', i === index ? 'true' : 'false');
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var blocks = qsa('[data-filter-block]');
    blocks.forEach(function (block) {
      var input = qs('[data-search-input]', block);
      var category = qs('[data-category-filter]', block);
      var type = qs('[data-type-filter]', block);
      var year = qs('[data-year-filter]', block);
      var cards = qsa('[data-movie-card]', block);
      var result = qs('[data-result-note]', block);
      var empty = qs('[data-no-results]', block);

      function normalize(value) {
        return (value || '').toString().toLowerCase().trim();
      }

      function apply() {
        var keyword = normalize(input && input.value);
        var categoryValue = normalize(category && category.value);
        var typeValue = normalize(type && type.value);
        var yearValue = normalize(year && year.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute('data-search-text'));
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchCategory = !categoryValue || normalize(card.getAttribute('data-category')) === categoryValue;
          var matchType = !typeValue || normalize(card.getAttribute('data-type')) === typeValue;
          var matchYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
          var show = matchKeyword && matchCategory && matchType && matchYear;
          card.style.display = show ? '' : 'none';
          if (show) {
            visible += 1;
          }
        });

        if (result) {
          result.textContent = '当前显示 ' + visible + ' / ' + cards.length + ' 部影片';
        }
        if (empty) {
          empty.style.display = visible === 0 ? 'block' : 'none';
        }
      }

      [input, category, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function setupPlayer() {
    var video = qs('[data-hls-player]');
    if (!video) {
      return;
    }
    var button = qs('[data-play-button]');
    var message = qs('[data-player-message]');
    var wrap = qs('[data-player-wrap]');
    var source = video.getAttribute('data-src');
    var hlsInstance = null;
    var initialized = false;

    function setMessage(text) {
      if (message) {
        message.textContent = text;
      }
    }

    function initialize() {
      if (initialized || !source) {
        return Promise.resolve();
      }
      initialized = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setMessage('播放源已加载，点击播放器可控制播放进度。');
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage('当前播放源暂时无法加载，可刷新页面或稍后重试。');
          }
        });
        return Promise.resolve();
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setMessage('正在使用浏览器原生 HLS 播放能力。');
        return Promise.resolve();
      }

      video.src = source;
      setMessage('浏览器不支持 HLS.js 时，将尝试直接打开播放源。');
      return Promise.resolve();
    }

    function play() {
      initialize().then(function () {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            setMessage('浏览器阻止了自动播放，请再次点击播放按钮。');
          });
        }
      });
    }

    if (button) {
      button.addEventListener('click', play);
    }
    video.addEventListener('play', function () {
      if (wrap) {
        wrap.classList.add('playing');
      }
    });
    video.addEventListener('pause', function () {
      if (wrap) {
        wrap.classList.remove('playing');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
    setupPlayer();
  });
}());
