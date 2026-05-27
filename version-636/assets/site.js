document.addEventListener("DOMContentLoaded", function () {
  setupMobileNavigation();
  setupHeroCarousel();
  setupFilters();
  setupHlsPlayer();
});

function setupMobileNavigation() {
  var toggle = document.querySelector(".mobile-toggle");
  var panel = document.querySelector(".mobile-panel");

  if (!toggle || !panel) {
    return;
  }

  toggle.addEventListener("click", function () {
    var isOpen = !panel.hasAttribute("hidden");

    if (isOpen) {
      panel.setAttribute("hidden", "");
      toggle.setAttribute("aria-expanded", "false");
    } else {
      panel.removeAttribute("hidden");
      toggle.setAttribute("aria-expanded", "true");
    }
  });
}

function setupHeroCarousel() {
  var hero = document.querySelector("[data-hero]");

  if (!hero) {
    return;
  }

  var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
  var prev = hero.querySelector("[data-hero-prev]");
  var next = hero.querySelector("[data-hero-next]");
  var current = 0;
  var timer = null;

  function show(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(function () {
      show(current + 1);
    }, 5000);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      show(Number(dot.getAttribute("data-hero-dot")) || 0);
      start();
    });
  });

  if (prev) {
    prev.addEventListener("click", function () {
      show(current - 1);
      start();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      show(current + 1);
      start();
    });
  }

  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);
  show(0);
  start();
}

function setupFilters() {
  var filterBar = document.querySelector("[data-filter-bar]");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".catalog-card"));

  if (!filterBar || cards.length === 0) {
    return;
  }

  var searchInput = document.getElementById("categorySearch");
  var regionFilter = document.getElementById("regionFilter");
  var typeFilter = document.getElementById("typeFilter");
  var yearFilter = document.getElementById("yearFilter");
  var resultCount = document.querySelector("[data-result-count]");
  var params = new URLSearchParams(window.location.search);
  var query = params.get("q");

  if (query && searchInput) {
    searchInput.value = query;
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function runFilter() {
    var keyword = normalize(searchInput ? searchInput.value : "");
    var region = normalize(regionFilter ? regionFilter.value : "");
    var type = normalize(typeFilter ? typeFilter.value : "");
    var year = normalize(yearFilter ? yearFilter.value : "");
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-year"),
        card.getAttribute("data-tags")
      ].join(" "));

      var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchesRegion = !region || normalize(card.getAttribute("data-region")) === region;
      var matchesType = !type || normalize(card.getAttribute("data-type")) === type;
      var matchesYear = !year || normalize(card.getAttribute("data-year")) === year;
      var shouldShow = matchesKeyword && matchesRegion && matchesType && matchesYear;

      card.style.display = shouldShow ? "" : "none";

      if (shouldShow) {
        visible += 1;
      }
    });

    if (resultCount) {
      resultCount.textContent = visible + " 部";
    }
  }

  [searchInput, regionFilter, typeFilter, yearFilter].forEach(function (control) {
    if (control) {
      control.addEventListener("input", runFilter);
      control.addEventListener("change", runFilter);
    }
  });

  runFilter();
}

function setupHlsPlayer() {
  var video = document.getElementById("moviePlayer");
  var box = document.querySelector("[data-player]");
  var startButton = document.querySelector("[data-player-start]");

  if (!video) {
    return;
  }

  var source = video.getAttribute("data-src");

  if (!source) {
    return;
  }

  if (window.Hls && window.Hls.isSupported()) {
    var hls = new window.Hls({
      enableWorker: true,
      lowLatencyMode: true
    });

    hls.loadSource(source);
    hls.attachMedia(video);

    hls.on(window.Hls.Events.ERROR, function (eventName, data) {
      if (!data || !data.fatal) {
        return;
      }

      if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
        hls.startLoad();
      } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
        hls.recoverMediaError();
      } else {
        hls.destroy();
      }
    });
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = source;
  } else {
    video.src = source;
  }

  function playVideo() {
    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        video.controls = true;
      });
    }
  }

  if (startButton) {
    startButton.addEventListener("click", playVideo);
  }

  video.addEventListener("play", function () {
    if (box) {
      box.classList.add("is-playing");
    }
  });

  video.addEventListener("pause", function () {
    if (box) {
      box.classList.remove("is-playing");
    }
  });
}
