<script>
/*
  File: page.js
  Page: Tickets
  Section: Page-level JavaScript
  Last Updated: 2026-02-22
*/

/* Prevent the browser from auto-jumping to a hash anchor on page load.
   Smooth scrolling for hash links is handled by html { scroll-behavior: smooth } in page.css. */
(function () {
    if (window.location.hash) {
        window.scrollTo(0, 0);
    }
}());
</script>
