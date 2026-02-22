<script>
/*
  File: page.js
  Page: History
  Section: Timeline scroll-reveal animation using IntersectionObserver
  Last Updated: 2026-02-22
*/

(function () {
    var container = document.querySelector('.timeline-container');
    var items = document.querySelectorAll('.timeline-item');

    if (!container || items.length === 0) { return; }

    // Only enable the hide-then-reveal animation if IntersectionObserver
    // is supported. If not, items stay visible (CSS default — no JS fallback needed).
    if (!('IntersectionObserver' in window)) { return; }

    // Adding this class to the container activates the opacity:0 initial state
    // in CSS. This means items are only hidden AFTER JS confirms it can reveal them.
    container.classList.add('js-timeline-ready');

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // animate once, then stop watching
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -50px 0px' // trigger slightly before item fully enters viewport
    });

    items.forEach(function (item) {
        observer.observe(item);
    });
}());
</script>
