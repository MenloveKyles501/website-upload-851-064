(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileNav() {
    var toggle = qs('[data-mobile-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) return;
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function textOf(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initFilters() {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    qsa('[data-search-field]').forEach(function (input) {
      if (query && !input.value) input.value = query;
    });

    qsa('[data-filter-scope]').forEach(function (scope) {
      var textInput = qs('[data-filter-text]', scope);
      var regionSelect = qs('[data-filter-region]', scope);
      var typeSelect = qs('[data-filter-type]', scope);
      var yearSelect = qs('[data-filter-year]', scope);
      var reset = qs('[data-filter-reset]', scope);
      var cards = qsa('[data-movie-card]', scope);

      function apply() {
        var keyword = textOf(textInput && textInput.value);
        var region = regionSelect ? regionSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';
        var year = yearSelect ? yearSelect.value : '';
        cards.forEach(function (card) {
          var haystack = textOf([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.textContent
          ].join(' '));
          var matched = true;
          if (keyword && haystack.indexOf(keyword) === -1) matched = false;
          if (region && card.getAttribute('data-region') !== region) matched = false;
          if (type && card.getAttribute('data-type') !== type) matched = false;
          if (year && card.getAttribute('data-year') !== year) matched = false;
          card.hidden = !matched;
        });
      }

      [textInput, regionSelect, typeSelect, yearSelect].forEach(function (item) {
        if (item) item.addEventListener('input', apply);
        if (item) item.addEventListener('change', apply);
      });

      if (reset) {
        reset.addEventListener('click', function () {
          if (textInput) textInput.value = '';
          if (regionSelect) regionSelect.value = '';
          if (typeSelect) typeSelect.value = '';
          if (yearSelect) yearSelect.value = '';
          apply();
        });
      }

      apply();
    });
  }

  var hlsInstances = new WeakMap();

  function playVideo(button) {
    var id = button.getAttribute('data-player');
    var source = button.getAttribute('data-stream');
    var video = document.getElementById(id);
    if (!video || !source) return;
    button.classList.add('is-hidden');
    var restore = function () {
      button.classList.remove('is-hidden');
    };

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (video.src !== source) video.src = source;
      video.play().catch(restore);
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = hlsInstances.get(video);
      if (!hls) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.attachMedia(video);
        hlsInstances.set(video, hls);
      }
      hls.loadSource(source);
      video.play().catch(function () {
        video.addEventListener('canplay', function onceReady() {
          video.removeEventListener('canplay', onceReady);
          video.play().catch(restore);
        });
      });
      return;
    }

    video.src = source;
    video.play().catch(restore);
  }

  function initPlayers() {
    document.addEventListener('click', function (event) {
      var button = event.target.closest('[data-player][data-stream]');
      if (button) {
        playVideo(button);
        return;
      }
      var stage = event.target.closest('[data-video-stage]');
      if (!stage || event.target.closest('video')) return;
      var stageButton = qs('[data-player][data-stream]', stage);
      if (stageButton && !stageButton.classList.contains('is-hidden')) playVideo(stageButton);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initHero();
    initFilters();
    initPlayers();
  });
})();
