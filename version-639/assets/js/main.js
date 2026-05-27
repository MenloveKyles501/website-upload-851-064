(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
            return;
        }
        document.addEventListener('DOMContentLoaded', callback);
    }

    function setupMobileMenu() {
        const toggle = document.querySelector('[data-menu-toggle]');
        const panel = document.querySelector('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    function setupBackToTop() {
        const button = document.querySelector('[data-back-to-top]');
        if (!button) {
            return;
        }
        window.addEventListener('scroll', function () {
            if (window.scrollY > 360) {
                button.classList.add('show');
            } else {
                button.classList.remove('show');
            }
        });
        button.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    function setupHero() {
        const hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const previous = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let index = 0;
        let timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                restart();
            });
        });
        if (previous) {
            previous.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }
        restart();
    }

    function setupFilters() {
        const panel = document.querySelector('[data-filter-panel]');
        const container = document.querySelector('[data-card-container]');
        if (!panel || !container) {
            return;
        }

        const searchInput = panel.querySelector('[data-filter-search]');
        const typeSelect = panel.querySelector('[data-filter-type]');
        const yearSelect = panel.querySelector('[data-filter-year]');
        const categorySelect = panel.querySelector('[data-filter-category]');
        const sortSelect = panel.querySelector('[data-sort-select]');
        const countLabel = panel.querySelector('[data-result-count]');
        const viewButtons = Array.from(panel.querySelectorAll('[data-view]'));
        const cards = Array.from(container.querySelectorAll('.movie-card'));
        const originalOrder = new Map(cards.map(function (card, cardIndex) {
            return [card, cardIndex];
        }));

        const params = new URLSearchParams(window.location.search);
        const query = params.get('q') || params.get('search') || '';
        if (searchInput && query) {
            searchInput.value = query;
        }

        function includesValue(source, value) {
            return String(source || '').toLowerCase().includes(String(value || '').toLowerCase());
        }

        function getCardText(card) {
            return [
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year,
                card.dataset.category,
                card.textContent
            ].join(' ');
        }

        function filterCards() {
            const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
            const typeValue = typeSelect ? typeSelect.value : 'all';
            const yearValue = yearSelect ? yearSelect.value : 'all';
            const categoryValue = categorySelect ? categorySelect.value : 'all';
            let visible = 0;

            cards.forEach(function (card) {
                const matchedKeyword = !keyword || includesValue(getCardText(card), keyword);
                const matchedType = typeValue === 'all' || includesValue(card.dataset.type, typeValue);
                const matchedYear = yearValue === 'all' || card.dataset.year === yearValue;
                const matchedCategory = categoryValue === 'all' || card.dataset.category === categoryValue;
                const shouldShow = matchedKeyword && matchedType && matchedYear && matchedCategory;
                card.classList.toggle('hidden', !shouldShow);
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (countLabel) {
                countLabel.textContent = '当前显示 ' + visible + ' 部 / 共 ' + cards.length + ' 部';
            }
        }

        function sortCards() {
            const mode = sortSelect ? sortSelect.value : 'default';
            const sorted = cards.slice().sort(function (a, b) {
                if (mode === 'rating') {
                    return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
                }
                if (mode === 'year') {
                    return String(b.dataset.year || '').localeCompare(String(a.dataset.year || ''), 'zh-CN');
                }
                if (mode === 'name') {
                    return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-CN');
                }
                return originalOrder.get(a) - originalOrder.get(b);
            });
            sorted.forEach(function (card) {
                container.appendChild(card);
            });
        }

        function apply() {
            sortCards();
            filterCards();
        }

        [searchInput, typeSelect, yearSelect, categorySelect, sortSelect].forEach(function (control) {
            if (!control) {
                return;
            }
            control.addEventListener('input', apply);
            control.addEventListener('change', apply);
        });

        viewButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                viewButtons.forEach(function (item) {
                    item.classList.remove('active');
                });
                button.classList.add('active');
                container.classList.toggle('list-view', button.dataset.view === 'list');
            });
        });

        apply();
    }

    ready(function () {
        setupMobileMenu();
        setupBackToTop();
        setupHero();
        setupFilters();
    });
}());
