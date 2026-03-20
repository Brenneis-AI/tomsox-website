/*
  File: page.js
  Page: Team Records
  Section: Fade-in trigger for stat cards and feature grid on load
  Last Updated: 2026-03-08
*/

function init() {
    document.querySelectorAll('.fadein').forEach(el => {
        el.style.opacity = 1;
        el.style.transform = 'none';
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
