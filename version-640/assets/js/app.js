(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var mobileToggle = document.querySelector("[data-mobile-toggle]");
        var mobilePanel = document.querySelector("[data-mobile-panel]");

        if (mobileToggle && mobilePanel) {
            mobileToggle.addEventListener("click", function () {
                mobilePanel.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                var keyword = input ? input.value.trim() : "";

                if (!keyword) {
                    event.preventDefault();
                    return;
                }

                event.preventDefault();
                window.location.href = "./search.html?q=" + encodeURIComponent(keyword);
            });
        });

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            showSlide(0);
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        document.querySelectorAll("[data-scroll-dir]").forEach(function (button) {
            button.addEventListener("click", function () {
                var target = document.querySelector(button.getAttribute("data-scroll-target"));
                var direction = button.getAttribute("data-scroll-dir") === "next" ? 1 : -1;

                if (target) {
                    target.scrollBy({
                        left: direction * Math.max(280, Math.floor(target.clientWidth * 0.8)),
                        behavior: "smooth"
                    });
                }
            });
        });

        var libraryInput = document.querySelector("[data-library-search]");
        var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-title]"));
        var activeFilter = "all";

        function normalize(value) {
            return (value || "").toString().toLowerCase();
        }

        function applyFilter() {
            if (!cards.length) {
                return;
            }

            var keyword = normalize(libraryInput ? libraryInput.value.trim() : "");

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-tags")
                ].join(" "));
                var category = card.getAttribute("data-category") || "";
                var keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;
                var filterMatched = activeFilter === "all" || category === activeFilter;
                card.setAttribute("data-hidden", keywordMatched && filterMatched ? "false" : "true");
            });
        }

        if (libraryInput) {
            var query = new URLSearchParams(window.location.search).get("q") || "";
            libraryInput.value = query;
            libraryInput.addEventListener("input", applyFilter);
            applyFilter();
        }

        filterButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                activeFilter = button.getAttribute("data-filter-value") || "all";
                filterButtons.forEach(function (other) {
                    other.classList.toggle("is-active", other === button);
                });
                applyFilter();
            });
        });
    });
}());
