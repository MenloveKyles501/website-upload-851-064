(function () {
    var header = document.querySelector('[data-header]');
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-nav-panel]');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    if (header) {
        var onScroll = function () {
            if (window.scrollY > 8) {
                header.classList.add('is-scrolled');
            } else {
                header.classList.remove('is-scrolled');
            }
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        if (!slides.length) {
            return;
        }
        var active = Math.max(0, slides.findIndex(function (slide) {
            return slide.classList.contains('is-active');
        }));
        var show = function (index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        };
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
            });
        });
        window.setInterval(function () {
            show(active + 1);
        }, 5200);
    });

    document.querySelectorAll('[data-filter-root]').forEach(function (root) {
        var input = root.querySelector('[data-search-input]');
        var selects = Array.prototype.slice.call(root.querySelectorAll('[data-filter-select]'));
        var scope = root.parentElement || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        var empty = scope.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var queryParam = params.get('q');

        if (input && queryParam) {
            input.value = queryParam;
        }

        var normalize = function (value) {
            return String(value || '').trim().toLowerCase();
        };

        var apply = function () {
            var query = normalize(input ? input.value : '');
            var visible = 0;
            var filters = {};

            selects.forEach(function (select) {
                filters[select.getAttribute('data-filter-select')] = normalize(select.value);
            });

            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-search'));
                var match = !query || haystack.indexOf(query) !== -1;

                Object.keys(filters).forEach(function (key) {
                    var expected = filters[key];
                    if (!expected) {
                        return;
                    }
                    var actual = normalize(card.getAttribute('data-' + key));
                    if (actual !== expected) {
                        match = false;
                    }
                });

                card.classList.toggle('is-hidden', !match);
                if (match) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-show', visible === 0);
            }
        };

        if (input) {
            input.addEventListener('input', apply);
        }

        selects.forEach(function (select) {
            select.addEventListener('change', apply);
        });

        apply();
    });
}());
