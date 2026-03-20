/*
  File: page.js
  Page: Playoffs
  Section: Accessible accordion — open/close playoff year panels
  Last Updated: 2026-03-08
*/

function init() {
    const accordions = document.querySelectorAll('.accordion-section');
    accordions.forEach((section, i) => {
        const btn = section.querySelector('.accordion-header');
        btn.addEventListener('click', () => {
            if (section.classList.contains('open')) {
                section.classList.remove('open');
                btn.setAttribute('aria-expanded', 'false');
            } else {
                accordions.forEach(s => {
                    s.classList.remove('open');
                    s.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
                });
                section.classList.add('open');
                btn.setAttribute('aria-expanded', 'true');
            }
        });
        // Open first section by default
        if (i === 0) {
            section.classList.add('open');
            btn.setAttribute('aria-expanded', 'true');
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
