(function () {
    var toggle = document.querySelector('.menu-toggle');
    var mobile = document.querySelector('.mobile-menu');

    if (toggle && mobile) {
        toggle.addEventListener('click', function () {
            var open = mobile.classList.toggle('open');
            toggle.setAttribute('aria-expanded', String(open));
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var heroTitle = document.querySelector('[data-hero-title]');
    var heroLine = document.querySelector('[data-hero-line]');
    var heroMeta = document.querySelector('[data-hero-meta]');
    var heroLink = document.querySelector('[data-hero-link]');
    var heroPanelImage = document.querySelector('[data-hero-image]');
    var heroData = [];

    slides.forEach(function (slide) {
        heroData.push({
            title: slide.getAttribute('data-title') || '',
            line: slide.getAttribute('data-line') || '',
            meta: slide.getAttribute('data-meta') || '',
            href: slide.getAttribute('data-href') || './all.html',
            image: slide.getAttribute('data-image') || ''
        });
    });

    function setHero(index) {
        if (!slides.length) {
            return;
        }

        slides.forEach(function (slide, current) {
            slide.classList.toggle('active', current === index);
        });

        dots.forEach(function (dot, current) {
            dot.classList.toggle('active', current === index);
        });

        var data = heroData[index];

        if (data) {
            if (heroTitle) {
                heroTitle.textContent = data.title;
            }
            if (heroLine) {
                heroLine.textContent = data.line;
            }
            if (heroMeta) {
                heroMeta.textContent = data.meta;
            }
            if (heroLink) {
                heroLink.setAttribute('href', data.href);
            }
            if (heroPanelImage) {
                heroPanelImage.setAttribute('src', data.image);
                heroPanelImage.setAttribute('alt', data.title);
            }
        }
    }

    if (slides.length) {
        var active = 0;
        setHero(active);

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                active = index;
                setHero(active);
            });
        });

        window.setInterval(function () {
            active = (active + 1) % slides.length;
            setHero(active);
        }, 5200);
    }

    var heroSearch = document.querySelector('[data-hero-search]');

    if (heroSearch) {
        heroSearch.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = heroSearch.querySelector('input');
            var keyword = input ? input.value.trim() : '';
            var target = './search.html';

            if (keyword) {
                target += '?q=' + encodeURIComponent(keyword);
            }

            window.location.href = target;
        });
    }

    var searchInput = document.querySelector('[data-search-input]');
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
    var movieCards = Array.prototype.slice.call(document.querySelectorAll('.js-movie-list .movie-card'));
    var emptyState = document.querySelector('[data-empty-state]');

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function paramsKeyword() {
        try {
            return new URLSearchParams(window.location.search).get('q') || '';
        } catch (error) {
            return '';
        }
    }

    function applySearch() {
        if (!movieCards.length) {
            return;
        }

        var keyword = normalize(searchInput ? searchInput.value : '');
        var activeFilter = '';
        var visible = 0;

        filterButtons.forEach(function (button) {
            if (button.classList.contains('active')) {
                activeFilter = normalize(button.getAttribute('data-filter-value'));
            }
        });

        movieCards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year'),
                card.getAttribute('data-type'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags')
            ].join(' '));

            var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
            var filterMatch = !activeFilter || haystack.indexOf(activeFilter) !== -1;
            var show = keywordMatch && filterMatch;

            card.style.display = show ? '' : 'none';

            if (show) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.hidden = visible !== 0;
        }
    }

    if (searchInput && movieCards.length) {
        var keyword = paramsKeyword();

        if (keyword) {
            searchInput.value = keyword;
        }

        searchInput.addEventListener('input', applySearch);
    }

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            filterButtons.forEach(function (item) {
                item.classList.remove('active');
            });
            button.classList.add('active');
            applySearch();
        });
    });

    applySearch();
})();
