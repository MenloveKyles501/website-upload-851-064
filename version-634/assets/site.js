document.addEventListener('DOMContentLoaded', function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var navMenu = document.querySelector('[data-nav-menu]');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      navMenu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var previous = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(index - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
      });
    }

    window.setInterval(function () {
      showSlide(index + 1);
    }, 5600);
  });

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var input = panel.querySelector('[data-filter-input]');
    var yearSelect = panel.querySelector('[data-year-filter]');
    var genreSelect = panel.querySelector('[data-genre-filter]');
    var list = document.querySelector('[data-card-list]');

    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
      var keyword = normalize(input ? input.value : '');
      var year = normalize(yearSelect ? yearSelect.value : '');
      var genre = normalize(genreSelect ? genreSelect.value : '');

      cards.forEach(function (card) {
        var searchable = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.textContent
        ].join(' '));
        var matchKeyword = !keyword || searchable.indexOf(keyword) !== -1;
        var matchYear = !year || normalize(card.getAttribute('data-year')) === year;
        var matchGenre = !genre || searchable.indexOf(genre) !== -1;
        card.classList.toggle('is-hidden', !(matchKeyword && matchYear && matchGenre));
      });
    }

    [input, yearSelect, genreSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    var params = new URLSearchParams(window.location.search);
    if (input && params.get('q')) {
      input.value = params.get('q');
      applyFilters();
    }
  });

  document.querySelectorAll('[data-player-shell]').forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-play-button]');
    var hlsInstance = null;
    var hasLoaded = false;

    if (!video || !button) {
      return;
    }

    function sourceUrl() {
      var fromData = video.getAttribute('data-src');
      var source = video.querySelector('source');
      return fromData || (source ? source.getAttribute('src') : '');
    }

    function loadVideo() {
      var url = sourceUrl();

      if (!url || hasLoaded) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        hasLoaded = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
        hasLoaded = true;
        return;
      }

      video.src = url;
      hasLoaded = true;
    }

    function playVideo() {
      loadVideo();
      shell.classList.add('is-playing');
      video.play().catch(function () {
        video.setAttribute('controls', 'controls');
      });
    }

    button.addEventListener('click', playVideo);

    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        shell.classList.remove('is-playing');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
});
