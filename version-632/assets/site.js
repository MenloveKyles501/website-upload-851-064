(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function initMenu() {
    const button = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.mobile-nav');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      const isOpen = menu.classList.toggle('is-open');
      button.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function initHero() {
    const hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.dataset.heroDot || 0));
        play();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        play();
      });
    }

    hero.addEventListener('mouseenter', function () {
      clearInterval(timer);
    });

    hero.addEventListener('mouseleave', play);
    play();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initFilters() {
    const panels = Array.from(document.querySelectorAll('[data-filter]'));
    panels.forEach(function (panel) {
      const textInput = panel.querySelector('[data-filter-text]');
      const yearSelect = panel.querySelector('[data-filter-year]');
      const regionSelect = panel.querySelector('[data-filter-region]');
      const typeSelect = panel.querySelector('[data-filter-type]');
      const cards = Array.from(document.querySelectorAll('.movie-card'));
      const empty = document.querySelector('[data-empty-state]');

      function apply() {
        const q = normalize(textInput && textInput.value);
        const year = normalize(yearSelect && yearSelect.value);
        const region = normalize(regionSelect && regionSelect.value);
        const type = normalize(typeSelect && typeSelect.value);
        let visible = 0;

        cards.forEach(function (card) {
          const haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.year,
            card.dataset.type,
            card.dataset.genre,
            card.dataset.tags
          ].join(' '));
          const matched = (!q || haystack.indexOf(q) !== -1)
            && (!year || normalize(card.dataset.year) === year)
            && (!region || normalize(card.dataset.region) === region)
            && (!type || normalize(card.dataset.type) === type);
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      panel.addEventListener('submit', function (event) {
        event.preventDefault();
        apply();
      });

      panel.addEventListener('reset', function () {
        setTimeout(apply, 0);
      });

      [textInput, yearSelect, regionSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      if (q && textInput) {
        textInput.value = q;
      }
      apply();
    });
  }

  function bindStream(video, streamUrl) {
    if (video.dataset.bound === 'true') {
      return;
    }
    video.dataset.bound = 'true';

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        maxBufferLength: 24,
        enableWorker: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  }

  window.attachMoviePlayer = function (streamUrl) {
    const video = document.getElementById('movie-player');
    const overlay = document.querySelector('.player-overlay');
    if (!video || !overlay || !streamUrl) {
      return;
    }

    function start() {
      bindStream(video, streamUrl);
      overlay.classList.add('is-hidden');
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    overlay.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
