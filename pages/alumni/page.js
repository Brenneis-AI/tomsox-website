<script>
/*
  File: page.js
  Page: Alumni
  Section: All page JavaScript
  Last Updated: 2026-02-23
*/

(function () {
    'use strict';

    var carouselInitialized = false;
    var draftInitialized = false;
    var statsInitialized = false;


    /* =========================================
       CAROUSEL
       ========================================= */

    function initCarousel() {
        if (carouselInitialized) return;

        var slides = document.querySelectorAll('.carousel-slide');
        var dots = document.querySelectorAll('.carousel-dots .dot');
        var prevBtn = document.querySelector('.carousel-prev');
        var nextBtn = document.querySelector('.carousel-next');
        var carouselEl = document.querySelector('.alumni-carousel');

        if (!slides || slides.length === 0) return;

        carouselInitialized = true;

        var state = {
            current: 0,
            total: slides.length,
            interval: null,
            paused: false,
            delay: 5500,
            touchStartX: 0
        };

        function goTo(index) {
            slides[state.current].classList.remove('active');
            slides[state.current].setAttribute('aria-hidden', 'true');
            if (dots[state.current]) dots[state.current].classList.remove('active');

            if (index >= state.total) index = 0;
            if (index < 0) index = state.total - 1;
            state.current = index;

            slides[state.current].classList.add('active');
            slides[state.current].removeAttribute('aria-hidden');
            if (dots[state.current]) dots[state.current].classList.add('active');
        }

        function startAuto() {
            if (state.interval || state.paused) return;
            state.interval = setInterval(function () {
                goTo(state.current + 1);
            }, state.delay);
        }

        function stopAuto() {
            clearInterval(state.interval);
            state.interval = null;
        }

        function resetAuto() {
            stopAuto();
            startAuto();
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', function () {
                goTo(state.current - 1);
                resetAuto();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function () {
                goTo(state.current + 1);
                resetAuto();
            });
        }

        for (var i = 0; i < dots.length; i++) {
            (function (idx) {
                dots[idx].addEventListener('click', function () {
                    goTo(idx);
                    resetAuto();
                });
            })(i);
        }

        if (carouselEl) {
            carouselEl.addEventListener('mouseenter', function () {
                state.paused = true;
                stopAuto();
            });

            carouselEl.addEventListener('mouseleave', function () {
                state.paused = false;
                startAuto();
            });

            /* Touch swipe */
            carouselEl.addEventListener('touchstart', function (e) {
                state.touchStartX = e.touches[0].clientX;
                state.paused = true;
                stopAuto();
            }, { passive: true });

            carouselEl.addEventListener('touchend', function (e) {
                var diff = state.touchStartX - e.changedTouches[0].clientX;
                if (Math.abs(diff) > 44) {
                    goTo(diff > 0 ? state.current + 1 : state.current - 1);
                }
                state.paused = false;
                startAuto();
            }, { passive: true });

            /* Keyboard — scoped to carousel focus only */
            carouselEl.setAttribute('tabindex', '0');
            carouselEl.addEventListener('keydown', function (e) {
                if (e.key === 'ArrowLeft') {
                    goTo(state.current - 1);
                    resetAuto();
                } else if (e.key === 'ArrowRight') {
                    goTo(state.current + 1);
                    resetAuto();
                }
            });
        }

        /* Set aria-hidden on non-active slides */
        for (var j = 0; j < slides.length; j++) {
            if (j !== state.current) {
                slides[j].setAttribute('aria-hidden', 'true');
            }
        }

        startAuto();
    }


    /* =========================================
       DRAFT TABLE
       ========================================= */

    function initDraftTable() {
        if (draftInitialized) return;

        var table = document.querySelector('.draft-table');
        if (!table) return;

        draftInitialized = true;

        var allDataRows = table.querySelectorAll('tbody tr:not(.year-group-header)');
        var yearHeaders = table.querySelectorAll('tbody tr.year-group-header');
        var hiddenRows = table.querySelectorAll('tbody tr.draft-hidden');
        var showMoreBtn = document.getElementById('showMoreDraft');
        var showMoreContainer = document.querySelector('.draft-show-more-container');
        var filterBtns = document.querySelectorAll('.draft-filter-btn');

        /* Show More / Show Less */
        if (showMoreBtn && hiddenRows.length > 0) {
            showMoreBtn.addEventListener('click', function () {
                var isExpanded = hiddenRows[0].classList.contains('show');
                for (var i = 0; i < hiddenRows.length; i++) {
                    if (isExpanded) {
                        hiddenRows[i].classList.remove('show');
                    } else {
                        hiddenRows[i].classList.add('show');
                    }
                }
                showMoreBtn.textContent = isExpanded ? 'Show More Draft Picks' : 'Show Less';
            });
        }

        /* Year Filter */
        function filterByYear(year) {
            if (year === 'all') {
                for (var i = 0; i < allDataRows.length; i++) {
                    allDataRows[i].removeAttribute('style');
                }
                for (var k = 0; k < yearHeaders.length; k++) {
                    yearHeaders[k].removeAttribute('style');
                }
                if (showMoreContainer) showMoreContainer.removeAttribute('style');
            } else {
                for (var i = 0; i < yearHeaders.length; i++) {
                    yearHeaders[i].style.display = 'none';
                }
                for (var j = 0; j < allDataRows.length; j++) {
                    var yearCell = allDataRows[j].querySelector('td[data-label="Year"]');
                    if (yearCell && yearCell.textContent.trim() === year) {
                        allDataRows[j].style.display = '';
                    } else {
                        allDataRows[j].style.display = 'none';
                    }
                }
                if (showMoreContainer) showMoreContainer.style.display = 'none';
            }
        }

        if (filterBtns.length > 0) {
            for (var f = 0; f < filterBtns.length; f++) {
                (function (btn) {
                    btn.addEventListener('click', function () {
                        for (var b = 0; b < filterBtns.length; b++) {
                            filterBtns[b].classList.remove('active');
                        }
                        btn.classList.add('active');
                        filterByYear(btn.getAttribute('data-year'));
                    });
                })(filterBtns[f]);
            }
        }
    }


    /* =========================================
       STATS COUNTER
       ========================================= */

    function initStats() {
        if (statsInitialized) return;

        var counters = document.querySelectorAll('.stat-number[data-target]');
        if (!counters || counters.length === 0) return;

        statsInitialized = true;

        function animateCounter(el) {
            var target = parseInt(el.getAttribute('data-target'), 10);
            var suffix = el.getAttribute('data-suffix') || '';
            var duration = 1800;
            var startTime = null;

            function step(timestamp) {
                if (!startTime) startTime = timestamp;
                var progress = Math.min((timestamp - startTime) / duration, 1);
                var eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = Math.round(eased * target) + suffix;
                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    el.textContent = target + suffix;
                }
            }

            requestAnimationFrame(step);
        }

        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function (entries) {
                for (var i = 0; i < entries.length; i++) {
                    if (entries[i].isIntersecting) {
                        animateCounter(entries[i].target);
                        observer.unobserve(entries[i].target);
                    }
                }
            }, { threshold: 0.35 });

            for (var i = 0; i < counters.length; i++) {
                observer.observe(counters[i]);
            }
        } else {
            for (var i = 0; i < counters.length; i++) {
                animateCounter(counters[i]);
            }
        }
    }


    /* =========================================
       INIT
       ========================================= */

    function init() {
        initCarousel();
        initDraftTable();
        initStats();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    /* Single GHL fallback — guards prevent any double-initialization */
    setTimeout(init, 1500);

})();
</script>
