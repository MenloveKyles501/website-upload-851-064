(function () {
  function each(selector, callback, root) {
    Array.prototype.forEach.call((root || document).querySelectorAll(selector), callback);
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHeaderSearch() {
    each('.site-search-input', function (input) {
      input.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter') return;
        var query = input.value.trim();
        if (!query) return;
        window.location.href = './categories.html?q=' + encodeURIComponent(query) + '#catalogue';
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) return;
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
    }

    if (prev) prev.addEventListener('click', function () { show(index - 1); start(); });
    if (next) next.addEventListener('click', function () { show(index + 1); start(); });
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupCatalogue() {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    each('.catalogue-section', function (section) {
      var input = section.querySelector('.catalogue-search');
      var grid = section.querySelector('[data-card-grid]');
      var empty = section.querySelector('.search-empty');
      if (!grid) return;

      function cards() {
        return Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
      }

      function filter() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var visible = 0;
        cards().forEach(function (card) {
          var text = (card.getAttribute('data-search') || '').toLowerCase();
          var matched = !query || text.indexOf(query) !== -1;
          card.hidden = !matched;
          if (matched) visible += 1;
        });
        if (empty) empty.hidden = visible !== 0;
      }

      function sortCards(type) {
        var sorted = cards().sort(function (a, b) {
          return Number(b.getAttribute('data-' + type) || 0) - Number(a.getAttribute('data-' + type) || 0);
        });
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      if (input) {
        if (initialQuery) input.value = initialQuery;
        input.addEventListener('input', filter);
        filter();
      }

      each('.sort-button', function (button) {
        button.addEventListener('click', function () {
          sortCards(button.getAttribute('data-sort'));
          filter();
        });
      }, section);
    });
  }

  function setupPlayers() {
    each('[data-player-frame]', function (frame) {
      var video = frame.querySelector('.movie-player');
      var button = frame.querySelector('[data-play-button]');
      var error = frame.querySelector('[data-player-error]');
      var hlsInstance = null;
      if (!video || !button) return;

      function fail() {
        if (error) error.hidden = false;
      }

      function play() {
        var src = video.getAttribute('data-src');
        if (!src) {
          fail();
          return;
        }
        frame.classList.add('is-playing');
        if (window.Hls && window.Hls.isSupported()) {
          if (!hlsInstance) {
            hlsInstance = new window.Hls({ enableWorker: true });
            hlsInstance.loadSource(src);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(fail);
            });
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) fail();
            });
          } else {
            video.play().catch(fail);
          }
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          if (!video.src) video.src = src;
          video.play().catch(fail);
          return;
        }
        fail();
      }

      button.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (video.paused) video.play().catch(fail);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHeaderSearch();
    setupHero();
    setupCatalogue();
    setupPlayers();
  });
})();
